import type { ReactNode } from "react";
import { DataBadge, type DataBadgeLabel } from "./DataBadge";

type SurfaceVariant = "raised" | "flat" | "demo" | "locked";
type SurfaceTag = "div" | "article" | "section";

export function Surface({
  as: Tag = "div",
  badge,
  children,
  className,
  variant = "raised",
}: {
  as?: SurfaceTag;
  badge?: DataBadgeLabel;
  children: ReactNode;
  className?: string;
  variant?: SurfaceVariant;
}) {
  const resolvedBadge = badge ?? (variant === "demo" ? "Demo" : undefined);

  return (
    <Tag className={`hc-surface hc-surface--${variant} ${className ?? ""}`}>
      {resolvedBadge && <DataBadge className="hc-surface-badge" label={resolvedBadge} />}
      {children}
    </Tag>
  );
}
