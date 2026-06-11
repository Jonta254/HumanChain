"use client";

import { useState } from "react";
import { Check, ShieldCheck, X, Zap } from "lucide-react";
import {
  humanChainPaymentTokens,
  isValidHumanChainPaymentAmount,
  type HumanChainPaymentToken,
} from "@/lib/worldPayments";
import { formatPaymentAmount, getPaymentFeature, parsePaymentAmount } from "@/lib/humanchain/utils";
import type { PaymentRequest } from "@/types/ui";

const quickAmounts = [0.5, 1, 2, 5];

export function PaymentSheet({
  busy,
  onCancel,
  onConfirm,
  payment,
  selectedToken,
  success,
}: {
  busy: boolean;
  onCancel: () => void;
  onConfirm: (amount?: number) => void | Promise<void>;
  payment: PaymentRequest;
  selectedToken: HumanChainPaymentToken;
  success: { amount: string; points: number; title: string } | null;
}) {
  const [customAmount, setCustomAmount] = useState(() =>
    parsePaymentAmount(payment.amount).toString(),
  );

  const amount = payment.allowCustomAmount
    ? Number.parseFloat(customAmount)
    : parsePaymentAmount(payment.amount);

  const amountValid = isValidHumanChainPaymentAmount(getPaymentFeature(payment), amount);
  const tokenLabel = humanChainPaymentTokens[selectedToken].label;
  const displayAmount = Number.isFinite(amount)
    ? formatPaymentAmount(amount, selectedToken)
    : `0 ${tokenLabel}`;

  // ── Quick confirmation state ─────────────────────────────────────────────
  if (success) {
    return (
      <div className="ps-backdrop" role="dialog" aria-modal="true" aria-label="Payment confirmed">
        <div className="ps-sheet ps-sheet-success">
          <span className="ps-success-ring" aria-hidden="true">
            <Check size={30} strokeWidth={3} />
          </span>
          <strong className="ps-success-amount">{success.amount}</strong>
          <p className="ps-success-title">Payment confirmed</p>
          <span className="ps-success-detail">{success.title}</span>
          {success.points > 0 && (
            <span className="ps-success-hp"><Zap size={12} />+{success.points} HP earned</span>
          )}
        </div>
      </div>
    );
  }

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

        {/* Custom amount input */}
        {payment.allowCustomAmount && (
          <>
            <div className="ps-quick-row" role="group" aria-label="Quick amounts">
              {quickAmounts
                .filter((value) => value >= (payment.minAmount ?? 0.1) && value <= (payment.maxAmount ?? 100))
                .map((value) => (
                  <button
                    key={value}
                    className={`ps-quick-chip ${Number.parseFloat(customAmount) === value ? "active" : ""}`}
                    disabled={busy}
                    onClick={() => setCustomAmount(value.toString())}
                    type="button"
                  >
                    {value} WLD
                  </button>
                ))}
            </div>
            <label className="ps-amount-field">
              <span>Custom amount (WLD)</span>
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
          </>
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
            <span className="ps-dot" />
            <span className="ps-dot" />
            <span className="ps-dot" />
            <span>Confirming on World Chain…</span>
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
