import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  humanChainPaymentFeatures,
  isHumanChainPaymentFeature,
  normalizePaymentFeature,
} from "@/lib/worldPayments";

export async function POST(req: NextRequest) {
  const { feature, amount } = (await req.json()) as {
    feature?: string;
    amount?: number;
  };

  const normalizedFeature = normalizePaymentFeature(feature ?? "");

  if (
    !normalizedFeature ||
    !isHumanChainPaymentFeature(normalizedFeature) ||
    !amount ||
    amount !== humanChainPaymentFeatures[normalizedFeature]
  ) {
    return NextResponse.json(
      { error: "Invalid HumanChain payment feature." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    reference: `humanchain:${normalizedFeature}:${amount}:${randomUUID()}`,
    feature: normalizedFeature,
  });
}
