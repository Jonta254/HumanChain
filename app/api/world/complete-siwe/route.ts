import { NextRequest } from "next/server";
import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";
import {
  isRateLimitedKV,
  noStoreJson,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  if (await isRateLimitedKV(req, "complete-siwe", 12)) {
    return rateLimitResponse();
  }

  const body = await readJsonBody<{
    nonce?: string;
    payload?: Parameters<typeof verifySiweMessage>[0];
  }>(req);

  if (!body) {
    return noStoreJson({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { nonce, payload } = body;
  const storedNonce = req.cookies.get("humanchain_siwe_nonce")?.value;

  if (!nonce || !payload) {
    return noStoreJson(
      { error: "Missing SIWE nonce or wallet auth payload." },
      { status: 400 },
    );
  }

  if (!storedNonce || storedNonce !== nonce) {
    return noStoreJson(
      { ok: false, error: "Expired or mismatched wallet auth nonce." },
      { status: 401 },
    );
  }

  try {
    const verification = await verifySiweMessage(
      payload,
      nonce,
      "Sign in to HumanChain as a verified human.",
    );

    if (!verification.isValid) {
      const failRes = noStoreJson(
        { ok: false, error: "Invalid wallet signature." },
        { status: 401 },
      );
      failRes.cookies.delete("humanchain_siwe_nonce");
      return failRes;
    }

    const rawAddress = verification.siweMessageData.address;
    if (!rawAddress) {
      const failRes = noStoreJson({ ok: false, error: "Could not extract verified address." }, { status: 400 });
      failRes.cookies.delete("humanchain_siwe_nonce");
      return failRes;
    }
    const verifiedAddress = rawAddress.toLowerCase();
    const response = noStoreJson({
      ok: true,
      address: verifiedAddress,
      statement: verification.siweMessageData.statement,
    });

    response.cookies.delete("humanchain_siwe_nonce");
    // Set a session cookie so server-side routes can verify the authenticated wallet.
    response.cookies.set("humanchain_wallet", verifiedAddress, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "strict",
      secure: true,
    });

    return response;
  } catch {
    const failRes = noStoreJson(
      {
        ok: false,
        error: "Wallet signature verification failed.",
      },
      { status: 400 },
    );
    failRes.cookies.delete("humanchain_siwe_nonce");
    return failRes;
  }
}
