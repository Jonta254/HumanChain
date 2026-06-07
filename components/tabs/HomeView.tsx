"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Globe2,
  Languages,
  MessageCircleQuestion,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { getWorldMiniAppContext } from "@/lib/worldMiniApp";
import { type AppLanguage } from "@/lib/data/languages";
import {
  formatShortTime,
  getLocalDateKey,
  getPrimaryProfileImage,
  getTrustPassportMetrics,
  getWorldDisplayUsername,
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

const serviceCategories = [
  { id: "legal",         label: "Legal Consulting",      sub: "African & regional law",       icon: Scale,     color: "#2f6fed", bg: "rgba(47,111,237,0.09)"  },
  { id: "translation",  label: "Translation",            sub: "100+ rare languages",           icon: Languages, color: "#246b55", bg: "rgba(36,107,85,0.09)"   },
  { id: "manufacturing",label: "Manufacturing",          sub: "LatAm & Asia niche parts",      icon: Wrench,    color: "#ef7d69", bg: "rgba(239,125,105,0.09)" },
  { id: "consulting",   label: "Consulting",             sub: "Regional expertise",            icon: Briefcase, color: "#b98218", bg: "rgba(185,130,24,0.09)"  },
];

const openOpportunities = [
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
  {
    id: "opp-4",
    title: "Hausa Business Contract Review",
    budget: "WLD 60",
    niche: "Legal",
    region: "Nigeria",
    deadline: "3 days",
    proposals: 1,
    urgent: true,
    color: "#b98218",
    skills: ["Hausa", "Nigerian law", "Contracts"],
  },
];

const topProviders = [
  { handle: "@dr_amara_legal",   name: "Amara D.",     specialty: "West African Commercial Law", region: "Senegal",         rating: 4.9, jobs: 84,  color: "#2f6fed", badge: "Legal"         },
  { handle: "@kwame_translate",  name: "Kwame A.",     specialty: "Medical & Legal Translation", region: "Ghana",           rating: 5.0, jobs: 132, color: "#246b55", badge: "Translation"   },
  { handle: "@lena_mx_parts",   name: "Lena M.",      specialty: "CNC & Custom Fabrication",    region: "Guadalajara MX",  rating: 4.8, jobs: 61,  color: "#ef7d69", badge: "Manufacturing" },
  { handle: "@priya_regional",  name: "Priya N.",     specialty: "South Asian Healthcare",      region: "Bangalore, India",rating: 4.7, jobs: 49,  color: "#b98218", badge: "Consulting"    },
  { handle: "@fatou_law",       name: "Fatou B.",     specialty: "Francophone African Law",     region: "Dakar, Senegal",  rating: 4.8, jobs: 37,  color: "#6657d9", badge: "Legal"         },
];

const successStories = [
  {
    provider: "Kwame Asante",
    initial: "K",
    color: "#246b55",
    job: "Translated 8 medical case files Swahili → Portuguese for a São Paulo hospital",
    earned: "WLD 340",
    region: "Ghana → Brazil",
    time: "6 days",
    quote: "HumanChain connected me with a client 9,000 km away. The escrow meant I started with confidence.",
  },
];

const howItWorks = [
  { step: "1", icon: Search,      title: "Post Your Need",     detail: "Describe the job, budget, region, and timeline in 2 minutes." },
  { step: "2", icon: Sparkles,    title: "AI Matches You",     detail: "Receive verified proposals from specialists in your niche." },
  { step: "3", icon: ShieldCheck, title: "Work & Pay Safely",  detail: "Milestones released from WLD escrow only when you approve." },
];

const activityFeed = [
  "Kwame completed a Medical Translation in Ghana · 2m ago",
  "Amara posted a new Legal Consulting offer · 5m ago",
  "Lena accepted a CNC parts job from Mexico · 8m ago",
  "New job posted: Hausa Contract Review · 12m ago",
  "Priya earned WLD 180 for a Healthcare report · 17m ago",
];

const liveStats = [
  { value: "12k+",  label: "Verified Providers" },
  { value: "68",    label: "Countries" },
  { value: "340+",  label: "Niche Categories" },
  { value: "94%",   label: "Satisfaction" },
];

const trustPillars = [
  { icon: ShieldCheck, title: "Escrow Protected",    detail: "Funds locked until milestones confirmed." },
  { icon: BadgeCheck,  title: "World ID Verified",   detail: "Every provider is a real, unique human." },
  { icon: Star,        title: "Work Samples",        detail: "Portfolios vetted before your first hire." },
  { icon: DollarSign,  title: "Local Currency",      detail: "WLD with mobile money rails globally." },
];

const chainFields = [
  { name: "Builders & Money",  members: "31.2k", mood: "ambition",  detail: "Business ideas, WLD use, startup truth." },
  { name: "Health & Healing",  members: "22.6k", mood: "recovery",  detail: "Daily strength, mental health, caregiving." },
  { name: "Culture Rooms",     members: "44.1k", mood: "belonging", detail: "Language, food, music, migration, identity." },
  { name: "Faith & Prayer",    members: "18.4k", mood: "hope",      detail: "Sharing daily strength across beliefs." },
  { name: "Youth & Future",    members: "39.7k", mood: "future",    detail: "Skills, identity, ambition, and purpose." },
  { name: "Love & Family",     members: "27.8k", mood: "care",      detail: "Family repair, parenting, forgiveness." },
  { name: "Migration & Home",  members: "16.9k", mood: "memory",   detail: "Documents, loneliness, work, belonging." },
  { name: "Parents & Children",members: "20.5k", mood: "care",      detail: "Lessons from parents, teachers, builders." },
];
type ChainField = (typeof chainFields)[number];

const dailyHumanQuestion = "What truth did life teach you this week?";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HomeView({
  act,
  appLanguage,
  dailyAnswered,
  dailyAnsweredAt,
  dailyResponses,
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
  setActiveField,
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
  dailyResponses: DailyResponse[];
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
  setActiveField: Dispatch<SetStateAction<ChainField | null>>;
  setDailyAnswered: Dispatch<SetStateAction<boolean>>;
  setDailyResponses: Dispatch<SetStateAction<DailyResponse[]>>;
  setTab: (tab: Tab) => void;
  streak: number;
  verifiedHuman: VerifiedHuman | null;
  worldContext: ReturnType<typeof getWorldMiniAppContext>;
}) {
  const [dailyDraft, setDailyDraft] = useState("");
  const [aiGuideOpen, setAiGuideOpen] = useState(false);
  const [activityIdx, setActivityIdx] = useState(0);

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
  const communitySpotlight = chainFields[(new Date().getDate() - 1) % chainFields.length];
  const greeting = getGreeting();

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

      {/* ── Topbar ───────────────────────────────────── */}
      <header className="h9-topbar">
        <button className="h9-avatar-btn" onClick={() => setTab("me")} type="button" aria-label="Open passport">
          <span className="h9-avatar" style={{ background: primaryProfileImage ? "transparent" : "linear-gradient(135deg,#2f6fed,#6657d9)" }}>
            {primaryProfileImage ? <img alt="" src={primaryProfileImage} /> : profileInitial}
            {isVerified && <span className="h9-avatar-pip"><BadgeCheck size={10} /></span>}
          </span>
        </button>
        <div className="h9-topbar-text">
          <span className="h9-greeting">{greeting},</span>
          <strong className="h9-handle">{worldHandle}</strong>
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

      {/* ── Live activity ticker ─────────────────────── */}
      <div className="h9-ticker" aria-live="polite">
        <span className="h9-ticker-dot" />
        <div className="h9-ticker-track">
          {activityFeed.map((item, i) => (
            <span
              key={i}
              className={`h9-ticker-item ${i === activityIdx % activityFeed.length ? "active" : ""}`}
              onClick={() => setActivityIdx((c) => (c + 1) % activityFeed.length)}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero — search-first ──────────────────────── */}
      <section className="h9-hero" aria-label="Search">
        <div className="h9-hero-copy">
          <h1>Find the Specialist <br /><em>Nobody Else Has</em></h1>
          <p>Legal help in Africa. Rare language translation. Niche manufacturing. Verified humans, escrow-safe payments.</p>
        </div>
        <button
          className="h9-search-bar"
          onClick={() => { act("Search Specialists", "Browse verified providers by niche, region, language, or expertise."); setTab("market"); }}
          type="button"
          aria-label="Search for specialists"
        >
          <Search size={17} />
          <span>Search specialists, niches, regions…</span>
          <span className="h9-search-badge">AI</span>
        </button>
        <div className="h9-hero-chips">
          {["African Legal", "Medical Translation", "CNC Parts", "Hausa Contracts", "Mining Law"].map((chip) => (
            <button key={chip} className="h9-chip" onClick={() => { act(chip, `Browsing ${chip} specialists worldwide.`); setTab("market"); }} type="button">
              {chip}
            </button>
          ))}
        </div>
      </section>

      {/* ── Live stats ───────────────────────────────── */}
      <div className="h9-stats-row">
        {liveStats.map((s) => (
          <div key={s.label} className="h9-stat">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── How it works ─────────────────────────────── */}
      <section className="h9-section" aria-label="How it works">
        <div className="h9-section-head">
          <strong>How It Works</strong>
          <span className="h9-section-sub">3 simple steps</span>
        </div>
        <div className="h9-how-row">
          {howItWorks.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="h9-how-card">
                <span className="h9-how-num">{step.step}</span>
                <span className="h9-how-icon"><Icon size={20} /></span>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
                {i < howItWorks.length - 1 && <span className="h9-how-arrow" aria-hidden="true">›</span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Open opportunities ───────────────────────── */}
      <section className="h9-section" aria-label="Open opportunities">
        <div className="h9-section-head">
          <strong>Open Right Now</strong>
          <span className="h9-live-pill"><span className="h9-pulse" />Live</span>
        </div>
        <div className="h9-opps">
          {openOpportunities.map((opp) => (
            <button
              key={opp.id}
              className="h9-opp"
              style={{ "--opp-color": opp.color } as React.CSSProperties}
              onClick={() => { act(opp.title, `${opp.niche} in ${opp.region}. Budget: ${opp.budget}. ${opp.proposals} proposals so far.`); setTab("market"); }}
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

      {/* ── Service categories ───────────────────────── */}
      <section className="h9-section" aria-label="Browse by specialty">
        <div className="h9-section-head">
          <strong>Browse by Specialty</strong>
          <button className="h9-text-btn" onClick={() => setTab("market")} type="button">
            All categories <ArrowRight size={13} />
          </button>
        </div>
        <div className="h9-cats">
          {serviceCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className="h9-cat"
                style={{ "--cat-color": cat.color, "--cat-bg": cat.bg } as React.CSSProperties}
                onClick={() => setTab("market")}
                type="button"
              >
                <span className="h9-cat-icon"><Icon size={20} /></span>
                <strong>{cat.label}</strong>
                <small>{cat.sub}</small>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Top providers ────────────────────────────── */}
      <section className="h9-section" aria-label="Top rated specialists">
        <div className="h9-section-head">
          <strong>Top-Rated Specialists</strong>
          <button className="h9-text-btn" onClick={() => setTab("market")} type="button">
            View all <ArrowRight size={13} />
          </button>
        </div>
        <div className="h9-providers-scroll">
          {topProviders.map((p) => (
            <button
              key={p.handle}
              className="h9-provider"
              onClick={() => act(p.name, `${p.specialty} · ${p.region} · ${p.jobs} jobs · ${p.rating}/5`)}
              type="button"
            >
              <div className="h9-provider-av" style={{ background: `linear-gradient(135deg,${p.color}cc,${p.color}88)` }}>
                {p.name.charAt(0)}
                <span className="h9-provider-pip"><BadgeCheck size={9} /></span>
              </div>
              <strong>{p.name}</strong>
              <span className="h9-provider-spec">{p.specialty}</span>
              <div className="h9-provider-row">
                <span className="h9-provider-rating"><Star size={10} fill="currentColor" />{p.rating}</span>
                <span className="h9-provider-jobs">{p.jobs} jobs</span>
              </div>
              <span className="h9-provider-badge" style={{ color: p.color, background: `${p.color}18` }}>{p.badge}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Success story ────────────────────────────── */}
      {successStories.map((story) => (
        <section key={story.provider} className="h9-section" aria-label="Success story">
          <div className="h9-success">
            <div className="h9-success-head">
              <span className="h9-success-kicker"><TrendingUp size={13} />Real Success Story</span>
            </div>
            <div className="h9-success-body">
              <div className="h9-success-av" style={{ background: `linear-gradient(135deg,${story.color}cc,${story.color}88)` }}>
                {story.initial}
              </div>
              <div className="h9-success-info">
                <strong>{story.provider}</strong>
                <p>{story.job}</p>
                <div className="h9-success-chips">
                  <span><Globe2 size={11} />{story.region}</span>
                  <span><Clock size={11} />{story.time}</span>
                  <span><DollarSign size={11} />{story.earned}</span>
                </div>
              </div>
            </div>
            <blockquote className="h9-success-quote">
              &ldquo;{story.quote}&rdquo;
            </blockquote>
            <button
              className="h9-success-cta"
              onClick={() => { act("Become a Provider", "List your specialty, set your rate, and get found by clients worldwide."); setTab("market"); }}
              type="button"
            >
              Earn like this — become a provider <ArrowRight size={14} />
            </button>
          </div>
        </section>
      ))}

      {/* ── Earn as provider ─────────────────────────── */}
      <section className="h9-section" aria-label="Earn as provider">
        <div className="h9-earn">
          <div className="h9-earn-text">
            <span className="h9-earn-kicker">For Specialists</span>
            <strong>Earn in WLD. Work Globally.</strong>
            <p>List your expertise, receive verified job proposals, and get paid through escrow — from any country.</p>
          </div>
          <div className="h9-earn-perks">
            <span><BadgeCheck size={13} />World ID verified</span>
            <span><ShieldCheck size={13} />Escrow protected</span>
            <span><Globe2 size={13} />68 countries</span>
          </div>
          <button
            className="h9-earn-btn"
            onClick={() => { act("Become a Provider", "Set up your specialist profile, add work samples, and start receiving job proposals."); setTab("market"); }}
            type="button"
          >
            <Sparkles size={16} />
            Start as a Provider
          </button>
        </div>
      </section>

      {/* ── Trust pillars ────────────────────────────── */}
      <section className="h9-section" aria-label="Trust and safety">
        <div className="h9-section-head">
          <strong>Built for Trust</strong>
          <span className="h9-section-sub">Every transaction protected</span>
        </div>
        <div className="h9-trust-grid">
          {trustPillars.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="h9-trust">
                <span className="h9-trust-icon"><Icon size={18} /></span>
                <strong>{t.title}</strong>
                <p>{t.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Verified human passport strip ────────────── */}
      <section className="h9-section" aria-label="Your passport">
        <button className="h9-passport" onClick={() => setTab("me")} type="button">
          <div className="h9-passport-left">
            <span className="h9-passport-av" style={{ background: primaryProfileImage ? "transparent" : "linear-gradient(135deg,#2f6fed,#6657d9)" }}>
              {primaryProfileImage ? <img alt="" src={primaryProfileImage} /> : profileInitial}
            </span>
            <div>
              <strong>Human Passport</strong>
              <span>Score {chainScore} · {isVerified ? "World ID Verified ✓" : "Preview Mode"}</span>
            </div>
          </div>
          <div className="h9-passport-right">
            <span className="h9-passport-streak"><Zap size={13} />{streak}d streak</span>
            <ArrowRight size={16} />
          </div>
        </button>
      </section>

      {/* ── Community + Daily question ───────────────── */}
      <section className="h9-section" aria-label="Community and daily question">
        <div className="h9-community">
          <div className="h9-community-head">
            <div>
              <span className="h9-section-sub">Community today</span>
              <strong>{communitySpotlight.name}</strong>
              <p>{communitySpotlight.detail}</p>
            </div>
            <button
              className="h9-community-join"
              onClick={() => { setActiveField(communitySpotlight); setTab("chains"); }}
              type="button"
            >
              Join <ArrowRight size={12} />
            </button>
          </div>
          <div className="h9-community-stats">
            <div><strong>{communitySpotlight.members}</strong><span>Members</span></div>
            <div><strong>{streak}d</strong><span>Your streak</span></div>
            <div><strong>{passportMetrics.helpfulScore}</strong><span>Trust score</span></div>
          </div>
        </div>

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

      {/* ── Bottom quick nav ─────────────────────────── */}
      <section className="h9-quick-nav" aria-label="Quick navigation">
        <button onClick={() => setTab("ask")} type="button">
          <MessageCircleQuestion size={19} />
          <span>{appLanguage.nav.ask}</span>
          {dailyResponses.length > 0 && <b>{dailyResponses.length}</b>}
        </button>
        <button onClick={() => setTab("chains")} type="button">
          <Sparkles size={19} />
          <span>Moments</span>
        </button>
        <button onClick={() => setTab("market")} type="button">
          <Store size={19} />
          <span>Services</span>
        </button>
        <button onClick={() => setTab("stories")} type="button">
          <BookOpen size={19} />
          <span>{appLanguage.nav.stories}</span>
        </button>
      </section>

      {/* ── AI guide FAB ─────────────────────────────── */}
      <button className="h9-fab" onClick={() => setAiGuideOpen(true)} aria-label="Open AI guide" type="button">
        <Sparkles size={20} />
      </button>

      {aiGuideOpen && (
        <AIGuideSheet chainScore={chainScore} onClose={() => setAiGuideOpen(false)} points={points} streak={streak} />
      )}
    </div>
  );
}
