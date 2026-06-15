"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  ChevronDown,
  MessageCircleQuestion,
  Mic,
  Sparkles,
  Store,
  Trophy,
  Users,
  X,
} from "lucide-react";
import type { Tab } from "@/types/ui";

type CreateAction = {
  id: string;
  icon: typeof Sparkles;
  color: string;
  title: string;
  sub: string;
  tab: Tab;
  detail: string;
};

type Category = {
  id: string;
  label: string;
  description: string;
  actions: CreateAction[];
};

const CATEGORIES: Category[] = [
  {
    id: "share",
    label: "Share",
    description: "Post moments, proof of work, and voice answers",
    actions: [
      { id: "moment",  icon: Sparkles,  color: "#137a57", title: "Post Moment",         sub: "Real photo or reflection", tab: "chains", detail: "Post a real photo or reflection. Verified humans only — every moment builds trust." },
      { id: "proof",   icon: BadgeCheck, color: "#0f9d6c", title: "Proof of Work",       sub: "Show what you delivered",  tab: "chains", detail: "Post proof of completed work to grow your reputation. Real deliverables earn positive reputation signals." },
      { id: "voice",   icon: Mic,        color: "#15938a", title: "Voice Answer",         sub: "Reply with your real voice", tab: "ask",  detail: "Record a voice answer where supported — a human voice carries trust that text cannot." },
    ],
  },
  {
    id: "connect",
    label: "Connect",
    description: "Ask questions and engage your community",
    actions: [
      { id: "ask",       icon: MessageCircleQuestion, color: "#2f6fed", title: "Ask Question",     sub: "Get verified human answers", tab: "ask",    detail: "Ask one honest question. Verified humans answer — open a paid country route only when you need it." },
      { id: "community", icon: Users,                 color: "#6657d9", title: "Community Update", sub: "Post to a community room",   tab: "chains", detail: "Share an update with a HumanChain community. Contributions add to your community standing." },
      { id: "challenge", icon: Trophy,                color: "#d8a93c", title: "Start Challenge",  sub: "Rally your community",       tab: "chains", detail: "Start a community challenge. Completing verified challenges earns reputation and badges." },
    ],
  },
  {
    id: "build",
    label: "Build",
    description: "List opportunities and marketplace items",
    actions: [
      { id: "opportunity", icon: Briefcase, color: "#b88a1f", title: "List Opportunity",    sub: "Hire a verified specialist", tab: "market", detail: "Post a job or opportunity. Verified specialists apply, and payment is held safely in escrow." },
      { id: "listing",     icon: Store,     color: "#ef7d69", title: "Marketplace Listing", sub: "Sell goods or services",    tab: "market", detail: "Add a marketplace listing with real photos and a clear price. Trades settle in WLD with escrow protection." },
    ],
  },
];

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
    <div className="create-hub-backdrop" role="dialog" aria-modal="true" aria-label="Create" onClick={onClose}>
      <div className="create-hub" onClick={(e) => e.stopPropagation()}>
        <div className="create-hub-handle" aria-hidden="true" />
        <div className="create-hub-head">
          <div>
            <strong>Create on HumanChain</strong>
            <span>Every contribution builds your verified reputation.</span>
          </div>
          <button className="create-hub-close" onClick={onClose} aria-label="Close" type="button">
            <X size={18} />
          </button>
        </div>

        <div className="create-hub-cats">
          {CATEGORIES.map((cat) => {
            const isOpen = openCategory === cat.id;
            return (
              <div key={cat.id} className={`create-hub-cat ${isOpen ? "open" : ""}`}>
                <button
                  className="create-hub-cat-header"
                  onClick={() => toggleCategory(cat.id)}
                  type="button"
                  aria-expanded={isOpen}
                >
                  <div className="create-hub-cat-label">
                    <strong>{cat.label}</strong>
                    <span>{cat.description}</span>
                  </div>
                  <ChevronDown size={16} className="create-hub-cat-chevron" />
                </button>

                {isOpen && (
                  <div className="create-hub-cat-actions">
                    {cat.actions.map((a) => {
                      const Icon = a.icon;
                      return (
                        <button
                          key={a.id}
                          className="create-hub-item"
                          style={{ "--ca-color": a.color } as React.CSSProperties}
                          onClick={() => { onClose(); setTab(a.tab); act(a.title, a.detail); }}
                          type="button"
                        >
                          <span className="create-hub-icon"><Icon size={18} /></span>
                          <span className="create-hub-text">
                            <strong>{a.title}</strong>
                            <small>{a.sub}</small>
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
