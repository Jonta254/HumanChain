"use client";

import { BookOpen, Compass, Home, Plus, Store } from "lucide-react";
import { humanHaptic } from "@/lib/worldMiniApp";
import type { Tab } from "@/types/ui";

type NavLanguage = {
  nav: {
    home: string;
    market: string;
  };
};

// HumanChain primary nav: Home | Discover | (+ Create) | Reputation | Market.
// Create is a raised center FAB, not a tab. Discover → ChainsView (Moments/Links/Rooms).
// Reputation → MeView (passport + profile). Market → MarketplaceView.
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
  const leftItems: Array<[Tab, string, React.ReactNode]> = [
    ["home",   appLanguage.nav.home, <Home    key="home"     size={22} />],
    ["chains", "Discover",           <Compass key="discover" size={22} />],
  ];
  const rightItems: Array<[Tab, string, React.ReactNode]> = [
    ["stories", "Stories",              <BookOpen key="stories" size={22} />],
    ["market",  appLanguage.nav.market, <Store    key="market"  size={22} />],
  ];

  return (
    <nav className="bottom-nav bottom-nav--hc" aria-label="Primary navigation">
      <div className="bn-slot">
        {leftItems.map(renderItem)}
      </div>

      <div className="bn-create-wrap">
        <button
          className={`bn-create${active === "create" ? " active" : ""}`}
          aria-current={active === "create" ? "page" : undefined}
          onClick={() => { void humanHaptic("medium"); onCreate(); }}
          aria-label="Open Create page"
          type="button"
        >
          <span className="bn-create-icon" aria-hidden="true">
            <Plus size={26} strokeWidth={2.6} />
          </span>
          <span className="bn-create-label">Create</span>
        </button>
      </div>

      <div className="bn-slot">
        {rightItems.map(renderItem)}
      </div>
    </nav>
  );

  function renderItem([key, label, icon]: [Tab, string, React.ReactNode]) {
    const isActive = active === key;
    return (
      <button
        aria-current={isActive ? "page" : undefined}
        className={`bn-tab${isActive ? " active" : ""}`}
        data-tab={key}
        key={key}
        onClick={() => { void humanHaptic("light"); onChange(key); }}
        type="button"
      >
        {isActive && <span className="bn-pip" aria-hidden="true" />}
        <span className="bn-icon" aria-hidden="true">{icon}</span>
        <span className="bn-label">{label}</span>
      </button>
    );
  }
}
