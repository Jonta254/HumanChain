"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
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
  const amount = payment.allowCustomAmount
    ? Number.parseFloat(customAmount)
    : parsePaymentAmount(payment.amount);
  const amountValid = isValidHumanChainPaymentAmount(
    getPaymentFeature(payment),
    amount,
  );

  return (
    <section className="payment-backdrop" role="dialog" aria-busy={busy} aria-modal="true">
      <div className="payment-sheet">
        <div className="payment-sheet-header">
          <span className="section-kicker">Pay with World App</span>
          <strong>
            {Number.isFinite(amount)
              ? formatPaymentAmount(amount, selectedToken)
              : `0 ${humanChainPaymentTokens[selectedToken].label}`}
          </strong>
        </div>

        <h2>{payment.title}</h2>

        {payment.allowCustomAmount ? (
          <label className="payment-amount-field">
            <span>Amount <em>(0.1 – 100 WLD)</em></span>
            <input
              aria-label="Amount in WLD"
              inputMode="decimal"
              min={payment.minAmount ?? 0.1}
              max={payment.maxAmount ?? 100}
              onChange={(event) => setCustomAmount(event.target.value)}
              placeholder="0.0"
              step="0.1"
              type="number"
              value={customAmount}
            />
          </label>
        ) : null}

        <div className="payment-meta-row">
          <div className="payment-verification-note">
            <ShieldCheck size={14} />
            <span>Verified on-chain · WLD only</span>
          </div>
          {payment.points ? (
            <span className="payment-hp-badge">+{payment.points} HP</span>
          ) : null}
        </div>

        {busy ? (
          <div className="payment-loading-state" role="status" aria-live="polite">
            <span className="payment-loading-dot" aria-hidden="true" />
            <span className="payment-loading-dot" aria-hidden="true" />
            <span className="payment-loading-dot" aria-hidden="true" />
            <p>Confirming transaction…</p>
          </div>
        ) : null}

        <div className="payment-actions">
          <button disabled={busy} onClick={onCancel} type="button">
            Cancel
          </button>
          <button disabled={!amountValid || busy} onClick={() => onConfirm(amount)} type="button">
            {busy ? "Confirming…" : "Pay with World App"}
          </button>
        </div>
      </div>
    </section>
  );
}
