"use client";

import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  Briefcase,
  Camera,
  Clock,
  Compass,
  Flame,
  Globe2,
  Hexagon,
  MessageCircleQuestion,
  Settings,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { getWorldMiniAppContext } from "@/lib/worldMiniApp";
import { getDailyQuestion } from "@/lib/data/dailyQuestions";
import { type AppLanguage } from "@/lib/data/languages";
import {
  formatShortTime,
  getChainScore,
  getLocalDateKey,
  getPrimaryProfileImage,
  getReputationHealth,
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

// ---------------------------------------------------------------------------
// Reputation ladder — getReputationTier/getReputationHealth are shared with
// MeView via lib/humanchain/utils so the label/color/progress shown on the
// home screen always matches the Reputation Hub.
// ---------------------------------------------------------------------------

// Deterministic display ID derived from the handle — an identity label, not a
// reputation value. Real IDs will come from the users table in Phase E.
function getHumanChainId(handle: string) {
  const seed = (handle || "human").replace(/[^a-z0-9]/gi, "").toUpperCase() || "HUMAN";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const code = h.toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  return `HC-${code.slice(0, 3)}-${code.slice(3, 6)}`;
}

// Strongest earned badge from REAL local signals. Null → honest empty state.
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
  { id: "m1", initials: "AK", bg: "#137a57", handle: "@amara_k",       loc: "Lagos · Nigeria",      verified: true,  time: "2m ago",  text: "Just collected my first WLD airdrop. The future of identity is here — and it feels surreal to be part of it.", likes: 24,  replies: 6 },
  { id: "m2", initials: "RJ", bg: "#2f6fed", handle: "@ravi_j",        loc: "Mumbai · India",       verified: true,  time: "9m ago",  text: "Culture Room is wild — 12 people deep in a conversation about digital identity and no bots in sight.", likes: 41, replies: 13 },
  { id: "m3", initials: "CN", bg: "#6657d9", handle: "@chidi_n",       loc: "Abuja · Nigeria",      verified: true,  time: "17m ago", text: "Answered 25 daily questions in a row. This streak isn't just a number — it's discipline made visible.", likes: 58, replies: 9 },
  { id: "m4", initials: "SL", bg: "#b45309", handle: "@sofia_lima",    loc: "São Paulo · Brazil",   verified: true,  time: "31m ago", text: "Sold my first handmade piece on HumanChain Marketplace. Buyer was in Nairobi. The world is smaller than we think.", likes: 87, replies: 22 },
  { id: "m5", initials: "MH", bg: "#0f766e", handle: "@maya_h",        loc: "Cairo · Egypt",        verified: true,  time: "48m ago", text: "Completed a translation job for a doctor in Brazil. Swahili to Portuguese. Nobody told me my skills had a global market.", likes: 63, replies: 17 },
  { id: "m6", initials: "JB", bg: "#7c3aed", handle: "@jayden_builds", loc: "Accra · Ghana",        verified: false, time: "1h ago",  text: "Six months of daily questions. My answers in January sound like they came from a different person. That person is gone.", likes: 112, replies: 34 },
  { id: "m7", initials: "NP", bg: "#be185d", handle: "@nadia_ph",      loc: "Cebu · Philippines",   verified: true,  time: "2h ago",  text: "My grandmother can't read but she answered today's question by voice. I transcribed it word for word. It was the best answer I've seen.", likes: 201, replies: 48 },
  { id: "m8", initials: "TK", bg: "#1d4ed8", handle: "@taro_k",        loc: "Osaka · Japan",        verified: true,  time: "3h ago",  text: "Opened a Culture Room for Japanese diaspora. 47 people joined in one hour. We're all carrying the same two languages.", likes: 74, replies: 19 },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatJoinDate(iso: string | null): string {
  if (!iso) return "Today";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Today";
  return d.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
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
  joinedAt,
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
  joinedAt: string | null;
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
  const [dailyDraft, setDailyDraft] = useState("");
  const [tickerIdx, setTickerIdx] = useState(0);
  const [activityCount, setActivityCount] = useState(() => 72 + (new Date().getMinutes() % 28));

  const tickerMessages = [
    "A human from South Africa answered today's question",
    "4.9k humans online — the chain is live now",
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
    "A healthcare translator from Uganda just got hired on the marketplace",
    "WLD escrow protected a Swahili–Portuguese job this morning",
    "A Japanese diaspora Culture Room opened — 47 joined in one hour",
    "Someone's grandmother answered a daily question by voice. It was the best one.",
    "A verified human made their first marketplace sale — buyer was in Nairobi",
    "Streak builder from Ghana hit 90 days in a row",
    "New ask thread: what does your culture say about rest?",
    "A migration worker from the Philippines unlocked their first Human Passport tier",
  ];

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
    const id = setInterval(() => setTickerIdx((i) => i + 1), 4000);
    countdownRef.current = setInterval(tick, 60000);
    const activityId = setInterval(() => setActivityCount((c) => c + (Math.random() < 0.35 ? 1 : 0)), 9000);
    return () => { clearInterval(id); clearInterval(activityId); if (countdownRef.current) clearInterval(countdownRef.current); };
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
  // Only count listings that reached "sold" status as completed trades.
  // "payment-ready" is the default publish status and does not mean a sale was made.
  const completedTrades = marketplaceListings.filter((l) => l.status === "sold").length;
  const chainScore = getChainScore({ points, streak, posts: userPostCount, savedItems });
  const tier = getReputationTier(chainScore);
  const health = getReputationHealth(chainScore);
  const humanChainId = getHumanChainId(worldHandle);
  const strongestBadge = getStrongestBadge({ isVerified, streak, posts: userPostCount, trades: completedTrades });
  const greeting = getGreeting();
  const joinLabel = formatJoinDate(joinedAt);

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
    setShowDaily(false);
  }

  return (
    <div className="screen home-v9">

      {/* ── 1 · Compact identity header ──────────────── */}
      <header className="h9-topbar">
        <button className="h9-avatar-btn" onClick={() => setTab("me")} type="button" aria-label="Open passport">
          <span className="h9-avatar" style={{ background: primaryProfileImage ? "transparent" : "linear-gradient(135deg,#137a57,#1f8f8a)" }}>
            {primaryProfileImage ? <img alt="" src={primaryProfileImage} /> : profileInitial}
            {isVerified && <span className="h9-avatar-pip"><BadgeCheck size={10} /></span>}
          </span>
        </button>
        <div className="h9-topbar-text">
          <span className="h9-greeting">{greeting},</span>
          <strong className="h9-handle">{worldHandle}</strong>
        </div>
        <div className="h9-topbar-actions">
          <button className="h9-streak-chip" onClick={() => setTab("me")} type="button" aria-label={`${streak} day streak`}>
            <Flame size={13} />{streak}
          </button>
          <button className="h9-hp-chip" onClick={() => setTab("me")} type="button" aria-label={`${points} HP`}>
            <Hexagon size={11} />{points}
          </button>
          <button
            className={`h9-icon-btn ${notificationUnreadCount > 0 ? "has-dot" : ""}`}
            onClick={notificationReady ? onOpenNotifications : onEnableNotifications}
            aria-label="Notifications"
            type="button"
          >
            <Bell size={18} />
          </button>
          <button className="h9-icon-btn" onClick={() => setTab("me")} aria-label="Settings" type="button">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* ── 2 · Identity card ────────────────────────── */}
      <section className="h9-hero" aria-label="Your HumanChain card">
        <div className="hc-brief">
          <span className="hc-brief-sheen" aria-hidden="true" />

          {/* Row 1: avatar + identity + verified chip */}
          <div className="hc-brief-top">
            <span className="hc-brief-av" style={{ background: primaryProfileImage ? "transparent" : "linear-gradient(135deg,#1f8f8a,#0f7a57)" }}>
              {primaryProfileImage ? <img alt="" src={primaryProfileImage} /> : profileInitial}
              {isVerified && <span className="hc-brief-pip"><BadgeCheck size={10} /></span>}
            </span>
            <div className="hc-brief-id">
              <strong>{worldHandle}</strong>
              <span className="hc-brief-code">{humanChainId} · Joined {joinLabel}</span>
            </div>
            <span className={`hc-brief-verify ${isVerified ? "on" : ""}`}>
              <BadgeCheck size={11} />{isVerified ? "Verified" : "Preview"}
            </span>
          </div>

          {/* Row 2: score + tier + badge */}
          <div className="hc-brief-mid">
            <div className="hc-brief-score-row">
              <b className="hc-brief-score-num">{chainScore}</b>
              <div className="hc-brief-score-meta">
                <span className="hc-brief-level">Lv.{tier.level} · {tier.current.label}</span>
                <span className="hc-brief-health"><i style={{ background: health.color }} />{health.label}</span>
              </div>
            </div>
            {strongestBadge ? (
              <span className="hc-brief-badge"><strongestBadge.icon size={11} />{strongestBadge.label}</span>
            ) : (
              <span className="hc-brief-badge empty">Start building</span>
            )}
          </div>

          {/* Row 3: tier progress bar */}
          <div className="hc-brief-progress" aria-label={`${tier.pct}% to ${tier.next?.label ?? "Founder"}`}>
            <i style={{ width: `${tier.pct}%` }} />
          </div>

          {/* Row 4: 4-stat strip */}
          <div className="hc-brief-stats">
            <div className="hc-bstat"><span>{points}</span><label>HP</label></div>
            <div className="hc-bstat"><span>{streak}d</span><label>Streak</label></div>
            <div className="hc-bstat"><span>{userPostCount}</span><label>Posts</label></div>
            <div className="hc-bstat"><span>{completedTrades}</span><label>Trades</label></div>
          </div>

          {/* Row 5: view passport */}
          <button className="hc-brief-view" onClick={() => setTab("me")} type="button">
            View Passport <ArrowRight size={12} />
          </button>
        </div>
      </section>

      {/* ── 3 · Quick actions ────────────────────────── */}
      <section className="h9-section" aria-label="Quick actions">
        <div className="hc-quick">
          <button onClick={() => { act("Ask Humanity", "Ask one honest question — verified humans answer."); setTab("ask"); }} type="button">
            <span className="hc-quick-icon" style={{ "--qa": "#2f6fed" } as React.CSSProperties}><MessageCircleQuestion size={18} /></span>
            <span>Ask</span>
          </button>
          <button onClick={() => { act("Post Moment", "Share a real photo or reflection — every moment builds trust."); setTab("chains"); }} type="button">
            <span className="hc-quick-icon" style={{ "--qa": "#137a57" } as React.CSSProperties}><Camera size={18} /></span>
            <span>Moment</span>
          </button>
          <button onClick={() => { act("Find Work", "Browse verified opportunities and apply with escrow protection."); setTab("market"); }} type="button">
            <span className="hc-quick-icon" style={{ "--qa": "#b88a1f" } as React.CSSProperties}><Briefcase size={18} /></span>
            <span>Work</span>
          </button>
          <button onClick={() => setTab("stories")} type="button">
            <span className="hc-quick-icon" style={{ "--qa": "#6657d9" } as React.CSSProperties}><BookOpen size={18} /></span>
            <span>Stories</span>
          </button>
        </div>
      </section>

      {/* ── 4 · Daily Question + AI Guide ───────────── */}
      <section className="h9-section" aria-label="Daily question and AI guide">
        <div className="hc-daily-card">
          {/* Header */}
          <div className="hc-daily-card-head">
            <div className="hc-daily-card-label">
              <Sparkles size={14} />
              <span>AI Guide · Your Next Best Move</span>
            </div>
            <button className="hc-daily-card-open" onClick={() => onOpenGuide()} aria-label="Open AI guide" type="button">
              <ArrowRight size={15} />
            </button>
          </div>

          {/* AI insight message */}
          <p className="hc-daily-insight">{aiInsight}</p>

          {/* Daily question block */}
          {!dailyAnswered && isVerified && (
            <div className="hc-daily-q-block">
              <div className="hc-daily-q-label">
                <span className="hc-daily-q-dot" />
                Today&apos;s question
              </div>
              <p className="hc-daily-q-text">{dailyHumanQuestion}</p>
              <textarea
                className="hc-daily-q-area"
                onChange={(e) => setDailyDraft(e.target.value)}
                placeholder={homeCopy.dailyPlaceholder}
                rows={2}
                value={dailyDraft}
              />
              <button className="hc-daily-q-submit" onClick={submitDailyAnswer} type="button">
                Submit answer <Zap size={13} />
              </button>
            </div>
          )}

          {/* Already answered */}
          {dailyAnswered && (
            <div className="hc-daily-done-row">
              <span className="hc-daily-done-check">✓</span>
              <span>Today answered · Next question in <strong>{formatCountdown(dailyCountdown)}</strong></span>
            </div>
          )}

          {/* Not verified nudge */}
          {!isVerified && (
            <div className="hc-daily-unverified">
              <span>Verify with World ID to answer daily questions and earn HP.</span>
            </div>
          )}

          {/* Streak at risk banner inside the card */}
          {isVerified && !dailyAnswered && streak > 0 && (
            <div className="hc-daily-streak-risk">
              <Flame size={14} />
              <span><strong>{streak}-day streak at risk</strong> — answer now to protect it</span>
            </div>
          )}
        </div>
      </section>

      {/* ── 6 · Profile completion (unverified only) ──── */}
      {!isVerified && (
        <section className="h9-section" aria-label="Profile completion">
          <div className="hc-profile-complete">
            <div className="hc-pc-steps">
              <div className="hc-pc-step done"><span>✓</span><p>Joined</p></div>
              <div className="hc-pc-step next"><span>2</span><p>World ID</p></div>
              <div className="hc-pc-step"><span>3</span><p>Post moment</p></div>
              <div className="hc-pc-step"><span>4</span><p>First trade</p></div>
            </div>
            <button className="hc-pc-cta" onClick={() => act("Verify with World ID", "Open World App and tap Verify. Your human proof stays private — only the zero-knowledge proof is shared.")} type="button">
              <BadgeCheck size={14} /> Verify with World ID — unlock full HumanChain
            </button>
          </div>
        </section>
      )}

      {/* ── 7 · Open Opportunities (horizontal scroll) ── */}
      <section className="h9-section" aria-label="Open opportunities">
        <div className="h9-section-head">
          <div>
            <strong>Open Opportunities</strong>
            <p className="h9-section-sub">WLD-protected work for verified humans</p>
          </div>
          <span className="h9-live-pill"><span className="h9-pulse" />Live</span>
        </div>
        <div className="h9-opps-scroll">
          {openOpportunities.map((opp) => (
            <button
              key={opp.id}
              className="h9-opp"
              style={{ "--opp-color": opp.color } as React.CSSProperties}
              onClick={() => { act(opp.title, `${opp.niche} in ${opp.region}. Budget: ${opp.budget}.`); setTab("market"); }}
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
                <span><Users size={12} />{opp.proposals} applied</span>
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

      {/* ── 8 · Live activity ticker (social proof) ──── */}
      <div className="hc-ticker" aria-live="polite" aria-label="Live activity">
        <span className="hc-ticker-dot" aria-hidden="true" />
        <span className="hc-ticker-text" key={tickerIdx}>{tickerMsg}</span>
        <span className="hc-ticker-sep" aria-hidden="true" />
        <span className="hc-ticker-stat">{activityCount} answered · 4.9k live</span>
      </div>

      {/* ── 9 · Community Live feed ──────────────────── */}
      <section className="h9-section" aria-label="Live moments">
        <div className="h9-section-head">
          <strong>Live Moments</strong>
          <span className="h9-live-pill"><span className="h9-pulse" />Live</span>
        </div>
        <div className="hc-feed">
          {seedMoments.map((m) => (
            <div key={m.id} className="hc-moment">
              <div className="hc-moment-av" style={{ background: m.bg }}>
                {m.initials}
                {m.verified && <span className="hc-moment-pip"><BadgeCheck size={7} /></span>}
              </div>
              <div className="hc-moment-body">
                <div className="hc-moment-meta">
                  <span className="hc-moment-handle">{m.handle}</span>
                  <span className="hc-moment-loc">{m.loc}</span>
                  <span className="hc-moment-time">{m.time}</span>
                </div>
                <p className="hc-moment-text">{m.text}</p>
                <div className="hc-moment-actions">
                  <span className="hc-moment-act"><Zap size={11} />{m.likes}</span>
                  <span className="hc-moment-act"><MessageCircleQuestion size={11} />{m.replies} replies</span>
                </div>
              </div>
            </div>
          ))}
          <button className="hc-view-more" onClick={() => setTab("chains")} type="button">
            See all moments <ArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* ── 10 · Story of the Day ────────────────────── */}
      <section className="h9-section" aria-label="Story of the day">
        <button className="hc-story-teaser" onClick={() => setTab("stories")} type="button">
          <span className="hc-story-teaser-kicker"><BookOpen size={12} />Story of the Day</span>
          <p className="hc-story-teaser-quote">&ldquo;I opened the window before I opened the door.&rdquo;</p>
          <span className="hc-story-teaser-attr">— The Door That Waited · Life Stories</span>
          <span className="hc-story-teaser-read">Read now <ArrowRight size={12} /></span>
        </button>
      </section>

      {/* ── 11 · Explore Today ───────────────────────── */}
      <section className="h9-section" aria-label="Explore today">
        <button
          className="hc-explore-today"
          onClick={() => setTab("culture")}
          type="button"
        >
          <span className="hc-explore-glow" aria-hidden="true" />
          <div className="hc-explore-head">
            <span className="hc-explore-kicker"><Compass size={13} />Explore Today</span>
            <span className="hc-explore-go">Discover <ArrowRight size={13} /></span>
          </div>
          <strong className="hc-explore-title">Culture Rooms</strong>
          <p className="hc-explore-sub">Real stories from verified humans — Yoruba, Swahili, Andean, Caribbean and more. Pay to enter, learn, and share.</p>
          <div className="hc-explore-stats">
            <span><Users size={12} />30k+ members</span>
            <span><Sparkles size={12} />8 cultures live</span>
          </div>
        </button>
      </section>

    </div>
  );
}
