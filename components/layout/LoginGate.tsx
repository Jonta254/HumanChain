"use client";

import { BadgeCheck, Bell, CircleDollarSign, Radio, ShieldCheck } from "lucide-react";
import type { AppLanguage } from "@/lib/data/languages";
import type { WorldMiniAppContext } from "@/lib/world/types";

export function LoginGate({
  appLanguage,
  busy,
  notificationReady,
  onEnableNotifications,
  onPreview,
  onVerify,
  showPreview,
  worldContext,
}: {
  appLanguage: AppLanguage;
  busy: boolean;
  notificationReady: boolean;
  onEnableNotifications: () => void | Promise<void>;
  onPreview: () => void;
  onVerify: () => void | Promise<void>;
  showPreview: boolean;
  worldContext: WorldMiniAppContext;
}) {
  const gateCopy = appLanguage.gate;

  return (
    <div className="login-gate">
      <section className="gate-card">
        <div className="gate-brand">
          <img alt="HumanChain logo" src="/images/humanchain-logo.png" />
          <div>
            <span>{gateCopy.appLabel}</span>
            <strong>HumanChain</strong>
          </div>
        </div>
        <div className="gate-orbit" aria-hidden="true">
          <span />
          <i />
          <b />
        </div>
        <h1>{gateCopy.headline}</h1>
        <p>{gateCopy.intro}</p>
        <div className="gate-context-strip">
          <span>{gateCopy.openedFrom} {worldContext.launchLocation ?? "World App preview"}</span>
          <span>{worldContext.deviceOS ?? gateCopy.deviceFallback} {gateCopy.deviceReady}</span>
          <span>{appLanguage.name} {gateCopy.selected}</span>
        </div>
        {notificationReady ? (
          <div className="gate-notification-prompt">
            <Bell size={18} />
            <div>
              <strong>{gateCopy.notificationsAllowed}</strong>
              <span>{gateCopy.notificationsDetail}</span>
            </div>
            <button onClick={onEnableNotifications} type="button">
              {gateCopy.ready}
            </button>
          </div>
        ) : null}
        <button className="gate-primary" disabled={busy} onClick={onVerify} type="button">
          <ShieldCheck size={19} />
          {busy ? gateCopy.checkingWallet : gateCopy.continueWithWorld}
        </button>
        {showPreview ? (
          <button className="gate-secondary" onClick={onPreview} type="button">
            {gateCopy.preview}
          </button>
        ) : null}
      </section>
      <section className="gate-trust-grid" aria-label={gateCopy.trustLabel}>
        {gateCopy.trustCards.map(([title, detail], index) => {
          const icon =
            index === 0 ? <BadgeCheck size={18} /> : index === 1 ? <CircleDollarSign size={18} /> : <Radio size={18} />;

          return (
            <div key={title}>
              {icon}
              <strong>{title}</strong>
              <span>{detail}</span>
            </div>
          );
        })}
      </section>
    </div>
  );
}
