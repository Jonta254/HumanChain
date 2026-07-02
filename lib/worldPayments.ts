export const humanChainPaymentFeatures = {
  "bonus-story-pages": 2,
  "boost-question": 2,
  "country-answer": 2,
  "country-answer-mode": 1,
  "anonymous-answer": 1.5,
  "deep-story-reflection": 6,
  "deep-verdict-question": 6,
  "deep-world-verdict": 6,
  "deep-verdict": 6,
  "golden-link": 2,
  "chain-circle": 3,
  "pin-chain-item": 4,
  "world-pulse": 1,
  // Marketplace — post, list, boost
  "marketplace-business-ad": 4,
  "marketplace-comment": 0.5,
  "marketplace-extra-photo-pack": 1.5,
  "marketplace-photo-pack": 1.5,
  "marketplace-local-boost": 2,
  "marketplace-quick-listing": 2,
  "marketplace-job-post": 2,
  "marketplace-service-listing": 2,
  "marketplace-featured-listing": 4,
  // Private / premium
  "private-question": 4,
  "private-reach": 4,
  "video-post": 2,
  // Stories
  "story-tip": 1,
  "story-file-publish": 4,
  "storyteller-tip": 1,
  // Tips
  "tip-market-item": 1,
  "tip-chain-link": 1,
  "tip-human": 1,
  "tip-storyteller": 1,
  // Voice
  "voice-answer": 2,
  "voice-question": 2,
  // Micro-actions
  "quick-answer-boost": 0.5,
  "link-reaction-pack": 0.5,
  "story-bookmark": 0.5,
  "market-hold-notify": 0.5,
  "culture-room-entry": 1,
  "culture-room-create": 3,
} as const;

export type HumanChainPaymentFeature = keyof typeof humanChainPaymentFeatures;
export type HumanChainPaymentToken = "WLD";

export const defaultHumanChainPaymentToken: HumanChainPaymentToken = "WLD";

export const humanChainPaymentTokens: Record<
  HumanChainPaymentToken,
  { label: string; note: string }
> = {
  WLD: { label: "WLD", note: "Worldcoin" },
};

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

export function isTipPaymentFeature(feature: string) {
  return feature.startsWith("tip-") || feature.endsWith("-tip");
}

export function isValidHumanChainPaymentAmount(feature: string, amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return false;
  }

  if (isTipPaymentFeature(feature)) {
    return amount >= 0.1 && amount <= 100 && Number(amount.toFixed(2)) === amount;
  }

  return (
    isHumanChainPaymentFeature(feature) &&
    amount === humanChainPaymentFeatures[feature]
  );
}

export function normalizePaymentToken(token: string | undefined) {
  return (token ?? defaultHumanChainPaymentToken).trim().toUpperCase();
}

export function isHumanChainPaymentToken(
  token: string,
): token is HumanChainPaymentToken {
  return token in humanChainPaymentTokens;
}

/**
 * Get the required payment amount for a feature
 * For tips, returns the configurable range; for fixed features, returns the exact amount
 */
export function getPaymentAmount(feature: string): number | null {
  if (!isHumanChainPaymentFeature(feature)) {
    return null;
  }
  return humanChainPaymentFeatures[feature];
}

/**
 * Get all available payment features grouped by category
 */
export function getPaymentFeaturesByCategory(): Record<string, HumanChainPaymentFeature[]> {
  return {
    stories: ["bonus-story-pages", "story-tip", "story-file-publish", "storyteller-tip"] as HumanChainPaymentFeature[],
    chain: ["boost-question", "country-answer", "country-answer-mode", "anonymous-answer", "golden-link", "chain-circle", "pin-chain-item", "world-pulse"] as HumanChainPaymentFeature[],
    deep: ["deep-story-reflection", "deep-verdict-question", "deep-world-verdict", "deep-verdict"] as HumanChainPaymentFeature[],
    marketplace: [
      "marketplace-business-ad",
      "marketplace-comment",
      "marketplace-extra-photo-pack",
      "marketplace-photo-pack",
      "marketplace-local-boost",
      "marketplace-quick-listing",
      "marketplace-job-post",
      "marketplace-service-listing",
      "marketplace-featured-listing",
    ] as HumanChainPaymentFeature[],
    premium: ["private-question", "private-reach", "video-post"] as HumanChainPaymentFeature[],
    tips: ["tip-market-item", "tip-chain-link", "tip-human", "tip-storyteller"] as HumanChainPaymentFeature[],
    voice: ["voice-answer", "voice-question"] as HumanChainPaymentFeature[],
    actions: ["quick-answer-boost", "link-reaction-pack", "story-bookmark", "market-hold-notify", "culture-room-entry", "culture-room-create"] as HumanChainPaymentFeature[],
  };
}

/**
 * Check if a feature supports variable amounts (tips)
 */
export function isVariableAmountFeature(feature: string): boolean {
  return isTipPaymentFeature(feature);
}

/**
 * Format payment amount for display
 */
export function formatPaymentAmount(amount: number): string {
  if (Number.isInteger(amount)) {
    return amount.toString();
  }
  return amount.toFixed(2);
}

/**
 * Get description for a payment feature
 */
export function getPaymentFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    "bonus-story-pages": "Additional story pages",
    "boost-question": "Boost question visibility",
    "country-answer": "Answer country question",
    "country-answer-mode": "Country answer mode",
    "anonymous-answer": "Anonymous answer",
    "deep-story-reflection": "Deep story reflection",
    "deep-verdict-question": "Deep verdict question",
    "deep-world-verdict": "Deep world verdict",
    "deep-verdict": "Deep verdict",
    "golden-link": "Golden link",
    "chain-circle": "Chain circle",
    "pin-chain-item": "Pin chain item",
    "world-pulse": "World pulse",
    "marketplace-business-ad": "Business ad",
    "marketplace-comment": "Marketplace comment",
    "marketplace-extra-photo-pack": "Extra photo pack",
    "marketplace-photo-pack": "Photo pack",
    "marketplace-local-boost": "Local boost",
    "marketplace-quick-listing": "Quick listing",
    "marketplace-job-post": "Job post",
    "marketplace-service-listing": "Service listing",
    "marketplace-featured-listing": "Featured listing",
    "private-question": "Private question",
    "private-reach": "Private reach",
    "video-post": "Video post",
    "story-tip": "Story tip",
    "story-file-publish": "Publish story file",
    "storyteller-tip": "Storyteller tip",
    "tip-market-item": "Market item tip",
    "tip-chain-link": "Chain link tip",
    "tip-human": "Human tip",
    "tip-storyteller": "Storyteller tip",
    "voice-answer": "Voice answer",
    "voice-question": "Voice question",
    "quick-answer-boost": "Quick answer boost",
    "link-reaction-pack": "Link reaction pack",
    "story-bookmark": "Story bookmark",
    "market-hold-notify": "Market hold notify",
    "culture-room-entry": "Culture room entry",
    "culture-room-create": "Create culture room",
  };

  return descriptions[feature] || feature;
}
