"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import type { WalletAuthResult } from "@worldcoin/minikit-js/commands";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
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

  const nonceResponse = await fetchWithTimeout("/api/world/nonce", { timeoutMs: 8_000 });

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

  const verifyResponse = await fetchWithTimeout("/api/world/complete-siwe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nonce, payload }),
    timeoutMs: 10_000,
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

  const verification = await verifyResponse.json();

  // World's own docs: "Do not use World ID verification as a login substitute."
  // Wallet auth (SIWE) only proves wallet ownership — read the real
  // proof-of-personhood tier from MiniKit.user, populated by the SDK after
  // wallet auth resolves, so the app never claims more than it can prove.
  const status = MiniKit.user?.verificationStatus;
  const worldIdTier: "orb" | "document" | "none" = status?.isOrbVerified
    ? "orb"
    : status?.isDocumentVerified || status?.isSecureDocumentVerified
      ? "document"
      : "none";

  return {
    result,
    verification,
    worldIdTier,
  };
}
