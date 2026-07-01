import { NextRequest } from "next/server";
import { signRequest } from "@worldcoin/idkit/signing";
import { isRateLimitedKV, noStoreJson, rateLimitResponse } from "@/lib/serverApi";
import { getWorldRpId } from "@/lib/worldConfig";

export async function POST(req: NextRequest) {
  if (await isRateLimitedKV(req, "rp-context", 30)) return rateLimitResponse();

  const body = (await req.json().catch(() => null)) as {
    action?: string;
  } | null;
  const action = body?.action?.trim();

  if (!action || !/^[a-z0-9_-]{3,80}$/.test(action)) {
    return noStoreJson({ error: "Unsupported World ID action." }, { status: 400 });
  }

  const rpId = getWorldRpId();

  if (!rpId || !process.env.RP_SIGNING_KEY) {
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

  const rawKey = process.env.RP_SIGNING_KEY!;
  const signingKeyHex = rawKey.startsWith("0x") ? rawKey.slice(2) : rawKey;

  let signResult: ReturnType<typeof signRequest>;
  try {
    signResult = signRequest({ action, signingKeyHex });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[rp-context] signRequest failed:", msg, "| keyLen:", signingKeyHex.length);
    return noStoreJson({ ok: false, error: msg }, { status: 500 });
  }
  const { createdAt, expiresAt, nonce, sig } = signResult;

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
