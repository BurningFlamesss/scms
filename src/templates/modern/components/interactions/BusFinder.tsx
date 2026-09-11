import { useMemo, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';
import { Search, X, ArrowRight } from 'lucide-react';
import { RevealUp } from '../motion';
import { Chip } from '../Chip';
import { Eyebrow, WidgetCaption } from '../Text';
import { duration, easing } from '../tokens';
import { popularAreas } from '#/content/facilities';
import { TRANSPORT_EMAIL } from '#/content/school';
import { findPickup } from '#/lib/pickup';
import { formatNpr } from '#/lib/fees';

/**
 * SIGNATURE INTERACTION - Facilities
 * Bus route and pickup finder. Search leads; the diagram only confirms. The
 * no-result state is the most valuable state here, so it says so plainly and
 * captures the enquiry rather than faking a match.
 */
export function BusFinder() {
  const reduced = Boolean(useReducedMotion());
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => findPickup(q), [q]);
  const best = matches[0] ?? null;
  const searched = q.trim().length >= 2;

  return (
    <div className='flex flex-col gap-8' data-testid='bus-finder' id='transport'>
      <div className='flex flex-col gap-2'>
        <Eyebrow>Bus route and pickup finder</Eyebrow>
        <WidgetCaption>Type an area, a ward number or a landmark, in English or Nepali.</WidgetCaption>
      </div>

      <div className='flex flex-col gap-4 border-y border-border py-6'>
        <label htmlFor='bus-search' className='u-label text-muted-foreground'>
          Your area
        </label>
        <div className='flex items-center gap-3 border-b border-border focus-within:border-b-rule focus-within:border-accent'>
          <Search aria-hidden='true' size={18} className='shrink-0 text-muted-foreground' />
          <input
            id='bus-search'
            ref={inputRef}
            type='search'
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Lakeside, Ward 15, बागर …'
            data-testid='bus-search'
            className='min-h-[52px] w-full bg-transparent text-body-l text-foreground outline-none placeholder:text-muted-foreground'
          />
          {q ? (
            <button
              type='button'
              onClick={() => {
                setQ('');
                inputRef.current?.focus();
              }}
              data-testid='bus-clear'
              className='inline-flex h-tap w-tap shrink-0 items-center justify-center text-muted-foreground hover:text-foreground'
            >
              <X aria-hidden='true' size={16} />
              <span className='sr-only'>Clear the search</span>
            </button>
          ) : null}
        </div>

        <div className='flex flex-wrap gap-2'>
          <span className='u-label mr-2 self-center text-muted-foreground'>Common areas</span>
          {popularAreas.map((a) => (
            <Chip key={a} selected={q === a} onClick={() => setQ(a)} testId={'bus-chip-' + a.toLowerCase().replace(/\s+/g, '-')}>
              {a}
            </Chip>
          ))}
        </div>
      </div>

      <p className='sr-only' role='status' aria-live='polite' data-testid='bus-live'>
        {!searched
          ? 'Type at least two characters to search for a pickup point.'
          : matches.length === 0
            ? 'No pickup point found for that area.'
            : matches.length + ' pickup point' + (matches.length === 1 ? '' : 's') + ' found.'}
      </p>

      {!searched ? (
        <p className='text-body-l text-muted-foreground' data-testid='bus-empty'>
          Three routes cover the valley from Hemja in the north-west to Birauta in the south. Start
          typing, or choose one of the common areas above.
        </p>
      ) : matches.length === 0 ? (
        <div className='flex flex-col gap-4 border-y border-border py-8' data-testid='bus-nomatch'>
          <p className='max-w-measure text-body-l text-foreground'>
            No bus currently stops in &ldquo;{q.trim()}&rdquo;. The school adds stops when enough
            families ask from the same area.
          </p>
          <a
            href={
              'mailto:' +
              TRANSPORT_EMAIL +
              '?subject=' +
              encodeURIComponent('Bus stop request — ' + q.trim()) +
              '&body=' +
              encodeURIComponent(
                'Area or landmark: ' +
                  q.trim() +
                  '\nStudent name:\nGrade:\nGuardian mobile:\n\nPlease let us know whether a stop can be added near this area.',
              )
            }
            data-testid='bus-request-stop'
            className='u-label inline-flex w-fit min-h-tap items-center gap-2 border-b border-foreground py-2 text-foreground'
          >
            Email the transport office about this area
            <ArrowRight aria-hidden='true' size={14} />
          </a>
        </div>
      ) : (
        <>
          <RevealUp className='flex flex-col gap-6 rounded-card border border-border p-8' key={best!.stop.id}>
            <div className='flex flex-wrap items-baseline justify-between gap-4'>
              <div className='flex flex-col gap-2'>
                <Eyebrow>{best!.route.busNo}</Eyebrow>
                <h3 className='u-display text-display-m text-foreground' data-testid='bus-route-name'>
                  {best!.route.name}
                </h3>
              </div>
              <p className='u-display tnum text-display-m text-foreground' data-testid='bus-fare'>
                {formatNpr(best!.route.monthlyFare)}
                <span className='u-label ml-2 text-muted-foreground'>a month</span>
              </p>
            </div>

            <dl className='grid gap-x-8 gap-y-3 sm:grid-cols-2'>
              <div className='flex justify-between gap-4 border-t border-border pt-3'>
                <dt className='u-label text-muted-foreground'>Pickup point</dt>
                <dd className='u-label text-foreground' data-testid='bus-stop-name'>
                  {best!.stop.name}
                  {best!.stop.nameNe ? <span className='u-ne ml-2 text-muted-foreground'>{best!.stop.nameNe}</span> : null}
                </dd>
              </div>
              <div className='flex justify-between gap-4 border-t border-border pt-3'>
                <dt className='u-label text-muted-foreground'>Nearest landmark</dt>
                <dd className='u-label text-foreground'>{best!.stop.landmark}</dd>
              </div>
              <div className='flex justify-between gap-4 border-t border-border pt-3'>
                <dt className='u-label text-muted-foreground'>Morning pickup</dt>
                <dd className='u-label tnum text-foreground'>{best!.stop.pickup}</dd>
              </div>
              <div className='flex justify-between gap-4 border-t border-border pt-3'>
                <dt className='u-label text-muted-foreground'>Afternoon drop</dt>
                <dd className='u-label tnum text-foreground'>{best!.stop.drop}</dd>
              </div>
            </dl>

            <Link
              to='/courses'
              search={{ band: best!.route.band } as never}
              hash='fee-estimator'
              data-testid='bus-use-in-estimator'
              className='u-label inline-flex w-fit min-h-tap items-center gap-2 border-b border-foreground py-2 text-foreground'
            >
              Use this fare in the fee estimator
              <ArrowRight aria-hidden='true' size={14} />
            </Link>
          </RevealUp>

          {/* Confirmatory only: the list below carries identical information. */}
          <div className='overflow-hidden'>
            <motion.svg
              key={best!.route.id}
              viewBox='0 0 720 200'
              className='w-full'
              aria-hidden='true'
              initial={reduced ? { opacity: 0 } : { scaleX: 0 }}
              animate={reduced ? { opacity: 1 } : { scaleX: 1 }}
              transition={{ duration: (reduced ? 160 : duration.routeDraw) / 1000, ease: easing.entrance }}
              style={{ transformOrigin: 'left center' }}
            >
              <path d={best!.route.path} fill='none' stroke='var(--c-gray-300)' strokeWidth='2' />
              {best!.route.stops.map((s, i) => {
                const x = 30 + (i * 660) / (best!.route.stops.length - 1);
                const y = 120 - i * 6;
                const isMatch = s.id === best!.stop.id;
                return (
                  <g key={s.id}>
                    <circle cx={x} cy={y} r={isMatch ? 9 : 5} fill={isMatch ? 'var(--c-yellow)' : 'var(--c-white)'} stroke='var(--c-gray-300)' strokeWidth='2' />
                    <text
                      x={x}
                      y={y - 20}
                      textAnchor='middle'
                      fill={isMatch ? 'var(--c-black)' : 'var(--c-gray-500)'}
                      fontSize='13'
                      letterSpacing='1.2'
                      fontFamily="'IBM Plex Mono', monospace"
                    >
                      {s.name}
                    </text>
                  </g>
                );
              })}
            </motion.svg>
          </div>

          <div className='flex flex-col gap-4'>
            <p className='u-label text-muted-foreground'>All stops on this route</p>
            <ul className='flex flex-col' data-testid='bus-stop-list'>
              {best!.route.stops.map((s) => (
                <li
                  key={s.id}
                  className={
                    'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-border py-3 last:border-b ' +
                    (s.id === best!.stop.id ? 'border-accent' : 'border-border')
                  }
                >
                  <span className='u-label tnum w-6 text-accent'>{String(s.order).padStart(2, '0')}</span>
                  <span className='min-w-0 flex-1 text-body-m text-foreground'>
                    {s.name}
                    <span className='u-ne ml-2 text-muted-foreground'>{s.nameNe}</span>
                  </span>
                  <span className='u-label text-muted-foreground'>{s.landmark}</span>
                  <span className='u-label tnum text-foreground'>
                    {s.pickup} · {s.drop}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {matches.length > 1 ? (
            <div className='flex flex-col gap-3'>
              <p className='u-label text-muted-foreground'>Other stops matching &ldquo;{q.trim()}&rdquo;</p>
              <ul className='flex flex-wrap gap-2' data-testid='bus-other-matches'>
                {matches.slice(1, 5).map((m) => (
                  <li key={m.route.id + m.stop.id}>
                    <button
                      type='button'
                      onClick={() => setQ(m.stop.name)}
                      className='u-label rounded-pill border border-border px-3 py-2 text-muted-foreground hover:border-foreground hover:text-foreground'
                    >
                      {m.stop.name} · {m.route.busNo}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}