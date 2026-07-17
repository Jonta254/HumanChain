import { BadgeCheck } from "lucide-react";
import { worldIdTierCopy } from "@/lib/humanchain/utils";
import type { VerifiedHuman } from "@/types/user";

const tierShortLabel = {
  orb: "Orb verified",
  document: "Document verified",
  none: "Wallet only",
} as const;

/**
 * Single source of truth for the Orb / Document / Preview verification chip.
 * Reads worldIdTier directly so this never drifts from what openPayment()
 * actually gates on — replaces the old binary Verified/Preview badge.
 */
export function VerificationTierBadge({
  human,
  size = 11,
}: {
  human: VerifiedHuman | null;
  size?: number;
}) {
  const isPreview = !human || human.mode !== "world";
  const tier = isPreview ? "none" : human.worldIdTier ?? "none";
  const copy = worldIdTierCopy[tier];

  return (
    <span
      aria-label={isPreview ? "Preview mode" : copy.label}
      className={`hc-tier-badge hc-tier-badge--${isPreview ? "preview" : tier}`}
      title={copy.detail}
    >
      <BadgeCheck size={size} />
      {isPreview ? "Preview" : tierShortLabel[tier]}
    </span>
  );
}
