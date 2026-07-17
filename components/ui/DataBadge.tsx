export type DataBadgeLabel = "Demo" | "Sample" | "Curated" | "Live";

export function DataBadge({
  className,
  label,
}: {
  className?: string;
  label: DataBadgeLabel;
}) {
  return (
    <span className={`hc-data-badge hc-data-badge--${label.toLowerCase()} ${className ?? ""}`}>
      {label}
    </span>
  );
}
