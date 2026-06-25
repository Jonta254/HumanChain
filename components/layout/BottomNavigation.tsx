"use client";

import { BookOpen, Compass, Home, Plus, Store } from "lucide-react";
import { BottomBar, Haptic, TabItem, Tabs } from "@worldcoin/mini-apps-ui-kit-react";
import type { Tab } from "@/types/ui";

type NavLanguage = {
  nav: {
    home: string;
    market: string;
  };
};

export function BottomNavigation({
  active,
  appLanguage,
  onChange,
  onCreate,
}: {
  active: Tab;
  appLanguage: NavLanguage;
  onChange: (tab: Tab) => void;
  onCreate: () => void;
}) {
  return (
    <div className="bottom-nav--hc">
    <BottomBar aria-label="Primary navigation">
      <Tabs
        value={active}
        onValueChange={(v) => onChange(v as Tab)}
        className="bn-tabs-left"
      >
        <TabItem value="home"   icon={<Home    size={22} />} label={appLanguage.nav.home} />
        <TabItem value="chains" icon={<Compass size={22} />} label="Discover" />
      </Tabs>

      <Haptic variant="impact" type="medium" asChild>
        <button
          aria-label="Open Create page"
          className={`bn-fab${active === "create" ? " active" : ""}`}
          onClick={onCreate}
          type="button"
        >
          <Plus size={26} strokeWidth={2.6} />
        </button>
      </Haptic>

      <Tabs
        value={active}
        onValueChange={(v) => onChange(v as Tab)}
        className="bn-tabs-right"
      >
        <TabItem value="stories" icon={<BookOpen size={22} />} label="Stories" />
        <TabItem value="market"  icon={<Store    size={22} />} label={appLanguage.nav.market} />
      </Tabs>
    </BottomBar>
    </div>
  );
}
