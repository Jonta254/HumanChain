export type StoryArtKind =
  | "cover-symbol"
  | "closed-door"
  | "key-ticket"
  | "repaired-cup"
  | "open-window"
  | "plant-door"
  | "open-door"
  | "light-opening"
  | "hands"
  | "world-thread"
  | "phone-table"
  | "stair-symbol"
  | "honest-message"
  | "phone-thread"
  | "memory-table"
  | "reply-ribbon"
  | "train"
  | "repair"
  | "net"
  | "cracked-tree"
  | "anonymous"
  | "repair-call"
  | "notes"
  | "bed-photo"
  | "ocean-memory"
  | "voice-wall"
  | "broken-streak"
  | "windows"
  | "sunrise-windows"
  | "four-windows"
  | "future-screen"
  | "public-square"
  | "low-battery"
  | "verdict-mirror"
  | "earth-chain"
  | "add-link";

export type StoryImage = {
  alt: string;
  art: StoryArtKind;
  photo?: string;
};

export type DailyResponse = {
  user: string;
  text: string;
  time: string;
};

export type UserStory = {
  author: string;
  authorWallet?: string;
  coverImage?: string;
  createdAt: string;
  dataReceiptUrl?: string;
  fileDataUrl?: string;
  fileName?: string;
  fileText?: string;
  fileType?: string;
  id: number;
  kind: "file" | "micro";
  owner: boolean;
  storageStatus: "cloud-safe" | "local-safe";
  text: string;
  title: string;
};

export type HumanPost = {
  id: number;
  author: string;
  caption: string;
  image: string | null;
  theme: string;
  reactions: number;
  loves: number;
  tips: number;
  comments: string[];
  createdAt: string;
  owner: boolean;
  authorWallet?: string;
  dataReceiptUrl?: string;
  mediaType?: "image" | "video";
  pinned?: boolean;
  pinnedAt?: string;
  storageStatus?: "cloud-safe" | "local-safe";
  tipSplit?: {
    creatorPercent: number;
    platformPercent: number;
  };
};
