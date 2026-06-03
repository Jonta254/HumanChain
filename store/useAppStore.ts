"use client";

import { create } from "zustand";
import { getWorldMiniAppContext } from "@/lib/world/context";
import type { ChainLink, ChainPremiumState } from "@/types/chain";
import type { DailyResponse, HumanPost, UserStory } from "@/types/content";
import type { HistoryRecord, HpLedgerRecord } from "@/types/reputation";
import type { MarketBid, MarketHold, MarketLocationState, MarketplaceListing } from "@/types/market";
import type { NotificationItem, PaymentRequest, Tab, Toast } from "@/types/ui";
import type { VerifiedHuman } from "@/types/user";
import type { WorldMiniAppContext } from "@/lib/world/types";
import type { HumanChainPaymentToken } from "@/lib/worldPayments";

type AccountSyncStatus = "idle" | "loading" | "ready" | "saving" | "offline";

export type AppStore = {
  // Navigation
  tab: Tab;
  setTab: (tab: Tab) => void;
  chainEntryNonce: number;
  bumpChainEntry: () => void;

  // UI feedback
  toast: Toast | null;
  setToast: (toast: Toast | null) => void;

  // Notification center
  notificationCenterOpen: boolean;
  setNotificationCenterOpen: (open: boolean) => void;
  notificationPromptDismissed: boolean;
  setNotificationPromptDismissed: (dismissed: boolean) => void;

  // Identity
  verifiedHuman: VerifiedHuman | null;
  setVerifiedHuman: (human: VerifiedHuman | null) => void;
  gateBusy: boolean;
  setGateBusy: (busy: boolean) => void;
  profileImage: string | null;
  setProfileImage: (url: string | null) => void;

  // World App context
  worldContext: WorldMiniAppContext;
  setWorldContext: (ctx: WorldMiniAppContext) => void;

  // Notifications
  notificationReady: boolean;
  setNotificationReady: (ready: boolean) => void;
  notificationWelcomeSent: boolean;
  setNotificationWelcomeSent: (sent: boolean) => void;
  notifications: NotificationItem[];
  setNotifications: (items: NotificationItem[]) => void;

  // Reputation / points
  streak: number;
  setStreak: (streak: number) => void;
  savedItems: number;
  setSavedItems: (count: number) => void;
  points: number;
  setPoints: (points: number) => void;
  hpLedger: HpLedgerRecord[];
  setHpLedger: (ledger: HpLedgerRecord[]) => void;

  // Daily
  dailyAnswered: boolean;
  setDailyAnswered: (answered: boolean) => void;
  dailyAnsweredAt: string | null;
  setDailyAnsweredAt: (at: string | null) => void;
  dailyAnsweredDate: string | null;
  setDailyAnsweredDate: (date: string | null) => void;
  lastCheckInAt: string | null;
  setLastCheckInAt: (at: string | null) => void;
  lastCheckInDate: string | null;
  setLastCheckInDate: (date: string | null) => void;
  dailyResponses: DailyResponse[];
  setDailyResponses: (responses: DailyResponse[]) => void;

  // Chain
  links: ChainLink[];
  setLinks: (links: ChainLink[]) => void;
  chainPremium: ChainPremiumState;
  setChainPremium: (state: ChainPremiumState) => void;

  // Posts / content
  humanPosts: HumanPost[];
  setHumanPosts: (posts: HumanPost[]) => void;
  userStories: UserStory[];
  setUserStories: (stories: UserStory[]) => void;

  // Market
  marketplaceListings: MarketplaceListing[];
  setMarketplaceListings: (listings: MarketplaceListing[]) => void;
  marketLocation: MarketLocationState;
  setMarketLocation: (location: MarketLocationState) => void;
  marketBids: Record<string, MarketBid[]>;
  setMarketBids: (bids: Record<string, MarketBid[]>) => void;
  marketHolds: MarketHold[];
  setMarketHolds: (holds: MarketHold[]) => void;
  marketRatings: Record<string, { rating: number; tips: number }>;
  setMarketRatings: (ratings: Record<string, { rating: number; tips: number }>) => void;

  // History
  historyRecords: HistoryRecord[];
  setHistoryRecords: (records: HistoryRecord[]) => void;

  // Payments
  paymentPrompt: PaymentRequest | null;
  setPaymentPrompt: (prompt: PaymentRequest | null) => void;
  paymentToken: HumanChainPaymentToken;
  paymentBusy: boolean;
  setPaymentBusy: (busy: boolean) => void;

  // Account sync
  accountSyncReady: boolean;
  setAccountSyncReady: (ready: boolean) => void;
  accountSyncStatus: AccountSyncStatus;
  setAccountSyncStatus: (status: AccountSyncStatus) => void;
  feedRefreshNonce: number;
  bumpFeedRefresh: () => void;
};

export const useAppStore = create<AppStore>()((set) => ({
  // Navigation
  tab: "home",
  setTab: (tab) => set({ tab }),
  chainEntryNonce: 0,
  bumpChainEntry: () => set((s) => ({ chainEntryNonce: s.chainEntryNonce + 1 })),

  // UI feedback
  toast: null,
  setToast: (toast) => set({ toast }),

  // Notification center
  notificationCenterOpen: false,
  setNotificationCenterOpen: (notificationCenterOpen) => set({ notificationCenterOpen }),
  notificationPromptDismissed: false,
  setNotificationPromptDismissed: (notificationPromptDismissed) =>
    set({ notificationPromptDismissed }),

  // Identity
  verifiedHuman: null,
  setVerifiedHuman: (verifiedHuman) => set({ verifiedHuman }),
  gateBusy: false,
  setGateBusy: (gateBusy) => set({ gateBusy }),
  profileImage: null,
  setProfileImage: (profileImage) => set({ profileImage }),

  // World App context
  worldContext: getWorldMiniAppContext(),
  setWorldContext: (worldContext) => set({ worldContext }),

  // Notifications
  notificationReady: false,
  setNotificationReady: (notificationReady) => set({ notificationReady }),
  notificationWelcomeSent: false,
  setNotificationWelcomeSent: (notificationWelcomeSent) => set({ notificationWelcomeSent }),
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),

  // Reputation / points
  streak: 0,
  setStreak: (streak) => set({ streak }),
  savedItems: 0,
  setSavedItems: (savedItems) => set({ savedItems }),
  points: 0,
  setPoints: (points) => set({ points }),
  hpLedger: [],
  setHpLedger: (hpLedger) => set({ hpLedger }),

  // Daily
  dailyAnswered: false,
  setDailyAnswered: (dailyAnswered) => set({ dailyAnswered }),
  dailyAnsweredAt: null,
  setDailyAnsweredAt: (dailyAnsweredAt) => set({ dailyAnsweredAt }),
  dailyAnsweredDate: null,
  setDailyAnsweredDate: (dailyAnsweredDate) => set({ dailyAnsweredDate }),
  lastCheckInAt: null,
  setLastCheckInAt: (lastCheckInAt) => set({ lastCheckInAt }),
  lastCheckInDate: null,
  setLastCheckInDate: (lastCheckInDate) => set({ lastCheckInDate }),
  dailyResponses: [],
  setDailyResponses: (dailyResponses) => set({ dailyResponses }),

  // Chain
  links: [],
  setLinks: (links) => set({ links }),
  chainPremium: { circleCreated: false, pulseUnlocked: false },
  setChainPremium: (chainPremium) => set({ chainPremium }),

  // Posts / content
  humanPosts: [],
  setHumanPosts: (humanPosts) => set({ humanPosts }),
  userStories: [],
  setUserStories: (userStories) => set({ userStories }),

  // Market
  marketplaceListings: [],
  setMarketplaceListings: (marketplaceListings) => set({ marketplaceListings }),
  marketLocation: {
    label: "Not set",
    source: "not-requested",
    status: "idle",
  },
  setMarketLocation: (marketLocation) => set({ marketLocation }),
  marketBids: {},
  setMarketBids: (marketBids) => set({ marketBids }),
  marketHolds: [],
  setMarketHolds: (marketHolds) => set({ marketHolds }),
  marketRatings: {},
  setMarketRatings: (marketRatings) => set({ marketRatings }),

  // History
  historyRecords: [],
  setHistoryRecords: (historyRecords) => set({ historyRecords }),

  // Payments
  paymentPrompt: null,
  setPaymentPrompt: (paymentPrompt) => set({ paymentPrompt }),
  paymentToken: "WLD",
  paymentBusy: false,
  setPaymentBusy: (paymentBusy) => set({ paymentBusy }),

  // Account sync
  accountSyncReady: false,
  setAccountSyncReady: (accountSyncReady) => set({ accountSyncReady }),
  accountSyncStatus: "idle",
  setAccountSyncStatus: (accountSyncStatus) => set({ accountSyncStatus }),
  feedRefreshNonce: 0,
  bumpFeedRefresh: () => set((s) => ({ feedRefreshNonce: s.feedRefreshNonce + 1 })),
}));
