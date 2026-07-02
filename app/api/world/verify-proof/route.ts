import { NextRequest } from "next/server";
import {
  isRateLimitedKV,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";
import { validateWorldIdProof } from "@/lib/validation/schemas";
import { createErrorResponse, createSuccessResponse, getClientIp, ErrorCode } from "@/lib/api/responses";
import { logger } from "@/lib/api/logging";
import { getWorldRpId } from "@/lib/worldConfig";
import { kvSAdd, kvSIsMember } from "@/lib/kv";

const KV_NULLIFIER_KEY = "hc:nullifiers";

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const route = "POST /api/world/verify-proof";

  if (await isRateLimitedKV(req, "verify-proof", 20)) {
    logger.warn("Rate limit exceeded for proof verification", { route, ip: clientIp });
    return rateLimitResponse();
  }

  const body = await readJsonBody<{
    idkitResponse?: unknown;
    action?: string;
    signal?: string;
  }>(req);

  if (!body) {
    logger.warn("Invalid JSON body for proof verification", { route, ip: clientIp });
    return createErrorResponse(ErrorCode.INVALID_INPUT, "Invalid JSON body.", { status: 400 });
  }

  const validation = validateWorldIdProof(body);
  if (!validation.ok) {
    logger.warn("Invalid World ID proof", { route, ip: clientIp, data: { error: validation.error } });
    return createErrorResponse(ErrorCode.INVALID_PROOF, validation.error || "Invalid World ID proof.", { status: 400 });
  }

  const { idkitResponse, action, signal } = body;
  const nullifierHash =
    idkitResponse &&
    typeof idkitResponse === "object" &&
    "nullifier_hash" in idkitResponse &&
    typeof (idkitResponse as Record<string, unknown>).nullifier_hash === "string"
      ? ((idkitResponse as Record<string, unknown>).nullifier_hash as string)
      : null;

  if (!nullifierHash) {
    logger.warn("Missing nullifier hash in proof", { route, ip: clientIp });
    return createErrorResponse(ErrorCode.INVALID_PROOF, "Missing nullifier hash in World ID proof.", { status: 400 });
  }

  if (await kvSIsMember(KV_NULLIFIER_KEY, nullifierHash)) {
    logger.warn("Proof replay attack detected", { route, ip: clientIp });
    return createErrorResponse(ErrorCode.CONFLICT, "World ID proof already used. Each proof can only be verified once.", { status: 400 });
  }

  const rpId = getWorldRpId();

  if (!rpId) {
    logger.error("World ID verification setup incomplete", { route, ip: clientIp });
    return createErrorResponse(
      ErrorCode.SETUP_INCOMPLETE,
      "World human verification is being finalized. Please continue with wallet verification for now.",
      { status: 503 }
    );
  }

  try {
    const verifyBody = {
      ...(idkitResponse as Record<string, unknown>),
      action,
      ...(signal ? { signal } : {}),
    };

    const response = await fetch(
      `https://developer.world.org/api/v4/verify/${rpId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verifyBody),
      },
    );

    const payload = await response.json();

    if (!response.ok) {
      logger.warn("World ID verification failed", { route, ip: clientIp, data: { status: response.status } });
      return createErrorResponse(ErrorCode.EXTERNAL_SERVICE_ERROR, "World ID verification failed.", { status: 400 });
    }

    // Store nullifier to prevent replay attacks
    await kvSAdd(KV_NULLIFIER_KEY, nullifierHash, 60 * 60 * 24 * 365); // 1-year TTL

    logger.info("World ID proof verified successfully", { route, ip: clientIp });
    return createSuccessResponse({ ok: true, payload });
  } catch (error) {
    logger.error("World ID verification error", { route, ip: clientIp, error });
    return createErrorResponse(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      "Failed to verify World ID proof.",
      { status: 502, retryable: true }
    );
  }
}
