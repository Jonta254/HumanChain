export type ProfileActivityItem = {
  type: "moment" | "listing" | "question" | "answer";
  text: string;
  createdAt: string;
};

export type ProfileVisibility = "public" | "private";

export type PublicProfile = {
  wallet: string;
  username: string;
  tier: string;
  joinedAt: string;
  isSelf: boolean;
  /** true = the owner made their profile private and this is someone else's request — only the fields above are populated. */
  restricted: boolean;
  bio: string | null;
  avatarUrl: string | null;
  points: number | null;
  streak: number | null;
  followerCount: number;
  followingCount: number;
  /** null when the viewer isn't signed in, so there's nothing to check. */
  isFollowing: boolean | null;
  marketplaceSummary: { activeListings: number; soldListings: number } | null;
  contributions: { moments: number; threads: number; answers: number } | null;
  recentActivity: ProfileActivityItem[] | null;
  /** Only populated when isSelf — the raw flags, for Settings to initialize toggle state from. */
  settings: ProfilePrivacySettings | null;
};

export type ProfilePrivacySettings = {
  profileVisibility: ProfileVisibility;
  activityVisibility: ProfileVisibility;
  marketplaceVisibility: ProfileVisibility;
  discoverable: boolean;
};
