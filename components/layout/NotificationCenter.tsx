"use client";

import type { NotificationItem } from "@/types/ui";

export function NotificationCenter({
  notificationReady,
  notifications,
  onClose,
  onEnable,
  onMarkAllRead,
}: {
  notificationReady: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
  onEnable: () => void | Promise<void>;
  onMarkAllRead: () => void;
}) {
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <section className="notification-center-backdrop" role="dialog" aria-modal="true">
      <div className="notification-center">
        <div className="notification-center-head">
          <div>
            <span className="section-kicker">Notification center</span>
            <h2>Mini app notifications</h2>
            <p>
              {notificationReady
                ? "World App notification permission is connected for HumanChain mini-app alerts."
                : "Enable World App notifications for Ask replies, chain reactions, payments, stories, and account alerts."}
            </p>
          </div>
          <button onClick={onClose} type="button">
            Close
          </button>
        </div>
        <div className="notification-center-actions">
          <button onClick={notificationReady ? onMarkAllRead : onEnable} type="button">
            {notificationReady ? `Mark ${unreadCount || "all"} read` : "Enable World alerts"}
          </button>
        </div>
        <div className="notification-feed">
          {notifications.length ? (
            notifications.map((notification) => (
              <article className={notification.read ? "read" : ""} key={notification.id}>
                <span>{notification.sector}</span>
                <strong>{notification.title}</strong>
                <p>{notification.detail}</p>
                <small>{notification.time}</small>
              </article>
            ))
          ) : (
            <article className="read">
              <span>mini app</span>
              <strong>No notification messages yet</strong>
              <p>HumanChain will only list functional mini-app alerts here after permission is granted.</p>
              <small>Now</small>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
