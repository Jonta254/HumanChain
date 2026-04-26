import type { HumanChainPaidFeature } from "./minikit";

export type WldFeature = {
  amount: 1 | 2 | 3 | 4 | 5 | 6;
  feature: HumanChainPaidFeature;
  label: string;
  benefit: string;
};

export const wldFeatureMenu: WldFeature[] = [
  {
    amount: 1,
    feature: "tip",
    label: "Tip or Golden Link",
    benefit: "Thank a helpful human or highlight one daily chain link.",
  },
  {
    amount: 2,
    feature: "pin-link",
    label: "Pin or Bonus Pages",
    benefit: "Give a link more visibility or unlock story bonus pages.",
  },
  {
    amount: 3,
    feature: "ask-country",
    label: "Ask One Country",
    benefit: "Get answers from verified humans in a specific country.",
  },
  {
    amount: 4,
    feature: "private-ask",
    label: "Private Verified Ask",
    benefit: "Ask anonymously while still proving you are human.",
  },
  {
    amount: 5,
    feature: "voice-answers",
    label: "Voice Answers",
    benefit: "Request short voice replies from real humans.",
  },
  {
    amount: 6,
    feature: "deep-verdict",
    label: "Deep Human Verdict",
    benefit: "Unlock country differences, best answers, and a full summary.",
  },
];
