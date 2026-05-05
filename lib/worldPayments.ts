export const humanChainPaymentFeatures = {
  "bonus-story-pages": 2,
  "boost-question": 2,
  "country-answer": 2,
  "deep-story-reflection": 6,
  "deep-verdict-question": 6,
  "deep-world-verdict": 6,
  "deep-verdict": 6,
  "golden-link": 2,
  "marketplace-business-ad": 4,
  "marketplace-extra-photo-pack": 2,
  "marketplace-local-boost": 2,
  "marketplace-quick-listing": 1,
  "private-question": 4,
  "private-reach": 4,
  "story-tip": 1,
  "storyteller-tip": 1,
  "tip-chain-link": 1,
  "tip-human": 1,
  "tip-storyteller": 1,
  "voice-answer": 2,
  "voice-question": 2,
} as const;

export type HumanChainPaymentFeature = keyof typeof humanChainPaymentFeatures;

export function normalizePaymentFeature(feature: string) {
  return feature
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isHumanChainPaymentFeature(
  feature: string,
): feature is HumanChainPaymentFeature {
  return feature in humanChainPaymentFeatures;
}
