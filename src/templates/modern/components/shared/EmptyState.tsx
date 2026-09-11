import { SearchX } from "lucide-react";
import { Button } from "../kit";

export const EmptyState = ({
  eyebrow = "Nothing here",
  title,
  description,
  actionLabel,
  onAction,
  testId = "empty-state",
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  testId?: string;
}) => (
  <div
    data-testid={testId}
    className="rounded-card border border-dashed border-rule-strong bg-card/60 px-6 py-14"
  >
    <div className="max-w-md">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground">
        <SearchX className="h-4 w-4" aria-hidden="true" />
      </span>
      <p className="t-eyebrow mt-5">{eyebrow}</p>
      <h3 className="t-h3 mt-2 text-foreground">{title}</h3>
      <p className="t-body mt-2.5 text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button
          type="button"
          variant="outline"
          onClick={onAction}
          data-testid={`${testId}-action`}
          className="mt-6 h-10 rounded-field border-border bg-background transition-colors duration-fast hover:bg-secondary"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  </div>
);
