"use client";

import { getWorldMiniAppContext } from "@/lib/world/context";
import { humanChainErrorStates } from "@/lib/humanchainPolicy";
import {
  humanChainPaymentTokens,
  normalizePaymentFeature,
  type HumanChainPaymentToken,
} from "@/lib/worldPayments";
import type { HumanIdentity, VerifiedHuman } from "@/types/user";
import type { HistoryRecord } from "@/types/reputation";
import type { PaymentRequest } from "@/types/ui";

// Identity helpers

export function isVerifiedWorldHuman(human: HumanIdentity | null) {
  return Boolean(human?.wallet && ("mode" in human ? human.mode === "world" : true));
}

export function getTrustPassportMetrics({
  completedTrades,
  human,
  points,
  posts,
  savedItems,
  streak,
}: {
  completedTrades: number;
  human: HumanIdentity | null;
  points: number;
  posts: number;
  savedItems: number;
  streak: number;
}) {
  const helpfulScore = Math.min(99, Math.max(12, Math.round(points / 12) + savedItems * 2));

  return {
    completedTrades,
    disputeRate: completedTrades > 0 ? "0%" : "n/a",
    helpfulScore,
    identityTier: isVerifiedWorldHuman(human) ? "Verified human" : "Preview only",
    moderationState: "Clear",
    streak,
    tenure: "Launch member",
    tradeScore: Math.min(99, completedTrades * 12 + posts * 2),
    verification: isVerifiedWorldHuman(human) ? "World verified" : "World verification required",
  };
}

export function getMarketVerificationTier({
  isVerified,
  listingCount,
  locationReady,
  ratingCount,
  tipCount,
}: {
  isVerified: boolean;
  listingCount: number;
  locationReady: boolean;
  ratingCount: number;
  tipCount: number;
}) {
  const usageScore =
    (isVerified ? 30 : 0) +
    (locationReady ? 18 : 0) +
    Math.min(30, listingCount * 10) +
    Math.min(14, ratingCount * 2) +
    Math.min(8, tipCount * 2);

  if (usageScore >= 72) {
    return {
      className: "gold",
      label: "Gold verified",
      next: "Top seller signal active",
      score: usageScore,
    };
  }

  if (usageScore >= 48) {
    return {
      className: "silver",
      label: "Silver verified",
      next: "More successful listings move this to gold",
      score: usageScore,
    };
  }

  return {
    className: "bronze",
    label: "Bronze verified",
    next: "Add listings, location, and buyer signals to reach silver",
    score: usageScore,
  };
}

export function requireVerifiedPublicAction(
  human: HumanIdentity | null,
  act: (title: string, detail: string) => void,
  action = "publish publicly",
) {
  if (isVerifiedWorldHuman(human)) {
    return true;
  }

  void humanChainErrorStates.world_id_required;
  act(
    "World verification required",
    `Continue with World App first. After verification, ${action} works immediately.`,
  );
  return false;
}

// Reputation score — single source of truth used by HomeView and MeView.
// Formula: 1 point every 4 HP + 7 per streak day + 12 per post + 5 per saved item.
// No artificial floor so Home and Passport show the same number.
export function getChainScore({
  points, streak, posts, savedItems,
}: {
  points: number;
  streak: number;
  posts: number;
  savedItems: number;
}) {
  return Math.round(points / 4) + streak * 7 + posts * 12 + savedItems * 5;
}

// Tier road — single source of truth for HomeView's reputation summary,
// MeView's score strip/Passport/Growth tabs, and any other place a tier
// label needs to be shown. Keeping this in one place prevents the label
// shown in one screen from silently drifting out of sync with another.
export const REP_TIERS = [
  { label: "Newcomer", min: 0,    color: "#5d6b66", bg: "#f0f4f2" },
  { label: "Bronze",   min: 200,  color: "#b88a1f", bg: "#fdf6e3" },
  { label: "Silver",   min: 420,  color: "#7a8fa6", bg: "#eef3f7" },
  { label: "Gold",     min: 720,  color: "#d4a820", bg: "#fdf3d4" },
  { label: "Platinum", min: 1150, color: "#6657d9", bg: "#f0eeff" },
  { label: "Founder",  min: 1800, color: "#137a57", bg: "#e6f5ee" },
] as const;

export function getReputationTier(score: number) {
  let idx = REP_TIERS.length - 1;
  while (idx > 0 && score < REP_TIERS[idx].min) idx--;
  const current = REP_TIERS[idx];
  const next = REP_TIERS[idx + 1] ?? null;
  const pct = next
    ? Math.min(100, Math.max(0, Math.round(((score - current.min) / (next.min - current.min)) * 100)))
    : 100;
  return {
    current, next,
    level: idx + 1,
    pct,
    toGo: next ? Math.max(0, next.min - score) : 0,
  };
}

export function getReputationHealth(score: number) {
  if (score >= 420) return { label: "Excellent", color: "#0f9d6c" };
  if (score >= 280) return { label: "Strong",   color: "#137a57" };
  if (score >= 180) return { label: "Healthy",  color: "#b88a1f" };
  return { label: "Building", color: "#6b7a73" };
}

// Text helpers

export function getShortText(value: string, limit = 96) {
  const normalized = value.trim().replace(/\s+/g, " ");

  return normalized.length > limit ? `${normalized.slice(0, limit - 1)}...` : normalized;
}

// Payment helpers

export function parsePaymentAmount(amount: string) {
  const parsed = Number.parseFloat(amount.replace(/,/g, "").trim());

  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function formatPaymentAmount(amount: number, token: HumanChainPaymentToken) {
  return `${amount} ${humanChainPaymentTokens[token].label}`;
}

export function getPaymentKind(feature: string): HistoryRecord["kind"] {
  return feature.startsWith("tip-") || feature.endsWith("-tip") ? "tip" : "payment";
}

export function getPaymentFeature(payment: PaymentRequest) {
  return normalizePaymentFeature(payment.feature ?? payment.title);
}

export function getPrimaryProfileImage(
  profileImage: string | null,
  human: HumanIdentity | null,
  worldContext: ReturnType<typeof getWorldMiniAppContext>,
) {
  const humanProfileImage =
    human && "profilePictureUrl" in human && typeof human.profilePictureUrl === "string"
      ? human.profilePictureUrl
      : undefined;

  return profileImage ?? humanProfileImage ?? worldContext.profilePictureUrl;
}

// Date / time helpers

export function formatWorldLaunchLocation(location?: string | null) {
  const labels: Record<string, string> = {
    "app-store": "App Store",
    chat: "World Chat",
    "deep-link": "deep link",
    home: "World Home",
    "wallet-tab": "wallet tab",
  };

  return location ? labels[location] ?? location : "World App preview";
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatCheckInTime(date = new Date()) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatShortTime(date = new Date()) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Username helpers

export function normalizeWorldUsername(username?: string) {
  const normalized = username?.trim().replace(/^@+/, "");

  return normalized ? `@${normalized}` : undefined;
}

export function isGeneratedHumanUsername(username?: string) {
  return Boolean(username?.startsWith("@human_"));
}

export function isWorldUsernamePlaceholder(username?: string) {
  return (
    !username ||
    username === "World username syncing" ||
    username === "Resolving World username" ||
    username === "World account pending" ||
    isGeneratedHumanUsername(username)
  );
}

export function getWorldDisplayUsername(
  worldContext: ReturnType<typeof getWorldMiniAppContext>,
  verifiedHuman?: VerifiedHuman | null,
) {
  return (
    normalizeWorldUsername(worldContext.username) ??
    (isWorldUsernamePlaceholder(verifiedHuman?.username)
      ? undefined
      : verifiedHuman?.username) ??
    (verifiedHuman?.wallet ? "Resolving World username" : "World account pending")
  );
}
