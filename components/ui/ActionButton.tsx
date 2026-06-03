import type { ReactNode } from "react";

type ActionButtonTone = "ask" | "chains" | "market" | "stories";

export function ActionButton({
  detail,
  icon,
  label,
  onClick,
  tone,
}: {
  detail: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tone?: ActionButtonTone;
}) {
  return (
    <button
      className={`action-card ${tone ? `tone-${tone}` : ""}`}
      onClick={onClick}
      type="button"
    >
      {icon}
      <strong>{label}</strong>
      <span>{detail}</span>
    </button>
  );
}
