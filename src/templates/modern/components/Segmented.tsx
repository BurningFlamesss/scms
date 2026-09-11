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
    <div className={cn('flex flex-col gap-2', className)}>
      <span id={id} className='u-label text-n-600'>
        {label}
      </span>
      <div
        role='radiogroup'
        aria-labelledby={id}
        data-testid={testId}
        className='inline-flex flex-wrap gap-px rounded-ui border-hair border-n-300 bg-n-300 p-px'
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
              className={cn(
                'u-label inline-flex items-center justify-center gap-2 transition-colors duration-micro ease-state',
                size === 'md' ? 'min-h-tap px-4' : 'min-h-[36px] px-3',
                active ? 'bg-ink text-paper' : 'bg-paper text-n-600 hover:text-ink',
                i === 0 && 'rounded-l-[10px]',
                i === options.length - 1 && 'rounded-r-[10px]',
              )}
            >
              {active ? <Check aria-hidden='true' size={12} strokeWidth={3} /> : null}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
