"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import {
  BadgeCheck,
  Bell,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Compass,
  MessageCircleQuestion,
  Radio,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Tag,
  UserRound,
  Users,
  Vote,
} from "lucide-react";
import { getWorldMiniAppContext } from "@/lib/worldMiniApp";
import { type AppLanguage } from "@/lib/data/languages";
import {
  formatShortTime,
  getLocalDateKey,
  getPrimaryProfileImage,
  getShortText,
  getTrustPassportMetrics,
  getWorldDisplayUsername,
  isVerifiedWorldHuman,
  requireVerifiedPublicAction,
} from "@/lib/humanchain/utils";
import { Meter } from "@/components/ui/Meter";
import { ActionButton } from "@/components/ui/ActionButton";
import type { Tab, EarnPoints } from "@/types/ui";
import type { VerifiedHuman } from "@/types/user";
import type { HumanPost, DailyResponse } from "@/types/content";
import type { MarketplaceListing } from "@/types/market";
import type { ChainLink } from "@/types/chain";
import type { HistoryRecord } from "@/types/reputation";

// ---------------------------------------------------------------------------
// Local helpers and data (only used by HomeView)
// ---------------------------------------------------------------------------

const chainLinkHandleBySource: Record<string, string> = {
  Brazil: "@joy_survives",
  Business: "@builder_ama",
  Canada: "@quiet_courage",
  Care: "@care_voice",
  Culture: "@culture_keeper",
  Discipline: "@future_self",
  Faith: "@faith_link",
  Family: "@family_room",
  Ghana: "@goodname_ghana",
  Health: "@healing_chain",
  HumanChain: "@humanchain",
  Identity: "@seen_human",
  India: "@discipline_daily",
  Japan: "@quiet_words",
  Kenya: "@mara_chain",
  Love: "@love_practice",
  Mexico: "@workbench_mx",
  Money: "@money_room",
  Philippines: "@care_bridge",
  Portugal: "@slow_light",
  Prayer: "@prayer_link",
  Purpose: "@purpose_field",
  "South Africa": "@ubuntu_builder",
  Wisdom: "@wisdom_vault",
  Work: "@craft_human",
  World: "@world_human",
  Youth: "@youth_signal",
};

function getChainLinkAuthor(link: ChainLink, fallback = "@verified_human") {
  if (link.country.startsWith("@")) {
    return link.country;
  }

  return chainLinkHandleBySource[link.country] ?? fallback;
}

const chainFields = [
  {
    name: "Faith & Prayer",
    members: "18.4k",
    mood: "hope",
    detail: "Christians, Hindus, Muslims, Rastafari, and spiritual humans sharing daily strength.",
  },
  {
    name: "Builders & Money",
    members: "31.2k",
    mood: "ambition",
    detail: "Business ideas, WLD use, startup truth, and small wins from verified humans.",
  },
  {
    name: "Love & Family",
    members: "27.8k",
    mood: "care",
    detail: "Relationship wisdom, family repair, parenting, loneliness, and forgiveness.",
  },
  {
    name: "Culture Rooms",
    members: "44.1k",
    mood: "belonging",
    detail: "Language, food, music, migration, identity, and human customs across countries.",
  },
  {
    name: "Health & Healing",
    members: "22.6k",
    mood: "recovery",
    detail: "Daily strength, mental health, caregiving, body changes, and honest survival notes.",
  },
  {
    name: "Migration & Home",
    members: "16.9k",
    mood: "memory",
    detail: "Humans between countries sharing documents, loneliness, hope, work, and belonging.",
  },
  {
    name: "Youth & Future",
    members: "39.7k",
    mood: "future",
    detail: "Young humans asking about skills, identity, ambition, school, pressure, and purpose.",
  },
  {
    name: "Parents & Children",
    members: "20.5k",
    mood: "care",
    detail: "Real lessons from parents, guardians, children, teachers, and family builders.",
  },
];

type ChainField = (typeof chainFields)[number];

const dailyHumanQuestion = {
  title: "What truth did life teach you this week?",
  detail: "Every verified human can answer once. Best answers become tomorrow's World Verdict.",
  reward: "+18 HP",
};

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
  const [passportBackOpen, setPassportBackOpen] = useState(false);
  const homeCopy = appLanguage.home;
  const worldHandle = getWorldDisplayUsername(worldContext, verifiedHuman);
  const primaryProfileImage = getPrimaryProfileImage(profileImage, verifiedHuman, worldContext);
  const userPostCount = humanPosts.filter((post) => post.owner).length;
  const liveMomentPosts = humanPosts.filter(
    (post) => Boolean(post.image) && (post.owner || post.storageStatus === "cloud-safe"),
  );
  const liveChainLinks = links.filter((link) => Boolean(link.owner || link.id || link.pinned));
  const liveMarketListings = marketplaceListings.filter(
    (listing) => listing.dataStorageStatus === "cloud-safe" || listing.seller === worldHandle,
  );
  const chainScore = Math.max(
    151,
    Math.round(points / 4) + streak * 7 + userPostCount * 12 + savedItems * 5,
  );
  const missionItems = [
    { complete: dailyAnswered, label: "Answer today's question" },
    { complete: dailyResponses.length > 0, label: "Read human answers" },
    { complete: userPostCount > 0, label: "Post one real moment" },
  ];
  const missionCompleted = missionItems.filter((item) => item.complete).length;
  const trendingWisdom =
    dailyResponses[0]?.text ||
    liveChainLinks[0]?.text ||
    "No live wisdom yet. Add the first honest answer, moment, or link today.";
  const liveVerdicts = [
    {
      question: dailyHumanQuestion.title,
      result: `${dailyResponses.length} live answers recorded today`,
      truth: trendingWisdom,
    },
  ];
  const topMarketItem = liveMarketListings[0];
  const topMoment = liveMomentPosts[0];
  const homeHighlights = [
    {
      detail: topMarketItem
        ? "Fresh verified listing with chat-first trade and visible trust signals."
        : "No live listing yet. Publish or browse the market to start real trade.",
      icon: <Store size={18} />,
      label: topMarketItem ? "Trending market" : "Market ready",
      meta: "Open Market",
      onClick: () => setTab("market"),
      title: topMarketItem?.title ?? "Waiting for first live listing",
      tone: "market",
    },
    {
      detail: trendingWisdom,
      icon: <MessageCircleQuestion size={18} />,
      label: "Best asked",
      meta: dailyResponses.length ? `${dailyResponses.length} live answers` : "Waiting for answers",
      onClick: () => setTab("ask"),
      title: dailyHumanQuestion.title,
      tone: "ask",
    },
    {
      detail: topMoment?.caption ?? "No live moment yet. Be the first verified human to post today.",
      icon: <Sparkles size={18} />,
      label: topMoment ? "Live moment" : "Moment ready",
      meta: "Open Moments",
      onClick: () => setTab("chains"),
      title: topMoment?.author ?? "Post the first real moment",
      tone: "chains",
    },
    {
      detail: "Monthly reflections, short stories, and file stories from verified humans.",
      icon: <BookOpen size={18} />,
      label: "Story pick",
      meta: "Open Stories",
      onClick: () => setTab("stories"),
      title: "Human Story Library",
      tone: "stories",
    },
  ];
  const forYouActions = [
    {
      detail: dailyAnswered ? "Your answer is saved for today." : "+18 HP",
      icon: <MessageCircleQuestion size={18} />,
      label: "Answer today",
      onClick: submitDailyAnswer,
      status: dailyAnswered ? "Done" : "Open",
    },
    {
      detail: "Share a recent real moment.",
      icon: <Sparkles size={18} />,
      label: "Post moment",
      onClick: () => setTab("chains"),
      status: `${liveMomentPosts.length} live`,
    },
    {
      detail: topMarketItem?.title ?? "No live listing yet. Open Market to publish or browse.",
      icon: <Store size={18} />,
      label: "Check market",
      onClick: () => setTab("market"),
      status: "Trust-first",
    },
    {
      detail: "Read calm, useful human reflections.",
      icon: <BookOpen size={18} />,
      label: "Read story",
      onClick: () => setTab("stories"),
      status: "Library",
    },
  ];
  const levelUpSteps = [
    { icon: <CalendarCheck size={17} />, label: "Check in", value: `${streak}d` },
    { icon: <MessageCircleQuestion size={17} />, label: "Answer", value: "+18 HP" },
    { icon: <Sparkles size={17} />, label: "Post", value: "Real moment" },
    { icon: <Star size={17} />, label: "Save", value: "Wisdom" },
    { icon: <ShieldCheck size={17} />, label: "Trade", value: "Safely" },
  ];
  const profileInitial =
    worldHandle.replace(/^@/, "").trim().charAt(0).toUpperCase() || "H";
  const passportMetrics = getTrustPassportMetrics({
    completedTrades: marketplaceListings.filter((listing) => listing.status === "payment-ready").length,
    human: verifiedHuman,
    points,
    posts: userPostCount,
    savedItems,
    streak,
  });
  const homeProof = [
    { label: "Verified people", value: passportMetrics.identityTier },
    { label: "Comments", value: "Sheet view" },
    { label: "Market", value: "Chat first" },
    { label: "Payments", value: "World verified" },
  ];
  const askPreview = {
    answers: dailyResponses.length,
    question: dailyHumanQuestion.title,
    topAnswer: trendingWisdom,
  };
  const momentPreview = topMoment ?? liveMomentPosts[0] ?? humanPosts.find((post) => Boolean(post.image));
  const marketPreview = topMarketItem ?? marketplaceListings[0];
  const marketPreviewInfo = marketPreview ? {
    area: marketPreview.area,
    image: marketPreview.photos[0]?.src ?? "",
    price: marketPreview.price,
    seller: marketPreview.seller,
    title: marketPreview.title,
  } : null;
  const nextBestAction = !isVerifiedWorldHuman(verifiedHuman)
    ? {
        detail: "Preview can browse and draft. Public trust actions unlock only after World verification.",
        icon: <ShieldCheck size={20} />,
        label: "Verify Human Passport",
        onClick: () => setTab("me"),
        title: "Unlock public posting, bidding, comments, and listings",
      }
    : !dailyAnswered
      ? {
          detail: "First value should happen in under a minute: answer one real prompt and start your trust record.",
          icon: <MessageCircleQuestion size={20} />,
          label: "Answer today",
          onClick: submitDailyAnswer,
          title: dailyHumanQuestion.title,
        }
      : userPostCount === 0
        ? {
            detail: "Share a recent photo-first proof-of-life moment with report, comment, and reaction controls.",
            icon: <Sparkles size={20} />,
            label: "Post first moment",
            onClick: () => setTab("chains"),
            title: "Add one real moment",
          }
        : liveMarketListings.length === 0
          ? {
              detail: "Create the first safer listing with 3 photos, condition, area, price, and trust proof.",
              icon: <Store size={20} />,
              label: "Complete listing",
              onClick: () => setTab("market"),
              title: "Bring trust to the nearby market",
            }
          : {
              detail: "Read verified-human answers and inspect trust signals before you act.",
              icon: <ShieldCheck size={20} />,
              label: "Open Passport",
              onClick: () => setTab("me"),
              title: "Keep building your trust passport",
            };
  const passportLevel =
    chainScore >= 420 ? "Gold Human" : chainScore >= 240 ? "Silver Human" : "Bronze Human";
  const passportRank = chainScore >= 420 ? "Top 5%" : chainScore >= 240 ? "Top 18%" : "Rising";
  const reputationGrowth = `+${Math.max(1, Math.round(points / 140) + streak)} this week`;
  const safetyStatus =
    passportMetrics.disputeRate === "0%" ? "Clean" : "Review";
  const topBadges = [
    passportMetrics.verification,
    passportLevel,
    streak >= 7 ? "Streak Builder" : "New Builder",
  ];
  const hiddenBadgeCount = Math.max(
    0,
    [
      dailyAnswered,
      dailyResponses.length > 0,
      userPostCount > 0,
      savedItems > 0,
      marketplaceListings.length > 0,
      notificationReady,
    ].filter(Boolean).length + 6 - topBadges.length,
  );
  const opportunities = [
    {
      reward: dailyAnswered ? "Done" : "+18 HP",
      time: "1 min",
      title: dailyAnswered ? "Read one useful answer" : "Answer 1 community question",
      onClick: dailyAnswered ? () => setTab("ask") : submitDailyAnswer,
    },
    {
      reward: "+10 HP",
      time: "2 min",
      title: userPostCount ? "Add another proof moment" : "Share one real moment",
      onClick: () => setTab("chains"),
    },
    {
      reward: "Trust",
      time: "3 min",
      title: liveMarketListings.length ? "Inspect nearby market" : "Create first listing",
      onClick: () => setTab("market"),
    },
  ];
  const trendingHumans = [
    { handle: worldHandle, score: chainScore, initial: profileInitial },
    { handle: dailyResponses[0]?.user ?? "@answer_builder", score: Math.max(120, chainScore - 18), initial: (dailyResponses[0]?.user ?? "A").replace(/^@/, "").charAt(0).toUpperCase() },
    { handle: topMoment?.author ?? "@moment_keeper", score: Math.max(110, chainScore - 26), initial: (topMoment?.author ?? "M").replace(/^@/, "").charAt(0).toUpperCase() },
    { handle: topMarketItem?.seller ?? "@trusted_seller", score: Math.max(104, chainScore - 32), initial: (topMarketItem?.seller ?? "T").replace(/^@/, "").charAt(0).toUpperCase() },
    { handle: liveChainLinks[0] ? getChainLinkAuthor(liveChainLinks[0], worldHandle) : "@wisdom_saver", score: Math.max(98, chainScore - 39), initial: (liveChainLinks[0] ? getChainLinkAuthor(liveChainLinks[0], worldHandle) : "W").replace(/^@/, "").charAt(0).toUpperCase() },
  ].slice(0, 5);
  const communitySpotlight = chainFields[(new Date().getDate() - 1) % chainFields.length];
  const marketPreviewItems = (liveMarketListings.length ? liveMarketListings : marketplaceListings).slice(0, 3);

  function submitDailyAnswer() {
    if (!requireVerifiedPublicAction(verifiedHuman, act, "answering today's question")) {
      return;
    }

    if (dailyAnswered) {
      act("Already answered", "Come back tomorrow for a new global question.");
      return;
    }

    setDailyAnswered(true);
    const now = new Date();
    const time = formatShortTime(now);
    setDailyAnsweredAt(time);
    setDailyAnsweredDate(getLocalDateKey(now));
    setDailyResponses((current) => [
      {
        user: verifiedHuman?.username ?? "@human",
        text:
          dailyDraft.trim() ||
          "Life taught me that a real answer can carry another human.",
        time,
      },
      ...current,
    ]);
    recordHistory({
      title: "Daily Human answer",
      detail: dailyDraft.trim() || "Answered today's HumanChain question.",
      kind: "post",
    });
    earnPoints(18, "Your Daily Human answer entered today's global verdict.");
  }

  return (
    <div className="screen home-dashboard v7-home">
      <header className="human-home-topbar">
        <button
          aria-label="Open Human Passport"
          className="human-home-avatar"
          onClick={() => setTab("me")}
          type="button"
        >
          {primaryProfileImage ? (
            <img alt="" src={primaryProfileImage} />
          ) : (
            profileInitial
          )}
        </button>
        <div className="human-home-topcopy">
          <strong>{worldHandle}</strong>
          <span>Ask, post, read, and trade with verified trust</span>
        </div>
        <button
          aria-label={notificationReady ? "Open notification center" : "Enable HumanChain notifications"}
          className={`hero-bell-button compact ${notificationUnreadCount > 0 ? "has-dot" : ""}`}
          onClick={notificationReady ? onOpenNotifications : onEnableNotifications}
          type="button"
        >
          <Bell size={18} />
        </button>
        <button
          aria-label="Open settings and guide"
          className="home-guide-button"
          onClick={() => setTab("settings")}
          type="button"
        >
          <Settings size={18} />
        </button>
      </header>

      <button
        aria-expanded={passportBackOpen}
        className={`v7-digital-card ${passportBackOpen ? "show-back" : ""}`}
        onClick={() => setPassportBackOpen((current) => !current)}
        type="button"
      >
        {!passportBackOpen ? (
          <>
            <span className="v7-section-label">Digital card</span>
            <div className="v7-card-avatar">
              {primaryProfileImage ? <img alt="" src={primaryProfileImage} /> : profileInitial}
            </div>
            <strong>{worldHandle}</strong>
            <small>{verifiedHuman?.wallet ? `HC-${verifiedHuman.wallet.slice(2, 8).toUpperCase()}` : "HC-PREVIEW"}</small>
            <b>{chainScore}</b>
            <span>{passportLevel}</span>
            <div className="v7-badge-row">
              {topBadges.map((badge) => <i key={badge}>{badge}</i>)}
              {hiddenBadgeCount ? <i>+{hiddenBadgeCount} More</i> : null}
            </div>
            {isVerifiedWorldHuman(verifiedHuman) && (
              <span className="v7-card-verified-chip">
                <BadgeCheck size={12} />
                World ID Verified
              </span>
            )}
          </>
        ) : (
          <>
            <span className="v7-section-label">Card back</span>
            <dl className="v7-card-back">
              <div><dt>Join date</dt><dd>{passportMetrics.tenure}</dd></div>
              <div><dt>Communities</dt><dd>{chainFields.length}</dd></div>
              <div><dt>Achievements</dt><dd>{topBadges.length + hiddenBadgeCount}</dd></div>
              <div><dt>Transactions</dt><dd>{marketplaceListings.length}</dd></div>
              <div><dt>Contribution</dt><dd>{points.toLocaleString()} HP</dd></div>
              <div><dt>Safety</dt><dd>{safetyStatus}</dd></div>
              <div><dt>History</dt><dd>{reputationGrowth}</dd></div>
            </dl>
          </>
        )}
      </button>

      <section className="v7-command-center" aria-label="Your next step">
        <span className="v7-section-label">Your Next Step</span>
        <div>
          {nextBestAction.icon}
          <strong>{nextBestAction.title}</strong>
          <p>{nextBestAction.detail}</p>
        </div>
        <button onClick={nextBestAction.onClick} type="button">{nextBestAction.label}</button>
      </section>

      <section className="v7-quick-nav-grid" aria-label="Quick navigation">
        <button onClick={() => setTab("ask")} type="button">
          <MessageCircleQuestion size={22} />
          <span>Ask</span>
          {dailyResponses.length > 0 && <b className="v7-nav-btn-badge">{dailyResponses.length}</b>}
        </button>
        <button onClick={() => setTab("chains")} type="button">
          <Sparkles size={22} />
          <span>Moments</span>
          {liveMomentPosts.length > 0 && <b className="v7-nav-btn-badge">{liveMomentPosts.length}</b>}
        </button>
        <button onClick={() => setTab("market")} type="button">
          <Store size={22} />
          <span>Market</span>
          {liveMarketListings.length > 0 && <b className="v7-nav-btn-badge">{liveMarketListings.length}</b>}
        </button>
        <button onClick={() => setTab("stories")} type="button">
          <BookOpen size={22} />
          <span>Stories</span>
        </button>
      </section>

      <section className="home-daily-question" aria-label="Daily question">
        <div className="home-section-header">
          <strong>Today&apos;s Question</strong>
          <span className="home-daily-reward">+18 HP</span>
        </div>
        <p className="home-daily-q-text">{dailyHumanQuestion.title}</p>
        {dailyAnswered ? (
          <div className="home-daily-answered">
            <CheckCircle2 size={16} />
            <span>Answered at {dailyAnsweredAt ?? "today"} — come back tomorrow for a new question.</span>
          </div>
        ) : (
          <>
            <textarea
              className="home-daily-textarea"
              onChange={(event) => setDailyDraft(event.target.value)}
              placeholder="Share your honest answer…"
              rows={3}
              value={dailyDraft}
            />
            <button
              className="home-daily-submit"
              disabled={dailyAnswered}
              onClick={submitDailyAnswer}
              type="button"
            >
              Submit Answer
            </button>
          </>
        )}
      </section>

      <section className="v7-score-reputation" aria-label="Score and reputation">
        <div className="v7-score-reputation-score">
          <span className="v7-section-label">Human Score</span>
          <strong>{chainScore}</strong>
          <small>{passportRank}</small>
        </div>
        <div className="v7-score-reputation-streak">
          <span className="v7-section-label">Streak</span>
          <strong>{streak}d</strong>
          <small>Keep going</small>
        </div>
        <div className="v7-score-reputation-growth">
          <span className="v7-section-label">Growth</span>
          <strong>{reputationGrowth}</strong>
          <small>This week</small>
        </div>
        <div className="v7-score-reputation-safety">
          <span className="v7-section-label">Safety</span>
          <strong>{safetyStatus}</strong>
          <small>{safetyStatus === "Clean" ? "No warnings" : "Review center"}</small>
        </div>
      </section>

      <section className="v7-opportunities" aria-label="Opportunities">
        <div className="home-section-header">
          <strong>Opportunities</strong>
          <span>Earn HP</span>
        </div>
        {opportunities.map((item) => (
          <button key={item.title} onClick={item.onClick} type="button">
            <strong>{item.title}</strong>
            <span>{item.reward}</span>
            <small>{item.time}</small>
          </button>
        ))}
      </section>

      <section className="v7-live-network" aria-label="Live network">
        <span className="v7-section-label">Live Network</span>
        <div>
          <span className="live-pulse-dot" />
          <b>{dailyResponses.length + liveMomentPosts.length + liveMarketListings.length}</b>
          <span>Active Humans</span>
        </div>
        <div>
          <b>{communitySpotlight.name}</b>
          <span>Top Community</span>
        </div>
        <div>
          <b>{dailyHumanQuestion.title}</b>
          <span>Trending Topic</span>
        </div>
      </section>

      <section className="v7-trending-humans" aria-label="Trending humans">
        <div className="home-section-header">
          <strong>Trending Humans</strong>
          <span>This week</span>
        </div>
        <div>
          {trendingHumans.map((human) => (
            <button key={human.handle} onClick={() => setTab("me")} type="button">
              <i>{human.initial}</i>
              <strong>{human.handle}</strong>
              <span>{human.score}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="v7-community-spotlight" aria-label="Community spotlight">
        <span className="v7-section-label">Community Spotlight</span>
        <strong>{communitySpotlight.name}</strong>
        <p>{communitySpotlight.detail}</p>
        <button
          onClick={() => {
            setActiveField(communitySpotlight);
            setTab("chains");
          }}
          type="button"
        >
          Open community
        </button>
      </section>

      <section className="v7-market-preview" aria-label="Market preview">
        <div className="home-section-header">
          <strong>Market Preview</strong>
          <span>Trust-first</span>
        </div>
        {marketPreviewItems.length ? marketPreviewItems.map((listing) => (
          <button key={listing.id} onClick={() => setTab("market")} type="button">
            {listing.photos[0] ? <img alt={listing.photos[0].name} src={listing.photos[0].src} /> : <Tag size={18} />}
            <div>
              <strong>{listing.title}</strong>
              <span>{listing.price}</span>
              <small>{listing.seller} - Score {chainScore}</small>
            </div>
          </button>
        )) : (
          <button onClick={() => setTab("market")} type="button">
            <Store size={18} />
            <div>
              <strong>Create your first listing</strong>
              <span>Sell Item</span>
              <small>No listings yet</small>
            </div>
          </button>
        )}
      </section>

      <button
        className="v7-ai-assistant"
        onClick={() => act("AI Assistant", "Reputation Coach, Marketplace Guide, World Guide, Community Guide, and Safety Assistant are ready from this command button.")}
        type="button"
      >
        <Sparkles size={18} />
      </button>

      <section className="home-live-section home-legacy-section" hidden aria-label="Live on HumanChain">
        <div className="section-heading">
          <span>Live network</span>
          <Radio size={18} />
        </div>

        <article className="home-preview-row ask-preview">
          <div>
            <span>Ask</span>
            <strong>{askPreview.question}</strong>
            <p>{getShortText(askPreview.topAnswer, 94)}</p>
            <small>{askPreview.answers} answers today</small>
          </div>
          <button onClick={() => setTab("ask")} type="button">
            Answer
          </button>
        </article>

        <article className="home-preview-row moment-preview">
          {momentPreview?.image ? (
            <img alt={momentPreview.caption} src={momentPreview.image} />
          ) : (
            <div className="home-preview-icon">
              <Sparkles size={19} />
            </div>
          )}
          <div>
            <span>Moment</span>
            <strong>{momentPreview?.author ?? "Post a real moment"}</strong>
            <p>{getShortText(momentPreview?.caption ?? "No live moment yet. Add the first recent photo from a verified human.", 96)}</p>
            <small>{momentPreview ? `${momentPreview.loves} loves - ${momentPreview.comments.length} comments` : "Photo-first feed"}</small>
          </div>
          <button onClick={() => setTab("chains")} type="button">
            View
          </button>
        </article>

        <article className="home-preview-row market-preview">
          {marketPreviewInfo?.image ? (
            <img alt={marketPreviewInfo.title} src={marketPreviewInfo.image} />
          ) : (
            <div className="home-preview-icon">
              <Store size={19} />
            </div>
          )}
          <div>
            <span>Market</span>
            <strong>{marketPreviewInfo?.title ?? "Browse nearby listings"}</strong>
            <p>
              {marketPreviewInfo
                ? `${marketPreviewInfo.price} by ${marketPreviewInfo.seller} in ${marketPreviewInfo.area}`
                : "Clear item cards, real photos, seller chat, and inspect-before-pay cues."}
            </p>
            <small>Verified seller - chat first</small>
          </div>
          <button onClick={() => setTab("market")} type="button">
            Browse
          </button>
        </article>
      </section>

      <section className="home-secondary-utilities" aria-label="Secondary utilities">
        <button onClick={() => setTab("me")} type="button">
          <BadgeCheck size={17} />
          <span>View full passport</span>
          <small>{passportMetrics.helpfulScore} helpful score</small>
        </button>
        <button onClick={() => setTab("stories")} type="button">
          <BookOpen size={17} />
          <span>Read human stories</span>
          <small>{savedItems} saved items</small>
        </button>
      </section>
    </div>
  );

  return (
    <div className="screen">
      <header className="human-home-topbar">
        <button
          aria-label="Open Human Passport"
          className="human-home-avatar"
          onClick={() => setTab("me")}
          type="button"
        >
          {worldContext.profilePictureUrl ? (
            <img alt="" src={worldContext.profilePictureUrl} />
          ) : (
            profileInitial
          )}
        </button>
        <div className="human-home-topcopy">
          <strong>HumanChain</strong>
          <span>{worldHandle}</span>
        </div>
        <button
          aria-label={notificationReady ? "Open notification center" : "Enable HumanChain notifications"}
          className={`hero-bell-button compact ${notificationUnreadCount > 0 ? "has-dot" : ""}`}
          onClick={notificationReady ? onOpenNotifications : onEnableNotifications}
          type="button"
        >
          <Bell size={18} />
        </button>
        <button
          aria-label="Open HumanChain guide"
          className="home-guide-button"
          onClick={() => act("HumanChain guide", "Start with Ask, Moments, and Market. Your Human Passport stays available from the top-left profile button.")}
          type="button"
        >
          <Compass size={18} />
        </button>
      </header>

      <section className="human-home-identity">
        <div className="home-brand-row">
          <img alt="HumanChain logo" src="/images/humanchain-logo.png" />
          <div>
            <span>Verified human network</span>
            <strong>HumanChain</strong>
          </div>
        </div>
        <h1>Real humans. Real wisdom. Real trust.</h1>
        <p>Ask verified humans, share real stories, build your chain, and trade safely inside World App.</p>
        <div className="home-proof-strip">
          {homeProof.map((proof) => (
            <span key={proof.label}>
              <strong>{proof.label}</strong>
              {proof.value}
            </span>
          ))}
        </div>
        <div className="human-trust-grid">
          <button onClick={() => setTab("me")} type="button">
            <strong>{chainScore}</strong>
            <span>Human Score</span>
          </button>
          <button onClick={() => setTab("me")} type="button">
            <strong>{points.toLocaleString()}</strong>
            <span>HP contribution</span>
          </button>
          <button onClick={() => setTab("me")} type="button">
            <strong>{streak}d</strong>
            <span>Streak</span>
          </button>
          <button onClick={() => setTab("chains")} type="button">
            <strong>{userPostCount}</strong>
            <span>Moments</span>
          </button>
        </div>
      </section>

      <section className="next-best-action-card">
        <div>
          <span className="section-kicker">Next best action</span>
          <h2>{nextBestAction.title}</h2>
          <p>{nextBestAction.detail}</p>
        </div>
        <button onClick={nextBestAction.onClick} type="button">
          {nextBestAction.icon}
          {nextBestAction.label}
        </button>
      </section>

      <section className="passport-summary-card">
        <div className="section-heading">
          <span>Human Passport</span>
          <BadgeCheck size={18} />
        </div>
        <p>{passportMetrics.verification}. {passportMetrics.identityTier}. Moderation state: {passportMetrics.moderationState}.</p>
        <div className="passport-metrics">
          <b>{passportMetrics.tenure}<small>Tenure</small></b>
          <b>{passportMetrics.streak}d<small>Streak</small></b>
          <b>{passportMetrics.helpfulScore}<small>Helpful</small></b>
          <b>{passportMetrics.completedTrades}<small>Trades</small></b>
          <b>{passportMetrics.disputeRate}<small>Disputes</small></b>
        </div>
        <button onClick={() => setTab("me")} type="button">
          View full passport
        </button>
      </section>

      <section className="human-service-grid professional" aria-label="HumanChain services">
        <ActionButton
          icon={<MessageCircleQuestion size={19} />}
          label="Ask"
          detail="Verified answers"
          onClick={() => setTab("ask")}
          tone="ask"
        />
        <ActionButton
          icon={<Sparkles size={19} />}
          label="Moments"
          detail="Recent moment"
          onClick={() => setTab("chains")}
          tone="chains"
        />
        <ActionButton
          icon={<Store size={19} />}
          label="Market"
          detail="Safe trade"
          onClick={() => setTab("market")}
          tone="market"
        />
        <ActionButton
          icon={<BookOpen size={19} />}
          label="Stories"
          detail="Human library"
          onClick={() => setTab("stories")}
          tone="stories"
        />
        <ActionButton
          icon={<UserRound size={19} />}
          label="Passport"
          detail="Your trust"
          onClick={() => setTab("me")}
          tone="ask"
        />
        <ActionButton
          icon={<Compass size={19} />}
          label="Guide"
          detail="How it works"
          onClick={() => act("HumanChain guide", "Ask verified humans, post useful moments, trade safely, read stories from Home, and build your Human Passport.")}
          tone="market"
        />
      </section>

      <section className="mission-card">
        <div className="section-heading">
          <span>Today&apos;s Human Mission</span>
          <CalendarCheck size={18} />
        </div>
        <h2>Complete one meaningful action today and keep your chain alive.</h2>
        <div className="mission-progress">
          <strong>{missionCompleted}/3 completed</strong>
          <i style={{ width: `${(missionCompleted / 3) * 100}%` }} />
        </div>
        <div className="mission-list">
          {missionItems.map((item) => (
            <span className={item.complete ? "complete" : ""} key={item.label}>
              <CheckCircle2 size={15} />
              {item.label}
            </span>
          ))}
        </div>
        <small>Complete mission: +25 HP</small>
        <div className="mission-actions">
          <button onClick={submitDailyAnswer} type="button">
            Answer Daily
          </button>
          <button onClick={() => setTab("ask")} type="button">
            Read Answers
          </button>
          <button onClick={() => setTab("chains")} type="button">
            Post Moment
          </button>
        </div>
      </section>

      <section className="home-for-you">
        <div className="section-heading">
          <span>For You</span>
          <Sparkles size={18} />
        </div>
        <div className="home-for-you-grid">
          {forYouActions.map((action) => (
            <button
              className="home-for-you-card"
              key={action.label}
              onClick={action.onClick}
              type="button"
            >
              <i>{action.icon}</i>
              <strong>{action.label}</strong>
              <span>{action.detail}</span>
              <b>{action.status}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="home-trending-rail">
        <div className="section-heading">
          <span>Trending Now</span>
          <Radio size={18} />
        </div>
        <div className="home-trending-scroll">
          {homeHighlights.map((highlight) => (
            <button
              className={`home-trending-card ${highlight.tone}`}
              key={highlight.label}
              onClick={highlight.onClick}
              type="button"
            >
              <span>
                {highlight.icon}
                {highlight.label}
              </span>
              <strong>{highlight.title}</strong>
              <small>{highlight.detail}</small>
              <b>{highlight.meta}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="home-level-card">
        <div className="section-heading">
          <span>Level Up Your Chain</span>
          <ShieldCheck size={18} />
        </div>
        <div className="home-level-scroll">
          {levelUpSteps.map((step) => (
            <button
              key={step.label}
              onClick={() => {
                if (step.label === "Check in") setTab("me");
                if (step.label === "Answer") setTab("ask");
                if (step.label === "Post") setTab("chains");
                if (step.label === "Save") act("Saved wisdom", "Save useful answers and stories to grow your Human Passport.");
                if (step.label === "Trade") setTab("market");
              }}
              type="button"
            >
              {step.icon}
              <strong>{step.label}</strong>
              <span>{step.value}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="pulse-card compact">
        <div>
          <span className="section-kicker">Live Human Pulse</span>
          <h2>Today on HumanChain</h2>
        </div>
        <div className="pulse-stat-grid">
          <b>{dailyResponses.length}<small>Answers today</small></b>
          <b>{liveChainLinks.length}<small>Chain links</small></b>
          <b>{savedItems}<small>Saved items</small></b>
          <b>{liveMarketListings.length}<small>Market listings</small></b>
        </div>
      </section>

      <section className="daily-card home-legacy-section" hidden>
        <div className="section-heading">
          <span>{homeCopy.dailyTitle}</span>
          <CalendarCheck size={18} />
        </div>
        <span className="daily-reward">{dailyHumanQuestion.reward}</span>
        <h2>{dailyHumanQuestion.title}</h2>
        <p>{dailyHumanQuestion.detail}</p>
        <textarea
          disabled={dailyAnswered}
          onChange={(event) => setDailyDraft(event.target.value)}
          placeholder={homeCopy.dailyPlaceholder}
          value={
            dailyAnswered
              ? `${homeCopy.answeredAt} ${dailyAnsweredAt ?? "today"}`
              : dailyDraft
          }
        />
        <div className="daily-actions">
          <button
            disabled={dailyAnswered}
            onClick={() => {
              if (dailyAnswered) {
                act("Already answered", "Come back tomorrow for a new global question.");
                return;
              }

              setDailyAnswered(true);
              const now = new Date();
              const time = formatShortTime(now);
              setDailyAnsweredAt(time);
              setDailyAnsweredDate(getLocalDateKey(now));
              setDailyResponses((current) => [
                {
                  user: verifiedHuman?.username ?? "@human",
                  text:
                    dailyDraft.trim() ||
                    "Life taught me that a real answer can carry another human.",
                  time,
                },
                ...current,
              ]);
              recordHistory({
                title: "Daily Human answer",
                detail: dailyDraft.trim() || "Answered today's HumanChain question.",
                kind: "post",
              });
              earnPoints(18, "Your Daily Human answer entered today's global verdict.");
            }}
            type="button"
          >
            {dailyAnswered ? homeCopy.answeredToday : homeCopy.answerDaily}
          </button>
          <button onClick={() => setTab("ask")} type="button">
            {homeCopy.seeAnswers}
          </button>
        </div>
        <div className="daily-live">
          {dailyResponses.slice(0, 3).map((response) => (
            <article key={`${response.user}-${response.time}`}>
              <span>{response.user} · {response.time}</span>
              <p>{response.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel home-legacy-section" hidden>
        <div className="section-heading">
          <span>{homeCopy.trendingTitle}</span>
          <Vote size={18} />
        </div>
        {liveVerdicts.map((verdict) => (
          <article className="verdict-card" key={verdict.question}>
            <h3>{verdict.question}</h3>
            <p className="verdict-result">{verdict.result}</p>
            <p className="quoted">&ldquo;{verdict.truth}&rdquo;</p>
            <button
              className="mini-command"
              onClick={() =>
                act("Verdict saved", "This wisdom was added to your library.")
              }
              type="button"
            >
              {homeCopy.saveVerdict}
            </button>
          </article>
        ))}
      </section>

      <section className="panel home-legacy-section" hidden>
        <div className="section-heading">
          <span>{homeCopy.fieldsTitle}</span>
          <Users size={18} />
        </div>
        <div className="field-strip">
          {chainFields.map((field) => (
            <button
              key={field.name}
              onClick={() => {
                setActiveField(field);
                setTab("chains");
              }}
              type="button"
            >
              <strong>{field.name}</strong>
              <span>{homeCopy.openQuoteRoom}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="pulse-card home-legacy-section" hidden>
        <div>
          <span className="section-kicker">{homeCopy.pulseKicker}</span>
          <h2>{homeCopy.pulseTitle}</h2>
        </div>
        <div className="pulse-bars">
          <Meter label={homeCopy.meters[0]} value={32} />
          <Meter label={homeCopy.meters[1]} value={21} />
          <Meter label={homeCopy.meters[2]} value={18} />
          <Meter label={homeCopy.meters[3]} value={16} />
        </div>
      </section>

    </div>
  );
}
