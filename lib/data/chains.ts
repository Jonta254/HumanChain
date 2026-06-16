import type { AskThread, ChainLink } from "@/types/chain";

// Canonical map from a chain link's country/topic field to its human handle.
// Shared by ChainsView and MeView so both panels always show the same author.
export const chainLinkHandleBySource: Record<string, string> = {
  Brazil: "@joy_survives", Business: "@builder_ama", Canada: "@quiet_courage",
  Care: "@care_voice", Culture: "@culture_keeper", Discipline: "@future_self",
  Faith: "@faith_link", Family: "@family_room", Ghana: "@goodname_ghana",
  Health: "@healing_chain", HumanChain: "@humanchain", Identity: "@seen_human",
  India: "@discipline_daily", Japan: "@quiet_words", Kenya: "@mara_chain",
  Love: "@love_practice", Mexico: "@workbench_mx", Money: "@money_room",
  Philippines: "@care_bridge", Portugal: "@slow_light", Prayer: "@prayer_link",
  Purpose: "@purpose_field", "South Africa": "@ubuntu_builder",
  Wisdom: "@wisdom_vault", Work: "@craft_human", World: "@world_human",
  Youth: "@youth_signal",
};

export function getChainLinkAuthor(link: ChainLink, fallback = "@verified_human"): string {
  if (link.country.startsWith("@")) return link.country;
  return chainLinkHandleBySource[link.country] ?? fallback;
}

export const initialLinks: ChainLink[] = [
  {
    country: "Kenya",
    text: "Start before life feels perfect.",
  },
  {
    country: "Brazil",
    text: "Joy is also a form of survival.",
  },
  {
    country: "India",
    text: "Discipline is love for your future self.",
  },
  {
    country: "Japan",
    text: "Silence can be care when words are tired.",
  },
  {
    country: "Ghana",
    text: "A good name is built in the small moments nobody records.",
  },
  {
    country: "Philippines",
    text: "Begin with what your hands can do today.",
  },
  {
    country: "Portugal",
    text: "Peace is sometimes a bill paid early and a call returned honestly.",
  },
  {
    country: "South Africa",
    text: "The truth gets lighter when it is carried by more than one person.",
  },
  {
    country: "Mexico",
    text: "Family is not perfect people. It is people learning to return.",
  },
  {
    country: "Canada",
    text: "When the day is heavy, do the next kind thing.",
  },
];

export const starterAskThreads: AskThread[] = [
  {
    question: "How do I start again after losing confidence?",
    author: "@humanchain",
    owner: false,
    topic: "Life",
    mode: "Text",
    targetCountry: "World",
    answers: [
      {
        user: "@mara_chain",
        country: "Kenya",
        text: "Start with one promise you can keep before sunset. Confidence returns through evidence.",
      },
      {
        user: "@renato_human",
        country: "Brazil",
        text: "Tell one safe person the truth. Shame gets weaker when it stops being private.",
      },
    ],
  },
  {
    question: "Should I chase money first or build skill first?",
    author: "@humanchain",
    owner: false,
    topic: "Money",
    mode: "Country",
    targetCountry: "World",
    answers: [
      {
        user: "@builder_ama",
        country: "Ghana",
        text: "Build the skill that can earn in many rooms. Money follows usefulness more often than noise.",
      },
      {
        user: "@tomas_work",
        country: "Portugal",
        text: "Earn enough to breathe, then invest time in the skill that compounds.",
      },
    ],
  },
];
