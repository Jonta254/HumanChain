"use client";

import { useEffect, useState } from "react";
import { CheckCircle, ShieldCheck, X, Zap } from "lucide-react";
import {
  humanChainPaymentTokens,
  isValidHumanChainPaymentAmount,
  type HumanChainPaymentToken,
} from "@/lib/worldPayments";
import { formatPaymentAmount, getPaymentFeature, parsePaymentAmount } from "@/lib/humanchain/utils";
import type { PaymentRequest } from "@/types/ui";

export function PaymentSheet({
  busy,
  onCancel,
  onConfirm,
  payment,
  selectedToken,
}: {
  busy: boolean;
  onCancel: () => void;
  onConfirm: (amount?: number) => void | Promise<void>;
  payment: PaymentRequest;
  selectedToken: HumanChainPaymentToken;
}) {
  const [customAmount, setCustomAmount] = useState(() =>
    parsePaymentAmount(payment.amount).toString(),
  );
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!busy) { setElapsed(0); return; }
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [busy]);

  const amount = payment.allowCustomAmount
    ? Number.parseFloat(customAmount)
    : parsePaymentAmount(payment.amount);

  const amountValid = isValidHumanChainPaymentAmount(getPaymentFeature(payment), amount);
  const tokenLabel = humanChainPaymentTokens[selectedToken].label;
  const displayAmount = Number.isFinite(amount)
    ? formatPaymentAmount(amount, selectedToken)
    : `0 ${tokenLabel}`;

  return (
    <div className="ps-backdrop" role="dialog" aria-modal="true" aria-label="Payment">
      <div className="ps-sheet">

        {/* Header */}
        <div className="ps-header">
          <div className="ps-header-left">
            <span className="ps-world-badge">
              <ShieldCheck size={13} />
              World App Pay
            </span>
            <strong className="ps-amount">{displayAmount}</strong>
          </div>
          <button
            className="ps-close"
            onClick={onCancel}
            disabled={busy}
            aria-label="Cancel payment"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <p className="ps-title">{payment.title}</p>
        {payment.detail ? <p className="ps-detail">{payment.detail}</p> : null}

        {/* Custom amount input */}
        {payment.allowCustomAmount && (
          <label className="ps-amount-field">
            <span>Amount (WLD)</span>
            <div className="ps-amount-input-wrap">
              <input
                aria-label="Tip amount in WLD"
                inputMode="decimal"
                min={payment.minAmount ?? 0.1}
                max={payment.maxAmount ?? 100}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="1.0"
                step="0.1"
                type="number"
                value={customAmount}
              />
              <span className="ps-amount-unit">WLD</span>
            </div>
          </label>
        )}

        {/* Trust row */}
        <div className="ps-trust-row">
          <span><ShieldCheck size={12} />Backend verified</span>
          <span>WLD only</span>
          {payment.points ? (
            <span className="ps-hp-badge"><Zap size={11} />+{payment.points} HP</span>
          ) : null}
        </div>

        {/* Confirming state */}
        {busy && (
          <div className="ps-confirming" role="status" aria-live="polite">
            <div className="ps-confirm-ring" aria-hidden="true">
              <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="22" cy="22" r="18" stroke="rgba(19,122,87,0.12)" strokeWidth="3.5" />
                <circle cx="22" cy="22" r="18" stroke="var(--green)" strokeWidth="3.5"
                  strokeLinecap="round" strokeDasharray="113" strokeDashoffset="28"
                  className="ps-ring-arc" />
              </svg>
              <ShieldCheck size={16} className="ps-ring-icon" />
            </div>
            <div className="ps-confirm-body">
              <strong className="ps-confirm-title">Verifying on World Chain</strong>
              <p className="ps-confirm-note">Usually 10–30 seconds. Stay on this screen.</p>
              <div className="ps-confirm-steps">
                <span className="ps-cstep done"><CheckCircle size={11} />Payment sent</span>
                <span className="ps-cstep-arrow">›</span>
                <span className={`ps-cstep ${elapsed >= 2 ? "active" : "pending"}`}>
                  <span className="ps-cstep-dot" />Verifying
                </span>
                <span className="ps-cstep-arrow">›</span>
                <span className={`ps-cstep ${elapsed >= 20 ? "active" : "pending"}`}>
                  <span className="ps-cstep-dot" />Unlocking
                </span>
              </div>
              {elapsed >= 12 && elapsed < 65 && (
                <p className="ps-confirm-patience">
                  Still checking World Chain… can take up to 60s. Do not close.
                </p>
              )}
              {elapsed >= 65 && (
                <p className="ps-confirm-patience ps-confirm-patience-slow">
                  Network is slow — still confirming. Your payment is safe. Hang tight.
                </p>
              )}
              <span className="ps-confirm-elapsed">{elapsed}s</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="ps-actions">
          <button
            className="ps-cancel"
            disabled={busy}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="ps-pay"
            disabled={!amountValid || busy}
            onClick={() => void onConfirm(amount)}
            type="button"
          >
            {busy ? "Confirming…" : `Pay ${displayAmount}`}
          </button>
        </div>

        <p className="ps-note">
          World App opens for confirmation. HumanChain unlocks this only after backend payment verification.
        </p>
      </div>
    </div>
  );
}
