import { NextRequest } from "next/server";
import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";
import {
  isRateLimited,
  noStoreJson,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "complete-siwe", 12)) {
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
      return noStoreJson(
        { ok: false, error: "Invalid wallet signature." },
        { status: 401 },
      );
    }

    const rawAddress = verification.siweMessageData.address;
    if (!rawAddress) {
      return noStoreJson({ ok: false, error: "Could not extract verified address." }, { status: 400 });
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
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    return noStoreJson(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Wallet auth failed.",
      },
      { status: 400 },
    );
  }
}
