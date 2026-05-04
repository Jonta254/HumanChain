import { NextRequest, NextResponse } from "next/server";
import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";

export async function POST(req: NextRequest) {
  const { nonce, payload } = await req.json();
  const storedNonce = req.cookies.get("humanchain_siwe_nonce")?.value;

  if (!nonce || !payload) {
    return NextResponse.json(
      { error: "Missing SIWE nonce or wallet auth payload." },
      { status: 400 },
    );
  }

  if (!storedNonce || storedNonce !== nonce) {
    return NextResponse.json(
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
      return NextResponse.json(
        { ok: false, error: "Invalid wallet signature." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      ok: true,
      address: verification.siweMessageData.address,
      statement: verification.siweMessageData.statement,
    });

    response.cookies.delete("humanchain_siwe_nonce");

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Wallet auth failed.",
      },
      { status: 400 },
    );
  }
}
