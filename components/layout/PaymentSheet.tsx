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
        <span className="section-kicker">World App payment</span>
        <h2>{payment.title}</h2>
        <strong>
          {Number.isFinite(amount)
            ? formatPaymentAmount(amount, selectedToken)
            : `0 ${humanChainPaymentTokens[selectedToken].label}`}
        </strong>
        <p>{payment.detail}</p>
        <div className="payment-verification-note">
          <ShieldCheck size={16} />
          <span>
            HumanChain creates a backend reference first. This action unlocks only after World App payment and server verification.
          </span>
        </div>
        {payment.allowCustomAmount ? (
          <label className="payment-amount-field">
            <span>Tip amount</span>
            <input
              aria-label="Tip amount in WLD"
              inputMode="decimal"
              min={payment.minAmount ?? 0.1}
              max={payment.maxAmount ?? 100}
              onChange={(event) => setCustomAmount(event.target.value)}
              placeholder="Enter WLD amount"
              step="0.1"
              type="number"
              value={customAmount}
            />
            <small>Choose 0.1-100 WLD. HumanChain records the selected tip amount in the receipt.</small>
          </label>
        ) : null}
        <div className="payment-token-picker" aria-label="Payment currency">
          <span>Pay with WLD</span>
          <small>
            HumanChain accepts WLD only. The recipient is verified by the server after
            World App confirms the transaction.
          </small>
        </div>
        {busy ? (
          <div className="payment-loading-state" role="status" aria-live="polite">
            <span className="payment-loading-dot" aria-hidden="true" />
            <span className="payment-loading-dot" aria-hidden="true" />
            <span className="payment-loading-dot" aria-hidden="true" />
            <p>Opening World Pay — waiting for confirmation…</p>
          </div>
        ) : null}
        {payment.points ? (
          <small>Confirming this also records +{payment.points} HP value.</small>
        ) : null}
        <div className="payment-actions">
          <button disabled={busy} onClick={onCancel} type="button">
            Cancel
          </button>
          <button disabled={!amountValid || busy} onClick={() => onConfirm(amount)} type="button">
            {busy ? "Verifying..." : "Confirm in World App"}
          </button>
        </div>
      </div>
    </section>
  );
}
