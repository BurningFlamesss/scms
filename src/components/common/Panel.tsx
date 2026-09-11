import { cn } from "#/lib/utils";

interface PanelProps {
  title?: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  testId?: string;
}

export function Panel({
  title,
  description,
  eyebrow,
  actions,
  footer,
  children,
  className,
  bodyClassName,
  testId,
}: PanelProps) {
  return (
    <section className={cn("panel flex flex-col overflow-hidden", className)} data-testid={testId}>
      {(title || actions) && (
        <header className="panel-header">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow-label mb-0.5">{eyebrow}</p>}
            {title && <h2 className="panel-title truncate">{title}</h2>}
            {description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={cn("min-w-0 flex-1", bodyClassName ?? "p-4")}>{children}</div>
      {footer && <footer className="border-t border-hairline px-4 py-2.5">{footer}</footer>}
    </section>
  );
}

export function KeyValue({
  label,
  value,
  mono = false,
  testId,
}: {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
  testId?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">{label}</dt>
      <dd
        className={cn("mt-0.5 truncate text-sm text-foreground", mono && "font-mono text-[13px]")}
        data-testid={testId}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}
