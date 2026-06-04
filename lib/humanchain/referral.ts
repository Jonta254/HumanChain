"use client";

import { loadJsonFromStorage, saveJsonToStorage, storageKeys } from "./storage";

export const MINI_APP_BASE_URL =
  "https://worldcoin.org/mini-app?app_id=app_fd34958eed3f67a6710d76c46d261f77";

export interface ReferralMilestone {
  count: number;
  badge: string;
  hpBonus: number;
  label: string;
}

export const referralMilestones: ReferralMilestone[] = [
  { count: 1,  badge: "First Invite",     hpBonus: 50,   label: "Sent your first invite" },
  { count: 3,  badge: "Connector",        hpBonus: 150,  label: "3 humans invited" },
  { count: 10, badge: "Recruiter",        hpBonus: 500,  label: "10 humans invited" },
  { count: 25, badge: "Human Ambassador", hpBonus: 2000, label: "25 humans invited" },
];

export const REFERRAL_BONUS_FOR_REFERRED = 25;
export const REFERRAL_HP_PER_SHARE = 50;

export function getReferralLink(username: string): string {
  const handle = username.replace(/^@/, "").trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  if (!handle) return MINI_APP_BASE_URL;
  return `${MINI_APP_BASE_URL}&ref=${encodeURIComponent(handle)}`;
}

export function getReferralLinkDirect(username: string): string {
  const handle = username.replace(/^@/, "").trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  if (!handle) return MINI_APP_BASE_URL;
  return `${MINI_APP_BASE_URL}&ref=${encodeURIComponent(handle)}`;
}

export function loadReferredBy(): string | null {
  return loadJsonFromStorage<string | null>(storageKeys.referralBy, null);
}

export function saveReferredBy(ref: string): void {
  const sanitized = ref.replace(/[^a-z0-9_.-]/gi, "").slice(0, 40);
  if (sanitized) saveJsonToStorage(storageKeys.referralBy, sanitized);
}

export function loadReferralBonusAwarded(): boolean {
  return loadJsonFromStorage<boolean>(storageKeys.referralBonusAwarded, false);
}

export function saveReferralBonusAwarded(): void {
  saveJsonToStorage(storageKeys.referralBonusAwarded, true);
}

export function loadReferralShareCount(): number {
  return loadJsonFromStorage<number>(storageKeys.referralShareCount, 0);
}

export function incrementReferralShareCount(): number {
  const next = loadReferralShareCount() + 1;
  saveJsonToStorage(storageKeys.referralShareCount, next);
  return next;
}

export function getNextMilestone(count: number): ReferralMilestone | null {
  return referralMilestones.find((m) => m.count > count) ?? null;
}

export function getReachedMilestones(count: number): ReferralMilestone[] {
  return referralMilestones.filter((m) => m.count <= count);
}

export function getTotalReferralHp(count: number): number {
  return count * REFERRAL_HP_PER_SHARE;
}

export function readRefFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (!ref) return null;
  const sanitized = ref.replace(/[^a-z0-9_.-]/gi, "").slice(0, 40);
  return sanitized || null;
}
