"use client";

import { Fragment, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  ExternalLink,
  Globe2,
  Home,
  Info,
  LockKeyhole,
  Mail,
  MessageCircle,
  ScrollText,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Zap,
} from "lucide-react";
import { LegalSheet } from "@/components/layout/LegalSheet";
import { SafetyCenter } from "@/components/tabs/SafetyCenter";
import { humanHaptic } from "@/lib/world/haptics";
import { appLanguages, settingsEssentialsByLanguage, type AppLanguage } from "@/lib/data/languages";
import { pointRules } from "@/lib/humanchain/pointRules";
import { formatWorldLaunchLocation } from "@/lib/humanchain/utils";
import type { WorldMiniAppContext } from "@/lib/world/types";
import type { Tab } from "@/types/ui";
import type { VerifiedHuman } from "@/types/user";

const APP_VERSION = "1.0.0";
const WORLD_MINIKIT_VERSION = "2.0.3";

const worldIdTierCopy = {
  orb: { label: "Orb verified · proof-of-personhood", detail: "Your World ID was verified at an Orb — the strongest uniqueness guarantee World ID offers. No personal data leaves World App." },
  document: { label: "Document verified", detail: "Your World ID was verified by document scan. This confirms identity but not biometric uniqueness the way Orb verification does." },
  none: { label: "Wallet sign-in only · not yet World ID verified", detail: "You're signed in with your World App wallet, which proves wallet ownership but is not a World ID proof-of-personhood. Complete Orb or Document verification in World App for the strongest trust tier." },
} as const;

export function SettingsView({
  act,
  activeLanguage,
  clearMarketplaceData,
  clearPostData,
  deleteLocalAccount,
  notificationReady,
  onChangeLanguage,
  onEnableNotifications,
  resetHistory,
  setTab,
  verifiedHuman,
  worldContext,
}: {
  act: (title: string, detail: string) => void;
  activeLanguage: AppLanguage;
  clearMarketplaceData: () => void;
  clearPostData: () => void;
  deleteLocalAccount: () => void;
  notificationReady: boolean;
  onChangeLanguage: (language: AppLanguage) => void;
  onEnableNotifications: () => void | Promise<void>;
  resetHistory: () => void;
  setTab: Dispatch<SetStateAction<Tab>>;
  verifiedHuman: VerifiedHuman | null;
  worldContext: WorldMiniAppContext;
}) {
  const [legalDoc, setLegalDoc] = useState<"terms" | "privacy" | null>(null);
  const [settingsTab, setSettingsTab] = useState<"account" | "support" | "about">("account");
  // act() is an action-confirmation toast filtered to an "important terms"
  // allowlist (payment, confirmed, deleted, etc.) — it silently drops any
  // text that doesn't happen to contain one of those words, so it's the
  // wrong mechanism for "tap this row to read reference info." These rows
  // expand inline instead.
  const [expandedInfoKey, setExpandedInfoKey] = useState<string | null>(null);
  const toggleInfo = (key: string) => setExpandedInfoKey((current) => (current === key ? null : key));

  const settingsTabNav = (
    <nav className="stories-tab-nav">
      <button className={settingsTab === "account" ? "active" : ""} onClick={() => setSettingsTab("account")} type="button">Account</button>
      <button className={settingsTab === "support" ? "active" : ""} onClick={() => setSettingsTab("support")} type="button">Support</button>
      <button className={settingsTab === "about" ? "active" : ""} onClick={() => setSettingsTab("about")} type="button">About</button>
    </nav>
  );

  const returnFooter = (
    <>
      <section className="panel settings-return-panel">
        <button onClick={() => setTab("home")} type="button" className="sv-home-btn">
          <Home size={16} /> Back to Home
        </button>
      </section>
      {/* Spacer for bottom nav */}
      <div style={{ height: 24 }} />
    </>
  );

  if (settingsTab === "support") {
    return (
      <div className="screen settings-screen">
        {legalDoc && <LegalSheet doc={legalDoc} onClose={() => setLegalDoc(null)} />}
        {settingsTabNav}

        {/* ── AI Guide ──────────────────────────────────────── */}
        <section className="panel sv-panel">
          <div className="sv-section-head"><Sparkles size={16} /><strong>AI Guide</strong></div>
          <div className="sv-rows">
            <button
              className="sv-row"
              onClick={() => act("AI Guide", "The AI Guide uses your chain score, streak, and activity to give real next-step guidance — not generic advice.")}
              type="button"
            >
              <div className="sv-row-left">
                <span className="sv-row-label">Personalized coaching</span>
                <span className="sv-row-sub">Based on your score, streak, and activity</span>
              </div>
              <Sparkles size={14} color="#6657d9" />
            </button>
            <button
              className="sv-row"
              onClick={() => setTab("home")}
              type="button"
            >
              <div className="sv-row-left">
                <span className="sv-row-label">Open AI Guide</span>
                <span className="sv-row-sub">From Home → Guide button</span>
              </div>
              <ChevronRight size={15} className="sv-chevron" />
            </button>
          </div>
        </section>

        {/* ── Human Points ──────────────────────────────────── */}
        <section className="panel sv-panel points-ledger">
          <div className="sv-section-head"><Star size={16} /><strong>How Human Points Work</strong></div>
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

        {/* ── Safety ────────────────────────────────────────── */}
        <section className="panel sv-panel">
          <div className="sv-section-head"><Shield size={16} /><strong>Safety Center</strong></div>
          <div className="sv-rows">
            <button
              className="sv-row"
              onClick={() => act("Community rules", "HumanChain enforces dignity in every post, answer, and trade. See the Safety Center below.")}
              type="button"
            >
              <div className="sv-row-left">
                <span className="sv-row-label">Community standards</span>
                <span className="sv-row-sub">Verified humans · dignity enforced</span>
              </div>
              <ChevronRight size={15} className="sv-chevron" />
            </button>
            <button
              className="sv-row"
              onClick={() => act("Report abuse", "Use the Report button on any post, answer, or listing to flag it for review.")}
              type="button"
            >
              <div className="sv-row-left">
                <span className="sv-row-label">Report abuse</span>
                <span className="sv-row-sub">Available on every post and answer</span>
              </div>
              <MessageCircle size={14} color="#d63a4a" />
            </button>
          </div>
        </section>

        {/* ── Safety Center (full component) ─────────────────── */}
        <SafetyCenter act={act} />

        {returnFooter}
      </div>
    );
  }

  if (settingsTab === "about") {
    return (
      <div className="screen settings-screen">
        {legalDoc && <LegalSheet doc={legalDoc} onClose={() => setLegalDoc(null)} />}
        {settingsTabNav}

        {/* ── Legal ─────────────────────────────────────────── */}
        <section className="panel sv-panel">
          <div className="sv-section-head"><ScrollText size={16} /><strong>Legal</strong></div>
          <div className="sv-rows">
            <button
              className="sv-row"
              onClick={async () => { await humanHaptic("light"); setLegalDoc("terms"); }}
              type="button"
            >
              <div className="sv-row-left">
                <span className="sv-row-label">Terms of Use</span>
                <span className="sv-row-sub">Rules, payments, and your rights</span>
              </div>
              <ChevronRight size={15} className="sv-chevron" />
            </button>
            <button
              className="sv-row"
              onClick={async () => { await humanHaptic("light"); setLegalDoc("privacy"); }}
              type="button"
            >
              <div className="sv-row-left">
                <span className="sv-row-label">Privacy Policy</span>
                <span className="sv-row-sub">What we collect, store, and never sell</span>
              </div>
              <ChevronRight size={15} className="sv-chevron" />
            </button>
          </div>
        </section>

        {/* ── About ─────────────────────────────────────────── */}
        <section className="panel sv-panel">
          <div className="sv-section-head"><Info size={16} /><strong>About HumanChain</strong></div>
          <div className="sv-about-brand">
            <div className="sv-about-logo" aria-hidden="true">HC</div>
            <div className="sv-about-copy">
              <strong>HumanChain</strong>
              <span>The first trust-first network built for verified humans — ask, post, trade, and build your Human Passport inside World App.</span>
            </div>
          </div>
          <div className="sv-rows">
            <div className="sv-row sv-info-row">
              <div className="sv-row-left">
                <span className="sv-row-label">Version</span>
                <span className="sv-row-sub">HumanChain v{APP_VERSION}</span>
              </div>
            </div>
            <div className="sv-row sv-info-row">
              <div className="sv-row-left">
                <span className="sv-row-label">MiniKit SDK</span>
                <span className="sv-row-sub">@worldcoin/minikit-js v{WORLD_MINIKIT_VERSION}</span>
              </div>
            </div>
            <div className="sv-row sv-info-row">
              <div className="sv-row-left">
                <span className="sv-row-label">World App</span>
                <span className="sv-row-sub">SIWE · World ID · WLD payments · Notifications</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Connect ───────────────────────────────────────── */}
        <section className="panel sv-panel">
          <div className="sv-section-head"><Globe2 size={16} /><strong>Connect with HumanChain</strong></div>
          <div className="sv-rows">
            <button
              className="sv-row"
              onClick={() => window.open("https://x.com/HumanChainWorld", "_blank", "noopener,noreferrer")}
              type="button"
              aria-label="Follow HumanChain on X"
            >
              <div className="sv-row-icon sv-icon-x" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.713 6.057zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <div className="sv-row-left">
                <span className="sv-row-label">X (Twitter)</span>
                <span className="sv-row-sub">@HumanChainWorld · news and updates</span>
              </div>
              <ExternalLink size={14} className="sv-chevron" />
            </button>
            <button
              className="sv-row"
              onClick={() => window.open("https://t.me/HumanChainApp", "_blank", "noopener,noreferrer")}
              type="button"
              aria-label="Join HumanChain Telegram"
            >
              <div className="sv-row-icon sv-icon-telegram" aria-hidden="true">
                <Send size={14} />
              </div>
              <div className="sv-row-left">
                <span className="sv-row-label">Telegram</span>
                <span className="sv-row-sub">@HumanChainApp · community and support</span>
              </div>
              <ExternalLink size={14} className="sv-chevron" />
            </button>
            <button
              className="sv-row"
              onClick={() => window.open("mailto:humanchainworld@gmail.com", "_blank")}
              type="button"
              aria-label="Email HumanChain"
            >
              <div className="sv-row-icon sv-icon-email" aria-hidden="true">
                <Mail size={14} />
              </div>
              <div className="sv-row-left">
                <span className="sv-row-label">Email</span>
                <span className="sv-row-sub">humanchainworld@gmail.com</span>
              </div>
              <ExternalLink size={14} className="sv-chevron" />
            </button>
          </div>
        </section>

        {returnFooter}
      </div>
    );
  }

  const settingsCopy = activeLanguage.settings;
  const essentials =
    settingsEssentialsByLanguage[activeLanguage.code] ??
    settingsEssentialsByLanguage.en;
  const worldLaunchLabel = formatWorldLaunchLocation(worldContext.launchLocation);

  return (
    <div className="screen settings-screen">
      {legalDoc && <LegalSheet doc={legalDoc} onClose={() => setLegalDoc(null)} />}
      {settingsTabNav}

      {/* ── Language ──────────────────────────────────────── */}
      <section className="panel sv-panel">
        <div className="sv-section-head"><Globe2 size={16} /><strong>{settingsCopy.language}</strong></div>
        <p className="sv-panel-hint">{essentials.languageHint}</p>
        <div className="settings-language-row">
          {appLanguages.map((language) => (
            <button
              className={activeLanguage.code === language.code ? "active" : ""}
              key={language.code}
              onClick={() => onChangeLanguage(language)}
              type="button"
            >
              {language.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── App guide ─────────────────────────────────────── */}
      <section className="panel sv-panel">
        <div className="sv-section-head"><Info size={16} /><strong>{settingsCopy.guide}</strong></div>
        <div className="sv-rows">
          {(
            [
              { key: "guide", label: "How HumanChain works", sub: "Trust, questions, and marketplace rules", points: activeLanguage.points },
              { key: "data", label: essentials.dataTitle, sub: "Local-first storage, explained", points: essentials.dataPoints },
              { key: "location", label: essentials.locationTitle, sub: "How nearby market location works", points: essentials.locationPoints },
              { key: "account", label: essentials.accountTitle, sub: "Keep your account and trades safe", points: essentials.accountPoints },
            ] as const
          ).map((item) => (
            <Fragment key={item.key}>
              <button
                aria-expanded={expandedInfoKey === item.key}
                className="sv-row"
                onClick={() => toggleInfo(item.key)}
                type="button"
              >
                <div className="sv-row-left">
                  <span className="sv-row-label">{item.label}</span>
                  <span className="sv-row-sub">{item.sub}</span>
                </div>
                <ChevronRight size={15} className={`sv-chevron${expandedInfoKey === item.key ? " sv-chevron-open" : ""}`} />
              </button>
              {expandedInfoKey === item.key ? (
                <div className="sv-info-expand">
                  {item.points.map((point) => <p key={point}>{point}</p>)}
                </div>
              ) : null}
            </Fragment>
          ))}
        </div>
      </section>

      {/* ── Notifications ─────────────────────────────────── */}
      <section className="panel sv-panel">
        <div className="sv-section-head"><Bell size={16} /><strong>Notifications</strong></div>
        <div className="sv-rows">
          <button
            className="sv-row"
            onClick={async () => {
              await humanHaptic("light");
              if (notificationReady) {
                act("Notifications active", "World App notifications are connected and ready.");
              } else {
                void onEnableNotifications();
              }
            }}
            type="button"
          >
            <div className="sv-row-left">
              <span className="sv-row-label">World App Notifications</span>
              <span className="sv-row-sub">Inbox, market, payment, story alerts</span>
            </div>
            <span className={`sv-toggle-badge ${notificationReady ? "on" : "off"}`}>
              {notificationReady ? "On" : "Enable"}
            </span>
          </button>
          <button
            className="sv-row"
            onClick={() => act("What triggers an alert", essentials.notificationsHint)}
            type="button"
          >
            <div className="sv-row-left">
              <span className="sv-row-label">Notification frequency</span>
              <span className="sv-row-sub">Batched — one digest per day</span>
            </div>
            <ChevronRight size={15} className="sv-chevron" />
          </button>
        </div>
      </section>

      {/* ── World App integration ──────────────────────────── */}
      <section className="panel sv-panel">
        <div className="sv-section-head"><Globe2 size={16} /><strong>World App Integration</strong></div>
        <div className="sv-rows">
          <button
            className="sv-row"
            onClick={() => act(
              worldIdTierCopy[verifiedHuman?.worldIdTier ?? "none"].label,
              worldIdTierCopy[verifiedHuman?.worldIdTier ?? "none"].detail,
            )}
            type="button"
          >
            <div className="sv-row-left">
              <span className="sv-row-label">World ID Verification</span>
              <span className="sv-row-sub">{worldIdTierCopy[verifiedHuman?.worldIdTier ?? "none"].label}</span>
            </div>
            <BadgeCheck size={16} color={verifiedHuman?.worldIdTier === "orb" ? "#2f6fed" : "#8a94a0"} />
          </button>
          <button
            className="sv-row"
            onClick={() => act("SIWE Authentication", "Sign In With Ethereum keeps your session private. Your wallet signs a nonce — no password.")}
            type="button"
          >
            <div className="sv-row-left">
              <span className="sv-row-label">SIWE Authentication</span>
              <span className="sv-row-sub">Wallet-signed sessions · no password</span>
            </div>
            <ShieldCheck size={15} color="#137a57" />
          </button>
          <button
            className="sv-row"
            onClick={() => act("WLD Payments", "All payments go through World App's native payment sheet. HumanChain never touches your keys.")}
            type="button"
          >
            <div className="sv-row-left">
              <span className="sv-row-label">WLD Payments</span>
              <span className="sv-row-sub">World App native · treasury escrow</span>
            </div>
            <Zap size={15} color="#b88a1f" />
          </button>
          <button
            aria-expanded={expandedInfoKey === "world-context"}
            className="sv-row"
            onClick={() => toggleInfo("world-context")}
            type="button"
          >
            <div className="sv-row-left">
              <span className="sv-row-label">Launch source</span>
              <span className="sv-row-sub">{worldLaunchLabel}</span>
            </div>
            <ChevronRight size={15} className={`sv-chevron${expandedInfoKey === "world-context" ? " sv-chevron-open" : ""}`} />
          </button>
          {expandedInfoKey === "world-context" ? (
            <div className="sv-info-expand">
              <p>{settingsCopy.openedFrom} {worldLaunchLabel}. {worldContext.deviceOS ?? activeLanguage.gate.deviceFallback} {settingsCopy.deviceReady}.</p>
              <p>World MiniKit provides launch and device context — nearby market only asks for location when you tap GPS, or uses your manual area.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── Privacy ───────────────────────────────────────── */}
      <section className="panel sv-panel">
        <div className="sv-section-head"><LockKeyhole size={16} /><strong>Privacy</strong></div>
        <div className="sv-rows">
          <button
            className="sv-row"
            onClick={() => act("Anonymous mode", "Use anonymous-answer in Ask to hide your identity from other users for 1.5 WLD per answer.")}
            type="button"
          >
            <div className="sv-row-left">
              <span className="sv-row-label">Anonymous answering</span>
              <span className="sv-row-sub">1.5 WLD per answer · hides identity</span>
            </div>
            <ChevronRight size={15} className="sv-chevron" />
          </button>
          <button
            className="sv-row"
            onClick={() => act("Local data", "All posts, listings, and bids are stored locally on your device. Cloud sync is opt-in per item.")}
            type="button"
          >
            <div className="sv-row-left">
              <span className="sv-row-label">Data storage</span>
              <span className="sv-row-sub">Local-first · opt-in cloud sync</span>
            </div>
            <ChevronRight size={15} className="sv-chevron" />
          </button>
        </div>
      </section>

      {/* ── Danger ────────────────────────────────────────── */}
      <section className="panel sv-panel sv-danger-panel">
        <div className="sv-section-head"><Trash2 size={16} color="#d63a4a" /><strong style={{ color: "#d63a4a" }}>Data Management</strong></div>
        <div className="sv-rows">
          <button
            className="sv-row sv-danger-row"
            onClick={resetHistory}
            type="button"
          >
            <div className="sv-row-left">
              <span className="sv-row-label">Reset history</span>
              <span className="sv-row-sub">Clears activity log · keeps HP and score</span>
            </div>
            <Trash2 size={14} color="#d63a4a" />
          </button>
          <button
            className="sv-row sv-danger-row"
            onClick={clearMarketplaceData}
            type="button"
          >
            <div className="sv-row-left">
              <span className="sv-row-label">Clear marketplace data</span>
              <span className="sv-row-sub">Removes local listings and bids</span>
            </div>
            <Trash2 size={14} color="#d63a4a" />
          </button>
          <button
            className="sv-row sv-danger-row"
            onClick={clearPostData}
            type="button"
          >
            <div className="sv-row-left">
              <span className="sv-row-label">Clear posts</span>
              <span className="sv-row-sub">Removes your local image posts</span>
            </div>
            <Trash2 size={14} color="#d63a4a" />
          </button>
          <button
            className="sv-row sv-danger-row"
            onClick={deleteLocalAccount}
            type="button"
          >
            <div className="sv-row-left">
              <span className="sv-row-label">Delete local account</span>
              <span className="sv-row-sub">Wipes preview profile and all local data on this device</span>
            </div>
            <Trash2 size={14} color="#d63a4a" />
          </button>
        </div>
      </section>

      {returnFooter}
    </div>
  );
}
