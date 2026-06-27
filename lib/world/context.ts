"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import type {
  RawMiniKitUser,
  RawWorldAppContext,
  WorldMiniAppContext,
} from "./types";

export function isWorldMiniAppReady() {
  return MiniKit.isInstalled();
}

export function getActiveMiniKitValue<T>(key: string): T | undefined {
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

export function readMiniKitValue<T>(key: string): T | undefined {
  return (
    getActiveMiniKitValue<T>(key) ??
    (MiniKit as unknown as Record<string, T | undefined>)[key]
  );
}

function normalizeLaunchLocation(location?: string | null) {
  if (!location) {
    return null;
  }

  if (location === "deeplink") {
    return "deep-link";
  }

  if (location === "app_store") {
    return "app-store";
  }

  if (location === "wallet") {
    return "wallet-tab";
  }

  return location;
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

  const rawVerificationStatus = rawWorldApp?.verification_status;
  const userVerificationStatus = user?.verificationStatus ?? (
    user?.verification_status
      ? {
          isDocumentVerified: user.verification_status.is_document_verified,
          isOrbVerified: user.verification_status.is_orb_verified,
          isSecureDocumentVerified: user.verification_status.is_secure_document_verified,
        }
      : undefined
  );

  return {
    deviceOS: deviceProperties?.deviceOS ?? rawWorldApp?.device_os,
    launchLocation: normalizeLaunchLocation(
      readMiniKitValue<string | null>("location") ??
        rawWorldApp?.location?.open_origin ??
        null,
    ),
    permissions: user?.permissions,
    pendingNotifications:
      user?.pendingNotifications ??
      user?.pending_notifications ??
      rawWorldApp?.pending_notifications,
    profilePictureUrl: user?.profilePictureUrl ?? user?.profile_picture_url,
    safeAreaInsets: deviceProperties?.safeAreaInsets ?? rawWorldApp?.safe_area_insets,
    verificationStatus: userVerificationStatus ?? (
      rawVerificationStatus
        ? {
            isDocumentVerified: rawVerificationStatus.is_document_verified,
            isOrbVerified: rawVerificationStatus.is_orb_verified,
            isSecureDocumentVerified: rawVerificationStatus.is_secure_document_verified,
          }
        : undefined
    ),
    username: user?.username,
    walletAddress: user?.walletAddress ?? user?.wallet_address ?? rawWorldApp?.wallet_address,
    worldAppVersion: deviceProperties?.worldAppVersion ?? rawWorldApp?.world_app_version,
  };
}
