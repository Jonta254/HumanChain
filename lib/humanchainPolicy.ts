export const humanChainErrorStates = {
  account_temporarily_limited: "Your account is temporarily limited. Review support options before trying again.",
  bid_too_low: "Increase your bid to beat the current best offer.",
  content_rejected_policy: "This cannot be published because it appears to break HumanChain policy.",
  content_under_review: "This is saved, but it needs review before becoming public.",
  escrow_unavailable_region: "Hold-protected orders are not available in this region yet.",
  listing_blocked_category: "This category is blocked on HumanChain Market.",
  network_offline_retrying: "Network is unstable. HumanChain will retry without losing your draft.",
  not_in_world_app: "Continue with World App to use verified-human actions.",
  payment_rejected: "The payment was rejected. No public action was unlocked.",
  payment_unverified: "Payment could not be verified by the backend yet.",
  permission_denied_microphone: "Microphone permission was denied. You can continue with text.",
  permission_denied_notifications: "Notification permission was denied. You can still use HumanChain.",
  service_degraded_world: "World services look degraded. Try again shortly.",
  too_many_requests: "Too many attempts. Pause briefly and try again.",
  transaction_failed: "The transaction failed. No order state was changed.",
  transaction_pending: "The transaction is pending. HumanChain will wait for confirmation.",
  upload_scan_failed: "The upload could not be scanned. Try a different file.",
  upload_type_not_allowed: "This file type is not allowed.",
  wallet_auth_failed: "World wallet authentication failed.",
  world_id_proof_invalid: "The World ID proof could not be verified.",
  world_id_required: "Verify as a unique human before posting publicly.",
} as const;

export type HumanChainErrorState = keyof typeof humanChainErrorStates;

export const allowedMomentImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
export const allowedStoryFileTypes = new Set(["application/pdf", "text/plain"]);
export const blockedListingTerms = [
  "weapon",
  "gun",
  "ammo",
  "drug",
  "passport",
  "id card",
  "counterfeit",
  "stolen",
  "giveaway",
  "guaranteed profit",
];

export type ValidationResult = {
  errorState?: HumanChainErrorState;
  issues: string[];
  ok: boolean;
  reviewRequired?: boolean;
};

function textLength(value: string) {
  return value.trim().replace(/\s+/g, " ").length;
}

export function validateQuestionInput(title: string, body = "", category?: string, route?: string): ValidationResult {
  const issues: string[] = [];
  const titleLength = textLength(title);
  const bodyLength = textLength(body);

  if (titleLength < 20 || titleLength > 280) issues.push("Question headline must be 20-280 characters.");
  if (body && (bodyLength < 20 || bodyLength > 1200)) issues.push("Question details must be 20-1200 characters.");
  if (!category) issues.push("Category is required.");
  if (!route) issues.push("Route is required.");

  return { ok: issues.length === 0, issues };
}

export function validateAnswerInput(body: string): ValidationResult {
  const length = textLength(body);
  const issues = length < 20 || length > 1200 ? ["Answer must be 20-1200 characters."] : [];

  return { ok: issues.length === 0, issues };
}

export function validateMomentImage(file: { size: number; type: string }): ValidationResult {
  const issues: string[] = [];

  if (!allowedMomentImageTypes.has(file.type)) issues.push("Moment image must be JPEG, PNG, or WebP.");
  if (file.size > 10 * 1024 * 1024) issues.push("Moment image must be 10 MB or smaller.");

  return { ok: issues.length === 0, issues, errorState: issues.length ? "upload_type_not_allowed" : undefined };
}

export function validateStoryFile(file: { size: number; type: string }): ValidationResult {
  const issues: string[] = [];

  if (!allowedStoryFileTypes.has(file.type)) issues.push("Story file must be PDF or plain text.");
  if (file.size > 15 * 1024 * 1024) issues.push("Story file must be 15 MB or smaller.");

  return {
    ok: issues.length === 0,
    issues,
    errorState: issues.length ? "upload_type_not_allowed" : undefined,
    reviewRequired: true,
  };
}

export function validateListingInput(input: {
  area?: string;
  condition?: string;
  photos?: unknown[];
  price?: string;
  title?: string;
}): ValidationResult {
  const issues: string[] = [];
  const title = input.title?.trim() ?? "";
  const lowerText = `${input.title ?? ""} ${input.condition ?? ""}`.toLowerCase();
  const priceValue = Number.parseFloat(String(input.price ?? "").replace(/[^0-9.]/g, ""));

  if (title.length < 6 || title.length > 80) issues.push("Listing title must be 6-80 characters.");
  if (!Number.isFinite(priceValue) || priceValue <= 0) issues.push("Listing price must be a positive amount.");
  if (!input.condition) issues.push("Condition is required.");
  if (!input.area?.trim()) issues.push("Area is required.");
  if ((input.photos?.length ?? 0) < 3) issues.push("At least 3 listing photos are required.");
  if (blockedListingTerms.some((term) => lowerText.includes(term))) {
    issues.push("This appears to match a blocked marketplace category.");
  }

  return {
    ok: issues.length === 0,
    issues,
    errorState: issues.some((issue) => issue.includes("blocked")) ? "listing_blocked_category" : undefined,
  };
}
