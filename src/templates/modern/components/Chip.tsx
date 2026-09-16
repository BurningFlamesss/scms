import { cn } from '#/lib/utils.ts';
import { Check } from 'lucide-react';

/**
 * Filter chip. The selected state fills with ink AND adds a check glyph, so it
 * never depends on colour alone.
 */
export function Chip({
  selected,
  onClick,
  children,
  className,
  testId,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  testId?: string;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-pressed={selected}
      data-testid={testId}
      className={cn(
        "inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "border-accent/40 bg-accent/12 font-medium text-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      {selected ? <Check aria-hidden='true' size={14} className="text-accent" /> : null}
      {children}
    </button>
  );
}
