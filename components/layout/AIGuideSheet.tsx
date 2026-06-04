"use client";
import { useState } from "react";
import { BookOpen, ShieldCheck, Sparkles, Store, Users, X } from "lucide-react";

const guides = [
  {
    id: "reputation",
    icon: <Sparkles size={20} />,
    title: "Reputation Coach",
    steps: [
      "Answer the daily question every day — each answer adds +18 HP",
      "Post one real photo moment each day — adds +10 HP and builds trust",
      "Complete verified marketplace trades — every confirmed WLD payment adds trust score",
      "Keep your streak alive — a 7-day streak unlocks Streak Builder badge",
      "Earn enough HP to reach Gold Human status (420+ HP)",
    ],
  },
  {
    id: "marketplace",
    icon: <Store size={20} />,
    title: "Marketplace Guide",
    steps: [
      "Always connect your location before browsing — this ranks nearest listings first",
      "Listings require 2 real photos, clear price, and condition disclosure",
      "Chat with the seller using World Chat before agreeing to meet",
      "Never pay outside the World App payment flow — bids are recorded on-chain",
      "Use the Hold function to reserve an item while you confirm inspection details",
    ],
  },
  {
    id: "world",
    icon: <ShieldCheck size={20} />,
    title: "World Guide",
    steps: [
      "World ID proves you are a unique human — not a bot, not duplicated",
      "Your wallet address is never shown publicly — only @username is visible",
      "All payments go through MiniKit — HumanChain never stores card or bank details",
      "You can revoke HumanChain permissions at any time inside World App settings",
      "Preview mode lets you browse before verifying — all public actions require World ID",
    ],
  },
  {
    id: "community",
    icon: <Users size={20} />,
    title: "Community Guide",
    steps: [
      "Chains tab has 8 active community rooms — Faith, Builders, Love, Culture, Health, Migration, Youth, Parents",
      "Enter a room to read real wisdom from verified humans across different countries",
      "Add a link to the main chain — your username appears on the live feed globally",
      "Premium: pay 2 WLD to create a private Circle with up to 50 verified members",
      "World Pulse (1 WLD) lets you send a chain message directly to 500+ active readers",
    ],
  },
  {
    id: "safety",
    icon: <BookOpen size={20} />,
    title: "Safety Center",
    steps: [
      "Report any post, listing, or link using the flag button — it goes to human review within 24h",
      "Block any human to stop them from seeing your posts and listings",
      "Never share GPS coordinates or home address in listing descriptions",
      "Marketplace meetups should happen in public places — confirm by chat first",
      "HumanChain Safety Score stays clean unless a report is upheld against your account",
    ],
  },
];

export function AIGuideSheet({
  chainScore,
  onClose,
  points,
  streak,
}: {
  chainScore: number;
  onClose: () => void;
  points: number;
  streak: number;
}) {
  const [active, setActive] = useState<string | null>(null);
  const activeGuide = guides.find((g) => g.id === active);

  return (
    <div className="ai-guide-backdrop" role="dialog" aria-modal="true" aria-label="AI Guide">
      <div className="ai-guide-sheet">
        <div className="ai-guide-header">
          <div>
            <strong>HumanChain Guide</strong>
            <span>{points} HP · {streak}d streak · Score {chainScore}</span>
          </div>
          <button aria-label="Close guide" onClick={onClose} type="button"><X size={20} /></button>
        </div>

        {!activeGuide ? (
          <div className="ai-guide-topics">
            <p className="ai-guide-intro">Your personal guide for HumanChain. Tap any topic to read real, actionable steps.</p>
            {guides.map((guide) => (
              <button key={guide.id} className="ai-guide-topic-btn" onClick={() => setActive(guide.id)} type="button">
                <span className="ai-guide-topic-icon">{guide.icon}</span>
                <div>
                  <strong>{guide.title}</strong>
                  <span>{guide.steps.length} steps</span>
                </div>
                <span className="ai-guide-topic-arrow">›</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="ai-guide-content">
            <button className="ai-guide-back" onClick={() => setActive(null)} type="button">← Back to topics</button>
            <div className="ai-guide-topic-header">
              {activeGuide.icon}
              <strong>{activeGuide.title}</strong>
            </div>
            <ol className="ai-guide-steps">
              {activeGuide.steps.map((step, i) => (
                <li key={i}><span>{i + 1}</span><p>{step}</p></li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
