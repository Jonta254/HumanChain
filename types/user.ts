import type { AskThread, ChainLink, ChainPremiumState } from "./chain";
import type { HistoryRecord, HpLedgerRecord } from "./reputation";
import type { HumanPost, UserStory } from "./content";
import type { MarketBid, MarketHold, MarketLocationState, MarketplaceListing } from "./market";
import type { NotificationItem } from "./ui";

/**
 * World ID proof-of-personhood tier for the connected wallet, read from
 * MiniKit.user.verificationStatus after wallet auth. Wallet auth (SIWE) alone
 * only proves wallet ownership — World's own docs warn against treating it
 * as a World ID substitute. "orb" is the only tier with a real biometric
 * uniqueness guarantee; "document"/"none" must not claim "no bots ever."
 */
export type WorldIdVerificationTier = "orb" | "document" | "none";

export type VerifiedHuman = {
  deviceOS?: string;
  lastSeenAt?: string;
  launchLocation?: string | null;
  profilePictureUrl?: string;
  username: string;
  wallet?: string;
  mode: "world" | "preview";
  worldIdTier?: WorldIdVerificationTier;
};

export type HumanIdentity = {
  username: string;
  wallet?: string;
};

export type AppMemory = {
  appLanguageCode: string;
  dailyAnswered: boolean;
  dailyAnsweredAt: string | null;
  dailyAnsweredDate: string | null;
  joinedAt: string | null;
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
  hpLedger: HpLedgerRecord[];
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
