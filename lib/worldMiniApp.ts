"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { Permission, Tokens, tokenToDecimals } from "@worldcoin/minikit-js/commands";
import type { PayResult, WalletAuthResult } from "@worldcoin/minikit-js/commands";

const treasuryAddress = process.env.NEXT_PUBLIC_HUMANCHAIN_TREASURY;

type WorldPaymentInput = {
  amount: number;
  description: string;
  feature: string;
};

type WorldShareInput = {
  text: string;
  title: string;
  url?: string;
};

type WorldChatInput = {
  message: string;
  to?: string[];
};

export function isWorldMiniAppReady() {
  return MiniKit.isInstalled();
}

export async function authenticateHumanWallet() {
  const nonceResponse = await fetch("/api/world/nonce");

  if (!nonceResponse.ok) {
    throw new Error("Could not prepare World wallet login.");
  }

  const { nonce } = (await nonceResponse.json()) as { nonce: string };

  const result = await MiniKit.walletAuth<WalletAuthResult>({
    nonce,
    statement: "Sign in to HumanChain as a verified human.",
  });

  const payload = result.data;

  const verifyResponse = await fetch("/api/world/complete-siwe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nonce, payload }),
  });

  if (!verifyResponse.ok) {
    const errorPayload = (await verifyResponse.json()) as { error?: string };

    return {
      result,
      verification: {
        ok: false,
        error: errorPayload.error ?? "World wallet verification failed.",
      },
    };
  }

  return {
    result,
    verification: await verifyResponse.json(),
  };
}

export async function payWithWorld({ amount, description, feature }: WorldPaymentInput) {
  if (!treasuryAddress) {
    return {
      ok: false,
      pendingSetup: true,
      message: "Add NEXT_PUBLIC_HUMANCHAIN_TREASURY before live World payments.",
    };
  }

  const referenceResponse = await fetch("/api/world/payment-reference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, feature }),
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

  const payment = await MiniKit.pay({
    reference: referencePayload.reference,
    to: treasuryAddress,
    tokens: [{ symbol: Tokens.WLD, token_amount: tokenToDecimals(amount, Tokens.WLD).toString() }],
    description,
    fallback: () => ({
      transactionId: "web-preview-payment",
      reference: referencePayload.reference ?? "web-preview-reference",
      from: "web-preview",
      chain: "worldchain" as PayResult["chain"],
      timestamp: new Date().toISOString(),
    }),
  });

  const confirmationResponse = await fetch("/api/world/confirm-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      feature,
      payload: payment.data,
      reference: referencePayload.reference,
    }),
  });

  const confirmation = await confirmationResponse.json();

  if (!confirmationResponse.ok || confirmation?.ok === false) {
    return {
      ok: false,
      error: confirmation?.error ?? "World payment could not be confirmed.",
      payment,
      confirmation,
    };
  }

  return {
    payment,
    confirmation,
  };
}

export async function requestWorldPermission(permission: Permission) {
  return MiniKit.requestPermission({
    permission,
    fallback: () => ({
      permission,
      status: "success",
      version: 1,
      timestamp: new Date().toISOString(),
    }),
  });
}

export async function humanHaptic(style: "light" | "medium" | "heavy" = "light") {
  return MiniKit.sendHapticFeedback({
    hapticsType: "impact",
    style,
    fallback: () => {
      navigator.vibrate?.(style === "heavy" ? 45 : 20);
      return {
        status: "success",
        version: 1,
        timestamp: new Date().toISOString(),
      };
    },
  });
}

export async function shareWithWorld({ text, title, url }: WorldShareInput) {
  return MiniKit.share({
    text,
    title,
    url,
    fallback: async () => {
      if (navigator.share) {
        await navigator.share({ text, title, url });
      }

      return {
        shared_files_count: 0,
        status: "success",
        version: 1,
        timestamp: new Date().toISOString(),
      };
    },
  });
}

export async function chatWithWorld({ message, to }: WorldChatInput) {
  return MiniKit.chat({
    message,
    to,
    fallback: () => ({
      count: to?.length ?? 1,
      status: "success",
      version: 1,
      timestamp: new Date().toISOString(),
    }),
  });
}

export { Permission };
