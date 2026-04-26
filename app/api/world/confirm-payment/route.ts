import { NextRequest, NextResponse } from "next/server";
import type { PayResult } from "@worldcoin/minikit-js/commands";

export async function POST(req: NextRequest) {
  const { payload, reference, feature, amount } = (await req.json()) as {
    payload?: PayResult;
    reference?: string;
    feature?: string;
    amount?: number;
  };

  if (!payload?.transactionId || !reference || !feature || !amount) {
    return NextResponse.json(
      { error: "Missing payment confirmation data." },
      { status: 400 },
    );
  }

  if (!process.env.APP_ID || !process.env.DEV_PORTAL_API_KEY) {
    return NextResponse.json({
      ok: false,
      pendingSetup: true,
      message:
        "Add APP_ID and DEV_PORTAL_API_KEY before verifying World payments.",
    });
  }

  const response = await fetch(
    `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transactionId}?app_id=${process.env.APP_ID}&type=payment`,
    {
      headers: {
        Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
      },
    },
  );

  const transaction = await response.json();
  const isMined = transaction.transaction_status === "mined";

  return NextResponse.json({
    ok: isMined,
    reference,
    feature,
    amount,
    transaction,
  });
}
