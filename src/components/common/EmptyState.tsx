import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "#/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  testId?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  testId = "empty-state",
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 text-center ${compact ? "py-10" : "py-16"}`}
      data-testid={testId}
    >
      <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-surface-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </span>
      <p className="font-display text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {(primaryLabel || secondaryLabel) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {primaryLabel && (
            <Button size="sm" onClick={onPrimary} data-testid={`${testId}-primary`}>
              {primaryLabel}
            </Button>
          )}
          {secondaryLabel && (
            <Button size="sm" variant="outline" onClick={onSecondary} data-testid={`${testId}-secondary`}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
