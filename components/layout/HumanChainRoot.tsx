"use client";

import { CheckCircle2 } from "lucide-react";
import { isWorldMiniAppReady } from "@/lib/worldMiniApp";
import { formatCheckInTime, getLocalDateKey, getPrimaryProfileImage, getWorldDisplayUsername } from "@/lib/humanchain/utils";
import { BottomNavigation as BottomNav } from "@/components/layout/BottomNavigation";
import { LoginGate } from "@/components/layout/LoginGate";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { NotificationPermissionPrompt } from "@/components/layout/NotificationPermissionPrompt";
import { PaymentSheet } from "@/components/layout/PaymentSheet";
import { AskView } from "@/components/tabs/AskView";
import { ChainsView } from "@/components/tabs/ChainsView";
import { HomeView } from "@/components/tabs/HomeView";
import { MarketplaceView } from "@/components/tabs/MarketplaceView";
import { MeView } from "@/components/tabs/MeView";
import { SettingsView } from "@/components/tabs/SettingsView";
import { StoriesView } from "@/components/tabs/StoriesView";
import type { HumanChainAppState } from "@/lib/humanchain/useHumanChainApp";

export function HumanChainRoot(props: HumanChainAppState) {
  const {
    accountSyncStatus, activeField, appLanguage, chainEntryNonce,
    dailyAnswered, dailyAnsweredAt, dailyResponses, earnPoints, feedRefreshNonce,
    gateBusy, historyRecords, hpLedger, humanPosts, lastCheckInAt, lastCheckInDate,
    links, marketLocation, marketplaceListings, notificationCenterOpen,
    notificationPromptDismissed, notificationReady, notifications,
    paymentBusy, paymentPrompt, paymentToken, points, profileImage,
    savedItems, streak, tab, toast, verifiedHuman, worldContext,
    setActiveField, setAppLanguage, setChainEntryNonce, setDailyAnswered,
    setDailyAnsweredAt, setDailyAnsweredDate, setDailyResponses, setHumanPosts,
    setLastCheckInAt, setLastCheckInDate,
    setLinks, setMarketLocation, setMarketplaceListings, setNotificationCenterOpen,
    setNotificationPromptDismissed, setNotifications, setPaymentPrompt,
    setProfileImage, setSavedItems, setTab, setToast,
    act, clearMarketplaceData, clearPostData, confirmPayment, deleteLocalAccount,
    enableHumanChainNotifications, enterPreview, enterWithWorld, keepStreak,
    openPayment, recordHistory, resetHistory,
  } = props;

  const unreadNotificationCount = Math.max(
    notifications.filter((n) => !n.read).length,
    worldContext.pendingNotifications ?? 0,
  );

  const activeView = (() => {
    switch (tab) {
      case "ask":
        return (
          <AskView
            act={act}
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
            earnPoints={earnPoints}
            humanIdentity={verifiedHuman}
            marketLocation={marketLocation}
            marketplaceListings={marketplaceListings}
            openPayment={openPayment}
            recordHistory={recordHistory}
            setMarketLocation={setMarketLocation}
            setMarketplaceListings={setMarketplaceListings}
            worldContext={worldContext}
          />
        );
      case "me":
        return (
          <MeView
            accountSyncStatus={accountSyncStatus}
            act={act}
            earnPoints={earnPoints}
            historyRecords={historyRecords}
            hpLedger={hpLedger}
            humanPosts={humanPosts}
            links={links}
            marketplaceListings={marketplaceListings}
            marketLocation={marketLocation}
            openPayment={openPayment}
            points={points}
            profileImage={profileImage}
            lastCheckInAt={lastCheckInAt}
            lastCheckInDate={lastCheckInDate}
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
            recordHistory={recordHistory}
            savedItems={savedItems}
            setProfileImage={setProfileImage}
            setTab={setTab}
            streak={streak}
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
            worldContext={worldContext}
          />
        );
      default:
        return (
          <HomeView
            act={act}
            appLanguage={appLanguage}
            dailyAnswered={dailyAnswered}
            dailyAnsweredAt={dailyAnsweredAt}
            dailyResponses={dailyResponses}
            earnPoints={earnPoints}
            humanPosts={humanPosts}
            links={links}
            marketplaceListings={marketplaceListings}
            notificationReady={notificationReady}
            notificationUnreadCount={unreadNotificationCount}
            onEnableNotifications={() => enableHumanChainNotifications("settings")}
            onOpenNotifications={() => setNotificationCenterOpen(true)}
            profileImage={profileImage}
            recordHistory={recordHistory}
            setDailyAnsweredAt={setDailyAnsweredAt}
            setDailyAnsweredDate={setDailyAnsweredDate}
            setActiveField={setActiveField}
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
      <section className="phone-frame">
        {verifiedHuman ? activeView : (
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
        {verifiedHuman && tab !== "home" && tab !== "me" ? (
          <button
            aria-label="Open Human Passport"
            className="floating-profile-button"
            onClick={() => setTab("me")}
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
        ) : null}
        {toast ? (
          <div className="toast" role="status">
            <CheckCircle2 size={18} />
            <div>
              <strong>{toast.title}</strong>
              <span>{toast.detail}</span>
            </div>
            <button onClick={() => setToast(null)} type="button">Close</button>
          </div>
        ) : null}
        {paymentPrompt ? (
          <PaymentSheet
            onCancel={() => setPaymentPrompt(null)}
            onConfirm={confirmPayment}
            busy={paymentBusy}
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
        {verifiedHuman && points > 0 && !notificationReady && !notificationPromptDismissed ? (
          <NotificationPermissionPrompt
            onClose={() => setNotificationPromptDismissed(true)}
            onEnable={() => enableHumanChainNotifications("prompt")}
            username={getWorldDisplayUsername(worldContext, verifiedHuman)}
          />
        ) : null}
        {verifiedHuman ? (
          <BottomNav
            active={tab}
            appLanguage={appLanguage}
            onChange={(nextTab) => {
              if (nextTab === "chains") { setActiveField(null); setChainEntryNonce((n) => n + 1); }
              setTab(nextTab);
            }}
          />
        ) : null}
      </section>
    </main>
  );
}
