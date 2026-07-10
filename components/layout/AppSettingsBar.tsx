"use client";

import { useState } from "react";
import { Bell, LockKeyhole, Radio, Settings, Store, Upload } from "lucide-react";
import { appLanguages, settingsEssentialsByLanguage, type AppLanguage } from "@/lib/data/languages";
import { formatWorldLaunchLocation } from "@/lib/humanchain/utils";
import type { WorldMiniAppContext } from "@/lib/world/types";

export function AppSettingsBar({
  activeLanguage,
  clearMarketplaceData,
  clearPostData,
  defaultOpen = false,
  deleteLocalAccount,
  notificationReady,
  onEnableNotifications,
  onChange,
  resetHistory,
  worldContext,
}: {
  activeLanguage: AppLanguage;
  clearMarketplaceData: () => void;
  clearPostData: () => void;
  defaultOpen?: boolean;
  deleteLocalAccount: () => void;
  notificationReady: boolean;
  onEnableNotifications: () => void | Promise<void>;
  onChange: (language: AppLanguage) => void;
  resetHistory: () => void;
  worldContext: WorldMiniAppContext;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const settingsCopy = activeLanguage.settings;
  const essentials =
    settingsEssentialsByLanguage[activeLanguage.code] ??
    settingsEssentialsByLanguage.en;
  const worldLaunchLabel = formatWorldLaunchLocation(worldContext.launchLocation);

  return (
    <section className="app-settings-bar" aria-label={settingsCopy.title}>
      <div className="settings-card-heading">
        <div>
          <span>{essentials.panelTitle}</span>
          <p>{essentials.panelDetail}</p>
        </div>
        <Settings size={18} />
      </div>
      <button
        aria-expanded={open}
        className="settings-trigger"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Settings size={17} />
        <span>{activeLanguage.settingsTitle}</span>
      </button>
      {open ? (
        <div className="settings-popover">
          <div className="settings-section">
            <strong>{settingsCopy.language}</strong>
            <span>{activeLanguage.name} {settingsCopy.selected}</span>
            <p>{essentials.languageHint}</p>
            <div className="settings-language-row">
              {appLanguages.map((language) => (
                <button
                  className={activeLanguage.code === language.code ? "active" : ""}
                  key={language.code}
                  onClick={() => onChange(language)}
                  type="button"
                >
                  {language.name}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-section">
            <strong>{settingsCopy.guide}</strong>
            {activeLanguage.points.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </div>
          <div className="settings-section compact">
            <strong>{essentials.dataTitle}</strong>
            {essentials.dataPoints.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </div>
          <div className="settings-section compact">
            <strong>{essentials.locationTitle}</strong>
            {essentials.locationPoints.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </div>
          <div className="settings-section compact">
            <strong>{settingsCopy.worldContext}</strong>
            <span>{settingsCopy.openedFrom} {worldLaunchLabel}</span>
            <span>{worldContext.deviceOS ?? activeLanguage.gate.deviceFallback} {settingsCopy.deviceReady}</span>
            <p>World MiniKit provides launch and device context. Nearby market asks for World App WebView location permission only when you tap GPS, or uses your manual area.</p>
          </div>
          <div className="settings-section compact">
            <strong>Notification sectors</strong>
            {[
              "Inbox replies and World Chat messages",
              "Marketplace bids, accepted offers, boosts, and listing expiry",
              "Daily questions, streaks, story drops, payments, and account safety",
            ].map((point) => (
              <p key={point}>{point}</p>
            ))}
            <p>World requires Developer Portal permission, MiniKit user consent, and functional-only messages.</p>
          </div>
          <div className="settings-section compact">
            <strong>{essentials.accountTitle}</strong>
            {essentials.accountPoints.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </div>
          <div className="settings-section compact settings-account-controls">
            <strong>Data and account controls</strong>
            <p>
              HumanChain stores preview data on this device until backend storage
              is connected. Remove stored listings, posts, history, or the whole
              local account view from here.
            </p>
            <div className="settings-control-grid">
              <button onClick={clearMarketplaceData} type="button">
                <Store size={16} />
                Clear marketplace
              </button>
              <button onClick={clearPostData} type="button">
                <Upload size={16} />
                Clear posts
              </button>
              <button onClick={resetHistory} type="button">
                <Radio size={16} />
                Reset history
              </button>
              <button className="danger" onClick={deleteLocalAccount} type="button">
                <LockKeyhole size={16} />
                Delete local account
              </button>
            </div>
          </div>
          <button
            className={`settings-notification${notificationReady ? " active" : ""}`}
            disabled={notificationReady}
            onClick={onEnableNotifications}
            type="button"
          >
            <Bell size={15} />
            {notificationReady ? settingsCopy.notificationsReady : settingsCopy.allowNotifications}
          </button>
          <p className="settings-notification-note">{essentials.notificationsHint}</p>
        </div>
      ) : null}
    </section>
  );
}
