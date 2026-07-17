import type { ReactNode } from "react";
import { Lock } from "lucide-react";

/**
 * Wraps a paid action so "can't pay yet, here's why" has one visual home
 * instead of every openPayment() call site inventing its own disabled state.
 * openPayment() itself remains the actual security gate — this is the
 * pre-flight UX layer that stops a user tapping into a payment sheet that's
 * guaranteed to fail or block.
 */
export function PaymentTrigger({
  available = true,
  blockedLabel = "Unavailable",
  children,
  className,
  onClick,
}: {
  available?: boolean;
  blockedLabel?: string;
  children: ReactNode;
  className?: string;
  onClick: () => void;
}) {
  if (!available) {
    return (
      <button className={`hc-payment-trigger--locked ${className ?? ""}`} disabled type="button">
        <Lock size={13} />
        {blockedLabel}
      </button>
    );
  }

  return (
    <button className={className} onClick={onClick} type="button">
      {children}
    </button>
  );
}
