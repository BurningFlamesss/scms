import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Picture } from '../Picture';
import { duration, easing } from '../tokens';
import type { Album } from '#/content/types';

const FAN = [
  { r: -7, x: -18, y: 6 },
  { r: -2.5, x: -6, y: 0 },
  { r: 2.5, x: 6, y: 0 },
  { r: 7, x: 18, y: 6 },
];

/**
 * SIGNATURE INTERACTION - Gallery
 * The fan. Each event is a physical stack of photographs; hovering or focusing
 * one fans the top four out in a shallow arc. Clicking enters the event and the
 * stack expands into the grid, with a shared-element transition on the top photo.
 *
 * Under reduced motion the stack renders as a flat cover tile with a count badge.
 */
export function PhotoFan({
  album,
  onOpen,
  index,
}: {
  album: Album;
  onOpen: (a: Album) => void;
  index: number;
}) {
  const reduced = Boolean(useReducedMotion());
  const [lifted, setLifted] = useState(false);
  const top = album.photos.slice(0, 4);

  return (
    <button
      type='button'
      onClick={() => onOpen(album)}
      onMouseEnter={() => setLifted(true)}
      onMouseLeave={() => setLifted(false)}
      onFocus={() => setLifted(true)}
      onBlur={() => setLifted(false)}
      data-testid={'photo-stack-' + album.id}
      aria-label={`Open ${album.event}, ${album.year} — ${album.photos.length} photographs`}
      className='group flex flex-col gap-4 text-left !border-0 !bg-transparent'
    >
      <span className='relative block aspect-[4/3] w-full'>
        {reduced ? (
          <span className='absolute inset-0 overflow-hidden rounded-card'>
            <Picture image={album.photos[0]} sizes='(min-width: 1024px) 30vw, 90vw' />
          </span>
        ) : (
          top.map((p, i) => (
            <motion.span
              key={p.src + i}
              className='absolute inset-0 block overflow-hidden rounded-card'
              style={{ zIndex: top.length - i }}
              animate={
                lifted
                  ? { rotate: FAN[i].r, x: FAN[i].x, y: FAN[i].y }
                  : { rotate: i * -1.2, x: i * -3, y: i * 3 }
              }
              transition={{ duration: duration.standard / 1000, ease: easing.state }}
            >
              {i === 0 ? (
                <motion.span layoutId={'album-cover-' + album.id} className='block h-full w-full'>
                  <Picture image={p} sizes='(min-width: 1024px) 30vw, 90vw' />
                </motion.span>
              ) : (
                <Picture image={p} sizes='(min-width: 1024px) 30vw, 90vw' decorative />
              )}
            </motion.span>
          ))
        )}
        <span className='u-label absolute bottom-3 right-3 z-10 rounded-pill bg-black/60 px-3 py-1 tnum text-white'>
          {album.photos.length} photos
        </span>
      </span>

      <span className='flex flex-col gap-1'>
        <span className='u-label text-accent'>
          {String(index + 1).padStart(2, '0')} / {album.category} · {album.year}
        </span>
        <span className='u-display text-display-m text-ink'>{album.event}</span>
        <span className='u-label text-n-600'>{album.date}</span>
      </span>
    </button>
  );
}
