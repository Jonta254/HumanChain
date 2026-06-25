import { NextRequest } from "next/server";
import {
  isRateLimitedKV,
  noStoreJson,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";
import { getWorldRpId } from "@/lib/worldConfig";
import { kvSAdd, kvSIsMember } from "@/lib/kv";

const KV_NULLIFIER_KEY = "hc:nullifiers";

export async function POST(req: NextRequest) {
  if (await isRateLimitedKV(req, "verify-proof", 20)) {
    return rateLimitResponse();
  }

  const body = await readJsonBody<{
    idkitResponse?: unknown;
    action?: string;
    signal?: string;
  }>(req);

  if (!body) {
    return noStoreJson({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { idkitResponse, action, signal } = body;

  if (!idkitResponse || !action || action.length > 80 || (signal && signal.length > 180)) {
    return noStoreJson(
      { error: "Missing World ID response or action." },
      { status: 400 },
    );
  }

  const nullifierHash =
    idkitResponse &&
    typeof idkitResponse === "object" &&
    "nullifier_hash" in idkitResponse &&
    typeof (idkitResponse as Record<string, unknown>).nullifier_hash === "string"
      ? ((idkitResponse as Record<string, unknown>).nullifier_hash as string)
      : null;

  if (!nullifierHash) {
    return noStoreJson(
      { error: "Missing nullifier hash in World ID proof." },
      { status: 400 },
    );
  }

  if (await kvSIsMember(KV_NULLIFIER_KEY, nullifierHash)) {
    return noStoreJson(
      { ok: false, error: "World ID proof already used. Each proof can only be verified once." },
      { status: 400 },
    );
  }

  const rpId = getWorldRpId();

  if (!rpId) {
    return noStoreJson(
      {
        ok: false,
        pendingSetup: true,
        action,
        signal,
        message:
          "World human verification is being finalized. Please continue with wallet verification for now.",
      },
      { status: 503 },
    );
  }

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
    return noStoreJson({ ok: false, payload }, { status: 400 });
  }

  await kvSAdd(KV_NULLIFIER_KEY, nullifierHash, 60 * 60 * 24 * 365); // 1-year TTL

  return noStoreJson({ ok: true, payload });
}
