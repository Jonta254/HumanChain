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
import type { WorldPaymentConfirmation, WorldPaymentInput, WorldPaymentStatus } from "./types";
import { isWorldMiniAppReady } from "./context";

const miniKitTokenBySymbol: Record<HumanChainPaymentToken, Tokens> = {
  WLD: Tokens.WLD,
};

const confirmationRequestTimeoutMs = 4500;
const worldPaymentConfirmationDelays = [0, 750, 1500, 2500, 3500, 5000, 7500, 10000, 15000];

function waitForWorldConfirmation(delayMs: number) {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

async function confirmWorldPayment(input: {
  amount: number;
  feature: string;
  onStatus?: (status: WorldPaymentStatus) => void;
  payload: PayResult;
  reference: string;
  token: HumanChainPaymentToken;
}) {
  let lastConfirmation: WorldPaymentConfirmation | null = null;

  for (const delayMs of worldPaymentConfirmationDelays) {
    input.onStatus?.("verifying");

    if (delayMs > 0) {
      await waitForWorldConfirmation(delayMs);
    }

    let confirmationResponse: Response;
    let confirmation: WorldPaymentConfirmation;

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), confirmationRequestTimeoutMs);
      confirmationResponse = await fetch("/api/world/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      window.clearTimeout(timeout);
      confirmation = (await confirmationResponse.json()) as WorldPaymentConfirmation;
    } catch (error) {
      lastConfirmation = {
        error: error instanceof Error && error.name !== "AbortError"
          ? error.message
          : "World payment confirmation lookup timed out.",
        ok: false,
        pending: true,
      };
      continue;
    }

    lastConfirmation = confirmation;

    // Hard server error (4xx wrapped as 502) — stop retrying immediately.
    if (!confirmationResponse.ok) {
      return {
        confirmation,
        error: confirmation.error ?? "World payment could not be confirmed.",
        ok: false,
      };
    }

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
      input.onStatus?.("confirmed");
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
  onStatus,
  token = defaultHumanChainPaymentToken,
}: WorldPaymentInput) {
  onStatus?.("preparing");
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

  onStatus?.("opening-world-app");
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
    onStatus?.("failed");
    return {
      ok: false,
      error: payment.error,
    };
  }

  if (payment.executedWith === "fallback") {
    onStatus?.("failed");
    return {
      ok: false,
      pendingWorldApp: true,
      payment,
      message: "World payments must be completed inside World App before this is treated as paid.",
    };
  }

  onStatus?.("submitted");
  const confirmationResult = await confirmWorldPayment({
    amount,
    feature,
    onStatus,
    payload: payment.data,
    reference: referencePayload.reference,
    token,
  });

  if (!confirmationResult.ok) {
    onStatus?.("pending");
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
    reference: referencePayload.reference,
    recipient: treasuryAddress,
  };
}
