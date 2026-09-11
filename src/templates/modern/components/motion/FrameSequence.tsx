import { useEffect, useState } from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { motionScale } from '../tokens';
import { fallbackSrc, srcSet } from '#/lib/img';
import type { Frame } from '#/content/types';

/**
 * PRIMITIVE 1 - frameSequence
 * A stack of absolutely positioned photographs cross-faded by scroll progress.
 * Frame i peaks at i/(N-1); only two frames are ever non-transparent at once.
 * Each frame also scales 1.0 to 1.04 across its own active window.
 */

function SequenceFrame({
  frame,
  index,
  count,
  progress,
  eager,
  sizes,
}: {
  frame: Frame;
  index: number;
  count: number;
  progress: MotionValue<number>;
  eager: boolean;
  sizes: string;
}) {
  const step = count > 1 ? 1 / (count - 1) : 1;
  const peak = index * step;
  const from = Math.max(0, peak - step);
  const to = Math.min(1, peak + step);

  const opacityRange =
    index === 0 ? [0, step] : index === count - 1 ? [1 - step, 1] : [from, peak, to];
  const opacityOut = index === 0 ? [1, 0] : index === count - 1 ? [0, 1] : [0, 1, 0];

  const opacity = useTransform(progress, opacityRange, opacityOut);
  const scale = useTransform(progress, [from, to], [motionScale.frameZoomFrom, motionScale.frameZoomTo]);

  return (
    <motion.div
      className='absolute inset-0'
      style={{ opacity, scale, willChange: 'transform, opacity' }}
      aria-hidden={index !== 0}
      data-frame={index + 1}
    >
      <picture>
        <source type='image/avif' srcSet={srcSet(frame.src, 'avif')} sizes={sizes} />
        <source type='image/webp' srcSet={srcSet(frame.src, 'webp')} sizes={sizes} />
        <img
          src={fallbackSrc(frame.src, 1440)}
          alt={index === 0 ? frame.alt : ''}
          width={frame.width}
          height={frame.height}
          className='h-full w-full object-cover'
          loading={eager ? 'eager' : 'lazy'}
          decoding={eager ? 'sync' : 'async'}
          {...(index === 0 ? { fetchPriority: 'high' as const } : {})}
        />
      </picture>
    </motion.div>
  );
}

export function FrameSequence({
  frames,
  progress,
  reduced = false,
  sizes = '100vw',
  className = '',
}: {
  frames: Frame[];
  progress: MotionValue<number>;
  reduced?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setIdle(true));
      return () => {
        (window as unknown as { cancelIdleCallback?: (i: number) => void }).cancelIdleCallback?.(id);
      };
    }
    const t = window.setTimeout(() => setIdle(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  if (reduced) {
    const f = frames[0];
    return (
      <div className={'absolute inset-0 ' + className}>
        <picture>
          <source type='image/avif' srcSet={srcSet(f.src, 'avif')} sizes={sizes} />
          <source type='image/webp' srcSet={srcSet(f.src, 'webp')} sizes={sizes} />
          <img
            src={fallbackSrc(f.src, 1440)}
            alt={f.alt}
            width={f.width}
            height={f.height}
            className='h-full w-full object-cover'
            fetchPriority='high'
          />
        </picture>
      </div>
    );
  }

  return (
    <div className={'absolute inset-0 ' + className} data-testid='frame-sequence'>
      {frames.map((frame, i) => (
        <SequenceFrame
          key={frame.src + i}
          frame={frame}
          index={i}
          count={frames.length}
          progress={progress}
          eager={i < 2 || idle}
          sizes={sizes}
        />
      ))}
    </div>
  );
}
