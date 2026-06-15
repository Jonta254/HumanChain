"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  Flag,
  Lightbulb,
  LifeBuoy,
  RotateCcw,
  Scale,
  ShieldCheck,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Real safety & trust content — kept out of the posting feed, on its own page.
// ---------------------------------------------------------------------------

type SafetyTopic = {
  id: string;
  icon: typeof BookOpen;
  color: string;
  title: string;
  summary: string;
  points: string[];
};

const SAFETY_TOPICS: SafetyTopic[] = [
  {
    id: "rules",
    icon: BookOpen,
    color: "#137a57",
    title: "Community Rules",
    summary: "The six promises every verified human keeps.",
    points: [
      "Be one real human. World ID gives every person a single account — no duplicates, bots, or impersonation.",
      "No scams, fraud, or misrepresenting a service, good, or price.",
      "No harassment, hate, threats, or sharing someone's private information.",
      "No illegal or unsafe items — weapons, drugs, counterfeits, or stolen goods.",
      "Keep money inside escrow. Moving a deal off-platform removes every protection.",
      "Keep reputation honest — no fake reviews, bids, jobs, or inflated ratings.",
    ],
  },
  {
    id: "governance",
    icon: Scale,
    color: "#2f6fed",
    title: "Governance",
    summary: "How rules are set and disputes are decided.",
    points: [
      "One human, one voice — World ID prevents vote stuffing and brigading.",
      "Disputes are weighed by verified reputation, not by who shouts loudest.",
      "Rule changes are posted here in the Safety Center first, never buried in feeds.",
      "Moderators act on reports within published timeframes; repeat breaches lose access to listing, bidding, or payouts.",
    ],
  },
  {
    id: "reporting",
    icon: Flag,
    color: "#b88a1f",
    title: "Reporting",
    summary: "How to report, and what happens next.",
    points: [
      "Open the ⋯ menu on any listing, post, or profile and choose Report.",
      "Pick a reason and add details or screenshots — more context means faster action.",
      "Reports are confidential. The person you report is never told who flagged them.",
      "Safety-critical reports are triaged within 24 hours, and you get a status update.",
    ],
  },
  {
    id: "appeals",
    icon: RotateCcw,
    color: "#6657d9",
    title: "Appeals",
    summary: "If your account or a listing is actioned.",
    points: [
      "You always receive a notice naming the exact rule and reason.",
      "Submit an appeal within 14 days with your side and any evidence.",
      "A different reviewer re-examines the case — never the same person twice.",
      "Decisions land within 7 days. Wrongful actions are reversed and your reputation restored.",
    ],
  },
  {
    id: "tips",
    icon: Lightbulb,
    color: "#0f9d6c",
    title: "Safety Tips",
    summary: "Simple habits that keep you protected.",
    points: [
      "Keep chat and payment on HumanChain — escrow only covers on-platform deals.",
      "Check a provider's work samples, ratings, and completed jobs before hiring.",
      "For local market handoffs, meet in a public place during daytime.",
      "Never share your World wallet recovery phrase. Staff will never ask for it.",
      "Release escrow milestones only after you've confirmed the work or item.",
    ],
  },
  {
    id: "scam",
    icon: AlertTriangle,
    color: "#ef7d69",
    title: "Scam Prevention",
    summary: "Red flags — if you see these, stop.",
    points: [
      "“Pay outside escrow for a discount” is the #1 scam. Always decline.",
      "Pressure to act fast, or a deal that's “today only” — slow down and verify.",
      "Requests for gift cards, upfront “fees”, or crypto to a personal wallet.",
      "Prices far below market on high-value goods are bait, not bargains.",
      "External links asking you to connect your wallet — never connect off-platform.",
    ],
  },
];

export function SafetyCenter({
  act,
}: {
  act: (title: string, detail: string) => void;
}) {
  const [openId, setOpenId] = useState<string>("rules");

  return (
    <section className="safety-center" aria-label="Safety center">
      <div className="safety-hero">
        <div className="safety-hero-row">
          <span className="safety-hero-icon"><ShieldCheck size={22} /></span>
          <div>
            <strong>Safety Center</strong>
            <span>Real protection for real humans — rules, reporting, appeals, and escrow, all in one place.</span>
          </div>
        </div>
        <div className="safety-hero-stats">
          <div><strong>24h</strong><span>SAFETY TRIAGE</span></div>
          <div><strong>100%</strong><span>WORLD ID</span></div>
          <div><strong>WLD</strong><span>ESCROW HELD</span></div>
        </div>
      </div>

      <div className="safety-list">
        {SAFETY_TOPICS.map((topic) => {
          const Icon = topic.icon;
          const open = openId === topic.id;
          return (
            <div
              key={topic.id}
              className={`safety-item ${open ? "open" : ""}`}
              style={{ "--si-color": topic.color } as React.CSSProperties}
            >
              <button
                className="safety-item-head"
                onClick={() => setOpenId(open ? "" : topic.id)}
                aria-expanded={open}
                type="button"
              >
                <span className="safety-item-icon"><Icon size={18} /></span>
                <span className="safety-item-head-text">
                  <strong>{topic.title}</strong>
                  <span>{topic.summary}</span>
                </span>
                <ChevronDown size={18} className="safety-chevron" />
              </button>
              {open && (
                <div className="safety-item-body">
                  <ul>
                    {topic.points.map((point, i) => (
                      <li key={i}>
                        <span className="safety-bullet" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="safety-footer">
        <button
          className="safety-report"
          onClick={() => act("Report submitted", "Thanks — our safety team reviews every report. Safety-critical issues are triaged within 24 hours and you'll get a status update.")}
          type="button"
        >
          <Flag size={16} />
          Report a problem
        </button>
        <button
          className="safety-contact"
          onClick={() => act("Safety team", "Reach the HumanChain safety team any time from Settings → Safety Center. Keep all chat and payments on-platform so escrow can protect you.")}
          type="button"
        >
          <LifeBuoy size={16} />
          Contact safety
        </button>
      </div>
    </section>
  );
}
