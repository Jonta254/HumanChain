"use client";

import { BookOpen, Compass, Home, Plus, Store } from "lucide-react";
import { Haptic, TabItem, Tabs } from "@worldcoin/mini-apps-ui-kit-react";
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
    <nav className="bottom-nav--hc" aria-label="Primary navigation" role="navigation">
      <Tabs
        value={active}
        onValueChange={(v) => onChange(v as Tab)}
        className="bn-tabs-left"
      >
        <TabItem
          value="home"
          icon={<Home size={22} />}
          label={appLanguage.nav.home}
          aria-current={active === "home" ? "page" : undefined}
        />
        <TabItem
          value="chains"
          icon={<Compass size={22} />}
          label="Discover"
          aria-current={active === "chains" ? "page" : undefined}
        />
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
        <TabItem
          value="stories"
          icon={<BookOpen size={22} />}
          label="Stories"
          aria-current={active === "stories" ? "page" : undefined}
        />
        <TabItem
          value="market"
          icon={<Store size={22} />}
          label={appLanguage.nav.market}
          aria-current={active === "market" ? "page" : undefined}
        />
      </Tabs>
    </nav>
  );
}
