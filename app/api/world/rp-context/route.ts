import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const now = Math.floor(Date.now() / 1000);

  if (!process.env.WORLD_RP_ID || !process.env.WORLD_RP_SIGNING_SECRET) {
    return NextResponse.json({
      rpContext: {
        rp_id: process.env.WORLD_RP_ID ?? "rp_development_placeholder",
        nonce: randomUUID(),
        created_at: now,
        expires_at: now + 15 * 60,
        signature: "development_signature_placeholder",
      },
      pendingSetup: true,
    });
  }

  // TODO: Generate an official RP context signature with WORLD_RP_SIGNING_SECRET.
  return NextResponse.json({
    rpContext: {
      rp_id: process.env.WORLD_RP_ID,
      nonce: randomUUID(),
      created_at: now,
      expires_at: now + 15 * 60,
      signature: "replace_with_signed_context",
    },
  });
}
