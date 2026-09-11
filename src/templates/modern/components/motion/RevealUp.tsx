import type { ElementType, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { duration, easing, motionScale } from '../tokens';

/**
 * PRIMITIVE 4 - revealUp
 * One-shot entrance. translateY(24px) plus opacity 0 to rest over 420ms,
 * triggered at 20% visibility. Siblings stagger by 60ms, capped at five steps.
 * Never re-fires on scroll back up.
 */
export function RevealUp({
  children,
  index = 0,
  as = 'div',
  className = '',
  ...rest
}: {
  children: ReactNode;
  index?: number;
  as?: ElementType;
  className?: string;
} & Record<string, unknown>) {
  const reduced = useReducedMotion();
  const delay = (Math.min(index, motionScale.revealMaxSteps) * motionScale.revealStagger) / 1000;

  if (reduced) {
    const Static = as as ElementType;
    return (
      <Static className={className} {...rest}>
        {children}
      </Static>
    );
  }

  const Comp = (motion as unknown as Record<string, ElementType>)[as as string] ?? motion.div;

  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: motionScale.revealY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: motionScale.revealThreshold }}
      transition={{ duration: duration.entrance / 1000, ease: easing.entrance, delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
