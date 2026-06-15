"use client";

import type { Dispatch, SetStateAction } from "react";
import { Home } from "lucide-react";
import { AppSettingsBar } from "@/components/layout/AppSettingsBar";
import { SafetyCenter } from "@/components/tabs/SafetyCenter";
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
      <SafetyCenter act={act} />
    </div>
  );
}
