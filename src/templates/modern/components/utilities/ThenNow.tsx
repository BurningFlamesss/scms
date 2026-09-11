import { useState } from 'react';
import { Picture } from '../Picture';
import { Eyebrow } from '../Text';
import type { ThenNow as ThenNowType } from '#/content/types';

/**
 * B6.4 - Then and now. A draggable divider over paired archive and present-day
 * photographs. The handle is a real range input, so it is keyboard operable
 * and announced correctly without a second interface.
 */
export function ThenNowSlider({ item }: { item: ThenNowType }) {
  const [pos, setPos] = useState(50);

  return (
    <figure className='flex flex-col gap-4' data-testid={'thennow-' + item.id}>
      <div className='relative aspect-[16/10] w-full overflow-hidden rounded-card border border-border'>
        <div className='absolute inset-0'>
          <Picture
            image={item.then}
            sizes='(min-width: 1024px) 45vw, 92vw'
            imgClassName='h-full w-full object-cover grayscale'
          />
        </div>
        <div className='absolute inset-0' style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <Picture image={item.now} sizes='(min-width: 1024px) 45vw, 92vw' />
        </div>

        <div
          aria-hidden='true'
          className='absolute inset-y-0 w-rule bg-primary'
          style={{ left: pos + '%' }}
        />

        <span className='u-label absolute left-4 top-4 rounded-pill bg-background px-3 py-1 text-foreground'>
          {item.thenLabel}
        </span>
        <span className='u-label absolute right-4 top-4 rounded-pill bg-background px-3 py-1 text-foreground'>
          {item.nowLabel}
        </span>

        <label className='absolute inset-x-0 bottom-0 flex items-center gap-3 bg-background/95 px-4 py-3'>
          <span className='u-label shrink-0 text-muted-foreground'>Drag to compare</span>
          <input
            type='range'
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label={`Compare ${item.title}: ${pos}% showing ${item.nowLabel}`}
            data-testid={'thennow-range-' + item.id}
            className='h-tap w-full cursor-ew-resize accent-[var(--c-yellow)]'
          />
          <span className='u-label tnum shrink-0 text-foreground'>{pos}%</span>
        </label>
      </div>
      <figcaption className='flex flex-col gap-2'>
        <Eyebrow tone='muted'>{item.title}</Eyebrow>
        <p className='max-w-measure text-body-m text-muted-foreground'>{item.note}</p>
      </figcaption>
    </figure>
  );
}