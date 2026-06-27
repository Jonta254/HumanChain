import { NextRequest } from "next/server";
import type { PayResult } from "@worldcoin/minikit-js/commands";
import { Tokens, tokenToDecimals } from "@worldcoin/minikit-js/commands";
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
import { getHumanChainTreasury, getWorldAppId, getWorldDevPortalApiKey } from "@/lib/worldConfig";

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
    reference.length > 36
  ) {
    return noStoreJson(
      { error: "Missing payment confirmation data." },
      { status: 400 },
    );
  }

  const appId = getWorldAppId();
  const devPortalApiKey = getWorldDevPortalApiKey();

  if (!appId || !devPortalApiKey) {
    return noStoreJson({
      ok: false,
      pendingSetup: true,
      message:
        "Payment confirmation is being finalized. No charge is recorded until World confirms it.",
    });
  }

  let response: Response;
  let transaction: unknown;

  try {
    response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transactionId}?app_id=${appId}&type=payment`,
      {
        headers: {
          Authorization: `Bearer ${devPortalApiKey}`,
        },
      },
    );
    transaction = await response.json();
  } catch (error) {
    return noStoreJson({
      ok: false,
      pending: true,
      error: error instanceof Error ? error.message : "World payment lookup is temporarily unavailable.",
    });
  }

  // 4xx from World means bad credentials or malformed request — hard fail so the
  // client stops retrying immediately.
  if (response.status === 404) {
    return noStoreJson({ ok: false, pending: true });
  }

  if (response.status >= 400 && response.status < 500) {
    return noStoreJson(
      { ok: false, error: "World payment lookup failed.", transaction },
      { status: 502 },
    );
  }

  // 5xx or network error — return 200+pending so the client keeps polling.
  if (!response.ok) {
    return noStoreJson({ ok: false, pending: true });
  }

  const transactionRecord = transaction as Record<string, unknown>;
  const isMined =
    transactionRecord.transaction_status === "mined" ||
    transactionRecord.status === "mined" ||
    transactionRecord.transaction_status === "confirmed" ||
    transactionRecord.status === "confirmed";

  // Transaction found but not yet mined — return 200+pending so client keeps polling.
  if (!isMined) {
    return noStoreJson({ ok: false, pending: true });
  }
  const treasury = getHumanChainTreasury().toLowerCase();
  const expectedTokenAmounts = new Set([
    tokenToDecimals(amount, Tokens.WLD).toString(),
    Math.round(amount * 1_000_000).toString(),
  ]);
  const transactionReference =
    typeof transactionRecord.reference === "string" ? transactionRecord.reference : "";
  const transactionAppId =
    typeof transactionRecord.app_id === "string" ? transactionRecord.app_id : "";
  const transactionToken =
    typeof transactionRecord.token === "string" ? transactionRecord.token.toUpperCase() : "";
  const transactionTokenAmount =
    typeof transactionRecord.token_amount === "string" ? transactionRecord.token_amount : "";
  const transactionSender =
    typeof transactionRecord.from === "string" ? transactionRecord.from.toLowerCase() : "";
  const payloadSender = typeof payload.from === "string" ? payload.from.toLowerCase() : "";
  const transactionRecipients = [
    transactionRecord.to,
    transactionRecord.recipient,
    transactionRecord.to_address,
    transactionRecord.recipient_address,
  ]
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.toLowerCase());

  if (isMined && transactionReference !== reference) {
    return noStoreJson(
      {
        ok: false,
        error: "World payment reference did not match HumanChain reference.",
        transaction,
      },
      { status: 400 },
    );
  }

  if (isMined && transactionAppId && transactionAppId !== appId) {
    return noStoreJson(
      {
        ok: false,
        error: "World payment app id did not match HumanChain app id.",
        transaction,
      },
      { status: 400 },
    );
  }

  if (isMined && transactionToken && transactionToken !== normalizedToken) {
    return noStoreJson(
      {
        ok: false,
        error: "World payment token did not match HumanChain WLD requirement.",
        transaction,
      },
      { status: 400 },
    );
  }

  if (isMined && transactionTokenAmount && !expectedTokenAmounts.has(transactionTokenAmount)) {
    return noStoreJson(
      {
        ok: false,
        error: "World payment amount did not match HumanChain payment request.",
        transaction,
      },
      { status: 400 },
    );
  }

  if (isMined && payloadSender && transactionSender && transactionSender !== payloadSender) {
    return noStoreJson(
      {
        ok: false,
        error: "World payment sender did not match the MiniKit payment payload.",
        transaction,
      },
      { status: 400 },
    );
  }

  if (isMined && transactionRecipients.length > 0 && !transactionRecipients.includes(treasury)) {
    return noStoreJson(
      {
        ok: false,
        error: "World payment recipient did not match HumanChain treasury.",
        transaction,
      },
      { status: 400 },
    );
  }

  return noStoreJson({
    ok: isMined,
    reference,
    feature: normalizedFeature,
    amount,
    token: normalizedToken,
    treasury,
    transaction,
  });
}
