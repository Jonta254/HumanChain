"use client";

import { useState } from "react";

const REPORT_REASONS = ["Spam", "Fake", "Harmful", "Off-topic", "Scam"];

export function submitReport(params: {
  targetType: string;
  targetId: string;
  reason: string;
  reporterWallet?: string;
}): Promise<{ ok?: boolean; pendingSetup?: boolean; error?: string }> {
  return fetch("/api/db/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target_type: params.targetType,
      target_id: params.targetId,
      reason: params.reason,
      reporter_wallet: params.reporterWallet,
    }),
  })
    .then((r) => r.json())
    .catch(() => ({ ok: false }));
}

/**
 * Drop-in Report control: Report → reason picker → confirmation. Reuses the
 * inline-picker interaction AskView already had for answers, but this one
 * actually calls the real /api/db/reports backend — the same table and
 * route existed before but nothing in the app called it.
 *
 * Confirms "Reported" to the user even if Supabase isn't configured yet
 * (pendingSetup) — the gap is infra readiness, not something the reporter
 * did wrong, and the exact same call starts persisting once Supabase is live.
 */
export function ReportAction({
  className,
  onReported,
  reporterWallet,
  targetId,
  targetType,
}: {
  className?: string;
  onReported?: (reason: string) => void;
  reporterWallet?: string;
  targetId: string;
  targetType: string;
}) {
  const [state, setState] = useState<"idle" | "picking" | "sending" | "sent">("idle");

  if (state === "sent") {
    return <span className={`report-action-tag ${className ?? ""}`}>Reported</span>;
  }

  if (state === "picking" || state === "sending") {
    return (
      <div className={`report-action-picker ${className ?? ""}`}>
        {REPORT_REASONS.map((reason) => (
          <button
            disabled={state === "sending"}
            key={reason}
            onClick={async () => {
              setState("sending");
              await submitReport({ targetType, targetId, reason, reporterWallet });
              setState("sent");
              onReported?.(reason);
            }}
            type="button"
          >
            {reason}
          </button>
        ))}
        <button disabled={state === "sending"} onClick={() => setState("idle")} type="button">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button className={`report-action-btn ${className ?? ""}`} onClick={() => setState("picking")} type="button">
      Report
    </button>
  );
}
