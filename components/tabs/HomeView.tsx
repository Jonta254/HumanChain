"use client";

import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Briefcase,
  Camera,
  Clock,
  Compass,
  Flame,
  Globe2,
  Hexagon,
  Lightbulb,
  MessageCircleQuestion,
  Settings,
  Sparkles,
  TrendingUp,
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
  getTrustPassportMetrics,
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
  { id: "opp-1", title: "Swahili–Portuguese Medical Translation", budget: "WLD 85",  niche: "Healthcare",    region: "Kenya → Brazil",  deadline: "5 days",  proposals: 3, urgent: true,  color: "#2f6fed", skills: ["Medical terms", "Swahili"] },
  { id: "opp-2", title: "South African Mining Regulation Consultant", budget: "WLD 220", niche: "Legal",       region: "South Africa",    deadline: "12 days", proposals: 7, urgent: false, color: "#137a57", skills: ["SA mining law", "MPRDA"] },
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

const dailyHumanQuestion = getDailyQuestion();

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
  setActiveField: Dispatch<SetStateAction<ChainField | null>>;
  setDailyAnswered: Dispatch<SetStateAction<boolean>>;
  setDailyResponses: Dispatch<SetStateAction<DailyResponse[]>>;
  setTab: (tab: Tab) => void;
  streak: number;
  verifiedHuman: VerifiedHuman | null;
  worldContext: ReturnType<typeof getWorldMiniAppContext>;
}) {
  const [dailyDraft, setDailyDraft] = useState("");
  const [showDaily, setShowDaily] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [activityCount, setActivityCount] = useState(() => 72 + (new Date().getMinutes() % 28));

  const tickerMessages = [
    "A human from South Africa answered today's question",
    "4.9k humans online — the chain is live now",
    "New verdict forming in Health & Healing",
    "3 new opportunities posted in the last hour",
    "A builder from Brazil posted a proof-of-work moment",
    "7 humans reached Gold tier this week",
    "214k verified humans active in 38 countries",
    "AI Guide helped 128 humans today",
    "A verified trade completed in Nairobi 2 minutes ago",
    "New story submitted from the Philippines",
    "Lagos-routed question received 12 answers today",
    "Faith & Prayer gained 47 new chain links",
    "A healthcare worker from Uganda just got hired",
    "WLD escrow protected a Swahili translation job",
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
  const passportMetrics = getTrustPassportMetrics({
    completedTrades, human: verifiedHuman, points, posts: userPostCount, savedItems, streak,
  });
  const chainScore = getChainScore({ points, streak, posts: userPostCount, savedItems });
  const tier = getReputationTier(chainScore);
  const health = getReputationHealth(chainScore);
  const humanChainId = getHumanChainId(worldHandle);
  const strongestBadge = getStrongestBadge({ isVerified, streak, posts: userPostCount, trades: completedTrades });
  const communitySpotlight = chainFields[(new Date().getDate() - 1) % chainFields.length];
  const greeting = getGreeting();
  const joinLabel = formatJoinDate(joinedAt);

  const aiInsight = !isVerified
    ? "Verify with World ID to unlock your HumanChain reputation and start earning trust."
    : !dailyAnswered
      ? `Answer today's reflection to earn +18 HP and protect your ${streak}-day streak.`
      : tier.next
        ? `You're ${tier.toGo} points from ${tier.next.label}. Share a proof-of-work moment to climb faster.`
        : "You're at the top of the chain. Mentor a newcomer to keep your reputation strong.";

  const improvementTip = !dailyAnswered
    ? "Answer the daily reflection"
    : userPostCount < 1
      ? "Post your first proof-of-work moment"
      : completedTrades < 1
        ? "Complete a verified marketplace trade"
        : "Help a community member to grow trust";

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

      {/* ── 1.5 · Live activity ticker + social proof ── */}
      <div className="hc-ticker" aria-live="polite" aria-label="Live activity">
        <span className="hc-ticker-dot" aria-hidden="true" />
        <span className="hc-ticker-text" key={tickerIdx}>{tickerMsg}</span>
        <span className="hc-ticker-sep" aria-hidden="true" />
        <span className="hc-ticker-stat">{activityCount} answered · 4.9k live</span>
      </div>

      {/* ── 2 · Brief HumanChain Card ────────────────── */}
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

          {/* Row 2: score inline with tier + badge */}
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

          {/* Row 4: view passport */}
          <button className="hc-brief-view" onClick={() => setTab("me")} type="button">
            View Passport <ArrowRight size={12} />
          </button>
        </div>
      </section>

      {/* ── 3 · AI insight (next best move) ──────────── */}
      <section className="h9-section" aria-label="AI insight">
        <div className="hc-insight">
          <span className="hc-insight-icon"><Sparkles size={18} /></span>
          <div className="hc-insight-body">
            <span className="hc-insight-kicker">AI Guide · your next best move</span>
            <p>{aiInsight}</p>
            {dailyAnswered && (
              <div className="hc-daily-done">
                <span className="hc-daily-done-check">✓</span>
                <span>Answered today · Next question in <strong>{formatCountdown(dailyCountdown)}</strong></span>
              </div>
            )}
            {isVerified && !dailyAnswered && (
              showDaily ? (
                <div className="hc-insight-daily">
                  <p className="hc-insight-q">{dailyHumanQuestion}</p>
                  <textarea
                    className="h9-daily-area"
                    onChange={(e) => setDailyDraft(e.target.value)}
                    placeholder={homeCopy.dailyPlaceholder}
                    rows={2}
                    value={dailyDraft}
                  />
                  <button className="hc-insight-submit" onClick={submitDailyAnswer} type="button">
                    Submit answer <Zap size={13} />
                  </button>
                </div>
              ) : (
                <button className="hc-insight-cta" onClick={() => setShowDaily(true)} type="button">
                  Answer today <Zap size={12} />+18 HP
                </button>
              )
            )}
          </div>
          <button className="hc-insight-ai" onClick={() => onOpenGuide()} aria-label="Open AI guide" type="button">
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── 4 · Quick actions ────────────────────────── */}
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
          <button onClick={() => onOpenGuide()} type="button">
            <span className="hc-quick-icon" style={{ "--qa": "#6657d9" } as React.CSSProperties}><Sparkles size={18} /></span>
            <span>Guide</span>
          </button>
        </div>
      </section>

      {/* ── 5 · Reputation mini card ─────────────────── */}
      <section className="h9-section" aria-label="Reputation">
        <button className="hc-rep" onClick={() => setTab("me")} type="button">
          <div className="hc-rep-head">
            <strong>Reputation</strong>
            <span className="hc-rep-cat" style={{ color: health.color, background: `${health.color}1a` }}>{health.label}</span>
          </div>
          <div className="hc-rep-bar"><i style={{ width: `${tier.pct}%` }} /></div>
          <span className="hc-rep-progress">{tier.next ? `${tier.toGo} pts to ${tier.next.label} · Level ${tier.level}` : "Founder — top of the chain"}</span>
          <div className="hc-rep-signals">
            <span className="hc-rep-pos"><TrendingUp size={12} />{streak}-day streak</span>
            <span className="hc-rep-pos"><BadgeCheck size={12} />Trust {passportMetrics.helpfulScore}</span>
            <span className="hc-rep-tip"><Lightbulb size={12} />{improvementTip}</span>
          </div>
        </button>
      </section>

      {/* ── 6 · Open Opportunities (horizontal scroll) ── */}
      <section className="h9-section" aria-label="Open opportunities">
        <div className="h9-section-head">
          <div>
            <strong>Open Opportunities</strong>
            <p className="h9-section-sub">WLD-protected work for verified humans</p>
          </div>
          <span className="h9-live-pill"><span className="h9-pulse" />Live</span>
        </div>
        <div className="h9-opp-scroll">
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

      {/* ── 7.5 · Daily streak nudge ─────────────────── */}
      {isVerified && !dailyAnswered && streak > 0 && (
        <section className="h9-section" aria-label="Streak nudge">
          <div className="hc-streak-nudge">
            <Flame size={18} style={{ flexShrink: 0, color: "#d87d3a" }} />
            <div className="hc-streak-nudge-body">
              <strong>{streak}-day streak at risk</strong>
              <p>Answer today&apos;s question to protect your chain and earn +18 HP.</p>
            </div>
            <button onClick={() => setShowDaily(true)} type="button" className="hc-streak-act">
              Answer <Zap size={12} />
            </button>
          </div>
        </section>
      )}

      {/* ── 7.6 · Profile completion ──────────────────── */}
      {!isVerified && (
        <section className="h9-section" aria-label="Profile completion">
          <div className="hc-profile-complete">
            <div className="hc-pc-steps">
              <div className={`hc-pc-step done`}><span>✓</span><p>Joined</p></div>
              <div className={`hc-pc-step ${isVerified ? "done" : "next"}`}><span>2</span><p>World ID</p></div>
              <div className="hc-pc-step"><span>3</span><p>Post moment</p></div>
              <div className="hc-pc-step"><span>4</span><p>First trade</p></div>
            </div>
            <button className="hc-pc-cta" onClick={() => act("Verify with World ID", "Open World App and tap Verify. Your human proof stays private — only the zero-knowledge proof is shared.")} type="button">
              <BadgeCheck size={14} /> Verify with World ID — unlock full HumanChain
            </button>
          </div>
        </section>
      )}

      {/* ── 8 · Explore Today (one combined card) ────── */}
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
