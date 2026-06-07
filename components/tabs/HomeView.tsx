"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Globe2,
  Languages,
  MessageCircleQuestion,
  Scale,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  TrendingUp,
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
import type { ChainLink } from "@/types/chain";
import type { HistoryRecord } from "@/types/reputation";

// ---------------------------------------------------------------------------
// Specialized service categories
// ---------------------------------------------------------------------------

const serviceCategories = [
  {
    id: "legal",
    label: "Legal",
    sub: "African & regional law",
    icon: Scale,
    color: "var(--blue)",
    bg: "rgba(47,111,237,0.08)",
    count: "1.2k providers",
  },
  {
    id: "translation",
    label: "Translation",
    sub: "Rare languages",
    icon: Languages,
    color: "var(--green)",
    bg: "rgba(36,107,85,0.08)",
    count: "3.4k providers",
  },
  {
    id: "manufacturing",
    label: "Manufacturing",
    sub: "LatAm & Asia niche parts",
    icon: Wrench,
    color: "var(--coral)",
    bg: "rgba(239,125,105,0.08)",
    count: "890 providers",
  },
  {
    id: "consulting",
    label: "Consulting",
    sub: "Regional expertise",
    icon: Briefcase,
    color: "var(--gold)",
    bg: "rgba(185,130,24,0.08)",
    count: "2.1k providers",
  },
];

// ---------------------------------------------------------------------------
// Featured open opportunities
// ---------------------------------------------------------------------------

const openOpportunities = [
  {
    id: "opp-1",
    title: "Swahili–Portuguese Medical Document Translation",
    budget: "WLD 85",
    niche: "Healthcare Translation",
    region: "Kenya → Brazil",
    deadline: "5 days",
    proposals: 3,
    urgent: true,
    skills: ["Medical terminology", "Swahili", "Portuguese"],
  },
  {
    id: "opp-2",
    title: "South African Mining Regulation Consultant",
    budget: "WLD 220",
    niche: "Legal Consulting",
    region: "South Africa",
    deadline: "12 days",
    proposals: 7,
    urgent: false,
    skills: ["SA mining law", "MPRDA", "Compliance"],
  },
  {
    id: "opp-3",
    title: "Custom Motorcycle Parts — Colombia Fabricator",
    budget: "WLD 340",
    niche: "Niche Manufacturing",
    region: "Latin America",
    deadline: "21 days",
    proposals: 2,
    urgent: false,
    skills: ["CNC machining", "Steel fabrication", "Custom parts"],
  },
  {
    id: "opp-4",
    title: "Hausa Business Contract Review",
    budget: "WLD 60",
    niche: "Legal Translation",
    region: "Nigeria",
    deadline: "3 days",
    proposals: 1,
    urgent: true,
    skills: ["Hausa", "Nigerian law", "Business contracts"],
  },
];

// ---------------------------------------------------------------------------
// Top-rated providers
// ---------------------------------------------------------------------------

const topProviders = [
  {
    handle: "@dr_amara_legal",
    name: "Amara Diallo",
    specialty: "West African Commercial Law",
    region: "Senegal",
    rating: 4.9,
    jobs: 84,
    badge: "Top Legal",
    initial: "A",
    verified: true,
  },
  {
    handle: "@lena_mx_parts",
    name: "Lena Morales",
    specialty: "CNC & Custom Fabrication",
    region: "Guadalajara, MX",
    rating: 4.8,
    jobs: 61,
    badge: "Top Manufacturing",
    initial: "L",
    verified: true,
  },
  {
    handle: "@kwame_translate",
    name: "Kwame Asante",
    specialty: "Medical & Legal Translation",
    region: "Ghana",
    rating: 5.0,
    jobs: 132,
    badge: "Elite Translator",
    initial: "K",
    verified: true,
  },
  {
    handle: "@priya_regional",
    name: "Priya Nair",
    specialty: "South Asian Healthcare Consulting",
    region: "Bangalore, India",
    rating: 4.7,
    jobs: 49,
    badge: "Top Consultant",
    initial: "P",
    verified: true,
  },
];

// ---------------------------------------------------------------------------
// Regional spotlights
// ---------------------------------------------------------------------------

const regionalSpotlights = [
  {
    region: "Africa",
    focus: "Legal & Healthcare",
    description: "Expert legal consultants and certified medical translators across 54 African nations.",
    active: "4.2k active providers",
    growth: "+38% this month",
    color: "var(--gold)",
  },
  {
    region: "Latin America",
    focus: "Niche Manufacturing",
    description: "Precision fabricators, custom parts suppliers, and industrial specialists from Mexico to Argentina.",
    active: "2.8k active providers",
    growth: "+24% this month",
    color: "var(--coral)",
  },
  {
    region: "Southeast Asia",
    focus: "Language Services",
    description: "Rare dialect translators, regional legal advisors, and market entry specialists across ASEAN.",
    active: "3.6k active providers",
    growth: "+51% this month",
    color: "var(--blue)",
  },
];

// ---------------------------------------------------------------------------
// Trust pillars
// ---------------------------------------------------------------------------

const trustPillars = [
  {
    icon: ShieldCheck,
    title: "Escrow Protected",
    detail: "Funds locked in WLD escrow until milestones confirmed.",
  },
  {
    icon: BadgeCheck,
    title: "World ID Verified",
    detail: "Every provider verified as a unique real human.",
  },
  {
    icon: Star,
    title: "Work Samples",
    detail: "Providers upload proven work before your first hire.",
  },
  {
    icon: Globe2,
    title: "Local Currency",
    detail: "Pay in WLD with local mobile money rails.",
  },
];

// ---------------------------------------------------------------------------
// Platform stats
// ---------------------------------------------------------------------------

const platformStats = [
  { value: "12k+", label: "Verified Providers" },
  { value: "68", label: "Countries" },
  { value: "340+", label: "Niche Categories" },
  { value: "94%", label: "Satisfaction" },
];

// ---------------------------------------------------------------------------
// Daily question
// ---------------------------------------------------------------------------

const dailyHumanQuestion = {
  title: "What truth did life teach you this week?",
  detail: "Every verified human can answer once. Best answers become tomorrow's World Verdict.",
  reward: "+18 HP",
};

// ---------------------------------------------------------------------------
// Chain fields (for community spotlight)
// ---------------------------------------------------------------------------

const chainFields = [
  { name: "Faith & Prayer", members: "18.4k", mood: "hope", detail: "Christians, Hindus, Muslims, Rastafari, and spiritual humans sharing daily strength." },
  { name: "Builders & Money", members: "31.2k", mood: "ambition", detail: "Business ideas, WLD use, startup truth, and small wins from verified humans." },
  { name: "Love & Family", members: "27.8k", mood: "care", detail: "Relationship wisdom, family repair, parenting, loneliness, and forgiveness." },
  { name: "Culture Rooms", members: "44.1k", mood: "belonging", detail: "Language, food, music, migration, identity, and human customs across countries." },
  { name: "Health & Healing", members: "22.6k", mood: "recovery", detail: "Daily strength, mental health, caregiving, body changes, and honest survival notes." },
  { name: "Migration & Home", members: "16.9k", mood: "memory", detail: "Humans between countries sharing documents, loneliness, hope, work, and belonging." },
  { name: "Youth & Future", members: "39.7k", mood: "future", detail: "Young humans asking about skills, identity, ambition, school, pressure, and purpose." },
  { name: "Parents & Children", members: "20.5k", mood: "care", detail: "Real lessons from parents, guardians, children, teachers, and family builders." },
];

type ChainField = (typeof chainFields)[number];

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
  links,
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
  links: ChainLink[];
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
  const homeCopy = appLanguage.home;
  const navCopy = appLanguage.nav;
  const worldHandle = getWorldDisplayUsername(worldContext, verifiedHuman);
  const primaryProfileImage = getPrimaryProfileImage(profileImage, verifiedHuman, worldContext);
  const userPostCount = humanPosts.filter((post) => post.owner).length;
  const profileInitial = worldHandle.replace(/^@/, "").trim().charAt(0).toUpperCase() || "H";
  const passportMetrics = getTrustPassportMetrics({
    completedTrades: marketplaceListings.filter((l) => l.status === "payment-ready").length,
    human: verifiedHuman,
    points,
    posts: userPostCount,
    savedItems,
    streak,
  });
  const chainScore = Math.max(151, Math.round(points / 4) + streak * 7 + userPostCount * 12 + savedItems * 5);
  const isVerified = isVerifiedWorldHuman(verifiedHuman);
  const communitySpotlight = chainFields[(new Date().getDate() - 1) % chainFields.length];

  function submitDailyAnswer() {
    if (!requireVerifiedPublicAction(verifiedHuman, act, "answering today's question")) return;
    if (dailyAnswered) { act("Already answered", "Come back tomorrow for a new global question."); return; }
    setDailyAnswered(true);
    const now = new Date();
    const time = formatShortTime(now);
    setDailyAnsweredAt(time);
    setDailyAnsweredDate(getLocalDateKey(now));
    setDailyResponses((current) => [
      { user: verifiedHuman?.username ?? "@human", text: dailyDraft.trim() || "Life taught me that a real answer can carry another human.", time },
      ...current,
    ]);
    recordHistory({ title: "Daily Human answer", detail: dailyDraft.trim() || "Answered today's HumanChain question.", kind: "post" });
    earnPoints(18, "Your Daily Human answer entered today's global verdict.");
  }

  return (
    <div className="screen home-v8">
      {/* ── Top bar ── */}
      <header className="hv8-topbar">
        <button
          aria-label="Open Human Passport"
          className="hv8-avatar"
          onClick={() => setTab("me")}
          type="button"
        >
          {primaryProfileImage ? <img alt="" src={primaryProfileImage} /> : profileInitial}
          {isVerified && <span className="hv8-avatar-verified" aria-label="Verified"><BadgeCheck size={11} /></span>}
        </button>
        <div className="hv8-topbar-copy">
          <strong>{worldHandle}</strong>
          <span>Specialized Services · Worldwide</span>
        </div>
        <button
          aria-label={notificationReady ? "Notifications" : "Enable notifications"}
          className={`hv8-icon-btn ${notificationUnreadCount > 0 ? "has-dot" : ""}`}
          onClick={notificationReady ? onOpenNotifications : onEnableNotifications}
          type="button"
        >
          <Bell size={19} />
        </button>
        <button
          aria-label="Settings"
          className="hv8-icon-btn"
          onClick={() => setTab("settings")}
          type="button"
        >
          <Settings size={19} />
        </button>
      </header>

      {/* ── Hero ── */}
      <section className="hv8-hero" aria-label="App hero">
        <div className="hv8-hero-inner">
          <span className="hv8-hero-kicker">
            <Globe2 size={13} />
            World's Under-served Niches Marketplace
          </span>
          <h1>Find Specialized <br />Services Globally</h1>
          <p>Legal consulting in Africa. Rare language translators. Niche manufacturing in Latin America. Real experts, verified humans, escrow-protected.</p>
          <div className="hv8-hero-ctas">
            <button
              className="hv8-hero-primary"
              onClick={() => setTab("market")}
              type="button"
            >
              <Sparkles size={16} />
              Find a Specialist
            </button>
            <button
              className="hv8-hero-secondary"
              onClick={() => {
                act("Post a Job", "Describe your need and receive proposals from verified specialists worldwide.");
                setTab("market");
              }}
              type="button"
            >
              Post a Job
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="hv8-stats-strip">
          {platformStats.map((stat) => (
            <div key={stat.label} className="hv8-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Match ── */}
      {isVerified && (
        <section className="hv8-ai-match" aria-label="AI matching">
          <div className="hv8-ai-match-inner">
            <div className="hv8-ai-icon"><Sparkles size={20} /></div>
            <div>
              <strong>AI-Matched for You</strong>
              <p>Based on your profile and region, we found 3 specialists ready to start.</p>
            </div>
          </div>
          <button
            className="hv8-ai-match-btn"
            onClick={() => setAiGuideOpen(true)}
            type="button"
          >
            View Matches
            <ArrowRight size={14} />
          </button>
        </section>
      )}

      {/* ── Service categories ── */}
      <section className="hv8-section" aria-label="Service categories">
        <div className="hv8-section-head">
          <strong>Browse by Specialty</strong>
          <button onClick={() => setTab("market")} type="button" className="hv8-see-all">
            See all <ArrowRight size={13} />
          </button>
        </div>
        <div className="hv8-categories">
          {serviceCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className="hv8-cat-card"
                style={{ "--cat-color": cat.color, "--cat-bg": cat.bg } as React.CSSProperties}
                onClick={() => setTab("market")}
                type="button"
              >
                <span className="hv8-cat-icon"><Icon size={22} /></span>
                <strong>{cat.label}</strong>
                <small>{cat.sub}</small>
                <span className="hv8-cat-count">{cat.count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Open opportunities ── */}
      <section className="hv8-section" aria-label="Open opportunities">
        <div className="hv8-section-head">
          <strong>Open Opportunities</strong>
          <span className="hv8-live-chip"><span className="live-pulse-dot" />Live</span>
        </div>
        <div className="hv8-opportunities">
          {openOpportunities.map((opp) => (
            <button
              key={opp.id}
              className={`hv8-opp-card ${opp.urgent ? "urgent" : ""}`}
              onClick={() => {
                act(opp.title, `${opp.niche} in ${opp.region}. Budget: ${opp.budget}. ${opp.proposals} proposals so far.`);
                setTab("market");
              }}
              type="button"
            >
              <div className="hv8-opp-top">
                <span className="hv8-opp-niche">{opp.niche}</span>
                {opp.urgent && <span className="hv8-opp-urgent">Urgent</span>}
              </div>
              <strong>{opp.title}</strong>
              <div className="hv8-opp-meta">
                <span><Globe2 size={12} />{opp.region}</span>
                <span><TrendingUp size={12} />{opp.proposals} proposals</span>
                <span>{opp.deadline} left</span>
              </div>
              <div className="hv8-opp-skills">
                {opp.skills.map((s) => <i key={s}>{s}</i>)}
              </div>
              <div className="hv8-opp-footer">
                <strong>{opp.budget}</strong>
                <span>Apply now <ArrowRight size={12} /></span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Top providers ── */}
      <section className="hv8-section" aria-label="Top rated providers">
        <div className="hv8-section-head">
          <strong>Top-Rated Specialists</strong>
          <button onClick={() => setTab("market")} type="button" className="hv8-see-all">
            View all <ArrowRight size={13} />
          </button>
        </div>
        <div className="hv8-providers">
          {topProviders.map((provider) => (
            <button
              key={provider.handle}
              className="hv8-provider-card"
              onClick={() => {
                act(provider.name, `${provider.specialty} specialist in ${provider.region}. ${provider.jobs} completed jobs. Rating: ${provider.rating}/5.`);
              }}
              type="button"
            >
              <div className="hv8-provider-avatar">
                {provider.initial}
                {provider.verified && <span className="hv8-verified-pip"><BadgeCheck size={10} /></span>}
              </div>
              <strong>{provider.name}</strong>
              <span className="hv8-provider-specialty">{provider.specialty}</span>
              <div className="hv8-provider-meta">
                <span><Star size={11} fill="currentColor" />{provider.rating}</span>
                <span>{provider.jobs} jobs</span>
              </div>
              <span className="hv8-provider-badge">{provider.badge}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Regional spotlights ── */}
      <section className="hv8-section" aria-label="Regional spotlights">
        <div className="hv8-section-head">
          <strong>Regional Spotlights</strong>
        </div>
        <div className="hv8-regions">
          {regionalSpotlights.map((r) => (
            <button
              key={r.region}
              className="hv8-region-card"
              style={{ "--region-color": r.color } as React.CSSProperties}
              onClick={() => {
                act(r.region, r.description);
                setTab("market");
              }}
              type="button"
            >
              <span className="hv8-region-label">{r.region}</span>
              <strong>{r.focus}</strong>
              <p>{r.description}</p>
              <div className="hv8-region-meta">
                <span>{r.active}</span>
                <span className="hv8-region-growth">{r.growth}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Trust pillars ── */}
      <section className="hv8-section hv8-trust-section" aria-label="Trust and safety">
        <div className="hv8-section-head">
          <strong>Built for Trust</strong>
          <span className="hv8-trust-kicker">Every transaction protected</span>
        </div>
        <div className="hv8-trust-grid">
          {trustPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="hv8-trust-card">
                <span className="hv8-trust-icon"><Icon size={20} /></span>
                <strong>{pillar.title}</strong>
                <p>{pillar.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Quick nav ── */}
      <section className="hv8-quick-nav" aria-label="Quick navigation">
        <button onClick={() => setTab("ask")} type="button">
          <MessageCircleQuestion size={20} />
          <span>{navCopy.ask}</span>
          {dailyResponses.length > 0 && <b>{dailyResponses.length}</b>}
        </button>
        <button onClick={() => setTab("chains")} type="button">
          <Sparkles size={20} />
          <span>{navCopy.chains}</span>
        </button>
        <button onClick={() => setTab("market")} type="button">
          <Store size={20} />
          <span>Services</span>
        </button>
        <button onClick={() => setTab("stories")} type="button">
          <BookOpen size={20} />
          <span>{navCopy.stories}</span>
        </button>
      </section>

      {/* ── Community spotlight ── */}
      <section className="hv8-community" aria-label="Community spotlight">
        <div className="hv8-community-inner">
          <span className="hv8-section-kicker">Community today</span>
          <strong>{communitySpotlight.name}</strong>
          <p>{communitySpotlight.detail}</p>
          <button
            onClick={() => { setActiveField(communitySpotlight); setTab("chains"); }}
            type="button"
          >
            Open community <ArrowRight size={13} />
          </button>
        </div>
        <div className="hv8-community-stats">
          <div><strong>{communitySpotlight.members}</strong><span>Members</span></div>
          <div><strong>{streak}d</strong><span>Your streak</span></div>
          <div><strong>{passportMetrics.helpfulScore}</strong><span>Trust score</span></div>
        </div>
      </section>

      {/* ── Daily question ── */}
      <section className="hv8-daily" aria-label="Daily question">
        <div className="hv8-daily-head">
          <strong>{homeCopy.dailyTitle}</strong>
          <span className="hv8-daily-reward"><Zap size={13} />+18 HP</span>
        </div>
        <p className="hv8-daily-q">{dailyHumanQuestion.title}</p>
        {dailyAnswered ? (
          <div className="hv8-daily-done">
            <CheckCircle2 size={16} />
            <span>Answered {dailyAnsweredAt ?? "today"} — {homeCopy.answeredToday}.</span>
          </div>
        ) : (
          <>
            <textarea
              className="hv8-daily-textarea"
              onChange={(e) => setDailyDraft(e.target.value)}
              placeholder={homeCopy.dailyPlaceholder}
              rows={3}
              value={dailyDraft}
            />
            <button
              className="hv8-daily-submit"
              disabled={dailyAnswered}
              onClick={submitDailyAnswer}
              type="button"
            >
              {homeCopy.answerDaily}
            </button>
          </>
        )}
      </section>

      {/* ── Passport score strip ── */}
      <section className="hv8-passport-strip" aria-label="Your passport">
        <button
          className="hv8-passport-btn"
          onClick={() => setTab("me")}
          type="button"
        >
          <div className="hv8-passport-avatar">
            {primaryProfileImage ? <img alt="" src={primaryProfileImage} /> : profileInitial}
          </div>
          <div>
            <strong>Human Passport</strong>
            <span>Score {chainScore} · {isVerified ? "World ID Verified" : "Preview"}</span>
          </div>
          <ArrowRight size={16} />
        </button>
      </section>

      {/* ── AI guide button ── */}
      <button
        className="hv8-fab"
        onClick={() => setAiGuideOpen(true)}
        aria-label="Open AI guide"
        type="button"
      >
        <Sparkles size={20} />
      </button>

      {aiGuideOpen && (
        <AIGuideSheet
          chainScore={chainScore}
          onClose={() => setAiGuideOpen(false)}
          points={points}
          streak={streak}
        />
      )}
    </div>
  );
}
