"use client";

export const storageKeys = {
  appMemory: "humanchain_app_memory",
  askCountryRoutes: "humanchain_ask_country_routes",
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
    return false;
  }
}

export function loadLocalRecord<T>(key: string, fallback: T) {
  return loadJsonFromStorage<T>(key, fallback);
}
