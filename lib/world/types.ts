"use client";

import type { HumanChainPaymentToken } from "@/lib/worldPayments";

export type WorldPaymentInput = {
  amount: number;
  description: string;
  feature: string;
  token?: HumanChainPaymentToken;
};

// Matches the actual shape returned by createSuccessResponse/createErrorResponse
// (lib/api/responses.ts) — NOT a flat { ok, error } shape. Error text is in
// `message`, not `error`; success payloads are nested under `data`, and
// "setup incomplete" is signalled via `code`, not a boolean `pendingSetup`.
export type WorldPaymentConfirmation = {
  code?: string;
  message?: string;
  ok?: boolean;
  retryable?: boolean;
  data?: {
    reference?: string;
    feature?: string;
    amount?: number;
    token?: string;
    treasury?: string;
  };
};

export type WorldShareInput = {
  text: string;
  title: string;
  url?: string;
};

export type WorldChatInput = {
  message: string;
  to?: string[];
};

export type WorldPermissionSnapshot = {
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

export type RawWorldAppContext = {
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

export type RawMiniKitUser = {
  pendingNotifications?: number;
  pending_notifications?: number;
  permissions?: WorldPermissionSnapshot;
  profilePictureUrl?: string;
  profile_picture_url?: string;
  username?: string;
  walletAddress?: string;
  wallet_address?: string;
};

export type RawWorldUserProfile =
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
