import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import {
  isHumanChainPaymentFeature,
  isHumanChainPaymentToken,
  isValidHumanChainPaymentAmount,
  normalizePaymentFeature,
  normalizePaymentToken,
  getPaymentAmount,
} from "@/lib/worldPayments";
import {
  isRateLimitedKV,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";
import { kvSet } from "@/lib/kv";
import { createErrorResponse, createSuccessResponse, getClientIp, ErrorCode } from "@/lib/api/responses";
import { logger } from "@/lib/api/logging";

const REFERENCE_TTL_SECONDS = 60 * 15; // 15 minutes

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const route = "POST /api/world/payment-reference";

  if (await isRateLimitedKV(req, "payment-reference", 20)) {
    logger.warn("Rate limit exceeded for payment reference generation", { route, ip: clientIp });
    return rateLimitResponse();
  }

  const body = await readJsonBody<{
    feature?: string;
    amount?: number;
    token?: string;
  }>(req);

  if (!body) {
    logger.warn("Invalid JSON body for payment reference", { route, ip: clientIp });
    return createErrorResponse(ErrorCode.INVALID_INPUT, "Invalid JSON body.", { status: 400 });
  }

  const { feature, amount } = body;

  // Validate feature format
  const normalizedFeature = normalizePaymentFeature(feature ?? "");
  if (!normalizedFeature) {
    logger.warn("Missing payment feature", { route, ip: clientIp, data: { feature } });
    return createErrorResponse(ErrorCode.MISSING_FIELD, "Payment feature is required.", { status: 400 });
  }

  // Validate feature is recognized
  if (!isHumanChainPaymentFeature(normalizedFeature)) {
    logger.warn("Invalid payment feature", { route, ip: clientIp, data: { feature: normalizedFeature } });
    return createErrorResponse(ErrorCode.INVALID_PAYMENT, `Payment feature "${normalizedFeature}" is not supported.`, { status: 400 });
  }

  // Validate token
  const normalizedToken = normalizePaymentToken(body.token);
  if (!isHumanChainPaymentToken(normalizedToken)) {
    logger.warn("Invalid payment token", { route, ip: clientIp, data: { token: normalizedToken } });
    return createErrorResponse(ErrorCode.INVALID_PAYMENT, `Payment token "${normalizedToken}" is not supported.`, { status: 400 });
  }

  // Validate amount is provided
  if (amount === undefined || amount === null) {
    logger.warn("Missing payment amount", { route, ip: clientIp, data: { feature: normalizedFeature } });
    return createErrorResponse(ErrorCode.MISSING_FIELD, "Payment amount is required.", { status: 400 });
  }

  // Validate amount is valid
  if (!isValidHumanChainPaymentAmount(normalizedFeature, amount)) {
    const expectedAmount = getPaymentAmount(normalizedFeature);
    logger.warn("Invalid payment amount", { route, ip: clientIp, data: { feature: normalizedFeature, expected: expectedAmount, provided: amount } });
    return createErrorResponse(
      ErrorCode.INVALID_PAYMENT,
      `Invalid amount for feature "${normalizedFeature}". Expected: ${expectedAmount}.`,
      { status: 400 }
    );
  }

  // Generate unique reference
  const reference = randomUUID();

  try {
    // Store reference server-side for validation in confirm-payment
    await kvSet(
      `hc:ref:${reference}`,
      JSON.stringify({ feature: normalizedFeature, amount, token: normalizedToken, createdAt: new Date().toISOString() }),
      REFERENCE_TTL_SECONDS,
    );

    logger.info("Payment reference generated", { route, ip: clientIp, data: { feature: normalizedFeature, reference } });
    return createSuccessResponse({
      reference,
      feature: normalizedFeature,
      amount,
      token: normalizedToken,
      expiresIn: REFERENCE_TTL_SECONDS,
    });
  } catch (error) {
    logger.error("Failed to store payment reference", { route, ip: clientIp, error });
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Failed to generate payment reference.",
      { status: 500, retryable: true }
    );
  }
}
