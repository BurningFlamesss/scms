import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "#/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  testId?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this section. Retry, or continue working elsewhere — nothing was lost.",
  onRetry,
  testId = "error-state",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center" data-testid={testId}>
      <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-destructive/10">
        <AlertTriangle className="h-5 w-5 text-destructive" />
      </span>
      <p className="font-display text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {onRetry && (
        <Button size="sm" variant="outline" className="mt-4 gap-1.5" onClick={onRetry} data-testid={`${testId}-retry`}>
          <RotateCcw className="h-3.5 w-3.5" /> Try again
        </Button>
      )}
    </div>
  );
}
