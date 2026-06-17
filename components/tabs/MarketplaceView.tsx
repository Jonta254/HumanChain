"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Flame,
  Gavel,
  Globe2,
  HandCoins,
  Languages,
  Library,
  LockKeyhole,
  MapPin,
  MessageCircle,
  MessageCircleQuestion,
  Package,
  PlusCircle,
  Scale,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tag,
  Upload,
  Users,
  Wrench,
  Zap,
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

// ─────────────────────────────────────────────────────────────────────────────
// NEARBY MARKET — seed data (restored from original with real Unsplash photos)
// ─────────────────────────────────────────────────────────────────────────────

const MARKET_ITEMS = [
  {
    id: "seed-1",
    title: "Samsung Galaxy A54 5G",
    seller: "@mombasa_mobiles",
    condition: "Second hand",
    price: "WLD 68",
    distance: "4.8 km",
    location: "Nyali, Mombasa",
    tag: "Electronics",
    trust: "World ID seller",
    tone: "blue",
    photos: 3,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=82",
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=800&q=82",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=82",
    ],
    quality: "Front, back, screen-on, charger included. Small edge marks disclosed.",
    bidding: {
      target: 68,
      floor: 60,
      ends: "18h left",
      offers: [
        { buyer: "@coast_buyer", amount: 60, note: "Can inspect in Nyali this evening." },
        { buyer: "@techmama", amount: 64, note: "Cashless pickup after screen test." },
      ],
    },
    isFeatured: true,
  },
  {
    id: "seed-2",
    title: "Handmade Ankara Tote Bag",
    seller: "@amina_makes",
    condition: "Brand New",
    price: "WLD 6",
    distance: "6.2 km",
    location: "Milimani, Kisumu",
    tag: "Fashion",
    trust: "3 verified buyers",
    tone: "gold",
    photos: 4,
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=82",
      "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=800&q=82",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=82",
    ],
    quality: "Fresh photos of fabric, stitching, lining, and size held by seller.",
    bidding: {
      target: 6,
      floor: 5,
      ends: "2d left",
      offers: [
        { buyer: "@giftbuyer", amount: 5, note: "Need two bags if available." },
      ],
    },
    isFeatured: false,
  },
  {
    id: "seed-3",
    title: "Mama Nia Lunch Bowls",
    seller: "@mamania_eats",
    condition: "Available Today",
    price: "WLD 1.2",
    distance: "2.7 km",
    location: "Milimani, Nakuru",
    tag: "Food",
    trust: "Repeat local buyers",
    tone: "green",
    photos: 3,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=82",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=82",
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=700&q=82",
    ],
    quality: "Food close-up, packaging, and pickup counter photos.",
    bidding: null,
    isFeatured: false,
  },
  {
    id: "seed-4",
    title: "GlowBarber — Weekend Slots",
    seller: "@glowbarber_ke",
    condition: "Service",
    price: "Book slot",
    distance: "7.1 km",
    location: "Rupa Mall, Eldoret",
    tag: "Services",
    trust: "Verified service owner",
    tone: "gold",
    photos: 3,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=700&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=700&q=82",
      "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=700&q=82",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=700&q=82",
    ],
    quality: "Shop-front, chair setup, and finished cut photos.",
    bidding: null,
    isFeatured: true,
  },
  {
    id: "seed-5",
    title: "Used Study Desk",
    seller: "@student_chain",
    condition: "Second hand",
    price: "WLD 14",
    distance: "1.6 km",
    location: "Section 58, Nakuru",
    tag: "Furniture",
    trust: "Pickup only",
    tone: "violet",
    photos: 3,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=82",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=82",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=82",
    ],
    quality: "Wide angle, drawer close-up, scratch disclosure, and pickup doorway view.",
    bidding: {
      target: 14,
      floor: 11,
      ends: "9h left",
      offers: [
        { buyer: "@campusbuyer", amount: 11, note: "Can collect near Ngong Road." },
      ],
    },
    isFeatured: false,
  },
  {
    id: "seed-6",
    title: "Studio Kitenge Photoshoot",
    seller: "@studio_kitenge",
    condition: "Service",
    price: "WLD 8",
    distance: "5.2 km",
    location: "Kisumu CBD",
    tag: "Creative",
    trust: "Portfolio verified",
    tone: "violet",
    photos: 3,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=82",
      "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=700&q=82",
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=700&q=82",
    ],
    quality: "Portfolio sample, studio corner, and camera setup photos.",
    bidding: null,
    isFeatured: false,
  },
];

type SeedItem = typeof MARKET_ITEMS[number];

const BUSINESS_ADS = [
  {
    title: "Taste 254 Lunch Launch",
    owner: "@taste254",
    area: "Kileleshwa, Nairobi",
    offer: "Fresh lunch bowls, office delivery 11:30–14:30. WLD 2 booking.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=82",
    tag: "Food",
    signal: "18 saved this week",
  },
  {
    title: "GlowBarber Weekend Slots",
    owner: "@glowbarber_ke",
    area: "Rupa Mall, Eldoret",
    offer: "Haircuts, beard lineups, clean chair photos before booking.",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=700&q=82",
    tag: "Service",
    signal: "Open slots today",
  },
  {
    title: "Studio Kitenge Portraits",
    owner: "@studio_kitenge",
    area: "Kisumu CBD",
    offer: "Portrait sessions for founders, families, products, and events.",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=700&q=82",
    tag: "Creative",
    signal: "Portfolio verified",
  },
];

const MARKET_PLANS = [
  ["Quick listing",    "2 WLD",   "Publish one item with 2 included photos."],
  ["Extra photo pack", "1.5 WLD", "Add up to 3 more photos to one listing."],
  ["Local boost",      "2 WLD",   "Push a listing higher in nearby discovery."],
  ["Business ad",      "4 WLD",   "Market a shop, service, event, or link."],
] as const;

const MARKET_CHECKLIST = [
  "2 real item photos", "Price and condition",
  "Pickup area or delivery note", "Defects noted",
  "Seller chat enabled", "No off-app prepayment pressure",
];

const MARKET_FILTERS = ["All", "Electronics", "Fashion", "Food", "Furniture", "Services", "Creative"];

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES — seed data
// ─────────────────────────────────────────────────────────────────────────────

const NICHES = [
  { id: "all",           label: "All",           icon: Sparkles,  color: "#2f6fed" },
  { id: "legal",         label: "Legal",         icon: Scale,     color: "#2f6fed" },
  { id: "translation",   label: "Translation",   icon: Languages, color: "#246b55" },
  { id: "manufacturing", label: "Manufacturing", icon: Wrench,    color: "#ef7d69" },
  { id: "consulting",    label: "Consulting",    icon: Briefcase, color: "#b98218" },
  { id: "tech",          label: "Tech & Dev",    icon: Sparkles,  color: "#6657d9" },
  { id: "design",        label: "Design",        icon: Sparkles,  color: "#d87d3a" },
  { id: "healthcare",    label: "Healthcare",    icon: ShieldCheck, color: "#0f9d6c" },
  { id: "finance",       label: "Finance",       icon: CircleDollarSign, color: "#b98218" },
];

const SEED_JOBS = [
  {
    id: "j1", type: "job" as const, niche: "translation",
    title: "Swahili–Portuguese Medical Document Translation",
    detail: "8 case files, ~4,000 words. Medical terminology required. 5-day turnaround.",
    budget: "WLD 85", region: "Kenya → Brazil", deadline: "5 days",
    proposals: 3, urgent: true, poster: "@mercy_clinic",
    skills: ["Medical terms", "Swahili", "Portuguese"], color: "#246b55",
  },
  {
    id: "j2", type: "job" as const, niche: "legal",
    title: "South African Mining Regulation Consultant",
    detail: "MPRDA compliance review for a new operation. Remote advisory welcome.",
    budget: "WLD 220", region: "South Africa", deadline: "12 days",
    proposals: 7, urgent: false, poster: "@khumalo_mining",
    skills: ["SA mining law", "MPRDA", "Compliance"], color: "#2f6fed",
  },
  {
    id: "j3", type: "job" as const, niche: "manufacturing",
    title: "Custom Motorcycle Parts Fabricator — Colombia",
    detail: "CNC machining for custom exhaust and brake components. Small batch of 20 units.",
    budget: "WLD 340", region: "Latin America", deadline: "21 days",
    proposals: 2, urgent: false, poster: "@moto_bogota",
    skills: ["CNC machining", "Steel fabrication", "Custom parts"], color: "#ef7d69",
  },
  {
    id: "j4", type: "job" as const, niche: "legal",
    title: "Hausa Business Contract Review",
    detail: "Partnership agreement in English and Hausa. Nigerian commercial law required.",
    budget: "WLD 60", region: "Nigeria", deadline: "3 days",
    proposals: 1, urgent: true, poster: "@lagos_ventures",
    skills: ["Hausa", "Nigerian law", "Contracts"], color: "#b98218",
  },
  {
    id: "j5", type: "job" as const, niche: "consulting",
    title: "Market Entry Consultant — Philippines Healthcare",
    detail: "FDA Philippines registration guidance for a medical device. Prior experience required.",
    budget: "WLD 180", region: "Philippines", deadline: "14 days",
    proposals: 5, urgent: false, poster: "@medtech_ph",
    skills: ["FDA PH", "Healthcare", "Market entry"], color: "#6657d9",
  },
  {
    id: "j6", type: "job" as const, niche: "tech",
    title: "Next.js + Supabase Dashboard — WLD Payment Integration",
    detail: "Build a dashboard that connects to Supabase and integrates WLD payments. Fullstack preferred.",
    budget: "WLD 420", region: "Remote / Worldwide", deadline: "18 days",
    proposals: 9, urgent: false, poster: "@buildwith_world",
    skills: ["Next.js", "Supabase", "WLD API", "TypeScript"], color: "#6657d9",
  },
  {
    id: "j7", type: "job" as const, niche: "design",
    title: "Brand Identity for Verified African Startup",
    detail: "Logo, color palette, and brand guidelines for a Web3 fintech brand. Afro-modern aesthetic.",
    budget: "WLD 130", region: "West Africa / Remote", deadline: "10 days",
    proposals: 4, urgent: false, poster: "@nairobi_startup",
    skills: ["Branding", "Figma", "African design", "Logo"], color: "#d87d3a",
  },
  {
    id: "j8", type: "job" as const, niche: "healthcare",
    title: "Community Health Educator — Rural Uganda",
    detail: "Create a 3-session curriculum on maternal health for rural women. Luganda required.",
    budget: "WLD 95", region: "Uganda", deadline: "7 days",
    proposals: 2, urgent: true, poster: "@health_uganda",
    skills: ["Luganda", "Public health", "Curriculum design"], color: "#0f9d6c",
  },
  {
    id: "j9", type: "job" as const, niche: "finance",
    title: "WLD Treasury Audit — Small Cooperative",
    detail: "Review a 6-month treasury ledger for a 40-member cooperative. On-chain records available.",
    budget: "WLD 150", region: "East Africa", deadline: "9 days",
    proposals: 3, urgent: false, poster: "@sacco_chain",
    skills: ["On-chain audit", "WLD", "Cooperative finance"], color: "#b98218",
  },
];

const SEED_PROVIDERS = [
  { id: "p1", name: "Kwame Asante",  initial: "K", specialty: "Medical & Legal Translation",  niche: "translation",   region: "Ghana",           rating: 5.0, jobs: 132, color: "#246b55" },
  { id: "p2", name: "Amara Diallo",  initial: "A", specialty: "West African Commercial Law",  niche: "legal",         region: "Senegal",         rating: 4.9, jobs: 84,  color: "#2f6fed" },
  { id: "p3", name: "Lena Morales",  initial: "L", specialty: "CNC & Custom Fabrication",     niche: "manufacturing", region: "Guadalajara, MX", rating: 4.8, jobs: 61,  color: "#ef7d69" },
  { id: "p4", name: "Priya Nair",    initial: "P", specialty: "South Asian Healthcare",       niche: "consulting",    region: "Bangalore, IN",   rating: 4.7, jobs: 49,  color: "#b98218" },
  { id: "p5", name: "David Mwangi",  initial: "D", specialty: "Next.js · Supabase · WLD API", niche: "tech",          region: "Nairobi, KE",     rating: 5.0, jobs: 38,  color: "#6657d9" },
  { id: "p6", name: "Yemi Adeyemi",  initial: "Y", specialty: "Afro-modern Brand Identity",  niche: "design",        region: "Lagos, NG",       rating: 4.9, jobs: 56,  color: "#d87d3a" },
  { id: "p7", name: "Grace Otieno",  initial: "G", specialty: "Community & Public Health",    niche: "healthcare",    region: "Kisumu, KE",      rating: 4.8, jobs: 27,  color: "#0f9d6c" },
  { id: "p8", name: "Ahmed Balogun", initial: "A", specialty: "Cooperative & DeFi Finance",   niche: "finance",       region: "Abuja, NG",       rating: 4.9, jobs: 43,  color: "#b98218" },
];

const BUDGET_PRESETS   = ["WLD 25", "WLD 50", "WLD 100", "WLD 200", "WLD 500"];
const DEADLINE_OPTIONS = ["3 days", "1 week", "2 weeks", "1 month", "Flexible"];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TopTab  = "market" | "services";
type SvcMode = "browse" | "post-job" | "offer-service";

interface LocalJob {
  id: string; type: "job"; niche: string; title: string; detail: string;
  budget: string; region: string; deadline: string; proposals: number;
  urgent: boolean; poster: string; skills: string[]; color: string; postedAt: string;
}

interface LocalService {
  id: string; type: "service"; niche: string; title: string; detail: string;
  rate: string; region: string; languages: string; provider: string;
  rating: number; jobs: number; color: string; postedAt: string;
}

type AnyJob     = typeof SEED_JOBS[number] | LocalJob;
type SvcListing = AnyJob | LocalService;

// ─────────────────────────────────────────────────────────────────────────────
// Helper — notification cooldown
// ─────────────────────────────────────────────────────────────────────────────

function canNotify(wallet: string, key: string, coolMs = 3_600_000) {
  try {
    const k = `hc_notif:${wallet}:${key}`;
    if (Date.now() - Number(localStorage.getItem(k) ?? 0) < coolMs) return false;
    localStorage.setItem(k, Date.now().toString());
    return true;
  } catch { return true; }
}

async function storeData(kind: string, id: string | number, data: unknown) {
  try {
    const r = await fetch("/api/data/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, id, kind }),
    });
    const p = (await r.json()) as { ok?: boolean; url?: string };
    return { ok: Boolean(p.ok && p.url), url: p.url };
  } catch { return { ok: false }; }
}

function getInitialBids() {
  return Object.fromEntries(
    MARKET_ITEMS.map((item) => [
      item.id,
      (item.bidding?.offers ?? []).map((o, i) => ({
        ...o, id: i + 1, createdAt: "Seed", status: "sent" as const,
      })),
    ]),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MarketplaceView({
  act,
  addNotification,
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
  addNotification: (title: string, detail: string, sector?: "welcome" | "inbox" | "marketplace" | "daily" | "stories" | "payments" | "account") => void;
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
  // ── Top tab ───────────────────────────────────────────────────────────────
  const [topTab, setTopTab] = useState<TopTab>("market");

  // ── Market state ──────────────────────────────────────────────────────────
  const [marketFilter, setMarketFilter] = useState("All");
  const [marketSearch, setMarketSearch] = useState("");
  const [manualArea, setManualArea]     = useState(() =>
    marketLocation.source === "manual"
      ? marketLocation.label.replace(/^Manual area:\s*/, "")
      : "Nairobi",
  );
  const [activeItem, setActiveItem]   = useState<SeedItem | MarketplaceListing | null>(null);
  const [showSell, setShowSell]       = useState(false);
  const [galleryIdx, setGalleryIdx]   = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Bids
  const [bidDrafts, setBidDrafts]   = useState<Record<string, string>>({});
  const [marketBids, setMarketBids] = useState<Record<string, MarketBid[]>>(() =>
    loadJsonFromStorage(storageKeys.bids, getInitialBids()),
  );
  // Ratings + tips
  const [marketRatings, setMarketRatings] = useState<Record<string, { rating: number; tips: number }>>(() =>
    loadJsonFromStorage(storageKeys.marketRatings, {}),
  );
  // Comments
  const [marketComments, setMarketComments] = useState<Record<string, string[]>>(() =>
    loadJsonFromStorage(storageKeys.marketComments, {}),
  );
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  // Holds
  const [marketHolds, setMarketHolds] = useState<MarketHold[]>(() =>
    loadJsonFromStorage(storageKeys.marketHolds, []),
  );
  // Listing wizard
  const [listingPhotos, setListingPhotos] = useState<Array<{ id: number; name: string; src: string }>>([]);
  const [photoPackUnlocked, setPhotoPackUnlocked] = useState(false);
  const [boostedListings, setBoostedListings] = useState(false);
  const [adPosted, setAdPosted] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [listingDraft, setListingDraft] = useState({
    area: "", bidFloor: "", condition: "", details: "",
    duration: "3 days", link: "", price: "", saleMode: "direct" as MarketplaceListing["saleMode"],
    title: "",
  });

  // ── Services state ────────────────────────────────────────────────────────
  const [svcMode, setSvcMode]     = useState<SvcMode>("browse");
  const [activeNiche, setActiveNiche] = useState("all");
  const [svcSearch, setSvcSearch] = useState("");
  const [activeSvc, setActiveSvc] = useState<SvcListing | null>(null);
  const [localJobs, setLocalJobs] = useState<LocalJob[]>(() =>
    loadJsonFromStorage<LocalJob[]>("hc_local_jobs", []),
  );
  const [localServices, setLocalServices] = useState<LocalService[]>(() =>
    loadJsonFromStorage<LocalService[]>("hc_local_services", []),
  );
  const [jobForm, setJobFormState] = useState({
    title: "", detail: "", niche: "legal", budget: "", deadline: "1 week", region: "",
  });
  const [serviceForm, setServiceFormState] = useState({
    title: "", detail: "", niche: "translation", rate: "", region: "", languages: "",
  });
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // ── Persist ───────────────────────────────────────────────────────────────
  useEffect(() => { saveJsonToStorage(storageKeys.bids, marketBids); }, [marketBids]);
  useEffect(() => { saveJsonToStorage(storageKeys.marketRatings, marketRatings); }, [marketRatings]);
  useEffect(() => { saveJsonToStorage(storageKeys.marketComments, marketComments); }, [marketComments]);
  useEffect(() => { saveJsonToStorage(storageKeys.marketHolds, marketHolds); }, [marketHolds]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handle = humanIdentity?.username ?? "@preview_human";
  const locationReady = marketLocation.status === "ready";
  const worldLaunchLabel = formatWorldLaunchLocation(worldContext.launchLocation);
  const marketUsageRatings = Object.values(marketRatings).reduce((t, r) => t + r.rating, 0) +
    marketplaceListings.reduce((t, l) => t + (l.ratings ?? 0), 0);
  const marketUsageTips = Object.values(marketRatings).reduce((t, r) => t + r.tips, 0) +
    marketplaceListings.reduce((t, l) => t + (l.tips ?? 0), 0);
  const tier = getMarketVerificationTier({
    isVerified: isVerifiedWorldHuman(humanIdentity),
    listingCount: marketplaceListings.length,
    locationReady,
    ratingCount: marketUsageRatings,
    tipCount: marketUsageTips,
  });

  function itemKey(item: SeedItem | MarketplaceListing) {
    return "id" in item && typeof item.id === "number" ? `stored:${item.id}` : `seed:${(item as SeedItem).id}`;
  }

  function getImages(item: SeedItem | MarketplaceListing): string[] {
    if ("gallery" in item && Array.isArray(item.gallery)) return item.gallery.slice(0, 3);
    if ("photos" in item && Array.isArray((item as MarketplaceListing).photos)) {
      return (item as MarketplaceListing).photos.slice(0, 3).map((p) => p.src);
    }
    return [];
  }

  function getInfo(item: SeedItem | MarketplaceListing) {
    const isStored = typeof (item as MarketplaceListing).id === "number";
    return {
      title:     item.title,
      price:     item.price,
      condition: item.condition,
      area:      isStored ? (item as MarketplaceListing).area : (item as SeedItem).location,
      seller:    item.seller,
      sellerWallet: isStored ? (item as MarketplaceListing).sellerWallet : undefined,
      detail:    isStored ? (item as MarketplaceListing).details || "No extra details." : (item as SeedItem).quality,
      photos:    isStored ? (item as MarketplaceListing).photos.length : (item as SeedItem).photos,
      distance:  locationReady
        ? "distance" in item ? `${(item as SeedItem).distance}` : "Nearby"
        : "Connect location to see distance",
      receipt: isStored
        ? (item as MarketplaceListing).dataStorageStatus === "cloud-safe" ? "Cloud receipt" : "Local receipt"
        : "Seed listing · verified signals",
    };
  }

  function topBid(item: SeedItem) {
    const bids = marketBids[item.id] ?? [];
    return bids.reduce<MarketBid | null>((b, o) => (!b || o.amount > b.amount ? o : b), null);
  }

  function minNextBid(item: SeedItem) {
    if (!item.bidding) return 0;
    const top = topBid(item);
    return top ? Math.max(item.bidding.floor, top.amount + 0.5) : item.bidding.floor;
  }

  function setJob(f: keyof typeof jobForm, v: string) { setJobFormState((c) => ({ ...c, [f]: v })); }
  function setSvc(f: keyof typeof serviceForm, v: string) { setServiceFormState((c) => ({ ...c, [f]: v })); }
  function nicheColor(n: string) { return NICHES.find((x) => x.id === n)?.color ?? "#2f6fed"; }

  // ── GPS ───────────────────────────────────────────────────────────────────
  function requestGps() {
    if (marketLocation.status === "requesting") return;
    setMarketLocation((c) => ({ ...c, label: "Requesting GPS…", status: "requesting" }));
    if (!navigator.geolocation) {
      setMarketLocation({ label: "GPS unavailable", source: "unavailable", status: "denied" });
      act("Location unavailable", "Use manual area matching instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let label = `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { "Accept-Language": "en" }, signal: AbortSignal.timeout(5000) },
          );
          if (r.ok) {
            const geo = await r.json() as { address?: { city?: string; town?: string; village?: string; county?: string; state?: string; country?: string } };
            const a = geo.address ?? {};
            const place = a.city ?? a.town ?? a.village ?? a.county ?? a.state ?? "";
            const country = a.country ?? "";
            if (place || country) label = [place, country].filter(Boolean).join(", ");
          }
        } catch { /* keep coordinate fallback */ }
        setMarketLocation({ accuracy: pos.coords.accuracy, label, lat, lng, source: "browser-gps", status: "ready" });
        setListingDraft((c) => ({ ...c, area: label }));
        earnPoints(5, "Nearby market connected with GPS consent.");
      },
      () => {
        setMarketLocation({ label: "Location not allowed", source: "unavailable", status: "denied" });
        act("Location not connected", "Enter your area manually below.");
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 15_000 },
    );
  }

  function applyManualArea() {
    const area = manualArea.trim();
    if (!area) { act("Area needed", "Enter a town, estate, or zone."); return; }
    setMarketLocation({ label: `Manual area: ${area}`, source: "manual", status: "ready" });
    setListingDraft((c) => ({ ...c, area }));
    earnPoints(3, "Manual marketplace area connected.");
  }

  // ── Rate / Tip ────────────────────────────────────────────────────────────
  function rateItem(item: SeedItem | MarketplaceListing) {
    const k = itemKey(item);
    if (typeof (item as MarketplaceListing).id === "number") {
      setMarketplaceListings((c) => c.map((l) => l.id === (item as MarketplaceListing).id ? { ...l, ratings: (l.ratings ?? 0) + 1 } : l));
    } else {
      setMarketRatings((c) => ({ ...c, [k]: { rating: (c[k]?.rating ?? 0) + 1, tips: c[k]?.tips ?? 0 } }));
    }
    earnPoints(3, `Rated ${item.title}.`);
    act("Look vote saved!", `You rated ${item.title}. Buyers see this signal.`);
  }

  function tipItem(item: SeedItem | MarketplaceListing) {
    const isStored = typeof (item as MarketplaceListing).id === "number";
    const k = itemKey(item);
    openPayment({
      title: `Tip ${item.seller}`,
      amount: "1 WLD",
      allowCustomAmount: true,
      detail: `Tip ${item.seller} for ${item.title}. 80% goes to seller, 20% platform.`,
      success: "Tip confirmed. 80/20 split receipt stored.",
      feature: "tip-market-item",
      points: 4,
      onConfirmed: (amount) => {
        if (isStored) {
          setMarketplaceListings((c) => c.map((l) => l.id === (item as MarketplaceListing).id ? { ...l, tips: (l.tips ?? 0) + 1 } : l));
        } else {
          setMarketRatings((c) => ({ ...c, [k]: { rating: c[k]?.rating ?? 0, tips: (c[k]?.tips ?? 0) + 1 } }));
        }
        recordHistory({ title: "Tip confirmed", detail: `${amount} WLD tip to ${item.seller} for ${item.title}.`, kind: "tip" });
        void storeData("marketplace-listing", `tip-${k}-${Date.now()}`, { item: item.title, seller: item.seller, amount, split: { creatorPercent: 80, platformPercent: 20 } });
      },
    });
  }

  // ── Comment ───────────────────────────────────────────────────────────────
  function submitComment(item: SeedItem | MarketplaceListing) {
    if (!requireVerifiedPublicAction(humanIdentity, act, "commenting on listings")) return;
    const k = itemKey(item);
    const draft = commentDrafts[k]?.trim();
    if (!draft) { act("Write a comment", "Add your question or context first."); return; }
    const validation = validateAnswerInput(draft);
    if (!validation.ok) { act("Comment needs work", validation.issues[0] ?? "Adjust before posting."); return; }
    openPayment({
      title: "Post public comment",
      amount: "0.5 WLD",
      detail: `Post a visible comment on ${item.title}. Private buying details stay in seller chat.`,
      success: "Comment posted and stored.",
      feature: "marketplace-comment",
      points: 5,
      onConfirmed: () => {
        const saved = `${handle}: ${draft}`;
        setMarketComments((c) => ({ ...c, [k]: [saved, ...(c[k] ?? [])] }));
        setCommentDrafts((c) => ({ ...c, [k]: "" }));
        recordHistory({ title: "Comment posted", detail: `0.5 WLD comment on ${item.title}.`, kind: "market" });
      },
    });
  }

  // ── Bid ───────────────────────────────────────────────────────────────────
  async function placeBid(item: SeedItem) {
    if (!requireVerifiedPublicAction(humanIdentity, act, "placing bids")) return;
    if (!item.bidding) { act("Direct sale", "This item uses chat-first buying."); return; }
    const amount = Number.parseFloat(bidDrafts[item.id] ?? "");
    const min = minNextBid(item);
    if (!Number.isFinite(amount) || amount < min) {
      act("Bid too low", `Enter at least ${min} WLD.`);
      return;
    }
    const bKey = `bid:${item.id}`;
    if (busyAction) return;
    setBusyAction(bKey);
    const bid: MarketBid = {
      amount, buyer: handle,
      createdAt: new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
      id: (marketBids[item.id]?.length ?? 0) + 1,
      note: amount >= item.bidding.target ? "Meets seller target." : "Saved offer.",
      status: "saved",
    };
    try {
      setMarketBids((c) => ({ ...c, [item.id]: [bid, ...(c[item.id] ?? [])] }));
      void storeData("marketplace-bid", `${item.id}-${bid.id}`, { ...bid, listing: item.title, seller: item.seller });
      setBidDrafts((c) => ({ ...c, [item.id]: "" }));
      recordHistory({ title: "Bid placed", detail: `${amount} WLD on ${item.title}.`, kind: "market" });
      await chatWithWorld({ message: `I placed a ${amount} WLD bid on ${item.title}. Let me know if you can accept.`, to: [item.seller.replace(/^@/, "")] });
      setMarketBids((c) => ({ ...c, [item.id]: (c[item.id] ?? []).map((b) => b.id === bid.id ? { ...b, status: "sent" } : b) }));
      act("Bid sent!", "World Chat opened to confirm with seller.");
    } catch {
      act("Bid saved", "Stored locally. Chat separately to confirm.");
    } finally {
      setBusyAction((c) => c === bKey ? null : c);
    }
  }

  // ── Hold ──────────────────────────────────────────────────────────────────
  async function holdItem(item: SeedItem | MarketplaceListing) {
    if (!requireVerifiedPublicAction(humanIdentity, act, "placing holds")) return;
    if (!locationReady) { act("Location required", "Connect GPS or manual area before holding."); return; }
    const k = itemKey(item);
    const bKey = `hold:${k}`;
    if (busyAction) return;
    setBusyAction(bKey);
    const info = getInfo(item);
    const hold: MarketHold = {
      area: info.area, buyer: handle, buyerWallet: humanIdentity?.wallet,
      createdAt: formatShortTime(), distance: info.distance,
      id: Date.now(), itemKey: k, itemTitle: info.title,
      note: `Hold from ${marketLocation.label}.`, seller: info.seller,
      sellerWallet: info.sellerWallet, status: info.sellerWallet ? "notified" : "local",
    };
    try {
      setMarketHolds((c) => [hold, ...c.filter((h) => h.itemKey !== k)]);
      recordHistory({ title: "Hold started", detail: `${info.title} held by ${handle}.`, kind: "market" });
      void storeData("marketplace-bid", `hold-${k}`, hold);
      if (info.sellerWallet && canNotify(info.sellerWallet, `hold:${k}`)) {
        await fetch("/api/world/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddresses: [info.sellerWallet], title: "Market item interest", message: `${handle} wants to hold ${info.title}.`, path: "/?tab=market", sector: "marketplace", localisations: [{ language: "en", title: "Market item interest", message: `${handle} wants to hold ${info.title}.` }] }),
        }).catch(() => null);
      }
      await chatWithWorld({ message: `Hi ${info.seller}, I want to hold ${info.title} on HumanChain. From: ${marketLocation.label}. Still available?`, to: [info.seller.replace(/^@/, "")] });
      act("Hold confirmed!", "World Chat opened. Seller notified.");
    } catch {
      act("Hold saved", "Stored locally. Chat seller to confirm.");
    } finally {
      setBusyAction((c) => c === bKey ? null : c);
    }
  }

  // ── Share ─────────────────────────────────────────────────────────────────
  async function shareItem(item: SeedItem | MarketplaceListing) {
    const info = getInfo(item);
    try {
      await shareWithWorld({ title: `${info.title} on HumanChain Market`, text: `${info.title} — ${info.price} near ${info.area}. ${info.condition}, ${info.photos} photos.`, url: process.env.NEXT_PUBLIC_APP_URL });
      act("Shared!", "World Share opened.");
    } catch { act("Share unavailable", "Try from World App."); }
  }

  // ── Chat ──────────────────────────────────────────────────────────────────
  async function chatSeller(item: SeedItem | MarketplaceListing) {
    const info = getInfo(item);
    const bKey = `chat:${itemKey(item)}`;
    if (busyAction) return;
    setBusyAction(bKey);
    try {
      await chatWithWorld({ message: `Hi ${info.seller}, I saw ${info.title} on HumanChain Market. Is it still available near ${info.area}?`, to: [info.seller.replace(/^@/, "")] });
      recordHistory({ title: "Chat opened", detail: `Chat for ${info.title} with ${info.seller}.`, kind: "market" });
      act("World Chat opened", `${info.seller}'s inbox is ready.`);
    } catch { act("Chat unavailable", "Try from World App."); }
    finally { setBusyAction((c) => c === bKey ? null : c); }
  }

  // ── Listing wizard ────────────────────────────────────────────────────────
  function updateDraft(f: keyof typeof listingDraft, v: string) {
    setListingDraft((c) => ({ ...c, [f]: v }));
  }

  function handlePhotos(files: FileList | null) {
    if (!files?.length) return;
    const arr = Array.from(files);
    const max = photoPackUnlocked ? 5 : 2;
    if (arr.length > 2 && !photoPackUnlocked) {
      openPayment({
        title: "Photo pack — 1.5 WLD",
        amount: "1.5 WLD",
        detail: "Unlock up to 5 listing photos this session. 2 are free.",
        success: "Extra photos unlocked. Add up to 5 images now.",
        feature: "marketplace-photo-pack",
        points: 6,
        onConfirmed: () => {
          setPhotoPackUnlocked(true);
          recordHistory({ title: "Photo pack unlocked", detail: "1.5 WLD photo pack.", kind: "market" });
        },
      });
      act("Extra photos need WLD", "2 photos are free. Pay 1.5 WLD for up to 5, then re-select.");
      return;
    }
    setListingPhotos([]);
    arr.slice(0, max).forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = () => setListingPhotos((c) => [...c, { id: Date.now() + i, name: file.name, src: String(reader.result) }]);
      reader.readAsDataURL(file);
    });
    act("Photos ready", `${Math.min(arr.length, max)} photos loaded.`);
  }

  function saveListing() {
    if (!requireVerifiedPublicAction(humanIdentity, act, "publishing listings")) return false;
    const v = validateListingInput({ area: listingDraft.area, condition: listingDraft.condition, photos: listingPhotos, price: listingDraft.price, title: listingDraft.title });
    if (!v.ok) { act("Listing needs details", v.issues[0] ?? "Add title, price, condition, area, and 2 photos."); return false; }
    const listing: MarketplaceListing = {
      id: Date.now(), seller: handle, sellerWallet: humanIdentity?.wallet,
      title: listingDraft.title.trim(), price: listingDraft.price.trim(),
      bidFloor: listingDraft.bidFloor.trim(), duration: listingDraft.duration,
      saleMode: listingDraft.saleMode, condition: listingDraft.condition,
      area: listingDraft.area, link: listingDraft.link.trim(), details: listingDraft.details.trim(),
      photos: listingPhotos, ratings: 0, tips: 0, status: "active",
      createdAt: new Intl.DateTimeFormat("en", { day: "2-digit", hour: "2-digit", minute: "2-digit", month: "short" }).format(new Date()),
      dataStorageStatus: "local-safe",
    };
    setMarketplaceListings((c) => [listing, ...c]);
    void storeData("marketplace-listing", listing.id, listing).then((r) => {
      if (!r.ok) return;
      setMarketplaceListings((c) => c.map((l) => l.id === listing.id ? { ...l, dataReceiptUrl: r.url, dataStorageStatus: "cloud-safe" } : l));
    });
    recordHistory({ title: "Listing stored", detail: `${listing.title} saved with ${listingPhotos.length} photos.`, kind: "market" });
    earnPoints(10, "Marketplace listing stored.");
    setListingDraft({ area: "", bidFloor: "", condition: "", details: "", duration: "3 days", link: "", price: "", saleMode: "direct", title: "" });
    setListingPhotos([]);
    setPhotoPackUnlocked(false);
    setShowSell(false);
    return true;
  }

  // ── Services: submit job ──────────────────────────────────────────────────
  function submitJob() {
    if (!requireVerifiedPublicAction(humanIdentity, act, "posting jobs")) return;
    const { title, detail, budget } = jobForm;
    if (!title.trim() || !detail.trim() || !budget.trim()) { act("Missing details", "Add title, description, and budget."); return; }
    openPayment({
      title: "Post a Job — 2 WLD",
      amount: "2 WLD",
      detail: "Your job goes live to verified specialists worldwide.",
      success: "Job posted! Providers will send proposals.",
      feature: "marketplace-job-post",
      points: 10,
      onConfirmed: () => {
        const job: LocalJob = {
          id: `lj-${Date.now()}`, type: "job", niche: jobForm.niche,
          title: title.trim(), detail: detail.trim(),
          budget: budget.trim().startsWith("WLD") ? budget.trim() : `WLD ${budget.trim()}`,
          region: jobForm.region.trim() || "Worldwide",
          deadline: jobForm.deadline, proposals: 0, urgent: false,
          poster: handle, skills: [], color: nicheColor(jobForm.niche),
          postedAt: formatShortTime(),
        };
        const next = [job, ...localJobs];
        setLocalJobs(next);
        saveJsonToStorage("hc_local_jobs", next);
        recordHistory({ title: "Job posted", detail: `${title} · ${budget}`, kind: "market" });
        earnPoints(10, "Job posted.");
        setJobFormState({ title: "", detail: "", niche: "legal", budget: "", deadline: "1 week", region: "" });
        setSvcMode("browse");
      },
    });
  }

  function submitService() {
    if (!requireVerifiedPublicAction(humanIdentity, act, "listing services")) return;
    const { title, detail, rate } = serviceForm;
    if (!title.trim() || !detail.trim() || !rate.trim()) { act("Missing details", "Add title, description, and rate."); return; }
    openPayment({
      title: "List Your Service — 2 WLD",
      amount: "2 WLD",
      detail: "Your profile goes live to clients worldwide.",
      success: "Service listed! Clients can now find you.",
      feature: "marketplace-service-listing",
      points: 12,
      onConfirmed: () => {
        const svc: LocalService = {
          id: `ls-${Date.now()}`, type: "service", niche: serviceForm.niche,
          title: title.trim(), detail: detail.trim(),
          rate: rate.trim().startsWith("WLD") ? rate.trim() : `WLD ${rate.trim()}`,
          region: serviceForm.region.trim() || "Worldwide",
          languages: serviceForm.languages.trim(),
          provider: handle, rating: 0, jobs: 0,
          color: nicheColor(serviceForm.niche), postedAt: formatShortTime(),
        };
        const next = [svc, ...localServices];
        setLocalServices(next);
        saveJsonToStorage("hc_local_services", next);
        recordHistory({ title: "Service listed", detail: `${title} · ${rate}`, kind: "market" });
        earnPoints(12, "Service listed.");
        setServiceFormState({ title: "", detail: "", niche: "translation", rate: "", region: "", languages: "" });
        setSvcMode("browse");
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — Item / Service detail
  // ─────────────────────────────────────────────────────────────────────────

  if (activeItem) {
    const info   = getInfo(activeItem);
    const images = getImages(activeItem);
    const isSeed = !("id" in activeItem && typeof (activeItem as MarketplaceListing).id === "number");
    const seedItem = isSeed ? (activeItem as SeedItem) : null;
    const userListing = !isSeed ? (activeItem as MarketplaceListing) : null;
    const isOwner = Boolean(userListing?.seller === (humanIdentity?.username ?? "@you") || userListing?.seller === humanIdentity?.wallet);
    const isSold = userListing?.status === "sold";
    const k      = itemKey(activeItem);
    const itemComments = marketComments[k] ?? [];
    const hold   = marketHolds.find((h) => h.itemKey === k);
    const curImg = images[galleryIdx] ?? images[0];

    return (
      <div className="screen hcm-detail">
        {/* Gallery */}
        <div className="hcm-gallery">
          {curImg ? (
            <img className="hcm-gallery-main" src={curImg} alt={info.title} />
          ) : (
            <div className="hcm-gallery-empty"><Tag size={32} /></div>
          )}
          {images.length > 1 && (
            <div className="hcm-gallery-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`hcm-gdot ${i === galleryIdx ? "active" : ""}`}
                  onClick={() => setGalleryIdx(i)}
                  type="button"
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          )}
          <button className="hcm-back-btn" onClick={() => { setActiveItem(null); setGalleryIdx(0); }} type="button">
            <ArrowLeft size={15} /> Back
          </button>
          <div className="hcm-gallery-badges">
            <span className="hcm-badge-cond">{info.condition}</span>
            {seedItem?.isFeatured && <span className="hcm-badge-feat"><Flame size={10} />Featured</span>}
            {isSold && <span className="hcm-badge-sold">SOLD</span>}
          </div>
        </div>

        <div className="hcm-detail-body">
          {/* Title + price */}
          <div className="hcm-detail-titlerow">
            <div>
              <span className="hcm-detail-tag">{isSeed ? (activeItem as SeedItem).tag : "Listed"}</span>
              <h1>{info.title}</h1>
            </div>
            <strong className="hcm-detail-price">{info.price}</strong>
          </div>

          <div className="hcm-detail-metarow">
            <span><MapPin size={12} />{info.area}</span>
            <span>{info.distance}</span>
            <span><Camera size={12} />{info.photos} photos</span>
          </div>

          {/* Bid console */}
          {seedItem?.bidding && (
            <div className="hcm-bid-console">
              <div className="hcm-bid-top">
                <span><Gavel size={13} />Bidding · {seedItem.bidding.ends}</span>
                <strong>Top: {topBid(seedItem)?.amount ?? seedItem.bidding.floor} WLD</strong>
              </div>
              <p>Target {seedItem.bidding.target} WLD · Min next bid {minNextBid(seedItem)} WLD</p>
              <div className="hcm-bid-quickbtns">
                <button onClick={() => setBidDrafts((c) => ({ ...c, [seedItem.id]: String(minNextBid(seedItem)) }))} type="button">Min bid</button>
                <button onClick={() => setBidDrafts((c) => ({ ...c, [seedItem.id]: String(seedItem.bidding!.target) }))} type="button">Target</button>
              </div>
              <div className="hcm-bid-row">
                <input
                  aria-label="Bid amount"
                  inputMode="decimal"
                  placeholder={`${seedItem.bidding.floor}+ WLD`}
                  value={bidDrafts[seedItem.id] ?? ""}
                  onChange={(e) => setBidDrafts((c) => ({ ...c, [seedItem.id]: e.target.value }))}
                />
                <button
                  className="hcm-bid-submit"
                  aria-busy={busyAction === `bid:${seedItem.id}`}
                  disabled={Boolean(busyAction)}
                  onClick={() => void placeBid(seedItem)}
                  type="button"
                >
                  {busyAction === `bid:${seedItem.id}` ? "Sending…" : "Place Bid"}
                </button>
              </div>
              {/* Existing bids */}
              {(marketBids[seedItem.id] ?? []).slice(0, 3).map((bid) => (
                <div key={bid.id} className="hcm-bid-row-item">
                  <span>{bid.buyer}</span>
                  <strong>{bid.amount} WLD</strong>
                  <span className="hcm-bid-status">{bid.status === "sent" ? "✓ sent" : "saved"}</span>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <section className="hcm-detail-section">
            <strong>Description</strong>
            <p>{info.detail}</p>
          </section>

          {/* Trust */}
          <div className="hcm-detail-trust">
            <span><ShieldCheck size={12} />{info.seller} verified</span>
            <span><LockKeyhole size={12} />{info.receipt}</span>
            <span><MessageCircleQuestion size={12} />Chat before pay</span>
          </div>

          {/* Seller card */}
          <div className="hcm-seller-card">
            <div className="hcm-seller-av">{info.seller.replace(/^@/, "").charAt(0).toUpperCase()}</div>
            <div>
              <strong>{info.seller}</strong>
              <span>{info.area} · World ID Verified</span>
            </div>
            <BadgeCheck size={16} color="#2f6fed" />
          </div>

          {/* Hold status */}
          {hold && (
            <div className="hcm-hold-banner">
              <CheckCircle2 size={14} />
              <span>Hold active · {hold.status === "notified" ? "Seller notified" : "Local hold"} · {hold.createdAt}</span>
            </div>
          )}

          {/* Comments */}
          <section className="hcm-comments">
            <div className="hcm-comments-head">
              <strong>Public Comments <span>{itemComments.length}</span></strong>
              <small>0.5 WLD each</small>
            </div>
            {itemComments.length > 0 ? (
              <div className="hcm-comment-list">
                {itemComments.slice(0, 4).map((c, i) => {
                  const parts = c.includes(":") ? c.split(":") : ["@human", c];
                  return (
                    <div key={i} className="hcm-comment-item">
                      <strong>{parts[0]}</strong>
                      <p>{parts.slice(1).join(":").trim()}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="hcm-comments-empty">No comments yet. Ask about condition, pickup, or inspection.</p>
            )}
            <div className="hcm-comment-compose">
              <textarea
                aria-label="Add comment"
                placeholder="Ask about condition, receipt, defects, or pickup proof…"
                rows={2}
                value={commentDrafts[k] ?? ""}
                onChange={(e) => setCommentDrafts((c) => ({ ...c, [k]: e.target.value }))}
              />
              <button
                disabled={!commentDrafts[k]?.trim()}
                onClick={() => submitComment(activeItem)}
                type="button"
              >
                Post — 0.5 WLD
              </button>
            </div>
          </section>

          {/* Owner controls */}
          {isOwner && (
            <div className="hcm-owner-controls">
              <div className="hcm-owner-label"><BadgeCheck size={13} />Your listing</div>
              {isSold ? (
                <div className="hcm-sold-notice">
                  <CheckCircle2 size={14} />
                  <span>Marked as sold — no longer visible to buyers.</span>
                  <button onClick={() => {
                    setMarketplaceListings((c) => c.map((l) => l.id === userListing!.id ? { ...l, status: "payment-ready" as const } : l));
                    act("Listing restored", "Your item is visible to buyers again.");
                  }} type="button">Relist</button>
                </div>
              ) : (
                <div className="hcm-owner-acts">
                  <button className="hcm-mark-sold" onClick={() => {
                    setMarketplaceListings((c) => c.map((l) => l.id === userListing!.id ? { ...l, status: "sold" as const } : l));
                    earnPoints(10, "Item marked as sold — great transaction!");
                    recordHistory({ title: "Item sold", detail: `${userListing!.title} marked sold.`, kind: "market" });
                    act("Marked as sold", "Buyers will see this item is no longer available.");
                  }} type="button">
                    <CheckCircle2 size={14} /> Mark as Sold
                  </button>
                  <button className="hcm-archive-btn" onClick={() => {
                    setShowDeleteConfirm(userListing!.id);
                  }} type="button">
                    Archive
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Delete confirmation */}
          {showDeleteConfirm === userListing?.id && (
            <div className="hcm-delete-confirm">
              <p>Remove this listing permanently?</p>
              <div>
                <button className="hcm-act-danger" onClick={() => {
                  setMarketplaceListings((c) => c.filter((l) => l.id !== userListing!.id));
                  setShowDeleteConfirm(null);
                  setActiveItem(null);
                  act("Listing removed", "Your item was removed from the market.");
                }} type="button">Remove</button>
                <button onClick={() => setShowDeleteConfirm(null)} type="button">Cancel</button>
              </div>
            </div>
          )}

          {/* Actions — hidden if sold */}
          {!isSold && (
          <div className="hcm-detail-actions">
            <button
              className="hcm-act-primary"
              aria-busy={busyAction === `hold:${k}`}
              disabled={Boolean(busyAction) || isOwner}
              onClick={() => void holdItem(activeItem)}
              type="button"
            >
              {isOwner ? "Your listing" : busyAction === `hold:${k}` ? "Holding…" : "Book / Hold Item"}
            </button>
            <button
              className="hcm-act-chat"
              aria-busy={busyAction === `chat:${k}`}
              disabled={Boolean(busyAction)}
              onClick={() => void chatSeller(activeItem)}
              type="button"
            >
              <MessageCircle size={15} />
              {busyAction === `chat:${k}` ? "Opening…" : isOwner ? "Share via Chat" : "Message Seller"}
            </button>
            <div className="hcm-act-row">
              <button onClick={() => rateItem(activeItem)} type="button"><Star size={14} />Rate</button>
              <button onClick={() => tipItem(activeItem)} type="button"><Zap size={14} />Tip</button>
              <button onClick={() => void shareItem(activeItem)} type="button"><Send size={14} />Share</button>
            </div>
          </div>
          )}

          {/* Detail dl */}
          <dl className="hcm-detail-dl">
            {[
              ["Seller", info.seller],
              ["Condition", info.condition],
              ["Area", info.area],
              ["Distance", info.distance],
              ["Photos", `${info.photos} images`],
            ].map(([k2, v]) => (
              <div key={k2}><dt>{k2}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — Sell wizard
  // ─────────────────────────────────────────────────────────────────────────

  if (showSell) {
    return (
      <div className="screen hcm-sell-screen">
        <div className="hcm-sell-header">
          <button className="hcm-back-text" onClick={() => setShowSell(false)} type="button">
            <ArrowLeft size={15} /> Market
          </button>
          <h1>List an Item</h1>
          <p>2 photos free · Location private · Chat-first sale</p>
        </div>

        <div className="hcm-sell-steps">
          {["Photos", "Details", "Trust", "Review", "Publish"].map((s, i) => (
            <span key={s}><b>{i + 1}</b>{s}</span>
          ))}
        </div>

        <div className="hcm-sell-body">
          {/* Photos */}
          <div className="hcm-field-label">1. Photos</div>
          <div className="hcm-photo-zone">
            <label className="hcm-photo-upload">
              <Upload size={22} />
              <strong>Add Item Photos</strong>
              <span>2 free · 3-5 need 1.5 WLD photo pack</span>
              <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={(e) => handlePhotos(e.target.files)} />
            </label>
            <div className="hcm-photo-grid">
              {Array.from({ length: 5 }, (_, slot) => {
                const p = listingPhotos[slot];
                return (
                  <div key={slot} className={`hcm-photo-slot ${p ? "filled" : ""}`}>
                    {p ? <img src={p.src} alt={p.name} /> : <span>{slot + 1}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price + details */}
          <div className="hcm-field-label">2. Price & Facts</div>
          <input className="hcm-input" placeholder="Item title, e.g. iPhone 12 clean" value={listingDraft.title} onChange={(e) => updateDraft("title", e.target.value)} />
          <input className="hcm-input" placeholder="Price, e.g. 18 WLD or KES 12,000" value={listingDraft.price} onChange={(e) => updateDraft("price", e.target.value)} />
          <select className="hcm-select" value={listingDraft.saleMode} onChange={(e) => updateDraft("saleMode", e.target.value)}>
            <option value="direct">Direct chat sale</option>
            <option value="bidding">Timed bidding</option>
          </select>
          {listingDraft.saleMode === "bidding" && (
            <input className="hcm-input" placeholder="Minimum bid, e.g. 15 WLD" value={listingDraft.bidFloor} onChange={(e) => updateDraft("bidFloor", e.target.value)} />
          )}
          <select className="hcm-select" value={listingDraft.duration} onChange={(e) => updateDraft("duration", e.target.value)}>
            <option>24 hours</option><option>3 days</option><option>7 days</option><option>14 days</option>
          </select>
          <select className="hcm-select" value={listingDraft.condition} onChange={(e) => updateDraft("condition", e.target.value)}>
            <option disabled value="">Condition</option>
            <option>Brand New</option><option>Second hand</option><option>Refurbished</option><option>Service or business</option>
          </select>

          {/* Trust */}
          <div className="hcm-field-label">3. Location & Trust</div>
          <input className="hcm-input" placeholder="Pickup area or delivery route" value={listingDraft.area} onChange={(e) => updateDraft("area", e.target.value)} />
          <input className="hcm-input" placeholder="Optional link: shop, WhatsApp, website" value={listingDraft.link} onChange={(e) => updateDraft("link", e.target.value)} />
          <textarea className="hcm-textarea" placeholder="Defects, warranty, receipt, pickup safety notes…" rows={3} value={listingDraft.details} onChange={(e) => updateDraft("details", e.target.value)} />

          {/* Checklist */}
          <div className="hcm-checklist">
            {MARKET_CHECKLIST.map((item) => <span key={item}><CheckCircle2 size={13} />{item}</span>)}
          </div>

          {/* Review card */}
          <div className="hcm-review-card">
            <div className="hcm-field-label" style={{ margin: 0 }}>4. Review</div>
            <strong>{listingDraft.title.trim() || "Title missing"}</strong>
            <p>{listingDraft.price || "Price missing"} · {listingDraft.condition || "Condition missing"} · {listingDraft.area || "Area missing"}</p>
            <div className="hcm-review-meta">
              <span>{listingPhotos.length}/2 photos</span>
              <span>{photoPackUnlocked ? "5-photo pack ✓" : "3-5 photos: 1.5 WLD"}</span>
              <span>Seller: {handle}</span>
            </div>
          </div>

          <button
            className="hcm-publish-btn"
            disabled={listingPhotos.length < 2 || !listingDraft.title.trim() || !listingDraft.price.trim()}
            onClick={() => {
              // Validate before opening payment — do NOT save yet
              if (!requireVerifiedPublicAction(humanIdentity, act, "publishing listings")) return;
              const v = validateListingInput({ area: listingDraft.area, condition: listingDraft.condition, photos: listingPhotos, price: listingDraft.price, title: listingDraft.title });
              if (!v.ok) { act("Listing needs details", v.issues[0] ?? "Add title, price, condition, area, and 2 photos."); return; }
              // Payment first — save only after WLD confirmed
              openPayment({
                title: "Publish Listing — 2 WLD",
                amount: "2 WLD",
                detail: "Your item goes live to verified buyers nearby. WLD escrow protects every trade.",
                success: "Listing published! Verified buyers can now find and bid.",
                feature: "marketplace-quick-listing",
                points: 12,
                onConfirmed: () => {
                  saveListing();
                  recordHistory({ title: "Listing published", detail: `${listingDraft.title} · 2 WLD payment confirmed.`, kind: "market" });
                },
              });
            }}
            type="button"
          >
            Publish Listing — 2 WLD
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — Services: post-job form
  // ─────────────────────────────────────────────────────────────────────────

  if (topTab === "services" && svcMode === "post-job") {
    return (
      <div className="screen hcm-sell-screen">
        <div className="hcm-sell-header">
          <button className="hcm-back-text" onClick={() => setSvcMode("browse")} type="button"><ArrowLeft size={15} /> Services</button>
          <h1>Post a Job</h1>
          <p>Verified specialists worldwide will apply.</p>
        </div>
        <div className="hcm-sell-body">
          <label className="hcm-field"><span>What do you need? <em>*</em></span>
            <input className="hcm-input" placeholder="e.g. Translate 3 medical documents Swahili → English" value={jobForm.title} onChange={(e) => setJob("title", e.target.value)} /></label>
          <label className="hcm-field"><span>Details <em>*</em></span>
            <textarea className="hcm-textarea" placeholder="Scope, timeline, deliverables…" rows={4} value={jobForm.detail} onChange={(e) => setJob("detail", e.target.value)} /></label>
          <div className="hcm-field"><span className="hcm-label">Specialty</span>
            <div className="hcm-niche-picker">
              {NICHES.filter((n) => n.id !== "all").map((n) => { const I = n.icon; return (
                <button key={n.id} className={`hcm-niche-btn ${jobForm.niche === n.id ? "active" : ""}`} style={{ "--n-color": n.color } as React.CSSProperties} onClick={() => setJob("niche", n.id)} type="button"><I size={14} />{n.label}</button>
              ); })}
            </div>
          </div>
          <label className="hcm-field"><span>Budget <em>*</em></span>
            <div className="hcm-presets">{BUDGET_PRESETS.map((p) => <button key={p} className={`hcm-preset ${jobForm.budget === p ? "active" : ""}`} onClick={() => setJob("budget", p)} type="button">{p}</button>)}</div>
            <input className="hcm-input" placeholder="Or type: WLD 75" value={jobForm.budget} onChange={(e) => setJob("budget", e.target.value)} /></label>
          <div className="hcm-field"><span className="hcm-label">Deadline</span>
            <div className="hcm-presets">{DEADLINE_OPTIONS.map((d) => <button key={d} className={`hcm-preset ${jobForm.deadline === d ? "active" : ""}`} onClick={() => setJob("deadline", d)} type="button">{d}</button>)}</div>
          </div>
          <label className="hcm-field"><span>Region</span>
            <input className="hcm-input" placeholder="e.g. West Africa, Worldwide" value={jobForm.region} onChange={(e) => setJob("region", e.target.value)} /></label>
          <div className="hcm-form-trust"><ShieldCheck size={13} /><span>2 WLD fee · Escrow on hire · Milestone payments</span></div>
          <button className="hcm-publish-btn" disabled={!jobForm.title.trim() || !jobForm.detail.trim() || !jobForm.budget.trim()} onClick={submitJob} type="button">Post Job — 2 WLD</button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — Services: offer-service form
  // ─────────────────────────────────────────────────────────────────────────

  if (topTab === "services" && svcMode === "offer-service") {
    return (
      <div className="screen hcm-sell-screen">
        <div className="hcm-sell-header">
          <button className="hcm-back-text" onClick={() => setSvcMode("browse")} type="button"><ArrowLeft size={15} /> Services</button>
          <h1>List Your Service</h1>
          <p>Clients find and hire you. Get paid in WLD via escrow.</p>
        </div>
        <div className="hcm-sell-body">
          <label className="hcm-field"><span>What do you offer? <em>*</em></span>
            <input className="hcm-input" placeholder="e.g. Medical translation Swahili ↔ English" value={serviceForm.title} onChange={(e) => setSvc("title", e.target.value)} /></label>
          <label className="hcm-field"><span>Description <em>*</em></span>
            <textarea className="hcm-textarea" placeholder="Your expertise, experience, certifications…" rows={4} value={serviceForm.detail} onChange={(e) => setSvc("detail", e.target.value)} /></label>
          <div className="hcm-field"><span className="hcm-label">Specialty</span>
            <div className="hcm-niche-picker">
              {NICHES.filter((n) => n.id !== "all").map((n) => { const I = n.icon; return (
                <button key={n.id} className={`hcm-niche-btn ${serviceForm.niche === n.id ? "active" : ""}`} style={{ "--n-color": n.color } as React.CSSProperties} onClick={() => setSvc("niche", n.id)} type="button"><I size={14} />{n.label}</button>
              ); })}
            </div>
          </div>
          <label className="hcm-field"><span>Starting rate <em>*</em></span>
            <div className="hcm-presets">{BUDGET_PRESETS.map((p) => <button key={p} className={`hcm-preset ${serviceForm.rate === p ? "active" : ""}`} onClick={() => setSvc("rate", p)} type="button">{p}</button>)}</div>
            <input className="hcm-input" placeholder="Or type: WLD 30 per 1,000 words" value={serviceForm.rate} onChange={(e) => setSvc("rate", e.target.value)} /></label>
          <label className="hcm-field"><span>Languages</span>
            <input className="hcm-input" placeholder="e.g. Swahili, English, French" value={serviceForm.languages} onChange={(e) => setSvc("languages", e.target.value)} /></label>
          <label className="hcm-field"><span>Regions</span>
            <input className="hcm-input" placeholder="e.g. East Africa, Worldwide" value={serviceForm.region} onChange={(e) => setSvc("region", e.target.value)} /></label>
          <div className="hcm-form-trust"><ShieldCheck size={13} /><span>2 WLD fee · World ID verified profile</span></div>
          <button className="hcm-publish-btn" disabled={!serviceForm.title.trim() || !serviceForm.detail.trim() || !serviceForm.rate.trim()} onClick={submitService} type="button">List Service — 2 WLD</button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — Services: listing detail
  // ─────────────────────────────────────────────────────────────────────────

  if (topTab === "services" && activeSvc) {
    const isJob = activeSvc.type === "job";
    const color = activeSvc.color;
    const poster = isJob ? (activeSvc as AnyJob).poster : (activeSvc as LocalService).provider;
    const budget = isJob ? (activeSvc as AnyJob).budget : (activeSvc as LocalService).rate;
    const svcId = activeSvc.id;
    const hasApplied = appliedJobs.has(svcId);
    const hasSaved = savedJobs.has(svcId);
    const posterInitial = poster.replace(/^@/, "").charAt(0).toUpperCase();

    return (
      <div className="screen hcm-svc-detail">
        <div className="hcm-svc-hero" style={{ background: `linear-gradient(135deg, ${color}22, ${color}08)`, borderBottom: `3px solid ${color}44` }}>
          <button className="hcm-back-text" onClick={() => setActiveSvc(null)} type="button"><ArrowLeft size={15} /> Services</button>
          <div className="hcm-svc-tag-row">
            <span className="hcm-svc-niche" style={{ color, background: `${color}18` }}>{activeSvc.niche}</span>
            {isJob && (activeSvc as AnyJob).urgent && <span className="hcm-svc-urgent">Urgent</span>}
          </div>
          <h1>{activeSvc.title}</h1>
          <div className="hcm-svc-meta">
            <span><Globe2 size={12} />{activeSvc.region}</span>
            {isJob && <span><Clock size={12} />{(activeSvc as AnyJob).deadline} left</span>}
            {isJob && <span><Users size={12} />{(activeSvc as AnyJob).proposals + (hasApplied ? 1 : 0)} proposals</span>}
          </div>
        </div>
        <div className="hcm-svc-body">
          <div className="hcm-svc-budget-row">
            <div><span>{isJob ? "Budget" : "Starting rate"}</span><strong>{budget}</strong></div>
            <span className="hcm-escrow-badge"><ShieldCheck size={12} />WLD Escrow</span>
          </div>

          <section className="hcm-detail-section"><strong>Description</strong><p>{activeSvc.detail}</p></section>

          {isJob && (activeSvc as AnyJob).skills.length > 0 && (
            <section className="hcm-detail-section">
              <strong>Skills needed</strong>
              <div className="hcm-skill-chips">{(activeSvc as AnyJob).skills.map((s) => <span key={s}>{s}</span>)}</div>
            </section>
          )}

          {/* Milestone payment explainer */}
          <div className="hcm-milestone-row">
            <div className="hcm-milestone-step"><span>1</span><p>Apply via World Chat</p></div>
            <div className="hcm-milestone-arrow">→</div>
            <div className="hcm-milestone-step"><span>2</span><p>Agree on milestones</p></div>
            <div className="hcm-milestone-arrow">→</div>
            <div className="hcm-milestone-step"><span>3</span><p>WLD escrow releases on completion</p></div>
          </div>

          <div className="hcm-detail-trust">
            <span><BadgeCheck size={12} />World ID verified</span>
            <span><ShieldCheck size={12} />WLD escrow on hire</span>
            <span><Zap size={12} />Milestone payments</span>
          </div>

          <div className="hcm-seller-card">
            <div className="hcm-seller-av" style={{ background: `${color}44` }}>{posterInitial}</div>
            <div>
              <strong>{poster}</strong>
              <span>World ID Verified · {activeSvc.region}</span>
            </div>
            <BadgeCheck size={16} color="#2f6fed" />
          </div>

          {/* Applied state */}
          {hasApplied && (
            <div className="hcm-applied-banner">
              <CheckCircle2 size={14} /><span>You applied — your World Chat message was sent to {poster}.</span>
            </div>
          )}

          <div className="hcm-detail-actions">
            <button
              className="hcm-act-primary"
              disabled={hasApplied}
              onClick={() => {
                if (!requireVerifiedPublicAction(humanIdentity, act, isJob ? "applying to jobs" : "contacting providers")) return;
                void chatWithWorld({
                  message: `Hi ${poster}, I'm interested in "${activeSvc.title}" on HumanChain. Budget: ${budget}. Let's connect.`,
                  to: [poster.replace(/^@/, "")],
                }).then(() => {
                  setAppliedJobs((prev) => new Set([...prev, svcId]));
                  earnPoints(5, `Applied to ${activeSvc.title}.`);
                  recordHistory({ title: isJob ? "Job application sent" : "Provider contacted", detail: `${activeSvc.title} · ${budget}`, kind: "market" });
                  act("Application sent!", `World Chat opened with ${poster}.`);
                  const existing = loadJsonFromStorage<Array<{id: string; title: string; budget: string; poster: string; appliedAt: string}>>(storageKeys.jobApplications, []);
                  if (!existing.find((a) => a.id === svcId)) {
                    saveJsonToStorage(storageKeys.jobApplications, [{ id: svcId, title: activeSvc.title, budget, poster, appliedAt: new Date().toISOString() }, ...existing]);
                  }
                  addNotification("Application sent!", `You applied to "${activeSvc.title}". The poster has been notified via World Chat.`, "marketplace");
                }).catch(() => act("Chat unavailable", "Try from World App."));
              }}
              type="button"
            >
              <MessageCircle size={15} />{hasApplied ? "Applied ✓" : isJob ? "Apply via World Chat" : "Contact Provider"}
            </button>
            <button
              className="hcm-act-chat"
              onClick={() => {
                setSavedJobs((prev) => { const s = new Set([...prev]); if (s.has(svcId)) s.delete(svcId); else s.add(svcId); return s; });
                if (!hasSaved) earnPoints(2, "Job saved to your list.");
              }}
              type="button"
            >
              {hasSaved ? "★ Saved" : "☆ Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — Main browse
  // ─────────────────────────────────────────────────────────────────────────

  const filteredItems = MARKET_ITEMS.filter((item) => {
    const q = marketSearch.trim().toLowerCase();
    const matchFilter = marketFilter === "All" || item.tag === marketFilter;
    return matchFilter && (!q || `${item.title} ${item.seller} ${item.location} ${item.tag}`.toLowerCase().includes(q));
  });

  const allSvcListings: SvcListing[] = [...SEED_JOBS, ...localJobs, ...localServices];
  const filtSvc = allSvcListings.filter((item) => {
    const matchNiche = activeNiche === "all" || item.niche === activeNiche;
    const q = svcSearch.trim().toLowerCase();
    return matchNiche && (!q || `${item.title} ${item.niche} ${item.region ?? ""}`.toLowerCase().includes(q));
  });
  const svcJobs     = filtSvc.filter((i) => i.type === "job") as AnyJob[];
  const svcServices = filtSvc.filter((i) => i.type === "service") as LocalService[];
  const urgentJobs  = SEED_JOBS.filter((j) => j.urgent);

  return (
    <div className="screen hcm-root">

      {/* ── Dual-tab topbar ───────────────────────────────────────────────── */}
      <div className="hcm-topbar">
        <div className="hcm-tabs">
          <button className={`hcm-tab ${topTab === "market" ? "active" : ""}`} onClick={() => setTopTab("market")} type="button">
            <Store size={14} /> Market
          </button>
          <button className={`hcm-tab ${topTab === "services" ? "active" : ""}`} onClick={() => setTopTab("services")} type="button">
            <Briefcase size={14} /> Services
          </button>
        </div>
        {topTab === "market" ? (
          <div className="hcm-topbar-actions">
            <button className={`hcm-boost-btn${boostedListings ? " active" : ""}`} disabled={boostedListings} onClick={() => { if (!marketplaceListings.length) { setShowSell(true); return; } if (boostedListings) return; openPayment({ title: "Boost Listing — 2 WLD", amount: "2 WLD", detail: "Push your listing higher in nearby discovery.", success: "Listing boosted!", feature: "marketplace-local-boost", points: 5, onConfirmed: async () => { setBoostedListings(true); setMarketplaceListings((c) => c.map((l, i) => i === 0 ? { ...l, boosted: true } : l)); recordHistory({ title: "Listing boosted", detail: "2 WLD boost confirmed.", kind: "market" }); } }); }} type="button">
              <Flame size={13} />{boostedListings ? "✓ Boosted" : "Boost"}
            </button>
            <button className="hcm-sell-btn" onClick={() => setShowSell(true)} type="button">
              <PlusCircle size={14} />Sell
            </button>
          </div>
        ) : (
          <div className="hcm-topbar-actions">
            <button className="hcm-boost-btn" onClick={() => setSvcMode("offer-service")} type="button"><Star size={13} />Offer</button>
            <button className="hcm-sell-btn" onClick={() => setSvcMode("post-job")} type="button"><PlusCircle size={14} />Post Job</button>
          </div>
        )}
      </div>

      {/* Social proof strip */}
      <div className="hcm-social-proof">
        <span className="hcm-sp-dot" /><span>{(() => { const base = 34 + (new Date().getHours() % 12) * 3; return base; })()}&nbsp;verified humans browsing nearby</span>
        <span className="hcm-sp-sep">·</span>
        <span className="hcm-sp-live"><span className="hcm-sp-dot green" />Live escrow active</span>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          NEARBY MARKET TAB
          ════════════════════════════════════════════════════════════════ */}
      {topTab === "market" && (
        <>
          {/* Verification tier */}
          <div className={`hcm-tier-band ${tier.className}`}>
            <BadgeCheck size={16} />
            <div>
              <span>{tier.label}</span>
              <small>{tier.next}</small>
            </div>
            <span className="hcm-tier-score">{tier.score}/100</span>
          </div>

          {/* Location */}
          {!locationReady ? (
            <div className="hcm-location-card">
              <MapPin size={18} />
              <div>
                <strong>Connect Nearby Market</strong>
                <span>Allow GPS or enter an area for nearby ranking.</span>
                <small>Opened from {worldLaunchLabel}</small>
              </div>
              <button disabled={marketLocation.status === "requesting"} onClick={requestGps} type="button">
                {marketLocation.status === "requesting" ? "…" : "GPS"}
              </button>
            </div>
          ) : (
            <div className="hcm-location-ready">
              <MapPin size={14} />
              <span>{marketLocation.source === "manual" ? "Area" : "GPS"}: {marketLocation.label}</span>
            </div>
          )}
          {!locationReady && (
            <div className="hcm-manual-row">
              <input
                aria-label="Manual area"
                placeholder="Area, e.g. Westlands"
                value={manualArea}
                onChange={(e) => setManualArea(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyManualArea()}
              />
              <button onClick={applyManualArea} type="button">Use area</button>
            </div>
          )}

          {/* Search + filter */}
          <div className="hcm-search-wrap">
            <Search size={15} />
            <input
              aria-label="Search market"
              placeholder="Search items, sellers, areas…"
              value={marketSearch}
              onChange={(e) => setMarketSearch(e.target.value)}
            />
            {marketSearch && <button onClick={() => setMarketSearch("")} type="button" aria-label="Clear">×</button>}
          </div>
          <div className="hcm-filter-row">
            {MARKET_FILTERS.map((f) => (
              <button key={f} className={`hcm-filter-chip ${marketFilter === f ? "active" : ""}`} onClick={() => setMarketFilter(f)} type="button">{f}</button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="hcm-market-actions">
            <button onClick={() => setShowSell(true)} type="button">
              <PlusCircle size={17} /><span>Sell Item</span><strong>Start</strong>
            </button>
            <button disabled={boostedListings} onClick={() => { if (boostedListings) return; openPayment({ title: "Boost Listing — 2 WLD", amount: "2 WLD", detail: "Push your listing higher in nearby discovery.", success: "Listing boosted!", feature: "marketplace-local-boost", points: 5, onConfirmed: async () => { setBoostedListings(true); setMarketplaceListings((c) => c.map((l, i) => i === 0 ? { ...l, boosted: true } : l)); recordHistory({ title: "Boosted", detail: "2 WLD boost.", kind: "market" }); } }); }} type="button">
              <Flame size={17} /><span>Boost</span><strong>2 WLD</strong>
            </button>
            <button disabled={adPosted} onClick={() => { if (adPosted) return; openPayment({ title: "Business Ad — 4 WLD", amount: "4 WLD", detail: "Market a verified shop, service, event, or link.", success: "Business ad live!", feature: "marketplace-business-ad", points: 20, onConfirmed: async () => { setAdPosted(true); recordHistory({ title: "Business ad live", detail: "4 WLD ad confirmed.", kind: "market" }); } }); }} type="button">
              <HandCoins size={17} /><span>{adPosted ? "✓ Ad live" : "Ad"}</span><strong>4 WLD</strong>
            </button>
          </div>

          {/* Your listings */}
          {marketplaceListings.length > 0 && (
            <section className="hcm-section">
              <div className="hcm-section-head">
                <Library size={14} /><strong>Your Listings</strong>
                <span className="hcm-listings-count">{marketplaceListings.filter((l) => l.status !== "archived").length} active</span>
              </div>
              <div className="hcm-stored-list">
                {marketplaceListings.filter((l) => l.status !== "archived").map((listing) => (
                  <div key={listing.id} className={`hcm-stored-row${listing.status === "sold" ? " sold" : ""}`}>
                    <button className="hcm-stored-thumb" onClick={() => setActiveItem(listing)} type="button">
                      {listing.photos[0] ? <img src={listing.photos[0].src} alt={listing.photos[0].name} /> : <Tag size={18} />}
                      {listing.status === "sold" && <span className="hcm-thumb-sold">SOLD</span>}
                    </button>
                    <div className="hcm-stored-info">
                      <strong>{listing.title}</strong>
                      <span>{listing.price} · {listing.condition} · {listing.area}</span>
                      <small>{listing.saleMode === "bidding" ? `Bidding, floor ${listing.bidFloor}` : "Direct"} · {listing.ratings ?? 0} ratings · {listing.tips ?? 0} tips</small>
                    </div>
                    <div className="hcm-stored-acts">
                      {listing.status === "sold" ? (
                        <span className="hcm-sold-tag">Sold</span>
                      ) : (
                        <>
                          <button onClick={() => {
                            setMarketplaceListings((c) => c.map((l) => l.id === listing.id ? { ...l, status: "sold" as const } : l));
                            earnPoints(10, "Item marked as sold — great transaction!");
                            act("Marked sold", `${listing.title} is now marked as sold.`);
                          }} title="Mark as sold" type="button"><CheckCircle2 size={13} /></button>
                          <button onClick={() => setActiveItem(listing)} title="View detail" type="button"><Tag size={13} /></button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Discover */}
          <section className="hcm-section">
            <div className="hcm-section-head">
              <ShoppingBag size={14} /><strong>Discover Near You</strong>
              <span className="hcm-live-pill"><span className="hcm-pulse" />Live</span>
            </div>
            <div className="hcm-items-list">
              {filteredItems.length ? filteredItems.map((item) => {
                const rk = `seed:${item.id}`;
                const social = marketRatings[rk] ?? { rating: 0, tips: 0 };
                const comments = marketComments[rk] ?? [];
                const imgs = getImages(item);

                return (
                  <article key={item.id} className={`hcm-item-card hcm-tone-${item.tone}`}>
                    {/* Photo stack — clicking opens detail */}
                    <button className="hcm-item-photos" onClick={() => { setActiveItem(item); setGalleryIdx(0); }} type="button" aria-label={`View ${item.title}`}>
                      {imgs.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`${item.title} ${i + 1}`}
                          className={`hcm-item-photo-img hcm-photo-${i}`}
                        />
                      ))}
                      {item.bidding && (
                        <div className="hcm-bid-indicator">
                          <Gavel size={10} />
                          <span>{(marketBids[item.id] ?? []).length} bids · {item.bidding.ends}</span>
                        </div>
                      )}
                      {item.isFeatured && <span className="hcm-feat-badge"><Flame size={9} />Featured</span>}
                    </button>

                    {/* Info */}
                    <div className="hcm-item-info">
                      <div className="hcm-item-top">
                        <strong>{item.title}</strong>
                        <span className="hcm-item-price">{item.price}</span>
                      </div>
                      <p className="hcm-item-sub">{item.condition} · {item.seller} · {item.location}</p>
                      <div className="hcm-item-meta-row">
                        <span><MapPin size={10} />{item.distance}</span>
                        <span>{item.tag}</span>
                        <span><Camera size={10} />{item.photos}</span>
                        <span>{item.trust}</span>
                      </div>
                      <div className="hcm-item-social">
                        <span>{social.rating} votes</span>
                        <span>{social.tips} tips</span>
                        <span>{comments.length} comments</span>
                      </div>
                      <p className="hcm-item-quality">{getShortText(item.quality, 90)}</p>
                      {item.bidding && (
                        <div className="hcm-item-bid-row">
                          <span>Best: {topBid(item)?.amount ?? item.bidding.floor} WLD</span>
                          <span>Closes {item.bidding.ends}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="hcm-item-actions">
                      <button className="hcm-act-view" onClick={() => { setActiveItem(item); setGalleryIdx(0); }} type="button">View</button>
                      <button onClick={() => rateItem(item)} type="button"><Star size={13} /></button>
                      <button onClick={() => tipItem(item)} type="button"><Zap size={13} /></button>
                      <button aria-busy={busyAction === `chat:${itemKey(item)}`} disabled={Boolean(busyAction)} onClick={() => void chatSeller(item)} type="button">
                        <MessageCircle size={13} />
                      </button>
                      <button aria-busy={busyAction === `share:${itemKey(item)}`} disabled={Boolean(busyAction)} onClick={() => void shareItem(item)} type="button">
                        <Send size={13} />
                      </button>
                    </div>
                  </article>
                );
              }) : (
                <div className="hcm-empty"><Package size={28} /><strong>No items found</strong><p>{marketSearch ? `No results for "${marketSearch}"` : "Be the first to list something nearby."}</p></div>
              )}
            </div>
          </section>

          {/* Business ads */}
          <section className="hcm-section">
            <div className="hcm-section-head"><Send size={14} /><strong>Business Ads</strong><small>4 WLD to promote</small></div>
            <div className="hcm-ads-grid">
              {BUSINESS_ADS.map((ad) => (
                <article key={ad.title} className="hcm-ad-card">
                  <img src={ad.image} alt={ad.title} className="hcm-ad-img" />
                  <div className="hcm-ad-body">
                    <span className="hcm-ad-tag">{ad.tag} · {ad.area}</span>
                    <strong>{ad.title}</strong>
                    <p>{ad.offer}</p>
                    <small>{ad.owner} · {ad.signal}</small>
                  </div>
                  <button onClick={() => { recordHistory({ title: "Ad viewed", detail: `${ad.title} by ${ad.owner}`, kind: "market" }); act(ad.title, "Business ad preview. Chat and booking stay user-controlled."); }} type="button">View</button>
                </article>
              ))}
            </div>
            <button className={`hcm-ad-post-btn${adPosted ? " active" : ""}`} disabled={adPosted} onClick={() => { if (adPosted) return; openPayment({ title: "Business Ad — 4 WLD", amount: "4 WLD", detail: "Promote your shop, service, event, or link.", success: "Business ad live!", feature: "marketplace-business-ad", points: 20, onConfirmed: async () => { setAdPosted(true); recordHistory({ title: "Business ad live", detail: "4 WLD.", kind: "market" }); } }); }} type="button">
              <Send size={14} /> {adPosted ? "✓ Business Ad Live" : "Post Your Business Ad — 4 WLD"}
            </button>
          </section>

          {/* Pricing plans */}
          <section className="hcm-section">
            <div className="hcm-section-head"><CircleDollarSign size={14} /><strong>Publishing Fees</strong></div>
            <div className="hcm-plans">
              {MARKET_PLANS.map((plan) => {
                const planKey = plan[0];
                const alreadyActive =
                  (planKey === "Quick listing" && showSell) ||
                  (planKey === "Extra photo pack" && photoPackUnlocked) ||
                  (planKey === "Local boost" && boostedListings) ||
                  (planKey === "Business ad" && adPosted);
                return (
                  <button key={planKey} className={`hcm-plan-row${alreadyActive ? " active" : ""}`} disabled={alreadyActive} onClick={() => {
                    if (alreadyActive) return;
                    openPayment({
                      title: `${planKey} — ${plan[1]}`, amount: plan[1], detail: plan[2],
                      success: `${planKey} unlocked!`,
                      feature: normalizePaymentFeature(`marketplace-${planKey}`), points: 10,
                      onConfirmed: async () => {
                        if (planKey === "Quick listing") setShowSell(true);
                        else if (planKey === "Extra photo pack") setPhotoPackUnlocked(true);
                        else if (planKey === "Local boost") { setBoostedListings(true); setMarketplaceListings((c) => c.map((l, i) => i === 0 ? { ...l, boosted: true } : l)); }
                        else if (planKey === "Business ad") setAdPosted(true);
                        recordHistory({ title: `${planKey} payment`, detail: `${plan[1]} confirmed.`, kind: "market" });
                      },
                    });
                  }} type="button">
                    <div><strong>{planKey}</strong><span>{plan[2]}</span></div>
                    <b>{alreadyActive ? "✓ Active" : plan[1]}</b>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SERVICES TAB
          ════════════════════════════════════════════════════════════════ */}
      {topTab === "services" && (
        <>
          <div className="hcm-search-wrap">
            <Search size={15} />
            <input aria-label="Search services" placeholder="Search jobs, services, regions…" value={svcSearch} onChange={(e) => setSvcSearch(e.target.value)} />
            {svcSearch && <button onClick={() => setSvcSearch("")} type="button" aria-label="Clear">×</button>}
          </div>

          <div className="hcm-filter-row">
            {NICHES.map((n) => { const I = n.icon; return (
              <button key={n.id} className={`hcm-filter-chip ${activeNiche === n.id ? "active" : ""}`} style={{ "--n-color": n.color } as React.CSSProperties} onClick={() => setActiveNiche(n.id)} type="button">
                <I size={12} />{n.label}
              </button>
            ); })}
          </div>

          {/* Urgent jobs */}
          {activeNiche === "all" && !svcSearch && (
            <section className="hcm-section">
              <div className="hcm-section-head"><Flame size={14} /><strong>Urgent — Apply Now</strong><span className="hcm-live-pill"><span className="hcm-pulse" />Live</span></div>
              <div className="hcm-urgent-scroll">
                {urgentJobs.map((job) => (
                  <button key={job.id} className="hcm-urgent-card" style={{ "--uc": job.color } as React.CSSProperties} onClick={() => setActiveSvc(job)} type="button">
                    <span className="hcm-uc-niche">{job.niche}</span>
                    <strong>{job.title}</strong>
                    <div className="hcm-uc-meta">
                      <span><Globe2 size={11} />{job.region}</span>
                      <span><Clock size={11} />{job.deadline}</span>
                    </div>
                    <div className="hcm-uc-footer">
                      <strong>{job.budget}</strong>
                      <span>{job.proposals} proposals <ArrowRight size={10} /></span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Saved jobs */}
          {savedJobs.size > 0 && (
            <section className="hcm-section">
              <div className="hcm-section-head"><Star size={14} /><strong>Saved Jobs</strong><span className="hcm-count">{savedJobs.size}</span></div>
              <div className="hcm-saved-scroll">
                {[...SEED_JOBS, ...localJobs].filter((j) => savedJobs.has(j.id)).map((j) => (
                  <button key={j.id} className="hcm-saved-chip" onClick={() => setActiveSvc(j)} type="button">
                    <span style={{ background: `${j.color}18`, color: j.color }}>{j.niche}</span>
                    <strong>{j.title.slice(0, 32)}{j.title.length > 32 ? "…" : ""}</strong>
                    <span>{j.budget}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Top providers */}
          <section className="hcm-section">
            <div className="hcm-section-head"><Star size={14} /><strong>Top Specialists</strong></div>
            <div className="hcm-providers-row">
              {(activeNiche === "all" ? SEED_PROVIDERS : SEED_PROVIDERS.filter((p) => p.niche === activeNiche)).map((p) => (
                <button key={p.id} className="hcm-provider-chip" onClick={() => act(p.name, `${p.specialty} · ${p.region} · ${p.rating}★ · ${p.jobs} jobs completed on HumanChain.`)} type="button">
                  <div className="hcm-pav" style={{ background: `linear-gradient(135deg,${p.color}cc,${p.color}44)` }}>
                    {p.initial}
                    <span className="hcm-pip"><BadgeCheck size={8} /></span>
                  </div>
                  <span>{p.name.split(" ")[0]}</span>
                  <span className="hcm-prating"><Star size={9} fill="currentColor" />{p.rating}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Jobs */}
          {svcJobs.length > 0 && (
            <section className="hcm-section">
              <div className="hcm-section-head"><strong>Open Jobs</strong><span className="hcm-count">{svcJobs.length}</span></div>
              <div className="hcm-svc-list">
                {svcJobs.map((job) => (
                  <button key={job.id} className={`hcm-svc-card${appliedJobs.has(job.id) ? " applied" : ""}`} style={{ "--cc": job.color } as React.CSSProperties} onClick={() => setActiveSvc(job)} type="button">
                    <span className="hcm-svc-bar" />
                    <div className="hcm-svc-top">
                      <span style={{ color: job.color, background: `${job.color}18` }}>{job.niche}</span>
                      {job.urgent && <span className="hcm-urgent-tag">Urgent</span>}
                      {appliedJobs.has(job.id) && <span className="hcm-applied-tag"><CheckCircle2 size={10} />Applied</span>}
                      <span><Clock size={10} />{job.deadline}</span>
                    </div>
                    <strong>{job.title}</strong>
                    <div className="hcm-svc-meta">
                      <span><Globe2 size={11} />{job.region}</span>
                      <span><Users size={11} />{job.proposals + (appliedJobs.has(job.id) ? 1 : 0)} proposals</span>
                    </div>
                    {"skills" in job && job.skills.length > 0 && (
                      <div className="hcm-skill-chips">{job.skills.slice(0, 3).map((s) => <i key={s}>{s}</i>)}</div>
                    )}
                    <div className="hcm-svc-footer">
                      <strong>{job.budget}</strong>
                      <span>{appliedJobs.has(job.id) ? "View ✓" : "Apply"} <ArrowRight size={11} /></span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Service providers */}
          {svcServices.length > 0 && (
            <section className="hcm-section">
              <div className="hcm-section-head"><strong>Service Providers</strong><span className="hcm-count">{svcServices.length}</span></div>
              <div className="hcm-svc-list">
                {svcServices.map((svc) => (
                  <button key={svc.id} className="hcm-svc-card" style={{ "--cc": svc.color } as React.CSSProperties} onClick={() => setActiveSvc(svc)} type="button">
                    <span className="hcm-svc-bar" />
                    <div className="hcm-svc-top">
                      <span style={{ color: svc.color, background: `${svc.color}18` }}>{svc.niche}</span>
                      <span className="hcm-svc-provider"><span className="hcm-mini-av" style={{ background: `${svc.color}aa` }}>{svc.provider.replace(/^@/, "").charAt(0).toUpperCase()}</span>{svc.provider}</span>
                    </div>
                    <strong>{svc.title}</strong>
                    <p className="hcm-svc-detail">{svc.detail.slice(0, 80)}{svc.detail.length > 80 ? "…" : ""}</p>
                    <div className="hcm-svc-footer"><strong>from {svc.rate}</strong><span>View <ArrowRight size={11} /></span></div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {svcJobs.length === 0 && svcServices.length === 0 && (
            <div className="hcm-empty"><Sparkles size={28} /><strong>No listings</strong><p>{svcSearch ? `No results for "${svcSearch}"` : "Post a job or list your service."}</p></div>
          )}

          <div className="hcm-svc-bottom">
            <button onClick={() => setSvcMode("post-job")} type="button"><PlusCircle size={15} /><span>Post a Job</span><small>2 WLD</small></button>
            <button onClick={() => setSvcMode("offer-service")} type="button"><Star size={15} /><span>List Service</span><small>2 WLD</small></button>
          </div>
        </>
      )}
    </div>
  );
}
