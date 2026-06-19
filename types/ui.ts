export type Tab = "home" | "ask" | "market" | "chains" | "stories" | "me" | "settings" | "create" | "culture";

export type Toast = {
  title: string;
  detail: string;
};

export type NotificationItem = {
  id: number;
  title: string;
  detail: string;
  time: string;
  sector: "welcome" | "inbox" | "marketplace" | "daily" | "stories" | "payments" | "account";
  read: boolean;
};

export type MomentReactionSelection = {
  field: "reactions" | "loves";
  reaction: string;
};

export type PaymentRequest = {
  allowCustomAmount?: boolean;
  title: string;
  amount: string;
  detail: string;
  context?: Record<string, string | number | undefined>;
  maxAmount?: number;
  minAmount?: number;
  success: string;
  feature?: string;
  onConfirmed?: (amount: number) => void | Promise<void>;
  points?: number;
};

export type OpenPayment = (payment: PaymentRequest) => void;

export type EarnPoints = (amount: number, reason: string) => void;
