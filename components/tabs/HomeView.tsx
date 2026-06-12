"use client";

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  Globe2,
  MessageCircleQuestion,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Users,
  Zap,
} from "lucide-react";
import { getWorldMiniAppContext } from "@/lib/worldMiniApp";
import { type AppLanguage } from "@/lib/data/languages";
import { setMarketIntent } from "@/lib/humanchain/marketIntent";
import {
  formatShortTime,
  getLocalDateKey,
  getPrimaryProfileImage,
  getTrustPassportMetrics,
  getWorldDisplayUsername,
  handleImageFallback,
  isVerifiedWorldHuman,
  requireVerifiedPublicAction,
} from "@/lib/humanchain/utils";
import { AIGuideSheet } from "@/components/layout/AIGuideSheet";
import type { Tab, EarnPoints } from "@/types/ui";
import type { VerifiedHuman } from "@/types/user";
import type { HumanPost, DailyResponse } from "@/types/content";
import type { MarketplaceListing } from "@/types/market";
import type { HistoryRecord } from "@/types/reputation";

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const heroTrustChips = [
  "World ID verified",
  "Escrow protected",
  "WLD payments",
  "Real humans only",
];

const actionCards = [
  {
    id: "ask",
    icon: MessageCircleQuestion,
    title: "Ask humans",
    detail: "Post one honest question. Verified people answer.",
    color: "#2f6fed",
    intent: null,
    tab: "ask" as Tab,
  },
  {
    id: "hire",
    icon: Briefcase,
    title: "Hire specialist",
    detail: "Legal, translation, manufacturing, consulting.",
    color: "#246b55",
    intent: "services" as const,
    tab: "market" as Tab,
  },
  {
    id: "sell",
    icon: Store,
    title: "Sell item",
    detail: "List locally and get paid in WLD.",
    color: "#b98218",
    intent: "sell" as const,
    tab: "market" as Tab,
  },
  {
    id: "share",
    icon: Sparkles,
    title: "Share moment",
    detail: "Photo-first proof-of-life from your day.",
    color: "#6657d9",
    intent: null,
    tab: "chains" as Tab,
  },
];

const featuredJobs = [
  {
    id: "opp-1",
    title: "Swahili–Portuguese Medical Document Translation",
    budget: "WLD 85",
    niche: "Healthcare",
    region: "Kenya → Brazil",
    deadline: "5 days",
    proposals: 3,
    urgent: true,
    color: "#2f6fed",
    skills: ["Medical terms", "Swahili", "Portuguese"],
  },
  {
    id: "opp-2",
    title: "South African Mining Regulation Consultant",
    budget: "WLD 220",
    niche: "Legal",
    region: "South Africa",
    deadline: "12 days",
    proposals: 7,
    urgent: false,
    color: "#246b55",
    skills: ["SA mining law", "MPRDA", "Compliance"],
  },
  {
    id: "opp-3",
    title: "Custom Motorcycle Parts — Colombia Fabricator",
    budget: "WLD 340",
    niche: "Manufacturing",
    region: "Latin America",
    deadline: "21 days",
    proposals: 2,
    urgent: false,
    color: "#ef7d69",
    skills: ["CNC machining", "Steel fab", "Custom parts"],
  },
];

const marketPreviewItems = [
  {
    photo: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&h=200&fit=crop",
    title: "Samsung Galaxy A54 5G",
    price: "WLD 45",
    area: "1.2 km · Nairobi West",
    cond: "Used · Good",
    bid: "2 bids",
  },
  {
    photo: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=200&fit=crop",
    title: "Handmade Ankara Tote",
    price: "WLD 8",
    area: "0.4 km · CBD Market",
    cond: "Brand New",
    bid: "1 bid",
  },
  {
    photo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=200&fit=crop",
    title: "GlowBarber Weekend Slot",
    price: "WLD 5",
    area: "2.1 km · Kilimani",
    cond: "Book slot",
    bid: null,
  },
];

const liveStats = [
  { target: 12, suffix: "k+", label: "Verified providers" },
  { target: 68, suffix: "", label: "Countries" },
  { target: 340, suffix: "+", label: "Niches" },
  { target: 94, suffix: "%", label: "Satisfaction" },
];

const trustCards = [
  {
    icon: BadgeCheck,
    title: "Verified humans",
    detail: "Every account is one real person, checked by World ID.",
  },
  {
    icon: ShieldCheck,
    title: "Escrow milestones",
    detail: "WLD is released only when you approve each step.",
  },
  {
    icon: Star,
    title: "Work proof",
    detail: "Ratings, reviews, and public work history on every profile.",
  },
];

const dailyHumanQuestion = "What truth did life teach you this week?";

// Rotating one-line network signals shown in the live pulse strip.
const networkPulse = [
  { value: "2,418", label: "verified humans active now" },
  { value: "127", label: "jobs open across 68 countries" },
  { value: "1,940 WLD", label: "moved through escrow this week" },
  { value: "312", label: "questions answered in the last hour" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// Deterministic display code for the digital Human Passport card.
function getPassportCode(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const hex = h.toString(16).toUpperCase().padStart(8, "0");
  return `HC-${hex.slice(0, 4)}-${hex.slice(4)}`;
}

// Count a number up from 0 once on mount (digital odometer feel).
function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      if (reduceMotion) {
        setValue(target);
        return;
      }
      const p = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function CountStat({ label, suffix, target }: { label: string; suffix: string; target: number }) {
  const value = useCountUp(target);
  return (
    <div className="h9-stat">
      <strong>{value}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HomeView({
  act,
  appLanguage,
  dailyAnswered,
  dailyAnsweredAt,
  earnPoints,
  humanPosts,
  marketplaceListings,
  notificationReady,
  notificationUnreadCount,
  onEnableNotifications,
  onOpenNotifications,
  points,
  profileImage,
  recordHistory,
  savedItems,
  setDailyAnsweredAt,
  setDailyAnsweredDate,
  setDailyAnswered,
  setDailyResponses,
  setTab,
  streak,
  verifiedHuman,
  worldContext,
}: {
  act: (title: string, detail: string) => void;
  appLanguage: AppLanguage;
  dailyAnswered: boolean;
  dailyAnsweredAt: string | null;
  earnPoints: EarnPoints;
  humanPosts: HumanPost[];
  marketplaceListings: MarketplaceListing[];
  notificationReady: boolean;
  notificationUnreadCount: number;
  onEnableNotifications: () => void | Promise<void>;
  onOpenNotifications: () => void;
  points: number;
  profileImage: string | null;
  recordHistory: (record: Omit<HistoryRecord, "id" | "time">) => void;
  savedItems: number;
  setDailyAnsweredAt: Dispatch<SetStateAction<string | null>>;
  setDailyAnsweredDate: Dispatch<SetStateAction<string | null>>;
  setDailyAnswered: Dispatch<SetStateAction<boolean>>;
  setDailyResponses: Dispatch<SetStateAction<DailyResponse[]>>;
  setTab: (tab: Tab) => void;
  streak: number;
  verifiedHuman: VerifiedHuman | null;
  worldContext: ReturnType<typeof getWorldMiniAppContext>;
}) {
  const [dailyDraft, setDailyDraft] = useState("");
  const [aiGuideOpen, setAiGuideOpen] = useState(false);
  const [pulseIdx, setPulseIdx] = useState(0);

  // Rotate the live network pulse every few seconds.
  useEffect(() => {
    const t = window.setInterval(() => setPulseIdx((i) => (i + 1) % networkPulse.length), 4000);
    return () => window.clearInterval(t);
  }, []);

  const homeCopy = appLanguage.home;
  const worldHandle = getWorldDisplayUsername(worldContext, verifiedHuman);
  const primaryProfileImage = getPrimaryProfileImage(profileImage, verifiedHuman, worldContext);
  const userPostCount = humanPosts.filter((p) => p.owner).length;
  const profileInitial = worldHandle.replace(/^@/, "").trim().charAt(0).toUpperCase() || "H";
  const isVerified = isVerifiedWorldHuman(verifiedHuman);
  const passportMetrics = getTrustPassportMetrics({
    completedTrades: marketplaceListings.filter((l) => l.status === "payment-ready").length,
    human: verifiedHuman, points, posts: userPostCount, savedItems, streak,
  });
  const chainScore = Math.max(151, Math.round(points / 4) + streak * 7 + userPostCount * 12 + savedItems * 5);
  const greeting = getGreeting();

  function openServices(title: string, detail: string) {
    setMarketIntent("services");
    act(title, detail);
    setTab("market");
  }

  function submitDailyAnswer() {
    if (!requireVerifiedPublicAction(verifiedHuman, act, "answering today's question")) return;
    if (dailyAnswered) { act("Already answered", "Come back tomorrow for a new global question."); return; }
    setDailyAnswered(true);
    const now = new Date();
    const time = formatShortTime(now);
    setDailyAnsweredAt(time);
    setDailyAnsweredDate(getLocalDateKey(now));
    setDailyResponses((cur) => [
      { user: verifiedHuman?.username ?? "@human", text: dailyDraft.trim() || "Life taught me that a real answer can carry another human.", time },
      ...cur,
    ]);
    recordHistory({ title: "Daily Human answer", detail: dailyDraft.trim() || "Answered today's HumanChain question.", kind: "post" });
    earnPoints(18, "Your Daily Human answer entered today's global verdict.");
  }

  return (
    <div className="screen home-v9">

      {/* ── A. Compact welcome header ─────────────────── */}
      <header className="h9-topbar">
        <button className="h9-avatar-btn" onClick={() => setTab("me")} type="button" aria-label="Open Human Passport">
          <span className="h9-avatar" style={{ background: primaryProfileImage ? "transparent" : "linear-gradient(135deg,#2f6fed,#6657d9)" }}>
            {primaryProfileImage ? <img alt="" src={primaryProfileImage} onError={handleImageFallback} /> : profileInitial}
            {isVerified && <span className="h9-avatar-pip"><BadgeCheck size={10} /></span>}
          </span>
        </button>
        <div className="h9-topbar-text">
          <span className="h9-greeting">{greeting},</span>
          <span className="hv-handle-row">
            <strong className="h9-handle">{worldHandle}</strong>
            <span className={`hv-verify-chip ${isVerified ? "" : "preview"}`}>
              <BadgeCheck size={10} />
              {isVerified ? "World ID verified" : "Preview mode"}
            </span>
          </span>
        </div>
        <div className="h9-topbar-actions">
          <button
            className={`h9-icon-btn ${notificationUnreadCount > 0 ? "has-dot" : ""}`}
            onClick={notificationReady ? onOpenNotifications : onEnableNotifications}
            aria-label="Notifications"
            type="button"
          >
            <Bell size={18} />
          </button>
          <button className="h9-icon-btn" onClick={() => setTab("settings")} aria-label="Settings" type="button">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* ── Live network pulse ────────────────────────── */}
      <button
        className="hv-pulse"
        onClick={() => setPulseIdx((i) => (i + 1) % networkPulse.length)}
        type="button"
        aria-label="Network pulse — tap for next signal"
      >
        <span className="hv-pulse-dot" aria-hidden="true" />
        <span className="hv-pulse-live">LIVE</span>
        <span className="hv-pulse-text" aria-live="polite">
          <strong key={pulseIdx} className="hv-pulse-value">{networkPulse[pulseIdx].value}</strong>
          <span className="hv-pulse-label">{networkPulse[pulseIdx].label}</span>
        </span>
      </button>

      {/* ── B. Hero ───────────────────────────────────── */}
      <section className="hv-hero" aria-label="HumanChain">
        <span className="hv-hero-kicker">Real humans. Real work. Protected payments.</span>
        <h1>Find trusted humans <em>for real work</em></h1>
        <p>Ask verified people, hire rare specialists, trade locally, and get paid safely in WLD.</p>
        <div className="hv-hero-ctas">
          <button className="hv-cta-primary" onClick={() => setTab("ask")} type="button">
            <MessageCircleQuestion size={16} />
            Ask the World
          </button>
          <button
            className="hv-cta-secondary"
            onClick={() => openServices("Find Specialists", "Browse verified providers by niche, region, language, or expertise.")}
            type="button"
          >
            Find Specialists
          </button>
        </div>
        <div className="hv-trust-chips">
          {heroTrustChips.map((chip) => (
            <span key={chip} className="hv-trust-chip">
              <CheckCircle2 size={11} />
              {chip}
            </span>
          ))}
        </div>
      </section>

      {/* ── C. Action grid ────────────────────────────── */}
      <section className="h9-section" aria-label="Quick actions">
        <div className="hv-actions">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                className="hv-action"
                style={{ "--hv-color": card.color } as React.CSSProperties}
                onClick={() => {
                  if (card.intent) setMarketIntent(card.intent);
                  setTab(card.tab);
                }}
                type="button"
              >
                <span className="hv-action-icon"><Icon size={19} /></span>
                <strong>{card.title}</strong>
                <p>{card.detail}</p>
                <span className="hv-action-arrow"><ArrowRight size={14} /></span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Digital Human Passport card ───────────────── */}
      <section className="h9-section" aria-label="Your Human Passport">
        <button className="hv-id-card" onClick={() => setTab("me")} type="button">
          <span className="hv-id-scan" aria-hidden="true" />
          <div className="hv-id-top">
            <span className="hv-id-brand">⛓ HUMAN PASSPORT</span>
            <span className={`hv-id-seal ${isVerified ? "" : "preview"}`}>
              <BadgeCheck size={11} />
              {isVerified ? "WORLD ID" : "PREVIEW"}
            </span>
          </div>
          <div className="hv-id-main">
            <span className="hv-id-avatar" style={{ background: primaryProfileImage ? "transparent" : "linear-gradient(135deg,#2f6fed,#6657d9)" }}>
              {primaryProfileImage ? <img alt="" src={primaryProfileImage} onError={handleImageFallback} /> : profileInitial}
            </span>
            <div className="hv-id-holder">
              <strong>{worldHandle}</strong>
              <span className="hv-id-code">{getPassportCode(worldHandle + (verifiedHuman?.wallet ?? ""))}</span>
            </div>
            <ArrowRight size={16} className="hv-id-arrow" />
          </div>
          <div className="hv-id-readout">
            <div><span>SCORE</span><strong>{passportMetrics.helpfulScore}</strong></div>
            <div><span>STREAK</span><strong>{streak}d</strong></div>
            <div><span>HP</span><strong>{points}</strong></div>
            <div><span>CHAIN</span><strong>{chainScore}</strong></div>
          </div>
        </button>
      </section>

      {/* ── D. Live proof strip ───────────────────────── */}
      <div className="h9-stats-row" aria-label="Network proof">
        {liveStats.map((s) => (
          <CountStat key={s.label} label={s.label} suffix={s.suffix} target={s.target} />
        ))}
      </div>

      {/* ── E. Featured opportunities ─────────────────── */}
      <section className="h9-section" aria-label="Featured opportunities">
        <div className="h9-section-head">
          <strong><i className="hv-idx">01</i>Featured Opportunities</strong>
          <button
            className="h9-text-btn"
            onClick={() => openServices("All jobs", "Browse every open job and opportunity in Services.")}
            type="button"
          >
            View all jobs <ArrowRight size={13} />
          </button>
        </div>
        <div className="h9-opps">
          {featuredJobs.map((opp) => (
            <button
              key={opp.id}
              className="h9-opp"
              style={{ "--opp-color": opp.color } as React.CSSProperties}
              onClick={() => openServices(opp.title, `${opp.niche} in ${opp.region}. Budget: ${opp.budget}. ${opp.proposals} proposals so far.`)}
              type="button"
            >
              <div className="h9-opp-top">
                <span className="h9-opp-tag" style={{ color: opp.color, background: `${opp.color}18` }}>{opp.niche}</span>
                {opp.urgent && <span className="h9-opp-urgent">Urgent</span>}
                <span className="h9-opp-deadline"><Clock size={11} />{opp.deadline}</span>
              </div>
              <strong className="h9-opp-title">{opp.title}</strong>
              <div className="h9-opp-meta">
                <span><Globe2 size={12} />{opp.region}</span>
                <span><Users size={12} />{opp.proposals} proposals</span>
              </div>
              <div className="h9-opp-skills">
                {opp.skills.map((s) => <i key={s}>{s}</i>)}
              </div>
              <div className="h9-opp-footer">
                <strong>{opp.budget}</strong>
                <span className="h9-opp-apply">Apply <ArrowRight size={12} /></span>
              </div>
              <span className="h9-opp-bar" style={{ background: opp.color }} />
            </button>
          ))}
        </div>
      </section>

      {/* ── F. Nearby market preview ──────────────────── */}
      <section className="h9-section" aria-label="Nearby market">
        <div className="h9-section-head">
          <strong><i className="hv-idx">02</i>Nearby Market</strong>
          <button className="h9-text-btn" onClick={() => setTab("market")} type="button">
            Browse market <ArrowRight size={13} />
          </button>
        </div>
        <div className="h9-providers-scroll">
          {marketPreviewItems.map((item) => (
            <button
              key={item.title}
              className="h9-mkt-preview-card"
              onClick={() => setTab("market")}
              type="button"
            >
              <div className="h9-mkt-preview-img">
                <img alt={item.title} src={item.photo} loading="lazy" onError={handleImageFallback} />
                {item.bid && <span className="h9-mkt-bid-tag">{item.bid}</span>}
              </div>
              <strong>{item.title}</strong>
              <span className="h9-mkt-price">{item.price}</span>
              <span className="h9-mkt-area">{item.area}</span>
              <span className="h9-mkt-cond">{item.cond}</span>
            </button>
          ))}
        </div>
        <button
          className="h9-mkt-sell-row"
          onClick={() => { setMarketIntent("sell"); setTab("market"); }}
          type="button"
        >
          <Store size={14} />
          <span>Have something to sell? <strong>List free →</strong></span>
        </button>
      </section>

      {/* ── G. Trust section ──────────────────────────── */}
      <section className="h9-section" aria-label="Trust and safety">
        <div className="h9-section-head">
          <strong><i className="hv-idx">03</i>Built for Trust</strong>
        </div>
        <p className="hv-trust-lead">
          Protected by World ID, escrow milestones, verified profiles, and public work history.
        </p>
        <div className="hv-trust-grid">
          {trustCards.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="hv-trust-card">
                <span className="hv-trust-icon"><Icon size={17} /></span>
                <strong>{t.title}</strong>
                <p>{t.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── H. Provider CTA ───────────────────────────── */}
      <section className="h9-section" aria-label="Earn as provider">
        <div className="h9-earn">
          <div className="h9-earn-text">
            <span className="h9-earn-kicker">For Specialists</span>
            <strong>Earn in WLD. Work globally.</strong>
            <p>List your expertise, receive verified job proposals, and get paid through escrow — from any country.</p>
          </div>
          <div className="h9-earn-perks">
            <span><BadgeCheck size={13} />World ID verified</span>
            <span><ShieldCheck size={13} />Escrow protected</span>
            <span><Globe2 size={13} />68 countries</span>
          </div>
          <button
            className="h9-earn-btn"
            onClick={() => openServices("Start as Provider", "Set up your specialist profile, add work samples, and start receiving job proposals.")}
            type="button"
          >
            <Sparkles size={16} />
            Start as Provider
          </button>
        </div>
      </section>

      {/* ── Daily question ────────────────────────────── */}
      <section className="h9-section hv-last-section" aria-label="Daily question">
        <div className="h9-daily">
          <div className="h9-daily-head">
            <strong>{homeCopy.dailyTitle}</strong>
            <span className="h9-daily-reward"><Zap size={12} />+18 HP</span>
          </div>
          <p className="h9-daily-q">{dailyHumanQuestion}</p>
          {dailyAnswered ? (
            <div className="h9-daily-done">
              <CheckCircle2 size={15} />
              <span>Answered {dailyAnsweredAt ?? "today"} — {homeCopy.answeredToday}</span>
            </div>
          ) : (
            <>
              <textarea
                className="h9-daily-area"
                onChange={(e) => setDailyDraft(e.target.value)}
                placeholder={homeCopy.dailyPlaceholder}
                rows={3}
                value={dailyDraft}
              />
              <button className="h9-daily-submit" disabled={dailyAnswered} onClick={submitDailyAnswer} type="button">
                {homeCopy.answerDaily}
              </button>
            </>
          )}
        </div>
      </section>

      {/* ── AI guide FAB ──────────────────────────────── */}
      <button className="h9-fab" onClick={() => setAiGuideOpen(true)} aria-label="Open AI guide" type="button">
        <Sparkles size={20} />
      </button>

      {aiGuideOpen && (
        <AIGuideSheet chainScore={chainScore} onClose={() => setAiGuideOpen(false)} points={points} streak={streak} />
      )}
    </div>
  );
}
