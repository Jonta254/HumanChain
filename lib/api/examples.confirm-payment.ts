/**
 * Example: Improved payment confirmation endpoint
 * This demonstrates best practices for input validation, error handling, and logging
 *
 * To implement this:
 * 1. Backup the original: app/api/world/confirm-payment/route.ts
 * 2. Review the changes below
 * 3. Apply incrementally to ensure compatibility
 */

import { NextRequest } from "next/server";
import type { PayResult } from "@worldcoin/minikit-js/commands";
import {
  isValidPaymentFeature,
  isValidPaymentToken,
  isValidPaymentAmount,
} from "@/lib/validation/schemas";
import {
  createErrorResponse,
  createSuccessResponse,
  getClientIp,
  ErrorCode,
} from "@/lib/api/responses";
import { logger } from "@/lib/api/logging";
import { isRateLimitedKV, rateLimitResponse, readJsonBody } from "@/lib/serverApi";
import { getWorldAppId, getWorldDevPortalApiKey } from "@/lib/worldConfig";
import { kvGet } from "@/lib/kv";


interface ConfirmPaymentInput {
  payload?: PayResult;
  reference?: string;
  feature?: string;
  amount?: number;
  token?: string;
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const route = "POST /api/world/confirm-payment";

  try {
    // Rate limiting
    if (await isRateLimitedKV(req, "confirm-payment", 20)) {
      logger.warn("Rate limit exceeded for payment confirmation", { route, ip: clientIp });
      return rateLimitResponse();
    }

    // Read and validate JSON
    const body = await readJsonBody<ConfirmPaymentInput>(req);
    if (!body) {
      logger.warn("Invalid JSON body for payment confirmation", { route, ip: clientIp });
      return createErrorResponse(ErrorCode.INVALID_INPUT, "Invalid JSON body.", { status: 400 });
    }

    const { payload, reference, feature, amount, token } = body;

    // Validate all required fields
    if (!payload?.transactionId) {
      return createErrorResponse(ErrorCode.MISSING_FIELD, "Missing transaction ID in payload.");
    }

    if (!reference || reference.length > 36) {
      return createErrorResponse(
        ErrorCode.MISSING_FIELD,
        "Invalid payment reference (must be 1-36 characters).",
      );
    }

    if (payload.reference !== reference) {
      logger.warn("Payment reference mismatch", {
        route,
        ip: clientIp,
        data: { providedRef: reference, payloadRef: payload.reference },
      });
      return createErrorResponse(
        ErrorCode.INVALID_PAYMENT,
        "Payment reference does not match payload.",
      );
    }

    if (!isValidPaymentFeature(feature)) {
      return createErrorResponse(
        ErrorCode.INVALID_PAYMENT,
        "Invalid payment feature. Must be one of: tip, golden-link, streak-restore, etc.",
        {
          details: { providedFeature: feature },
        },
      );
    }

    if (!isValidPaymentToken(token)) {
      return createErrorResponse(
        ErrorCode.INVALID_PAYMENT,
        `Invalid payment token. Supported: ${["WLD"].join(", ")}`,
      );
    }

    if (!amount || !isValidPaymentAmount(feature, amount)) {
      return createErrorResponse(
        ErrorCode.INVALID_PAYMENT,
        `Invalid payment amount for feature "${feature}".`,
        { details: { providedAmount: amount } },
      );
    }

    // Validate reference was issued by payment-reference endpoint
    const storedRef = await kvGet(`hc:ref:${reference}`);
    if (!storedRef) {
      logger.warn("Payment reference not found or expired", {
        route,
        ip: clientIp,
        data: { reference },
      });
      return createErrorResponse(
        ErrorCode.INVALID_PAYMENT,
        "Payment reference not found or expired.",
        { status: 400, retryable: true },
      );
    }

    // Check setup
    const appId = getWorldAppId();
    const devPortalApiKey = getWorldDevPortalApiKey();

    if (!appId || !devPortalApiKey) {
      logger.error("Payment confirmation setup incomplete", { route, ip: clientIp });
      return createErrorResponse(
        ErrorCode.SETUP_INCOMPLETE,
        "Payment confirmation is being finalized. No charge is recorded until World confirms it.",
        { status: 503 },
      );
    }

    // TODO: Verify payment with World Developer Portal API
    // This requires calling the World API to confirm the transaction on WorldChain

    logger.info("Payment confirmation processed successfully", {
      route,
      ip: clientIp,
      data: { feature, amount, token },
    });

    return createSuccessResponse({
      ok: true,
      message: "Payment confirmed successfully.",
    });
  } catch (error) {
    logger.error("Payment confirmation error", {
      route,
      ip: clientIp,
      error,
    });

    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "An unexpected error occurred while confirming payment.",
      { status: 500, retryable: true },
    );
  }
}
