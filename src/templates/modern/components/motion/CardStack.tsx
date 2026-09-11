import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { layout, motionScale } from '../tokens';

/**
 * PRIMITIVE 3 - cardStack
 * A pinned sequence. Each card settles 24px lower than the one before it, and
 * the cards beneath scale to 0.96 and drop to 45% opacity so the edges of the
 * pile stay legible. The last card releases the pin and normal flow resumes.
 */

function StackCard({
  index,
  count,
  progress,
  children,
}: {
  index: number;
  count: number;
  progress: MotionValue<number>;
  children: ReactNode;
}) {
  const enter = useTransform(progress, [index / count, (index + 1) / count], [0, 1], { clamp: true });
  const covered = useTransform(progress, [(index + 1) / count, (index + 2) / count], [0, 1], {
    clamp: true,
  });

  const y = useTransform(enter, (v) => {
    const settled = index * motionScale.stackOffset;
    if (index === 0) return settled;
    const travel = typeof window === 'undefined' ? 800 : window.innerHeight * 0.92;
    return settled + (1 - v) * travel;
  });
  const scale = useTransform(covered, [0, 1], [1, motionScale.stackScale]);
  const opacity = useTransform(covered, [0, 1], [1, motionScale.stackOpacity]);

  return (
    <motion.div
      className='absolute inset-x-0 top-0'
      style={{ y, scale, opacity, zIndex: index + 1, willChange: 'transform, opacity' }}
      data-stack-card={index + 1}
    >
      {children}
    </motion.div>
  );
}

export function CardStack({
  items,
  reduced = false,
  renderStatic,
}: {
  items: ReactNode[];
  reduced?: boolean;
  renderStatic?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  if (reduced) return <>{renderStatic}</>;

  const count = items.length;

  return (
    <div
      ref={ref}
      className='relative'
      style={{ height: (count + 1) * layout.cardStackVh + 'svh' }}
      data-testid='card-stack'
    >
      <div className='sticky top-0 flex h-svh items-center overflow-hidden'>
        <div className='relative h-[74svh] w-full'>
          {items.map((item, i) => (
            <StackCard key={i} index={i} count={count} progress={scrollYProgress}>
              {item}
            </StackCard>
          ))}
        </div>
      </div>
    </div>
  );
}
