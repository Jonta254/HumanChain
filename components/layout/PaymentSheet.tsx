"use client";

import { useEffect, useState } from "react";
import { CheckCircle, ShieldCheck } from "lucide-react";
import {
  BottomBar,
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  Haptic,
  Spinner,
  Token,
  Typography,
} from "@worldcoin/mini-apps-ui-kit-react";
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
    if (!busy) {
      const t = setTimeout(() => setElapsed(0), 0);
      return () => clearTimeout(t);
    }
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
    <Drawer
      open
      onOpenChange={(open) => { if (!open && !busy) onCancel(); }}
      dismissible={!busy}
    >
      <DrawerContent>
        <DrawerHeader icon={<Token value="WLD" size={32} />}>
          <DrawerTitle>
            {payment.title}
          </DrawerTitle>
        </DrawerHeader>

        <div className="ps-body">
          {/* Amount display */}
          <div className="ps-amount-row">
            <Typography variant="number" level={1} className="ps-amount-num">
              {displayAmount}
            </Typography>
            <span className="ps-world-badge">
              <ShieldCheck size={12} />
              World App Pay
            </span>
          </div>

          {payment.detail ? (
            <Typography variant="body" level={2} className="ps-detail">
              {payment.detail}
            </Typography>
          ) : null}

          {/* Custom amount input */}
          {payment.allowCustomAmount && (
            <label className="ps-amount-field">
              <Typography variant="label" level={2} as="span">Amount (WLD)</Typography>
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
              <span className="ps-hp-badge">+{payment.points} HP</span>
            ) : null}
          </div>

          {/* Confirming state */}
          {busy && (
            <div className="ps-confirming" role="status" aria-live="polite">
              <div className="ps-confirm-ring" aria-hidden="true">
                <Spinner />
              </div>
              <div className="ps-confirm-body">
                <Typography variant="subtitle" level={1} as="strong">
                  Verifying on World Chain
                </Typography>
                <Typography variant="body" level={2} className="ps-confirm-note">
                  Usually 10–30 seconds. Stay on this screen.
                </Typography>
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
                  <Typography variant="body" level={2} className="ps-confirm-patience">
                    Still checking World Chain… can take up to 60s. Do not close.
                  </Typography>
                )}
                {elapsed >= 65 && (
                  <Typography variant="body" level={2} className="ps-confirm-patience ps-confirm-patience-slow">
                    Network is slow — still confirming. Your payment is safe. Hang tight.
                  </Typography>
                )}
                <span className="ps-confirm-elapsed">{elapsed}s</span>
              </div>
            </div>
          )}

          <Typography variant="body" level={2} className="ps-note">
            World App opens for confirmation. HumanChain unlocks as soon as you confirm — backend verification keeps running quietly after that.
          </Typography>
        </div>

        <BottomBar>
          <Haptic variant="selection" asChild>
            <Button
              variant="secondary"
              fullWidth
              disabled={busy}
              onClick={onCancel}
              type="button"
            >
              Cancel
            </Button>
          </Haptic>
          <Haptic variant="impact" type="medium" asChild>
            <Button
              variant="primary"
              fullWidth
              disabled={!amountValid || busy}
              onClick={() => void onConfirm(amount)}
              type="button"
            >
              {busy ? <Spinner /> : `Pay ${displayAmount}`}
            </Button>
          </Haptic>
        </BottomBar>
      </DrawerContent>
    </Drawer>
  );
}
