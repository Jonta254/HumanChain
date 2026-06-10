"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Camera,
  Clock,
  Globe2,
  Languages,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { chatWithWorld } from "@/lib/world";
import {
  formatShortTime,
  requireVerifiedPublicAction,
} from "@/lib/humanchain/utils";
import { saveJsonToStorage, loadJsonFromStorage } from "@/lib/humanchain/storage";
import type { EarnPoints, OpenPayment } from "@/types/ui";
import type { HumanIdentity } from "@/types/user";
import type { HistoryRecord } from "@/types/reputation";

// ─────────────────────────────────────────────────────────────────────────────
// NEARBY MARKET — static seed data
// ─────────────────────────────────────────────────────────────────────────────

const ITEM_CATEGORIES = [
  { id: "all",         label: "All",        color: "#2f6fed" },
  { id: "electronics", label: "Electronics",color: "#2f6fed" },
  { id: "fashion",     label: "Fashion",    color: "#b98218" },
  { id: "food",        label: "Food",       color: "#246b55" },
  { id: "furniture",   label: "Furniture",  color: "#ef7d69" },
  { id: "services",    label: "Services",   color: "#6657d9" },
];

const SEED_ITEMS = [
  {
    id: "mi1",
    category: "electronics",
    title: "Samsung Galaxy A54 5G",
    detail: "Bought 8 months ago. Excellent condition, no scratches. Comes with original charger and box. Unlocked for all networks.",
    price: "WLD 45",
    condition: "Used · Good",
    area: "Nairobi West",
    distance: "1.2 km",
    seller: "@james_ng",
    sellerInitial: "J",
    bids: 3,
    bidDeadline: "6h left",
    gradient: ["#1a73e8", "#0d47a1"],
    emoji: "📱",
    postedAt: "2h ago",
    negotiable: true,
  },
  {
    id: "mi2",
    category: "fashion",
    title: "Handmade Ankara Tote Bag",
    detail: "Fresh from the workshop. 100% cotton Ankara print. Large enough for a laptop. Handstitched lining. Available in 3 colours — contact to confirm stock.",
    price: "WLD 8",
    condition: "Brand New",
    area: "CBD Market",
    distance: "0.4 km",
    seller: "@aisha_crafts",
    sellerInitial: "A",
    bids: 0,
    bidDeadline: null,
    gradient: ["#e91e8c", "#9c27b0"],
    emoji: "👜",
    postedAt: "45m ago",
    negotiable: false,
  },
  {
    id: "mi3",
    category: "food",
    title: "Home-cooked Lunch Boxes",
    detail: "Today's special: rice, stewed beef, kachumbari, chapati. Cooked fresh every morning. Delivery within 1 km radius. Order before 11 AM.",
    price: "WLD 2",
    condition: "Today Only",
    area: "Westlands",
    distance: "0.8 km",
    seller: "@mama_grace",
    sellerInitial: "G",
    bids: 0,
    bidDeadline: null,
    gradient: ["#f57c00", "#e65100"],
    emoji: "🍱",
    postedAt: "30m ago",
    negotiable: false,
  },
  {
    id: "mi4",
    category: "services",
    title: "Mobile Barber — Home Visits",
    detail: "Professional barber. Haircut, beard trim, line-up. Come to your location. Nairobi area. Book a slot and I will come to you.",
    price: "WLD 5",
    condition: "Available Today",
    area: "Kilimani",
    distance: "2.1 km",
    seller: "@razor_kelvin",
    sellerInitial: "K",
    bids: 0,
    bidDeadline: null,
    gradient: ["#6657d9", "#4527a0"],
    emoji: "✂️",
    postedAt: "1h ago",
    negotiable: true,
  },
  {
    id: "mi5",
    category: "furniture",
    title: "Office Desk + Ergonomic Chair",
    detail: "Moving out sale. Solid wood desk 120×60 cm with cable management. Mesh back chair adjustable height. Both for one price. Self-collect only.",
    price: "WLD 20",
    condition: "Used · Fair",
    area: "Industrial Area",
    distance: "1.5 km",
    seller: "@mike_relocate",
    sellerInitial: "M",
    bids: 1,
    bidDeadline: "14h left",
    gradient: ["#546e7a", "#263238"],
    emoji: "🪑",
    postedAt: "3h ago",
    negotiable: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES — static seed data
// ─────────────────────────────────────────────────────────────────────────────

const NICHES = [
  { id: "all",           label: "All",           icon: Sparkles,  color: "#2f6fed" },
  { id: "legal",         label: "Legal",         icon: Scale,     color: "#2f6fed" },
  { id: "translation",   label: "Translation",   icon: Languages, color: "#246b55" },
  { id: "manufacturing", label: "Manufacturing", icon: Wrench,    color: "#ef7d69" },
  { id: "consulting",    label: "Consulting",    icon: Briefcase, color: "#b98218" },
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
];

const SEED_PROVIDERS = [
  { id: "p1", name: "Kwame Asante", initial: "K", specialty: "Medical & Legal Translation",  niche: "translation",   region: "Ghana",           rating: 5.0, jobs: 132, color: "#246b55" },
  { id: "p2", name: "Amara Diallo", initial: "A", specialty: "West African Commercial Law",  niche: "legal",         region: "Senegal",         rating: 4.9, jobs: 84,  color: "#2f6fed" },
  { id: "p3", name: "Lena Morales", initial: "L", specialty: "CNC & Custom Fabrication",     niche: "manufacturing", region: "Guadalajara, MX", rating: 4.8, jobs: 61,  color: "#ef7d69" },
  { id: "p4", name: "Priya Nair",   initial: "P", specialty: "South Asian Healthcare",       niche: "consulting",    region: "Bangalore, IN",   rating: 4.7, jobs: 49,  color: "#b98218" },
];

const DEADLINE_OPTIONS = ["3 days", "1 week", "2 weeks", "1 month", "Flexible"];
const BUDGET_PRESETS   = ["WLD 25", "WLD 50", "WLD 100", "WLD 200", "WLD 500"];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TopTab   = "market" | "services";
type SvcMode  = "browse" | "post-job" | "offer-service";

interface MarketItem {
  id: string; category: string; title: string; detail: string;
  price: string; condition: string; area: string; distance: string;
  seller: string; sellerInitial: string; bids: number;
  bidDeadline: string | null; gradient: string[];
  emoji: string; postedAt: string; negotiable: boolean;
  photos?: string[];
}

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

type AnyJob = typeof SEED_JOBS[number] | LocalJob;
type SvcListing = AnyJob | LocalService;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MarketplaceView({
  act,
  earnPoints,
  humanIdentity,
  openPayment,
  recordHistory,
}: {
  act: (title: string, detail: string) => void;
  earnPoints: EarnPoints;
  humanIdentity: HumanIdentity | null;
  openPayment: OpenPayment;
  recordHistory: (record: Omit<HistoryRecord, "id" | "time">) => void;
}) {
  // ── Top-level tab ─────────────────────────────────────────────────────────
  const [topTab, setTopTab] = useState<TopTab>("market");

  // ── Market state ──────────────────────────────────────────────────────────
  const [itemSearch, setItemSearch]     = useState("");
  const [itemCat, setItemCat]           = useState("all");
  const [activeItem, setActiveItem]     = useState<MarketItem | null>(null);
  const [showPostItem, setShowPostItem] = useState(false);
  const [localItems, setLocalItems]     = useState<MarketItem[]>(() =>
    loadJsonFromStorage<MarketItem[]>("hc_market_items", []),
  );
  const [itemForm, setItemFormState] = useState({
    title: "", detail: "", price: "", condition: "Used · Good",
    area: "", category: "electronics", negotiable: false,
  });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoCount, setPhotoCount] = useState(0);

  // ── Services state ────────────────────────────────────────────────────────
  const [svcMode, setSvcMode]           = useState<SvcMode>("browse");
  const [activeNiche, setActiveNiche]   = useState("all");
  const [svcSearch, setSvcSearch]       = useState("");
  const [activeSvc, setActiveSvc]       = useState<SvcListing | null>(null);
  const [localJobs, setLocalJobs]       = useState<LocalJob[]>(() =>
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

  const handle = humanIdentity?.username ?? "@you";

  // ── Helpers ───────────────────────────────────────────────────────────────
  function setItem(field: keyof typeof itemForm, value: string | boolean) {
    setItemFormState((c) => ({ ...c, [field]: value }));
  }
  function setJob(field: keyof typeof jobForm, value: string) {
    setJobFormState((c) => ({ ...c, [field]: value }));
  }
  function setService(field: keyof typeof serviceForm, value: string) {
    setServiceFormState((c) => ({ ...c, [field]: value }));
  }
  function nicheColor(niche: string) {
    return NICHES.find((n) => n.id === niche)?.color ?? "#2f6fed";
  }

  async function openChat(seller: string, title: string) {
    try {
      await chatWithWorld({
        message: `Hi ${seller}, I saw "${title}" on HumanChain. Is it still available?`,
        to: [seller.replace(/^@/, "")],
      });
      act("World Chat opened", `Chat with ${seller} is ready.`);
    } catch {
      act("Chat unavailable", "Try opening World App chat directly.");
    }
  }

  // ── Market: post item ─────────────────────────────────────────────────────
  function submitItem() {
    if (!requireVerifiedPublicAction(humanIdentity, act, "posting items")) return;
    const { title, detail, price, condition, area, category, negotiable } = itemForm;
    if (!title.trim() || !price.trim() || !area.trim()) {
      act("Missing info", "Add a title, price, and area to post your item.");
      return;
    }
    const newItem: MarketItem = {
      id: `mi-${Date.now()}`, category, title: title.trim(),
      detail: detail.trim() || "No description provided.",
      price: price.trim().startsWith("WLD") ? price.trim() : `WLD ${price.trim()}`,
      condition, area: area.trim(), distance: "Nearby",
      seller: handle, sellerInitial: handle.replace(/^@/, "").charAt(0).toUpperCase(),
      bids: 0, bidDeadline: null,
      gradient: ["#2f6fed", "#1a4ec7"], emoji: "📦",
      postedAt: formatShortTime(), negotiable,
    };
    const next = [newItem, ...localItems];
    setLocalItems(next);
    saveJsonToStorage("hc_market_items", next);
    recordHistory({ title: "Item listed", detail: `${title} · ${price}`, kind: "market" });
    earnPoints(8, "Item posted to nearby market.");
    setItemFormState({ title: "", detail: "", price: "", condition: "Used · Good", area: "", category: "electronics", negotiable: false });
    setPhotoCount(0);
    setShowPostItem(false);
    act("Item listed!", `"${title}" is now live in the Nearby Market.`);
  }

  // ── Services: submit job ──────────────────────────────────────────────────
  function submitJob() {
    if (!requireVerifiedPublicAction(humanIdentity, act, "posting jobs")) return;
    const { title, detail, budget } = jobForm;
    if (!title.trim() || !detail.trim() || !budget.trim()) {
      act("Missing details", "Add a title, description, and budget.");
      return;
    }
    openPayment({
      title: "Post a Job — 2 WLD",
      amount: "2 WLD",
      detail: "Your job goes live to verified specialists worldwide.",
      success: "Job posted! Verified providers will send proposals.",
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
        earnPoints(10, "Job posted to HumanChain marketplace.");
        setJobFormState({ title: "", detail: "", niche: "legal", budget: "", deadline: "1 week", region: "" });
        setSvcMode("browse");
      },
    });
  }

  // ── Services: submit service ──────────────────────────────────────────────
  function submitService() {
    if (!requireVerifiedPublicAction(humanIdentity, act, "listing services")) return;
    const { title, detail, rate } = serviceForm;
    if (!title.trim() || !detail.trim() || !rate.trim()) {
      act("Missing details", "Add a title, description, and rate.");
      return;
    }
    openPayment({
      title: "List Your Service — 2 WLD",
      amount: "2 WLD",
      detail: "Your profile goes live to clients worldwide.",
      success: "Service listed! Clients can now find and contact you.",
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
        earnPoints(12, "Service listing published.");
        setServiceFormState({ title: "", detail: "", niche: "translation", rate: "", region: "", languages: "" });
        setSvcMode("browse");
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Item detail
  // ═══════════════════════════════════════════════════════════════════════════

  if (activeItem) {
    const [g0, g1] = activeItem.gradient;
    return (
      <div className="screen mkt-detail-screen">
        <div className="mkt-detail-hero" style={{ background: `linear-gradient(145deg, ${g0}, ${g1})` }}>
          <button className="mkt-back" onClick={() => setActiveItem(null)} type="button">
            <ArrowLeft size={15} /> Back
          </button>
          <div className="mkt-hero-emoji">{activeItem.emoji}</div>
          <div className="mkt-hero-badge">{activeItem.condition}</div>
        </div>

        <div className="mkt-detail-body">
          <div className="mkt-detail-title-row">
            <h1>{activeItem.title}</h1>
            <strong className="mkt-detail-price">{activeItem.price}</strong>
          </div>

          <div className="mkt-detail-meta-row">
            <span><MapPin size={12} />{activeItem.area} · {activeItem.distance}</span>
            <span><Clock size={12} />{activeItem.postedAt}</span>
            {activeItem.negotiable && <span className="mkt-negotiable">Negotiable</span>}
          </div>

          {activeItem.bids > 0 && activeItem.bidDeadline && (
            <div className="mkt-bid-banner">
              <Zap size={13} />
              <span><strong>{activeItem.bids} bid{activeItem.bids !== 1 ? "s" : ""}</strong> · {activeItem.bidDeadline}</span>
              <button
                onClick={() => {
                  if (!requireVerifiedPublicAction(humanIdentity, act, "placing bids")) return;
                  act("Bid placed!", `You bid on "${activeItem.title}". Seller will be notified via World Chat.`);
                }}
                type="button"
              >
                Place Bid
              </button>
            </div>
          )}

          <section className="mkt-detail-section">
            <strong>Description</strong>
            <p>{activeItem.detail}</p>
          </section>

          <div className="mkt-detail-trust">
            <span><BadgeCheck size={12} />World ID verified seller</span>
            <span><ShieldCheck size={12} />WLD escrow available</span>
            <span><Star size={12} />Rated on delivery</span>
          </div>

          <div className="mkt-detail-seller">
            <div className="mkt-seller-av" style={{ background: `linear-gradient(135deg, ${g0}cc, ${g1}55)` }}>
              {activeItem.sellerInitial}
              <span className="mkt-seller-pip"><BadgeCheck size={8} /></span>
            </div>
            <div>
              <strong>{activeItem.seller}</strong>
              <span>World ID Verified</span>
            </div>
            <BadgeCheck size={16} color="#2f6fed" />
          </div>

          <div className="mkt-detail-actions">
            <button
              className="mkt-cta-primary"
              onClick={() => {
                if (!requireVerifiedPublicAction(humanIdentity, act, "contacting sellers")) return;
                void openChat(activeItem.seller, activeItem.title);
              }}
              type="button"
            >
              <MessageCircle size={15} /> Chat with Seller
            </button>
            <button className="mkt-cta-secondary" onClick={() => setActiveItem(null)} type="button">
              Back to Market
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Post item form
  // ═══════════════════════════════════════════════════════════════════════════

  if (showPostItem) {
    const CONDITIONS = ["Brand New", "Used · Like New", "Used · Good", "Used · Fair", "For Parts"];
    return (
      <div className="screen mk-form-screen">
        <div className="mk-form-header">
          <button className="mk-back" onClick={() => setShowPostItem(false)} type="button">
            <ArrowLeft size={15} /> Back
          </button>
          <h1>Post an Item</h1>
          <p>Sell or trade with people nearby. 2 photos free.</p>
        </div>

        <div className="mk-form-body">
          {/* Photo upload */}
          <div className="mkt-photo-row">
            <button
              className="mkt-photo-add"
              onClick={() => photoInputRef.current?.click()}
              type="button"
              disabled={photoCount >= 2}
            >
              <Camera size={20} />
              <span>{photoCount === 0 ? "Add photos" : `${photoCount}/2`}</span>
            </button>
            {photoCount > 0 && (
              <div className="mkt-photo-thumb">
                <Package size={20} />
                <span>{photoCount} photo{photoCount > 1 ? "s" : ""}</span>
              </div>
            )}
            {photoCount >= 2 && (
              <button
                className="mkt-photo-more"
                onClick={() => openPayment({
                  title: "More Photos — 1.5 WLD",
                  amount: "1.5 WLD",
                  detail: "Add up to 5 additional photos to your listing.",
                  success: "Extra photos unlocked!",
                  feature: "marketplace-featured-listing",
                  onConfirmed: () => { setPhotoCount((c) => Math.min(c + 3, 7)); },
                })}
                type="button"
              >
                +More · 1.5 WLD
              </button>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="mkt-hidden-input"
              onChange={(e) => {
                if (e.target.files) setPhotoCount((c) => Math.min(c + e.target.files!.length, 2));
              }}
            />
          </div>

          <label className="mk-field">
            <span>What are you selling? <em>*</em></span>
            <input
              placeholder="e.g. Samsung Galaxy A54, Handmade bag, Lunch boxes…"
              value={itemForm.title}
              onChange={(e) => setItem("title", e.target.value)}
            />
          </label>

          <label className="mk-field">
            <span>Description</span>
            <textarea
              placeholder="Condition, size, what's included, delivery or pickup…"
              rows={3}
              value={itemForm.detail}
              onChange={(e) => setItem("detail", e.target.value)}
            />
          </label>

          <label className="mk-field">
            <span>Price <em>*</em></span>
            <input
              placeholder="e.g. 15 or WLD 15"
              value={itemForm.price}
              onChange={(e) => setItem("price", e.target.value)}
              inputMode="decimal"
            />
          </label>

          <div className="mk-field">
            <span className="mk-label">Category</span>
            <div className="mk-presets" style={{ flexWrap: "wrap" }}>
              {ITEM_CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                <button
                  key={c.id}
                  className={`mk-preset ${itemForm.category === c.id ? "active" : ""}`}
                  onClick={() => setItem("category", c.id)}
                  type="button"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mk-field">
            <span className="mk-label">Condition</span>
            <div className="mk-presets" style={{ flexWrap: "wrap" }}>
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  className={`mk-preset ${itemForm.condition === c ? "active" : ""}`}
                  onClick={() => setItem("condition", c)}
                  type="button"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <label className="mk-field">
            <span>Your area <em>*</em></span>
            <input
              placeholder="e.g. Westlands, CBD, Kilimani…"
              value={itemForm.area}
              onChange={(e) => setItem("area", e.target.value)}
            />
          </label>

          <label className="mkt-check-field">
            <input
              type="checkbox"
              checked={itemForm.negotiable}
              onChange={(e) => setItem("negotiable", e.target.checked)}
            />
            <span>Price is negotiable</span>
          </label>

          <div className="mk-form-trust">
            <ShieldCheck size={13} />
            <span>Free to list · 2 photos included · WLD escrow on sale</span>
          </div>

          <button
            className="mk-submit"
            disabled={!itemForm.title.trim() || !itemForm.price.trim() || !itemForm.area.trim()}
            onClick={submitItem}
            type="button"
          >
            List Item — Free
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Services: post-job form
  // ═══════════════════════════════════════════════════════════════════════════

  if (topTab === "services" && svcMode === "post-job") {
    return (
      <div className="screen mk-form-screen">
        <div className="mk-form-header">
          <button className="mk-back" onClick={() => setSvcMode("browse")} type="button">
            <ArrowLeft size={15} /> Back
          </button>
          <h1>Post a Job</h1>
          <p>Verified specialists worldwide will send proposals.</p>
        </div>
        <div className="mk-form-body">
          <label className="mk-field">
            <span>What do you need? <em>*</em></span>
            <input placeholder="e.g. Translate 3 medical documents Swahili → English"
              value={jobForm.title} onChange={(e) => setJob("title", e.target.value)} />
          </label>
          <label className="mk-field">
            <span>Details <em>*</em></span>
            <textarea placeholder="Scope, timeline, deliverables, special requirements…"
              rows={4} value={jobForm.detail} onChange={(e) => setJob("detail", e.target.value)} />
          </label>
          <div className="mk-field">
            <span className="mk-label">Specialty</span>
            <div className="mk-niche-picker">
              {NICHES.filter((n) => n.id !== "all").map((n) => {
                const Icon = n.icon;
                return (
                  <button key={n.id}
                    className={`mk-niche-btn ${jobForm.niche === n.id ? "active" : ""}`}
                    style={{ "--n-color": n.color } as React.CSSProperties}
                    onClick={() => setJob("niche", n.id)} type="button">
                    <Icon size={14} />{n.label}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="mk-field">
            <span>Budget <em>*</em></span>
            <div className="mk-presets">
              {BUDGET_PRESETS.map((p) => (
                <button key={p} className={`mk-preset ${jobForm.budget === p ? "active" : ""}`}
                  onClick={() => setJob("budget", p)} type="button">{p}</button>
              ))}
            </div>
            <input placeholder="Or type custom, e.g. WLD 75"
              value={jobForm.budget} onChange={(e) => setJob("budget", e.target.value)} />
          </label>
          <div className="mk-field">
            <span className="mk-label">Deadline</span>
            <div className="mk-presets">
              {DEADLINE_OPTIONS.map((d) => (
                <button key={d} className={`mk-preset ${jobForm.deadline === d ? "active" : ""}`}
                  onClick={() => setJob("deadline", d)} type="button">{d}</button>
              ))}
            </div>
          </div>
          <label className="mk-field">
            <span>Region</span>
            <input placeholder="e.g. West Africa, or Worldwide"
              value={jobForm.region} onChange={(e) => setJob("region", e.target.value)} />
          </label>
          <div className="mk-form-trust">
            <ShieldCheck size={13} />
            <span>2 WLD posting fee · Escrow on hire · Milestone payments</span>
          </div>
          <button className="mk-submit"
            disabled={!jobForm.title.trim() || !jobForm.detail.trim() || !jobForm.budget.trim()}
            onClick={submitJob} type="button">
            Post Job — 2 WLD
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Services: offer-service form
  // ═══════════════════════════════════════════════════════════════════════════

  if (topTab === "services" && svcMode === "offer-service") {
    return (
      <div className="screen mk-form-screen">
        <div className="mk-form-header">
          <button className="mk-back" onClick={() => setSvcMode("browse")} type="button">
            <ArrowLeft size={15} /> Back
          </button>
          <h1>List Your Service</h1>
          <p>Tell clients what you offer. Get hired via World Chat.</p>
        </div>
        <div className="mk-form-body">
          <label className="mk-field">
            <span>What do you offer? <em>*</em></span>
            <input placeholder="e.g. Medical document translation Swahili ↔ English"
              value={serviceForm.title} onChange={(e) => setService("title", e.target.value)} />
          </label>
          <label className="mk-field">
            <span>Description <em>*</em></span>
            <textarea placeholder="Your expertise, experience, certifications…"
              rows={4} value={serviceForm.detail} onChange={(e) => setService("detail", e.target.value)} />
          </label>
          <div className="mk-field">
            <span className="mk-label">Your specialty</span>
            <div className="mk-niche-picker">
              {NICHES.filter((n) => n.id !== "all").map((n) => {
                const Icon = n.icon;
                return (
                  <button key={n.id}
                    className={`mk-niche-btn ${serviceForm.niche === n.id ? "active" : ""}`}
                    style={{ "--n-color": n.color } as React.CSSProperties}
                    onClick={() => setService("niche", n.id)} type="button">
                    <Icon size={14} />{n.label}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="mk-field">
            <span>Starting rate <em>*</em></span>
            <div className="mk-presets">
              {BUDGET_PRESETS.map((p) => (
                <button key={p} className={`mk-preset ${serviceForm.rate === p ? "active" : ""}`}
                  onClick={() => setService("rate", p)} type="button">{p}</button>
              ))}
            </div>
            <input placeholder="Or type custom, e.g. WLD 30 per 1,000 words"
              value={serviceForm.rate} onChange={(e) => setService("rate", e.target.value)} />
          </label>
          <label className="mk-field">
            <span>Languages</span>
            <input placeholder="e.g. Swahili, English, French"
              value={serviceForm.languages} onChange={(e) => setService("languages", e.target.value)} />
          </label>
          <label className="mk-field">
            <span>Regions you serve</span>
            <input placeholder="e.g. East Africa, or Worldwide"
              value={serviceForm.region} onChange={(e) => setService("region", e.target.value)} />
          </label>
          <div className="mk-form-trust">
            <ShieldCheck size={13} />
            <span>2 WLD listing fee · World ID verified profile</span>
          </div>
          <button className="mk-submit"
            disabled={!serviceForm.title.trim() || !serviceForm.detail.trim() || !serviceForm.rate.trim()}
            onClick={submitService} type="button">
            List Service — 2 WLD
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Services: detail
  // ═══════════════════════════════════════════════════════════════════════════

  if (topTab === "services" && activeSvc) {
    const isJob     = activeSvc.type === "job";
    const color     = activeSvc.color;
    const poster    = isJob ? (activeSvc as AnyJob).poster   : (activeSvc as LocalService).provider;
    const budget    = isJob ? (activeSvc as AnyJob).budget   : (activeSvc as LocalService).rate;
    const deadline  = isJob ? (activeSvc as AnyJob).deadline : null;
    const proposals = isJob ? (activeSvc as AnyJob).proposals : null;
    const skills    = isJob ? (activeSvc as AnyJob).skills   : [];
    const languages = !isJob ? (activeSvc as LocalService).languages : null;

    return (
      <div className="screen mk-detail">
        <div className="mk-detail-hero" style={{ "--dc": color } as React.CSSProperties}>
          <button className="mk-back" onClick={() => setActiveSvc(null)} type="button">
            <ArrowLeft size={15} />Back
          </button>
          <span className="mk-detail-niche">{activeSvc.niche}</span>
          <h1>{activeSvc.title}</h1>
          <div className="mk-detail-meta">
            <span><Globe2 size={12} />{activeSvc.region}</span>
            {deadline    && <span><Clock size={12} />{deadline} left</span>}
            {proposals !== null && <span><Users size={12} />{proposals} proposals</span>}
          </div>
        </div>
        <div className="mk-detail-body">
          <div className="mk-detail-budget-row">
            <div>
              <span>{isJob ? "Budget" : "Starting rate"}</span>
              <strong>{budget}</strong>
            </div>
            <span className="mk-escrow-badge"><ShieldCheck size={12} />Escrow</span>
          </div>
          <section className="mk-detail-section">
            <strong>Description</strong>
            <p>{activeSvc.detail}</p>
          </section>
          {skills.length > 0 && (
            <section className="mk-detail-section">
              <strong>Skills needed</strong>
              <div className="mk-skill-chips">
                {skills.map((s) => <span key={s}>{s}</span>)}
              </div>
            </section>
          )}
          {languages && (
            <section className="mk-detail-section">
              <strong>Languages / regions</strong>
              <p>{languages}</p>
            </section>
          )}
          <div className="mk-detail-trust">
            <span><BadgeCheck size={12} />World ID verified</span>
            <span><ShieldCheck size={12} />WLD escrow on hire</span>
            <span><Zap size={12} />Milestone payments</span>
          </div>
          <div className="mk-detail-actions">
            <button
              className="mk-cta-primary"
              onClick={() => {
                if (!requireVerifiedPublicAction(humanIdentity, act, isJob ? "applying to jobs" : "contacting providers")) return;
                void openChat(poster, activeSvc.title);
              }}
              type="button"
            >
              <MessageCircle size={15} />
              {isJob ? "Apply via World Chat" : "Contact Provider"}
            </button>
            <button className="mk-cta-secondary" onClick={() => setActiveSvc(null)} type="button">
              Back to listings
            </button>
          </div>
          <div className="mk-detail-poster">
            <div className="mk-poster-av" style={{ background: `linear-gradient(135deg,${color}cc,${color}55)` }}>
              {poster.replace(/^@/, "").charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{poster}</strong>
              <span>World ID Verified</span>
            </div>
            <BadgeCheck size={15} color="#2f6fed" />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Main browse (both tabs)
  // ═══════════════════════════════════════════════════════════════════════════

  const allItems = [...SEED_ITEMS, ...localItems];
  const filteredItems = allItems.filter((item) => {
    const matchesCat = itemCat === "all" || item.category === itemCat;
    const q = itemSearch.trim().toLowerCase();
    return matchesCat && (!q || `${item.title} ${item.area} ${item.category}`.toLowerCase().includes(q));
  });

  const allListings: SvcListing[] = [...SEED_JOBS, ...localJobs, ...localServices];
  const filteredSvc = allListings.filter((item) => {
    const matchesNiche = activeNiche === "all" || item.niche === activeNiche;
    const q = svcSearch.trim().toLowerCase();
    return matchesNiche && (!q || `${item.title} ${item.niche} ${item.region ?? ""}`.toLowerCase().includes(q));
  });
  const svcJobs     = filteredSvc.filter((i) => i.type === "job") as AnyJob[];
  const svcServices = filteredSvc.filter((i) => i.type === "service") as LocalService[];
  const urgentJobs  = SEED_JOBS.filter((j) => j.urgent);

  return (
    <div className="screen mkt-root">

      {/* ── Top header with dual tabs ─────────────────────────────────────── */}
      <div className="mkt-topbar">
        <div className="mkt-tabs">
          <button
            className={`mkt-tab ${topTab === "market" ? "active" : ""}`}
            onClick={() => setTopTab("market")}
            type="button"
          >
            <Tag size={14} /> Nearby Market
          </button>
          <button
            className={`mkt-tab ${topTab === "services" ? "active" : ""}`}
            onClick={() => setTopTab("services")}
            type="button"
          >
            <Briefcase size={14} /> Services
          </button>
        </div>

        {topTab === "market" ? (
          <button className="mkt-post-btn" onClick={() => setShowPostItem(true)} type="button">
            <Plus size={14} /> Sell
          </button>
        ) : (
          <div className="mk-header-btns">
            <button className="mk-btn-offer" onClick={() => setSvcMode("offer-service")} type="button">
              <Star size={13} />Offer
            </button>
            <button className="mk-btn-post" onClick={() => setSvcMode("post-job")} type="button">
              <Plus size={13} />Post Job
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          NEARBY MARKET TAB
          ══════════════════════════════════════════════════════════════════ */}
      {topTab === "market" && (
        <>
          {/* Search + category */}
          <div className="mkt-search-row">
            <div className="mkt-search">
              <Search size={14} />
              <input
                aria-label="Search market"
                placeholder="Search items, food, services…"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
              />
              {itemSearch && <button onClick={() => setItemSearch("")} type="button" aria-label="Clear">×</button>}
            </div>
          </div>

          <div className="mkt-cat-row">
            {ITEM_CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={`mkt-cat-chip ${itemCat === c.id ? "active" : ""}`}
                style={{ "--cat-color": c.color } as React.CSSProperties}
                onClick={() => setItemCat(c.id)}
                type="button"
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Location context strip */}
          {itemCat === "all" && !itemSearch && (
            <div className="mkt-location-strip">
              <MapPin size={12} />
              <span>Showing items near you · <strong>Nairobi</strong></span>
              <button type="button" onClick={() => act("Change location", "GPS location update coming soon.")}>
                Change
              </button>
            </div>
          )}

          {/* Items grid */}
          <div className="mkt-items-grid">
            {filteredItems.map((item) => {
              const [g0, g1] = item.gradient;
              return (
                <button
                  key={item.id}
                  className="mkt-item-card"
                  onClick={() => setActiveItem(item)}
                  type="button"
                >
                  <div className="mkt-item-photo" style={{ background: `linear-gradient(145deg, ${g0}, ${g1})` }}>
                    <span className="mkt-item-emoji">{item.emoji}</span>
                    {item.bids > 0 && (
                      <span className="mkt-bid-pip"><Zap size={9} />{item.bids}</span>
                    )}
                  </div>
                  <div className="mkt-item-info">
                    <strong>{item.title}</strong>
                    <span className="mkt-item-price">{item.price}</span>
                    <div className="mkt-item-meta">
                      <span className="mkt-item-cond">{item.condition}</span>
                      <span><MapPin size={9} />{item.distance}</span>
                    </div>
                    <div className="mkt-item-footer">
                      <span>{item.area}</span>
                      <span className="mkt-item-time">{item.postedAt}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="mk-empty">
              <Package size={30} />
              <strong>No items found</strong>
              <p>{itemSearch ? `No results for "${itemSearch}"` : "Be the first to list something nearby."}</p>
              <button onClick={() => setShowPostItem(true)} type="button"><Plus size={14} />Sell an Item</button>
            </div>
          )}

          {/* Sell FAB strip */}
          <div className="mkt-sell-strip">
            <button onClick={() => setShowPostItem(true)} type="button">
              <Camera size={14} /><span>Sell Something</span><small>Free listing</small>
            </button>
            <button onClick={() => act("Bid alerts", "You will be notified when someone outbids you.")} type="button">
              <Zap size={14} /><span>My Bids</span><small>Track</small>
            </button>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SERVICES TAB
          ══════════════════════════════════════════════════════════════════ */}
      {topTab === "services" && (
        <>
          <div className="mk-search">
            <Search size={15} />
            <input aria-label="Search services" placeholder="Search jobs, services, regions…"
              value={svcSearch} onChange={(e) => setSvcSearch(e.target.value)} />
            {svcSearch && <button onClick={() => setSvcSearch("")} type="button" aria-label="Clear">×</button>}
          </div>

          <div className="mk-niche-tabs">
            {NICHES.map((n) => {
              const Icon = n.icon;
              return (
                <button key={n.id}
                  className={`mk-niche-tab ${activeNiche === n.id ? "active" : ""}`}
                  style={{ "--n-color": n.color } as React.CSSProperties}
                  onClick={() => setActiveNiche(n.id)} type="button">
                  <Icon size={13} />{n.label}
                </button>
              );
            })}
          </div>

          {/* Urgent jobs strip */}
          {activeNiche === "all" && !svcSearch && (
            <div className="mk-section">
              <div className="mk-section-head">
                <strong>Urgent — Apply Now</strong>
                <span className="mk-live-pill"><span className="mk-pulse" />Live</span>
              </div>
              <div className="mk-featured-scroll">
                {urgentJobs.map((job) => (
                  <button key={job.id} className="mk-featured-card"
                    style={{ "--fc": job.color } as React.CSSProperties}
                    onClick={() => setActiveSvc(job)} type="button">
                    <span className="mk-fc-niche">{job.niche}</span>
                    <strong>{job.title}</strong>
                    <div className="mk-fc-meta">
                      <span><Globe2 size={11} />{job.region}</span>
                      <span><Clock size={11} />{job.deadline}</span>
                    </div>
                    <div className="mk-fc-footer">
                      <strong>{job.budget}</strong>
                      <span>{job.proposals} proposals</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Top providers */}
          {activeNiche === "all" && !svcSearch && (
            <div className="mk-section">
              <div className="mk-section-head"><strong>Top Specialists</strong></div>
              <div className="mk-providers-row">
                {SEED_PROVIDERS.map((p) => (
                  <div key={p.id} className="mk-provider-chip">
                    <div className="mk-pav" style={{ background: `linear-gradient(135deg,${p.color}cc,${p.color}55)` }}>
                      {p.initial}
                      <span className="mk-pip"><BadgeCheck size={8} /></span>
                    </div>
                    <span>{p.name.split(" ")[0]}</span>
                    <span className="mk-prating"><Star size={9} fill="currentColor" />{p.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jobs list */}
          {svcJobs.length > 0 && (
            <div className="mk-section">
              <div className="mk-section-head">
                <strong>{activeNiche === "all" ? "Open Jobs" : `${NICHES.find(n => n.id === activeNiche)?.label} Jobs`}</strong>
                <span className="mk-count">{svcJobs.length}</span>
              </div>
              <div className="mk-list">
                {svcJobs.map((job) => (
                  <button key={job.id} className="mk-card"
                    style={{ "--cc": job.color } as React.CSSProperties}
                    onClick={() => setActiveSvc(job)} type="button">
                    <span className="mk-card-bar" />
                    <div className="mk-card-top">
                      <span className="mk-card-niche" style={{ color: job.color, background: `${job.color}18` }}>{job.niche}</span>
                      {job.urgent && <span className="mk-urgent">Urgent</span>}
                      <span className="mk-card-dl"><Clock size={10} />{job.deadline}</span>
                    </div>
                    <strong className="mk-card-title">{job.title}</strong>
                    <div className="mk-card-meta">
                      <span><Globe2 size={11} />{job.region}</span>
                      <span><Users size={11} />{job.proposals} proposals</span>
                    </div>
                    {"skills" in job && job.skills.length > 0 && (
                      <div className="mk-card-skills">
                        {job.skills.slice(0, 3).map((s) => <i key={s}>{s}</i>)}
                      </div>
                    )}
                    <div className="mk-card-footer">
                      <strong>{job.budget}</strong>
                      <span>Apply <ArrowRight size={11} /></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Services list */}
          {svcServices.length > 0 && (
            <div className="mk-section">
              <div className="mk-section-head">
                <strong>Service Providers</strong>
                <span className="mk-count">{svcServices.length}</span>
              </div>
              <div className="mk-list">
                {svcServices.map((svc) => (
                  <button key={svc.id} className="mk-card mk-svc-card"
                    style={{ "--cc": svc.color } as React.CSSProperties}
                    onClick={() => setActiveSvc(svc)} type="button">
                    <span className="mk-card-bar" />
                    <div className="mk-card-top">
                      <span className="mk-card-niche" style={{ color: svc.color, background: `${svc.color}18` }}>{svc.niche}</span>
                      <span className="mk-card-provider">
                        <span className="mk-mini-av" style={{ background: `${svc.color}aa` }}>
                          {svc.provider.replace(/^@/, "").charAt(0).toUpperCase()}
                        </span>
                        {svc.provider}
                      </span>
                    </div>
                    <strong className="mk-card-title">{svc.title}</strong>
                    {svc.detail && <p className="mk-card-detail">{svc.detail.slice(0, 90)}{svc.detail.length > 90 ? "…" : ""}</p>}
                    <div className="mk-card-footer">
                      <strong>from {svc.rate}</strong>
                      <span>View <ArrowRight size={11} /></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {svcJobs.length === 0 && svcServices.length === 0 && (
            <div className="mk-empty">
              <Sparkles size={30} />
              <strong>No listings found</strong>
              <p>{svcSearch ? `No results for "${svcSearch}"` : "Post a job or list your service."}</p>
              <div className="mk-empty-btns">
                <button onClick={() => setSvcMode("post-job")} type="button"><Plus size={14} />Post a Job</button>
                <button onClick={() => setSvcMode("offer-service")} type="button"><Star size={14} />Offer Service</button>
              </div>
            </div>
          )}

          <div className="mk-bottom-strip">
            <button onClick={() => setSvcMode("post-job")} type="button">
              <Plus size={15} /><span>Post a Job</span><small>2 WLD</small>
            </button>
            <button onClick={() => setSvcMode("offer-service")} type="button">
              <Star size={15} /><span>List Service</span><small>2 WLD</small>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
