"use client";

import { Award, Compass, Home, Plus, Store } from "lucide-react";
import { humanHaptic } from "@/lib/worldMiniApp";
import type { Tab } from "@/types/ui";

type NavLanguage = {
  nav: {
    home: string;
    market: string;
  };
};

// HumanChain primary nav: Home | Discover | (+ Create) | Reputation | Market.
// Create is a raised center action, not a tab. Discover and Reputation map to
// existing views (communities + passport) so World routing stays intact.
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
  const items: Array<[Tab, string, React.ReactNode]> = [
    ["home", appLanguage.nav.home, <Home key="home" size={20} />],
    ["chains", "Discover", <Compass key="discover" size={20} />],
    ["me", "Reputation", <Award key="reputation" size={20} />],
    ["market", appLanguage.nav.market, <Store key="market" size={20} />],
  ];

  return (
    <nav className="bottom-nav bottom-nav--hc" aria-label="Primary navigation">
      <div className="bn-slot">
        {renderItem(items[0])}
        {renderItem(items[1])}
      </div>

      <button
        className="bn-create"
        onClick={() => { void humanHaptic("medium"); onCreate(); }}
        aria-label="Create"
        type="button"
      >
        <Plus size={24} />
        <span>Create</span>
      </button>

      <div className="bn-slot">
        {renderItem(items[2])}
        {renderItem(items[3])}
      </div>
    </nav>
  );

  function renderItem([key, label, icon]: [Tab, string, React.ReactNode]) {
    return (
      <button
        aria-current={active === key ? "page" : undefined}
        className={active === key ? "active" : ""}
        key={key}
        onClick={() => { void humanHaptic("light"); onChange(key); }}
        type="button"
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }
}
