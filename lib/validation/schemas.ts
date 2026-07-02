/**
 * Validation schemas for API endpoints
 * Provides type-safe validation for all inputs
 */

// World Payment Validation
export const paymentFeatures = [
  "tip",
  "golden-link",
  "streak-restore",
  "pin-link",
  "story-bonus",
  "ask-one-country",
  "memory-capsule",
  "private-ask",
  "voice-answers",
  "deep-verdict",
] as const;

export const paymentTokens = ["WLD"] as const;

export function isValidPaymentFeature(value: unknown): value is (typeof paymentFeatures)[number] {
  return typeof value === "string" && (paymentFeatures as readonly string[]).includes(value);
}

export function isValidPaymentToken(value: unknown): value is (typeof paymentTokens)[number] {
  return typeof value === "string" && (paymentTokens as readonly string[]).includes(value);
}

export function isValidPaymentAmount(feature: string, amount: number): boolean {
  if (!Number.isInteger(amount) || amount < 1 || amount > 6) return false;

  const amountByFeature: Record<string, number> = {
    tip: 1,
    "golden-link": 1,
    "streak-restore": 1,
    "pin-link": 2,
    "story-bonus": 2,
    "ask-one-country": 3,
    "memory-capsule": 3,
    "private-ask": 4,
    "voice-answers": 5,
    "deep-verdict": 6,
  };

  return amountByFeature[feature] === amount;
}

// Wallet Address Validation
export function isValidWalletAddress(address: unknown): address is string {
  if (typeof address !== "string") return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// World ID Proof Validation
export interface WorldIdProofInput {
  idkitResponse?: unknown;
  action?: string;
  signal?: string;
}

export function validateWorldIdProof(input: unknown): { ok: boolean; error?: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid World ID proof input." };
  }

  const proof = input as Partial<WorldIdProofInput>;

  if (!proof.idkitResponse || typeof proof.idkitResponse !== "object") {
    return { ok: false, error: "Missing IDKit response." };
  }

  if (!proof.action || typeof proof.action !== "string" || proof.action.length > 80) {
    return { ok: false, error: "Invalid action string (must be 1-80 characters)." };
  }

  if (proof.signal && (typeof proof.signal !== "string" || proof.signal.length > 180)) {
    return { ok: false, error: "Invalid signal string (must be 1-180 characters)." };
  }

  const idkitObj = proof.idkitResponse as Record<string, unknown>;
  if (typeof idkitObj.nullifier_hash !== "string") {
    return { ok: false, error: "Missing nullifier_hash in IDKit response." };
  }

  return { ok: true };
}

// SIWE Message Validation
export interface SiweMessageInput {
  nonce?: string;
  payload?: unknown;
}

export function validateSiweMessage(input: unknown): { ok: boolean; error?: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid SIWE message input." };
  }

  const msg = input as Partial<SiweMessageInput>;

  if (!msg.nonce || typeof msg.nonce !== "string") {
    return { ok: false, error: "Missing or invalid nonce." };
  }

  if (!msg.payload || typeof msg.payload !== "object") {
    return { ok: false, error: "Missing SIWE payload." };
  }

  return { ok: true };
}

// Marketplace Listing Validation
export interface MarketplaceListingInput {
  title?: unknown;
  description?: unknown;
  price?: unknown;
  location?: unknown;
  images?: unknown;
  category?: unknown;
}

export function validateMarketplaceListing(
  input: unknown,
): { ok: boolean; error?: string; issues?: string[] } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid listing input." };
  }

  const listing = input as Partial<MarketplaceListingInput>;
  const issues: string[] = [];

  // Title validation
  if (!listing.title || typeof listing.title !== "string") {
    issues.push("Title is required and must be a string.");
  } else if (listing.title.length < 3 || listing.title.length > 120) {
    issues.push("Title must be 3-120 characters.");
  }

  // Description validation
  if (!listing.description || typeof listing.description !== "string") {
    issues.push("Description is required and must be a string.");
  } else if (listing.description.length < 10 || listing.description.length > 2000) {
    issues.push("Description must be 10-2000 characters.");
  }

  // Price validation
  if (listing.price === undefined) {
    issues.push("Price is required.");
  } else if (typeof listing.price !== "number" || listing.price <= 0 || listing.price > 10000) {
    issues.push("Price must be a positive number (max 10000).");
  }

  // Location validation
  if (listing.location && typeof listing.location !== "string") {
    issues.push("Location must be a string if provided.");
  }

  // Images validation
  if (listing.images) {
    if (!Array.isArray(listing.images)) {
      issues.push("Images must be an array.");
    } else if (listing.images.length > 3) {
      issues.push("Maximum 3 images allowed.");
    } else {
      for (let i = 0; i < listing.images.length; i++) {
        const img = listing.images[i];
        if (typeof img !== "string" || !img.startsWith("blob:") && !img.startsWith("http")) {
          issues.push(`Image ${i + 1} must be a valid Blob or HTTP URL.`);
        }
      }
    }
  }

  if (issues.length > 0) {
    return { ok: false, error: "Listing validation failed.", issues };
  }

  return { ok: true };
}

// Post Validation
export interface PostInput {
  text?: unknown;
  images?: unknown;
  category?: unknown;
}

export function validatePost(input: unknown): { ok: boolean; error?: string; issues?: string[] } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid post input." };
  }

  const post = input as Partial<PostInput>;
  const issues: string[] = [];

  if (!post.text || typeof post.text !== "string") {
    issues.push("Post text is required.");
  } else if (post.text.length < 1 || post.text.length > 1000) {
    issues.push("Post must be 1-1000 characters.");
  }

  if (post.images) {
    if (!Array.isArray(post.images)) {
      issues.push("Images must be an array.");
    } else if (post.images.length > 5) {
      issues.push("Maximum 5 images per post.");
    }
  }

  if (issues.length > 0) {
    return { ok: false, error: "Post validation failed.", issues };
  }

  return { ok: true };
}
