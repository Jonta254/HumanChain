"use client";

import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  CheckCircle2,
  Globe2,
  HeartHandshake,
  MessageCircleQuestion,
  Settings,
  ShieldCheck,
  Star,
  Store,
  Users,
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
import type { Tab, EarnPoints } from "@/types/ui";
import type { VerifiedHuman } from "@/types/user";
import type { HumanPost, DailyResponse } from "@/types/content";
import type { MarketplaceListing } from "@/types/market";
import type { HistoryRecord } from "@/types/reputation";

const dailyHumanQuestion = "What truth did life teach you this week?";

const coreSteps = [
  {
    title: "Ask",
    detail: "Publish one honest question and collect answers from verified humans.",
    icon: MessageCircleQuestion,
    tab: "ask" as const,
  },
  {
    title: "Chain",
    detail: "Add one useful link to today's global human thread.",
    icon: HeartHandshake,
    tab: "chains" as const,
  },
  {
    title: "Story",
    detail: "Read the monthly Human Story and save the lines that help.",
    icon: BookOpen,
    tab: "stories" as const,
  },
];

const premiumFeatures = [
  ["1 WLD", "Tip or Golden Link", "Thank a human or highlight a strong answer."],
  ["2 WLD", "Country Route", "Ask one country for local perspective."],
  ["4 WLD", "Private Verified Ask", "Stay anonymous while proving humanity."],
  ["5 WLD", "Voice Answers", "Hear tone, not just text."],
  ["6 WLD", "Deep Human Verdict", "Most-said, best answer, country differences, hard truth, final verdict."],
];

const liveSignals = [
  "A verified human in Kenya answered a money question",
  "Today's Chain added a faith and prayer link",
  "A Deep Human Verdict found country differences",
  "The monthly story was saved by 112 readers",
];

const chainFields = [
  { name: "Builders & Money", members: "31.2k", mood: "ambition", detail: "Business ideas, WLD use, startup truth." },
  { name: "Love & Family", members: "27.8k", mood: "care", detail: "Relationship wisdom, family repair, forgiveness." },
  { name: "Culture Rooms", members: "44.1k", mood: "belonging", detail: "Language, food, migration, identity." },
  { name: "Faith & Prayer", members: "18.4k", mood: "hope", detail: "Daily strength across beliefs." },
];

const marketSignals = [
  ["Verified jobs", "Post real needs for real humans"],
  ["Human services", "Offer skills with WLD payment rails"],
  ["Trust history", "Every listing adds to your passport"],
];

type ChainField = (typeof chainFields)[number];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

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
  const homeCopy = appLanguage.home;
  const worldHandle = getWorldDisplayUsername(worldContext, verifiedHuman);
  const primaryProfileImage = getPrimaryProfileImage(profileImage, verifiedHuman, worldContext);
  const profileInitial = worldHandle.replace(/^@/, "").trim().charAt(0).toUpperCase() || "H";
  const isVerified = isVerifiedWorldHuman(verifiedHuman);
  const userPostCount = humanPosts.filter((p) => p.owner).length;
  const passportMetrics = getTrustPassportMetrics({
    completedTrades: marketplaceListings.filter((l) => l.status === "payment-ready").length,
    human: verifiedHuman,
    points,
    posts: userPostCount,
    savedItems,
    streak,
  });
  const communitySpotlight = useMemo(
    () => chainFields[(new Date().getDate() - 1) % chainFields.length],
    [],
  );

  function submitDailyAnswer() {
    if (!requireVerifiedPublicAction(verifiedHuman, act, "answering today's question")) return;
    if (dailyAnswered) {
      act("Already answered", "Come back tomorrow for a new global question.");
      return;
    }

    const now = new Date();
    const time = formatShortTime(now);
    const cleanAnswer =
      dailyDraft.trim() || "Life taught me that a real answer can carry another human.";

    setDailyAnswered(true);
    setDailyAnsweredAt(time);
    setDailyAnsweredDate(getLocalDateKey(now));
    setDailyResponses((cur) => [
      { user: verifiedHuman?.username ?? "@human", text: cleanAnswer, time },
      ...cur,
    ]);
    recordHistory({ title: "Daily Human answer", detail: cleanAnswer, kind: "post" });
    earnPoints(18, "Your Daily Human answer entered today's global verdict.");
  }

  return (
    <div className="screen hc-home">
      <header className="hc-topbar">
        <button aria-label="Open Human Passport" className="hc-avatar-button" onClick={() => setTab("me")} type="button">
          {primaryProfileImage ? <img alt="" src={primaryProfileImage} /> : <span>{profileInitial}</span>}
          {isVerified ? <i><BadgeCheck size={11} /></i> : null}
        </button>
        <div className="hc-user-heading">
          <span>{getGreeting()}</span>
          <strong>{worldHandle}</strong>
        </div>
        <div className="hc-top-actions">
          <button
            aria-label="Notifications"
            className={notificationUnreadCount > 0 ? "hc-icon-button active" : "hc-icon-button"}
            onClick={notificationReady ? onOpenNotifications : onEnableNotifications}
            type="button"
          >
            <Bell size={18} />
          </button>
          <button
            aria-label="Settings"
            className="hc-icon-button"
            onClick={() => setTab("settings")}
            type="button"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <section className="hc-hero" aria-label="HumanChain home">
        <div className="hc-live-line">
          <span />
          {liveSignals[new Date().getMinutes() % liveSignals.length]}
        </div>
        <h1>Ask real humans. Get the world&apos;s verdict.</h1>
        <p>HumanChain turns questions, daily links, and monthly stories into verified human perspective.</p>
        <div className="hc-hero-actions">
          <button className="primary-command" onClick={() => setTab("ask")} type="button">
            <MessageCircleQuestion size={18} />
            Ask The World
          </button>
          <button className="hc-secondary-command" onClick={() => setTab("market")} type="button">
            <Store size={17} />
            Open Human Market
          </button>
        </div>
      </section>

      <section className="hc-status-grid" aria-label="HumanChain status">
        <div>
          <strong>{streak}d</strong>
          <span>Human streak</span>
        </div>
        <div>
          <strong>{points}</strong>
          <span>Human Points</span>
        </div>
        <div>
          <strong>{passportMetrics.helpfulScore}</strong>
          <span>Trust score</span>
        </div>
      </section>

      <section className="hc-section" aria-label="Main steps">
        <div className="hc-section-head">
          <strong>HumanChain flow</strong>
          <span>Start anywhere</span>
        </div>
        <div className="hc-step-list">
          {coreSteps.map((step) => {
            const Icon = step.icon;
            return (
              <button key={step.title} onClick={() => setTab(step.tab)} type="button">
                <i><Icon size={20} /></i>
                <span>
                  <strong>{step.title}</strong>
                  <small>{step.detail}</small>
                </span>
                <ArrowRight size={16} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="hc-daily-card" aria-label="Daily Human question">
        <div className="hc-section-head">
          <strong>{homeCopy.dailyTitle}</strong>
          <span><Zap size={12} /> +18 HP</span>
        </div>
        <p>{dailyHumanQuestion}</p>
        {dailyAnswered ? (
          <div className="hc-done">
            <CheckCircle2 size={16} />
            <span>Answered {dailyAnsweredAt ?? "today"} - {dailyResponses.length} responses in the chain.</span>
          </div>
        ) : (
          <>
            <textarea
              onChange={(e) => setDailyDraft(e.target.value)}
              placeholder={homeCopy.dailyPlaceholder}
              rows={3}
              value={dailyDraft}
            />
            <button onClick={submitDailyAnswer} type="button">{homeCopy.answerDaily}</button>
          </>
        )}
      </section>

      <section className="hc-premium" aria-label="Premium features">
        <div className="hc-section-head">
          <strong>Premium WLD features</strong>
          <span>Value ladder</span>
        </div>
        <div className="hc-premium-list">
          {premiumFeatures.map(([price, title, detail]) => (
            <button
              key={title}
              onClick={() => {
                if (title.includes("Country") || title.includes("Private") || title.includes("Voice") || title.includes("Verdict")) {
                  setTab("ask");
                  return;
                }
                setTab("chains");
              }}
              type="button"
            >
              <b>{price}</b>
              <span>
                <strong>{title}</strong>
                <small>{detail}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="hc-market-card" aria-label="HumanChain Market">
        <div className="hc-market-card-copy">
          <span><Store size={14} /> Human Market</span>
          <strong>Jobs, services, and useful human exchange.</strong>
          <p>Post a verified need, offer a skill, or browse trusted humans with clear WLD actions.</p>
        </div>
        <div className="hc-market-signal-grid">
          {marketSignals.map(([title, detail]) => (
            <div key={title}>
              <strong>{title}</strong>
              <span>{detail}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setTab("market")} type="button">
          Open Human Market <ArrowRight size={13} />
        </button>
      </section>

      <section className="hc-community" aria-label="Community spotlight">
        <div>
          <span>Community today</span>
          <strong>{communitySpotlight.name}</strong>
          <p>{communitySpotlight.detail}</p>
        </div>
        <button
          onClick={() => {
            setActiveField(communitySpotlight);
            setTab("chains");
          }}
          type="button"
        >
          Join <ArrowRight size={13} />
        </button>
        <div className="hc-community-stats">
          <span><Users size={13} />{communitySpotlight.members}</span>
          <span><Globe2 size={13} />Verified humans</span>
          <span><Star size={13} />Live today</span>
        </div>
      </section>

      <section className="hc-passport-strip" aria-label="Human Passport">
        <ShieldCheck size={20} />
        <div>
          <strong>Human Passport</strong>
          <span>{isVerified ? "World ID verified" : "Preview mode"} - {savedItems} saved - {userPostCount} posts</span>
        </div>
        <button onClick={() => setTab("me")} type="button">Open</button>
      </section>

      <button className="hc-story-link" onClick={() => setTab("stories")} type="button">
        <BookOpen size={18} />
        Read this month&apos;s Human Story
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
