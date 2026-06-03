"use client";

import type { Dispatch, SetStateAction } from "react";
import { Home, ShieldCheck } from "lucide-react";
import { AppSettingsBar } from "@/components/layout/AppSettingsBar";
import { TopBar } from "@/components/layout/TopBar";
import type { AppLanguage } from "@/lib/data/languages";
import type { WorldMiniAppContext } from "@/lib/world/types";
import type { Tab } from "@/types/ui";

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
  return (
    <div className="screen settings-screen">
      <TopBar title="Settings" subtitle="Mini app controls, guides, and World context" />
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
      <section className="panel settings-return-panel">
        <div className="section-heading">
          <span>Return</span>
          <Home size={18} />
        </div>
        <button onClick={() => setTab("home")} type="button">
          Back to Home
        </button>
      </section>
      <section className="settings-safety-center" aria-label="Safety center">
        <div className="section-heading">
          <span>Safety Center</span>
          <ShieldCheck size={18} />
        </div>
        {[
          "Community Rules",
          "Governance",
          "Reporting",
          "Appeals",
          "Safety Tips",
          "Scam Prevention",
        ].map((item) => (
          <button
            key={item}
            onClick={() =>
              act(
                item,
                `${item} guidance is available in HumanChain settings, with public rules kept outside the posting feed.`,
              )
            }
            type="button"
          >
            {item}
          </button>
        ))}
      </section>
    </div>
  );
}
