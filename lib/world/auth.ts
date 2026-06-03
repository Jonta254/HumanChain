"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import type { WalletAuthResult } from "@worldcoin/minikit-js/commands";
import { isWorldMiniAppReady } from "./context";

export async function authenticateHumanWallet() {
  if (!isWorldMiniAppReady()) {
    return {
      result: {
        executedWith: "fallback",
        data: null,
      },
      verification: {
        ok: false,
        error: "World wallet authentication must be completed inside World App.",
      },
    };
  }

  const nonceResponse = await fetch("/api/world/nonce");

  if (!nonceResponse.ok) {
    throw new Error("Could not prepare World wallet login.");
  }

  const { nonce } = (await nonceResponse.json()) as { nonce: string };

  const result = await MiniKit.walletAuth<WalletAuthResult>({
    expirationTime: new Date(Date.now() + 1000 * 60 * 10),
    nonce,
    statement: "Sign in to HumanChain as a verified human.",
  });

  if (result.executedWith === "fallback") {
    return {
      result,
      verification: {
        ok: false,
        error: "World wallet authentication must be completed inside World App.",
      },
    };
  }

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
