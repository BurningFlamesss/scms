import { cn } from "#/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  wash?: boolean;
  className?: string;
  testId?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  wash = false,
  className,
  testId = "page-header",
}: PageHeaderProps) {
  return (
    <div
      className={cn("relative mb-6", wash && "header-wash -mx-4 px-4 pt-1 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8", className)}
      data-testid={testId}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow-label mb-1.5">{eyebrow}</p>}
          <h1 className="truncate font-display text-xl font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
            {title}
          </h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
          {meta && <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">{meta}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
