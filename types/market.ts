export type MarketplaceListing = {
  dataReceiptUrl?: string;
  dataStorageStatus?: "cloud-safe" | "local-safe";
  id: number;
  seller: string;
  sellerWallet?: string;
  title: string;
  price: string;
  bidFloor: string;
  duration: string;
  saleMode: "direct" | "bidding";
  condition: string;
  area: string;
  link: string;
  details: string;
  photos: Array<{ id: number; name: string; src: string }>;
  ratings: number;
  tips: number;
  status: "draft" | "payment-ready";
  createdAt: string;
};

export type MarketBid = {
  amount: number;
  buyer: string;
  createdAt: string;
  dataReceiptUrl?: string;
  dataStorageStatus?: "cloud-safe" | "local-safe";
  id: number;
  note: string;
  status: "saved" | "sent";
};

export type MarketHold = {
  area: string;
  buyer: string;
  buyerWallet?: string;
  createdAt: string;
  distance: string;
  id: number;
  itemKey: string;
  itemTitle: string;
  note: string;
  seller: string;
  sellerWallet?: string;
  status: "held" | "notified" | "local";
};

export type MarketLocationState = {
  accuracy?: number;
  label: string;
  lat?: number;
  lng?: number;
  source: "not-requested" | "browser-gps" | "manual" | "unavailable";
  status: "idle" | "requesting" | "ready" | "denied";
};
