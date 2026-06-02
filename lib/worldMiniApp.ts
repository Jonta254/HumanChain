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
};

const worldUserCache = new Map<
  string,
  {
    expiresAt: number;
    promise: Promise<WorldUserProfile | null>;
  }
>();

const worldUserCacheMs = 5 * 60 * 1000;

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
  pendingNotifications?: number;
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

type RawWorldAppContext = {
  device_os?: string;
  location?: {
    open_origin?: string;
  } | null;
  pending_notifications?: number;
  preferred_currency?: string;
  safe_area_insets?: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
  wallet_address?: string;
  world_app_version?: number;
};

type RawMiniKitUser = {
  pendingNotifications?: number;
  pending_notifications?: number;
  permissions?: WorldPermissionSnapshot;
  profilePictureUrl?: string;
  profile_picture_url?: string;
  username?: string;
  walletAddress?: string;
  wallet_address?: string;
};

type RawWorldUserProfile =
  | (WorldUserProfile & {
      profile_picture_url?: string;
      wallet_address?: string;
    })
  | {
      data?: WorldUserProfile & {
        profile_picture_url?: string;
        wallet_address?: string;
      };
    }
  | null
  | undefined;

export function isWorldMiniAppReady() {
  return MiniKit.isInstalled();
}

function getActiveMiniKitValue<T>(key: string): T | undefined {
  if (typeof window !== "undefined") {
    const activeMiniKit = (window as unknown as {
      MiniKit?: Record<string, T | undefined>;
    }).MiniKit;
    const activeValue = activeMiniKit?.[key];

    if (activeValue !== undefined && activeValue !== null) {
      return activeValue;
    }
  }

  return undefined;
}

function readMiniKitValue<T>(key: string): T | undefined {
  return (
    getActiveMiniKitValue<T>(key) ??
    (MiniKit as unknown as Record<string, T | undefined>)[key]
  );
}

function normalizeWorldUserProfile(profile: RawWorldUserProfile): WorldUserProfile | null {
  const profileRecord = profile as Record<string, unknown> | null | undefined;
  const candidate = (
    profileRecord && "data" in profileRecord
      ? (profileRecord.data as RawWorldUserProfile)
      : profile
  ) as
    | (WorldUserProfile & {
        profile_picture_url?: string;
        wallet_address?: string;
      })
    | null
    | undefined;

  if (!candidate) {
    return null;
  }

  return {
    profilePictureUrl: candidate.profilePictureUrl ?? candidate.profile_picture_url,
    username: candidate.username,
    walletAddress: candidate.walletAddress ?? candidate.wallet_address,
  };
}

export function getWorldMiniAppContext(): WorldMiniAppContext {
  const rawWorldApp =
    typeof window === "undefined"
      ? undefined
      : (window as unknown as { WorldApp?: RawWorldAppContext }).WorldApp;
  const user = readMiniKitValue<RawMiniKitUser | null>("user");
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
    deviceOS: deviceProperties?.deviceOS ?? rawWorldApp?.device_os,
    launchLocation:
      readMiniKitValue<string | null>("location") ??
      rawWorldApp?.location?.open_origin ??
      null,
    permissions: user?.permissions,
    pendingNotifications:
      user?.pendingNotifications ??
      user?.pending_notifications ??
      rawWorldApp?.pending_notifications,
    profilePictureUrl: user?.profilePictureUrl ?? user?.profile_picture_url,
    safeAreaInsets: deviceProperties?.safeAreaInsets ?? rawWorldApp?.safe_area_insets,
    username: user?.username,
    walletAddress: user?.walletAddress ?? user?.wallet_address ?? rawWorldApp?.wallet_address,
    worldAppVersion: deviceProperties?.worldAppVersion ?? rawWorldApp?.world_app_version,
  };
}

export async function getWorldUserByAddress(
  address?: string,
): Promise<WorldUserProfile | null> {
  if (!address) {
    return null;
  }

  const cacheKey = address.toLowerCase();
  const cached = worldUserCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  const promise = resolveWorldUserByAddress(address);

  worldUserCache.set(cacheKey, {
    expiresAt: Date.now() + worldUserCacheMs,
    promise,
  });

  const profile = await promise;

  if (!profile?.username) {
    worldUserCache.delete(cacheKey);
  }

  return profile;
}

async function resolveWorldUserByAddress(address: string) {
  const fromMiniKit = await MiniKit.getUserByAddress(address)
    .then((profile) => normalizeWorldUserProfile(profile))
    .catch(() => null);

  if (fromMiniKit?.username) {
    return fromMiniKit;
  }

  const fromHumanChainApi = await fetch("/api/world/user-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  })
    .then(async (response) => {
      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as {
        profile?: RawWorldUserProfile;
      };

      return normalizeWorldUserProfile(payload.profile);
    })
    .catch(() => null);

  return fromHumanChainApi?.username ? fromHumanChainApi : fromMiniKit;
}

export async function getWorldPermissions() {
  if (!isWorldMiniAppReady()) {
    return {
      executedWith: "fallback",
      data: {
        permissions: getWorldMiniAppContext().permissions ?? {},
        status: "unavailable",
        timestamp: new Date().toISOString(),
        version: 1,
      },
    };
  }

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
    recipient: treasuryAddress,
  };
}

export async function requestWorldPermission(permission: Permission) {
  if (!isWorldMiniAppReady()) {
    return {
      executedWith: "fallback",
      data: {
        permission,
        status: "unavailable",
        version: 1,
        timestamp: new Date().toISOString(),
      },
    };
  }

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
