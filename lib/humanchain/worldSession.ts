"use client";

import type { WorldMiniAppContext } from "@/lib/world/types";
import type { VerifiedHuman, WorldHumanProofEvent, WorldHumanSession } from "@/types/user";
import { loadJsonFromStorage, saveJsonToStorage, storageKeys } from "./storage";

const walletPattern = /^0x[a-fA-F0-9]{40}$/;
const maxProofEvents = 40;

function isWalletAddress(value: unknown): value is string {
  return typeof value === "string" && walletPattern.test(value);
}

function sameWallet(a?: string, b?: string) {
  return Boolean(a && b && a.toLowerCase() === b.toLowerCase());
}

export function normalizeWorldHumanSession(
  input: Partial<WorldHumanSession> | null | undefined,
): WorldHumanSession | null {
  if (!input || input.mode !== "world" || !isWalletAddress(input.wallet)) {
    return null;
  }

  if (input.verificationSource && input.verificationSource !== "wallet-auth") {
    return null;
  }

  const now = new Date().toISOString();
  return {
    appVersion: 1,
    authenticatedAt: input.authenticatedAt ?? now,
    deviceOS: input.deviceOS,
    lastSeenAt: input.lastSeenAt ?? input.authenticatedAt ?? now,
    launchLocation: input.launchLocation ?? null,
    mode: "world",
    profilePictureUrl: input.profilePictureUrl,
    username: input.username || "Resolving World username",
    verificationSource: "wallet-auth",
    wallet: input.wallet,
    worldAppVersion: input.worldAppVersion,
  };
}

export function loadWorldHumanSession(context?: WorldMiniAppContext): WorldHumanSession | null {
  const session = normalizeWorldHumanSession(
    loadJsonFromStorage<Partial<WorldHumanSession> | null>(storageKeys.humanSession, null),
  );
  if (!session) {
    return null;
  }

  if (context?.walletAddress && !sameWallet(context.walletAddress, session.wallet)) {
    return null;
  }

  return session;
}

export function sessionToVerifiedHuman(session: WorldHumanSession): VerifiedHuman {
  return {
    authenticatedAt: session.authenticatedAt,
    deviceOS: session.deviceOS,
    lastSeenAt: session.lastSeenAt,
    launchLocation: session.launchLocation,
    mode: "world",
    profilePictureUrl: session.profilePictureUrl,
    sessionVersion: 1,
    username: session.username,
    verificationSource: session.verificationSource,
    wallet: session.wallet,
    worldAppVersion: session.worldAppVersion,
  };
}

export function loadVerifiedHumanFromSession(context?: WorldMiniAppContext): VerifiedHuman | null {
  const session = loadWorldHumanSession(context);
  return session ? sessionToVerifiedHuman(session) : null;
}

export function saveWorldHumanSession(
  human: VerifiedHuman,
  context?: WorldMiniAppContext,
): WorldHumanSession | null {
  if (human.mode !== "world" || !isWalletAddress(human.wallet)) {
    return null;
  }

  const storedSession = loadWorldHumanSession();
  const existing = sameWallet(storedSession?.wallet, human.wallet) ? storedSession : null;
  const now = new Date().toISOString();
  const session = normalizeWorldHumanSession({
    appVersion: 1,
    authenticatedAt: human.authenticatedAt ?? existing?.authenticatedAt ?? now,
    deviceOS: context?.deviceOS ?? human.deviceOS,
    lastSeenAt: human.lastSeenAt ?? now,
    launchLocation: context?.launchLocation ?? human.launchLocation ?? null,
    mode: "world",
    profilePictureUrl: context?.profilePictureUrl ?? human.profilePictureUrl,
    username: context?.username ?? human.username,
    verificationSource: "wallet-auth",
    wallet: human.wallet,
    worldAppVersion: context?.worldAppVersion ?? human.worldAppVersion,
  });

  if (!session) {
    return null;
  }

  saveJsonToStorage(storageKeys.humanSession, session);
  return session;
}

export function recordWorldHumanProofEvent(event: Omit<WorldHumanProofEvent, "verifiedAt">) {
  const proofEvent: WorldHumanProofEvent = {
    action: event.action,
    signal: event.signal,
    verifiedAt: new Date().toISOString(),
  };
  const current = loadJsonFromStorage<WorldHumanProofEvent[]>(storageKeys.humanProofEvents, []);
  saveJsonToStorage(storageKeys.humanProofEvents, [proofEvent, ...current].slice(0, maxProofEvents));
}
