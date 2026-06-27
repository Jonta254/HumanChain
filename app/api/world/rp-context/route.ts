import { NextRequest } from "next/server";
import { signRequest } from "@worldcoin/idkit/signing";
import { noStoreJson } from "@/lib/serverApi";
import { getWorldRpId, getWorldRpSigningKey } from "@/lib/worldConfig";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    action?: string;
  } | null;
  const action = body?.action?.trim();

  if (!action || !/^[a-z0-9_-]{3,80}$/.test(action)) {
    return noStoreJson({ error: "Unsupported World ID action." }, { status: 400 });
  }

  const rpId = getWorldRpId();
  const signingKey = getWorldRpSigningKey();

  if (!rpId || !signingKey) {
    return noStoreJson(
      {
        ok: false,
        pendingSetup: true,
        message:
          "World human verification is being finalized. You can continue using the app while this is connected.",
      },
      { status: 503 },
    );
  }

  const { createdAt, expiresAt, nonce, sig } = signRequest({
    action,
    signingKeyHex: signingKey,
  });

  return noStoreJson({
    ok: true,
    rpContext: {
      rp_id: rpId,
      nonce,
      created_at: createdAt,
      expires_at: expiresAt,
      signature: sig,
    },
  });
}
