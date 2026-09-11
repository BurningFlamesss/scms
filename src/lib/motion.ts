/** Shared motion language. Transform + opacity only, editorial easing. */

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_OUT: [number, number, number, number] = [0.4, 0, 1, 1];

export const DUR = {
  fast: 0.14,
  base: 0.22,
  slow: 0.36,
} as const;

export const STAGGER = 0.04;

import { useRef } from 'react';
import { useScroll, useTransform } from 'motion/react';

/** Scroll progress for a section. Returns a ref and a progress motion value (0-1). */
export function useSectionProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start center', 'end center'],
  });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return { ref, progress };
}
