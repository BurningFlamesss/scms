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
        'u-label inline-flex min-h-tap items-center gap-2 rounded-pill border-hair px-4 transition-colors duration-micro ease-state',
        selected
          ? 'border-ink bg-ink text-paper'
          : 'border-n-300 bg-transparent text-n-600 hover:border-ink hover:text-ink',
        className,
      )}
    >
      {selected ? <Check aria-hidden='true' size={12} strokeWidth={3} /> : null}
      {children}
    </button>
  );
}
