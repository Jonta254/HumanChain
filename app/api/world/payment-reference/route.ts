import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { feature, amount } = (await req.json()) as {
    feature?: string;
    amount?: number;
  };

  if (!feature || !amount || amount < 1 || amount > 6) {
    return NextResponse.json(
      { error: "Invalid HumanChain payment feature." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    reference: `humanchain:${feature}:${amount}:${randomUUID()}`,
  });
}
