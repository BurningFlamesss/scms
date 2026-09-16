import { useId, useRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '#/lib/utils';

export type SegmentOption<T extends string> = { value: T; label: string };

/**
 * Segmented control with radiogroup semantics and roving tab order.
 * Selection is never signalled by colour alone - the active segment inverts and
 * carries a check glyph.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
  testId,
  size = 'md',
}: {
  label: string;
  options: Array<SegmentOption<T>>;
  value: T;
  onChange: (v: T) => void;
  className?: string;
  testId?: string;
  size?: 'sm' | 'md';
}) {
  const id = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const move = (dir: 1 | -1, from: number) => {
    const next = (from + dir + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <span id={id} className='t-eyebrow text-muted-foreground'>
        {label}
      </span>
      <div
        role='radiogroup'
        aria-labelledby={id}
        data-testid={testId}
        className='flex flex-wrap gap-2'
      >
        {options.map((o, i) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type='button'
              role='radio'
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              data-testid={testId ? testId + '-' + o.value : undefined}
              data-active={active}
              onClick={() => onChange(o.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  move(1, i);
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  move(-1, i);
                }
              }}
              className={[
                "inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-fast",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "border-accent/40 bg-accent/12 font-medium text-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
              ].join(" ")}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
