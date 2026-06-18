"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { Permission } from "@worldcoin/minikit-js/commands";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { RawWorldUserProfile, WorldPermissionSnapshot, WorldUserProfile } from "./types";
import { getWorldMiniAppContext, isWorldMiniAppReady } from "./context";

const worldUserCache = new Map<
  string,
  {
    expiresAt: number;
    promise: Promise<WorldUserProfile | null>;
  }
>();

const worldUserCacheMs = 5 * 60 * 1000;

export function normalizeWorldUserProfile(profile: RawWorldUserProfile): WorldUserProfile | null {
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

  const fromHumanChainApi = await fetchWithTimeout("/api/world/user-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
    timeoutMs: 6_000,
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
