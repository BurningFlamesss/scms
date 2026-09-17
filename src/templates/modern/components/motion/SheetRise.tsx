import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { layout, motionScale } from '../tokens';

/**
 * PRIMITIVE 2 - sheetRise
 * A paper-coloured panel travels up over a pinned backdrop as the page is
 * scrolled. The travel is native scroll, not an animated scroll position; the
 * backdrop scales 1.0 to 1.06 and dims via an overlay opacity, never a filter.
 */
export function SheetRise({
  backdrop,
  overlay,
  children,
  reduced = false,
  runwayVh = layout.heroRunwayVh,
}: {
  backdrop: (progress: MotionValue<number>) => ReactNode;
  overlay?: (progress: MotionValue<number>) => ReactNode;
  children: ReactNode;
  reduced?: boolean;
  runwayVh?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Frames advance across the runway; the sheet covers over the final stretch.
  const frameProgress = useTransform(scrollYProgress, [0, 0.78], [0, 1], { clamp: true });
  const scale = useTransform(scrollYProgress, [0, 1], [1, motionScale.backdropZoomTo]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, motionScale.backdropDim]);

  if (reduced) {
    return (
      <div>
        <div className='relative h-[86svh] overflow-hidden' data-testid='hero-static'>
          {backdrop(frameProgress)}
          {overlay ? overlay(frameProgress) : null}
        </div>
        <div className='relative z-sheet -mt-8 rounded-t-lip bg-[#FEF2F2] shadow-high' data-testid='white-sheet'>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className='relative'>
      <div className='sticky top-0 h-svh overflow-hidden'>
        <motion.div className='absolute inset-0' style={{ scale, willChange: 'transform' }}>
          {backdrop(frameProgress)}
        </motion.div>
        <motion.div aria-hidden='true' className='absolute inset-0 bg-ink' style={{ opacity: dim }} />
        {overlay ? overlay(frameProgress) : null}
      </div>

      <div style={{ height: runwayVh + 'svh' }} aria-hidden='true' />

      <div className='relative z-sheet rounded-t-lip bg-[#FEF2F2] shadow-high' data-testid='white-sheet'>
        {children}
      </div>
    </div>
  );
}
