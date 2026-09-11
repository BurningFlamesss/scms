import type { ReactNode } from 'react';
import { LedgerCount } from './motion';
import { cn } from '#/lib/utils.ts';

export function Eyebrow({
  children,
  className,
  tone = 'accent',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'accent' | 'muted' | 'paper';
}) {
  return (
    <p
      className={cn(
        'u-label',
        tone === 'accent' && 'text-accent',
        tone === 'muted' && 'text-n-600',
        tone === 'paper' && 'text-paper/80',
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * Display headlines break by meaning: each array entry is one authored line,
 * so a two-line headline can never orphan a single word.
 */
export function Statement({
  lines,
  as: Tag = 'h2',
  size = 'display-xl',
  className,
  tone = 'ink',
  ...rest
}: {
  lines: string[];
  as?: 'h1' | 'h2' | 'h3' | 'p';
  size?: 'display-xl' | 'display-l' | 'display-m';
  className?: string;
  tone?: 'ink' | 'paper';
} & Record<string, unknown>) {
  return (
    <Tag
      {...rest}
      className={cn(
        'u-display u-fit',
        size === 'display-xl' && 'text-display-xl u-fit-display-xl',
        size === 'display-l' && 'text-display-l u-fit-display-l',
        size === 'display-m' && 'text-display-m u-fit-display-m',
        tone === 'ink' ? 'text-ink' : 'text-paper',
        className,
      )}
    >
      {lines.map((l, i) => (
        <span key={i} className='block'>
          {l}
        </span>
      ))}
    </Tag>
  );
}

/** The credibility block. Hairline-divided cells, mono labels, tabular figures. */
export function Ledger({
  items,
  animate = true,
  className,
  testId,
}: {
  items: Array<{ id: string; label: string; value: number; suffix?: string }>;
  animate?: boolean;
  className?: string;
  testId?: string;
}) {
  return (
    <dl
      data-testid={testId}
      className={cn(
        'grid grid-cols-2 border-t-hair border-n-200 sm:grid-cols-4',
        className,
      )}
    >
      {items.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            'flex flex-col gap-2 border-b-hair border-n-200 py-6 pr-4',
            i > 0 && 'sm:border-l-hair sm:border-l-n-200 sm:pl-6',
            i % 2 === 1 && 'border-l-hair border-l-n-200 pl-4 sm:pl-6',
          )}
        >
          <dd className='u-display text-display-m text-ink'>
            {animate ? (
              <LedgerCount value={s.value} testId={'ledger-' + s.id} />
            ) : (
              <span className='tnum'>{s.value}</span>
            )}
            {s.suffix ? <span>{s.suffix}</span> : null}
          </dd>
          <dt className='u-label text-n-600'>{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export function Rule({ className }: { className?: string }) {
  return <hr className={cn('u-rule border-0 border-t-hair border-n-200', className)} />;
}

/** Mono caption stating in one line what a widget does. Required on every widget. */
export function WidgetCaption({ children }: { children: ReactNode }) {
  return <p className='u-label text-n-600'>{children}</p>;
}
