export function TopBar({
  subtitle,
  title,
  action,
}: {
  subtitle: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="top-bar-v2" role="banner" aria-label={title}>
      <div className="top-bar-v2-text">
        <span className="top-bar-v2-kicker" aria-hidden={subtitle ? "false" : "true"}>
          {subtitle}
        </span>
        <h1 className="top-bar-v2-title">{title}</h1>
      </div>

      {action ? <div className="top-bar-v2-action" role="group">{action}</div> : null}
    </header>
  );
}
