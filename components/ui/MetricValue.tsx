/**
 * Renders nothing when `value` is null/undefined — the mechanism that keeps
 * unbacked numbers out of the UI instead of falling back to a fake "0" or "—".
 */
export function MetricValue({
  className,
  format,
  suffix,
  value,
}: {
  className?: string;
  format?: (value: number) => string;
  suffix?: string;
  value: number | string | null | undefined;
}) {
  if (value === null || value === undefined) return null;

  const display = typeof value === "number" && format ? format(value) : String(value);

  return (
    <span className={`hc-metric-value ${className ?? ""}`}>
      {display}
      {suffix ? <span className="hc-metric-suffix">{suffix}</span> : null}
    </span>
  );
}
