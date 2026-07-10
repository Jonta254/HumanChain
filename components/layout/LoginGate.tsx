"use client";

import { BadgeCheck, Bell, CircleDollarSign, Radio, ShieldCheck } from "lucide-react";
import { Button, Haptic, Spinner, useHaptics } from "@worldcoin/mini-apps-ui-kit-react";
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
  const { impact, selection } = useHaptics();

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
        <h1>{gateCopy.headline}</h1>
        <p>{gateCopy.intro}</p>
        <div className="gate-context-strip">
          <span>{gateCopy.openedFrom} {worldContext.launchLocation ?? "World App"}</span>
          <span>{appLanguage.name}</span>
        </div>
        {notificationReady ? (
          <div className="gate-notification-prompt">
            <Bell size={18} />
            <div>
              <strong>{gateCopy.notificationsAllowed}</strong>
              <span>{gateCopy.notificationsDetail}</span>
            </div>
            <Haptic variant="selection" asChild>
              <Button variant="tertiary" size="sm" onClick={() => { selection(); void onEnableNotifications(); }} type="button">
                {gateCopy.ready}
              </Button>
            </Haptic>
          </div>
        ) : null}
        <Haptic variant="impact" type="medium" asChild>
          <Button
            variant="primary"
            fullWidth
            disabled={busy}
            onClick={() => { impact("medium"); void onVerify(); }}
            type="button"
          >
            {busy ? <Spinner /> : <ShieldCheck size={19} />}
            {busy ? gateCopy.checkingWallet : gateCopy.continueWithWorld}
          </Button>
        </Haptic>
        {showPreview ? (
          <Haptic variant="selection" asChild>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => { selection(); onPreview(); }}
              type="button"
            >
              {gateCopy.preview}
            </Button>
          </Haptic>
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
