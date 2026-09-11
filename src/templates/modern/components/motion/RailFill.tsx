import { motion, type MotionValue } from 'motion/react';

/**
 * PRIMITIVE 5 - railFill
 * A 2px line whose scaleY / scaleX maps to a section progress value. Used as a
 * reading-position indicator, and as the progress rail in the stream chooser.
 */
export function RailFill({
  progress,
  orientation = 'vertical',
  className = '',
  label,
}: {
  progress: MotionValue<number> | number;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  label?: string;
}) {
  const vertical = orientation === 'vertical';
  const style = vertical ? { scaleY: progress } : { scaleX: progress };

  return (
    <div
      className={(vertical ? 'w-rule' : 'h-rule w-full') + ' bg-n-200 ' + className}
      role={label ? 'progressbar' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <motion.div
        className={vertical ? 'h-full w-rule bg-accent' : 'h-rule w-full bg-accent'}
        style={{
          ...style,
          transformOrigin: vertical ? 'top center' : 'left center',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
