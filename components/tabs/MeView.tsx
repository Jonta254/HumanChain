"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  CalendarCheck,
  ChevronRight,
  Compass,
  Copy,
  Flame,
  Gift,
  Library,
  LockKeyhole,
  Mic,
  Radio,
  Search,
  Share2,
  ShieldCheck,
  Star,
  Store,
  TrendingUp,
  Upload,
  Zap,
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
import {
  getChainScore,
  getLocalDateKey,
  getReputationTier,
  getTrustPassportMetrics,
  getWorldDisplayUsername,
  isVerifiedWorldHuman,
  isWorldUsernamePlaceholder,
  REP_TIERS,
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
// Constants
// ---------------------------------------------------------------------------

const chainLinkHandleBySource: Record<string, string> = {
  Brazil: "@joy_survives", Business: "@builder_ama", Canada: "@quiet_courage",
  Care: "@care_voice", Culture: "@culture_keeper", Discipline: "@future_self",
  Faith: "@faith_link", Family: "@family_room", Ghana: "@goodname_ghana",
  Health: "@healing_chain", HumanChain: "@humanchain", Identity: "@seen_human",
  India: "@discipline_daily", Japan: "@quiet_words", Kenya: "@mara_chain",
  Love: "@love_practice", Mexico: "@workbench_mx", Money: "@money_room",
  Philippines: "@care_bridge", Portugal: "@slow_light", Prayer: "@prayer_link",
  Purpose: "@purpose_field", "South Africa": "@ubuntu_builder",
  Wisdom: "@wisdom_vault", Work: "@craft_human", World: "@world_human",
  Youth: "@youth_signal",
};

const pointRules = [
  ["Answer Daily Human", "+18 HP"],
  ["Ask a useful question", "+20 HP"],
  ["Publish image post", "+16 HP"],
  ["Add a chain link", "+12 HP"],
  ["Answer a human", "+15 HP"],
  ["Read a story", "+8 HP"],
  ["Daily check-in", "+10 HP"],
  ["Give a trusted report", "+10 HP"],
  ["React to image post", "+5 HP"],
  ["Enable nearby market", "+5 HP"],
  ["Enter a field", "+6 HP"],
  ["Copy field quote", "+3 HP"],
  ["Store marketplace listing", "+10 HP"],
  ["Publish accepted story", "+120 HP"],
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getChainLinkAuthor(link: ChainLink, fallback = "@verified_human") {
  if (link.country.startsWith("@")) return link.country;
  return chainLinkHandleBySource[link.country] ?? fallback;
}

function isWorldPermissionGranted(result: unknown) {
  const r = result as { data?: { status?: string }; executedWith?: string } | undefined;
  return (
    r?.executedWith !== "fallback" &&
    ["success", "already_granted"].includes(r?.data?.status ?? "")
  );
}

// Group identical HP ledger entries (same amount + reason + date) into one row with a count.
function groupLedger(records: HpLedgerRecord[]) {
  const seen = new Map<string, HpLedgerRecord & { count: number }>();
  for (const rec of records) {
    const key = `${rec.amount}|${rec.reason}|${rec.date}`;
    const existing = seen.get(key);
    if (existing) {
      existing.count++;
    } else {
      seen.set(key, { ...rec, count: 1 });
    }
  }
  return Array.from(seen.values());
}

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
  const [repView, setRepView] = useState<"passport" | "growth" | "actions">("passport");
  const [quickToolPanel, setQuickToolPanel] = useState<"connections" | "mirror" | "voice" | null>(null);

  const displayUsername = getWorldDisplayUsername(worldContext, verifiedHuman);
  const profileInitial = displayUsername.replace(/^@/, "").trim().charAt(0).toUpperCase() || "H";
  const todayKey = getLocalDateKey();
  const checkedInToday = lastCheckInDate === todayKey;
  const worldProfileImage = verifiedHuman?.profilePictureUrl ?? worldContext.profilePictureUrl;

  const identityLabel =
    verifiedHuman?.mode === "world"
      ? isWorldUsernamePlaceholder(displayUsername) ? "World profile syncing" : "World username verified"
      : verifiedHuman?.wallet ? "World profile syncing" : "World account pending";

  const syncLabel =
    accountSyncStatus === "ready" ? "Cloud sync active"
    : accountSyncStatus === "saving" ? "Saving cloud backup"
    : accountSyncStatus === "loading" ? "Restoring cloud backup"
    : accountSyncStatus === "offline" ? "Local safe, cloud pending"
    : "Local safe";

  const ownedPosts = humanPosts.filter((post) => post.owner);
  const chainScore = getChainScore({ points, streak, posts: ownedPosts.length, savedItems });
  const completedTrades = marketplaceListings.filter((l) => l.status === "sold").length;
  const passportMetrics = getTrustPassportMetrics({
    completedTrades, human: verifiedHuman, points, posts: ownedPosts.length, savedItems, streak,
  });

  // Tier road — shared with HomeView so the label/color/progress shown here
  // always matches the home screen's reputation summary.
  const { current: currentTier, next: nextTier, pct: tierPct, level: tierLevel } = getReputationTier(chainScore);
  const tierIdx = REP_TIERS.findIndex((t) => t.label === currentTier.label);

  // Passport level — derived from the same Tier Road used in the score strip,
  // the Growth tab, and HomeView's reputation ladder, so the label, color, and
  // progress shown here always match every other place tier is shown.
  const passportLevel = `${currentTier.label} Human`;
  const nextPassportTarget = nextTier?.min ?? currentTier.min;
  const passportProgress = tierPct;

  const earnedBadges = [
    { active: isVerifiedWorldHuman(verifiedHuman), label: "Verified Human" },
    { active: streak >= 7, label: "7-day Streak" },
    { active: ownedPosts.length > 0, label: "Moment Maker" },
    { active: savedItems > 0, label: "Wisdom Saver" },
    { active: completedTrades > 0, label: "Trusted Trader" },
  ];

  // Score breakdown — how chainScore is composed
  const scoreBreakdown = [
    { label: "HP", value: Math.round(points / 4), sub: `${points} pts ÷ 4`, color: "#137a57" },
    { label: "Streak", value: streak * 7, sub: `${streak}d × 7`, color: "#2f6fed" },
    { label: "Posts", value: ownedPosts.length * 12, sub: `${ownedPosts.length} × 12`, color: "#6657d9" },
    { label: "Saved", value: savedItems * 5, sub: `${savedItems} × 5`, color: "#b88a1f" },
  ];
  const maxBreakdown = Math.max(...scoreBreakdown.map((b) => b.value), 1);

  // Weekly HP from ledger
  const todayDate = new Date();
  const weekAgo = new Date(todayDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const weeklyHp = hpLedger
    .filter((r) => r.date >= weekAgo)
    .reduce((sum, r) => sum + r.amount, 0);

  const groupedLedger = groupLedger(hpLedger);

  const connectedSignals = Array.from(
    new Map(links.map((link) => [
      getChainLinkAuthor(link, displayUsername),
      { handle: getChainLinkAuthor(link, displayUsername), text: link.text },
    ])).values(),
  ).slice(0, 8);

  function openConnectionMap() {
    setQuickToolPanel("connections");
    recordHistory({ title: "Connection map opened", detail: `${connectedSignals.length} live chain sources visible.`, kind: "profile" });
    act("Connection map ready", "Your connected human handles and chain quotes are shown inside Me.");
  }

  function openDeepHumanMirror() {
    openPayment({
      title: "Deep Human Mirror", amount: "6",
      detail: "Unlock a private premium reflection from your profile activity, check-ins, questions, stories, and chain signals.",
      success: "Deep Human Mirror unlocked and stored in your Human Vault.",
      feature: "deep-world-verdict", points: 30,
      onConfirmed: async () => {
        setQuickToolPanel("mirror");
        recordHistory({ title: "Deep Human Mirror unlocked", detail: "Premium profile reflection unlocked.", kind: "profile" });
      },
    });
  }

  return (
    <div className="screen me-screen">
      <TopBar title="Reputation Hub" subtitle="Trust engine · HP ledger · World passport" />

      {/* ── Identity header ─────────────────────────────────────── */}
      <section className="rep-identity-header">
        <div className="rep-avatar-wrap">
          <div className="avatar">
            {profileImage ? (
              <img alt="Uploaded profile" src={profileImage} />
            ) : worldProfileImage ? (
              <img alt={`${displayUsername} World profile`} src={worldProfileImage} />
            ) : (
              <span>{profileInitial}</span>
            )}
          </div>
          <span className="rep-avatar-badge" aria-label="Verified"><BadgeCheck size={16} /></span>
        </div>
        <div className="rep-identity-info">
          <strong>{displayUsername}</strong>
          <span>{identityLabel}</span>
          <span className="rep-sync-pill">{syncLabel}</span>
        </div>
        <div className="rep-identity-actions">
          <button
            className={`rep-checkin-btn${checkedInToday ? " done" : ""}`}
            disabled={checkedInToday}
            onClick={onCheckIn}
            type="button"
          >
            <CalendarCheck size={15} />
            {checkedInToday ? "Checked in" : "Check in"}
          </button>
          <label className="rep-upload-btn" title="Upload profile image">
            <Upload size={15} />
            <input accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                setProfileImage(String(reader.result));
                recordHistory({ title: "Profile image updated", detail: "Your HumanChain profile now has a personal image.", kind: "profile" });
              };
              reader.readAsDataURL(file);
              earnPoints(5, "Profile image added to your human identity.");
            }} type="file" />
          </label>
        </div>
        {lastCheckInAt && <p className="rep-checkin-stamp">{lastCheckInAt}</p>}
      </section>

      {/* ── Score strip ─────────────────────────────────────────── */}
      <div className="rep-score-strip">
        <div className="rep-score-main">
          <span className="rep-score-num">{chainScore}</span>
          <span className="rep-score-label">Trust Score</span>
        </div>
        <div className="rep-score-stats">
          <span><Flame size={12} />{streak}d</span>
          <span><Zap size={12} />{points} HP</span>
          <span><Star size={12} />{weeklyHp} this wk</span>
          <span><TrendingUp size={12} />{ownedPosts.length} posts</span>
        </div>
        <div className="rep-current-tier" style={{ color: currentTier.color, background: currentTier.bg }}>
          Lv.{tierLevel} · {currentTier.label}
        </div>
      </div>

      {/* ── Tab nav ─────────────────────────────────────────────── */}
      <nav className="rep-hub-tabs" aria-label="Reputation sections">
        {(["passport", "growth", "actions"] as const).map((tab) => (
          <button
            key={tab}
            className={repView === tab ? "active" : ""}
            aria-pressed={repView === tab}
            onClick={() => setRepView(tab)}
            type="button"
          >
            {tab === "passport" ? "Passport" : tab === "growth" ? "Growth" : "Actions"}
          </button>
        ))}
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          PASSPORT TAB
          ═══════════════════════════════════════════════════════════ */}
      {repView === "passport" && (
        <>
          {/* Passport level card */}
          <section className={`passport-level-panel ${passportLevel.toLowerCase().replace(/\s+/g, "-")}`}>
            <div>
              <span>Passport level</span>
              <strong>{passportLevel}</strong>
              <p>{nextTier ? `${chainScore}/${nextPassportTarget} trust score toward ${nextTier.label}.` : "Founder reached — the top of the chain."}</p>
            </div>
            <i aria-hidden="true"><b style={{ width: `${passportProgress}%` }} /></i>
            <div className="passport-badge-grid">
              {earnedBadges.map((badge) => (
                <span className={badge.active ? "active" : ""} key={badge.label}>{badge.label}</span>
              ))}
            </div>
          </section>

          {/* Metrics */}
          <section className="profile-kpi-grid" aria-label="Profile metrics">
            <Stat label="Score" value={String(chainScore)} />
            <Stat label="Points" value={String(points)} />
            <Stat label="Streak" value={`${streak}d`} />
            <Stat label="Posts" value={String(ownedPosts.length)} />
            <Stat label="Saved" value={String(savedItems)} />
          </section>

          {/* HP ledger — grouped to eliminate duplicates */}
          <section className="panel hp-ledger-panel">
            <div className="section-heading">
              <span>HP ledger</span>
              <Star size={18} />
            </div>
            {groupedLedger.length ? (
              <div className="hp-ledger-list">
                {groupedLedger.slice(0, 8).map((record) => (
                  <article className="hp-ledger-row" key={record.id}>
                    <strong>+{record.count > 1 ? record.count * record.amount : record.amount} HP</strong>
                    <span>{record.count > 1 ? `${record.count}× ` : ""}{record.reason}</span>
                    <small>{record.date} · {record.time}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p>Check in, answer, post, trade, or confirm a WLD action to create your first HP record.</p>
            )}
          </section>

          {/* Trust passport detail */}
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
            <p>Wallet addresses stay out of public UI. HumanChain shows World usernames, coarse area, helpfulness, trade completion, and moderation state.</p>
          </section>

          {/* Chain ID card */}
          <section className="chain-id-card">
            <div>
              <span>World username</span>
              <strong>{displayUsername}</strong>
            </div>
            <ShieldCheck size={28} />
            <p>One verified human. Username is the public chain handle across questions, stories, tips, and fields.</p>
          </section>

          {/* Referral */}
          <ReferralCard
            copyReferralLink={copyReferralLink}
            displayUsername={displayUsername}
            referralShareCount={referralShareCount}
            referredBy={referredBy}
            shareReferralLink={shareReferralLink}
            verifiedHuman={verifiedHuman}
          />

          {/* Post history */}
          <section className="panel human-history-panel">
            <div className="section-heading">
              <span>My post history</span>
              <Library size={18} />
            </div>
            {ownedPosts.length ? (
              ownedPosts.map((post) => (
                <article className="history-post-card" key={post.id}>
                  {post.image ? <img alt={post.caption} src={post.image} /> : <div className="history-post-symbol" />}
                  <div>
                    <strong>{post.caption}</strong>
                    <span>{post.createdAt} · {post.loves} loves · {post.comments.length} comments</span>
                  </div>
                </article>
              ))
            ) : (
              <p>Your published image posts will appear here.</p>
            )}
          </section>

          {/* Marketplace vault */}
          <section className="panel human-history-panel">
            <div className="section-heading">
              <span>Marketplace vault</span>
              <Store size={18} />
            </div>
            <article className="market-vault-row">
              <div>
                <strong>Nearby market location</strong>
                <span>{marketLocation.label}</span>
                <small>{marketLocation.status === "ready" ? `Active · ${marketLocation.source === "browser-gps" ? "GPS" : "manual area"}` : "Not active. Open Market and tap GPS or use area."}</small>
              </div>
              <button onClick={() => act("Nearby market", marketLocation.label)} type="button">View</button>
            </article>
            {marketplaceListings.slice(0, 5).map((listing) => (
              <article className="market-vault-row" key={listing.id}>
                <div>
                  <strong>{listing.title}</strong>
                  <span>{listing.price} · {listing.condition}</span>
                  <small>{listing.area} · {listing.status}</small>
                </div>
                <button onClick={() => act("Marketplace listing", `${listing.title} stored in your HumanChain history.`)} type="button">View</button>
              </article>
            ))}
            {!marketplaceListings.length && <p>Your stored marketplace listings will appear here.</p>}
          </section>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          GROWTH TAB
          ═══════════════════════════════════════════════════════════ */}
      {repView === "growth" && (
        <>
          {/* Tier road */}
          <section className="panel rep-tier-road-panel">
            <div className="section-heading">
              <span>Tier Road</span>
              <Award size={18} />
            </div>
            <div className="rep-tier-road">
              {REP_TIERS.map((tier, i) => {
                const passed = chainScore >= tier.min;
                const isCurrent = i === tierIdx;
                return (
                  <div key={tier.label} className={`rep-tier-node${passed ? " passed" : ""}${isCurrent ? " current" : ""}`}>
                    <div className="rep-tier-dot" style={isCurrent || passed ? { background: tier.color, borderColor: tier.color } : {}}>
                      {passed && !isCurrent && <span>✓</span>}
                      {isCurrent && <span>●</span>}
                    </div>
                    {i < REP_TIERS.length - 1 && (
                      <div className="rep-tier-line" style={passed && i < tierIdx ? { background: tier.color } : {}} />
                    )}
                    <span className="rep-tier-name" style={isCurrent ? { color: tier.color, fontWeight: 900 } : {}}>{tier.label}</span>
                    <span className="rep-tier-min">{tier.min === 0 ? "Start" : `${tier.min}+`}</span>
                  </div>
                );
              })}
            </div>
            {nextTier && (
              <div className="rep-tier-progress-row">
                <div className="rep-tier-progress-bar">
                  <div style={{ width: `${tierPct}%`, background: currentTier.color }} />
                </div>
                <span>{tierPct}% to {nextTier.label} · need {nextTier.min - chainScore} more pts</span>
              </div>
            )}
            {!nextTier && <p className="rep-tier-top">You have reached Founder — the top of the chain.</p>}
          </section>

          {/* Score breakdown */}
          <section className="panel rep-score-breakdown">
            <div className="section-heading">
              <span>Score breakdown</span>
              <TrendingUp size={18} />
            </div>
            <p className="rep-score-formula">Total trust score = HP ÷ 4 + streak × 7 + posts × 12 + saved × 5</p>
            {scoreBreakdown.map((bar) => (
              <div className="rep-bar-row" key={bar.label}>
                <div className="rep-bar-label">
                  <span>{bar.label}</span>
                  <strong style={{ color: bar.color }}>{bar.value} pts</strong>
                </div>
                <div className="rep-bar-track">
                  <div className="rep-bar-fill" style={{ width: `${Math.round((bar.value / maxBreakdown) * 100)}%`, background: bar.color }} />
                </div>
                <small className="rep-bar-sub">{bar.sub}</small>
              </div>
            ))}
            <div className="rep-bar-total">
              <span>Total score</span>
              <strong>{chainScore}</strong>
            </div>
          </section>

          {/* Weekly HP */}
          <section className="panel rep-weekly-panel">
            <div className="section-heading">
              <span>This week</span>
              <Zap size={18} />
            </div>
            <div className="rep-weekly-strip">
              <div className="rep-weekly-num">+{weeklyHp}</div>
              <div className="rep-weekly-label">HP earned in last 7 days</div>
            </div>
            <div className="rep-weekly-tips">
              {!checkedInToday && <div className="rep-tip"><CalendarCheck size={14} /><span>Check in today for +10 HP</span></div>}
              {ownedPosts.length === 0 && <div className="rep-tip"><span>Post a Moment for +12 HP → opens Posts</span><button onClick={() => { setRepView("actions"); setTab("chains"); }} type="button">Post<ChevronRight size={12} /></button></div>}
              <div className="rep-tip"><span>Answer the Daily Human for +18 HP</span><button onClick={() => setTab("ask")} type="button">Ask<ChevronRight size={12} /></button></div>
              <div className="rep-tip"><span>Add a chain link for +12 HP</span><button onClick={() => setTab("chains")} type="button">Chains<ChevronRight size={12} /></button></div>
            </div>
          </section>

          {/* Full ledger */}
          <section className="panel hp-ledger-panel">
            <div className="section-heading">
              <span>Full HP history</span>
              <Star size={18} />
            </div>
            {groupedLedger.length ? (
              <div className="hp-ledger-list">
                {groupedLedger.slice(0, 20).map((record) => (
                  <article className="hp-ledger-row" key={record.id}>
                    <strong>+{record.count > 1 ? record.count * record.amount : record.amount} HP</strong>
                    <span>{record.count > 1 ? `${record.count}× ` : ""}{record.reason}</span>
                    <small>{record.date} · {record.time}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p>No HP records yet. Take any action to start building your ledger.</p>
            )}
          </section>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          ACTIONS TAB
          ═══════════════════════════════════════════════════════════ */}
      {repView === "actions" && (
        <>
          {/* Activity record */}
          <section className="panel human-history-panel activity-panel">
            <div className="section-heading">
              <span>Activity record</span>
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

          {/* Human vault */}
          <section className="panel">
            <div className="section-heading">
              <span>Human vault</span>
              <BookOpen size={18} />
            </div>
            {["Saved Verdicts", "Monthly Stories", "Voice Notes", "Best Advice"].map((item) => (
              <button className="library-row" key={item} onClick={() => act(item, "Opened from your Human Vault.")} type="button">
                {item}
              </button>
            ))}
          </section>

          {/* Quick tools */}
          <section className="panel">
            <div className="section-heading">
              <span>Quick tools</span>
              <Search size={18} />
            </div>
            <div className="compact-actions">
              <button onClick={openConnectionMap} type="button">
                <Compass size={17} />Find countries I connected with
              </button>
              <button onClick={openDeepHumanMirror} type="button">
                <LockKeyhole size={17} />Open Deep Human Mirror
              </button>
              <button
                onClick={async () => {
                  try {
                    const result = await requestWorldPermission(Permission.Microphone);
                    if (isWorldPermissionGranted(result)) {
                      setQuickToolPanel("voice");
                      recordHistory({ title: "Voice access enabled", detail: "Microphone ready for voice questions.", kind: "profile" });
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
                <Mic size={17} />Enable voice access
              </button>
            </div>
            {quickToolPanel && (
              <div className="quick-tool-result">
                {quickToolPanel === "connections" && (
                  <>
                    <strong>Live connection map</strong>
                    <p>Human handles connected to your chain feed. Open Chains to follow the source post, tip, or pin a signal.</p>
                    <div className="connection-signal-grid">
                      {connectedSignals.map((signal) => (
                        <button key={`${signal.handle}-${signal.text}`} onClick={() => { setTab("chains"); act("Opening chain source", `${signal.handle} is ready in Chains.`); }} type="button">
                          <span>{signal.handle}</span>
                          <small>{signal.text}</small>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {quickToolPanel === "mirror" && (
                  <>
                    <strong>Deep Human Mirror ready</strong>
                    <p>Your private mirror reads profile activity, check-ins, saved posts, and chain signals. Stored in your Human Vault.</p>
                    <div className="mirror-signal-row">
                      <span>{chainScore} score</span>
                      <span>{streak} day streak</span>
                      <span>{ownedPosts.length} posts</span>
                    </div>
                  </>
                )}
                {quickToolPanel === "voice" && (
                  <>
                    <strong>Voice access live</strong>
                    <p>Microphone permission connected for voice questions and answers. Ask can now carry tone.</p>
                    <button onClick={() => setTab("ask")} type="button">Open voice Ask</button>
                  </>
                )}
              </div>
            )}
          </section>

          {/* Point rules */}
          <section className="panel points-ledger">
            <div className="section-heading">
              <span>HP earn rules</span>
              <Star size={18} />
            </div>
            {pointRules.map(([action, reward]) => (
              <div className="point-rule" key={action}>
                <span>{action}</span>
                <strong>{reward}</strong>
              </div>
            ))}
            <p>Human Points track early value so real contributors are recognized when HumanChain launches rewards.</p>
          </section>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReferralCard
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
  const progressPct = nextMilestone ? Math.round((referralShareCount / nextMilestone.count) * 100) : 100;
  const isVerified = verifiedHuman?.mode === "world";

  return (
    <section className="referral-card" aria-label="Invite a Human">
      <div className="referral-card-header">
        <div className="referral-card-icon"><Gift size={20} /></div>
        <div>
          <strong>Invite a Human</strong>
          <span>+{REFERRAL_HP_PER_SHARE} HP per verified join · +{REFERRAL_BONUS_FOR_REFERRED} HP for them</span>
        </div>
        {totalHpEstimate > 0 && <b className="referral-hp-earned">+{totalHpEstimate} HP</b>}
      </div>
      {referredBy && (
        <div className="referral-welcome-banner">
          <BadgeCheck size={14} />
          <span>You were invited by <strong>@{referredBy}</strong> — welcome bonus applied</span>
        </div>
      )}
      <p className="referral-intro">Share HumanChain with humans you trust. Every verified join earns you +{REFERRAL_HP_PER_SHARE} HP and gives them +{REFERRAL_BONUS_FOR_REFERRED} HP.</p>
      <div className="referral-link-row">
        <code className="referral-link-display">{referralLink}</code>
        <button aria-label="Copy referral link" className="referral-action-btn referral-copy" onClick={copyReferralLink} type="button">
          <Copy size={15} />Copy
        </button>
      </div>
      <div className="referral-share-row">
        <button className="referral-share-btn" disabled={!isVerified} onClick={shareReferralLink} type="button">
          <Share2 size={16} />Share via World App
        </button>
        {!isVerified && <small className="referral-verify-note">Verify with World ID to share</small>}
      </div>
      {nextMilestone && (
        <div className="referral-progress">
          <div className="referral-progress-header">
            <span>Next: <strong>{nextMilestone.badge}</strong></span>
            <span>{referralShareCount}/{nextMilestone.count} shares</span>
          </div>
          <div className="referral-progress-bar">
            <div className="referral-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <small>Reach {nextMilestone.count} shares → <strong>{nextMilestone.badge}</strong> + +{nextMilestone.hpBonus} HP</small>
        </div>
      )}
      <div className="referral-milestones">
        {referralMilestones.map((m) => {
          const reached = reachedMilestones.some((r) => r.count === m.count);
          return (
            <div className={`referral-milestone ${reached ? "reached" : ""}`} key={m.count}>
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
