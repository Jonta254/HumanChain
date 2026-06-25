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
  isRateLimitedKV,
  noStoreJson,
  rateLimitResponse,
  readJsonBody,
} from "@/lib/serverApi";
import { kvSet } from "@/lib/kv";

const REFERENCE_TTL_SECONDS = 60 * 15; // 15 minutes

export async function POST(req: NextRequest) {
  if (await isRateLimitedKV(req, "payment-reference", 20)) {
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

  const reference = randomUUID();
  // Store reference server-side so confirm-payment can validate it wasn't forged.
  await kvSet(
    `hc:ref:${reference}`,
    JSON.stringify({ feature: normalizedFeature, amount, token: normalizedToken }),
    REFERENCE_TTL_SECONDS,
  );

  return noStoreJson({
    reference,
    feature: normalizedFeature,
    token: normalizedToken,
  });
}
