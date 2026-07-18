"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Camera,
  Link2,
  MessageCircleQuestion,
  Mic,
  Search,
  Sparkles,
  Store,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import type { Tab } from "@/types/ui";

type CreateAction = {
  id: string;
  icon: typeof Sparkles;
  color: string;
  title: string;
  sub: string;
  hp: string;
  cost: "Free" | string;
  tab: Tab;
  detail: string;
};

type Category = {
  id: string;
  label: string;
  description: string;
  accent: string;
  actions: CreateAction[];
};

const CATEGORIES: Category[] = [
  {
    id: "share",
    label: "Share",
    description: "Publish content that builds your trust score",
    accent: "#137a57",
    actions: [
      {
        id: "moment",
        icon: Camera,
        color: "#137a57",
        title: "Post Moment",
        sub: "Real photo or reflection — verified humans only",
        hp: "+12 HP",
        cost: "Free",
        tab: "chains",
        detail: "Post a real photo or reflection. Every verified moment adds a permanent link to your reputation.",
      },
      {
        id: "proof",
        icon: BadgeCheck,
        color: "#0f9d6c",
        title: "Proof of Work",
        sub: "Show a real deliverable you completed today",
        hp: "+18 HP",
        cost: "Free",
        tab: "chains",
        detail: "Post proof of completed work. Real deliverables earn the strongest reputation signals on HumanChain.",
      },
      {
        id: "story",
        icon: BookOpen,
        color: "#2f6fed",
        title: "Write Story",
        sub: "Publish a 200-character story or upload a file",
        hp: "+14 HP",
        cost: "Free",
        tab: "stories",
        detail: "Write exactly 200 characters or upload a PDF. Stories reach verified readers on HumanChain.",
      },
      {
        id: "voice",
        icon: Mic,
        color: "#15938a",
        title: "Voice Answer",
        sub: "Record your voice — carries trust text cannot",
        hp: "+10 HP",
        cost: "2 WLD",
        tab: "ask",
        detail: "Unlock voice answers in Ask for 2 WLD. A human voice carries more trust than typed text — harder to fake.",
      },
    ],
  },
  {
    id: "connect",
    label: "Connect",
    description: "Engage verified humans and grow your chain",
    accent: "#2f6fed",
    actions: [
      {
        id: "ask",
        icon: MessageCircleQuestion,
        color: "#2f6fed",
        title: "Ask a Question",
        sub: "Get answers from verified humans",
        hp: "+8 HP",
        cost: "Free",
        tab: "ask",
        detail: "Post one honest question. Verified humans answer — real answers from real people.",
      },
      {
        id: "link",
        icon: Link2,
        color: "#6657d9",
        title: "Add Chain Link",
        sub: "Post one truth to a live community field",
        hp: "+12 HP",
        cost: "Free",
        tab: "chains",
        detail: "Add one honest link to a live HumanChain field. Your link joins the global chain permanently.",
      },
      {
        id: "community",
        icon: Users,
        color: "#137a57",
        title: "Community Update",
        sub: "Share an update in your chain room",
        hp: "+10 HP",
        cost: "Free",
        tab: "chains",
        detail: "Post to your HumanChain community. Community contributions build your standing in that field.",
      },
      {
        id: "challenge",
        icon: Trophy,
        color: "#d8a93c",
        title: "Start Challenge",
        sub: "Rally your community around a verified goal",
        hp: "+22 HP",
        cost: "Free",
        tab: "chains",
        detail: "Start a community challenge. Verified completions earn badges and the highest reputation signals.",
      },
    ],
  },
  {
    id: "build",
    label: "Build",
    description: "List work, services, and marketplace items",
    accent: "#b88a1f",
    actions: [
      {
        id: "job",
        icon: Briefcase,
        color: "#b88a1f",
        title: "Post a Job",
        sub: "Hire a verified specialist",
        hp: "+15 HP",
        cost: "2 WLD",
        tab: "market",
        detail: "Post a job opportunity. Verified specialists apply, and you pay them directly in WLD once you agree on terms.",
      },
      {
        id: "service",
        icon: Sparkles,
        color: "#6657d9",
        title: "List Your Service",
        sub: "Offer your skills to verified humans on HumanChain",
        hp: "+12 HP",
        cost: "2 WLD",
        tab: "market",
        detail: "Offer your expertise globally. Set your rate, regions, and specialties. Payments settle in WLD.",
      },
      {
        id: "listing",
        icon: Store,
        color: "#ef7d69",
        title: "Sell in Marketplace",
        sub: "List goods with real photos — 2 photos free",
        hp: "+10 HP",
        cost: "Free",
        tab: "market",
        detail: "Add a marketplace listing with real photos. Buyers pay you directly in WLD — meet and verify before you hand anything over.",
      },
    ],
  },
];

const ALL_ACTIONS = CATEGORIES.flatMap((c) => c.actions.map((a) => ({ ...a, categoryId: c.id, categoryLabel: c.label, categoryColor: c.accent })));
const TOTAL_HP = ALL_ACTIONS.reduce((sum, a) => sum + Number(a.hp.replace(/\D/g, "")), 0);
// Rotate featured action daily (7 days × 11 actions)
const FEATURED_IDS = ["proof", "challenge", "job", "story", "ask", "service", "moment"];
const FEATURED = ALL_ACTIONS.find((a) => a.id === FEATURED_IDS[new Date().getDay() % FEATURED_IDS.length]) ?? ALL_ACTIONS[0];

export function CreateView({
  act,
  setTab,
}: {
  act: (title: string, detail: string) => void;
  setTab: (tab: Tab) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("share");
  const [query, setQuery] = useState("");

  const searching = query.trim().length > 0;

  const filteredActions = useMemo(() => {
    if (!searching) return null;
    const q = query.trim().toLowerCase();
    return ALL_ACTIONS.filter((a) => `${a.title} ${a.sub}`.toLowerCase().includes(q));
  }, [query, searching]);

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory) ?? CATEGORIES[0];

  function launch(a: CreateAction) {
    setTab(a.tab);
    act(a.title, a.detail);
  }

  return (
    <div className="screen create-page">
      {/* Header */}
      <div className="create-page-head">
        <div>
          <strong>Create</strong>
          <span>Every action earns HP and builds your verified reputation.</span>
        </div>
        <div className="create-page-hp-pill">
          <Zap size={13} />
          <span>+{TOTAL_HP} HP available</span>
        </div>
      </div>

      {/* Search */}
      <div className="create-page-search">
        <Search size={15} />
        <input
          aria-label="Search create actions"
          placeholder="Search moments, jobs, questions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && <button onClick={() => setQuery("")} type="button" aria-label="Clear">×</button>}
      </div>

      {!searching && (
        <>
          {/* Featured hero */}
          <button
            className="create-hero"
            style={{ "--hero-color": FEATURED.color } as React.CSSProperties}
            onClick={() => launch(FEATURED)}
            type="button"
          >
            <span className="create-hero-tag"><Sparkles size={11} />Top pick today</span>
            <strong>{FEATURED.title}</strong>
            <p>{FEATURED.sub}</p>
            <div className="create-hero-footer">
              <span className="create-hero-hp">{FEATURED.hp}</span>
              <span className="create-hero-go">Start <ArrowRight size={13} /></span>
            </div>
          </button>

          {/* Category tabs */}
          <div className="create-page-cat-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`create-page-cat-tab${activeCategory === cat.id ? " active" : ""}`}
                style={{ "--cat-accent": cat.accent } as React.CSSProperties}
                onClick={() => setActiveCategory(cat.id)}
                type="button"
              >
                <span className="create-hub-cat-dot" />
                {cat.label}
                <span className="create-hub-cat-count">{cat.actions.length}</span>
              </button>
            ))}
          </div>

          <p className="create-page-cat-desc">{currentCategory.description}</p>

          {/* Action grid for selected category */}
          <div className="create-hub-cat-grid create-page-grid">
            {currentCategory.actions.map((a) => (
              <ActionCard key={a.id} a={a as EnrichedAction} onClick={() => launch(a)} />
            ))}
          </div>
        </>
      )}

      {searching && (
        <div className="create-page-results">
          <div className="create-page-results-head">
            <span>{filteredActions?.length ?? 0} result{filteredActions?.length === 1 ? "" : "s"}</span>
          </div>
          {filteredActions && filteredActions.length > 0 ? (
            <div className="create-hub-cat-grid create-page-grid">
              {filteredActions.map((a) => (
                <ActionCard key={a.id} a={a as EnrichedAction} onClick={() => launch(a)} showCategory />
              ))}
            </div>
          ) : (
            <div className="create-page-empty">
              <Search size={26} />
              <strong>No actions match</strong>
              <p>Try &quot;moment&quot;, &quot;job&quot;, &quot;story&quot;, or &quot;ask&quot;.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type EnrichedAction = CreateAction & { categoryId: string; categoryLabel?: string; categoryColor?: string };

function ActionCard({ a, onClick, showCategory }: { a: EnrichedAction; onClick: () => void; showCategory?: boolean }) {
  const Icon = a.icon;
  return (
    <button
      className="create-hub-item create-hub-item--card"
      style={{ "--ca-color": a.color } as React.CSSProperties}
      onClick={onClick}
      type="button"
    >
      <span className="create-hub-icon">
        <Icon size={20} />
      </span>
      <span className="create-hub-text">
        <strong>{a.title}</strong>
        <small>{a.sub}</small>
        {showCategory && a.categoryLabel && (
          <span className="create-hub-cat-label" style={{ color: a.categoryColor }}>{a.categoryLabel}</span>
        )}
      </span>
      <span className="create-hub-badges">
        <span className="create-hub-hp-badge">{a.hp}</span>
        <span className={`create-hub-cost-badge ${a.cost === "Free" ? "free" : "paid"}`}>
          {a.cost}
        </span>
      </span>
    </button>
  );
}
