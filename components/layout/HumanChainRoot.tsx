"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { MiniKit } from "@worldcoin/minikit-js";
import { Haptic, SafeAreaView, TopBar, VerificationBadge, useHaptics } from "@worldcoin/mini-apps-ui-kit-react";
import { isWorldMiniAppReady } from "@/lib/worldMiniApp";
import { formatCheckInTime, getChainScore, getLocalDateKey, getPrimaryProfileImage, getWorldDisplayUsername } from "@/lib/humanchain/utils";
import { storageKeys } from "@/lib/humanchain/storage";
import { BottomNavigation as BottomNav } from "@/components/layout/BottomNavigation";
import { LoginGate } from "@/components/layout/LoginGate";
import { OnboardingModal } from "@/components/layout/OnboardingModal";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { NotificationPermissionPrompt } from "@/components/layout/NotificationPermissionPrompt";
import { PaymentSheet } from "@/components/layout/PaymentSheet";
import { AIGuideSheet } from "@/components/layout/AIGuideSheet";
import { AskView } from "@/components/tabs/AskView";
import { ChainsView } from "@/components/tabs/ChainsView";
import { CreateView } from "@/components/tabs/CreateView";
import { HomeView } from "@/components/tabs/HomeView";
import { MarketplaceView } from "@/components/tabs/MarketplaceView";
import { MeView } from "@/components/tabs/MeView";
import { SettingsView } from "@/components/tabs/SettingsView";
import { StoriesView } from "@/components/tabs/StoriesView";
import { CultureView } from "@/components/tabs/CultureView";
import type { HumanChainAppState } from "@/lib/humanchain/useHumanChainApp";

export function HumanChainRoot(props: HumanChainAppState) {
  const {
    accountSyncStatus, activeField, aiAvailable, appLanguage, chainEntryNonce,
    dailyAnswered, earnPoints, feedRefreshNonce,
    gateBusy, historyRecords, hpLedger, humanPosts, lastCheckInDate,
    links, marketLocation, marketplaceListings, notificationCenterOpen,
    notificationPromptDismissed, notificationReady, notifications,
    paymentBusy, paymentPrompt, paymentToken, points, profileImage,
    referralShareCount, referredBy, savedItems, streak, tab, toast, verifiedHuman, worldContext,
    setActiveField, setAppLanguage, setChainEntryNonce, setDailyAnswered,
    setDailyAnsweredAt, setDailyAnsweredDate, setDailyResponses, setHumanPosts,
    setLastCheckInAt, setLastCheckInDate,
    setLinks, setNotificationCenterOpen,
    setNotificationPromptDismissed, setNotifications, setPaymentPrompt,
    setProfileImage, setSavedItems, setTab, setToast,
    act, addNotification, clearMarketplaceData, clearPostData, confirmPayment, copyReferralLink,
    deleteLocalAccount, enableHumanChainNotifications, enterPreview, enterWithWorld,
    keepStreak, openPayment, recordHistory, resetHistory, shareReferralLink,
  } = props;

  const { selection, notification } = useHaptics();

  // Start assuming onboarding is done so server and client agree on the
  // first render; the real value is read from localStorage after mount to
  // avoid a hydration mismatch for first-time visitors.
  const [onboardingDone, setOnboardingDone] = useState(true);

  useEffect(() => {
    // One-time post-mount sync from localStorage — not a state cascade,
    // this is the standard hydration-safe pattern for reading storage
    // that isn't available during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOnboardingDone(Boolean(localStorage.getItem(storageKeys.onboarded)));
  }, []);

  const [aiGuideOpen, setAiGuideOpen] = useState(false);

  // Track previous tab so the back button always returns to the right place
  const prevTabRef = useRef<typeof tab>("home");
  const [prevTab, setPrevTab] = useState<typeof tab>("home");
  useEffect(() => {
    if (tab !== prevTabRef.current) {
      setPrevTab(prevTabRef.current);
      prevTabRef.current = tab;
    }
  }, [tab]);

  function goBack() {
    const dest = prevTab === tab ? "home" : prevTab;
    if (dest === "chains") { setActiveField(null); setChainEntryNonce((n) => n + 1); }
    setTab(dest);
  }

  const TAB_LABELS: Record<typeof tab, string> = {
    home: "Home", ask: "Ask", chains: "Chains", stories: "Stories",
    market: "Market", me: "Passport", create: "Create", settings: "Settings", culture: "Culture",
  };
  const TAB_TITLES: Record<typeof tab, string> = {
    home: "Home", ask: "Ask The World", chains: "Moments", stories: "Human Story",
    market: "Marketplace", me: "Human Passport", create: "Create", settings: "Settings", culture: "Culture Rooms",
  };
  const backLabel = TAB_LABELS[prevTab === tab ? "home" : prevTab] ?? "Home";

  function completeOnboarding() {
    if (typeof window !== "undefined") localStorage.setItem(storageKeys.onboarded, "1");
    setOnboardingDone(true);
    earnPoints(25, "Welcome bonus — you started your HumanChain journey!");
  }

  useEffect(() => {
    // Mark <html> so World App CSS rules activate without delaying first paint.
    if (MiniKit.isInstalled()) {
      document.documentElement.setAttribute("data-world-mini-app", "true");
    }
  }, []);

  // Apply MiniKit safe-area insets as CSS variables so layout adapts to the
  // exact device notch/home-indicator geometry reported by World App.
  useEffect(() => {
    const insets = worldContext.safeAreaInsets;
    if (!insets) return;
    const s = document.documentElement.style;
    s.setProperty("--world-safe-top", `${insets.top ?? 0}px`);
    s.setProperty("--world-safe-right", `${insets.right ?? 0}px`);
    s.setProperty("--world-safe-bottom", `${insets.bottom ?? 0}px`);
    s.setProperty("--world-safe-left", `${insets.left ?? 0}px`);
  }, [worldContext.safeAreaInsets]);

  // Auto-dismiss toast after 4 seconds (World App UX guideline: avoid persistent overlays)
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast, setToast]);

  // Scroll-lock: prevent background scroll while any modal/sheet is open
  const anyModalOpen = Boolean(paymentPrompt || notificationCenterOpen);
  useEffect(() => {
    document.body.classList.toggle("modal-open", anyModalOpen);
    return () => document.body.classList.remove("modal-open");
  }, [anyModalOpen]);

  const unreadNotificationCount = Math.max(
    notifications.filter((n) => !n.read).length,
    worldContext.pendingNotifications ?? 0,
  );

  const activeView = (() => {
    switch (tab) {
      case "create":
        return (
          <CreateView
            act={act}
            setTab={setTab}
          />
        );
      case "ask":
        return (
          <AskView
            act={act}
            aiAvailable={aiAvailable}
            earnPoints={earnPoints}
            humanIdentity={verifiedHuman}
            keepStreak={keepStreak}
            openPayment={openPayment}
            recordHistory={recordHistory}
          />
        );
      case "chains":
        return (
          <ChainsView
            activeField={activeField}
            act={act}
            earnPoints={earnPoints}
            humanIdentity={verifiedHuman}
            humanPosts={humanPosts}
            key={`chains-${chainEntryNonce}`}
            keepStreak={keepStreak}
            links={links}
            openPayment={openPayment}
            recordHistory={recordHistory}
            setActiveField={setActiveField}
            setHumanPosts={setHumanPosts}
            setLinks={setLinks}
          />
        );
      case "stories":
        return (
          <StoriesView
            act={act}
            addNotification={addNotification}
            aiAvailable={aiAvailable}
            earnPoints={earnPoints}
            feedRefreshNonce={feedRefreshNonce}
            humanIdentity={verifiedHuman}
            keepStreak={keepStreak}
            openPayment={openPayment}
            recordHistory={recordHistory}
            setSavedItems={setSavedItems}
          />
        );
      case "market":
        return (
          <MarketplaceView
            act={act}
            addNotification={addNotification}
            earnPoints={earnPoints}
            humanIdentity={verifiedHuman}
            marketLocation={marketLocation}
            marketplaceListings={marketplaceListings}
            openPayment={openPayment}
            recordHistory={recordHistory}
            setMarketLocation={props.setMarketLocation}
            setMarketplaceListings={props.setMarketplaceListings}
            worldContext={worldContext}
          />
        );
      case "me":
        return (
          <MeView
            accountSyncStatus={accountSyncStatus}
            act={act}
            aiAvailable={aiAvailable}
            copyReferralLink={copyReferralLink}
            earnPoints={earnPoints}
            historyRecords={historyRecords}
            hpLedger={hpLedger}
            humanPosts={humanPosts}
            links={links}
            marketplaceListings={marketplaceListings}
            marketLocation={marketLocation}
            onCheckIn={() => {
              const now = new Date();
              const today = getLocalDateKey(now);
              if (lastCheckInDate === today) {
                act("Already checked in", `Your HumanChain check-in is sealed for ${formatCheckInTime(now)}.`);
                return;
              }
              setLastCheckInDate(today);
              setLastCheckInAt(formatCheckInTime(now));
              recordHistory({ title: "Daily check-in", detail: `HumanChain check-in completed on ${today} at ${formatCheckInTime(now)}.`, kind: "profile" });
              earnPoints(10, "Daily check-in recorded with your device calendar and time.");
              keepStreak("Daily check-in sealed your Human Chain for today.");
            }}
            openPayment={openPayment}
            points={points}
            profileImage={profileImage}
            lastCheckInDate={lastCheckInDate}
            recordHistory={recordHistory}
            referralShareCount={referralShareCount}
            referredBy={referredBy}
            savedItems={savedItems}
            setProfileImage={setProfileImage}
            setTab={setTab}
            shareReferralLink={shareReferralLink}
            streak={streak}
            verifiedHuman={verifiedHuman}
            worldContext={worldContext}
          />
        );
      case "culture":
        return (
          <CultureView
            act={act}
            earnPoints={earnPoints}
            openPayment={openPayment}
            setTab={setTab}
            verifiedHuman={verifiedHuman}
            worldContext={worldContext}
          />
        );
      case "settings":
        return (
          <SettingsView
            act={act}
            activeLanguage={appLanguage}
            clearMarketplaceData={clearMarketplaceData}
            clearPostData={clearPostData}
            deleteLocalAccount={deleteLocalAccount}
            notificationReady={notificationReady}
            onChangeLanguage={setAppLanguage}
            onEnableNotifications={() => enableHumanChainNotifications("settings")}
            resetHistory={resetHistory}
            setTab={setTab}
            verifiedHuman={verifiedHuman}
            worldContext={worldContext}
          />
        );
      default:
        return (
          <HomeView
            act={act}
            appLanguage={appLanguage}
            dailyAnswered={dailyAnswered}
            earnPoints={earnPoints}
            humanPosts={humanPosts}
            marketplaceListings={marketplaceListings}
            notificationReady={notificationReady}
            notificationUnreadCount={unreadNotificationCount}
            onEnableNotifications={() => enableHumanChainNotifications("settings")}
            onOpenNotifications={() => setNotificationCenterOpen(true)}
            onOpenGuide={() => setAiGuideOpen(true)}
            profileImage={profileImage}
            recordHistory={recordHistory}
            setDailyAnsweredAt={setDailyAnsweredAt}
            setDailyAnsweredDate={setDailyAnsweredDate}
            points={points}
            setDailyAnswered={setDailyAnswered}
            setDailyResponses={setDailyResponses}
            setTab={setTab}
            savedItems={savedItems}
            streak={streak}
            verifiedHuman={verifiedHuman}
            worldContext={worldContext}
          />
        );
    }
  })();

  return (
    <main className="app-shell">
      {verifiedHuman && !onboardingDone && <OnboardingModal onComplete={completeOnboarding} />}
      <section className="phone-frame">
        {verifiedHuman ? (
          <div key={tab} className="screen-transition-wrapper">
            {activeView}
          </div>
        ) : (
          <LoginGate
            appLanguage={appLanguage}
            busy={gateBusy}
            notificationReady={notificationReady}
            onEnableNotifications={() => enableHumanChainNotifications("login")}
            onPreview={enterPreview}
            onVerify={enterWithWorld}
            showPreview={!isWorldMiniAppReady()}
            worldContext={worldContext}
          />
        )}
        {/* Back button — shown only on secondary tabs not in the bottom nav */}
        {verifiedHuman && !["home", "chains", "stories", "market", "create", "culture"].includes(tab) ? (
          <TopBar
            className="hc-topbar-back"
            title={TAB_TITLES[tab]}
            startAdornment={
              <Haptic variant="selection" asChild>
                <button
                  aria-label={`Back to ${backLabel}`}
                  className="hc-back-btn"
                  onClick={() => { selection(); goBack(); }}
                  type="button"
                >
                  <ArrowLeft size={15} />
                  <span>{backLabel}</span>
                </button>
              </Haptic>
            }
            endAdornment={
              verifiedHuman ? (
                <VerificationBadge verified={Boolean(verifiedHuman)} />
              ) : null
            }
          />
        ) : null}

        {verifiedHuman && tab !== "home" && tab !== "me" && tab !== "create" ? (
          <Haptic variant="selection" asChild>
            <button
              aria-label="Open Human Passport"
              className="floating-profile-button"
              onClick={() => { selection(); setTab("me"); }}
              type="button"
            >
            {getPrimaryProfileImage(profileImage, verifiedHuman, worldContext) ? (
              <img alt="" src={getPrimaryProfileImage(profileImage, verifiedHuman, worldContext)} />
            ) : (
              <span>
                {getWorldDisplayUsername(worldContext, verifiedHuman).replace(/^@/, "").trim().charAt(0).toUpperCase() || "H"}
              </span>
            )}
            </button>
          </Haptic>
        ) : null}
        {toast ? (
          <div aria-live="polite" className={`toast toast-enter${/fail|not confirm|not prepar|error|invalid|denied|wrong|mismatch/i.test(toast.title) ? " toast-error" : ""}`} role="status">
            {/fail|not confirm|not prepar|error|invalid|denied|wrong|mismatch/i.test(toast.title) ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <div>
              <strong>{toast.title}</strong>
              <span>{toast.detail}</span>
            </div>
            <button aria-label="Dismiss" onClick={() => setToast(null)} type="button">✕</button>
          </div>
        ) : null}
        {aiGuideOpen ? (
          <AIGuideSheet
            chainScore={getChainScore({ points, streak, posts: humanPosts.filter((p) => p.owner).length, savedItems })}
            onClose={() => setAiGuideOpen(false)}
            points={points}
            streak={streak}
          />
        ) : null}
        {paymentPrompt ? (
          <PaymentSheet
            onCancel={() => setPaymentPrompt(null)}
            onConfirm={confirmPayment}
            busy={paymentBusy}
            payerHuman={verifiedHuman}
            payment={paymentPrompt}
            selectedToken={paymentToken}
          />
        ) : null}
        {notificationCenterOpen ? (
          <NotificationCenter
            notificationReady={notificationReady}
            notifications={notifications}
            onClose={() => setNotificationCenterOpen(false)}
            onEnable={() => enableHumanChainNotifications("center")}
            onMarkAllRead={() => setNotifications((cur) => cur.map((n) => ({ ...n, read: true })))}
          />
        ) : null}
        {verifiedHuman && onboardingDone && points > 0 && !notificationReady && !notificationPromptDismissed ? (
          <NotificationPermissionPrompt
            onClose={() => setNotificationPromptDismissed(true)}
            onEnable={() => enableHumanChainNotifications("prompt")}
            username={getWorldDisplayUsername(worldContext, verifiedHuman)}
          />
        ) : null}
        {verifiedHuman ? (
          <SafeAreaView edges={["bottom"]} className="hc-nav-safe">
            <BottomNav
              active={tab}
              appLanguage={appLanguage}
              onChange={(nextTab) => {
                if (nextTab === "chains") { setActiveField(null); setChainEntryNonce((n) => n + 1); }
                selection();
                setTab(nextTab);
              }}
              onCreate={() => { notification("success"); setTab("create"); }}
            />
          </SafeAreaView>
        ) : null}
      </section>
    </main>
  );
}
