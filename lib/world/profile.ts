"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { Permission } from "@worldcoin/minikit-js/commands";
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

function hasWorldProfileData(profile: WorldUserProfile | null | undefined) {
  return Boolean(profile?.username || profile?.profilePictureUrl || profile?.walletAddress);
}

function mergeWorldUserProfiles(
  ...profiles: Array<WorldUserProfile | null | undefined>
): WorldUserProfile | null {
  const merged = profiles.reduce<WorldUserProfile>((current, profile) => ({
    profilePictureUrl: current.profilePictureUrl ?? profile?.profilePictureUrl,
    username: current.username ?? profile?.username,
    walletAddress: current.walletAddress ?? profile?.walletAddress,
  }), {});

  return hasWorldProfileData(merged) ? merged : null;
}

function getCurrentMiniKitUserProfile(address?: string): WorldUserProfile | null {
  const context = getWorldMiniAppContext();
  const contextWallet = context.walletAddress;

  if (address && contextWallet && contextWallet.toLowerCase() !== address.toLowerCase()) {
    return null;
  }

  return mergeWorldUserProfiles({
    profilePictureUrl: context.profilePictureUrl,
    username: context.username,
    walletAddress: contextWallet ?? address,
  });
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
  const fromCurrentUser = getCurrentMiniKitUserProfile(address);
  const fromMiniKitAddress = await MiniKit.getUserByAddress(address)
    .then((profile) => normalizeWorldUserProfile(profile))
    .catch(() => null);

  const username = fromMiniKitAddress?.username ?? fromCurrentUser?.username;
  const fromMiniKitUsername = username
    ? await getWorldUserByUsername(username).catch(() => null)
    : null;
  const fromUsernamesApi = await fetchWorldUserProfileByAddress(address);

  return mergeWorldUserProfiles(
    fromCurrentUser,
    fromMiniKitAddress,
    fromMiniKitUsername,
    fromUsernamesApi,
  );
}

export async function getWorldUserByUsername(username?: string): Promise<WorldUserProfile | null> {
  const normalizedUsername = username?.trim().replace(/^@+/, "");

  if (!normalizedUsername) {
    return null;
  }

  const miniKitWithUsernameLookup = MiniKit as unknown as {
    getUserByUsername?: (input: string) => Promise<RawWorldUserProfile>;
  };

  if (!miniKitWithUsernameLookup.getUserByUsername) {
    return null;
  }

  return miniKitWithUsernameLookup.getUserByUsername(normalizedUsername)
    .then((profile) => normalizeWorldUserProfile(profile))
    .catch(() => null);
}

async function fetchWorldUserProfileByAddress(address: string) {
  return fetch("/api/world/user-profile", {
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
      status: "unavailable",
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

  return miniKitWithPermissions.getPermissions({}).catch(() => ({
    executedWith: "fallback",
    data: {
      permissions: getWorldMiniAppContext().permissions ?? {},
      status: "unavailable",
      timestamp: new Date().toISOString(),
      version: 1,
    },
  }));
}
