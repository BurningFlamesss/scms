import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Container, Section } from '#/templates/modern/components/layout/PageShell';
import { LedgerCount, RevealUp } from '#/templates/modern/components/motion';
import { PhotoFan } from '#/templates/modern/components/interactions/PhotoFan';
import { Lightbox } from "#/templates/modern/components/Lightbox"
import { Picture } from '#/templates/modern/components/Picture';
import { Chip } from '#/templates/modern/components/Chip';
import { Button } from "#/templates/modern/components/Button.tsx";
import { Eyebrow } from '#/templates/modern/components/Text';
import { duration, easing } from '#/templates/modern/components/tokens';
import { albums, galleryCategories, galleryIntro, galleryYears, totalPhotos } from '#/content/gallery';
import type { Album, Img } from '#/content/types';

/** Deliberately varied tile sizes on a strict 12-column base. */
const SPANS = [
  'lg:col-span-6 lg:row-span-2',
  'lg:col-span-3',
  'lg:col-span-3',
  'lg:col-span-3',
  'lg:col-span-3',
  'lg:col-span-4',
  'lg:col-span-4',
  'lg:col-span-4',
];

export const Route = createFileRoute('/_public/gallery')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const reduced = Boolean(useReducedMotion());
  const [category, setCategory] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [entered, setEntered] = useState<Album | null>(null);
  const [lightbox, setLightbox] = useState<{ photos: Img[]; index: number; title: string } | null>(null);
  const tileRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lastTile = useRef<string | null>(null);

  const filtered = useMemo(
    () =>
      albums.filter(
        (a) => (!category || a.category === category) && (!year || a.year === year),
      ),
    [category, year],
  );

  const openLightbox = (photos: Img[], index: number, title: string, key: string) => {
    lastTile.current = key;
    setLightbox({ photos, index, title });
  };

  const closeLightbox = () => {
    const key = lastTile.current;
    setLightbox(null);
    if (key) window.setTimeout(() => tileRefs.current[key]?.focus(), 0);
  };

  return (
    <>
      {/* Contact-sheet header: a dense wall of thumbnails behind the count. */}
      <header className='relative overflow-hidden border-b-hair border-n-200' data-testid='gallery-header'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 grid grid-cols-8 gap-px opacity-[0.14] sm:grid-cols-12 lg:grid-cols-[repeat(18,minmax(0,1fr))]'
        >
          {albums.flatMap((a) => a.photos).slice(0, 54).map((p, i) => (
            <span key={p.src + i} className='aspect-square overflow-hidden'>
              <Picture image={p} sizes='80px' decorative />
            </span>
          ))}
        </div>
        <Container className='relative py-24'>
          <Eyebrow className='mb-4'>{galleryIntro.eyebrow}</Eyebrow>
          <div className='grid items-end gap-8 lg:grid-cols-12'>
            <div className='lg:col-span-8'>
              <h1 className='u-display text-display-xl text-ink'>
                <LedgerCount value={totalPhotos} testId='gallery-count' /> PHOTOGRAPHS
              </h1>
              <p className='u-display mt-2 text-display-m text-n-500'>{galleryIntro.statement.join(' ')}</p>
            </div>
            <p className='max-w-measure text-body-l text-n-600 lg:col-span-4'>{galleryIntro.support}</p>
          </div>

          <div className='mt-12 flex flex-col gap-4'>
            <div className='flex flex-wrap items-center gap-2' data-testid='gallery-filter-category'>
              <span className='u-label mr-2 text-n-600'>Category</span>
              {galleryCategories.map((c) => (
                <Chip
                  key={c}
                  selected={category === c}
                  onClick={() => setCategory(category === c ? null : c)}
                  testId={'chip-cat-' + c.toLowerCase()}
                >
                  {c}
                </Chip>
              ))}
            </div>
            <div className='flex flex-wrap items-center gap-2' data-testid='gallery-filter-year'>
              <span className='u-label mr-2 text-n-600'>Academic year</span>
              {galleryYears.map((y) => (
                <Chip
                  key={y}
                  selected={year === y}
                  onClick={() => setYear(year === y ? null : y)}
                  testId={'chip-year-' + y.replace(/\s+/g, '-')}
                >
                  {y}
                </Chip>
              ))}
              {category || year ? (
                <Chip
                  selected={false}
                  onClick={() => {
                    setCategory(null);
                    setYear(null);
                  }}
                  testId='chip-gallery-clear'
                >
                  Clear filters
                </Chip>
              ) : null}
            </div>
          </div>
        </Container>
      </header>

      <Section testId='gallery-body'>
        <Container>
          <AnimatePresence mode='wait'>
            {entered ? (
              <motion.div
                key={'album-' + entered.id}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: duration.standard / 1000, ease: easing.entrance }}
              >
                <div className='mb-12 flex flex-wrap items-end justify-between gap-6'>
                  <div className='flex flex-col gap-2'>
                    <Eyebrow>
                      {entered.category} · {entered.year} · {entered.date}
                    </Eyebrow>
                    <h2 className='u-display text-display-l text-ink'>{entered.event}</h2>
                  </div>
                  <Button variant='secondary' onClick={() => setEntered(null)} testId='gallery-back'>
                    <ArrowLeft aria-hidden='true' size={14} />
                    All events
                  </Button>
                </div>

                <ul className='grid auto-rows-[220px] grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-12'>
                  {entered.photos.map((p, i) => (
                    <li key={p.src + i} className={SPANS[i % SPANS.length]}>
                      <button
                        type='button'
                        ref={(el) => {
                          tileRefs.current[entered.id + '-' + i] = el;
                        }}
                        onClick={() =>
                          openLightbox(entered.photos, i, entered.event, entered.id + '-' + i)
                        }
                        data-testid={'gallery-tile-' + i}
                        className='group relative block h-full w-full overflow-hidden rounded-card border-hair border-n-200'
                      >
                        {i === 0 && !reduced ? (
                          <motion.span layoutId={'album-cover-' + entered.id} className='block h-full w-full'>
                            <Picture image={p} sizes='(min-width: 1024px) 45vw, 92vw' />
                          </motion.span>
                        ) : (
                          <Picture image={p} sizes='(min-width: 1024px) 30vw, 45vw' />
                        )}
                        <span className='u-label pointer-events-none absolute inset-x-0 bottom-0 bg-paper/95 px-3 py-2 text-left text-ink opacity-0 transition-opacity duration-micro ease-state group-hover:opacity-100 group-focus-visible:opacity-100'>
                          {p.alt}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              <motion.div
                key='stacks'
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: duration.standard / 1000, ease: easing.entrance }}
              >
                {filtered.length === 0 ? (
                  <div className='flex flex-col gap-4 border-y-hair border-n-300 py-12' data-testid='gallery-empty'>
                    <p className='max-w-measure text-body-l text-ink'>
                      No album matches those filters. There are {albums.length} events in total across{' '}
                      {galleryYears.length} academic years.
                    </p>
                    <Button
                      variant='secondary'
                      onClick={() => {
                        setCategory(null);
                        setYear(null);
                      }}
                      testId='gallery-empty-clear'
                      className='w-fit'
                    >
                      Clear the filters
                    </Button>
                  </div>
                ) : (
                  <ul className='grid gap-12 sm:grid-cols-2 lg:grid-cols-3'>
                    {filtered.map((a, i) => (
                      <RevealUp as='li' key={a.id} index={i}>
                        <PhotoFan album={a} index={i} onOpen={setEntered} />
                      </RevealUp>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </Section>

      {lightbox ? (
        <Lightbox
          photos={lightbox.photos}
          index={lightbox.index}
          title={lightbox.title}
          onClose={closeLightbox}
          onIndex={(i) => setLightbox({ ...lightbox, index: i })}
        />
      ) : null}
    </>
  );
}