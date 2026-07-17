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
  isDemoItem,
  isVerifiedWorldHuman,
  requireVerifiedPublicAction,
} from "@/lib/humanchain/utils";
import { DataBadge } from "@/components/ui/DataBadge";
import { VerificationTierBadge } from "@/components/ui/VerificationTierBadge";
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

// Deterministic avatar tone from a handle — not a per-person brand, just a
// stable, non-random way to tell moment authors apart visually.
const momentTones = ["#137a57", "#2f6fed", "#6657d9", "#b88a1f", "#0f766e"];
function getMomentTone(handle: string) {
  let h = 0;
  for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) >>> 0;
  return momentTones[h % momentTones.length];
}

const dailyHumanQuestion = getDailyQuestion();

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

  // Recent moments, real data only (no more separate fake "community voices"
  // cast). Owner's own posts and anything synced live come first; falls back
  // to the first few reference posts, each honestly badged — never
  // presented as if from real platform members.
  const recentMoments = [...humanPosts]
    .sort((a, b) => (a.owner === b.owner ? 0 : a.owner ? -1 : 1))
    .slice(0, 5);

  // Personalized guidance from real local state (verification, streak, tier
  // progress) — not a model call, so this must never be labeled "AI."
  const nextMoveInsight = !isVerified
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
    <div className="screen hme-home">

      {/* ── Topbar ─────────────────────────────────────── */}
      <header className="hme-topbar" role="banner">
        <button className="hme-avatar-btn" onClick={() => setTab("me")} type="button" aria-label="Open passport">
          <span className="hme-avatar" style={{ background: primaryProfileImage ? "transparent" : "linear-gradient(135deg,#137a57,#1f8f8a)" }}>
            {primaryProfileImage
              ? <img alt="" src={primaryProfileImage} />
              : profileInitial}
            {isVerified && <span className="hme-avatar-pip" aria-hidden="true"><BadgeCheck size={10} /></span>}
          </span>
        </button>
        <div className="hme-topbar-text">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
              <rect width="28" height="28" rx="14" fill="#0A0A14" />
              <line x1="14" y1="7" x2="6" y2="21" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="14" y1="7" x2="22" y2="21" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="6" y1="21" x2="22" y2="21" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="14" cy="7" r="2.5" fill="#00D4FF" />
              <circle cx="6" cy="21" r="2.5" fill="#00D4FF" />
              <circle cx="22" cy="21" r="2.5" fill="#00D4FF" />
            </svg>
            <span className="hme-greeting">{greeting},</span>
          </span>
          <strong className="hme-handle">{worldHandle}</strong>
        </div>
        <div className="hme-topbar-actions">
          <button className="hme-icon-btn" onClick={() => { selection(); onOpenGuide(); }} aria-label="Open HumanChain Guide — full assist for every area" type="button">
            <Sparkles size={17} />
          </button>
          <button
            className={`hme-icon-btn${notificationUnreadCount > 0 ? " has-dot" : ""}`}
            onClick={notificationReady ? onOpenNotifications : onEnableNotifications}
            aria-label={notificationUnreadCount > 0 ? `${notificationUnreadCount} unread notifications` : "Notifications"}
            type="button"
          >
            <Bell size={18} />
            {notificationUnreadCount > 0 && (
              <span className="hme-notif-badge" aria-hidden="true">{notificationUnreadCount > 9 ? "9+" : notificationUnreadCount}</span>
            )}
          </button>
          <button className="hme-icon-btn" onClick={() => setTab("settings")} aria-label="Settings" type="button">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* ── What HumanChain is (unverified/preview only) ── */}
      {!isVerified && (
        <div className="hme-intro-card">
          <span className="hme-intro-icon" aria-hidden="true"><Sparkles size={17} /></span>
          <p className="hme-intro-text">
            <strong>HumanChain</strong> is the verified-human network inside World App.
            Ask real questions, get real answers, and build a trust record backed
            by your World ID.
          </p>
        </div>
      )}

      {/* ── Status strip — collapsed identity, not a tappable hero ── */}
      <button className="hme-status-strip" onClick={() => { selection(); setTab("me"); }} type="button" aria-label={`View Human Passport · ${humanChainId}`}>
        <span className="hme-status-score"><b>{chainScore}</b>Chain Score</span>
        <span className="hme-status-tier">Lv.{tier.level} · {tier.current.label}</span>
        {strongestBadge && (
          <span className="hme-status-badge"><strongestBadge.icon size={9} />{strongestBadge.label}</span>
        )}
        <span className="hme-status-spacer" />
        <VerificationTierBadge human={verifiedHuman} size={10} />
        <ChevronRight size={14} className="hme-status-chevron" aria-hidden="true" />
      </button>
      {tier.next && (
        <div className="hme-status-progress" role="progressbar" aria-valuenow={tier.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${tier.pct}% to ${tier.next.label}`}>
          <i style={{ width: `${tier.pct}%` }} />
        </div>
      )}

      {/* ── Hero: Ask The World, with Next Move + Today's Chain nested ── */}
      <section className="hme-hero" aria-label="Ask The World">
        <button className="hme-hero-ask" onClick={() => { selection(); setTab("ask"); }} type="button" aria-label="Ask The World a question">
          <span className="hme-hero-ask-icon"><MessageCircleQuestion size={22} /></span>
          <span className="hme-hero-ask-text">
            <strong>Ask The World</strong>
            <span>Verified answers from real humans</span>
          </span>
          <ChevronRight size={18} className="hme-hero-ask-chevron" aria-hidden="true" />
        </button>

        <div className="hme-hero-split">
          <div className="hme-hero-next">
            <span className="hme-hero-next-label"><Compass size={13} />Your Next Move</span>
            <p className="hme-hero-next-text">{nextMoveInsight}</p>

            {!dailyAnswered && isVerified && (
              <div className="hme-daily-block">
                <div className="hme-daily-label"><span className="hme-daily-dot" aria-hidden="true" />Today&apos;s global question</div>
                <p className="hme-daily-text">{dailyHumanQuestion}</p>
                <textarea
                  className="hme-daily-area"
                  onChange={(e) => setDailyDraft(e.target.value)}
                  placeholder={homeCopy.dailyPlaceholder}
                  rows={2}
                  value={dailyDraft}
                  aria-label="Your answer to today's question"
                />
                <Haptic variant="impact" type="medium" asChild>
                  <Button variant="primary" fullWidth onClick={() => { impact("medium"); submitDailyAnswer(); }} type="button">
                    Submit answer · +18 HP <Zap size={13} />
                  </Button>
                </Haptic>
              </div>
            )}

            {dailyAnswered && (
              <div className="hme-daily-done">
                <span aria-hidden="true">✓</span>
                <div>
                  <strong>Today answered</strong>
                  <span>Next question in {formatCountdown(dailyCountdown)}</span>
                </div>
                <TrendingUp size={16} />
              </div>
            )}

            {isVerified && !dailyAnswered && streak > 0 && (
              <div className="hme-streak-risk">
                <Flame size={13} />
                <span><strong>{streak}-day streak at risk</strong> — answer now to protect it</span>
              </div>
            )}
          </div>

          <button className={`hme-hero-chain${dailyAnswered ? " done" : ""}`} onClick={() => { selection(); setTab("chains"); }} type="button" aria-label="Join today's chain">
            <Flame size={16} />
            <strong>Today&apos;s Chain</strong>
            <span>{dailyAnswered ? "Joined ✓" : "Add your link"}</span>
          </button>
        </div>
      </section>

      {/* ── Discovery rail: Market, Stories, Culture in one scroll ── */}
      <section className="hme-rail-section" aria-label="Discover">
        <div className="hme-rail" role="list">
          <button className="hme-rail-card hme-rail-card--market" role="listitem" onClick={() => { selection(); setTab("market"); }} type="button">
            <span className="hme-rail-card-head"><ShoppingBag size={15} />Nearby Market<span className="hme-rail-live"><span aria-hidden="true" />Live</span></span>
            {marketplaceListings.length ? (
              <div className="hme-rail-market-rows">
                {marketplaceListings.slice(0, 2).map((l) => (
                  <div className="hme-rail-market-row" key={l.id}>
                    <span>{l.title || "Untitled item"}</span>
                    <span>{l.price || "Price not set"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="hme-rail-card-empty">World ID sellers, WLD escrow. Be the first to list something nearby.</p>
            )}
            <span className="hme-rail-card-cta">See Market <ChevronRight size={12} /></span>
          </button>

          <button className="hme-rail-card hme-rail-card--stories" role="listitem" onClick={() => { selection(); setTab("stories"); }} type="button">
            <span className="hme-rail-card-head"><BookOpen size={15} />Stories</span>
            <p className="hme-rail-card-empty">Monthly human stories and reflections, free and paid.</p>
            <span className="hme-rail-card-cta">Read Stories <ChevronRight size={12} /></span>
          </button>

          <button className="hme-rail-card hme-rail-card--culture" role="listitem" onClick={() => { selection(); setTab("culture"); }} type="button">
            <span className="hme-rail-card-head"><Compass size={15} />Culture</span>
            <p className="hme-rail-card-empty">Curated rooms, free to browse — or create your own.</p>
            <span className="hme-rail-card-cta">Explore Culture <ChevronRight size={12} /></span>
          </button>
        </div>
      </section>

      {/* ── Profile completion (unverified only) ── */}
      {!isVerified && (
        <section className="hme-section" aria-label="Complete your profile">
          <div className="hme-profile-complete">
            <div className="hme-pc-header">
              <strong>Complete your profile</strong>
              <span>Unlock the full HumanChain experience</span>
            </div>
            <div className="hme-pc-steps">
              <div className="hme-pc-step done"><span aria-label="Done">✓</span><p>Joined</p></div>
              <div className="hme-pc-step next"><span aria-label="Next step">2</span><p>World ID</p></div>
              <div className="hme-pc-step"><span>3</span><p>Post moment</p></div>
              <div className="hme-pc-step"><span>4</span><p>First trade</p></div>
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

      {/* ── Recent moments — real data, honestly labeled ── */}
      <section className="hme-section" aria-label="Recent moments">
        <div className="hme-section-head">
          <strong>Human moments</strong>
          <button className="hme-section-link" onClick={() => { selection(); setTab("chains"); }} type="button">
            See all <ArrowRight size={12} />
          </button>
        </div>
        {recentMoments.length > 0 ? (
          <div className="hme-moments-scroll" role="feed">
            {recentMoments.map((m) => {
              const handle = m.author || "@human";
              const initials = handle.replace(/^@/, "").slice(0, 2).toUpperCase();
              return (
                <article key={m.id} className="hme-moment-card">
                  <div className="hme-moment-head">
                    <div className="hme-moment-av" style={{ background: getMomentTone(handle) }} aria-hidden="true">{initials}</div>
                    <span className="hme-moment-handle">{m.owner ? "You" : handle}</span>
                    {isDemoItem(m) && <DataBadge className="hme-moment-badge" label="Demo" />}
                  </div>
                  <p className="hme-moment-text">{m.caption}</p>
                  <div className="hme-moment-actions" aria-label={`${m.reactions} reactions, ${m.comments.length} comments`}>
                    <span><Zap size={11} />{m.reactions}</span>
                    <span><MessageCircleQuestion size={11} />{m.comments.length}</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="hme-moments-empty">
            <p>No moments yet. Be the first real voice on HumanChain.</p>
            <button onClick={() => { selection(); setTab("create"); }} type="button">Post a moment</button>
          </div>
        )}
      </section>

      {/* ── Connect with HumanChain ── */}
      <section className="hme-social-strip">
        <span className="hme-social-label">Connect with HumanChain</span>
        <div className="hme-social-icons">
          <button className="hme-social-icon hme-social-icon--x" onClick={() => window.open("https://x.com/HumanChainWorld", "_blank", "noopener,noreferrer")} type="button" aria-label="Follow HumanChain on X">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.713 6.057zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
          <button className="hme-social-icon hme-social-icon--tg" onClick={() => window.open("https://t.me/HumanChainApp", "_blank", "noopener,noreferrer")} type="button" aria-label="Join HumanChain on Telegram">
            <Send size={18} aria-hidden="true" />
          </button>
          <button className="hme-social-icon hme-social-icon--email" onClick={() => window.open("mailto:humanchainworld@gmail.com")} type="button" aria-label="Email HumanChain">
            <Mail size={18} aria-hidden="true" />
          </button>
        </div>
      </section>

      <div style={{ height: 16 }} aria-hidden="true" />
    </div>
  );
}
