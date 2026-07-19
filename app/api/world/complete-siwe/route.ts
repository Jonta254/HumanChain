import { NextRequest } from "next/server";
import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";
import {
  isRateLimitedKV,
  noStoreJson,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";
import { signSessionCookie } from "@/lib/session";

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

    // Sign the session cookie so server routes can trust it later — a bare
    // wallet address here would be forgeable by anyone who knows the
    // address (confirmed exploitable in production before this fix).
    // Fail closed: if SESSION_SECRET isn't configured, refuse to issue a
    // session rather than falling back to an unsigned, forgeable one.
    let signedCookie: string;
    try {
      signedCookie = signSessionCookie(verifiedAddress);
    } catch {
      const failRes = noStoreJson(
        { ok: false, pendingSetup: true, error: "Sign-in is being finalized. Try again shortly." },
        { status: 503 },
      );
      failRes.cookies.delete("humanchain_siwe_nonce");
      return failRes;
    }

    const response = noStoreJson({
      ok: true,
      address: verifiedAddress,
      statement: verification.siweMessageData.statement,
    });

    response.cookies.delete("humanchain_siwe_nonce");
    // Set a session cookie so server-side routes can verify the authenticated wallet.
    response.cookies.set("humanchain_wallet", signedCookie, {
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
