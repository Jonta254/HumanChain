"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  Globe2,
  Home,
  Info,
  LockKeyhole,
  MessageCircle,
  ScrollText,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { AppSettingsBar } from "@/components/layout/AppSettingsBar";
import { LegalSheet } from "@/components/layout/LegalSheet";
import { SafetyCenter } from "@/components/tabs/SafetyCenter";
import { humanHaptic } from "@/lib/world/haptics";
import type { AppLanguage } from "@/lib/data/languages";
import type { WorldMiniAppContext } from "@/lib/world/types";
import type { Tab } from "@/types/ui";

const APP_VERSION = "1.0.0";
const WORLD_MINIKIT_VERSION = "2.0.3";

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
  worldContext: WorldMiniAppContext;
}) {
  const [legalDoc, setLegalDoc] = useState<"terms" | "privacy" | null>(null);

  return (
    <div className="screen settings-screen">
      {legalDoc && <LegalSheet doc={legalDoc} onClose={() => setLegalDoc(null)} />}
      {/* ── App controls ──────────────────────────────────── */}
      <AppSettingsBar
        activeLanguage={activeLanguage}
        clearMarketplaceData={clearMarketplaceData}
        clearPostData={clearPostData}
        defaultOpen
        deleteLocalAccount={deleteLocalAccount}
        notificationReady={notificationReady}
        onEnableNotifications={onEnableNotifications}
        onChange={onChangeLanguage}
        resetHistory={resetHistory}
        worldContext={worldContext}
      />

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
            onClick={() => act("Push frequency", "Notifications batch into daily digests to respect your attention.")}
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
            onClick={() => act("World ID verification", "Your World ID proof is verified on-chain. No personal data leaves World App.")}
            type="button"
          >
            <div className="sv-row-left">
              <span className="sv-row-label">World ID Verification</span>
              <span className="sv-row-sub">Proof-of-personhood · on-chain</span>
            </div>
            <BadgeCheck size={16} color="#2f6fed" />
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
          <div className="sv-row sv-info-row">
            <div className="sv-row-left">
              <span className="sv-row-label">Launch source</span>
              <span className="sv-row-sub">{worldContext.launchLocation ?? "World App"}</span>
            </div>
          </div>
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
        <div className="sv-rows">
          <div className="sv-row sv-info-row">
            <div className="sv-row-left">
              <span className="sv-row-label">App version</span>
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
              <span className="sv-row-label">World App integration</span>
              <span className="sv-row-sub">SIWE · World ID · WLD payments · Notifications</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Danger ────────────────────────────────────────── */}
      <section className="panel sv-panel sv-danger-panel">
        <div className="sv-section-head"><Trash2 size={16} color="#d63a4a" /><strong style={{ color: "#d63a4a" }}>Data Management</strong></div>
        <div className="sv-rows">
          <button
            className="sv-row sv-danger-row"
            onClick={() => {
              act("History cleared", "Your activity history was reset. Chain score and HP are not affected.");
              resetHistory();
            }}
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
            onClick={() => {
              act("Marketplace data cleared", "All your local market listings and bids were removed.");
              clearMarketplaceData();
            }}
            type="button"
          >
            <div className="sv-row-left">
              <span className="sv-row-label">Clear marketplace data</span>
              <span className="sv-row-sub">Removes local listings and bids</span>
            </div>
            <Trash2 size={14} color="#d63a4a" />
          </button>
        </div>
      </section>

      {/* ── Safety Center (full component) ─────────────────── */}
      <SafetyCenter act={act} />

      {/* ── Return ────────────────────────────────────────── */}
      <section className="panel settings-return-panel">
        <button onClick={() => setTab("home")} type="button" className="sv-home-btn">
          <Home size={16} /> Back to Home
        </button>
      </section>

      {/* Spacer for bottom nav */}
      <div style={{ height: 24 }} />
    </div>
  );
}
