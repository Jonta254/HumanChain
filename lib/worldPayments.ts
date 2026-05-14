export const humanChainPaymentFeatures = {
  "bonus-story-pages": 2,
  "boost-question": 2,
  "country-answer": 2,
  "deep-story-reflection": 6,
  "deep-verdict-question": 6,
  "deep-world-verdict": 6,
  "deep-verdict": 6,
  "golden-link": 2,
  "chain-circle": 3,
  "pin-chain-item": 4,
  "world-pulse": 1,
  "marketplace-business-ad": 4,
  "marketplace-extra-photo-pack": 2,
  "marketplace-local-boost": 2,
  "marketplace-quick-listing": 2,
  "private-question": 4,
  "private-reach": 4,
  "video-post": 2,
  "story-tip": 1,
  "storyteller-tip": 1,
  "tip-market-item": 1,
  "tip-chain-link": 1,
  "tip-human": 1,
  "tip-storyteller": 1,
  "voice-answer": 2,
  "voice-question": 2,
} as const;

export type HumanChainPaymentFeature = keyof typeof humanChainPaymentFeatures;
export type HumanChainPaymentToken =
  | "WLD"
  | "USDCE"
  | "EURC"
  | "WBRL"
  | "WCOP"
  | "WMXN"
  | "WPEN"
  | "WCLP";

export const defaultHumanChainPaymentToken: HumanChainPaymentToken = "WLD";

export const humanChainPaymentTokens: Record<
  HumanChainPaymentToken,
  { label: string; note: string }
> = {
  WLD: { label: "WLD", note: "Worldcoin" },
  USDCE: { label: "USDC.e", note: "US dollar stablecoin" },
  EURC: { label: "EURC", note: "Euro stablecoin" },
  WBRL: { label: "WBRL", note: "Brazil real stablecoin" },
  WCOP: { label: "WCOP", note: "Colombia peso stablecoin" },
  WMXN: { label: "WMXN", note: "Mexico peso stablecoin" },
  WPEN: { label: "WPEN", note: "Peru sol stablecoin" },
  WCLP: { label: "WCLP", note: "Chile peso stablecoin" },
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
