import { NextRequest, NextResponse } from "next/server";
import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";

export async function POST(req: NextRequest) {
  const { nonce, payload } = await req.json();

  if (!nonce || !payload) {
    return NextResponse.json(
      { error: "Missing SIWE nonce or wallet auth payload." },
      { status: 400 },
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

    return NextResponse.json({
      ok: true,
      address: verification.siweMessageData.address,
      statement: verification.siweMessageData.statement,
    });
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
