"use client";

import { useState } from "react";
import { BookOpen, ChevronLeft, ShieldCheck, Sparkles, Store, Users } from "lucide-react";
import {
  BottomBar,
  BulletList,
  BulletListItem,
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  Haptic,
  ListItem,
  Typography,
} from "@worldcoin/mini-apps-ui-kit-react";

const guides = [
  {
    id: "reputation",
    icon: <Sparkles size={20} />,
    title: "Reputation Coach",
    steps: [
      "Answer the daily question every day — each answer adds +18 HP",
      "Post one real photo moment each day — adds +16 HP and builds trust",
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
      "Premium: pay 3 WLD to create a private Circle for 12 verified humans with a shared topic room",
      "World Pulse (1 WLD) unlocks live sentiment, the strongest quote, active field, and who's driving the chain today",
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
    <Drawer open onOpenChange={(open) => { if (!open) onClose(); }} height="full">
      <DrawerContent>
        <DrawerHeader icon={<Sparkles size={20} />}>
          <DrawerTitle>
            {activeGuide ? activeGuide.title : "HumanChain Guide"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="ai-guide-body">
          {!activeGuide ? (
            <>
              <div className="ai-guide-stats-row">
                <span className="ai-guide-stat"><strong>{points}</strong><span>HP</span></span>
                <span className="ai-guide-stat"><strong>{streak}d</strong><span>streak</span></span>
                <span className="ai-guide-stat"><strong>{chainScore}</strong><span>score</span></span>
              </div>
              <Typography variant="body" level={2} className="ai-guide-intro">
                Your personal guide for HumanChain. Tap any topic for real, actionable steps.
              </Typography>
              <div className="ai-guide-topics">
                {guides.map((guide) => (
                  <Haptic key={guide.id} variant="selection" asChild>
                    <ListItem
                      label={guide.title}
                      description={`${guide.steps.length} steps`}
                      startAdornment={<span className="ai-guide-topic-icon">{guide.icon}</span>}
                      onClick={() => setActive(guide.id)}
                    />
                  </Haptic>
                ))}
              </div>
            </>
          ) : (
            <>
              <Haptic variant="selection" asChild>
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => setActive(null)}
                  type="button"
                  className="ai-guide-back-btn"
                >
                  <ChevronLeft size={16} />
                  Back to topics
                </Button>
              </Haptic>
              <BulletList className="ai-guide-steps">
                {activeGuide.steps.map((step, i) => (
                  <BulletListItem key={i}>
                    <Typography variant="body" level={2}>{step}</Typography>
                  </BulletListItem>
                ))}
              </BulletList>
            </>
          )}
        </div>

        <BottomBar>
          <Haptic variant="selection" asChild>
            <Button variant="secondary" fullWidth onClick={onClose} type="button">
              Close
            </Button>
          </Haptic>
        </BottomBar>
      </DrawerContent>
    </Drawer>
  );
}
