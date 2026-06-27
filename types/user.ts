import type { AskThread, ChainLink, ChainPremiumState } from "./chain";
import type { HistoryRecord } from "./reputation";
import type { HumanPost, UserStory } from "./content";
import type { MarketBid, MarketHold, MarketLocationState, MarketplaceListing } from "./market";
import type { NotificationItem } from "./ui";

export type VerifiedHuman = {
  authenticatedAt?: string;
  deviceOS?: string;
  lastSeenAt?: string;
  launchLocation?: string | null;
  profilePictureUrl?: string;
  sessionVersion?: 1;
  username: string;
  verificationSource?: "wallet-auth";
  wallet?: string;
  worldAppVersion?: number;
  mode: "world" | "preview";
};

export type HumanIdentity = {
  username: string;
  wallet?: string;
};

export type WorldHumanSession = {
  appVersion: 1;
  authenticatedAt: string;
  deviceOS?: string;
  lastSeenAt: string;
  launchLocation?: string | null;
  mode: "world";
  profilePictureUrl?: string;
  username: string;
  verificationSource: "wallet-auth";
  wallet: string;
  worldAppVersion?: number;
};

export type WorldHumanProofEvent = {
  action: string;
  signal?: string;
  verifiedAt: string;
};

export type AppMemory = {
  appLanguageCode: string;
  dailyAnswered: boolean;
  dailyAnsweredAt: string | null;
  dailyAnsweredDate: string | null;
  lastCheckInAt: string | null;
  lastCheckInDate: string | null;
  marketLocation: MarketLocationState;
  notificationReady: boolean;
  notificationWelcomeSent: boolean;
  points: number;
  savedItems: number;
  streak: number;
  verifiedHuman: VerifiedHuman | null;
};

export type AccountSyncSnapshot = {
  appMemory: AppMemory;
  historyRecords: HistoryRecord[];
  humanPosts: HumanPost[];
  links: ChainLink[];
  localRecords: {
    askCountryRoutes: string[];
    askThreads: AskThread[];
    chainPremium: ChainPremiumState;
    marketBids: Record<string, MarketBid[]>;
    marketHolds: MarketHold[];
    marketRatings: Record<string, { rating: number; tips: number }>;
    userStories: UserStory[];
  };
  marketplaceListings: MarketplaceListing[];
  notifications: NotificationItem[];
  savedAt: string;
  version: 1;
};

export type PublicFeedPayload = {
  blobStorageReady?: boolean;
  marketplaceListings?: MarketplaceListing[];
  ok?: boolean;
  pendingSetup?: boolean;
  posts?: HumanPost[];
  stories?: UserStory[];
};
