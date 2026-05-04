import { NextRequest } from "next/server";
import {
  isRateLimited,
  noStoreJson,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "verify-proof", 20)) {
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

  if (!process.env.WORLD_RP_ID) {
    return noStoreJson({
      ok: false,
      pendingSetup: true,
      action,
      signal,
      message: "Add WORLD_RP_ID before verifying World ID proofs.",
    });
  }

  const response = await fetch(
    `https://developer.world.org/api/v4/verify/${process.env.WORLD_RP_ID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(idkitResponse),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    return noStoreJson({ ok: false, payload }, { status: 400 });
  }

  return noStoreJson({ ok: true, payload });
}
