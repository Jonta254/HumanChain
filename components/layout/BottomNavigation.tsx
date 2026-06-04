"use client";

import { Home, MessageCircleQuestion, Sparkles, Store } from "lucide-react";
import { humanHaptic } from "@/lib/worldMiniApp";
import type { Tab } from "@/types/ui";

type NavLanguage = {
  nav: {
    home: string;
    ask: string;
    market: string;
  };
};

export function BottomNavigation({
  active,
  appLanguage,
  onChange,
}: {
  active: Tab;
  appLanguage: NavLanguage;
  onChange: (tab: Tab) => void;
}) {
  const items: Array<[Tab, string, React.ReactNode]> = [
    ["home", appLanguage.nav.home, <Home key="home" size={20} />],
    ["ask", appLanguage.nav.ask, <MessageCircleQuestion key="ask" size={20} />],
    ["chains", "Moments", <Sparkles key="chains" size={20} />],
    ["market", appLanguage.nav.market, <Store key="market" size={20} />],
  ];

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {items.map(([key, label, icon]) => (
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
      ))}
    </nav>
  );
}
