"use client";

import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  Briefcase,
  ChevronRight,
  Compass,
  Flame,
  Mail,
  MessageCircleQuestion,
  Send,
  Settings,
  ShoppingBag,
  Sparkles,
  TrendingUp,
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
    countdownRef.current = setInterval(tick, 60000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

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
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            {/* HumanChain logo mark — network node triangle */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <rect width="28" height="28" rx="14" fill="#0A0A14" />
              {/* Connecting lines forming a triangle */}
              <line x1="14" y1="7" x2="6" y2="21" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="14" y1="7" x2="22" y2="21" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="6" y1="21" x2="22" y2="21" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" />
              {/* Cyan network nodes */}
              <circle cx="14" cy="7" r="2.5" fill="#00D4FF" />
              <circle cx="6" cy="21" r="2.5" fill="#00D4FF" />
              <circle cx="22" cy="21" r="2.5" fill="#00D4FF" />
            </svg>
            <span className="h9-greeting">{greeting},</span>
          </span>
          <strong className="h9-handle">{worldHandle}</strong>
        </div>
        <div className="h9-topbar-actions">
          <button
            className="h9-icon-btn h9-icon-btn-guide"
            onClick={() => { selection(); onOpenGuide(); }}
            aria-label="Open HumanChain Guide — full assist for every area"
            type="button"
          >
            <Sparkles size={17} />
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

      {/* ── 2 · What HumanChain is (unverified/preview users only) ── */}
      {!isVerified && (
        <div className="h9-intro-card">
          <span className="h9-intro-icon" aria-hidden="true"><Sparkles size={17} /></span>
          <p className="h9-intro-text">
            <strong>HumanChain</strong> is the verified-human network inside World App.
            Ask real questions, get real answers, and build a trust record backed
            by your World ID.
          </p>
        </div>
      )}

      {/* ── 3 · Identity card ──────────────────────────── */}
      <section className="h9-hero" aria-label="Your HumanChain passport">
        <button className="hc-brief-compact" onClick={() => { selection(); setTab("me"); }} type="button" aria-label={`View Human Passport · ${humanChainId}`}>
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
            <span className={`hc-brief-verify${isVerified ? " on" : ""}`} aria-label={isVerified ? (verifiedHuman?.worldIdTier === "orb" ? "World ID Orb verified" : "Signed in with World App") : "Preview mode"}>
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
            <span className="hc-brief-passport-link">View Passport <ChevronRight size={12} /></span>
          </div>
        </button>
      </section>

      {/* ── 4 · Primary action ──────────────────────────── */}
      <section className="h9-section" aria-label="Ask The World">
        <div className="hc-cta-primary">
          <button
            className="hc-cta-btn hc-cta-ask hc-cta-ask-solo"
            onClick={() => { selection(); setTab("ask"); }}
            type="button"
            aria-label="Ask The World a question"
          >
            <span className="hc-cta-icon-bg hc-cta-icon-ask">
              <MessageCircleQuestion size={22} />
            </span>
            <div className="hc-cta-label">
              <strong>Ask The World</strong>
              <span>Verified answers from real humans</span>
            </div>
            <ChevronRight size={16} className="hc-cta-chevron" aria-hidden="true" />
          </button>
          <button
            className={`hc-chain-pill${dailyAnswered ? " done" : ""}`}
            onClick={() => { selection(); setTab("chains"); }}
            type="button"
            aria-label="Join today's chain"
          >
            <Flame size={14} />
            <span>{dailyAnswered ? "Today's Chain — joined ✓" : "Today's Chain — add your link"}</span>
            <ChevronRight size={13} aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* ── Market preview ───────────────────────────────── */}
      <section className="h9-section" aria-label="Market preview">
        <button className="hc-market-preview" onClick={() => { selection(); setTab("market"); }} type="button">
          <div className="hc-mp-head">
            <span className="hc-mp-head-label"><ShoppingBag size={14} />Nearby Market</span>
            <span className="hc-mp-live"><span aria-hidden="true" />Live</span>
          </div>
          {marketplaceListings.length ? (
            <div className="hc-mp-rows">
              {marketplaceListings.slice(0, 2).map((l) => (
                <div className="hc-mp-row" key={l.id}>
                  <span className="hc-mp-row-title">{l.title || "Untitled item"}</span>
                  <span className="hc-mp-row-price">{l.price || "Price not set"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="hc-mp-empty">World ID sellers, WLD escrow. Be the first to list something nearby.</p>
          )}
          <span className="hc-mp-cta">See Market <ChevronRight size={13} /></span>
        </button>
        <div className="hc-more-links">
          <button onClick={() => { selection(); setTab("stories"); }} type="button" aria-label="Human stories">
            <BookOpen size={14} /><span>Stories</span>
          </button>
          <button onClick={() => { selection(); setTab("culture"); }} type="button" aria-label="Culture rooms">
            <Compass size={14} /><span>Culture</span>
          </button>
        </div>
      </section>

      {/* ── 5 · AI Guide + Daily Question ──────────────── */}
      <section className="h9-section" aria-label="Daily question and AI guide">
        <div className="hc-daily-card">
          <div className="hc-daily-card-head">
            <span className="hc-daily-card-label"><Sparkles size={13} />AI Insight</span>
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

      {/* ── 7 · Community voices ──────────────────────── */}
      <section className="h9-section" aria-label="Community voices">
        <div className="h9-section-head">
          <strong>Community voices</strong>
          <button className="h9-section-link" onClick={() => { selection(); setTab("chains"); }} type="button">
            See all <ArrowRight size={12} />
          </button>
        </div>
        <div className="hc-feed-scroll" role="feed">
          {seedMoments.slice(0, 5).map((m) => (
            <article key={m.id} className="hc-moment-compact">
              <div className="hc-moment-compact-head">
                <div className="hc-moment-av" style={{ background: m.bg }} aria-hidden="true">
                  {m.initials}
                  {m.verified && <span className="hc-moment-pip"><BadgeCheck size={7} /></span>}
                </div>
                <div>
                  <span className="hc-moment-handle">{m.handle}</span>
                  <span className="hc-moment-loc">{m.loc}</span>
                </div>
              </div>
              <p className="hc-moment-text">{m.text}</p>
              <div className="hc-moment-actions" aria-label={`${m.likes} likes, ${m.replies} replies`}>
                <span className="hc-moment-act"><Zap size={11} />{m.likes}</span>
                <span className="hc-moment-act"><MessageCircleQuestion size={11} />{m.replies}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Connect with HumanChain ───────────────────── */}
      <section className="home-social-strip">
        <span className="home-social-label">Connect with HumanChain</span>
        <div className="home-social-icons">
          <button
            className="home-social-icon home-social-icon--x"
            onClick={() => window.open("https://x.com/HumanChainWorld", "_blank", "noopener,noreferrer")}
            type="button"
            aria-label="Follow HumanChain on X"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.713 6.057zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
          <button
            className="home-social-icon home-social-icon--tg"
            onClick={() => window.open("https://t.me/HumanChainApp", "_blank", "noopener,noreferrer")}
            type="button"
            aria-label="Join HumanChain on Telegram"
          >
            <Send size={18} aria-hidden="true" />
          </button>
          <button
            className="home-social-icon home-social-icon--email"
            onClick={() => window.open("mailto:humanchainworld@gmail.com")}
            type="button"
            aria-label="Email HumanChain"
          >
            <Mail size={18} aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Bottom padding for nav bar */}
      <div style={{ height: 16 }} aria-hidden="true" />

    </div>
  );
}
