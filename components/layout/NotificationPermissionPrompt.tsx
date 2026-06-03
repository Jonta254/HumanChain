"use client";

import { Bell } from "lucide-react";

export function NotificationPermissionPrompt({
  onClose,
  onEnable,
  username,
}: {
  onClose: () => void;
  onEnable: () => void | Promise<void>;
  username: string;
}) {
  return (
    <section className="notification-prompt-backdrop" role="dialog" aria-modal="true">
      <div className="notification-prompt-card">
        <div className="notification-prompt-icon">
          <Bell size={24} />
          <i />
        </div>
        <span className="section-kicker">HumanChain alerts</span>
        <h2>Stay connected to real human activity.</h2>
        <p>
          {username} can receive useful World App alerts for replies, marketplace holds,
          payments, story drops, daily questions, and account safety.
        </p>
        <div className="notification-guide-list">
          <span>Welcome message and user guide</span>
          <span>Inbox, bids, tips, and payment receipts</span>
          <span>Daily chain prompts and important account alerts</span>
        </div>
        <div className="notification-prompt-actions">
          <button onClick={onEnable} type="button">
            Enable notifications
          </button>
          <button className="secondary" onClick={onClose} type="button">
            Not now
          </button>
        </div>
        <small>World requires Developer Portal setup and user permission before push alerts are sent.</small>
      </div>
    </section>
  );
}
