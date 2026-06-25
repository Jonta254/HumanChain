"use client";

import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { appLanguages } from "@/lib/data/languages";
import { firstRunNotifications } from "@/lib/data/notifications";
import { initialHumanPosts } from "@/lib/data/posts";
import { initialLinks } from "@/lib/data/chains";
import { marketplaceItems } from "@/lib/data/marketplace";
import { loadJsonFromStorage, storageKeys } from "@/lib/humanchain/storage";
import { getLocalDateKey, normalizeWorldUsername } from "@/lib/humanchain/utils";
import {
  getWorldMiniAppContext,
  getWorldUserByAddress,
} from "@/lib/worldMiniApp";
import type { ChainLink } from "@/types/chain";
import type { HumanPost } from "@/types/content";
import type { MarketBid, MarketplaceListing } from "@/types/market";
import type { HistoryRecord, HpLedgerRecord } from "@/types/reputation";
import type { NotificationItem, Tab } from "@/types/ui";
import type { AppMemory } from "@/types/user";

// ── Tab navigation ────────────────────────────────────────────────────────────

const appTabs = new Set<Tab>(["home", "ask", "market", "chains", "stories", "me", "settings", "create", "culture"]);

export function isAppTab(value: string | null): value is Tab {
  return Boolean(value && appTabs.has(value as Tab));
}

export function getTabFromUrl(): Tab {
  if (typeof window === "undefined") return "home";
  const requestedTab = new URLSearchParams(window.location.search).get("tab");
  return isAppTab(requestedTab) ? requestedTab : "home";
}

// ── Toast helpers ─────────────────────────────────────────────────────────────

export const importantToastTerms = [
  "confirmed", "payment", "failed", "error", "unavailable", "denied",
  "required", "deleted", "cleared", "stored", "published", "uploaded",
  "sent", "verified", "connected", "world chat", "local account",
  "notifications active", "open in world app",
  // Action feedback — without these, most user actions are completely silent
  "already", "streak", "bonus", "restored", "answered", "copied",
  "ready", "reset", "joined", "entered", "recorded",
];

// ── Notification helpers ──────────────────────────────────────────────────────

export function mergeFirstRunNotifications(current: NotificationItem[]): NotificationItem[] {
  const hasProfessionalWelcome = current.some(
    (n) => n.title === firstRunNotifications[0].title &&
      n.detail === firstRunNotifications[0].detail,
  );
  if (hasProfessionalWelcome) return current;

  const existingDetails = new Set(current.map((n) => n.detail));
  const missingFirstRun = firstRunNotifications.filter((n) => !existingDetails.has(n.detail));
  return [...missingFirstRun, ...current].slice(0, 60);
}

// ── World helpers ─────────────────────────────────────────────────────────────

export async function resolveWorldProfileAfterAuth(address: string) {
  const snapshots: Array<ReturnType<typeof getWorldMiniAppContext>> = [getWorldMiniAppContext()];
  let worldUser = await getWorldUserByAddress(address);

  if (!snapshots[0].username && !worldUser?.username) {
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    snapshots.push(getWorldMiniAppContext());
    worldUser = (await getWorldUserByAddress(address)) ?? worldUser;
  }

  if (!snapshots.some((s) => s.username) && !worldUser?.username) {
    await new Promise((resolve) => window.setTimeout(resolve, 1200));
    snapshots.push(getWorldMiniAppContext());
    worldUser = (await getWorldUserByAddress(address)) ?? worldUser;
  }

  const latestContext = snapshots.at(-1) ?? snapshots[0];
  const username = normalizeWorldUsername(
    worldUser?.username ??
      latestContext.username ??
      snapshots.find((s) => s.username)?.username,
  );
  const profilePictureUrl =
    latestContext.profilePictureUrl ??
    worldUser?.profilePictureUrl ??
    snapshots.find((s) => s.profilePictureUrl)?.profilePictureUrl;

  return { context: latestContext, profilePictureUrl, username };
}

export function scrollMiniAppToTop() {
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => {
    window.scrollTo({ left: 0, top: 0, behavior: "auto" });
    document.querySelectorAll<HTMLElement>(".phone-frame, .screen").forEach((el) => {
      el.scrollTo({ left: 0, top: 0, behavior: "auto" });
    });
  });
}

export function isWorldPermissionGranted(result: unknown) {
  const r = result as { data?: { status?: string }; executedWith?: string } | undefined;
  return (
    r?.executedWith !== "fallback" &&
    ["success", "already_granted"].includes(r?.data?.status ?? "")
  );
}

// ── Timing constants ──────────────────────────────────────────────────────────

export const worldProfileRefreshMs = 10 * 60 * 1000;
export const worldProfileFocusCooldownMs = 2 * 60 * 1000;
export const publicFeedRefreshMs = 5 * 60 * 1000;
export const publicFeedFocusCooldownMs = 2 * 60 * 1000;
export const worldNotificationCooldownMs = 60 * 60 * 1000;

export function canSendWorldNotificationOnce(
  wallet: string,
  sector: string,
  title: string,
  cooldownMs = worldNotificationCooldownMs,
) {
  try {
    const key = `humanchain_notification_sent:${wallet.toLowerCase()}:${sector}:${title}`;
    const lastSentAt = Number(window.localStorage.getItem(key) ?? 0);
    if (Number.isFinite(lastSentAt) && Date.now() - lastSentAt < cooldownMs) return false;
    window.localStorage.setItem(key, Date.now().toString());
    return true;
  } catch {
    return true;
  }
}

// ── Data storage helpers ──────────────────────────────────────────────────────

export async function storeSafeData(
  kind: "post" | "marketplace-listing" | "marketplace-bid" | "payment" | "story",
  id: number | string,
  data: unknown,
) {
  try {
    const response = await fetchWithTimeout("/api/data/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, id, kind }),
      timeoutMs: 8_000,
    });
    const payload = (await response.json()) as { ok?: boolean; pendingSetup?: boolean; url?: string };
    return { ok: Boolean(payload.ok && payload.url), pendingSetup: Boolean(payload.pendingSetup), url: payload.url };
  } catch {
    return { ok: false, pendingSetup: false, url: undefined };
  }
}

// ── Storage loaders ───────────────────────────────────────────────────────────

export function getInitialMarketBids(): Record<string, MarketBid[]> {
  return Object.fromEntries(
    marketplaceItems.map((item) => [
      item.title,
      (item.bidding?.offers ?? []).map((offer) => ({
        ...offer,
        createdAt: "Seed",
        id: Math.round((offer.amount + item.title.length) * 1000),
        status: "sent" as const,
      })),
    ]),
  );
}

export function loadStoredHumanPosts(): HumanPost[] {
  if (typeof window === "undefined") return initialHumanPosts;
  const storedPosts = loadJsonFromStorage<HumanPost[]>(storageKeys.posts, []);
  const ownedPosts = storedPosts.filter((p) => p.owner);
  const customPublicPosts = storedPosts.filter(
    (p) => !p.owner && !initialHumanPosts.some((s) => s.id === p.id),
  );
  return [...ownedPosts, ...initialHumanPosts, ...customPublicPosts];
}

export function loadStoredMarketplaceListings(): MarketplaceListing[] {
  if (typeof window === "undefined") return [];
  return loadJsonFromStorage<Partial<MarketplaceListing>[]>(storageKeys.marketplace, []).map(
    (listing) => ({
      id: listing.id ?? Date.now(),
      seller: listing.seller ?? "@you",
      sellerWallet: listing.sellerWallet,
      title: listing.title ?? "Untitled marketplace listing",
      price: listing.price ?? "Price not set",
      bidFloor: listing.bidFloor ?? "",
      duration: listing.duration ?? "3 days",
      saleMode: listing.saleMode ?? "direct",
      condition: listing.condition ?? "Condition not set",
      area: listing.area ?? "Nearby area not set",
      link: listing.link ?? "",
      details: listing.details ?? "",
      photos: listing.photos ?? [],
      ratings: listing.ratings ?? 0,
      tips: listing.tips ?? 0,
      status: listing.status ?? "payment-ready",
      createdAt: listing.createdAt ?? "Stored locally",
      dataReceiptUrl: listing.dataReceiptUrl,
      dataStorageStatus: listing.dataStorageStatus ?? "local-safe",
    }),
  );
}

export function loadStoredChainLinks(): ChainLink[] {
  if (typeof window === "undefined") return initialLinks;
  return loadJsonFromStorage<ChainLink[]>(storageKeys.links, initialLinks);
}

export function loadStoredHistoryRecords(): HistoryRecord[] {
  const fallbackRecord: HistoryRecord[] = [{
    id: 1, title: "HumanChain opened", detail: "Your chain history starts here.", time: "Today", kind: "profile",
  }];
  if (typeof window === "undefined") return fallbackRecord;
  return loadJsonFromStorage<HistoryRecord[]>(storageKeys.history, fallbackRecord);
}

export function loadStoredNotifications(): NotificationItem[] {
  return mergeFirstRunNotifications(
    loadJsonFromStorage<NotificationItem[]>(storageKeys.notifications, firstRunNotifications),
  );
}

export function loadStoredHpLedger(): HpLedgerRecord[] {
  return loadJsonFromStorage<HpLedgerRecord[]>(storageKeys.hpLedger, []);
}

function detectLocaleLanguageCode(): string {
  if (typeof navigator === "undefined") return appLanguages[0].code;
  const preferred = (navigator.language ?? "en").slice(0, 2).toLowerCase();
  const match = appLanguages.find((l) => l.code === preferred);
  return match ? match.code : appLanguages[0].code;
}

export function loadStoredAppMemory(): AppMemory {
  const fallback: AppMemory = {
    appLanguageCode: detectLocaleLanguageCode(),
    dailyAnswered: false,
    dailyAnsweredAt: null,
    dailyAnsweredDate: null,
    joinedAt: null,
    lastCheckInAt: null,
    lastCheckInDate: null,
    marketLocation: { label: "Location not shared", source: "not-requested", status: "idle" },
    notificationReady: false,
    notificationWelcomeSent: false,
    points: 420,
    savedItems: 3,
    streak: 4,
    verifiedHuman: null,
  };
  const stored = loadJsonFromStorage<Partial<AppMemory>>(storageKeys.appMemory, fallback);
  return {
    ...fallback,
    ...stored,
    dailyAnswered: stored.dailyAnsweredDate === getLocalDateKey() ? Boolean(stored.dailyAnswered) : false,
    dailyAnsweredAt: stored.dailyAnsweredDate === getLocalDateKey() ? (stored.dailyAnsweredAt ?? null) : null,
    dailyAnsweredDate: stored.dailyAnsweredDate === getLocalDateKey() ? stored.dailyAnsweredDate : null,
    marketLocation: stored.marketLocation ?? fallback.marketLocation,
    notificationWelcomeSent: Boolean(stored.notificationWelcomeSent),
    verifiedHuman: stored.verifiedHuman ?? fallback.verifiedHuman,
  };
}
