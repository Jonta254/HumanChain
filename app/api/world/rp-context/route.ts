import { NextRequest } from "next/server";
import { signRequest } from "@worldcoin/idkit/signing";
import { noStoreJson } from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    action?: string;
  } | null;
  const action = body?.action?.trim();

  if (!action || !/^[a-z0-9_-]{3,80}$/.test(action)) {
    return noStoreJson({ error: "Unsupported World ID action." }, { status: 400 });
  }

  if (!process.env.WORLD_RP_ID || !process.env.RP_SIGNING_KEY) {
    return noStoreJson({
      pendingSetup: true,
      message: "Add WORLD_RP_ID and RP_SIGNING_KEY before requesting World ID proofs.",
    });
  }

  const { createdAt, expiresAt, nonce, sig } = signRequest({
    action,
    signingKeyHex: process.env.RP_SIGNING_KEY,
  });

  return noStoreJson({
    rpContext: {
      rp_id: process.env.WORLD_RP_ID,
      nonce,
      created_at: createdAt,
      expires_at: expiresAt,
      signature: sig,
    },
  });
}
