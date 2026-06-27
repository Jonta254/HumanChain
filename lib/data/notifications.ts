import type { NotificationItem } from "@/types/ui";

export const firstRunNotifications: NotificationItem[] = [
  {
    id: 101,
    title: "Mini app notifications",
    detail:
      "HumanChain can send functional World App alerts after you grant notification permission inside World App.",
    time: "Now",
    sector: "welcome",
    read: false,
  },
  {
    id: 102,
    title: "Inbox alerts",
    detail:
      "Ask replies, comments, World Chat openings, and useful human responses belong in the inbox sector.",
    time: "Now",
    sector: "inbox",
    read: false,
  },
  {
    id: 103,
    title: "Chain and story alerts",
    detail:
      "Chain reactions, tips, story unlocks, saved verdicts, and useful reply updates belong here.",
    time: "Now",
    sector: "daily",
    read: false,
  },
  {
    id: 104,
    title: "Account and payments",
    detail:
      "Payment confirmations, safety notices, streak reminders, and account changes use account or payment sectors.",
    time: "Now",
    sector: "account",
    read: false,
  },
];
