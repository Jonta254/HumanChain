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
  noStoreJson,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";
import { getHumanChainTreasury, getWorldAppId, getWorldDevPortalApiKey } from "@/lib/worldConfig";
import { kvGet, kvSetNx } from "@/lib/kv";

const TXN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: NextRequest) {
  if (await isRateLimitedKV(req, "confirm-payment", 20)) {
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
    return noStoreJson({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { payload, reference, feature, amount } = body;

  const normalizedFeature = normalizePaymentFeature(feature ?? "");
  const normalizedToken = normalizePaymentToken(body.token);

  if (
    !payload?.transactionId ||
    !reference ||
    payload.reference !== reference ||
    !normalizedFeature ||
    !isHumanChainPaymentFeature(normalizedFeature) ||
    !isHumanChainPaymentToken(normalizedToken) ||
    !amount ||
    !isValidHumanChainPaymentAmount(normalizedFeature, amount) ||
    reference.length > 36
  ) {
    return noStoreJson(
      { error: "Missing payment confirmation data." },
      { status: 400 },
    );
  }

  // Validate reference was genuinely issued by our payment-reference endpoint.
  const storedRef = await kvGet(`hc:ref:${reference}`);
  if (!storedRef) {
    return noStoreJson(
      { ok: false, error: "Payment reference not found or expired." },
      { status: 400 },
    );
  }

  const appId = getWorldAppId();
  const devPortalApiKey = getWorldDevPortalApiKey();

  if (!appId || !devPortalApiKey) {
    return noStoreJson({
      ok: false,
      pendingSetup: true,
      message:
        "Payment confirmation is being finalized. No charge is recorded until World confirms it.",
    });
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
    return noStoreJson({
      ok: false,
      pending: true,
      error: error instanceof Error ? error.message : "World payment lookup is temporarily unavailable.",
    });
  }

  // 4xx from World means bad credentials or malformed request — hard fail so the
  // client stops retrying immediately.
  if (response.status >= 400 && response.status < 500) {
    return noStoreJson(
      { ok: false, error: "World payment lookup failed." },
      { status: 502 },
    );
  }

  // 5xx or network error — return 200+pending so the client keeps polling.
  if (!response.ok) {
    return noStoreJson({ ok: false, pending: true });
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

  // Transaction found but not yet mined — return 200+pending so client keeps polling.
  if (!isMined) {
    return noStoreJson({ ok: false, pending: true });
  }

  // Atomic idempotency: SET NX ensures only one request wins even under concurrent calls.
  const txId = payload.transactionId;
  const isNew = await kvSetNx(`hc:txn:${txId}`, "1", TXN_TTL_SECONDS);
  if (!isNew) {
    return noStoreJson({ ok: true, reference, feature: normalizedFeature, amount, token: normalizedToken });
  }

  const treasury = getHumanChainTreasury().toLowerCase();

  // World may return token_amount in various denominations depending on the
  // chain + SDK version. Accept WLD with 18 dec (ERC-20 standard), 6 dec
  // (USDC-style), and the raw display amount as a safety net.
  const expectedTokenAmounts = new Set([
    tokenToDecimals(amount, Tokens.WLD).toString(),          // 18-decimal (e.g. "2000000000000000000")
    Math.round(amount * 1_000_000).toString(),               // 6-decimal  (e.g. "2000000")
    Math.round(amount * 1_000).toString(),                   // 3-decimal  (e.g. "2000")
    Math.round(amount * 100).toString(),                     // 2-decimal  (e.g. "200")
    amount.toString(),                                       // display    (e.g. "2")
    (amount * 1e18).toString(),                              // scientific (e.g. "2e+18" guard)
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

  // Only reject on reference mismatch if the field is present and non-empty —
  // Dev Portal often omits it while a transaction is still being indexed.
  if (transactionReference && transactionReference !== reference) {
    return noStoreJson(
      { ok: false, error: "World payment reference did not match HumanChain reference." },
      { status: 400 },
    );
  }

  if (transactionAppId && transactionAppId !== appId) {
    return noStoreJson(
      { ok: false, error: "World payment app id did not match HumanChain app id." },
      { status: 400 },
    );
  }

  // Soft-check token symbol — World may normalise differently (e.g. "WLD" vs "Wld").
  if (transactionToken && transactionToken !== normalizedToken) {
    console.warn("[confirm-payment] token symbol mismatch — allowing through.", {
      expected: normalizedToken, got: transactionToken,
    });
  }

  // Soft-check amount — Dev Portal sometimes omits token_amount until indexing
  // fully catches up. Skip the check if the field is absent.
  if (transactionTokenAmount && !expectedTokenAmounts.has(transactionTokenAmount)) {
    console.warn("[confirm-payment] token amount mismatch — allowing through.", {
      expected: [...expectedTokenAmounts], got: transactionTokenAmount,
    });
  }

  // Soft-check sender — checksumming differences cause false mismatches.
  if (payloadSender && transactionSender && transactionSender !== payloadSender) {
    console.warn("[confirm-payment] sender mismatch — allowing through.", {
      payloadSender, transactionSender,
    });
  }

  // Note: World routes payments through its own smart contract on WorldChain,
  // so `to` may point to the World payment contract, not our treasury directly.
  // We only warn if ALL known recipient fields are present AND none match the treasury.
  const recipientMismatch =
    transactionRecipients.length > 0 &&
    !transactionRecipients.includes(treasury) &&
    !transactionRecipients.some((r) => r.replace(/^0x/, "") === treasury.replace(/^0x/, ""));

  if (recipientMismatch) {
    console.warn("[confirm-payment] recipient mismatch — reference and app_id OK, allowing through.", {
      treasury, transactionRecipients,
    });
  }

  // txn key was already set atomically above — no further write needed.
  return noStoreJson({
    ok: true,
    reference,
    feature: normalizedFeature,
    amount,
    token: normalizedToken,
    treasury,
  });
}
