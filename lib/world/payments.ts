"use client";

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

// Retry schedule: immediate, then exponential back-off up to ~60 s total.
const worldPaymentConfirmationDelays = [0, 1000, 2500, 4500, 7000, 11000, 17000];

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
      confirmationResponse = await fetch("/api/world/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      confirmation = (await confirmationResponse.json()) as WorldPaymentConfirmation;
    } catch (error) {
      lastConfirmation = {
        error: error instanceof Error ? error.message : "World payment confirmation request failed.",
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
        error: confirmation.error ?? "World payment could not be confirmed.",
        ok: false,
      };
    }

    // Transient server error (5xx) — fall through and retry.
    if (!confirmationResponse.ok) continue;

    // Setup not complete — no point polling.
    if (confirmation.pendingSetup) {
      return {
        confirmation,
        error: confirmation.error ?? "World payment confirmation is not configured.",
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
      lastConfirmation?.error ??
      "World payment is still pending. Please wait a moment and try the action again if it does not unlock.",
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

  const referenceResponse = await fetch("/api/world/payment-reference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, feature, token }),
  });

  const referencePayload = (await referenceResponse.json()) as {
    reference?: string;
    error?: string;
  };

  if (!referenceResponse.ok || !referencePayload.reference) {
    return {
      ok: false,
      error: referencePayload.error ?? "Could not prepare payment reference.",
    };
  }

  if (referencePayload.reference.length > 36) {
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
    reference: referencePayload.reference,
    to: treasuryAddress,
    tokens: [{ symbol: tokenSymbol, token_amount: tokenToDecimals(amount, tokenSymbol).toString() }],
    description,
    fallback: () => ({
      transactionId: "web-preview-payment",
      reference: referencePayload.reference ?? "web-preview-reference",
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

  const confirmationResult = await confirmWorldPayment({
    amount,
    feature,
    payload: payment.data,
    reference: referencePayload.reference,
    token,
  });

  if (!confirmationResult.ok) {
    return {
      ok: false,
      error: confirmationResult.error ?? "World payment could not be confirmed.",
      payment,
      confirmation: confirmationResult.confirmation,
    };
  }

  return {
    ok: true,
    payment,
    confirmation: confirmationResult.confirmation,
    recipient: treasuryAddress,
  };
}
