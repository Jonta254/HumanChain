export type HistoryRecord = {
  id: number;
  title: string;
  detail: string;
  time: string;
  kind:
    | "comment"
    | "delete"
    | "market"
    | "payment"
    | "post"
    | "profile"
    | "reaction"
    | "story"
    | "tip";
};

export type HpLedgerRecord = {
  amount: number;
  balanceAfter: number;
  date: string;
  id: number;
  reason: string;
  time: string;
  wallet?: string;
};
