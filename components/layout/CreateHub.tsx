"use client";

import { useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  Camera,
  ChevronDown,
  Link2,
  MessageCircleQuestion,
  Mic,
  Sparkles,
  Store,
  Trophy,
  Users,
  X,
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
        detail: "Write exactly 200 characters or upload a PDF. Stories reach verified readers across 38 countries.",
      },
      {
        id: "voice",
        icon: Mic,
        color: "#15938a",
        title: "Voice Answer",
        sub: "Record your voice — carries trust text cannot",
        hp: "+10 HP",
        cost: "Free",
        tab: "ask",
        detail: "Record a real voice answer. A human voice carries more trust than typed text — it is harder to fake.",
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
        sub: "Get answers from verified humans in 38 countries",
        hp: "+8 HP",
        cost: "Free",
        tab: "ask",
        detail: "Post one honest question. Verified humans from 38 countries answer — real answers from real people.",
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
        sub: "Hire a verified specialist — escrow protected",
        hp: "+15 HP",
        cost: "2 WLD",
        tab: "market",
        detail: "Post a job opportunity. Verified specialists apply and payment is held safely in WLD escrow until delivery.",
      },
      {
        id: "service",
        icon: Sparkles,
        color: "#6657d9",
        title: "List Your Service",
        sub: "Offer your skills to 214k verified humans",
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
        detail: "Add a marketplace listing with real photos. WLD escrow protects every trade automatically.",
      },
    ],
  },
];

const TOTAL_HP = CATEGORIES.flatMap((c) => c.actions)
  .reduce((sum, a) => sum + Number(a.hp.replace(/\D/g, "")), 0);

export function CreateHub({
  act,
  onClose,
  setTab,
}: {
  act: (title: string, detail: string) => void;
  onClose: () => void;
  setTab: (tab: Tab) => void;
}) {
  const [openCategory, setOpenCategory] = useState<string>("share");

  function toggleCategory(id: string) {
    setOpenCategory((cur) => (cur === id ? "" : id));
  }

  return (
    <div
      className="create-hub-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Create"
      onClick={onClose}
    >
      <div className="create-hub" onClick={(e) => e.stopPropagation()}>
        <div className="create-hub-handle" aria-hidden="true" />

        <div className="create-hub-head">
          <div>
            <strong>Create on HumanChain</strong>
            <span>Every action earns HP and builds your verified reputation.</span>
          </div>
          <button
            className="create-hub-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* HP total strip */}
        <div className="create-hub-hp-strip">
          <Zap size={12} />
          <span>Up to <strong>+{TOTAL_HP} HP</strong> available · HP powers your tier, trust score, and rank</span>
        </div>

        {/* Category tab row */}
        <div className="create-hub-cat-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`create-hub-cat-tab${openCategory === cat.id ? " active" : ""}`}
              style={{ "--cat-accent": cat.accent } as React.CSSProperties}
              onClick={() => toggleCategory(cat.id)}
              type="button"
            >
              <span className="create-hub-cat-dot" />
              {cat.label}
              <span className="create-hub-cat-count">{cat.actions.length}</span>
            </button>
          ))}
        </div>

        <div className="create-hub-cats">
          {CATEGORIES.map((cat) => {
            const isOpen = openCategory === cat.id;
            return (
              <div
                key={cat.id}
                className={`create-hub-cat ${isOpen ? "open" : ""}`}
                style={{ "--cat-accent": cat.accent } as React.CSSProperties}
              >
                {/* Collapsed header (visible only when not open) */}
                {!isOpen && (
                  <button
                    className="create-hub-cat-header"
                    onClick={() => toggleCategory(cat.id)}
                    type="button"
                    aria-expanded={false}
                  >
                    <div className="create-hub-cat-label">
                      <strong>{cat.label}</strong>
                      <span>{cat.description}</span>
                    </div>
                    <ChevronDown size={16} className="create-hub-cat-chevron" />
                  </button>
                )}

                {/* 2-column action grid */}
                {isOpen && (
                  <div className="create-hub-cat-actions create-hub-cat-grid">
                    {cat.actions.map((a) => {
                      const Icon = a.icon;
                      return (
                        <button
                          key={a.id}
                          className="create-hub-item create-hub-item--card"
                          style={{ "--ca-color": a.color } as React.CSSProperties}
                          onClick={() => {
                            onClose();
                            setTab(a.tab);
                            act(a.title, a.detail);
                          }}
                          type="button"
                        >
                          <span className="create-hub-icon">
                            <Icon size={20} />
                          </span>
                          <span className="create-hub-text">
                            <strong>{a.title}</strong>
                            <small>{a.sub}</small>
                          </span>
                          <span className="create-hub-badges">
                            <span className="create-hub-hp-badge">{a.hp}</span>
                            <span className={`create-hub-cost-badge ${a.cost === "Free" ? "free" : "paid"}`}>
                              {a.cost}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
