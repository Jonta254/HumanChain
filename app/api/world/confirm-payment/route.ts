import { NextRequest } from "next/server";
import type { PayResult } from "@worldcoin/minikit-js/commands";
import { Tokens, tokenToDecimals } from "@worldcoin/minikit-js/commands";
import {
  isHumanChainPaymentFeature,
  isHumanChainPaymentToken,
  isValidHumanChainPaymentAmount,
  normalizePaymentFeature,
  normalizePaymentToken,
} from "@/lib/worldPayments";
import {
  isRateLimitedKV,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";
import { getHumanChainTreasury, getWorldAppId, getWorldDevPortalApiKey } from "@/lib/worldConfig";
import { kvGet, kvSetNx, kvSAdd } from "@/lib/kv";
import { createErrorResponse, createSuccessResponse, getClientIp, ErrorCode } from "@/lib/api/responses";
import { logger } from "@/lib/api/logging";

const TXN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const route = "POST /api/world/confirm-payment";

  if (await isRateLimitedKV(req, "confirm-payment", 20)) {
    logger.warn("Rate limit exceeded for payment confirmation", { route, ip: clientIp });
    return rateLimitResponse();
  }

  const body = await readJsonBody<{
    payload?: PayResult;
    reference?: string;
    feature?: string;
    amount?: number;
    token?: string;
  }>(req);

  if (!body) {
    logger.warn("Invalid JSON body for payment confirmation", { route, ip: clientIp });
    return createErrorResponse(ErrorCode.INVALID_INPUT, "Invalid JSON body.", { status: 400 });
  }

  const { payload, reference, feature, amount } = body;

  // Validate transaction ID
  if (!payload?.transactionId) {
    logger.warn("Missing transaction ID", { route, ip: clientIp });
    return createErrorResponse(ErrorCode.MISSING_FIELD, "Transaction ID is required.", { status: 400 });
  }

  // Validate reference format and length
  if (!reference || reference.length === 0 || reference.length > 36) {
    logger.warn("Invalid reference format", { route, ip: clientIp, data: { reference } });
    return createErrorResponse(ErrorCode.INVALID_INPUT, "Reference must be 1-36 characters.", { status: 400 });
  }

  // Validate reference matches payload
  if (payload.reference !== reference) {
    logger.warn("Reference mismatch", { route, ip: clientIp, data: { payloadRef: payload.reference, providedRef: reference } });
    return createErrorResponse(ErrorCode.INVALID_INPUT, "Reference does not match payload.", { status: 400 });
  }

  // Validate and normalize feature
  const normalizedFeature = normalizePaymentFeature(feature ?? "");
  if (!normalizedFeature || !isHumanChainPaymentFeature(normalizedFeature)) {
    logger.warn("Invalid payment feature", { route, ip: clientIp, data: { feature } });
    return createErrorResponse(ErrorCode.INVALID_PAYMENT, "Invalid payment feature.", { status: 400 });
  }

  // Validate and normalize token
  const normalizedToken = normalizePaymentToken(body.token);
  if (!normalizedToken || !isHumanChainPaymentToken(normalizedToken)) {
    logger.warn("Invalid payment token", { route, ip: clientIp, data: { token: body.token } });
    return createErrorResponse(ErrorCode.INVALID_PAYMENT, "Invalid payment token.", { status: 400 });
  }

  // Validate amount
  if (!amount || !isValidHumanChainPaymentAmount(normalizedFeature, amount)) {
    logger.warn("Invalid payment amount", { route, ip: clientIp, data: { feature: normalizedFeature, amount } });
    return createErrorResponse(ErrorCode.INVALID_PAYMENT, `Invalid payment amount for feature "${normalizedFeature}".`, { status: 400 });
  }

  // Validate reference was issued by payment-reference endpoint
  const storedRef = await kvGet(`hc:ref:${reference}`);
  if (!storedRef) {
    logger.warn("Payment reference not found or expired", { route, ip: clientIp, data: { reference } });
    return createErrorResponse(ErrorCode.INVALID_INPUT, "Payment reference not found or expired.", { status: 400, retryable: true });
  }

  // Check configuration
  const appId = getWorldAppId();
  const devPortalApiKey = getWorldDevPortalApiKey();

  if (!appId || !devPortalApiKey) {
    logger.error("Payment confirmation setup incomplete", { route, ip: clientIp });
    return createErrorResponse(
      ErrorCode.SETUP_INCOMPLETE,
      "Payment confirmation is being finalized. No charge is recorded until World confirms it.",
      { status: 503 }
    );
  }

  let response: Response;
  let transaction: unknown;

  try {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), 10_000);
    response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transactionId}?app_id=${appId}&type=payment`,
      {
        headers: { Authorization: `Bearer ${devPortalApiKey}` },
        signal: controller.signal,
      },
    );
    clearTimeout(timerId);
    transaction = await response.json();
  } catch (error) {
    logger.warn("World payment lookup failed", { route, ip: clientIp, error });
    return createErrorResponse(ErrorCode.EXTERNAL_SERVICE_ERROR, "World payment lookup is temporarily unavailable.", { status: 502, retryable: true });
  }

  // 4xx from World means bad credentials or malformed request — hard fail
  if (response.status >= 400 && response.status < 500) {
    logger.warn("World API client error", { route, ip: clientIp, data: { status: response.status } });
    return createErrorResponse(ErrorCode.EXTERNAL_SERVICE_ERROR, "World payment lookup failed.", { status: 502 });
  }

  // 5xx or other error — return retryable error
  if (!response.ok) {
    logger.warn("World API server error", { route, ip: clientIp, data: { status: response.status } });
    return createErrorResponse(ErrorCode.EXTERNAL_SERVICE_ERROR, "World payment lookup temporarily unavailable.", { status: 502, retryable: true });
  }

  const transactionRecord = transaction as Record<string, unknown>;
  const isMined =
    transactionRecord.transaction_status === "mined" ||
    transactionRecord.status === "mined" ||
    transactionRecord.transaction_status === "confirmed" ||
    transactionRecord.status === "confirmed" ||
    transactionRecord.transaction_status === "success" ||
    transactionRecord.status === "success" ||
    transactionRecord.transaction_status === "completed" ||
    transactionRecord.status === "completed";

  // Transaction not yet mined — return retryable error
  if (!isMined) {
    logger.info("Transaction pending confirmation", { route, ip: clientIp, data: { transactionId: payload.transactionId } });
    return createErrorResponse(ErrorCode.EXTERNAL_SERVICE_ERROR, "Transaction pending confirmation. Please try again.", { status: 202, retryable: true });
  }

  // Atomic idempotency: SET NX ensures only one request wins even under concurrent calls
  const txId = payload.transactionId;
  const isNew = await kvSetNx(`hc:txn:${txId}`, "1", TXN_TTL_SECONDS);
  if (!isNew) {
    logger.info("Payment already confirmed (duplicate request)", { route, ip: clientIp, data: { reference } });
    return createSuccessResponse({ ok: true, reference, feature: normalizedFeature, amount, token: normalizedToken });
  }

  const treasury = getHumanChainTreasury().toLowerCase();

  // World may return token_amount in various denominations depending on chain + SDK version
  const expectedTokenAmounts = new Set([
    tokenToDecimals(amount, Tokens.WLD).toString(),          // 18-decimal
    Math.round(amount * 1_000_000).toString(),               // 6-decimal
    Math.round(amount * 1_000).toString(),                   // 3-decimal
    Math.round(amount * 100).toString(),                     // 2-decimal
    amount.toString(),                                       // display
    (amount * 1e18).toString(),                              // scientific
  ]);

  const transactionReference =
    typeof transactionRecord.reference === "string" ? transactionRecord.reference : "";
  const transactionAppId =
    typeof transactionRecord.app_id === "string" ? transactionRecord.app_id : "";
  const transactionToken =
    typeof transactionRecord.token === "string" ? transactionRecord.token.toUpperCase() : "";
  const transactionTokenAmount =
    typeof transactionRecord.token_amount === "string" ? transactionRecord.token_amount : "";
  const transactionSender =
    typeof transactionRecord.from === "string" ? transactionRecord.from.toLowerCase() : "";
  const payloadSender = typeof payload.from === "string" ? payload.from.toLowerCase() : "";
  const transactionRecipients = [
    transactionRecord.to,
    transactionRecord.recipient,
    transactionRecord.to_address,
    transactionRecord.recipient_address,
  ]
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.toLowerCase());

  // Reference mismatch only if field is present and non-empty
  if (transactionReference && transactionReference !== reference) {
    logger.warn("Transaction reference mismatch", { route, ip: clientIp, data: { expected: reference, got: transactionReference } });
    return createErrorResponse(ErrorCode.INVALID_PAYMENT, "World payment reference did not match HumanChain reference.", { status: 400 });
  }

  if (transactionAppId && transactionAppId !== appId) {
    logger.warn("Transaction app ID mismatch", { route, ip: clientIp, data: { expected: appId, got: transactionAppId } });
    return createErrorResponse(ErrorCode.INVALID_PAYMENT, "World payment app ID did not match HumanChain app ID.", { status: 400 });
  }

  // Soft-check token symbol
  if (transactionToken && transactionToken !== normalizedToken) {
    logger.info("Token symbol mismatch (allowing)", { route, ip: clientIp, data: { expected: normalizedToken, got: transactionToken } });
  }

  // Soft-check amount
  if (transactionTokenAmount && !expectedTokenAmounts.has(transactionTokenAmount)) {
    logger.info("Token amount mismatch (allowing)", { route, ip: clientIp, data: { expected: [...expectedTokenAmounts], got: transactionTokenAmount } });
  }

  // Soft-check sender
  if (payloadSender && transactionSender && transactionSender !== payloadSender) {
    logger.info("Sender mismatch (allowing)", { route, ip: clientIp, data: { payloadSender, transactionSender } });
  }

  // Check recipient
  const recipientMismatch =
    transactionRecipients.length > 0 &&
    !transactionRecipients.includes(treasury) &&
    !transactionRecipients.some((r) => r.replace(/^0x/, "") === treasury.replace(/^0x/, ""));

  if (recipientMismatch) {
    logger.info("Recipient mismatch (allowing)", { route, ip: clientIp, data: { treasury, transactionRecipients } });
  }

  // Store confirmation
  await kvSAdd("hc:confirmations", `${payload.transactionId}:${reference}`, TXN_TTL_SECONDS);

  logger.info("Payment confirmed successfully", { route, ip: clientIp, data: { reference, feature: normalizedFeature } });
  return createSuccessResponse({ ok: true, reference, feature: normalizedFeature, amount, token: normalizedToken, treasury });
}
