"use client";

import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  Briefcase,
  Camera,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  ExternalLink,
  Globe2,
  Hexagon,
  Mail,
  MessageCircleQuestion,
  Send,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button, Haptic, useHaptics } from "@worldcoin/mini-apps-ui-kit-react";
import { getWorldMiniAppContext } from "@/lib/worldMiniApp";
import { getDailyQuestion } from "@/lib/data/dailyQuestions";
import { type AppLanguage } from "@/lib/data/languages";
import {
  formatShortTime,
  getChainScore,
  getLocalDateKey,
  getPrimaryProfileImage,
  getReputationTier,
  getWorldDisplayUsername,
  isVerifiedWorldHuman,
  requireVerifiedPublicAction,
} from "@/lib/humanchain/utils";
import type { Tab, EarnPoints } from "@/types/ui";
import type { VerifiedHuman } from "@/types/user";
import type { HumanPost, DailyResponse } from "@/types/content";
import type { MarketplaceListing } from "@/types/market";
import type { HistoryRecord } from "@/types/reputation";

// Deterministic display ID derived from the handle
function getHumanChainId(handle: string) {
  const seed = (handle || "human").replace(/[^a-z0-9]/gi, "").toUpperCase() || "HUMAN";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const code = h.toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  return `HC-${code.slice(0, 3)}-${code.slice(3, 6)}`;
}

// Strongest earned badge from real local signals
function getStrongestBadge(args: { isVerified: boolean; streak: number; posts: number; trades: number }) {
  if (args.trades >= 1) return { label: "Trusted Trader", icon: Briefcase };
  if (args.streak >= 7) return { label: "Streak Builder", icon: Flame };
  if (args.posts >= 3)  return { label: "Contributor",    icon: Sparkles };
  if (args.isVerified)  return { label: "Verified Human", icon: BadgeCheck };
  return null;
}

const openOpportunities = [
  { id: "opp-1", title: "Swahili–Portuguese Medical Translation", budget: "WLD 85",  niche: "Healthcare",    region: "Kenya → Brazil",         deadline: "5 days",  proposals: 3,  urgent: true,  color: "#2f6fed", skills: ["Medical terms", "Swahili"] },
  { id: "opp-2", title: "South African Mining Regulation Consultant", budget: "WLD 220", niche: "Legal",    region: "South Africa",            deadline: "12 days", proposals: 7,  urgent: false, color: "#137a57", skills: ["SA mining law", "MPRDA"] },
  { id: "opp-3", title: "Filipino–Arabic Early Childhood Curriculum", budget: "WLD 140", niche: "Education", region: "Philippines → UAE",       deadline: "3 days",  proposals: 2,  urgent: true,  color: "#7c3aed", skills: ["Arabic", "Child education"] },
  { id: "opp-4", title: "UX Research for West African Fintech App",   budget: "WLD 175", niche: "Tech",      region: "India × Ghana",          deadline: "9 days",  proposals: 11, urgent: false, color: "#0f766e", skills: ["UX research", "Fintech"] },
  { id: "opp-5", title: "Brazilian Street Food Business Strategy",    budget: "WLD 95",  niche: "Business",  region: "Brazil",                  deadline: "7 days",  proposals: 4,  urgent: false, color: "#b45309", skills: ["Business plan", "Food market"] },
  { id: "opp-6", title: "Indonesian–Dutch Legal Document Review",     budget: "WLD 160", niche: "Legal",     region: "Indonesia → Netherlands", deadline: "2 days",  proposals: 1,  urgent: true,  color: "#be185d", skills: ["Legal translation", "Dutch"] },
];

const dailyHumanQuestion = getDailyQuestion();

const seedMoments = [
  { id: "m1", initials: "AK", bg: "#137a57", handle: "@amara_k",       loc: "Lagos, Nigeria",      verified: true,  time: "2m",  text: "Just collected my first WLD airdrop. The future of identity is here — and it feels surreal to be part of it.", likes: 24,  replies: 6 },
  { id: "m2", initials: "RJ", bg: "#2f6fed", handle: "@ravi_j",        loc: "Mumbai, India",       verified: true,  time: "9m",  text: "Culture Room is wild — 12 people deep in a conversation about digital identity and no bots in sight.", likes: 41, replies: 13 },
  { id: "m3", initials: "CN", bg: "#6657d9", handle: "@chidi_n",       loc: "Abuja, Nigeria",      verified: true,  time: "17m", text: "Answered 25 daily questions in a row. This streak is discipline made visible.", likes: 58, replies: 9 },
  { id: "m4", initials: "SL", bg: "#b45309", handle: "@sofia_lima",    loc: "São Paulo, Brazil",   verified: true,  time: "31m", text: "Sold my first handmade piece on HumanChain Marketplace. Buyer was in Nairobi. The world is smaller than we think.", likes: 87, replies: 22 },
  { id: "m5", initials: "MH", bg: "#0f766e", handle: "@maya_h",        loc: "Cairo, Egypt",        verified: true,  time: "48m", text: "Completed a translation job for a doctor in Brazil. Nobody told me my skills had a global market.", likes: 63, replies: 17 },
  { id: "m6", initials: "JB", bg: "#7c3aed", handle: "@jayden_builds", loc: "Accra, Ghana",        verified: false, time: "1h",  text: "Six months of daily questions. My answers in January sound like they came from a different person.", likes: 112, replies: 34 },
  { id: "m7", initials: "NP", bg: "#be185d", handle: "@nadia_ph",      loc: "Cebu, Philippines",   verified: true,  time: "2h",  text: "My grandmother answered today's question by voice. I transcribed it word for word. It was the best answer I've seen.", likes: 201, replies: 48 },
  { id: "m8", initials: "TK", bg: "#1d4ed8", handle: "@taro_k",        loc: "Osaka, Japan",        verified: true,  time: "3h",  text: "Opened a Culture Room for Japanese diaspora. 47 people joined in one hour.", likes: 74, replies: 19 },
];

const tickerMessages = [
  "A human from South Africa answered today's question",
  "4.9k verified humans online right now",
  "New verdict forming in Health & Healing",
  "6 new opportunities posted in the last hour",
  "A builder from Brazil posted a proof-of-work moment",
  "7 humans reached Gold tier this week",
  "214k verified humans active in 38 countries",
  "AI Guide helped 128 humans today",
  "A verified trade completed in Nairobi 2 minutes ago",
  "New story submitted from the Philippines",
  "Lagos-routed question received 12 answers in one hour",
  "Faith & Prayer gained 47 new chain links today",
  "A healthcare translator from Uganda just got hired",
  "WLD escrow protected a Swahili–Portuguese job today",
  "A Japanese diaspora Culture Room opened — 47 joined",
  "A verified human made their first marketplace sale",
  "Streak builder from Ghana hit 90 days in a row",
  "New ask thread: what does your culture say about rest?",
  "A migration worker unlocked their first Passport tier",
  "Someone's grandmother gave today's best daily answer",
];

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
  earnPoints,
  humanPosts,
  marketplaceListings,
  notificationReady,
  notificationUnreadCount,
  onEnableNotifications,
  onOpenNotifications,
  onOpenGuide,
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
  earnPoints: EarnPoints;
  humanPosts: HumanPost[];
  marketplaceListings: MarketplaceListing[];
  notificationReady: boolean;
  notificationUnreadCount: number;
  onEnableNotifications: () => void | Promise<void>;
  onOpenNotifications: () => void;
  onOpenGuide: () => void;
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
  const { selection, impact } = useHaptics();
  const [dailyDraft, setDailyDraft] = useState("");
  const [tickerIdx, setTickerIdx] = useState(0);
  const [activityCount, setActivityCount] = useState(() => 72 + (new Date().getMinutes() % 28));
  const [liveHumans] = useState(() => 4847 + (new Date().getMinutes() % 53));

  const [dailyCountdown, setDailyCountdown] = useState(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  });
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      setDailyCountdown(Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000)));
    };
    const tickerId = setInterval(() => setTickerIdx((i) => i + 1), 4000);
    countdownRef.current = setInterval(tick, 60000);
    const activityId = setInterval(() => setActivityCount((c) => c + (Math.random() < 0.35 ? 1 : 0)), 9000);
    return () => {
      clearInterval(tickerId);
      clearInterval(activityId);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const tickerMsg = tickerMessages[tickerIdx % tickerMessages.length];

  function formatCountdown(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  const homeCopy = appLanguage.home;
  const worldHandle = getWorldDisplayUsername(worldContext, verifiedHuman);
  const primaryProfileImage = getPrimaryProfileImage(profileImage, verifiedHuman, worldContext);
  const userPostCount = humanPosts.filter((p) => p.owner).length;
  const profileInitial = worldHandle.replace(/^@/, "").trim().charAt(0).toUpperCase() || "H";
  const isVerified = isVerifiedWorldHuman(verifiedHuman);
  const completedTrades = marketplaceListings.filter((l) => l.status === "sold").length;
  const chainScore = getChainScore({ points, streak, posts: userPostCount, savedItems });
  const tier = getReputationTier(chainScore);
  const humanChainId = getHumanChainId(worldHandle);
  const strongestBadge = getStrongestBadge({ isVerified, streak, posts: userPostCount, trades: completedTrades });
  const greeting = getGreeting();

  const aiInsight = !isVerified
    ? "Verify with World ID to unlock your HumanChain reputation and start earning trust."
    : !dailyAnswered
      ? `Answer today's reflection to earn +18 HP and protect your ${streak}-day streak.`
      : tier.next
        ? `You're ${tier.toGo} points from ${tier.next.label}. Share a proof-of-work moment to climb faster.`
        : "You're at the top of the chain. Mentor a newcomer to keep your reputation strong.";

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

      {/* ── 1 · Topbar ─────────────────────────────────── */}
      <header className="h9-topbar" role="banner">
        <button className="h9-avatar-btn" onClick={() => setTab("me")} type="button" aria-label="Open passport">
          <span className="h9-avatar" style={{ background: primaryProfileImage ? "transparent" : "linear-gradient(135deg,#137a57,#1f8f8a)" }}>
            {primaryProfileImage
              ? <img alt="" src={primaryProfileImage} />
              : profileInitial}
            {isVerified && <span className="h9-avatar-pip" aria-hidden="true"><BadgeCheck size={10} /></span>}
          </span>
        </button>
        <div className="h9-topbar-text">
          <span className="h9-greeting">{greeting},</span>
          <strong className="h9-handle">{worldHandle}</strong>
        </div>
        <div className="h9-topbar-actions">
          {streak > 0 && (
            <button className="h9-streak-chip" onClick={() => setTab("me")} type="button" aria-label={`${streak} day streak`}>
              <Flame size={12} />{streak}d
            </button>
          )}
          <button className="h9-hp-chip" onClick={() => setTab("me")} type="button" aria-label={`${points} HP`}>
            <Hexagon size={11} />{points}
          </button>
          <button
            className={`h9-icon-btn${notificationUnreadCount > 0 ? " has-dot" : ""}`}
            onClick={notificationReady ? onOpenNotifications : onEnableNotifications}
            aria-label={notificationUnreadCount > 0 ? `${notificationUnreadCount} unread notifications` : "Notifications"}
            type="button"
          >
            <Bell size={18} />
            {notificationUnreadCount > 0 && (
              <span className="h9-notif-badge" aria-hidden="true">
                {notificationUnreadCount > 9 ? "9+" : notificationUnreadCount}
              </span>
            )}
          </button>
          <button className="h9-icon-btn" onClick={() => setTab("settings")} aria-label="Settings" type="button">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* ── 2 · Live network strip ──────────────────────── */}
      <div className="h9-network-strip" aria-live="polite">
        <span className="h9-ns-dot" aria-hidden="true" />
        <span className="h9-ns-text">{tickerMsg}</span>
        <span className="h9-ns-count">{liveHumans.toLocaleString()} live</span>
      </div>

      {/* ── 3 · Identity card ──────────────────────────── */}
      <section className="h9-hero" aria-label="Your HumanChain passport">
        <button className="hc-brief-compact" onClick={() => { selection(); setTab("me"); }} type="button" aria-label="View your Human Passport">
          <span className="hc-brief-sheen" aria-hidden="true" />

          {/* Score + tier + verification */}
          <div className="hc-brief-compact-top">
            <div className="hc-brief-score-col">
              <b className="hc-brief-score-num">{chainScore}</b>
              <span className="hc-brief-score-label">Chain Score</span>
            </div>
            <div className="hc-brief-compact-meta">
              <span className="hc-brief-level">Lv.{tier.level} · {tier.current.label}</span>
              {strongestBadge && (
                <span className="hc-brief-badge">
                  <strongestBadge.icon size={9} />
                  {strongestBadge.label}
                </span>
              )}
            </div>
            <span className={`hc-brief-verify${isVerified ? " on" : ""}`} aria-label={isVerified ? "World ID verified" : "Preview mode"}>
              <BadgeCheck size={11} />{isVerified ? "Verified" : "Preview"}
            </span>
          </div>

          {/* Progress bar */}
          {tier.next && (
            <div className="hc-brief-progress-wrap">
              <div className="hc-brief-progress" role="progressbar" aria-valuenow={tier.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${tier.pct}% to ${tier.next.label}`}>
                <i style={{ width: `${tier.pct}%` }} />
              </div>
              <span className="hc-brief-progress-label">{tier.toGo} HP to {tier.next.label}</span>
            </div>
          )}

          {/* Stats row */}
          <div className="hc-brief-stats" aria-label="Your stats">
            <div className="hc-bstat"><span>{points}</span><label>HP</label></div>
            <div className="hc-bstat"><span>{streak}d</span><label>Streak</label></div>
            <div className="hc-bstat"><span>{userPostCount}</span><label>Posts</label></div>
            <div className="hc-bstat"><span>{completedTrades}</span><label>Trades</label></div>
          </div>

          {/* Footer */}
          <div className="hc-brief-compact-footer">
            <span className="hc-brief-code">{humanChainId}</span>
            <span className="hc-brief-passport-link">View Passport <ChevronRight size={12} /></span>
          </div>
        </button>
      </section>

      {/* ── 4 · Quick actions ──────────────────────────── */}
      <section className="h9-section" aria-label="Quick actions">
        <div className="hc-quick">
          <button
            onClick={() => { selection(); act("Ask Humanity", "Ask one honest question — verified humans answer."); setTab("ask"); }}
            type="button"
            aria-label="Ask a question"
          >
            <span className="hc-quick-icon" style={{ "--qa": "#2f6fed" } as React.CSSProperties}>
              <MessageCircleQuestion size={18} />
            </span>
            <span>Ask</span>
          </button>
          <button
            onClick={() => { selection(); act("Post Moment", "Share a real photo or reflection — every moment builds trust."); setTab("chains"); }}
            type="button"
            aria-label="Post a moment"
          >
            <span className="hc-quick-icon" style={{ "--qa": "#137a57" } as React.CSSProperties}>
              <Camera size={18} />
            </span>
            <span>Moment</span>
          </button>
          <button
            onClick={() => { selection(); act("Find Work", "Browse verified opportunities with escrow protection."); setTab("market"); }}
            type="button"
            aria-label="Find work"
          >
            <span className="hc-quick-icon" style={{ "--qa": "#b88a1f" } as React.CSSProperties}>
              <Briefcase size={18} />
            </span>
            <span>Work</span>
          </button>
          <button
            onClick={() => { selection(); setTab("stories"); }}
            type="button"
            aria-label="Read stories"
          >
            <span className="hc-quick-icon" style={{ "--qa": "#7c3aed" } as React.CSSProperties}>
              <BookOpen size={18} />
            </span>
            <span>Stories</span>
          </button>
        </div>
      </section>

      {/* ── 5 · AI Guide + Daily Question ──────────────── */}
      <section className="h9-section" aria-label="Daily question and AI guide">
        <div className="hc-daily-card">
          <div className="hc-daily-card-head">
            <div className="hc-daily-card-label">
              <Sparkles size={13} />
              <span>AI Guide · Your Next Move</span>
            </div>
            <button
              className="hc-daily-card-open"
              onClick={() => { selection(); onOpenGuide(); }}
              aria-label="Open AI guide"
              type="button"
            >
              <ArrowRight size={14} />
            </button>
          </div>

          <p className="hc-daily-insight">{aiInsight}</p>

          {!dailyAnswered && isVerified && (
            <div className="hc-daily-q-block">
              <div className="hc-daily-q-label">
                <span className="hc-daily-q-dot" aria-hidden="true" />
                Today&apos;s global question
              </div>
              <p className="hc-daily-q-text">{dailyHumanQuestion}</p>
              <textarea
                className="hc-daily-q-area"
                onChange={(e) => setDailyDraft(e.target.value)}
                placeholder={homeCopy.dailyPlaceholder}
                rows={2}
                value={dailyDraft}
                aria-label="Your answer to today's question"
              />
              <Haptic variant="impact" type="medium" asChild>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => { impact("medium"); submitDailyAnswer(); }}
                  type="button"
                >
                  Submit answer · +18 HP <Zap size={13} />
                </Button>
              </Haptic>
            </div>
          )}

          {dailyAnswered && (
            <div className="hc-daily-done-row">
              <span className="hc-daily-done-check" aria-hidden="true">✓</span>
              <div className="hc-daily-done-text">
                <strong>Today answered</strong>
                <span>Next question in {formatCountdown(dailyCountdown)}</span>
              </div>
              <TrendingUp size={16} />
            </div>
          )}

          {!isVerified && (
            <div className="hc-daily-unverified">
              <BadgeCheck size={14} />
              <span>Verify with World ID to answer daily questions and earn HP.</span>
            </div>
          )}

          {isVerified && !dailyAnswered && streak > 0 && (
            <div className="hc-daily-streak-risk">
              <Flame size={13} />
              <span><strong>{streak}-day streak at risk</strong> — answer now to protect it</span>
            </div>
          )}
        </div>
      </section>

      {/* ── 6 · Profile completion (unverified only) ───── */}
      {!isVerified && (
        <section className="h9-section" aria-label="Complete your profile">
          <div className="hc-profile-complete">
            <div className="hc-pc-header">
              <strong>Complete your profile</strong>
              <span>Unlock the full HumanChain experience</span>
            </div>
            <div className="hc-pc-steps">
              <div className="hc-pc-step done"><span aria-label="Done">✓</span><p>Joined</p></div>
              <div className="hc-pc-step next"><span aria-label="Next step">2</span><p>World ID</p></div>
              <div className="hc-pc-step"><span>3</span><p>Post moment</p></div>
              <div className="hc-pc-step"><span>4</span><p>First trade</p></div>
            </div>
            <Haptic variant="impact" type="medium" asChild>
              <Button
                variant="primary"
                fullWidth
                onClick={() => { impact("medium"); act("Verify with World ID", "Open World App and tap Verify. Your human proof stays private — only the zero-knowledge proof is shared."); }}
                type="button"
              >
                <BadgeCheck size={14} /> Verify with World ID
              </Button>
            </Haptic>
          </div>
        </section>
      )}

      {/* ── 7 · Open Opportunities ─────────────────────── */}
      <section className="h9-section" aria-label="Open opportunities">
        <div className="h9-section-head">
          <div>
            <strong>Open Opportunities</strong>
            <p className="h9-section-sub">WLD-protected work for verified humans</p>
          </div>
          <button
            className="h9-section-link"
            onClick={() => { selection(); setTab("market"); }}
            type="button"
            aria-label="See all opportunities"
          >
            See all <ChevronRight size={13} />
          </button>
        </div>
        <div className="h9-opps-scroll" role="list">
          {openOpportunities.map((opp) => (
            <button
              key={opp.id}
              className="h9-opp"
              role="listitem"
              style={{ "--opp-color": opp.color } as React.CSSProperties}
              onClick={() => { selection(); act(opp.title, `${opp.niche} in ${opp.region}. Budget: ${opp.budget}.`); setTab("market"); }}
              type="button"
              aria-label={`${opp.title}, ${opp.budget}`}
            >
              <span className="h9-opp-bar" style={{ background: opp.color }} aria-hidden="true" />
              <div className="h9-opp-top">
                <span className="h9-opp-tag" style={{ color: opp.color, background: `${opp.color}18` }}>{opp.niche}</span>
                {opp.urgent && <span className="h9-opp-urgent">Urgent</span>}
                <span className="h9-opp-deadline"><Clock size={10} />{opp.deadline}</span>
              </div>
              <strong className="h9-opp-title">{opp.title}</strong>
              <div className="h9-opp-meta">
                <span><Globe2 size={11} />{opp.region}</span>
                <span><Users size={11} />{opp.proposals}</span>
              </div>
              <div className="h9-opp-footer">
                <strong>{opp.budget}</strong>
                <span className="h9-opp-apply">Apply <ArrowRight size={11} /></span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── 8 · Live activity ticker ───────────────────── */}
      <div className="hc-ticker" aria-live="polite" aria-label="Live activity">
        <span className="hc-ticker-dot" aria-hidden="true" />
        <span className="hc-ticker-text" key={tickerIdx}>{tickerMsg}</span>
        <span className="hc-ticker-sep" aria-hidden="true" />
        <span className="hc-ticker-stat">{activityCount} answered today</span>
      </div>

      {/* ── 9 · Live Moments feed ──────────────────────── */}
      <section className="h9-section" aria-label="Live moments from the community">
        <div className="h9-section-head">
          <strong>Live Moments</strong>
          <span className="h9-live-pill"><span className="h9-pulse" aria-hidden="true" />Live</span>
        </div>
        <div className="hc-feed" role="feed">
          {seedMoments.slice(0, 3).map((m) => (
            <article key={m.id} className="hc-moment">
              <div className="hc-moment-av" style={{ background: m.bg }} aria-hidden="true">
                {m.initials}
                {m.verified && <span className="hc-moment-pip"><BadgeCheck size={7} /></span>}
              </div>
              <div className="hc-moment-body">
                <div className="hc-moment-meta">
                  <span className="hc-moment-handle">{m.handle}</span>
                  <span className="hc-moment-loc">{m.loc}</span>
                  <span className="hc-moment-time">{m.time} ago</span>
                </div>
                <p className="hc-moment-text">{m.text}</p>
                <div className="hc-moment-actions" aria-label={`${m.likes} likes, ${m.replies} replies`}>
                  <span className="hc-moment-act"><Zap size={11} />{m.likes}</span>
                  <span className="hc-moment-act"><MessageCircleQuestion size={11} />{m.replies}</span>
                </div>
              </div>
            </article>
          ))}
          <Haptic variant="selection" asChild>
            <Button
              variant="tertiary"
              fullWidth
              onClick={() => { selection(); setTab("chains"); }}
              type="button"
            >
              See all {seedMoments.length} moments <ArrowRight size={13} />
            </Button>
          </Haptic>
        </div>
      </section>

      {/* ── 10 · Quick-access chips ────────────────────── */}
      <div className="h9-bottom-chips">
        <button className="h9-chip-story" onClick={() => { selection(); setTab("stories"); }} type="button" aria-label="Story of the Day">
          <BookOpen size={14} aria-hidden="true" />
          <div>
            <strong>Story of the Day</strong>
            <span>The Door That Waited</span>
          </div>
          <ChevronRight size={13} aria-hidden="true" />
        </button>
        <button className="h9-chip-culture" onClick={() => { selection(); setTab("culture"); }} type="button" aria-label="Culture Rooms">
          <Compass size={14} aria-hidden="true" />
          <div>
            <strong>Culture Rooms</strong>
            <span>8 cultures live</span>
          </div>
          <ChevronRight size={13} aria-hidden="true" />
        </button>
      </div>

      {/* ── Connect with HumanChain ───────────────────── */}
      <section className="home-social-strip">
        <span className="home-social-label">Connect with HumanChain</span>
        <div className="home-social-links">
          <button
            className="home-social-btn home-social-btn--x"
            onClick={() => window.open("https://x.com/HumanChainWorld", "_blank", "noopener,noreferrer")}
            type="button"
            aria-label="Follow on X"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.713 6.057zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>X</span>
            <ExternalLink size={11} aria-hidden="true" />
          </button>
          <button
            className="home-social-btn home-social-btn--tg"
            onClick={() => window.open("https://t.me/HumanChainApp", "_blank", "noopener,noreferrer")}
            type="button"
            aria-label="Join Telegram"
          >
            <Send size={13} aria-hidden="true" />
            <span>Telegram</span>
            <ExternalLink size={11} aria-hidden="true" />
          </button>
          <button
            className="home-social-btn home-social-btn--email"
            onClick={() => window.open("mailto:humanchainworld@gmail.com")}
            type="button"
            aria-label="Email us"
          >
            <Mail size={13} aria-hidden="true" />
            <span>Email</span>
            <ExternalLink size={11} aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Bottom padding for nav bar */}
      <div style={{ height: 16 }} aria-hidden="true" />

    </div>
  );
}
