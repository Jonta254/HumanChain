"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import {
  BadgeCheck,
  Bell,
  BookOpen,
  CheckCircle2,
  MessageCircleQuestion,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
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
  const [aiGuideOpen, setAiGuideOpen] = useState(false);
  const homeCopy = appLanguage.home;
  const navCopy = appLanguage.nav;
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
  const trendingWisdom =
    dailyResponses[0]?.text ||
    liveChainLinks[0]?.text ||
    "No live wisdom yet. Add the first honest answer, moment, or link today.";
  const topMarketItem = liveMarketListings[0];
  const topMoment = liveMomentPosts[0];
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
          <span>{homeCopy.heroKicker}</span>
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
          <span>{navCopy.ask}</span>
          {dailyResponses.length > 0 && <b className="v7-nav-btn-badge">{dailyResponses.length}</b>}
        </button>
        <button onClick={() => setTab("chains")} type="button">
          <Sparkles size={22} />
          <span>{navCopy.chains}</span>
          {liveMomentPosts.length > 0 && <b className="v7-nav-btn-badge">{liveMomentPosts.length}</b>}
        </button>
        <button onClick={() => setTab("market")} type="button">
          <Store size={22} />
          <span>{navCopy.market}</span>
          {liveMarketListings.length > 0 && <b className="v7-nav-btn-badge">{liveMarketListings.length}</b>}
        </button>
        <button onClick={() => setTab("stories")} type="button">
          <BookOpen size={22} />
          <span>{navCopy.stories}</span>
        </button>
      </section>

      <section className="home-daily-question" aria-label="Daily question">
        <div className="home-section-header">
          <strong>{homeCopy.dailyTitle}</strong>
          <span className="home-daily-reward">+18 HP</span>
        </div>
        <p className="home-daily-q-text">{dailyHumanQuestion.title}</p>
        {dailyAnswered ? (
          <div className="home-daily-answered">
            <CheckCircle2 size={16} />
            <span>{homeCopy.answeredAt} {dailyAnsweredAt ?? "today"} — {homeCopy.answeredToday}.</span>
          </div>
        ) : (
          <>
            <textarea
              className="home-daily-textarea"
              onChange={(event) => setDailyDraft(event.target.value)}
              placeholder={homeCopy.dailyPlaceholder}
              rows={3}
              value={dailyDraft}
            />
            <button
              className="home-daily-submit"
              disabled={dailyAnswered}
              onClick={submitDailyAnswer}
              type="button"
            >
              {homeCopy.answerDaily}
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
          <strong>{homeCopy.pointsKicker}</strong>
          <span>{homeCopy.commandTitle}</span>
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
          <strong>{homeCopy.trendingTitle}</strong>
          <span>{homeCopy.streakKicker}</span>
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
        onClick={() => setAiGuideOpen(true)}
        type="button"
      >
        <Sparkles size={18} />
      </button>

      {aiGuideOpen ? (
        <AIGuideSheet
          chainScore={chainScore}
          onClose={() => setAiGuideOpen(false)}
          points={points}
          streak={streak}
        />
      ) : null}


<section className="home-secondary-utilities" aria-label="Secondary utilities">
        <button onClick={() => setTab("me")} type="button">
          <BadgeCheck size={17} />
          <span>{navCopy.me}</span>
          <small>{passportMetrics.helpfulScore} helpful score</small>
        </button>
        <button onClick={() => setTab("stories")} type="button">
          <BookOpen size={17} />
          <span>{navCopy.stories}</span>
          <small>{savedItems} saved items</small>
        </button>
      </section>
    </div>
  );
}
