import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import {
  isHumanChainPaymentFeature,
  isHumanChainPaymentToken,
  isValidHumanChainPaymentAmount,
  normalizePaymentFeature,
  normalizePaymentToken,
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
    token?: string;
  }>(req);

  if (!body) {
    return noStoreJson({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { feature, amount } = body;

  const normalizedFeature = normalizePaymentFeature(feature ?? "");
  const normalizedToken = normalizePaymentToken(body.token);

  if (
    !normalizedFeature ||
    !isHumanChainPaymentFeature(normalizedFeature) ||
    !isHumanChainPaymentToken(normalizedToken) ||
    !amount ||
    !isValidHumanChainPaymentAmount(normalizedFeature, amount)
  ) {
    return noStoreJson(
      { error: "Invalid HumanChain payment feature." },
      { status: 400 },
    );
  }

  return noStoreJson({
    reference: `humanchain:${normalizedFeature}:${amount}:${normalizedToken}:${randomUUID()}`,
    feature: normalizedFeature,
    token: normalizedToken,
  });
}
