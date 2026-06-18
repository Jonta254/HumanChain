"use client";

import { useState } from "react";
import { ArrowRight, BadgeCheck, Camera, Sparkles, X } from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    color: "#137a57",
    title: "Welcome to HumanChain",
    body: "The only verified-human network inside World App. 214k real people, 38 countries — no bots, no fakes. Every member proven by World ID.",
    cta: "Get started",
  },
  {
    icon: BadgeCheck,
    color: "#2f6fed",
    title: "Prove you're human",
    body: "Tap Verify to complete a World ID proof. It's private — only a zero-knowledge signal is shared. No personal data leaves your device.",
    cta: "Got it",
  },
  {
    icon: Camera,
    color: "#b88a1f",
    title: "Post your first moment",
    body: "Share a real photo or reflection to earn +12 HP and add your first permanent link to the global chain.",
    cta: "Start earning HP",
  },
];

export function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="ob-overlay" role="dialog" aria-modal="true" aria-label="Welcome to HumanChain">
      <div className="ob-card">
        <button className="ob-skip" onClick={onComplete} type="button" aria-label="Skip onboarding">
          <X size={16} />
        </button>

        <div className="ob-step-content" key={step}>
        <div className="ob-icon-wrap" style={{ background: `${current.color}18`, color: current.color }}>
          <Icon size={32} />
        </div>

        <div className="ob-steps">
          {STEPS.map((_, i) => (
            <span key={i} className={`ob-dot${i === step ? " active" : i < step ? " done" : ""}`} />
          ))}
        </div>

        <h2 className="ob-title">{current.title}</h2>
        <p className="ob-body">{current.body}</p>
        </div>

        <button
          className="ob-cta"
          onClick={() => { if (isLast) { onComplete(); } else { setStep((s) => s + 1); } }}
          type="button"
          style={{ "--ob-color": current.color } as React.CSSProperties}
        >
          {current.cta} {isLast ? <Sparkles size={14} /> : <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
}
