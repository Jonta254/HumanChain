"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  CalendarCheck,
  ChevronRight,
  Compass,
  Copy,
  Gift,
  Library,
  LockKeyhole,
  Radio,
  Search,
  Share2,
  ShieldCheck,
  Star,
  Mic,
  Store,
  Upload,
} from "lucide-react";
import {
  getNextMilestone,
  getReachedMilestones,
  getReferralLink,
  getTotalReferralHp,
  REFERRAL_BONUS_FOR_REFERRED,
  REFERRAL_HP_PER_SHARE,
  referralMilestones,
} from "@/lib/humanchain/referral";
import {
  Permission,
  requestWorldPermission,
} from "@/lib/world";
import { loadJsonFromStorage, storageKeys } from "@/lib/humanchain/storage";
import {
  getChainScore,
  getLocalDateKey,
  getReputationTier,
  getTrustPassportMetrics,
  getWorldDisplayUsername,
  isVerifiedWorldHuman,
  isWorldUsernamePlaceholder,
} from "@/lib/humanchain/utils";
import { TopBar } from "@/components/layout/TopBar";
import { Stat } from "@/components/ui/Stat";
import type { WorldMiniAppContext } from "@/lib/world/types";
import type { MarketplaceListing, MarketLocationState } from "@/types/market";
import type { HumanPost } from "@/types/content";
import type { HistoryRecord, HpLedgerRecord } from "@/types/reputation";
import type { OpenPayment, EarnPoints, Tab } from "@/types/ui";
import type { VerifiedHuman } from "@/types/user";
import type { ChainLink } from "@/types/chain";

// ---------------------------------------------------------------------------
// Module-level constants and helpers (mirrored from app/page.tsx)
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

function isWorldPermissionGranted(result: unknown) {
  const permissionResult = result as
    | {
        data?: { status?: string };
        executedWith?: string;
      }
    | undefined;

  return (
    permissionResult?.executedWith !== "fallback" &&
    ["success", "already_granted"].includes(permissionResult?.data?.status ?? "")
  );
}

const profileBadges = [
  "Verified human",
  "Chain keeper",
  "Story reader",
  "Answer helper",
  "Market seller",
];

const pointRules = [
  ["Daily check-in", "+10 HP"],
  ["Answer Daily Human", "+18 HP"],
  ["Answer a human", "+15 HP"],
  ["Ask a useful question", "+20 HP"],
  ["Add a chain link", "+12 HP"],
  ["Publish image post", "+16 HP"],
  ["Store marketplace listing", "+10 HP"],
  ["Enable nearby market", "+5 HP"],
  ["React to image post", "+5 HP"],
  ["Enter a field", "+6 HP"],
  ["Copy field quote", "+3 HP"],
  ["Read a story", "+8 HP"],
  ["Give a trusted report", "+10 HP"],
  ["Publish accepted story", "+120 HP"],
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MeView({
  accountSyncStatus,
  act,
  copyReferralLink,
  earnPoints,
  historyRecords,
  hpLedger,
  humanPosts,
  lastCheckInAt,
  lastCheckInDate,
  links,
  marketLocation,
  marketplaceListings,
  onCheckIn,
  openPayment,
  points,
  profileImage,
  recordHistory,
  referralShareCount,
  referredBy,
  savedItems,
  setProfileImage,
  setTab,
  shareReferralLink,
  streak,
  verifiedHuman,
  worldContext,
}: {
  accountSyncStatus: "idle" | "loading" | "ready" | "saving" | "offline";
  act: (title: string, detail: string) => void;
  copyReferralLink: () => Promise<void>;
  earnPoints: EarnPoints;
  historyRecords: HistoryRecord[];
  hpLedger: HpLedgerRecord[];
  humanPosts: HumanPost[];
  lastCheckInAt: string | null;
  lastCheckInDate: string | null;
  links: ChainLink[];
  marketLocation: MarketLocationState;
  marketplaceListings: MarketplaceListing[];
  onCheckIn: () => void;
  openPayment: OpenPayment;
  points: number;
  profileImage: string | null;
  recordHistory: (record: Omit<HistoryRecord, "id" | "time">) => void;
  referralShareCount: number;
  referredBy: string | null;
  savedItems: number;
  setProfileImage: Dispatch<SetStateAction<string | null>>;
  setTab: Dispatch<SetStateAction<Tab>>;
  shareReferralLink: () => Promise<void>;
  streak: number;
  verifiedHuman: VerifiedHuman | null;
  worldContext: WorldMiniAppContext;
}) {
  const [profileView, setProfileView] = useState<"overview" | "activity">("overview");
  const [quickToolPanel, setQuickToolPanel] = useState<"connections" | "mirror" | "voice" | null>(null);
  const [showAllLedger, setShowAllLedger] = useState(false);
  const [jobApplications] = useState<Array<{id: string; title: string; budget: string; poster: string; appliedAt: string}>>(() =>
    loadJsonFromStorage(storageKeys.jobApplications, []),
  );

  // Restore profile image from localStorage on first mount
  useEffect(() => {
    if (!profileImage) {
      try {
        const saved = localStorage.getItem(storageKeys.profileImage);
        if (saved) setProfileImage(saved);
      } catch {}
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const displayUsername = getWorldDisplayUsername(worldContext, verifiedHuman);
  const profileInitial =
    displayUsername.replace(/^@/, "").trim().charAt(0).toUpperCase() || "H";
  const todayKey = getLocalDateKey();
  const checkedInToday = lastCheckInDate === todayKey;
  const worldProfileImage = verifiedHuman?.profilePictureUrl ?? worldContext.profilePictureUrl;
  const identityLabel =
    verifiedHuman?.mode === "world"
      ? isWorldUsernamePlaceholder(displayUsername)
        ? "World profile syncing"
        : "World username verified"
      : verifiedHuman?.wallet
        ? "World profile syncing"
        : "World account pending";
  const syncLabel =
    accountSyncStatus === "ready"
      ? "Cloud sync active"
      : accountSyncStatus === "saving"
        ? "Saving cloud backup"
        : accountSyncStatus === "loading"
          ? "Restoring cloud backup"
          : accountSyncStatus === "offline"
            ? "Local safe, cloud pending"
            : "Local safe";
  const ownedPosts = humanPosts.filter((post) => post.owner);
  const chainScore = getChainScore({ points, streak, posts: ownedPosts.length, savedItems });
  const tier = getReputationTier(chainScore);
  // Only count listings that completed a real sale (status "sold") as trades.
  const completedTrades = marketplaceListings.filter((listing) => listing.status === "sold").length;
  const passportMetrics = getTrustPassportMetrics({
    completedTrades,
    human: verifiedHuman,
    points,
    posts: ownedPosts.length,
    savedItems,
    streak,
  });
  // Passport levels aligned with the same tier thresholds used on HomeView.
  const passportLevel =
    chainScore >= 420 ? "Gold Human" : chainScore >= 200 ? "Silver Human" : "Bronze Human";
  const nextPassportTarget = chainScore >= 420 ? 720 : chainScore >= 200 ? 420 : 200;
  const passportProgress = Math.min(100, Math.round((chainScore / nextPassportTarget) * 100));
  const earnedBadges = [
    { active: isVerifiedWorldHuman(verifiedHuman), label: "Verified Human" },
    { active: streak >= 7, label: "7-day Streak" },
    { active: ownedPosts.length > 0, label: "Moment Maker" },
    { active: savedItems > 0, label: "Wisdom Saver" },
    { active: passportMetrics.completedTrades > 0, label: "Trusted Trader" },
  ];
  const connectedSignals = Array.from(
    new Map(
      links.map((link) => [
        getChainLinkAuthor(link, displayUsername),
        {
          handle: getChainLinkAuthor(link, displayUsername),
          text: link.text,
        },
      ]),
    ).values(),
  ).slice(0, 8);

  function openConnectionMap() {
    setQuickToolPanel("connections");
    recordHistory({
      title: "Connection map opened",
      detail: `${connectedSignals.length} live chain sources are ready from your saved and public links.`,
      kind: "profile",
    });
    act("Connection map ready", "Your connected human handles and chain quotes are shown inside Me.");
  }

  function openDeepHumanMirror() {
    openPayment({
      title: "Deep Human Mirror",
      amount: "6 WLD",
      detail: "Unlock a private premium reflection from your profile activity, check-ins, questions, stories, and chain signals.",
      success: "Deep Human Mirror unlocked and stored in your Human Vault.",
      feature: "deep-world-verdict",
      points: 30,
      onConfirmed: async () => {
        setQuickToolPanel("mirror");
        recordHistory({
          title: "Deep Human Mirror unlocked",
          detail: "Premium profile reflection unlocked and added to Human Vault.",
          kind: "profile",
        });
      },
    });
  }

  // Deterministic HC-ID from username (same logic as HomeView)
  function getHumanChainId(handle: string) {
    const seed = (handle || "human").replace(/[^a-z0-9]/gi, "").toUpperCase() || "HUMAN";
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const code = h.toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
    return `HC-${code.slice(0, 3)}-${code.slice(3, 6)}`;
  }
  const humanChainId = getHumanChainId(displayUsername);
  const isVerified = isVerifiedWorldHuman(verifiedHuman);

  return (
    <div className="screen me-screen">
      <TopBar title="Human Passport" subtitle="Your verified digital identity" />

      {/* ── Digital Passport Card ──────────────────────── */}
      <section className="hc-passport-card" aria-label="Digital Human Card">
        {/* Holographic shimmer layers */}
        <span className="hcp-holo" aria-hidden="true" />
        <span className="hcp-grid" aria-hidden="true" />

        {/* Top row: issuer brand */}
        <div className="hcp-issuer">
          <span className="hcp-issuer-text">HUMANCHAIN · WORLD</span>
          <span className="hcp-doc-type">DIGITAL ID</span>
        </div>

        {/* Middle: photo + identity */}
        <div className="hcp-body">
          <label className="hcp-photo-wrap" title="Upload profile image">
            <div className="hcp-photo">
              {profileImage ? (
                <img alt="" src={profileImage} />
              ) : worldProfileImage ? (
                <img alt="" src={worldProfileImage} />
              ) : (
                <span>{profileInitial}</span>
              )}
              {isVerified && <span className="hcp-photo-pip"><BadgeCheck size={10} /></span>}
            </div>
            <input
              accept="image/*"
              className="hcp-photo-input"
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const imageData = String(reader.result);
                  setProfileImage(imageData);
                  try { localStorage.setItem(storageKeys.profileImage, imageData); } catch {}
                  recordHistory({ title: "Profile image updated", detail: "HumanChain profile image updated.", kind: "profile" });
                };
                reader.readAsDataURL(file);
                earnPoints(5, "Profile image added to your human identity.");
              }}
            />
          </label>

          <div className="hcp-identity">
            <div className="hcp-name">{displayUsername}</div>
            <div className="hcp-id-row">
              <span className="hcp-id">{humanChainId}</span>
              <span className={`hcp-status ${isVerified ? "verified" : "preview"}`}>
                <BadgeCheck size={9} />{isVerified ? "Verified" : "Preview"}
              </span>
            </div>
            <div className="hcp-tier-row">
              <span className="hcp-tier">{tier.current.label}</span>
              <span className="hcp-level">Lv.{tier.level}</span>
            </div>
            <div className="hcp-sync">{syncLabel}</div>
          </div>

          {/* Score badge */}
          <div className="hcp-score-badge">
            <span className="hcp-score-num">{chainScore}</span>
            <span className="hcp-score-label">HP Score</span>
          </div>
        </div>

        {/* Metrics strip */}
        <div className="hcp-metrics">
          <div className="hcp-metric"><strong>{points}</strong><span>HP</span></div>
          <div className="hcp-metric"><strong>{streak}d</strong><span>Streak</span></div>
          <div className="hcp-metric"><strong>{passportMetrics.completedTrades}</strong><span>Trades</span></div>
          <div className="hcp-metric"><strong>{ownedPosts?.length ?? 0}</strong><span>Posts</span></div>
        </div>

        {/* Bottom: progress bar + check-in */}
        <div className="hcp-footer">
          <div className="hcp-progress-wrap">
            <div className="hcp-progress-bar" role="progressbar" aria-valuenow={tier.pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="hcp-progress-fill" style={{ width: `${tier.pct}%` }} />
            </div>
            <span className="hcp-progress-label">
              {tier.next ? `${tier.toGo} pts → ${tier.next.label}` : "Founder — top of the chain"}
            </span>
          </div>
          <button
            className="hcp-checkin"
            disabled={checkedInToday}
            onClick={onCheckIn}
            type="button"
            aria-label="Daily check-in"
          >
            <CalendarCheck size={14} />
            {checkedInToday ? "✓ Checked in" : "Check in"}
          </button>
        </div>

        {/* Machine-readable strip (purely decorative) */}
        <div className="hcp-mrz" aria-hidden="true">
          <span>{`HCID<<${displayUsername.replace(/[^A-Z0-9]/gi, "").toUpperCase().padEnd(24, "<").slice(0, 24)}`}</span>
          <span>{`${humanChainId.replace(/-/g, "")}<<<${chainScore.toString().padStart(6, "0")}`}</span>
        </div>
      </section>
      <nav className="me-view-tabs" aria-label="Me sections">
        <button
          aria-pressed={profileView === "overview"}
          className={profileView === "overview" ? "active" : ""}
          onClick={() => setProfileView("overview")}
          type="button"
        >
          Passport
        </button>
        <button
          aria-pressed={profileView === "activity"}
          className={profileView === "activity" ? "active" : ""}
          onClick={() => setProfileView("activity")}
          type="button"
        >
          Activity
        </button>
      </nav>
      {profileView === "overview" ? (
        <>
      <section className="profile-kpi-grid" aria-label="Profile metrics">
        <Stat label="Score" value={String(chainScore)} />
        <Stat label="Points" value={String(points)} />
        <Stat label="Streak" value={`${streak}d`} />
        <Stat label="Posts" value={String(ownedPosts.length)} />
        <Stat label="Saved" value={String(savedItems)} />
      </section>
      <section className={`passport-level-panel ${passportLevel.toLowerCase().replace(/\s+/g, "-")}`}>
        <div>
          <span>Passport level</span>
          <strong>{passportLevel}</strong>
          <p>{chainScore}/{nextPassportTarget} trust score toward the next level.</p>
        </div>
        <i aria-hidden="true">
          <b style={{ width: `${passportProgress}%` }} />
        </i>
        <div className="passport-badge-grid">
          {earnedBadges.map((badge) => (
            <span className={badge.active ? "active" : ""} key={badge.label}>
              {badge.label}
            </span>
          ))}
        </div>
      </section>
      <section className="panel hp-ledger-panel">
        <div className="section-heading">
          <span>HP ledger</span>
          <Star size={18} />
        </div>
        {hpLedger.length ? (
          <>
            <div className="hp-ledger-list">
              {hpLedger.slice(0, showAllLedger ? hpLedger.length : 6).map((record) => (
                <article className="hp-ledger-row" key={record.id}>
                  <strong>+{record.amount} HP</strong>
                  <span>{record.reason}</span>
                  <small>{record.date} · {record.time}</small>
                </article>
              ))}
            </div>
            {hpLedger.length > 6 && (
              <button className="hp-ledger-toggle" onClick={() => setShowAllLedger((v) => !v)} type="button">
                {showAllLedger ? "Show less" : `Show all ${hpLedger.length} records`}
              </button>
            )}
          </>
        ) : (
          <div className="ledger-empty-state">
            <Star size={22} />
            <strong>No HP records yet</strong>
            <p>Check in, answer the daily question, post a moment, or complete a trade to earn your first HP.</p>
          </div>
        )}
      </section>
      <ReferralCard
        copyReferralLink={copyReferralLink}
        displayUsername={displayUsername}
        referralShareCount={referralShareCount}
        referredBy={referredBy}
        shareReferralLink={shareReferralLink}
        verifiedHuman={verifiedHuman}
      />

      <section className="chain-id-card">
        <div>
          <span>World username</span>
          <strong>{displayUsername}</strong>
        </div>
        <ShieldCheck size={28} />
        <p>
          This profile represents one real verified human. Username becomes the
          public chain handle across questions, stories, tips, and fields.
        </p>
      </section>
      <section className="panel trust-passport-detail">
        <div className="section-heading">
          <span>Trust Passport</span>
          <ShieldCheck size={18} />
        </div>
        <div className="trust-passport-grid">
          <span><strong>{passportMetrics.verification}</strong>Verification</span>
          <span><strong>{passportMetrics.tenure}</strong>Tenure</span>
          <span><strong>{passportMetrics.helpfulScore}</strong>Helpfulness</span>
          <span><strong>{passportMetrics.completedTrades}</strong>Completed trades</span>
          <span><strong>{passportMetrics.disputeRate}</strong>Dispute rate</span>
          <span><strong>{passportMetrics.moderationState}</strong>Moderation</span>
        </div>
        <p>
          Wallet addresses stay out of primary public UI. HumanChain shows World usernames, coarse area, helpfulness, trade completion, and moderation state instead.
        </p>
        <button
          className="share-passport-btn"
          onClick={async () => {
            try {
              const { shareWithWorld } = await import("@/lib/world/social");
              const username = verifiedHuman?.username ?? "a verified human";
              const text = `${username} — ${tier.current.label} · ${chainScore} HP · ${passportMetrics.completedTrades} trades · ${streak} day streak on HumanChain.`;
              await shareWithWorld({ title: "My Human Passport", text, url: process.env.NEXT_PUBLIC_APP_URL ?? "https://humanchain.app" });
            } catch { /* share dismissed */ }
          }}
          type="button"
        >
          <Share2 size={14} /> Share Passport
        </button>
      </section>
      <section className="panel human-history-panel">
        <div className="section-heading">
          <span>My post history</span>
          <Library size={18} />
        </div>
        {ownedPosts.length ? (
          ownedPosts
            .map((post) => (
              <article className="history-post-card" key={post.id}>
                {post.image ? (
                  <img alt={post.caption} src={post.image} />
                ) : (
                  <div className="history-post-symbol" />
                )}
                <div>
                  <strong>{post.caption}</strong>
                  <span>
                    {post.createdAt} - {post.loves} loves - {post.comments.length} comments - {post.storageStatus === "cloud-safe" ? "safe receipt" : "local safe"}
                  </span>
                </div>
              </article>
            ))
        ) : (
          <p>Your published image posts will appear here and stay until you delete them.</p>
        )}
      </section>
      <section className="panel human-history-panel">
        <div className="section-heading">
          <span>Marketplace vault</span>
          <Store size={18} />
        </div>
        <article className="market-vault-row">
          <div>
            <strong>Nearby market location</strong>
            <span>{marketLocation.label}</span>
            <small>
              {marketLocation.status === "ready"
                ? `Active by ${marketLocation.source === "browser-gps" ? "GPS consent" : "manual area"}`
                : "Not active yet. Open Market and tap GPS or use area."}
            </small>
          </div>
          <button onClick={() => setTab("market")} type="button">
            Open Market
          </button>
        </article>
        {marketplaceListings.length ? (
          marketplaceListings.filter((l) => l.status !== "archived").slice(0, 5).map((listing) => (
            <article className="market-vault-row" key={listing.id}>
              <div>
                <strong>{listing.title}</strong>
                <span>{listing.price} · {listing.condition} · {listing.photos.length} photo{listing.photos.length !== 1 ? "s" : ""}</span>
                <small>
                  {listing.area} ·
                  <span className={`vault-status-badge ${listing.status}`}> {listing.status === "sold" ? "✓ Sold" : listing.status === "payment-ready" ? "Listed" : listing.status}</span>
                </small>
                <small>{listing.saleMode === "bidding" ? `Bidding · floor ${listing.bidFloor || "not set"}` : "Direct sale"} · {listing.dataStorageStatus === "cloud-safe" ? "☁ safe receipt" : "local safe"}</small>
              </div>
              <button onClick={() => setTab("market")} type="button">
                View
              </button>
            </article>
          ))
        ) : (
          <p>Your marketplace listings will appear here once you post an item.</p>
        )}
      </section>
      {jobApplications.length > 0 && (
        <section className="panel human-history-panel">
          <div className="section-heading">
            <span>My Applications</span>
            <Briefcase size={18} />
          </div>
          <div className="me-applications">
            {jobApplications.map((app) => (
              <div key={app.id} className="me-app-card">
                <div className="me-app-title">{app.title}</div>
                <div className="me-app-meta">
                  <span>{app.budget}</span>
                  <span>via {app.poster}</span>
                  <span className="me-app-status">Applied</span>
                </div>
              </div>
            ))}
          </div>
          <button className="hp-ledger-toggle" onClick={() => setTab("market")} type="button">
            Browse more opportunities →
          </button>
        </section>
      )}

      <section className="badge-cloud">
        {profileBadges.map((badge) => (
          <span key={badge}>{badge}</span>
        ))}
      </section>
      <section className="panel">
        <div className="section-heading">
          <span>Human vault</span>
          <BookOpen size={18} />
        </div>
        {([
          {
            label: "Saved Verdicts",
            tab: "ask" as const,
            detail: "Your saved answers and verdicts from the Ask community.",
            count: historyRecords.filter((r) => r.title.toLowerCase().includes("answer") || r.title.toLowerCase().includes("question") || r.title.toLowerCase().includes("verdict")).length,
          },
          {
            label: "Monthly Stories",
            tab: "stories" as const,
            detail: "Read this month's verified Human Stories collection.",
            count: 1,
          },
          {
            label: "Chain Links",
            tab: "chains" as const,
            detail: "Top chain links and community wisdom in Chains.",
            count: links.length,
          },
          {
            label: "Moments Posted",
            tab: "chains" as const,
            detail: "Your photo moments and proof-of-work posts.",
            count: ownedPosts.length,
          },
        ]).map((item) => (
          <button className="library-row" key={item.label}
            onClick={() => { setTab(item.tab); act(item.label, item.detail); }}
            type="button">
            <span className="library-row-label">
              <span>{item.label}</span>
              {item.count > 0 && <span className="library-row-count">{item.count}</span>}
            </span>
            <ChevronRight size={14} />
          </button>
        ))}
      </section>
      <section className="panel">
        <div className="section-heading">
          <span>Quick tools</span>
          <Search size={18} />
        </div>
        <div className="compact-actions">
          <button onClick={openConnectionMap} type="button">
            <Compass size={17} />
            Find countries I connected with
          </button>
          <button onClick={openDeepHumanMirror} type="button">
            <LockKeyhole size={17} />
            Open Deep Human Mirror
          </button>
          <button
            onClick={async () => {
              try {
                const result = await requestWorldPermission(Permission.Microphone);

                if (isWorldPermissionGranted(result)) {
                  setQuickToolPanel("voice");
                  recordHistory({
                    title: "Voice access enabled",
                    detail: "Microphone permission is ready for voice questions and voice answers in World App.",
                    kind: "profile",
                  });
                  act("Microphone ready", "Voice answers can request microphone access in World App.");
                } else {
                  act("Open in World App", "Microphone permission must be granted inside World App.");
                }
              } catch (error) {
                act("Microphone permission", error instanceof Error ? error.message : "Try again inside World App.");
              }
            }}
            type="button"
          >
            <Mic size={17} />
            Enable voice access
          </button>
        </div>
        {quickToolPanel ? (
          <div className="quick-tool-result">
            {quickToolPanel === "connections" ? (
              <>
                <strong>Live connection map</strong>
                <p>
                  These are the human handles currently connected to your chain feed. Open Chains
                  to follow the source post, tip, or pin a useful signal.
                </p>
                <div className="connection-signal-grid">
                  {connectedSignals.map((signal) => (
                    <button
                      key={`${signal.handle}-${signal.text}`}
                      onClick={() => {
                        setTab("chains");
                        act("Opening chain source", `${signal.handle} is ready in Chains.`);
                      }}
                      type="button"
                    >
                      <span>{signal.handle}</span>
                      <small>{signal.text}</small>
                    </button>
                  ))}
                </div>
              </>
            ) : null}
            {quickToolPanel === "mirror" ? (
              <>
                <strong>Deep Human Mirror</strong>
                <p className="mirror-intro">Your private reflection based on your HumanChain activity and signals:</p>
                <div className="mirror-insights">
                  {[
                    { label: "Chain strength", value: chainScore >= 200 ? "Growing — keep posting" : "Building — start with a check-in" },
                    { label: "Consistency", value: streak >= 7 ? `Strong — ${streak}-day streak active` : streak >= 3 ? `Emerging — ${streak} days in a row` : "Needs nurturing — answer daily" },
                    { label: "Community reach", value: `${links.length + ownedPosts.length} touchpoints across fields` },
                    { label: "Trust trajectory", value: passportMetrics.helpfulScore },
                    { label: "Next milestone", value: tier.next ? `${tier.toGo} pts to ${tier.next.label}` : "Founder — top of the chain" },
                  ].map((insight) => (
                    <div className="mirror-insight-row" key={insight.label}>
                      <span>{insight.label}</span>
                      <strong>{insight.value}</strong>
                    </div>
                  ))}
                </div>
                <p className="mirror-note">This reflection is private and stored in your Human Vault.</p>
              </>
            ) : null}
            {quickToolPanel === "voice" ? (
              <>
                <strong>Voice access live</strong>
                <p>
                  Microphone permission is connected for voice questions and voice answers. Ask can
                  now carry tone when you choose a paid voice flow.
                </p>
                <button onClick={() => setTab("ask")} type="button">
                  Open voice Ask
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </section>
        </>
      ) : (
        <>
          <section className="panel human-history-panel activity-panel">
            <div className="section-heading">
              <span>Human activity record</span>
              <Radio size={18} />
            </div>
            {historyRecords.length ? (
              historyRecords.slice(0, 16).map((record) => (
                <article className={`history-record ${record.kind}`} key={record.id}>
                  <span>{record.time}</span>
                  <div>
                    <strong>{record.title}</strong>
                    <p>{record.detail}</p>
                  </div>
                </article>
              ))
            ) : (
              <p>Your actions, payments, posts, bids, and notification changes will appear here.</p>
            )}
          </section>
          <section className="panel points-ledger">
            <div className="section-heading">
              <span>Point rules</span>
              <Star size={18} />
            </div>
            {pointRules.map(([action, reward]) => (
              <div className="point-rule" key={action}>
                <span>{action}</span>
                <strong>{reward}</strong>
              </div>
            ))}
            <p>
              Human Points are not withdrawable yet. They track early value so real
              contributors can be recognized when HumanChain launches rewards.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReferralCard — standalone sub-component
// ---------------------------------------------------------------------------

function ReferralCard({
  copyReferralLink,
  displayUsername,
  referralShareCount,
  referredBy,
  shareReferralLink,
  verifiedHuman,
}: {
  copyReferralLink: () => Promise<void>;
  displayUsername: string;
  referralShareCount: number;
  referredBy: string | null;
  shareReferralLink: () => Promise<void>;
  verifiedHuman: { username?: string | null; mode?: string } | null;
}) {
  const referralLink = getReferralLink(displayUsername);
  const nextMilestone = getNextMilestone(referralShareCount);
  const reachedMilestones = getReachedMilestones(referralShareCount);
  const totalHpEstimate = getTotalReferralHp(referralShareCount);
  const progressPct = nextMilestone
    ? Math.round((referralShareCount / nextMilestone.count) * 100)
    : 100;
  const isVerified = verifiedHuman?.mode === "world";

  return (
    <section className="referral-card" aria-label="Invite a Human">
      <div className="referral-card-header">
        <div className="referral-card-icon">
          <Gift size={20} />
        </div>
        <div>
          <strong>Invite a Human</strong>
          <span>+{REFERRAL_HP_PER_SHARE} HP per verified join · +{REFERRAL_BONUS_FOR_REFERRED} HP for them</span>
        </div>
        {totalHpEstimate > 0 && (
          <b className="referral-hp-earned">+{totalHpEstimate} HP</b>
        )}
      </div>

      {referredBy && (
        <div className="referral-welcome-banner">
          <BadgeCheck size={14} />
          <span>You were invited by <strong>@{referredBy}</strong> — welcome bonus applied</span>
        </div>
      )}

      <p className="referral-intro">
        Share HumanChain with humans you trust. Every verified join through your link earns you +{REFERRAL_HP_PER_SHARE} HP and gives them a +{REFERRAL_BONUS_FOR_REFERRED} HP welcome bonus.
      </p>

      <div className="referral-link-row">
        <code className="referral-link-display">{referralLink}</code>
        <button
          aria-label="Copy referral link"
          className="referral-action-btn referral-copy"
          onClick={copyReferralLink}
          type="button"
        >
          <Copy size={15} />
          Copy
        </button>
      </div>

      <div className="referral-share-row">
        <button
          className="referral-share-btn"
          disabled={!isVerified}
          onClick={shareReferralLink}
          type="button"
        >
          <Share2 size={16} />
          Share via World App
        </button>
        {!isVerified && (
          <small className="referral-verify-note">Verify with World ID to share</small>
        )}
      </div>

      {nextMilestone && (
        <div className="referral-progress">
          <div className="referral-progress-header">
            <span>Next: <strong>{nextMilestone.badge}</strong></span>
            <span>{referralShareCount}/{nextMilestone.count} shares</span>
          </div>
          <div className="referral-progress-bar">
            <div
              className="referral-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <small>Reach {nextMilestone.count} shares → <strong>{nextMilestone.badge}</strong> badge + +{nextMilestone.hpBonus} HP bonus</small>
        </div>
      )}

      <div className="referral-milestones">
        {referralMilestones.map((m) => {
          const reached = reachedMilestones.some((r) => r.count === m.count);
          return (
            <div
              className={`referral-milestone ${reached ? "reached" : ""}`}
              key={m.count}
            >
              <strong>{m.badge}</strong>
              <span>{m.count} share{m.count > 1 ? "s" : ""} · +{m.hpBonus} HP</span>
              {reached && <i>✓</i>}
            </div>
          );
        })}
      </div>

      {referralShareCount > 0 && (
        <div className="referral-stats-row">
          <span>Shares sent: <strong>{referralShareCount}</strong></span>
          <span>HP earned: <strong>+{totalHpEstimate}</strong></span>
        </div>
      )}
    </section>
  );
}
