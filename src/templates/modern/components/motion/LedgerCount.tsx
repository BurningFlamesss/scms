import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { duration } from '../tokens';

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * PRIMITIVE 6 - ledgerCount
 *
 * once  : counts 0 to target over 900ms on first intersection, then never again.
 * tween : travels to each new target over 250ms, for the live fee estimator.
 *
 * Tabular numerals in both modes so nothing shifts as digits change.
 */
export function LedgerCount({
  value,
  mode = 'once',
  format = (n: number) => String(Math.round(n)),
  className = '',
  testId,
}: {
  value: number;
  mode?: 'once' | 'tween';
  format?: (n: number) => string;
  className?: string;
  testId?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(mode === 'once' ? 0 : value);
  const fromRef = useRef(mode === 'once' ? 0 : value);
  const rafRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    if (mode === 'once') {
      if (!inView || firedRef.current) return;
      firedRef.current = true;
    }

    const from = fromRef.current;
    const to = value;
    if (from === to) {
      setDisplay(to);
      return;
    }
    const ms = mode === 'once' ? duration.ledger : duration.ledgerTween;
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setDisplay(from + (to - from) * easeOut(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = to;
    };
  }, [value, inView, mode, reduced]);

  return (
    <span ref={ref} className={'tnum ' + className} data-testid={testId}>
      {format(display)}
    </span>
  );
}
