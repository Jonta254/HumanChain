import { NextRequest } from "next/server";
import type { PayResult } from "@worldcoin/minikit-js/commands";
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
import { getWorldAppId } from "@/lib/worldConfig";

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "confirm-payment", 20)) {
    return rateLimitResponse();
  }

  const body = await readJsonBody<{
    payload?: PayResult;
    reference?: string;
    feature?: string;
    amount?: number;
    token?: string;
  }>(req);

  if (!body) {
    return noStoreJson({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { payload, reference, feature, amount } = body;

  const normalizedFeature = normalizePaymentFeature(feature ?? "");
  const normalizedToken = normalizePaymentToken(body.token);

  if (
    !payload?.transactionId ||
    !reference ||
    payload.reference !== reference ||
    !normalizedFeature ||
    !isHumanChainPaymentFeature(normalizedFeature) ||
    !isHumanChainPaymentToken(normalizedToken) ||
    !amount ||
    !isValidHumanChainPaymentAmount(normalizedFeature, amount) ||
    !reference.startsWith(`humanchain:${normalizedFeature}:${amount}:${normalizedToken}:`)
  ) {
    return noStoreJson(
      { error: "Missing payment confirmation data." },
      { status: 400 },
    );
  }

  const appId = getWorldAppId();

  if (!appId || !process.env.DEV_PORTAL_API_KEY) {
    return noStoreJson({
      ok: false,
      pendingSetup: true,
      message:
        "Add DEV_PORTAL_API_KEY before verifying World payments.",
    });
  }

  const response = await fetch(
    `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transactionId}?app_id=${appId}&type=payment`,
    {
      headers: {
        Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
      },
    },
  );

  const transaction = await response.json();

  if (!response.ok) {
    return noStoreJson(
      {
        ok: false,
        error: "World payment status lookup failed.",
        transaction,
      },
      { status: 502 },
    );
  }

  const isMined = transaction.transaction_status === "mined";

  return noStoreJson({
    ok: isMined,
    reference,
    feature: normalizedFeature,
    amount,
    token: normalizedToken,
    transaction,
  });
}
