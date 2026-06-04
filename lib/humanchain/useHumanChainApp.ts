"use client";

import { useEffect, useState } from "react";
import { appLanguages } from "@/lib/data/languages";
import { firstRunNotifications } from "@/lib/data/notifications";
import { initialHumanPosts } from "@/lib/data/posts";
import { initialLinks } from "@/lib/data/chains";
import { starterAskThreads } from "@/lib/data/chains";
import {
  canSendWorldNotificationOnce,
  getInitialMarketBids,
  getTabFromUrl,
  importantToastTerms,
  isWorldPermissionGranted,
  loadStoredAppMemory,
  loadStoredChainLinks,
  loadStoredHistoryRecords,
  loadStoredHumanPosts,
  loadStoredMarketplaceListings,
  loadStoredNotifications,
  mergeFirstRunNotifications,
  publicFeedFocusCooldownMs,
  publicFeedRefreshMs,
  resolveWorldProfileAfterAuth,
  scrollMiniAppToTop,
  storeSafeData,
  worldProfileFocusCooldownMs,
  worldProfileRefreshMs,
} from "@/lib/humanchain/appHelpers";
import { loadJsonFromStorage, loadLocalRecord, saveJsonToStorage, storageKeys } from "@/lib/humanchain/storage";
import {
  formatCheckInTime,
  formatPaymentAmount,
  formatShortTime,
  getLocalDateKey,
  getPaymentFeature,
  getPaymentKind,
  isVerifiedWorldHuman,
  isWorldUsernamePlaceholder,
  normalizeWorldUsername,
  parsePaymentAmount,
} from "@/lib/humanchain/utils";
import { defaultHumanChainPaymentToken, isValidHumanChainPaymentAmount } from "@/lib/worldPayments";
import {
  authenticateHumanWallet,
  getWorldMiniAppContext,
  getWorldPermissions,
  getWorldUserByAddress,
  humanHaptic,
  payWithWorld,
  Permission,
  requestWorldPermission,
} from "@/lib/worldMiniApp";
import type { AppLanguage } from "@/lib/data/languages";
import type { HumanChainPaymentToken } from "@/lib/worldPayments";
import type { AskThread, ChainField, ChainPremiumState } from "@/types/chain";
import type { DailyResponse, HumanPost, UserStory } from "@/types/content";
import type { MarketBid, MarketHold, MarketLocationState, MarketplaceListing } from "@/types/market";
import type { HistoryRecord, HpLedgerRecord } from "@/types/reputation";
import type { NotificationItem, PaymentRequest, Tab, Toast } from "@/types/ui";
import type { AccountSyncSnapshot, AppMemory, PublicFeedPayload, VerifiedHuman } from "@/types/user";

export function useHumanChainApp() {
  const [storedAppMemory] = useState(loadStoredAppMemory);
  const [tab, setTab] = useState<Tab>("home");
  const [chainEntryNonce, setChainEntryNonce] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [notificationPromptDismissed, setNotificationPromptDismissed] = useState(false);
  const [verifiedHuman, setVerifiedHuman] = useState<VerifiedHuman | null>(storedAppMemory.verifiedHuman);
  const [gateBusy, setGateBusy] = useState(false);
  const [notificationReady, setNotificationReady] = useState(storedAppMemory.notificationReady);
  const [notificationWelcomeSent, setNotificationWelcomeSent] = useState(storedAppMemory.notificationWelcomeSent);
  const [notifications, setNotifications] = useState<NotificationItem[]>(loadStoredNotifications);
  const [worldContext, setWorldContext] = useState(getWorldMiniAppContext);
  const [profileImage, setProfileImage] = useState<string | null>(() =>
    loadJsonFromStorage<string | null>(storageKeys.profileImage, null),
  );
  const [appLanguage, setAppLanguage] = useState<AppLanguage>(
    appLanguages.find((l) => l.code === storedAppMemory.appLanguageCode) ?? appLanguages[0],
  );
  const [streak, setStreak] = useState(storedAppMemory.streak);
  const [links, setLinks] = useState(loadStoredChainLinks);
  const [savedItems, setSavedItems] = useState(storedAppMemory.savedItems);
  const [points, setPoints] = useState(storedAppMemory.points);
  const [hpLedger, setHpLedger] = useState<HpLedgerRecord[]>(() =>
    loadJsonFromStorage<HpLedgerRecord[]>(storageKeys.hpLedger, []),
  );
  const [dailyAnswered, setDailyAnswered] = useState(storedAppMemory.dailyAnswered);
  const [dailyAnsweredAt, setDailyAnsweredAt] = useState<string | null>(storedAppMemory.dailyAnsweredAt);
  const [dailyAnsweredDate, setDailyAnsweredDate] = useState<string | null>(storedAppMemory.dailyAnsweredDate);
  const [lastCheckInAt, setLastCheckInAt] = useState<string | null>(storedAppMemory.lastCheckInAt);
  const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(storedAppMemory.lastCheckInDate);
  const [activeField, setActiveField] = useState<ChainField | null>(null);
  const [humanPosts, setHumanPosts] = useState<HumanPost[]>(loadStoredHumanPosts);
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>(loadStoredMarketplaceListings);
  const [marketLocation, setMarketLocation] = useState<MarketLocationState>(storedAppMemory.marketLocation);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(loadStoredHistoryRecords);
  const [dailyResponses, setDailyResponses] = useState<DailyResponse[]>([]);
  const [paymentPrompt, setPaymentPrompt] = useState<PaymentRequest | null>(null);
  const [paymentToken] = useState<HumanChainPaymentToken>(defaultHumanChainPaymentToken);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [accountSyncReady, setAccountSyncReady] = useState(verifiedHuman?.mode !== "world");
  const [accountSyncStatus, setAccountSyncStatus] = useState<"idle" | "loading" | "ready" | "saving" | "offline">(
    verifiedHuman?.mode === "world" ? "loading" : "idle",
  );
  const [feedRefreshNonce, setFeedRefreshNonce] = useState(0);

  // ── Persist profile image ──────────────────────────────────────────────────
  useEffect(() => {
    if (profileImage) {
      saveJsonToStorage(storageKeys.profileImage, profileImage);
    } else if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKeys.profileImage);
    }
  }, [profileImage]);

  // ── URL-based tab navigation ───────────────────────────────────────────────
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const requestedTab = getTabFromUrl();
      if (requestedTab === "home") return;
      if (requestedTab === "chains") { setActiveField(null); setChainEntryNonce((n) => n + 1); }
      setTab(requestedTab);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // ── Scroll to top on tab/auth change ──────────────────────────────────────
  useEffect(() => { scrollMiniAppToTop(); }, [tab, verifiedHuman]);

  // ── Viewport height sync ───────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    function syncViewportHeight() {
      const height = window.visualViewport?.height ?? window.innerHeight;
      root.style.setProperty("--app-height", `${Math.round(height)}px`);
    }
    syncViewportHeight();
    window.addEventListener("resize", syncViewportHeight);
    window.addEventListener("orientationchange", syncViewportHeight);
    window.visualViewport?.addEventListener("resize", syncViewportHeight);
    window.visualViewport?.addEventListener("scroll", syncViewportHeight);
    return () => {
      window.removeEventListener("resize", syncViewportHeight);
      window.removeEventListener("orientationchange", syncViewportHeight);
      window.visualViewport?.removeEventListener("resize", syncViewportHeight);
      window.visualViewport?.removeEventListener("scroll", syncViewportHeight);
    };
  }, []);

  // ── World safe area CSS vars ───────────────────────────────────────────────
  useEffect(() => {
    const insets = worldContext.safeAreaInsets;
    const root = document.documentElement;
    root.dataset.worldMiniApp = worldContext.deviceOS ? "true" : "false";
    root.style.setProperty("--world-safe-top", `${insets?.top ?? 0}px`);
    root.style.setProperty("--world-safe-right", `${insets?.right ?? 0}px`);
    root.style.setProperty("--world-safe-bottom", `${insets?.bottom ?? 0}px`);
    root.style.setProperty("--world-safe-left", `${insets?.left ?? 0}px`);
  }, [worldContext]);

  // ── World notification permission check ───────────────────────────────────
  useEffect(() => {
    getWorldPermissions()
      .then((result) => {
        setWorldContext(getWorldMiniAppContext());
        const permissions = result.data?.permissions as { notifications?: boolean | { status?: string } } | undefined;
        const notifs = permissions?.notifications;
        const isGranted = notifs === true || (typeof notifs === "object" && notifs?.status === "success");
        if (isGranted) setNotificationReady(true);
      })
      .catch(() => setWorldContext(getWorldMiniAppContext()))
      .finally(() => setWorldContext(getWorldMiniAppContext()));
  }, []);

  // ── World profile sync ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!verifiedHuman?.wallet || verifiedHuman.mode !== "world") return;
    let cancelled = false, syncing = false, lastSyncAt = 0;
    const wallet = verifiedHuman.wallet;

    async function syncWorldProfile(reason = "background") {
      if (syncing) return false;
      if (reason !== "initial" && reason !== "retry" && Date.now() - lastSyncAt < worldProfileFocusCooldownMs) return false;
      syncing = true; lastSyncAt = Date.now();
      let resolvedUsername = false;
      try {
        const beforeCtx = getWorldMiniAppContext();
        const worldUser = await getWorldUserByAddress(wallet);
        const afterCtx = getWorldMiniAppContext();
        const username = normalizeWorldUsername(worldUser?.username ?? afterCtx.username ?? beforeCtx.username);
        const profilePictureUrl = afterCtx.profilePictureUrl ?? worldUser?.profilePictureUrl ?? beforeCtx.profilePictureUrl;
        resolvedUsername = Boolean(username);
        if (cancelled) return resolvedUsername;
        setWorldContext({ ...beforeCtx, ...afterCtx, profilePictureUrl, username, walletAddress: wallet });
        setVerifiedHuman((cur) => {
          if (!cur || cur.wallet !== wallet) return cur;
          const nextUsername = username ?? (isWorldUsernamePlaceholder(cur.username) ? "Resolving World username" : cur.username);
          const nextPic = profilePictureUrl ?? cur.profilePictureUrl;
          if (nextUsername === cur.username && nextPic === cur.profilePictureUrl) return cur;
          return { ...cur, lastSeenAt: new Date().toISOString(), launchLocation: afterCtx.launchLocation ?? beforeCtx.launchLocation ?? cur.launchLocation, profilePictureUrl: nextPic, username: nextUsername };
        });
      } catch {
        if (reason === "initial" && !cancelled) {
          setVerifiedHuman((cur) => {
            if (!cur || cur.wallet !== wallet || !isWorldUsernamePlaceholder(cur.username)) return cur;
            return { ...cur, lastSeenAt: new Date().toISOString(), username: "Resolving World username" };
          });
        }
      } finally { syncing = false; }
      return resolvedUsername;
    }

    function syncWhenVisible() { if (document.visibilityState === "visible") void syncWorldProfile("visible"); }
    void syncWorldProfile("initial");
    const quickRetry = window.setTimeout(() => void syncWorldProfile("retry"), 2500);
    const hydratedRetry = window.setTimeout(() => void syncWorldProfile("retry"), 8000);
    window.addEventListener("focus", syncWhenVisible);
    document.addEventListener("visibilitychange", syncWhenVisible);
    const interval = window.setInterval(() => void syncWorldProfile("interval"), worldProfileRefreshMs);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", syncWhenVisible);
      document.removeEventListener("visibilitychange", syncWhenVisible);
      window.clearTimeout(quickRetry); window.clearTimeout(hydratedRetry); window.clearInterval(interval);
    };
  }, [verifiedHuman?.mode, verifiedHuman?.wallet]);

  // ── Persist state to localStorage ─────────────────────────────────────────
  useEffect(() => { saveJsonToStorage(storageKeys.posts, humanPosts); }, [humanPosts]);
  useEffect(() => { saveJsonToStorage(storageKeys.links, links); }, [links]);
  useEffect(() => { saveJsonToStorage(storageKeys.marketplace, marketplaceListings); }, [marketplaceListings]);
  useEffect(() => { saveJsonToStorage(storageKeys.history, historyRecords); }, [historyRecords]);
  useEffect(() => { saveJsonToStorage(storageKeys.hpLedger, hpLedger.slice(0, 120)); }, [hpLedger]);
  useEffect(() => { saveJsonToStorage(storageKeys.notifications, notifications.slice(0, 60)); }, [notifications]);
  useEffect(() => {
    saveJsonToStorage(storageKeys.appMemory, {
      appLanguageCode: appLanguage.code, dailyAnswered, dailyAnsweredAt, dailyAnsweredDate,
      lastCheckInAt, lastCheckInDate, marketLocation, notificationReady, notificationWelcomeSent,
      points, savedItems, streak, verifiedHuman,
    } satisfies AppMemory);
  }, [appLanguage, dailyAnswered, dailyAnsweredAt, dailyAnsweredDate, lastCheckInAt, lastCheckInDate,
    marketLocation, notificationReady, notificationWelcomeSent, points, savedItems, streak, verifiedHuman]);

  // ── Snapshot helpers ───────────────────────────────────────────────────────
  function getCurrentAppMemory(): AppMemory {
    return {
      appLanguageCode: appLanguage.code, dailyAnswered, dailyAnsweredAt, dailyAnsweredDate,
      lastCheckInAt, lastCheckInDate, marketLocation, notificationReady, notificationWelcomeSent,
      points, savedItems, streak, verifiedHuman,
    };
  }

  function buildAccountSnapshot(): AccountSyncSnapshot {
    return {
      appMemory: getCurrentAppMemory(), historyRecords, humanPosts, links,
      localRecords: {
        askCountryRoutes: loadLocalRecord<string[]>(storageKeys.askCountryRoutes, []),
        askThreads: loadLocalRecord<AskThread[]>(storageKeys.askThreads, starterAskThreads),
        chainPremium: loadLocalRecord<ChainPremiumState>(storageKeys.chainPremium, { circleCreated: false, pulseUnlocked: false }),
        marketBids: loadLocalRecord<Record<string, MarketBid[]>>(storageKeys.bids, getInitialMarketBids()),
        marketHolds: loadLocalRecord<MarketHold[]>(storageKeys.marketHolds, []),
        marketRatings: loadLocalRecord<Record<string, { rating: number; tips: number }>>(storageKeys.marketRatings, {}),
        userStories: loadLocalRecord<UserStory[]>(storageKeys.userStories, []),
      },
      marketplaceListings, notifications,
      savedAt: new Date().toISOString(), version: 1,
    };
  }

  function restoreAccountSnapshot(snapshot: AccountSyncSnapshot) {
    setHumanPosts(snapshot.humanPosts ?? initialHumanPosts);
    setLinks(snapshot.links ?? initialLinks);
    setMarketplaceListings(snapshot.marketplaceListings ?? []);
    setHistoryRecords(snapshot.historyRecords ?? []);
    setNotifications(mergeFirstRunNotifications(snapshot.notifications ?? firstRunNotifications));
    const memory = snapshot.appMemory;
    if (memory) {
      setAppLanguage(appLanguages.find((l) => l.code === memory.appLanguageCode) ?? appLanguages[0]);
      setDailyAnswered(memory.dailyAnsweredDate === getLocalDateKey() ? memory.dailyAnswered : false);
      setDailyAnsweredAt(memory.dailyAnsweredDate === getLocalDateKey() ? memory.dailyAnsweredAt : null);
      setDailyAnsweredDate(memory.dailyAnsweredDate === getLocalDateKey() ? memory.dailyAnsweredDate : null);
      setLastCheckInAt(memory.lastCheckInAt); setLastCheckInDate(memory.lastCheckInDate);
      setMarketLocation(memory.marketLocation); setNotificationReady(memory.notificationReady);
      setNotificationWelcomeSent(memory.notificationWelcomeSent);
      setPoints(memory.points); setSavedItems(memory.savedItems); setStreak(memory.streak);
      setVerifiedHuman((cur) => cur
        ? { ...cur, launchLocation: cur.launchLocation ?? memory.verifiedHuman?.launchLocation, profilePictureUrl: cur.profilePictureUrl ?? memory.verifiedHuman?.profilePictureUrl, username: isWorldUsernamePlaceholder(cur.username) && !isWorldUsernamePlaceholder(memory.verifiedHuman?.username) ? memory.verifiedHuman?.username ?? cur.username : cur.username }
        : memory.verifiedHuman,
      );
    }
    saveJsonToStorage(storageKeys.appMemory, memory);
    saveJsonToStorage(storageKeys.posts, snapshot.humanPosts ?? initialHumanPosts);
    saveJsonToStorage(storageKeys.links, snapshot.links ?? initialLinks);
    saveJsonToStorage(storageKeys.marketplace, snapshot.marketplaceListings ?? []);
    saveJsonToStorage(storageKeys.history, snapshot.historyRecords ?? []);
    saveJsonToStorage(storageKeys.notifications, snapshot.notifications ?? []);
    saveJsonToStorage(storageKeys.askCountryRoutes, snapshot.localRecords?.askCountryRoutes ?? []);
    saveJsonToStorage(storageKeys.askThreads, snapshot.localRecords?.askThreads ?? starterAskThreads);
    saveJsonToStorage(storageKeys.chainPremium, snapshot.localRecords?.chainPremium ?? { circleCreated: false, pulseUnlocked: false });
    saveJsonToStorage(storageKeys.bids, snapshot.localRecords?.marketBids ?? getInitialMarketBids());
    saveJsonToStorage(storageKeys.marketHolds, snapshot.localRecords?.marketHolds ?? []);
    saveJsonToStorage(storageKeys.marketRatings, snapshot.localRecords?.marketRatings ?? {});
    saveJsonToStorage(storageKeys.userStories, snapshot.localRecords?.userStories ?? []);
  }

  // ── Feed helpers ───────────────────────────────────────────────────────────
  function mergeLatestHumanChainFeed(payload: PublicFeedPayload) {
    const wallet = verifiedHuman?.wallet?.toLowerCase();
    if (payload.posts?.length) {
      setHumanPosts((cur) => {
        const seen = new Set(cur.map((p) => `${p.id}:${p.author}:${p.image}`));
        const incoming = payload.posts?.filter((p) => Boolean(p.image))
          .map((p) => ({ ...p, owner: Boolean(p.authorWallet && p.authorWallet.toLowerCase() === wallet), storageStatus: p.storageStatus ?? "cloud-safe" as const }))
          .filter((p) => !seen.has(`${p.id}:${p.author}:${p.image}`)) ?? [];
        return incoming.length ? [...incoming, ...cur].slice(0, 90) : cur;
      });
    }
    if (payload.marketplaceListings?.length) {
      setMarketplaceListings((cur) => {
        const seen = new Set(cur.map((l) => `${l.id}:${l.seller}:${l.title}`));
        const incoming = payload.marketplaceListings?.map((l) => ({ ...l, dataStorageStatus: l.dataStorageStatus ?? "cloud-safe" as const })).filter((l) => !seen.has(`${l.id}:${l.seller}:${l.title}`)) ?? [];
        return incoming.length ? [...incoming, ...cur].slice(0, 70) : cur;
      });
    }
    if (payload.stories?.length) {
      const storedStories = loadJsonFromStorage<UserStory[]>(storageKeys.userStories, []);
      const seen = new Set(storedStories.map((s) => `${s.id}:${s.author}:${s.title}`));
      const incoming = payload.stories.map((s) => ({ ...s, owner: Boolean(s.authorWallet && s.authorWallet.toLowerCase() === wallet), storageStatus: s.storageStatus ?? "cloud-safe" as const })).filter((s) => !seen.has(`${s.id}:${s.author}:${s.title}`));
      if (incoming.length) { saveJsonToStorage(storageKeys.userStories, [...incoming, ...storedStories].slice(0, 60)); setFeedRefreshNonce((n) => n + 1); }
    }
  }

  async function refreshLatestHumanChainFeed() {
    const response = await fetch("/api/data/feed", { cache: "no-store" });
    const payload = (await response.json()) as PublicFeedPayload;
    if (payload.ok && payload.blobStorageReady) mergeLatestHumanChainFeed(payload);
  }

  async function syncHumanAccount(action: "load" | "save", snapshot?: AccountSyncSnapshot) {
    if (!verifiedHuman?.wallet || verifiedHuman.mode !== "world") return null;
    const response = await fetch("/api/data/account", {
      body: JSON.stringify({ action, snapshot, wallet: verifiedHuman.wallet }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    return (await response.json()) as { ok?: boolean; pendingSetup?: boolean; snapshot?: { savedAt?: string; snapshot?: AccountSyncSnapshot } | null };
  }

  // ── Cloud account sync effect ──────────────────────────────────────────────
  useEffect(() => {
    if (!verifiedHuman?.wallet || verifiedHuman.mode !== "world") return;
    let cancelled = false;
    async function loadCloudAccount() {
      setAccountSyncReady(false); setAccountSyncStatus("loading");
      try {
        const payload = await syncHumanAccount("load");
        const cloudSnapshot = payload?.snapshot?.snapshot;
        if (cancelled) return;
        if (payload?.pendingSetup) { setAccountSyncStatus("offline"); setAccountSyncReady(true); return; }
        if (cloudSnapshot) {
          restoreAccountSnapshot(cloudSnapshot);
          recordHistory({ title: "HumanChain restored", detail: "Your World account data was restored from HumanChain cloud storage on this device.", kind: "profile" });
        } else { await syncHumanAccount("save", buildAccountSnapshot()); }
        if (!cancelled) { setAccountSyncReady(true); setAccountSyncStatus("ready"); }
      } catch { if (!cancelled) { setAccountSyncReady(true); setAccountSyncStatus("offline"); } }
    }
    void loadCloudAccount();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedHuman?.mode, verifiedHuman?.wallet]);

  // ── Feed refresh effect ────────────────────────────────────────────────────
  useEffect(() => {
    if (!verifiedHuman) return;
    let cancelled = false, lastRefreshAt = 0;
    async function refreshFeedSafely(force = false) {
      if (!force && Date.now() - lastRefreshAt < publicFeedFocusCooldownMs) return;
      lastRefreshAt = Date.now();
      try { if (!cancelled) await refreshLatestHumanChainFeed(); } catch { /* feed unavailable */ }
    }
    function refreshWhenVisible() { if (document.visibilityState === "visible") void refreshFeedSafely(); }
    void refreshFeedSafely(true);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    const interval = window.setInterval(() => void refreshFeedSafely(true), publicFeedRefreshMs);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedHuman?.wallet]);

  // ── Daily notification (up to 2 per day per portal config) ───────────────
  useEffect(() => {
    if (!verifiedHuman?.wallet || verifiedHuman.mode !== "world" || !notificationReady) return;

    const wallet = verifiedHuman.wallet.toLowerCase();
    const today = getLocalDateKey();
    const hour = new Date().getHours();

    // Morning slot: 7am–11am — daily question reminder
    const morningKey = `hc_notif_morning:${wallet}:${today}`;
    if (hour >= 7 && hour < 11 && !window.localStorage.getItem(morningKey)) {
      const t = window.setTimeout(async () => {
        const sent = await sendWorldUserNotification({
          title: "Daily Human Question",
          detail: "A new question is waiting for your honest answer. Earn +18 HP today.",
          sector: "daily",
          path: "/?tab=ask",
        });
        if (sent) {
          window.localStorage.setItem(morningKey, Date.now().toString());
          addNotification("Daily Human Question", "Your daily question is ready. Tap to answer and earn +18 HP.", "daily");
        }
      }, 45_000);
      return () => window.clearTimeout(t);
    }

    // Evening slot: 6pm–9pm — streak & activity reminder
    const eveningKey = `hc_notif_evening:${wallet}:${today}`;
    if (hour >= 18 && hour < 21 && !window.localStorage.getItem(eveningKey)) {
      const t = window.setTimeout(async () => {
        const sent = await sendWorldUserNotification({
          title: "Keep your Human Streak",
          detail: "Your chain is active today. Post a moment, check your passport, or browse the nearby market.",
          sector: "account",
          path: "/",
        });
        if (sent) {
          window.localStorage.setItem(eveningKey, Date.now().toString());
          addNotification("Keep your Human Streak", "Check in, post a moment, or browse the market before midnight.", "account");
        }
      }, 30_000);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedHuman?.wallet, notificationReady]);

  // ── Debounced cloud save effect ────────────────────────────────────────────
  useEffect(() => {
    if (!accountSyncReady || !verifiedHuman?.wallet || verifiedHuman.mode !== "world") return;
    const timeout = window.setTimeout(() => {
      setAccountSyncStatus("saving");
      void syncHumanAccount("save", buildAccountSnapshot())
        .then((payload) => setAccountSyncStatus(payload?.pendingSetup ? "offline" : "ready"))
        .catch(() => setAccountSyncStatus("offline"));
    }, 6000);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountSyncReady, appLanguage, dailyAnswered, dailyAnsweredAt, dailyAnsweredDate, historyRecords, humanPosts,
    lastCheckInAt, lastCheckInDate, links, marketLocation, marketplaceListings, notificationReady,
    notificationWelcomeSent, notifications, points, savedItems, streak,
    verifiedHuman?.mode, verifiedHuman?.username, verifiedHuman?.wallet]);

  // ── Action callbacks ───────────────────────────────────────────────────────
  function shouldShowToast(title: string, detail: string) {
    return importantToastTerms.some((term) => `${title} ${detail}`.toLowerCase().includes(term));
  }

  function act(title: string, detail: string) {
    if (shouldShowToast(title, detail)) setToast({ title, detail });
  }

  function addNotification(title: string, detail: string, sector: NotificationItem["sector"] = "account") {
    const time = formatShortTime();
    setNotifications((cur) => [{ id: Date.now(), title, detail, sector, time, read: false }, ...cur].slice(0, 60));
  }

  async function sendWorldUserNotification({ detail, path = "/", sector, title }: { detail: string; path?: string; sector: NotificationItem["sector"]; title: string }) {
    if (!verifiedHuman?.wallet || verifiedHuman.mode !== "world") return false;
    if (!canSendWorldNotificationOnce(verifiedHuman.wallet, sector, title)) return false;
    const response = await fetch("/api/world/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddresses: [verifiedHuman.wallet], sector, title, message: detail, path, localisations: [{ language: "en", title, message: detail }] }),
    });
    const payload = await response.json().catch(() => null);
    return response.ok && payload?.ok !== false;
  }

  function recordHistory(record: Omit<HistoryRecord, "id" | "time">) {
    const time = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    setHistoryRecords((cur) => [{ ...record, id: Date.now(), time }, ...cur]);
  }

  function resetHistory() {
    setHistoryRecords([{ id: Date.now(), title: "History reset", detail: "Local HumanChain activity history was cleared by the user.", time: "Now", kind: "profile" }]);
    act("History reset", "Your local HumanChain activity record was cleared.");
  }

  function clearMarketplaceData() {
    setMarketplaceListings([]);
    window.localStorage.removeItem(storageKeys.marketHolds);
    window.localStorage.removeItem(storageKeys.notifications);
    window.localStorage.removeItem(storageKeys.marketRatings);
    recordHistory({ title: "Marketplace data cleared", detail: "Stored listings, holds, photos, links, and marketplace drafts were removed locally.", kind: "market" });
    act("Marketplace cleared", "Your local marketplace listings were removed from this device.");
  }

  function clearPostData() {
    setHumanPosts(initialHumanPosts);
    recordHistory({ title: "Post data reset", detail: "Your local image posts were reset to the starter HumanChain feed.", kind: "delete" });
    act("Posts reset", "Your local image post data was cleared from this device.");
  }

  function deleteLocalAccount() {
    [storageKeys.posts, storageKeys.marketplace, storageKeys.history, storageKeys.bids,
      storageKeys.chainPremium, storageKeys.askThreads, storageKeys.askCountryRoutes,
      storageKeys.links, storageKeys.hpLedger, storageKeys.marketHolds, storageKeys.appMemory,
      storageKeys.userStories, storageKeys.profileImage,
    ].forEach((key) => window.localStorage.removeItem(key));
    setHumanPosts(initialHumanPosts); setLinks(initialLinks); setMarketplaceListings([]);
    setHistoryRecords([{ id: Date.now(), title: "HumanChain opened", detail: "Your chain history starts here.", time: "Today", kind: "profile" }]);
    setHpLedger([]); setVerifiedHuman(null); setAppLanguage(appLanguages[0]);
    setDailyAnswered(false); setDailyAnsweredAt(null); setDailyAnsweredDate(null);
    setLastCheckInAt(null); setLastCheckInDate(null);
    setMarketLocation({ label: "Location not shared", source: "not-requested", status: "idle" });
    setNotificationReady(false); setNotificationWelcomeSent(false);
    setNotifications(loadStoredNotifications()); setPoints(420); setSavedItems(3); setStreak(4);
    setToast({ title: "Local account deleted", detail: "Preview profile, stored marketplace data, posts, and history were removed from this device." });
  }

  function keepStreak(_detail = "Your Human Streak is alive for today.") {
    void _detail; void humanHaptic("light");
    setStreak((cur) => cur + 1);
  }

  function earnPoints(amount: number, reason: string) {
    void humanHaptic("light");
    setPoints((cur) => {
      const balanceAfter = cur + amount;
      const now = new Date();
      setHpLedger((ledger) => [{ amount, balanceAfter, date: getLocalDateKey(now), id: Date.now(), reason, time: formatCheckInTime(now), wallet: verifiedHuman?.wallet }, ...ledger].slice(0, 120));
      return balanceAfter;
    });
  }

  function openPayment(payment: PaymentRequest) {
    if (paymentBusy) return;
    if (!isVerifiedWorldHuman(verifiedHuman)) {
      setToast({ title: "Verify first", detail: "Continue with World App once, then every paid action and tip opens the World payment sheet." });
      return;
    }
    const feature = getPaymentFeature(payment);
    const amount = parsePaymentAmount(payment.amount);
    if (!isValidHumanChainPaymentAmount(feature, amount)) {
      setToast({ title: "Payment setup issue", detail: `${payment.title} is not wired to a valid HumanChain WLD payment feature yet.` });
      return;
    }
    setPaymentPrompt(payment);
  }

  async function enableHumanChainNotifications(context = "login") {
    try {
      const result = await requestWorldPermission(Permission.Notifications);
      if (!isWorldPermissionGranted(result)) {
        setToast({ title: "Open in World App", detail: "Notification permission must be granted inside World App before alerts are marked ready." });
        return;
      }
      setNotificationReady(true); setNotificationPromptDismissed(true); setNotificationCenterOpen(true);
      recordHistory({ title: "Notifications enabled", detail: "Daily questions, direct inbox, marketplace bids, story drops, payments, and account alerts can now notify this human.", kind: "profile" });
      if (!notificationWelcomeSent) {
        const welcomeTitle = "Welcome to HumanChain";
        const welcomeDetail = "Welcome to HumanChain. Ask real humans, post moments, trade safely, read stories, track your passport, and keep alerts on for replies, holds, payments, and safety.";
        addNotification(welcomeTitle, welcomeDetail, "welcome");
        addNotification("HumanChain guide unlocked", "Home guides your next action. Ask routes real replies. Moments holds photo posts and links. Market handles safer trade. Profile is always top-left.", "account");
        await sendWorldUserNotification({ title: welcomeTitle, detail: welcomeDetail, sector: "account", path: "/" });
        setNotificationWelcomeSent(true);
      }
      setToast({ title: "Notifications ready", detail: context === "login" ? "HumanChain will only send functional World App alerts tied to your account and activity." : "Sector alerts are ready for every important HumanChain action." });
    } catch (error) {
      setToast({ title: "Notification permission", detail: error instanceof Error ? error.message : "Open inside World App and allow HumanChain notifications." });
    }
  }

  async function enterWithWorld() {
    setGateBusy(true);
    try {
      const auth = await authenticateHumanWallet();
      const address = auth.verification?.address as string | undefined;
      if (!auth.verification?.ok || !address) {
        setToast({ title: "World verification needed", detail: auth.verification?.error ?? "Open HumanChain inside World App and verify your wallet." });
        return;
      }
      const freshCtx = getWorldMiniAppContext();
      const resolved = await resolveWorldProfileAfterAuth(address);
      const nextCtx = { ...freshCtx, ...resolved.context };
      const worldUsername = normalizeWorldUsername(resolved.username ?? freshCtx.username ?? worldContext.username);
      const worldPic = resolved.profilePictureUrl ?? freshCtx.profilePictureUrl;
      setWorldContext({ ...freshCtx, ...nextCtx, profilePictureUrl: worldPic, username: worldUsername, walletAddress: address });
      setVerifiedHuman({ deviceOS: nextCtx.deviceOS ?? freshCtx.deviceOS, lastSeenAt: new Date().toISOString(), launchLocation: nextCtx.launchLocation ?? freshCtx.launchLocation, profilePictureUrl: worldPic, username: worldUsername ?? "Resolving World username", wallet: address, mode: "world" });
      setTab("home"); setNotificationPromptDismissed(false);
      setToast({ title: "Verified human entered", detail: `${worldUsername ?? "World username will appear after World profile sync"} is ready. You can now ask, post, trade, tip, and use paid actions.` });
    } catch (error) {
      setToast({ title: "World login failed", detail: error instanceof Error ? error.message : "Try again inside World App." });
    } finally { setGateBusy(false); }
  }

  function enterPreview() {
    setVerifiedHuman({ deviceOS: worldContext.deviceOS, lastSeenAt: new Date().toISOString(), launchLocation: worldContext.launchLocation, profilePictureUrl: worldContext.profilePictureUrl, username: "@preview_human", mode: "preview" });
    setToast({ title: "Preview opened", detail: "World wallet, payments, and permissions remain ready for the real Mini App." });
  }

  async function confirmPayment(customAmount?: number) {
    if (!paymentPrompt || paymentBusy) return;
    const amount = customAmount ?? parsePaymentAmount(paymentPrompt.amount);
    const feature = getPaymentFeature(paymentPrompt);
    if (!isValidHumanChainPaymentAmount(feature, amount)) {
      setToast({ title: "Payment amount", detail: paymentPrompt.allowCustomAmount ? "Choose a tip between 0.1 and 100 WLD, using up to two decimals." : "This premium action has a fixed World App price." });
      return;
    }
    setPaymentBusy(true);
    let treasuryRecipient: string | undefined;
    try {
      const result = await payWithWorld({ amount, description: paymentPrompt.detail, feature, token: paymentToken });
      if ("pendingSetup" in result && result.pendingSetup) { setToast({ title: "World setup needed", detail: result.message }); setPaymentBusy(false); return; }
      if ("pendingWorldApp" in result && result.pendingWorldApp) { setToast({ title: "Open in World App", detail: result.message }); setPaymentBusy(false); return; }
      if ("ok" in result && !result.ok) { setToast({ title: "Payment not confirmed", detail: "error" in result && result.error ? result.error : "World payments are only counted after backend verification." }); setPaymentBusy(false); return; }
      if ("error" in result && result.error) { setToast({ title: "Payment not prepared", detail: result.error }); setPaymentBusy(false); return; }
      treasuryRecipient = "recipient" in result && typeof result.recipient === "string" ? result.recipient : undefined;
    } catch (error) {
      setToast({ title: "World payment failed", detail: error instanceof Error ? error.message : "Try again in World App." });
      setPaymentBusy(false); return;
    }
    try {
      const earnedPoints = paymentPrompt.points ?? 0;
      if (earnedPoints > 0) earnPoints(earnedPoints, `${paymentPrompt.title} payment reward`);
      await paymentPrompt.onConfirmed?.(amount);
      const formattedAmount = formatPaymentAmount(amount, paymentToken);
      recordHistory({ title: getPaymentKind(feature) === "tip" ? "Tip payment confirmed" : "Payment confirmed", detail: `${formattedAmount} confirmed for ${paymentPrompt.title} after World App payment and backend verification. Feature: ${feature}. ${earnedPoints > 0 ? `+${earnedPoints} HP recorded.` : "No HP reward attached."}`, kind: getPaymentKind(feature) });
      void storeSafeData("payment", `${feature}-${Date.now()}`, { amount, feature, human: verifiedHuman?.username, payerWallet: verifiedHuman?.wallet, paymentTitle: paymentPrompt.title, ...paymentPrompt.context, treasuryRecipient, token: paymentToken, wallet: verifiedHuman?.wallet });
      setToast({ title: `${formattedAmount} confirmed`, detail: paymentPrompt.success });
      setPaymentPrompt(null);
    } finally { setPaymentBusy(false); }
  }

  return {
    // state
    accountSyncStatus, activeField, appLanguage, chainEntryNonce, dailyAnswered,
    dailyAnsweredAt, dailyAnsweredDate, dailyResponses, feedRefreshNonce, gateBusy,
    historyRecords, hpLedger, humanPosts, lastCheckInAt, lastCheckInDate, links,
    marketLocation, marketplaceListings, notificationCenterOpen, notificationPromptDismissed,
    notificationReady, notifications, paymentBusy, paymentPrompt, paymentToken,
    points, profileImage, savedItems, streak, tab, toast, verifiedHuman, worldContext,
    // setters
    setActiveField, setAppLanguage, setChainEntryNonce, setDailyAnswered, setDailyAnsweredAt,
    setDailyAnsweredDate, setDailyResponses, setHumanPosts, setLastCheckInAt, setLastCheckInDate,
    setLinks, setMarketLocation, setMarketplaceListings, setNotificationCenterOpen,
    setNotificationPromptDismissed, setNotifications, setPaymentPrompt, setProfileImage,
    setSavedItems, setTab, setToast,
    // callbacks
    act, addNotification, clearMarketplaceData, clearPostData, confirmPayment,
    deleteLocalAccount, earnPoints, enableHumanChainNotifications,
    enterPreview, enterWithWorld, keepStreak, openPayment, recordHistory, resetHistory,
  };
}

export type HumanChainAppState = ReturnType<typeof useHumanChainApp>;
