"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { Permission, Tokens, tokenToDecimals } from "@worldcoin/minikit-js/commands";
import type { PayResult, WalletAuthResult } from "@worldcoin/minikit-js/commands";
import { getHumanChainTreasury } from "@/lib/worldConfig";
import {
  defaultHumanChainPaymentToken,
  isHumanChainPaymentToken,
  type HumanChainPaymentToken,
} from "@/lib/worldPayments";

const miniKitTokenBySymbol: Record<HumanChainPaymentToken, Tokens> = {
  WLD: Tokens.WLD,
  USDCE: Tokens.USDC,
  EURC: Tokens.EURC,
  WBRL: Tokens.WBRL,
  WCOP: Tokens.WCOP,
  WMXN: Tokens.WMXN,
  WPEN: Tokens.WPEN,
  WCLP: Tokens.WCLP,
};

type WorldPaymentInput = {
  amount: number;
  description: string;
  feature: string;
  token?: HumanChainPaymentToken;
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

type WorldPermissionSnapshot = {
  notifications?: unknown;
  contacts?: unknown;
  microphone?: unknown;
};

export type WorldMiniAppContext = {
  deviceOS?: string;
  launchLocation?: string | null;
  permissions?: WorldPermissionSnapshot;
  profilePictureUrl?: string;
  safeAreaInsets?: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
  username?: string;
  walletAddress?: string;
  worldAppVersion?: number;
};

export type WorldUserProfile = {
  profilePictureUrl?: string;
  username?: string;
  walletAddress?: string;
};

export function isWorldMiniAppReady() {
  return MiniKit.isInstalled();
}

function readMiniKitValue<T>(key: string): T | undefined {
  return (MiniKit as unknown as Record<string, T | undefined>)[key];
}

export function getWorldMiniAppContext(): WorldMiniAppContext {
  const user = readMiniKitValue<{
    permissions?: WorldPermissionSnapshot;
    profilePictureUrl?: string;
    username?: string;
    walletAddress?: string;
  } | null>("user");
  const deviceProperties = readMiniKitValue<{
    deviceOS?: string;
    safeAreaInsets?: {
      bottom: number;
      left: number;
      right: number;
      top: number;
    };
    worldAppVersion?: number;
  } | null>("deviceProperties");

  return {
    deviceOS: deviceProperties?.deviceOS,
    launchLocation: readMiniKitValue<string | null>("location") ?? null,
    permissions: user?.permissions,
    profilePictureUrl: user?.profilePictureUrl,
    safeAreaInsets: deviceProperties?.safeAreaInsets,
    username: user?.username,
    walletAddress: user?.walletAddress,
    worldAppVersion: deviceProperties?.worldAppVersion,
  };
}

export async function getWorldUserByAddress(
  address?: string,
): Promise<WorldUserProfile | null> {
  if (!address) {
    return null;
  }

  try {
    return await MiniKit.getUserByAddress(address);
  } catch {
    return null;
  }
}

export async function getWorldPermissions() {
  const miniKitWithPermissions = MiniKit as unknown as {
    getPermissions?: (input?: Record<string, never>) => Promise<{
      data?: {
        permissions?: WorldPermissionSnapshot;
        status?: string;
        timestamp?: string;
        version?: number;
      };
      executedWith?: string;
    }>;
  };

  if (!miniKitWithPermissions.getPermissions) {
    return {
      executedWith: "fallback",
      data: {
        permissions: getWorldMiniAppContext().permissions ?? {},
        status: "success",
        timestamp: new Date().toISOString(),
        version: 1,
      },
    };
  }

  return miniKitWithPermissions.getPermissions({});
}

export async function authenticateHumanWallet() {
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
      message: "Add NEXT_PUBLIC_HUMANCHAIN_TREASURY before live World payments.",
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
  });

  if (payment.executedWith === "fallback") {
    return {
      ok: false,
      pendingWorldApp: true,
      payment,
      message: "World payments must be completed inside World App before this is treated as paid.",
    };
  }

  const confirmationResponse = await fetch("/api/world/confirm-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      feature,
      payload: payment.data,
      reference: referencePayload.reference,
      token,
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
    ok: true,
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
