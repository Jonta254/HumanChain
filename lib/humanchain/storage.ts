"use client";

export const storageKeys = {
  appMemory: "humanchain_app_memory",
  askCountryRoutes: "humanchain_ask_country_routes",
  joinDate: "humanchain_join_date",
  askThreads: "humanchain_ask_threads",
  bids: "humanchain_market_bids",
  chainComments: "humanchain_chain_comments",
  chainPremium: "humanchain_chain_premium",
  history: "humanchain_history",
  hpLedger: "humanchain_hp_ledger",
  links: "humanchain_links",
  marketComments: "humanchain_market_comments",
  marketHolds: "humanchain_market_holds",
  marketRatings: "humanchain_market_ratings",
  marketplace: "humanchain_marketplace",
  momentReactions: "humanchain_moment_reactions",
  notifications: "humanchain_notifications",
  posts: "humanchain_posts",
  profileImage: "humanchain_profile_image",
  referralBonusAwarded: "humanchain_referral_bonus_awarded",
  referralBy: "humanchain_referral_by",
  referralShareCount: "humanchain_referral_share_count",
  userStories: "humanchain_user_stories",
  lastStreakDate: "humanchain_last_streak_date",
  jobApplications: "hc_job_applications",
  answerReactions: "humanchain_answer_reactions",
  savedThreadIds: "humanchain_saved_threads",
  savedStoryIds: "humanchain_saved_story_ids",
  streakFreezeUsed: "humanchain_streak_freeze_used",
  milestonesSeen: "humanchain_milestones_seen",
} as const;

export function loadJsonFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(key);

    return storedValue ? (JSON.parse(storedValue) as T) : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

export function saveJsonToStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded — shed the largest arrays and retry once.
    try {
      evictLargestArrays(3 * 1024 * 1024);
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
}

export function loadLocalRecord<T>(key: string, fallback: T) {
  return loadJsonFromStorage<T>(key, fallback);
}

// Trim an array stored at `key` to at most `maxItems` most-recent entries.
// Call after any append to keep iOS 5 MB localStorage quota safe.
export function compactStorageArray(key: string, maxItems: number) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return;
    const arr = JSON.parse(raw) as unknown[];
    if (Array.isArray(arr) && arr.length > maxItems) {
      window.localStorage.setItem(key, JSON.stringify(arr.slice(0, maxItems)));
    }
  } catch {
    // Ignore parse errors — the next write will overwrite.
  }
}

// Returns approximate localStorage usage in bytes (sum of key + value lengths × 2 for UTF-16).
export function storageUsageBytes(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i) ?? "";
      total += (k.length + (window.localStorage.getItem(k)?.length ?? 0)) * 2;
    }
  } catch { /* ignore */ }
  return total;
}

// Evict the largest HumanChain array keys until usage drops below `targetBytes`.
export function evictLargestArrays(targetBytes = 3 * 1024 * 1024) {
  if (typeof window === "undefined") return;
  const HCPrefix = "humanchain_";
  while (storageUsageBytes() > targetBytes) {
    let biggestKey = "";
    let biggestSize = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i) ?? "";
      if (!k.startsWith(HCPrefix)) continue;
      const size = (window.localStorage.getItem(k)?.length ?? 0) * 2;
      if (size > biggestSize) { biggestSize = size; biggestKey = k; }
    }
    if (!biggestKey) break;
    // Trim array to half its entries rather than deleting outright.
    try {
      const arr = JSON.parse(window.localStorage.getItem(biggestKey) ?? "null") as unknown[];
      if (Array.isArray(arr) && arr.length > 10) {
        window.localStorage.setItem(biggestKey, JSON.stringify(arr.slice(0, Math.floor(arr.length / 2))));
      } else {
        window.localStorage.removeItem(biggestKey);
      }
    } catch {
      window.localStorage.removeItem(biggestKey);
    }
  }
}
