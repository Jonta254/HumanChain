import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import {
  humanChainPaymentFeatures,
  isHumanChainPaymentFeature,
  normalizePaymentFeature,
} from "@/lib/worldPayments";
import {
  isRateLimited,
  noStoreJson,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "payment-reference", 20)) {
    return rateLimitResponse();
  }

  const body = await readJsonBody<{
    feature?: string;
    amount?: number;
  }>(req);

  if (!body) {
    return noStoreJson({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { feature, amount } = body;

  const normalizedFeature = normalizePaymentFeature(feature ?? "");

  if (
    !normalizedFeature ||
    !isHumanChainPaymentFeature(normalizedFeature) ||
    !amount ||
    amount !== humanChainPaymentFeatures[normalizedFeature]
  ) {
    return noStoreJson(
      { error: "Invalid HumanChain payment feature." },
      { status: 400 },
    );
  }

  return noStoreJson({
    reference: `humanchain:${normalizedFeature}:${amount}:${randomUUID()}`,
    feature: normalizedFeature,
  });
}
