"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  Gavel,
  HandCoins,
  Library,
  LockKeyhole,
  MapPin,
  MessageCircleQuestion,
  PlusCircle,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Upload,
} from "lucide-react";
import {
  chatWithWorld,
  getWorldMiniAppContext,
  shareWithWorld,
} from "@/lib/world";
import { normalizePaymentFeature } from "@/lib/worldPayments";
import { validateAnswerInput, validateListingInput } from "@/lib/humanchainPolicy";
import {
  loadJsonFromStorage,
  saveJsonToStorage,
  storageKeys,
} from "@/lib/humanchain/storage";
import {
  formatShortTime,
  formatWorldLaunchLocation,
  getMarketVerificationTier,
  getShortText,
  isVerifiedWorldHuman,
  requireVerifiedPublicAction,
} from "@/lib/humanchain/utils";
import type { EarnPoints, OpenPayment } from "@/types/ui";
import type { HumanIdentity } from "@/types/user";
import type { HistoryRecord } from "@/types/reputation";
import type {
  MarketBid,
  MarketHold,
  MarketLocationState,
  MarketplaceListing,
} from "@/types/market";

// ---------------------------------------------------------------------------
// Marketplace seed data — only used by this component
// ---------------------------------------------------------------------------

const marketplaceItems = [
  {
    title: "Samsung Galaxy A54",
    seller: "@mombasa_mobiles",
    condition: "Second hand",
    price: "WLD 68",
    distance: "4.8 km",
    location: "Nyali, Mombasa",
    tag: "Phone",
    trust: "World ID seller",
    tone: "blue",
    photos: 3,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=82",
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=800&q=82",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=82",
    ],
    quality: "Recent hand-shot front, back, screen, charger, and small edge marks disclosed",
    bidding: {
      target: 68,
      floor: 60,
      ends: "18h left",
      offers: [
        { buyer: "@coast_buyer", amount: 60, note: "Can inspect in Nyali this evening." },
        { buyer: "@techmama", amount: 64, note: "Cashless pickup after screen test." },
      ],
    },
  },
  {
    title: "New Ankara tote batch",
    seller: "@amina_makes",
    condition: "New listed",
    price: "WLD 6",
    distance: "6.2 km",
    location: "Milimani, Kisumu",
    tag: "Handmade",
    trust: "3 verified buyers",
    tone: "gold",
    photos: 4,
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=82",
      "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=800&q=82",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=82",
    ],
    quality: "Fresh camera photos of fabric, stitching, lining, and size held by seller",
    bidding: {
      target: 6,
      floor: 5,
      ends: "2d left",
      offers: [
        { buyer: "@giftbuyer", amount: 5, note: "Need two bags if available." },
      ],
    },
  },
  {
    title: "Taste 254 lunch launch",
    seller: "@taste254",
    condition: "Sponsored",
    price: "WLD 2 booking",
    distance: "3.8 km",
    location: "Kileleshwa, Nairobi",
    tag: "Marketing",
    trust: "Business link allowed",
    tone: "green",
    photos: 2,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=82",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=82",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=700&q=82",
    ],
    quality: "Real menu board, shop-front table setup, kitchen counter, and launch offer",
    bidding: null,
  },
  {
    title: "GlowBarber weekend offer",
    seller: "@glowbarber_ke",
    condition: "Sponsored",
    price: "Book slot",
    distance: "7.1 km",
    location: "Rupa Mall, Eldoret",
    tag: "Marketing",
    trust: "Verified service owner",
    tone: "gold",
    photos: 3,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=700&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=700&q=82",
      "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=700&q=82",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=700&q=82",
    ],
    quality: "Shop-front, chair setup, and finished cut photos",
    bidding: null,
  },
  {
    title: "Mama Nia lunch bowls",
    seller: "@mamania_eats",
    condition: "Sponsored",
    price: "WLD 1.2",
    distance: "2.7 km",
    location: "Milimani, Nakuru",
    tag: "Marketing",
    trust: "Repeat local buyers",
    tone: "green",
    photos: 3,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=82",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=82",
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=700&q=82",
    ],
    quality: "Food close-up, packaging, and pickup counter photos",
    bidding: null,
  },
  {
    title: "Studio Kitenge photoshoot",
    seller: "@studio_kitenge",
    condition: "Sponsored",
    price: "WLD 8",
    distance: "5.2 km",
    location: "Kisumu CBD",
    tag: "Marketing",
    trust: "Portfolio link allowed",
    tone: "violet",
    photos: 3,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=82",
      "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=700&q=82",
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=700&q=82",
    ],
    quality: "Portfolio sample, studio corner, and camera setup photos",
    bidding: null,
  },
  {
    title: "Used study desk",
    seller: "@student_chain",
    condition: "Second hand",
    price: "WLD 14",
    distance: "1.6 km",
    location: "Section 58, Nakuru",
    tag: "Home",
    trust: "Pickup only",
    tone: "violet",
    photos: 3,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=82",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=82",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=82",
    ],
    quality: "Wide camera photo, drawer close-up, scratch disclosure, and pickup doorway view",
    bidding: {
      target: 7,
      floor: 5,
      ends: "9h left",
      offers: [
        { buyer: "@campusbuyer", amount: 5, note: "Can collect near Ngong Road." },
      ],
    },
  },
];

const marketplacePlans = [
  ["Quick listing", "2 WLD", "Publish one item with 2 included photos."],
  ["Extra photo pack", "1.5 WLD", "Add up to 3 more photos to one listing."],
  ["Local boost", "2 WLD", "Push a listing higher in nearby discovery."],
  ["Business ad", "4 WLD", "Market a shop, service, event, or link."],
] as const;

const marketplaceSignals = [
  "Verified World usernames",
  "Photo-first listings",
  "Saved bid receipts",
  "World Chat before meetup",
  "Clear price and condition",
  "No hidden GPS sharing",
];

const marketplaceChecklist = [
  "2 real item photos",
  "Price and condition",
  "Pickup area or delivery note",
  "Defects or warranty note",
  "Seller chat enabled",
  "No off-app prepayment pressure",
];

const marketplaceBusinessAds = [
  {
    title: "Mama Nia lunch bowls",
    owner: "@mamania_eats",
    area: "Milimani, Nakuru",
    offer: "Fresh lunch bowls, office delivery, 11:30-14:30.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=82",
    tag: "Food",
    signal: "18 saved this week",
  },
  {
    title: "GlowBarber weekend slots",
    owner: "@glowbarber_ke",
    area: "Rupa Mall, Eldoret",
    offer: "Haircuts, beard lineups, and clean chair photos before booking.",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=82",
    tag: "Service",
    signal: "Open slots today",
  },
  {
    title: "Studio Kitenge portraits",
    owner: "@studio_kitenge",
    area: "Kisumu CBD",
    offer: "Portrait sessions for founders, families, products, and events.",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=82",
    tag: "Creative",
    signal: "Portfolio verified",
  },
];

const marketplaceTrustRails: [string, string][] = [
  ["Verified humans", "Trade with visible World usernames and saved HumanChain records."],
  ["Strict location", "Distance appears only from a connected market location."],
  ["Chat-first trade", "Confirm condition, pickup, and payment before meeting."],
  ["Receipt trail", "Listings, holds, bids, boosts, and tips keep a local record."],
];

// ---------------------------------------------------------------------------
// Local helper types
// ---------------------------------------------------------------------------

type MarketplaceItem = (typeof marketplaceItems)[number];

// ---------------------------------------------------------------------------
// Local helper functions
// ---------------------------------------------------------------------------

const worldNotificationCooldownMs = 60 * 60 * 1000;

function canSendWorldNotificationOnce(
  wallet: string,
  sector: string,
  title: string,
  cooldownMs = worldNotificationCooldownMs,
) {
  try {
    const key = `humanchain_notification_sent:${wallet.toLowerCase()}:${sector}:${title}`;
    const lastSentAt = Number(window.localStorage.getItem(key) ?? 0);

    if (Number.isFinite(lastSentAt) && Date.now() - lastSentAt < cooldownMs) {
      return false;
    }

    window.localStorage.setItem(key, Date.now().toString());
    return true;
  } catch {
    return true;
  }
}

async function storeSafeData(
  kind: "post" | "marketplace-listing" | "marketplace-bid" | "payment" | "story",
  id: number | string,
  data: unknown,
) {
  try {
    const response = await fetch("/api/data/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, id, kind }),
    });
    const payload = (await response.json()) as {
      ok?: boolean;
      pendingSetup?: boolean;
      url?: string;
    };

    return {
      ok: Boolean(payload.ok && payload.url),
      pendingSetup: Boolean(payload.pendingSetup),
      url: payload.url,
    };
  } catch {
    return {
      ok: false,
      pendingSetup: false,
      url: undefined,
    };
  }
}

function getInitialMarketBids() {
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MarketplaceView({
  act,
  earnPoints,
  humanIdentity,
  marketLocation,
  marketplaceListings,
  openPayment,
  recordHistory,
  setMarketLocation,
  setMarketplaceListings,
  worldContext,
}: {
  act: (title: string, detail: string) => void;
  earnPoints: EarnPoints;
  humanIdentity: HumanIdentity | null;
  marketLocation: MarketLocationState;
  marketplaceListings: MarketplaceListing[];
  openPayment: OpenPayment;
  recordHistory: (record: Omit<HistoryRecord, "id" | "time">) => void;
  setMarketLocation: React.Dispatch<React.SetStateAction<MarketLocationState>>;
  setMarketplaceListings: React.Dispatch<React.SetStateAction<MarketplaceListing[]>>;
  worldContext: ReturnType<typeof getWorldMiniAppContext>;
}) {
  const [activeFilter, setActiveFilter] = useState("Products");
  const [marketMode, setMarketMode] = useState<"browse" | "sell">("browse");
  const [marketSearch, setMarketSearch] = useState("");
  const [manualArea, setManualArea] = useState(() =>
    marketLocation.source === "manual"
      ? marketLocation.label.replace(/^Manual area:\s*/, "")
      : "Nairobi",
  );
  const [bidDrafts, setBidDrafts] = useState<Record<string, string>>({});
  const [marketBids, setMarketBids] = useState<Record<string, MarketBid[]>>(() =>
    loadJsonFromStorage<Record<string, MarketBid[]>>(
      storageKeys.bids,
      getInitialMarketBids(),
    ),
  );
  const [marketRatings, setMarketRatings] = useState<Record<string, { rating: number; tips: number }>>(() =>
    loadJsonFromStorage<Record<string, { rating: number; tips: number }>>(
      storageKeys.marketRatings,
      {},
    ),
  );
  const [marketComments, setMarketComments] = useState<Record<string, string[]>>(() =>
    loadJsonFromStorage<Record<string, string[]>>(storageKeys.marketComments, {}),
  );
  const [marketCommentDrafts, setMarketCommentDrafts] = useState<Record<string, string>>({});
  const [marketHolds, setMarketHolds] = useState<MarketHold[]>(() =>
    loadJsonFromStorage<MarketHold[]>(storageKeys.marketHolds, []),
  );
  const [listingPhotos, setListingPhotos] = useState<
    Array<{ id: number; name: string; src: string }>
  >([]);
  const [listingPhotoPackUnlocked, setListingPhotoPackUnlocked] = useState(false);
  const [activeMarketItem, setActiveMarketItem] = useState<
    MarketplaceItem | MarketplaceListing | null
  >(null);
  const [marketBusyAction, setMarketBusyAction] = useState<string | null>(null);
  const [listingDraft, setListingDraft] = useState({
    area: "",
    bidFloor: "",
    condition: "",
    details: "",
    duration: "3 days",
    link: "",
    price: "",
    saleMode: "direct" as MarketplaceListing["saleMode"],
    title: "",
  });

  const filteredItems = marketplaceItems.filter((item) => {
    const query = marketSearch.trim().toLowerCase();
    const matchesQuery = !query || `${item.title} ${item.seller} ${item.location} ${item.tag} ${item.condition}`.toLowerCase().includes(query);
    if (activeFilter === "Products") return matchesQuery && item.tag !== "Marketing";
    if (activeFilter === "Services") return matchesQuery && item.condition === "Service or business";
    if (activeFilter === "Jobs") return matchesQuery && item.tag === "Marketing";
    if (activeFilter === "Digital Goods") return matchesQuery && item.tag === "Marketing";
    return matchesQuery;
  });
  const locationReady = marketLocation.status === "ready";
  const worldLaunchLabel = formatWorldLaunchLocation(worldContext.launchLocation);
  const sellerHandle = humanIdentity?.username ?? "@preview_human";
  const marketUsageRatings =
    marketplaceListings.reduce((total, listing) => total + (listing.ratings ?? 0), 0) +
    Object.values(marketRatings).reduce((total, item) => total + item.rating, 0);
  const marketUsageTips =
    marketplaceListings.reduce((total, listing) => total + (listing.tips ?? 0), 0) +
    Object.values(marketRatings).reduce((total, item) => total + item.tips, 0);
  const marketVerificationTier = getMarketVerificationTier({
    isVerified: isVerifiedWorldHuman(humanIdentity),
    listingCount: marketplaceListings.length,
    locationReady,
    ratingCount: marketUsageRatings,
    tipCount: marketUsageTips,
  });

  function getMarketItemKey(item: MarketplaceItem | MarketplaceListing) {
    return "id" in item ? `stored:${item.id}` : `seed:${item.seller}:${item.title}`;
  }

  function getMarketActionKey(action: string, item: MarketplaceItem | MarketplaceListing) {
    return `${action}:${getMarketItemKey(item)}`;
  }

  function isMarketActionBusy(action: string, item: MarketplaceItem | MarketplaceListing) {
    return marketBusyAction === getMarketActionKey(action, item);
  }

  function getMarketItemImages(item: MarketplaceItem | MarketplaceListing): string[] {
    if ("id" in item && item.photos.length) {
      return item.photos.slice(0, 3).map((photo) => photo.src);
    }

    if ("gallery" in item && Array.isArray(item.gallery) && item.gallery.length) {
      return item.gallery.slice(0, 3);
    }

    if ("image" in item) {
      return [item.image, item.image, item.image];
    }

    return [];
  }

  function getMarketItemInfo(item: MarketplaceItem | MarketplaceListing) {
    const isStoredListing = "id" in item;
    const area = isStoredListing ? item.area : item.location;
    const sellerWallet = isStoredListing ? item.sellerWallet : undefined;
    const distance = !locationReady
      ? "Connect location to see strict distance"
      : "distance" in item
        ? `${item.distance} from your active market area`
        : marketLocation.source === "browser-gps"
          ? `Seller area: ${area}. Exact distance is shown only when seller GPS is available.`
          : `Seller area: ${area}. Manual area match active.`;

    return {
      area,
      condition: item.condition,
      createdAt: isStoredListing ? item.createdAt : "Verified seed listing",
      detail: isStoredListing ? item.details || "No extra details added." : item.quality,
      distance,
      link: isStoredListing ? item.link : "",
      photos: isStoredListing ? item.photos.length : item.photos,
      receipt: isStoredListing
        ? item.dataStorageStatus === "cloud-safe"
          ? "Cloud-safe listing receipt"
          : "Local-safe listing receipt"
        : "Seed listing with visible trust signals",
      price: item.price,
      seller: item.seller,
      sellerWallet,
      title: item.title,
      trade:
        "saleMode" in item && item.saleMode === "bidding"
          ? `Bidding ${item.duration}, floor ${item.bidFloor || "not set"}`
          : "bidding" in item && item.bidding
            ? `Bidding closes ${item.bidding.ends}, target ${item.bidding.target} WLD`
            : "Direct chat sale",
    };
  }

  useEffect(() => {
    saveJsonToStorage(storageKeys.bids, marketBids);
  }, [marketBids]);

  useEffect(() => {
    saveJsonToStorage(storageKeys.marketRatings, marketRatings);
  }, [marketRatings]);

  useEffect(() => {
    saveJsonToStorage(storageKeys.marketComments, marketComments);
  }, [marketComments]);

  useEffect(() => {
    saveJsonToStorage(storageKeys.marketHolds, marketHolds);
  }, [marketHolds]);

  function publishListing(plan: (typeof marketplacePlans)[number]) {
    openPayment({
      title: `${plan[0]} premium marketplace fee`,
      amount: plan[1],
      detail: `${plan[2]} World App opens a MiniKit Pay request and HumanChain verifies the transaction before unlocking the premium marketplace action.`,
      success: `${plan[0]} is ready. Add your item, photos, location, and contact link after wallet setup.`,
      feature: normalizePaymentFeature(`marketplace-${plan[0]}`),
      points: 12,
      onConfirmed: () => {
        recordHistory({
          title: `${plan[0]} payment confirmed`,
          detail: `${plan[1]} marketplace action was verified by World payment and unlocked.`,
          kind: "market",
        });
      },
    });
  }

  function updateListingDraft(field: keyof typeof listingDraft, value: string) {
    setListingDraft((current) => ({ ...current, [field]: value }));
  }

  function requestMarketplaceLocation() {
    if (marketLocation.status === "requesting") {
      return;
    }

    setMarketLocation((current) => ({
      ...current,
      label: "Requesting browser location...",
      status: "requesting",
    }));

    if (!navigator.geolocation) {
      setMarketLocation({
        label: "GPS unavailable. Use the area field instead.",
        source: "unavailable",
        status: "denied",
      });
      act(
        "Location unavailable",
        "World App exposes location through the WebView permission prompt. This device/browser did not provide it, so use manual area matching.",
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { accuracy, latitude, longitude } = position.coords;
        const gpsLabel = `GPS shared: ${latitude.toFixed(3)}, ${longitude.toFixed(3)} (${Math.round(accuracy)}m)`;

        setMarketLocation({
          accuracy,
          label: gpsLabel,
          lat: latitude,
          lng: longitude,
          source: "browser-gps",
          status: "ready",
        });
        updateListingDraft("area", gpsLabel);
        earnPoints(5, "Nearby marketplace is now ranked with your explicit browser location consent.");
      },
      (error) => {
        setMarketLocation({
          label: error.code === error.PERMISSION_DENIED ? "Location not allowed" : "Location could not be read",
          source: "unavailable",
          status: "denied",
        });
        act(
          "Location not connected",
          "You can still browse by manually entering your area. HumanChain will not guess or store GPS without consent.",
        );
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300_000,
        timeout: 10_000,
      },
    );
  }

  function applyManualMarketplaceArea() {
    const area = manualArea.trim();

    if (!area) {
      act("Area needed", "Enter a town, estate, or pickup zone to rank nearby listings manually.");
      return;
    }

    setMarketLocation({
      label: `Manual area: ${area}`,
      source: "manual",
      status: "ready",
    });
    updateListingDraft("area", area);
    earnPoints(3, "Manual marketplace area connected without GPS.");
  }

  function saveMarketplaceListing() {
    if (!requireVerifiedPublicAction(humanIdentity, act, "publishing marketplace listings")) {
      return false;
    }

    const title = listingDraft.title.trim();
    const price = listingDraft.price.trim();
    const area = listingDraft.area.trim();
    const validation = validateListingInput({
      area,
      condition: listingDraft.condition,
      photos: listingPhotos,
      price,
      title,
    });

    if (!validation.ok) {
      act(
        validation.errorState === "listing_blocked_category" ? "Listing blocked category" : "Listing needs details",
        validation.issues[0] ?? "Add title, positive price, condition, area, and at least 2 real photos.",
      );
      return false;
    }

    const listing: MarketplaceListing = {
      id: Date.now(),
      seller: humanIdentity?.username ?? "@you",
      sellerWallet: humanIdentity?.wallet,
      title,
      price,
      bidFloor: listingDraft.bidFloor.trim(),
      duration: listingDraft.duration.trim() || "3 days",
      saleMode: listingDraft.saleMode,
      condition: listingDraft.condition || "Condition not set",
      area,
      link: listingDraft.link.trim(),
      details: listingDraft.details.trim(),
      photos: listingPhotos,
      ratings: 0,
      tips: 0,
      status: "payment-ready",
      createdAt: new Intl.DateTimeFormat("en", {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
      }).format(new Date()),
      dataStorageStatus: "local-safe",
    };

    setMarketplaceListings((current) => [listing, ...current]);
    void storeSafeData("marketplace-listing", listing.id, listing).then((receipt) => {
      if (!receipt.ok) {
        return;
      }

      setMarketplaceListings((current) =>
        current.map((item) =>
          item.id === listing.id
            ? {
                ...item,
                dataReceiptUrl: receipt.url,
                dataStorageStatus: "cloud-safe",
              }
            : item,
        ),
      );
    });
    recordHistory({
      title: "Marketplace listing stored",
      detail: `${title} saved with ${listingPhotos.length} photo${listingPhotos.length === 1 ? "" : "s"} and can be published after payment. A safe data receipt is being prepared.`,
      kind: "market",
    });
    earnPoints(10, "Your marketplace listing was stored in HumanChain history.");
    setListingDraft({
      area: "",
      bidFloor: "",
      condition: "",
      details: "",
      duration: "3 days",
      link: "",
      price: "",
      saleMode: "direct",
      title: "",
    });
    setListingPhotos([]);
    setListingPhotoPackUnlocked(false);
    setMarketMode("browse");
    return true;
  }

  function handleListingPhotos(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const selectedFiles = Array.from(files);
    const maxFreePhotos = listingPhotoPackUnlocked ? 5 : 2;
    const requestedTotal = selectedFiles.length;

    if (requestedTotal > 5) {
      act("Five photo maximum", "HumanChain Market accepts up to 5 listing photos for a clean buyer view.");
    }

    if (requestedTotal > 2 && !listingPhotoPackUnlocked) {
      openPayment({
        title: "Market photo pack",
        amount: "1.5 WLD",
        detail: "Unlock up to 5 listing photos for this seller session. Two photos are free.",
        success: "Extra listing photos are unlocked. Add up to 5 item photos now.",
        feature: "marketplace-photo-pack",
        points: 6,
        onConfirmed: () => {
          setListingPhotoPackUnlocked(true);
          recordHistory({
            title: "Market photo pack unlocked",
            detail: "1.5 WLD confirmed. Seller can add up to 5 listing photos this session.",
            kind: "market",
          });
        },
      });
      act("Extra photos require WLD", "Two images are free. Pay 1.5 WLD once to add images 3-5, then select the photos again.");
      return;
    }

    const includedFiles = selectedFiles.slice(0, maxFreePhotos);

    setListingPhotos([]);

    includedFiles.forEach((file, index) => {
      const reader = new FileReader();

      reader.onload = () => {
        setListingPhotos((current) => [
          ...current,
          {
            id: Date.now() + index,
            name: file.name,
            src: String(reader.result),
          },
        ]);
      };

      reader.readAsDataURL(file);
    });

    act("Photos added", `${includedFiles.length} listing photo slot${includedFiles.length > 1 ? "s" : ""} ready.`);
  }

  function rateMarketItem(item: MarketplaceItem | MarketplaceListing, label: string) {
    const isStoredListing = "id" in item;
    const key = isStoredListing ? `stored:${item.id}` : `${item.seller}:${item.title}`;

    if (isStoredListing) {
      setMarketplaceListings((current) =>
        current.map((listing) =>
          listing.id === item.id
            ? { ...listing, ratings: (listing.ratings ?? 0) + 1 }
            : listing,
        ),
      );
    } else {
      setMarketRatings((current) => ({
        ...current,
        [key]: {
          rating: (current[key]?.rating ?? 0) + 1,
          tips: current[key]?.tips ?? 0,
        },
      }));
    }

    earnPoints(3, `You rated ${label}'s look and helped buyers scan the market.`);
  }

  function tipMarketItem(item: MarketplaceItem | MarketplaceListing, label: string) {
    const seller = item.seller;
    const isStoredListing = "id" in item;
    const key = isStoredListing ? `stored:${item.id}` : `${item.seller}:${item.title}`;

    openPayment({
      title: "Tip market item",
      amount: "1 WLD",
      allowCustomAmount: true,
      context: {
        payerWallet: humanIdentity?.wallet,
        sellerWallet: isStoredListing ? item.sellerWallet : undefined,
        tippedAuthor: seller,
      },
      detail: `Tip ${seller} for making ${label} worth noticing. HumanChain stores the 80/20 split receipt.`,
      success: "Market item tip confirmed and receipt stored.",
      feature: "tip-market-item",
      onConfirmed: (tipAmount) => {
        if (isStoredListing) {
          setMarketplaceListings((current) =>
            current.map((listing) =>
              listing.id === item.id
                ? { ...listing, tips: (listing.tips ?? 0) + 1 }
                : listing,
            ),
          );
        } else {
          setMarketRatings((current) => ({
            ...current,
            [key]: {
              rating: current[key]?.rating ?? 0,
              tips: (current[key]?.tips ?? 0) + 1,
            },
          }));
        }

        recordHistory({
          title: "Marketplace item tip confirmed",
          detail: `${tipAmount} WLD tip confirmed for ${seller}. Split receipt: 80% seller share, 20% HumanChain platform share.`,
          kind: "tip",
        });
        void storeSafeData("marketplace-listing", `tip-${key}-${Date.now()}`, {
          item: label,
          seller,
          sellerWallet: isStoredListing ? item.sellerWallet : undefined,
          amount: tipAmount,
          payerWallet: humanIdentity?.wallet,
          token: "WLD",
          split: { creatorPercent: 80, platformPercent: 20 },
        });
      },
      points: 4,
    });
  }

  function submitMarketComment(item: MarketplaceItem | MarketplaceListing) {
    if (!requireVerifiedPublicAction(humanIdentity, act, "commenting on marketplace listings")) {
      return;
    }

    const key = getMarketItemKey(item);
    const itemInfo = getMarketItemInfo(item);
    const comment = marketCommentDrafts[key]?.trim();

    if (!comment) {
      act("Write a market comment", "Ask a public item question or leave useful listing context first.");
      return;
    }

    const validation = validateAnswerInput(comment);

    if (!validation.ok) {
      act("Comment needs work", validation.issues[0] ?? "Adjust the marketplace comment before paying.");
      return;
    }

    openPayment({
      title: "Comment on market item",
      amount: "0.5 WLD",
      detail: `Post a public paid comment on ${itemInfo.title}. Seller chat stays free for private buying details.`,
      success: "Marketplace comment payment confirmed. Your public listing comment is posted.",
      feature: "marketplace-comment",
      points: 5,
      onConfirmed: () => {
        const savedComment = `${humanIdentity?.username ?? "@you"}: ${comment}`;

        setMarketComments((current) => ({
          ...current,
          [key]: [savedComment, ...(current[key] ?? [])],
        }));
        setMarketCommentDrafts((current) => ({ ...current, [key]: "" }));
        recordHistory({
          title: "Marketplace comment posted",
          detail: `0.5 WLD comment on ${itemInfo.title}: ${comment}`,
          kind: "market",
        });
        void storeSafeData("marketplace-listing", `comment-${key}-${Date.now()}`, {
          amount: 0.5,
          buyer: humanIdentity?.username ?? "@you",
          comment,
          item: itemInfo.title,
          seller: itemInfo.seller,
          token: "WLD",
        });
      },
    });
  }

  async function shareMarketItem(item: MarketplaceItem | MarketplaceListing) {
    const itemInfo = getMarketItemInfo(item);
    const busyKey = getMarketActionKey("share", item);

    if (marketBusyAction) {
      return;
    }

    setMarketBusyAction(busyKey);

    try {
      await shareWithWorld({
        title: `${itemInfo.title} on HumanChain Market`,
        text: `${itemInfo.title} - ${itemInfo.price} near ${itemInfo.area}. ${itemInfo.condition}, ${itemInfo.photos} photos, seller ${itemInfo.seller}.`,
        url: process.env.NEXT_PUBLIC_APP_URL,
      });
      act("Listing shared", "World share opened for this marketplace item.");
    } catch (error) {
      act("Share unavailable", error instanceof Error ? error.message : "Try sharing from World App.");
    } finally {
      setMarketBusyAction((current) => (current === busyKey ? null : current));
    }
  }

  async function notifyMarketplaceSeller(
    item: MarketplaceItem | MarketplaceListing,
    message: string,
  ) {
    const itemInfo = getMarketItemInfo(item);

    if (!itemInfo.sellerWallet) {
      return false;
    }

    if (
      !canSendWorldNotificationOnce(
        itemInfo.sellerWallet,
        "marketplace",
        `${itemInfo.title}:interest`,
      )
    ) {
      return false;
    }

    const response = await fetch("/api/world/send-notification", {
      body: JSON.stringify({
        message,
        path: "/?tab=market",
        sector: "marketplace",
        title: "Market item interest",
        walletAddresses: [itemInfo.sellerWallet],
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const result = (await response.json().catch(() => null)) as { ok?: boolean } | null;

    return response.ok && result?.ok !== false;
  }

  async function openSellerChat(item: MarketplaceItem | MarketplaceListing, intent = "interest") {
    const itemInfo = getMarketItemInfo(item);
    const sellerUsername = itemInfo.seller.replace(/^@/, "");
    const message =
      intent === "hold"
        ? `Hi ${itemInfo.seller}, I want to hold ${itemInfo.title} on HumanChain Market. My active market location is ${marketLocation.label}. Is it still available?`
        : `Hi ${itemInfo.seller}, I saw ${itemInfo.title} on HumanChain Market. Is it still available near ${itemInfo.area}?`;

    try {
      await chatWithWorld({
        message,
        to: [sellerUsername],
      });
      recordHistory({
        title: "Marketplace chat opened",
        detail: `World Chat opened for ${itemInfo.title} with ${itemInfo.seller}.`,
        kind: "market",
      });
      act("World Chat opened", `${itemInfo.seller}'s Human Chat inbox is ready for this listing.`);
    } catch (error) {
      act("Chat unavailable", error instanceof Error ? error.message : "Try opening the seller from World App.");
    }
  }

  async function messageMarketplaceSeller(item: MarketplaceItem | MarketplaceListing) {
    const busyKey = getMarketActionKey("chat", item);

    if (marketBusyAction) {
      return;
    }

    setMarketBusyAction(busyKey);

    try {
      await openSellerChat(item);
    } finally {
      setMarketBusyAction((current) => (current === busyKey ? null : current));
    }
  }

  async function bookMarketItem(item: MarketplaceItem | MarketplaceListing) {
    if (!requireVerifiedPublicAction(humanIdentity, act, "creating a marketplace hold")) {
      return;
    }

    if (!locationReady) {
      act(
        "Location required",
        "Connect GPS or a manual market area before holding an item. HumanChain does not guess distance without permission.",
      );
      return;
    }

    const itemInfo = getMarketItemInfo(item);
    const itemKey = getMarketItemKey(item);
    const busyKey = getMarketActionKey("hold", item);

    if (marketBusyAction) {
      return;
    }

    setMarketBusyAction(busyKey);

    const hold: MarketHold = {
      area: itemInfo.area,
      buyer: humanIdentity?.username ?? "@you",
      buyerWallet: humanIdentity?.wallet,
      createdAt: formatShortTime(),
      distance: itemInfo.distance,
      id: Date.now(),
      itemKey,
      itemTitle: itemInfo.title,
      note: `Buyer requested a hold from ${marketLocation.label}.`,
      seller: itemInfo.seller,
      sellerWallet: itemInfo.sellerWallet,
      status: itemInfo.sellerWallet ? "notified" : "local",
    };

    try {
      setMarketHolds((current) => [hold, ...current.filter((entry) => entry.itemKey !== itemKey)]);
      recordHistory({
        title: "Marketplace hold started",
        detail: `${itemInfo.title} was held for ${hold.buyer}. Seller ${itemInfo.seller} can continue in World Chat.`,
        kind: "market",
      });
      void storeSafeData("marketplace-bid", `hold-${itemKey}-${hold.id}`, hold);

      const notificationMessage = `${hold.buyer} wants to hold ${itemInfo.title}. Location: ${marketLocation.label}.`;
      const notificationSent = await notifyMarketplaceSeller(item, notificationMessage).catch(() => false);
      await openSellerChat(item, "hold");
      setMarketHolds((current) =>
        current.map((entry) =>
          entry.id === hold.id
            ? { ...entry, status: notificationSent ? "notified" : entry.status }
            : entry,
        ),
      );
      act(
        notificationSent ? "Hold sent" : "Hold saved",
        notificationSent
          ? "The seller received a marketplace notification and World Chat is ready."
          : "The hold is saved locally and World Chat is ready when available.",
      );
    } finally {
      setMarketBusyAction((current) => (current === busyKey ? null : current));
    }
  }

  function getTopBid(item: MarketplaceItem) {
    const offers = marketBids[item.title] ?? [];

    return offers.reduce<MarketBid | null>(
      (best, offer) => (!best || offer.amount > best.amount ? offer : best),
      null,
    );
  }

  function getMinimumNextBid(item: MarketplaceItem) {
    if (!item.bidding) {
      return 0;
    }

    const topBid = getTopBid(item);

    return topBid ? Math.max(item.bidding.floor, topBid.amount + 0.5) : item.bidding.floor;
  }

  function setQuickBid(item: MarketplaceItem, amount: number) {
    setBidDrafts((current) => ({
      ...current,
      [item.title]: amount.toFixed(amount % 1 === 0 ? 0 : 1),
    }));
  }

  async function placeBid(item: MarketplaceItem) {
    if (!requireVerifiedPublicAction(humanIdentity, act, "placing marketplace bids")) {
      return;
    }

    if (!item.bidding) {
      act("Direct sale item", "This listing uses chat-first buying instead of timed bidding.");
      return;
    }

    const nextBid = Number.parseFloat(bidDrafts[item.title] ?? "");
    const minimumNextBid = getMinimumNextBid(item);

    if (!Number.isFinite(nextBid) || nextBid < minimumNextBid) {
      act(
        "Bid too low",
        `Enter at least ${minimumNextBid} WLD so your offer beats the current bid and stays serious.`,
      );
      return;
    }

    const busyKey = getMarketActionKey("bid", item);

    if (marketBusyAction) {
      return;
    }

    setMarketBusyAction(busyKey);

    const bidId = (marketBids[item.title]?.length ?? 0) + 1;
    const bid: MarketBid = {
      amount: nextBid,
      buyer: humanIdentity?.username ?? "@you",
      createdAt: new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
      id: bidId,
      note:
        nextBid >= item.bidding.target
          ? "Meets seller target. Ready to accept."
          : "Saved offer. Seller can accept or wait.",
      status: "saved",
      dataStorageStatus: "local-safe",
    };

    try {
      setMarketBids((current) => ({
        ...current,
        [item.title]: [bid, ...(current[item.title] ?? [])],
      }));
      void storeSafeData("marketplace-bid", `${item.title}-${bid.id}`, {
        ...bid,
        listing: item.title,
        seller: item.seller,
        sellerTarget: item.bidding!.target,
      }).then((receipt) => {
        if (!receipt.ok) {
          return;
        }

        setMarketBids((current) => ({
          ...current,
          [item.title]: (current[item.title] ?? []).map((offer) =>
            offer.id === bidId
              ? {
                  ...offer,
                  dataReceiptUrl: receipt.url,
                  dataStorageStatus: "cloud-safe",
                }
              : offer,
          ),
        }));
      });
      setBidDrafts((current) => ({ ...current, [item.title]: "" }));
      recordHistory({
        title: nextBid >= item.bidding.target ? "Target bid placed" : "Marketplace bid placed",
        detail: `${nextBid} WLD bid placed on ${item.title}. The bid is saved, ranked automatically, and sent to seller chat when available.`,
        kind: "market",
      });
      await chatWithWorld({
        message: `I placed a ${nextBid} WLD bid on ${item.title}. Let me know if this is close enough to accept.`,
        to: [item.seller.replace(/^@/, "")],
      });
      setMarketBids((current) => ({
        ...current,
        [item.title]: (current[item.title] ?? []).map((offer) =>
          offer.id === bidId ? { ...offer, status: "sent" } : offer,
        ),
      }));
      act("Bid sent to seller", "World Chat opened so the buyer and seller can confirm details directly.");
    } catch (error) {
      act("Bid saved", error instanceof Error ? error.message : "Bid is saved in the mini app preview.");
    } finally {
      setMarketBusyAction((current) => (current === busyKey ? null : current));
    }
  }

  if (activeMarketItem) {
    const itemInfo = getMarketItemInfo(activeMarketItem);
    const images = getMarketItemImages(activeMarketItem);
    const activeHold = marketHolds.find(
      (hold) => hold.itemKey === getMarketItemKey(activeMarketItem),
    );
    const activeMarketCommentKey = getMarketItemKey(activeMarketItem);
    const activeMarketComments = marketComments[activeMarketCommentKey] ?? [];

    return (
      <div className="screen market-detail-screen">
        <button
          className="market-detail-back"
          onClick={() => setActiveMarketItem(null)}
          type="button"
        >
          Back to market
        </button>
        <div className="market-detail-titlebar">
          <span className="section-kicker">Item detail</span>
          <strong>{itemInfo.title}</strong>
          <small>{itemInfo.price} - {itemInfo.condition}</small>
        </div>
        <section className="market-detail-gallery" aria-label={`${itemInfo.title} images`}>
          {images.length ? (
            images.map((image, index) => (
              <img
                alt={`${itemInfo.title} image ${index + 1}`}
                key={`${itemInfo.title}-${index}`}
                src={image}
              />
            ))
          ) : (
            <div className="market-detail-empty">
              <Tag size={24} />
            </div>
          )}
        </section>
        <section className="market-detail-info">
          <span className="section-kicker">Verified market listing</span>
          <h1>{itemInfo.title}</h1>
          <strong>{itemInfo.price}</strong>
          <p>{itemInfo.detail}</p>
          <div className="market-detail-trust" aria-label="Listing trust details">
            <span>
              <ShieldCheck size={15} />
              {itemInfo.seller} verified handle
            </span>
            <span>
              <LockKeyhole size={15} />
              {itemInfo.receipt}
            </span>
            <span>
              <MessageCircleQuestion size={15} />
              Chat before payment
            </span>
          </div>
          <section className="seller-contact-card" aria-label="Seller details">
            <div>
              <span>Seller</span>
              <strong>{itemInfo.seller}</strong>
              <small>{itemInfo.area}</small>
            </div>
            <button
              aria-busy={isMarketActionBusy("chat", activeMarketItem)}
              disabled={Boolean(marketBusyAction)}
              onClick={() => void messageMarketplaceSeller(activeMarketItem)}
              type="button"
            >
              {isMarketActionBusy("chat", activeMarketItem) ? "Opening..." : "Talk to seller"}
            </button>
          </section>
          <section className="market-comment-card" aria-label="Marketplace comments">
            <div className="market-comment-head">
              <div>
                <span>Public item comments</span>
                <strong>{activeMarketComments.length} comments</strong>
              </div>
              <small>0.5 WLD each</small>
            </div>
            {activeMarketComments.length ? (
              <div className="market-comment-list">
                {activeMarketComments.slice(0, 3).map((comment, index) => (
                  <article key={`${activeMarketCommentKey}-${comment}-${index}`}>
                    <strong>{comment.includes(":") ? comment.split(":")[0] : "@verified_human"}</strong>
                    <p>{comment.includes(":") ? comment.split(":").slice(1).join(":").trim() : comment}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p>No public item comments yet. Use comments for visible item questions; use seller chat for buying details.</p>
            )}
            <label className="market-comment-composer">
              <span>Add a public listing comment</span>
              <textarea
                aria-label="Add a public marketplace comment"
                onChange={(event) =>
                  setMarketCommentDrafts((current) => ({
                    ...current,
                    [activeMarketCommentKey]: event.target.value,
                  }))
                }
                placeholder="Ask about condition, receipt, defects, or pickup proof..."
                value={marketCommentDrafts[activeMarketCommentKey] ?? ""}
              />
            </label>
            <button
              disabled={!marketCommentDrafts[activeMarketCommentKey]?.trim()}
              onClick={() => submitMarketComment(activeMarketItem)}
              type="button"
            >
              Post comment - 0.5 WLD
            </button>
          </section>
          {activeHold ? (
            <div className="market-detail-hold">
              <strong>Hold active</strong>
              <span>
                {activeHold.status === "notified"
                  ? "Seller notification sent."
                  : "Saved locally. Continue in World Chat."}{" "}
                Created {activeHold.createdAt}.
              </span>
            </div>
          ) : null}
          <div className="market-detail-hold">
            <strong>Inspection and dispute trail</strong>
            <span>
              Chat-first sale is default. Hold-protected orders require inspection confirmation,
              evidence, moderator review, and backend transaction confirmation before payout.
            </span>
          </div>
          {"bidding" in activeMarketItem && activeMarketItem.bidding ? (
            <div className="bid-console detail-bid-console">
              <div className="bid-console-top">
                <span>
                  <Gavel size={14} />
                  Bidding closes {activeMarketItem.bidding.ends}
                </span>
                <strong>Best {getTopBid(activeMarketItem)?.amount ?? activeMarketItem.bidding.floor} WLD</strong>
              </div>
              <p>
                Seller target {activeMarketItem.bidding.target} WLD. Next bid must be at least {getMinimumNextBid(activeMarketItem)} WLD.
              </p>
              <div className="bid-stepper-card">
                <button onClick={() => setQuickBid(activeMarketItem, getMinimumNextBid(activeMarketItem))} type="button">
                  Minimum
                </button>
                <button onClick={() => setQuickBid(activeMarketItem, activeMarketItem.bidding!.target)} type="button">
                  Seller target
                </button>
                <span>Recent bids stay saved in your receipt trail after submission.</span>
              </div>
              <div className="bid-row">
                <input
                  aria-label={`Bid amount for ${activeMarketItem.title}`}
                  inputMode="decimal"
                  onChange={(event) =>
                    setBidDrafts((current) => ({
                      ...current,
                      [activeMarketItem.title]: event.target.value,
                    }))
                  }
                  placeholder={`${activeMarketItem.bidding.floor}+ WLD`}
                  value={bidDrafts[activeMarketItem.title] ?? ""}
                />
                <button
                  aria-busy={isMarketActionBusy("bid", activeMarketItem)}
                  disabled={Boolean(marketBusyAction)}
                  onClick={() => void placeBid(activeMarketItem)}
                  type="button"
                >
                  {isMarketActionBusy("bid", activeMarketItem) ? "Sending..." : "Place bid"}
                </button>
              </div>
            </div>
          ) : (
            <div className="direct-chat-note detail-direct-note">
              Direct sale. Use seller chat to confirm condition, pickup route, payment timing, and inspection before paying.
            </div>
          )}
          <dl>
            <div>
              <dt>Seller</dt>
              <dd>{itemInfo.seller}</dd>
            </div>
            <div>
              <dt>Condition</dt>
              <dd>{itemInfo.condition}</dd>
            </div>
            <div>
              <dt>Area</dt>
              <dd>{itemInfo.area}</dd>
            </div>
            <div>
              <dt>Distance</dt>
              <dd>{itemInfo.distance}</dd>
            </div>
            <div>
              <dt>Sale</dt>
              <dd>{itemInfo.trade}</dd>
            </div>
            <div>
              <dt>Photos</dt>
              <dd>{itemInfo.photos} image{itemInfo.photos === 1 ? "" : "s"} attached</dd>
            </div>
            <div>
              <dt>Listed</dt>
              <dd>{itemInfo.createdAt}</dd>
            </div>
            {itemInfo.link ? (
              <div>
                <dt>Seller link</dt>
                <dd>{itemInfo.link}</dd>
              </div>
            ) : null}
            <div>
              <dt>Safety</dt>
              <dd>Inspect photos, confirm in World Chat, and avoid off-app prepayment pressure.</dd>
            </div>
          </dl>
          <div className="market-detail-actions">
            <button
              aria-busy={isMarketActionBusy("hold", activeMarketItem)}
              disabled={Boolean(marketBusyAction)}
              onClick={() => void bookMarketItem(activeMarketItem)}
              type="button"
            >
              {isMarketActionBusy("hold", activeMarketItem) ? "Holding..." : "Book / hold item"}
            </button>
            <button
              aria-busy={isMarketActionBusy("chat", activeMarketItem)}
              className="secondary"
              disabled={Boolean(marketBusyAction)}
              onClick={() => void messageMarketplaceSeller(activeMarketItem)}
              type="button"
            >
              {isMarketActionBusy("chat", activeMarketItem) ? "Opening..." : "Message seller"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="screen marketplace-screen">
      <section className="market-hero compact-market-hero">
        <div className="market-hero-top">
          <div>
            <span className="section-kicker">Verified local trade</span>
            <h1>Human Market</h1>
          </div>
          <Store size={24} />
        </div>
        <div className={`market-verification-band compact ${marketVerificationTier.className}`}>
          <div className="market-verification-mark" aria-hidden="true">
            <BadgeCheck size={20} />
          </div>
          <div>
            <span>{marketVerificationTier.label}</span>
            <strong>{sellerHandle}</strong>
            <small>
              {marketVerificationTier.score}/100 usage score - {marketVerificationTier.next}
            </small>
          </div>
        </div>
        <div className="market-premium-strip compact" aria-label="Marketplace trust status">
          <span>
            <ShieldCheck size={15} />
            Human verified
          </span>
          <span>
            <LockKeyhole size={15} />
            Receipts saved
          </span>
          <span>
            <MessageCircleQuestion size={15} />
            Chat-first deals
          </span>
        </div>
        {!locationReady ? (
          <div className="market-location-card">
            <MapPin size={18} />
            <div>
              <strong>Connect nearby market</strong>
              <span>Allow location in World App or enter an area for nearby ranking.</span>
              <small>No nearby location shared yet. Opened from {worldLaunchLabel}.</small>
            </div>
            <button
              disabled={marketLocation.status === "requesting"}
              onClick={requestMarketplaceLocation}
              type="button"
            >
              {marketLocation.status === "requesting" ? "..." : "GPS"}
            </button>
          </div>
        ) : (
          <div className="market-location-verified">
            <MapPin size={16} />
            <span>{marketLocation.source === "manual" ? "Manual area" : "GPS area"}</span>
            <strong>{marketLocation.label}</strong>
          </div>
        )}
        {!locationReady ? (
          <div className="manual-location-row">
            <input
              aria-label="Manual marketplace area"
              onChange={(event) => setManualArea(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyManualMarketplaceArea();
                }
              }}
              placeholder="Area, e.g. Westlands"
              value={manualArea}
            />
            <button onClick={applyManualMarketplaceArea} type="button">
              Use area
            </button>
          </div>
        ) : null}
        <small className="market-transparency-note">
          World MiniKit identifies launch and device context; nearby ranking uses the World App WebView location permission only after you choose it.
        </small>
      </section>

      <section className="market-panel market-discovery-panel">
        <div className="search-field market-search">
          <Search size={16} />
          <input
            aria-label="Search marketplace"
            onChange={(event) => setMarketSearch(event.target.value)}
            placeholder="Search items, sellers, areas"
            value={marketSearch}
          />
        </div>
        <div className="market-filter-row">
          {["Products", "Services", "Jobs", "Digital Goods"].map((filter) => (
            <button
              className={activeFilter === filter ? "active" : ""}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="applied-filter-row">
          <span>{activeFilter}</span>
          {marketSearch.trim() ? <span>Search: {marketSearch.trim()}</span> : null}
          {locationReady ? <span>{marketLocation.source === "manual" ? "Manual area active" : "GPS active"}</span> : <span>No hidden GPS</span>}
        </div>
      </section>

      <section className="market-actions">
        <button
          onClick={() => {
            setMarketMode("sell");
            act("Sell item", "Listing studio opened. Add 3+ photos, price, condition, area, and proof before publishing.");
          }}
          type="button"
        >
          <PlusCircle size={19} />
          <span>Sell item</span>
          <strong>Start</strong>
        </button>
        <button
          onClick={() => {
            if (!marketplaceListings.length) {
              act("Boost needs a listing", "Create or select a listing before buying a local boost.");
              setMarketMode("sell");
              return;
            }

            publishListing(marketplacePlans[2]);
          }}
          type="button"
        >
          <HandCoins size={19} />
          <span>Boost listing</span>
          <strong>2 WLD</strong>
        </button>
        <button
          onClick={() => {
            act("Business review", "Business ads require a verified seller, disclosure, reviewed copy, and a clean destination link.");
            publishListing(marketplacePlans[3]);
          }}
          type="button"
        >
          <HandCoins size={19} />
          <span>Business ad</span>
          <strong>4 WLD</strong>
        </button>
      </section>

      {marketMode === "sell" ? (
      <section className="market-panel listing-studio">
        <div className="section-heading">
          <span>Listing wizard</span>
          <Upload size={18} />
        </div>
        <button className="market-detail-back" onClick={() => setMarketMode("browse")} type="button">
          Back to market
        </button>
        <div className="seller-flow-steps" aria-label="Listing progress">
          {["Photos", "Details", "Trust", "Review", "Publish"].map((step, index) => (
            <span key={step}>
              <b>{index + 1}</b>
              {step}
            </span>
          ))}
        </div>
        <p className="seller-flow-note">
          Add 2 free real item photos. Images 3-5 unlock with a 1.5 WLD photo pack. HumanChain stores coarse area, never a home address.
        </p>
        <div className="listing-section-label">1. Photos</div>
        <div className="listing-photo-zone">
          <label className="listing-upload">
            <Upload size={20} />
            <strong>Add item photos</strong>
            <span>Add 2 photos free. Select 3-5 photos to unlock the 1.5 WLD photo pack for richer buyer proof.</span>
            <input
              accept="image/*"
              multiple
              onChange={(event) => handleListingPhotos(event.target.files)}
              type="file"
            />
          </label>
          <div className="listing-photo-grid special">
            {Array.from({ length: 5 }, (_, slot) => slot).map((slot) => {
              const photo = listingPhotos[slot];

              return (
                <div className={photo ? "filled" : ""} key={slot}>
                  {photo ? <img alt={photo.name} src={photo.src} /> : <span>{slot + 1}</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="listing-fields">
          <div className="listing-section-label">2. Price and item facts</div>
          <input
            aria-label="Item title"
            onChange={(event) => updateListingDraft("title", event.target.value)}
            placeholder="Item title, e.g. iPhone 12 clean"
            value={listingDraft.title}
          />
          <input
            aria-label="Price"
            onChange={(event) => updateListingDraft("price", event.target.value)}
            placeholder="Target price, e.g. 18 WLD or KES 12,000"
            value={listingDraft.price}
          />
          <select
            aria-label="Sale mode"
            onChange={(event) =>
              updateListingDraft(
                "saleMode",
                event.target.value as MarketplaceListing["saleMode"],
              )
            }
            value={listingDraft.saleMode}
          >
            <option value="direct">Direct chat sale</option>
            <option value="bidding">Timed bidding</option>
          </select>
          <input
            aria-label="Minimum bid"
            onChange={(event) => updateListingDraft("bidFloor", event.target.value)}
            placeholder="Minimum bid, e.g. 15 WLD"
            value={listingDraft.bidFloor}
          />
          <select
            aria-label="Listing duration"
            onChange={(event) => updateListingDraft("duration", event.target.value)}
            value={listingDraft.duration}
          >
            <option>24 hours</option>
            <option>3 days</option>
            <option>7 days</option>
            <option>14 days</option>
          </select>
          <select
            aria-label="Condition"
            onChange={(event) => updateListingDraft("condition", event.target.value)}
            value={listingDraft.condition}
          >
            <option disabled value="">Condition</option>
            <option>New listed</option>
            <option>Second hand</option>
            <option>Refurbished</option>
            <option>Service or business</option>
          </select>
          <div className="listing-section-label">3. Trust, defects, pickup</div>
          <input
            aria-label="Pickup area"
            onChange={(event) => updateListingDraft("area", event.target.value)}
            placeholder="Pickup area or delivery route"
            value={listingDraft.area}
          />
          <input
            aria-label="Business or product link"
            onChange={(event) => updateListingDraft("link", event.target.value)}
            placeholder="Optional link: shop, WhatsApp, website"
            value={listingDraft.link}
          />
          <textarea
            aria-label="Listing details"
            onChange={(event) => updateListingDraft("details", event.target.value)}
            placeholder="Premium details: size, defects, warranty, delivery route, receipt, pickup safety, why buyers should trust it."
            value={listingDraft.details}
          />
          <div className="listing-section-label">4. Review and publish</div>
        </div>
        <div className="listing-checklist">
          {marketplaceChecklist.map((item) => (
            <span key={item}>
              <CheckCircle2 size={14} />
              {item}
            </span>
          ))}
        </div>
        <section className="listing-review-card" aria-label="Listing review">
          <span className="section-kicker">Review before publish</span>
          <strong>{listingDraft.title.trim() || "Item title missing"}</strong>
          <p>
            {listingDraft.price.trim() || "Price missing"} - {listingDraft.condition || "Condition missing"} - {listingDraft.area.trim() || "Area missing"}
          </p>
          <div className="stored-market-trust">
            <span>{listingPhotos.length}/2 free photos</span>
            <span>{listingPhotoPackUnlocked ? "5-photo pack unlocked" : "3-5 photos: 1.5 WLD"}</span>
            <span>{listingDraft.saleMode === "bidding" ? "Timed bidding" : "Chat-first sale"}</span>
            <span>Verified username: {sellerHandle}</span>
          </div>
        </section>
        <button
          className="primary-command"
          disabled={listingPhotos.length < 2 || !listingDraft.title.trim() || !listingDraft.price.trim()}
          onClick={() => {
            if (saveMarketplaceListing()) {
              publishListing(marketplacePlans[0]);
            }
          }}
          type="button"
        >
          Publish Verified Listing - 2 WLD
        </button>
      </section>
      ) : (
        <section className="market-panel market-seller-prompt">
          <div>
            <span className="section-kicker">Seller flow</span>
            <h2>Ready to sell something?</h2>
            <p>
              Start a guided listing when you need it. The market stays clean for browsing until a seller intentionally opens the posting process.
            </p>
          </div>
          <button onClick={() => setMarketMode("sell")} type="button">
            <PlusCircle size={18} />
            Sell item
          </button>
        </section>
      )}

      {marketplaceListings.length ? (
        <section className="market-panel stored-market-panel">
          <div className="section-heading">
            <span>Stored marketplace history</span>
            <Library size={18} />
          </div>
          {marketplaceListings.slice(0, 4).map((listing) => (
            <article className="stored-market-row" key={listing.id}>
              <button
                aria-label={`View ${listing.title}`}
                className="stored-market-media"
                onClick={() => setActiveMarketItem(listing)}
                type="button"
              >
                {listing.photos[0] ? (
                  <img alt={listing.photos[0].name} src={listing.photos[0].src} />
                ) : (
                  <Tag size={18} />
                )}
              </button>
              <div>
                <strong>{listing.title}</strong>
                <span>
                  {listing.price} - {listing.condition} - seller {listing.seller}
                </span>
                <small>
                  {listing.saleMode === "bidding"
                    ? `Bidding ${listing.duration}, floor ${listing.bidFloor || "not set"}`
                    : "Direct chat sale"}{" "}
                  - {listing.area} - {listing.createdAt} - {listing.ratings ?? 0} look votes - {listing.tips ?? 0} tips - {listing.dataStorageStatus === "cloud-safe" ? "safe receipt" : "local safe"}
                </small>
                <div className="stored-market-trust">
                  <span>Verified seller</span>
                  <span>3-photo proof</span>
                  <span>Chat before payment</span>
                </div>
              </div>
              <button onClick={() => rateMarketItem(listing, listing.title)} type="button">
                Rate
              </button>
              <button onClick={() => tipMarketItem(listing, listing.title)} type="button">
                Tip
              </button>
              <button
                onClick={() => {
                  publishListing(marketplacePlans[2]);
                  recordHistory({
                    title: "Marketplace boost reopened",
                    detail: `${listing.title} was selected for local boost.`,
                    kind: "market",
                  });
                }}
                type="button"
              >
                Boost
              </button>
            </article>
          ))}
        </section>
      ) : null}

      <section className="market-signal-grid">
        {marketplaceSignals.map((signal) => (
          <span key={signal}>{signal}</span>
        ))}
      </section>

      <section className="market-panel">
        <div className="section-heading">
          <span>Discover near you</span>
          <ShoppingBag size={18} />
        </div>
        <div className="market-list">
          {filteredItems.length ? filteredItems.map((item) => {
            const ratingKey = `${item.seller}:${item.title}`;
            const itemSocial = marketRatings[ratingKey] ?? { rating: 0, tips: 0 };
            const itemComments = marketComments[getMarketItemKey(item)] ?? [];

            return (
            <article className={`market-item ${item.tone}`} key={item.title}>
              <button
                aria-label={`View ${item.title}`}
                className="market-thumb-stack"
                onClick={() => setActiveMarketItem(item)}
                type="button"
              >
                {getMarketItemImages(item).map((image, index) => (
                  <img
                    alt={`${item.title} image ${index + 1}`}
                    key={`${item.title}-${index}`}
                    src={image}
                  />
                ))}
              </button>
              <div>
                <div className="market-item-top">
                  <strong>{item.title}</strong>
                  <span>{item.price}</span>
                </div>
                <p>
                  {item.condition} by {item.seller} in {item.location}
                </p>
                <div className="market-item-meta">
                  <span>{item.distance}</span>
                  <span>{item.tag}</span>
                  <span>{item.photos} photos</span>
                  <span>{item.trust}</span>
                  <span>{itemSocial.rating} look votes</span>
                  <span>{itemSocial.tips} tips</span>
                  <span>{itemComments.length} comments</span>
                </div>
                <div className="market-trust-row">
                  <span>
                    <ShieldCheck size={13} />
                    Verified seller
                  </span>
                  <span>
                    <LockKeyhole size={13} />
                    Receipt-ready bid
                  </span>
                  <span>
                    <MessageCircleQuestion size={13} />
                    Inspect before pay
                  </span>
                </div>
                <small>{getShortText(item.quality, 112)}</small>
                <div className="market-card-summary">
                  {item.bidding ? (
                    <>
                      <span>Best bid {getTopBid(item)?.amount ?? item.bidding.floor} WLD</span>
                      <span>Closes {item.bidding.ends}</span>
                    </>
                  ) : (
                    <>
                      <span>Direct chat sale</span>
                      <span>Inspect first</span>
                    </>
                  )}
                </div>
              </div>
              <div className="market-card-actions">
                <button onClick={() => setActiveMarketItem(item)} type="button">
                  View details
                </button>
                <button onClick={() => rateMarketItem(item, item.title)} type="button">
                  Rate look
                </button>
                <button onClick={() => tipMarketItem(item, item.title)} type="button">
                  Tip item
                </button>
                <button onClick={() => setActiveMarketItem(item)} type="button">
                  Comment 0.5 WLD
                </button>
                <button
                  aria-busy={isMarketActionBusy("chat", item)}
                  disabled={Boolean(marketBusyAction)}
                  onClick={() => {
                    void messageMarketplaceSeller(item);
                  }}
                  type="button"
                >
                  {isMarketActionBusy("chat", item) ? "Opening..." : "Human Chat"}
                </button>
                <button
                  aria-busy={isMarketActionBusy("share", item)}
                  disabled={Boolean(marketBusyAction)}
                  onClick={() => {
                    void shareMarketItem(item);
                  }}
                  type="button"
                >
                  {isMarketActionBusy("share", item) ? "Sharing..." : "Share"}
                </button>
              </div>
            </article>
            );
          }) : (
            <div className="empty-feed-state">
              <strong>No listings found</strong>
              <span>Try another search, clear a filter, or open the seller flow.</span>
            </div>
          )}
        </div>
      </section>

      <section className="market-panel market-plan-panel">
        <div className="section-heading">
          <span>Small publishing fees</span>
          <CircleDollarSign size={18} />
        </div>
        {marketplacePlans.map((plan) => (
          <button
            className="market-plan"
            key={plan[0]}
            onClick={() => publishListing(plan)}
            type="button"
          >
            <div>
              <strong>{plan[0]}</strong>
              <span>{plan[2]}</span>
            </div>
            <b>{plan[1]}</b>
          </button>
        ))}
        <p>
          Buyers can browse and chat freely. Sellers and advertisers pay a small
          publishing fee, choose direct inbox sale or timed bidding, and receive
          offer alerts so the marketplace stays serious, affordable, and clean.
        </p>
      </section>

      <section className="market-panel">
        <div className="section-heading">
          <span>Business marketing</span>
          <Send size={18} />
        </div>
        <div className="market-link-box">
          <strong>Promote a shop, service, event, page, or WhatsApp link.</strong>
          <p>
            Ads can include a verified owner, location, short pitch, image,
            external link, and contact button. Links stay visible but are
            clearly marked as marketing.
          </p>
          <button
            onClick={() => publishListing(marketplacePlans[3])}
            type="button"
          >
            Prepare business ad
          </button>
          <button
            onClick={() => {
              void shareWithWorld({
                title: "HumanChain Market business ad",
                text: "Promote a verified local shop, service, event, or link inside HumanChain Market.",
                url: process.env.NEXT_PUBLIC_APP_URL,
              });
            }}
            type="button"
          >
            Share ad preview
          </button>
        </div>
      </section>

      <section className="market-panel market-guidelines-panel">
        <div className="section-heading">
          <span>Market guidelines</span>
          <ShieldCheck size={18} />
        </div>
        <div className="market-guidelines-grid">
          {marketplaceTrustRails.map(([title, detail]) => (
            <article key={title}>
              <BadgeCheck size={16} />
              <strong>{title}</strong>
              <span>{detail}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="market-panel business-ad-showcase">
        <div className="section-heading">
          <span>Business ad examples</span>
          <Send size={18} />
        </div>
        <p className="business-ad-intro">
          Real businesses can publish clean, verified ads after payment. These examples
          show how a buyer should see the offer before opening chat or booking.
        </p>
        <div className="business-ad-grid">
          {marketplaceBusinessAds.map((ad) => (
            <article className="business-ad-card" key={ad.title}>
              <img alt="" src={ad.image} />
              <div>
                <span>{ad.tag} - {ad.area}</span>
                <strong>{ad.title}</strong>
                <p>{ad.offer}</p>
                <small>{ad.owner} - {ad.signal}</small>
              </div>
              <button
                onClick={() => {
                  recordHistory({
                    title: "Business ad opened",
                    detail: `${ad.title} by ${ad.owner} was opened from HumanChain Market.`,
                    kind: "market",
                  });
                  act(ad.title, "Business ad preview opened. Chat and booking stay user controlled.");
                }}
                type="button"
              >
                View ad
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
