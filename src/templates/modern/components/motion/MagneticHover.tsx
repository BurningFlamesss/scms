import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import { magneticSpring, motionScale } from '../tokens';
import { usePointerFine } from '#/lib/hooks';

/**
 * PRIMITIVE 7 - magneticHover
 * On precise pointers only, a card translates up to 4px toward the cursor with
 * a soft spring. Disabled on touch and under reduced motion. Never on text links.
 */
export function MagneticHover({
  children,
  className = '',
  strength = motionScale.magnetic,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = usePointerFine();
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, magneticSpring);
  const y = useSpring(my, magneticSpring);

  if (!fine || reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        mx.set(Math.max(-1, Math.min(1, dx)) * strength);
        my.set(Math.max(-1, Math.min(1, dy)) * strength);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
