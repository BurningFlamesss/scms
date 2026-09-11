import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { duration, easing } from './tokens';
import { fallbackSrc, preloadSrc, srcSet } from '#/lib/img';
import type { Img } from '#/content/types';

/**
 * Full-screen lightbox. Focus is trapped while open, background scroll is
 * locked, Escape closes and returns focus to the tile that opened it, and only
 * the two neighbouring images are preloaded.
 */
export function Lightbox({
  photos,
  index,
  title,
  onClose,
  onIndex,
}: {
  photos: Img[];
  index: number;
  title: string;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const reduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [touchX, setTouchX] = useState<number | null>(null);

  const go = useCallback(
    (d: number) => onIndex((index + d + photos.length) % photos.length),
    [index, photos.length, onIndex],
  );

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      } else if (e.key === 'Tab') {
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (!nodes || nodes.length === 0) return;
        const list = Array.from(nodes);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  const photo = photos[index];
  const next = photos[(index + 1) % photos.length];
  const prev = photos[(index - 1 + photos.length) % photos.length];

  return (
    <div
      ref={dialogRef}
      role='dialog'
      aria-modal='true'
      aria-label={title}
      data-testid='lightbox'
      className='fixed inset-0 z-overlay flex flex-col'
      style={{ backgroundColor: 'rgba(23, 18, 15, 0.94)' }}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
        setTouchX(null);
      }}
    >
      <link rel='preload' as='image' href={preloadSrc(next.src, 1440)} />
      <link rel='preload' as='image' href={preloadSrc(prev.src, 1440)} />

      <div className='flex items-center justify-between gap-4 px-4 py-4 md:px-8'>
        <p className='u-label text-paper'>{title}</p>
        <div className='flex items-center gap-4'>
          <p className='u-label tnum text-paper' data-testid='lightbox-counter'>
            {String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
          </p>
          <button
            ref={closeRef}
            type='button'
            onClick={onClose}
            data-testid='lightbox-close'
            aria-label='Close the image viewer'
            className='inline-flex h-tap w-tap items-center justify-center rounded-ui border-hair border-paper/40 text-paper hover:border-paper'
          >
            <X aria-hidden='true' size={18} />
          </button>
        </div>
      </div>

      <div className='relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-16'>
        <button
          type='button'
          onClick={() => go(-1)}
          aria-label='Previous photograph'
          data-testid='lightbox-prev'
          className='absolute left-2 z-10 inline-flex h-tap w-tap items-center justify-center rounded-ui border-hair border-paper/40 text-paper hover:border-paper md:left-4'
        >
          <ChevronLeft aria-hidden='true' size={20} />
        </button>

        <motion.div
          key={photo.src + index}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          transition={{ duration: (reduced ? 160 : duration.standard) / 1000, ease: easing.entrance }}
          className='flex h-full max-h-full w-full items-center justify-center'
        >
          <picture>
            <source type='image/avif' srcSet={srcSet(photo.src, 'avif')} sizes='90vw' />
            <source type='image/webp' srcSet={srcSet(photo.src, 'webp')} sizes='90vw' />
            <img
              src={fallbackSrc(photo.src, 1440)}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              className='max-h-[70svh] w-auto max-w-full object-contain'
            />
          </picture>
        </motion.div>

        <button
          type='button'
          onClick={() => go(1)}
          aria-label='Next photograph'
          data-testid='lightbox-next'
          className='absolute right-2 z-10 inline-flex h-tap w-tap items-center justify-center rounded-ui border-hair border-paper/40 text-paper hover:border-paper md:right-4'
        >
          <ChevronRight aria-hidden='true' size={20} />
        </button>
      </div>

      <div className='px-4 pb-8 pt-4 md:px-16'>
        <p className='max-w-measure text-body-m text-paper'>{photo.alt}</p>
      </div>
    </div>
  );
}
