import { useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Segmented } from '../Segmented';
import { Eyebrow, WidgetCaption } from '../Text';
import { duration, easing } from '../tokens';
import { plusTwoStreams } from '#/content/courses';
import type { QuizStreamId } from '#/content/types';

const OPTIONS = plusTwoStreams.map((s) => ({ value: s.id as QuizStreamId, label: s.name }));

/**
 * SIGNATURE INTERACTION - Courses
 * +2 stream comparison. Two streams are picked and the subject lists resolve
 * into a side-by-side diff: shared subjects settle onto a centre column on
 * hairlines, unique subjects push out left and right.
 */
export function StreamCompare({
  left,
  right,
  onLeft,
  onRight,
}: {
  left: QuizStreamId;
  right: QuizStreamId;
  onLeft: (v: QuizStreamId) => void;
  onRight: (v: QuizStreamId) => void;
}) {
  const reduced = Boolean(useReducedMotion());

  const a = plusTwoStreams.find((s) => s.id === left)!;
  const b = plusTwoStreams.find((s) => s.id === right)!;

  const { shared, onlyA, onlyB } = useMemo(() => {
    const bIds = new Set(b.subjects.map((s) => s.id));
    const aIds = new Set(a.subjects.map((s) => s.id));
    return {
      shared: a.subjects.filter((s) => bIds.has(s.id)),
      onlyA: a.subjects.filter((s) => !bIds.has(s.id)),
      onlyB: b.subjects.filter((s) => !aIds.has(s.id)),
    };
  }, [a, b]);

  const same = left === right;
  const key = left + '-' + right;

  const anim = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
      };

  return (
    <div className='flex flex-col gap-8' data-testid='stream-compare' id='stream-compare'>
      <div className='flex flex-col gap-2'>
        <Eyebrow>Compare two streams</Eyebrow>
        <WidgetCaption>Shared subjects sit in the middle; the differences push outward.</WidgetCaption>
      </div>

      <div className='flex flex-wrap gap-8 border-y-hair border-n-200 py-6'>
        <Segmented label='Left stream' options={OPTIONS} value={left} onChange={onLeft} testId='compare-left' />
        <Segmented label='Right stream' options={OPTIONS} value={right} onChange={onRight} testId='compare-right' />
      </div>

      {same ? (
        <p className='border-y-hair border-n-300 py-8 text-body-l text-ink' data-testid='compare-same'>
          Both sides are set to {a.name}. Choose a different stream on one side to see what changes.
        </p>
      ) : (
        <AnimatePresence mode='wait'>
          <motion.div
            key={key}
            {...anim}
            transition={{ duration: (reduced ? 160 : duration.standard) / 1000, ease: easing.state }}
            className='grid gap-6 lg:grid-cols-12'
          >
            <div className='lg:col-span-4' data-testid='compare-only-left'>
              <h3 className='u-display mb-4 text-display-m text-ink'>{a.name}</h3>
              <p className='u-label mb-4 text-accent'>Only in {a.name}</p>
              <ul className='flex flex-col'>
                {onlyA.map((s) => (
                  <li key={s.id} className='border-t-hair border-n-200 py-3 last:border-b-hair'>
                    <p className='text-body-m text-ink'>{s.name}</p>
                    <p className='u-label tnum text-n-600'>
                      {s.creditHours} credit hours · {s.theory} + {s.practical}
                    </p>
                  </li>
                ))}
                {onlyA.length === 0 ? (
                  <li className='u-label border-y-hair border-n-200 py-3 text-n-600'>
                    Nothing unique to this side
                  </li>
                ) : null}
              </ul>
              <p className='u-label mt-6 mb-2 text-n-600'>Career directions</p>
              <ul className='flex flex-wrap gap-2'>
                {a.careers.map((c) => (
                  <li key={c} className='u-label rounded-pill border-hair border-n-300 px-3 py-1 text-n-600'>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className='lg:col-span-4' data-testid='compare-shared'>
              <h3 className='u-display mb-4 text-display-m text-ink'>Shared</h3>
              <p className='u-label mb-4 text-n-600'>Taken by both streams</p>
              <ul className='flex flex-col rounded-card border-hair border-n-300 px-4'>
                {shared.map((s) => (
                  <li key={s.id} className='border-t-hair border-n-200 py-3 first:border-t-0'>
                    <p className='text-body-m text-ink'>{s.name}</p>
                    <p className='u-label tnum text-n-600'>
                      {s.creditHours} credit hours · {s.theory} + {s.practical}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className='lg:col-span-4' data-testid='compare-only-right'>
              <h3 className='u-display mb-4 text-display-m text-ink'>{b.name}</h3>
              <p className='u-label mb-4 text-accent'>Only in {b.name}</p>
              <ul className='flex flex-col'>
                {onlyB.map((s) => (
                  <li key={s.id} className='border-t-hair border-n-200 py-3 last:border-b-hair'>
                    <p className='text-body-m text-ink'>{s.name}</p>
                    <p className='u-label tnum text-n-600'>
                      {s.creditHours} credit hours · {s.theory} + {s.practical}
                    </p>
                  </li>
                ))}
                {onlyB.length === 0 ? (
                  <li className='u-label border-y-hair border-n-200 py-3 text-n-600'>
                    Nothing unique to this side
                  </li>
                ) : null}
              </ul>
              <p className='u-label mt-6 mb-2 text-n-600'>Career directions</p>
              <ul className='flex flex-wrap gap-2'>
                {b.careers.map((c) => (
                  <li key={c} className='u-label rounded-pill border-hair border-n-300 px-3 py-1 text-n-600'>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
