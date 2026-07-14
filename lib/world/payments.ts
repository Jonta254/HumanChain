"use client";

import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { MiniKit } from "@worldcoin/minikit-js";
import { Tokens, tokenToDecimals } from "@worldcoin/minikit-js/commands";
import type { PayResult } from "@worldcoin/minikit-js/commands";
import { getHumanChainTreasury } from "@/lib/worldConfig";
import {
  defaultHumanChainPaymentToken,
  isHumanChainPaymentToken,
  type HumanChainPaymentToken,
} from "@/lib/worldPayments";
import type { WorldPaymentConfirmation, WorldPaymentInput } from "./types";
import { isWorldMiniAppReady } from "./context";

const miniKitTokenBySymbol: Record<HumanChainPaymentToken, Tokens> = {
  WLD: Tokens.WLD,
};

// WorldChain transactions typically mine in 3-8s, but can take 30-90s during congestion.
// Poll aggressively early, then back off. Total window ~120s covers > 99% of cases.
const worldPaymentConfirmationDelays = [600, 1400, 2500, 4000, 6500, 10000, 15000, 20000, 28000, 38000];

function waitForWorldConfirmation(delayMs: number) {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

async function confirmWorldPayment(input: {
  amount: number;
  feature: string;
  payload: PayResult;
  reference: string;
  token: HumanChainPaymentToken;
}) {
  let lastConfirmation: WorldPaymentConfirmation | null = null;

  for (const delayMs of worldPaymentConfirmationDelays) {
    if (delayMs > 0) {
      await waitForWorldConfirmation(delayMs);
    }

    let confirmationResponse: Response;
    let confirmation: WorldPaymentConfirmation;

    try {
      confirmationResponse = await fetchWithTimeout("/api/world/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        timeoutMs: 12_000,
      });
      confirmation = (await confirmationResponse.json()) as WorldPaymentConfirmation;
    } catch (error) {
      lastConfirmation = {
        message: error instanceof Error ? error.message : "World payment confirmation request failed.",
        ok: false,
      };
      continue;
    }

    lastConfirmation = confirmation;

    // Hard client/portal error (4xx or the 502 that wraps a Dev Portal 4xx) —
    // retrying will not help; return immediately.
    if (!confirmationResponse.ok && confirmationResponse.status < 500) {
      return {
        confirmation,
        error: confirmation.message ?? "World payment could not be confirmed.",
        ok: false,
      };
    }

    // Transient server error (5xx) — fall through and retry.
    if (!confirmationResponse.ok) continue;

    // Setup not complete — no point polling.
    if (confirmation.code === "SETUP_INCOMPLETE") {
      return {
        confirmation,
        error: confirmation.message ?? "World payment confirmation is not configured.",
        ok: false,
      };
    }

    // Confirmed.
    if (confirmation.ok) {
      return { confirmation, ok: true };
    }

    // Transaction pending (not yet mined) — keep polling.
  }

  return {
    confirmation: lastConfirmation,
    error:
      lastConfirmation?.message ??
      "World payment is still pending on WorldChain. Your WLD has been sent — do not pay again.",
    ok: false,
  };
}

export async function payWithWorld({
  amount,
  description,
  feature,
  token = defaultHumanChainPaymentToken,
}: WorldPaymentInput) {
  const treasuryAddress = getHumanChainTreasury();

  if (!treasuryAddress) {
    return {
      ok: false,
      pendingSetup: true,
      message:
        "Live payments are being finalized. No payment will be requested until the treasury wallet is ready.",
    };
  }

  if (!isWorldMiniAppReady()) {
    return {
      ok: false,
      pendingWorldApp: true,
      message: "World payments must be started inside World App.",
    };
  }

  let referenceStr: string;
  try {
    const referenceResponse = await fetchWithTimeout("/api/world/payment-reference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, feature, token }),
      timeoutMs: 8_000,
    });
    const referencePayload = (await referenceResponse.json()) as {
      data?: { reference?: string };
      message?: string;
    };
    const generatedReference = referencePayload.data?.reference;
    if (!referenceResponse.ok || !generatedReference) {
      return {
        ok: false,
        error: referencePayload.message ?? "Could not prepare payment reference.",
      };
    }
    referenceStr = generatedReference;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not prepare payment reference.",
    };
  }

  if (referenceStr.length > 36) {
    return {
      ok: false,
      error: "World payment reference is too long. Please try again.",
    };
  }

  if (!isHumanChainPaymentToken(token)) {
    return {
      ok: false,
      error: "Unsupported HumanChain payment token.",
    };
  }

  const tokenSymbol = miniKitTokenBySymbol[token];

  const payment = await MiniKit.pay({
    reference: referenceStr,
    to: treasuryAddress,
    tokens: [{ symbol: tokenSymbol, token_amount: tokenToDecimals(amount, tokenSymbol).toString() }],
    description,
    fallback: () => ({
      transactionId: "web-preview-payment",
      reference: referenceStr ?? "web-preview-reference",
      from: "web-preview",
      chain: "worldchain" as PayResult["chain"],
      timestamp: new Date().toISOString(),
    }),
  }).catch((error) => ({
    error: error instanceof Error ? error.message : "World payment command failed.",
    executedWith: "error" as const,
  }));

  if (payment.executedWith === "error") {
    return {
      ok: false,
      error: payment.error,
    };
  }

  if (payment.executedWith === "fallback") {
    return {
      ok: false,
      pendingWorldApp: true,
      payment,
      message: "World payments must be completed inside World App before this is treated as paid.",
    };
  }

  // World App has already confirmed the user signed and submitted this payment.
  // Unlock immediately instead of blocking on WorldChain mining — full backend
  // verification (recipient/amount/reference checks) still runs, just in the
  // background, so it can log/flag a mismatch without making the user wait.
  void confirmWorldPayment({
    amount,
    feature,
    payload: payment.data,
    reference: referenceStr,
    token,
  }).then((confirmationResult) => {
    if (!confirmationResult.ok) {
      console.warn(
        `[HumanChain] Background payment confirmation failed for "${feature}" (ref ${referenceStr}):`,
        confirmationResult.error,
      );
    }
  });

  return {
    ok: true,
    payment,
    pendingConfirmation: true,
    recipient: treasuryAddress,
  };
}
