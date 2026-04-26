"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import {
  Permission,
  Tokens,
  tokenToDecimals,
  type CommandResultByVia,
  type MiniKitShareContactsOptions,
  type MiniKitWalletAuthOptions,
  type PayResult,
  type ShareContactsResult,
  type WalletAuthResult,
} from "@worldcoin/minikit-js/commands";

export type HumanChainPaidFeature =
  | "tip"
  | "golden-link"
  | "streak-restore"
  | "pin-link"
  | "bonus-story-pages"
  | "ask-country"
  | "memory-capsule"
  | "private-ask"
  | "voice-answers"
  | "deep-verdict"
  | "deep-mirror";

export async function signInWithWorldWallet() {
  const response = await fetch("/api/world/nonce");
  const { nonce } = (await response.json()) as { nonce: string };

  const input = {
    nonce,
    statement: "Sign in to HumanChain",
    expirationTime: new Date(Date.now() + 1000 * 60 * 60),
  } satisfies MiniKitWalletAuthOptions;

  const result: CommandResultByVia<WalletAuthResult> =
    await MiniKit.walletAuth(input);

  if (result.executedWith === "fallback") {
    throw new Error("Open HumanChain inside World App to sign in.");
  }

  await fetch("/api/world/complete-siwe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload: result.data, nonce }),
  });

  return result.data;
}

export async function payForHumanChainFeature({
  feature,
  amount,
  description,
}: {
  feature: HumanChainPaidFeature;
  amount: 1 | 2 | 3 | 4 | 5 | 6;
  description: string;
}) {
  const referenceResponse = await fetch("/api/world/payment-reference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feature, amount }),
  });
  const { reference } = (await referenceResponse.json()) as {
    reference: string;
  };

  const result: CommandResultByVia<PayResult, PayResult, "minikit"> =
    await MiniKit.pay({
      reference,
      to: process.env.NEXT_PUBLIC_HUMANCHAIN_TREASURY!,
      tokens: [
        {
          symbol: Tokens.WLD,
          token_amount: tokenToDecimals(amount, Tokens.WLD).toString(),
        },
      ],
      description,
      fallback: () => {
        throw new Error("Complete this payment inside World App.");
      },
    });

  await fetch("/api/world/confirm-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload: result.data, reference, feature, amount }),
  });

  return result.data;
}

export async function requestHumanChainNotifications() {
  return MiniKit.requestPermission({
    permission: Permission.Notifications,
  });
}

export async function requestHumanChainMicrophone() {
  return MiniKit.requestPermission({
    permission: Permission.Microphone,
  });
}

export async function inviteContactsToHumanChain(message: string) {
  const input = {
    isMultiSelectEnabled: true,
    inviteMessage: message,
  } satisfies MiniKitShareContactsOptions;

  const result: CommandResultByVia<
    ShareContactsResult,
    ShareContactsResult,
    "minikit"
  > = await MiniKit.shareContacts(input);

  return result.data.contacts;
}

export async function sendSuccessHaptic() {
  return MiniKit.sendHapticFeedback({
    hapticsType: "notification",
    style: "success",
  });
}

export async function startVoiceNoteRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return stream;
}

export function stopVoiceNoteRecording(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}
