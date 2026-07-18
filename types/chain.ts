export type ChainLink = {
  createdAt?: string;
  country: string;
  id?: number;
  owner?: boolean;
  pinned?: boolean;
  pinnedAt?: string;
  reactions?: number;
  /** "live" = synced from Supabase; anything else (including unset) is treated as demo/seed content — see isDemoItem(). */
  source?: "demo" | "live";
  tips?: number;
  text: string;
};

export type ChainPremiumState = {
  circleCreated: boolean;
  circleName?: string;
  circlePaidAt?: string;
  pulsePaidAt?: string;
  pulseUnlocked: boolean;
};

export type AskThread = {
  answers: Array<{
    country: string;
    text: string;
    user: string;
  }>;
  author: string;
  /** Supabase hc_ask_threads.id — set only for threads synced to/from the backend. Needed to post/fetch answers server-side. */
  id?: string;
  mode: string;
  owner: boolean;
  question: string;
  /** "live" = synced from Supabase; anything else (including unset) is treated as demo/seed content — see isDemoItem(). */
  source?: "demo" | "live";
  targetCountry: string;
  topic: string;
};

export type ChainField = {
  name: string;
  members: string;
  mood: string;
  detail: string;
};
