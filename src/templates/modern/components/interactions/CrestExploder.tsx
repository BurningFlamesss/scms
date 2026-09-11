import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, useReducedMotion } from 'motion/react';
import {
  CrestBook,
  CrestPeak,
  CrestRing,
  CrestStar,
  CrestYear,
} from '../layout/Crest';
import { crestParts } from '#/content/about';
import { cn } from '#/lib/utils';

const tone = { line: 'var(--c-black)', solid: 'var(--c-yellow)', onSolid: 'var(--c-white)' };

const PART_NODES: Record<string, React.ReactNode> = {
  ring: <CrestRing tone={tone.line} />,
  peak: <CrestPeak tone={tone.line} />,
  book: <CrestBook tone={tone.line} />,
  star: <CrestStar tone={tone.solid} />,
  year: <CrestYear tone={tone.solid} textTone={tone.onSolid} />,
};

/** Anchor on the crest that each leader line starts from, in crest units. */
const PART_ORIGIN: Record<string, { x: number; y: number }> = {
  ring: { x: 200, y: 366 },
  peak: { x: 200, y: 120 },
  book: { x: 158, y: 260 },
  star: { x: 240, y: 180 },
  year: { x: 160, y: 326 },
};

const OUTER = '-250 -250 900 900';

function Exploded({ spread }: { spread: import('motion/react').MotionValue<number> | number }) {
  const isStatic = typeof spread === 'number';
  return (
    <svg
      viewBox={isStatic ? OUTER : OUTER}
      className='h-full w-full'
      role='img'
      aria-label='The school crest with each element separated and labelled: the peak, the open book, the star, the ring and the year'
      data-testid='crest-exploded'
    >
      {crestParts.map((p) => {
        const origin = PART_ORIGIN[p.id];
        const endX = 200 + p.lx;
        const endY = 200 + p.ly;
        const anchor = p.side === 'left' ? 'end' : 'start';
        const labelX = p.side === 'left' ? endX - 10 : endX + 10;

        const common = (
          <>
            <line
              x1={origin.x + p.dx * (isStatic ? spread : 1)}
              y1={origin.y + p.dy * (isStatic ? spread : 1)}
              x2={endX}
              y2={endY}
              stroke='var(--c-gray-300)'
              strokeWidth='1'
            />
            <circle cx={endX} cy={endY} r='3' fill='var(--c-yellow)' />
            <text
              x={labelX}
              y={endY + 4}
              textAnchor={anchor}
              fill='var(--c-black)'
              fontSize='19'
              letterSpacing='2.4'
              fontFamily="'IBM Plex Mono', monospace"
            >
              {p.label}
            </text>
          </>
        );

        if (isStatic) {
          return (
            <g key={p.id}>
              <g style={{ transform: `translate(${p.dx * spread}px, ${p.dy * spread}px)` }}>
                {PART_NODES[p.id]}
              </g>
              <g opacity={spread}>{common}</g>
            </g>
          );
        }

        return <AnimatedPart key={p.id} id={p.id} spread={spread} dx={p.dx} dy={p.dy} common={common} origin={origin} />;
      })}
    </svg>
  );
}

function AnimatedPart({
  id,
  spread,
  dx,
  dy,
  common,
  origin,
}: {
  id: string;
  spread: import('motion/react').MotionValue<number>;
  dx: number;
  dy: number;
  common: React.ReactNode;
  origin: { x: number; y: number };
}) {
  const x = useTransform(spread, (v) => dx * v);
  const y = useTransform(spread, (v) => dy * v);
  return (
    <g>
      <motion.g style={{ x, y, willChange: 'transform' }}>{PART_NODES[id]}</motion.g>
      <motion.g style={{ opacity: spread, x, y, originX: origin.x, originY: origin.y }} className='hidden'>
        {null}
      </motion.g>
      <motion.g style={{ opacity: spread }}>{common}</motion.g>
    </g>
  );
}

/**
 * SIGNATURE INTERACTION - About
 * The crest, taken apart. Elements separate outward along their own vectors as
 * the page is scrolled, each drawing a hairline leader out to a mono label,
 * then reassemble. Transform and opacity only.
 *
 * Under reduced motion the crest renders permanently exploded and fully
 * labelled, which is arguably the clearer diagram of the two.
 */
export function CrestExploder() {
  const reduced = Boolean(useReducedMotion());
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const spread = useTransform(scrollYProgress, [0, 0.38, 0.68, 1], [0, 1, 1, 0]);
  const [phase, setPhase] = useState(0);
  useMotionValueEvent(spread, 'change', (v) => setPhase(v));

  const meanings = (
    <ol className='flex flex-col' data-testid='crest-meanings'>
      {crestParts.map((p, i) => (
        <li
          key={p.id}
          className={cn(
            'border-t border-border py-4 transition-colors duration-standard ease-state',
            phase > 0.5 || reduced ? 'border-gray-300' : 'border-gray-200',
          )}
        >
          <div className='flex gap-4'>
            <span className='u-label tnum shrink-0 text-accent'>{String(i + 1).padStart(2, '0')}</span>
            <div className='flex flex-col gap-2'>
              <span className='u-label text-foreground'>{p.label}</span>
              <p className='max-w-measure text-body-m text-muted-foreground'>{p.meaning}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );

  if (reduced) {
    return (
      <div className='grid gap-12 lg:grid-cols-12' data-testid='crest-section'>
        <div className='lg:col-span-7'>
          <div className='aspect-square w-full'>
            <Exploded spread={1} />
          </div>
        </div>
        <div className='lg:col-span-5'>{meanings}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className='relative h-[280svh]' data-testid='crest-section'>
      <div className='sticky top-0 flex min-h-svh items-center py-16'>
        <div className='grid w-full items-center gap-12 lg:grid-cols-12'>
          <div className='lg:col-span-7'>
            <div className='mx-auto aspect-square w-full max-w-[640px]'>
              <Exploded spread={spread} />
            </div>
          </div>
          <div className='lg:col-span-5'>
            <p className='u-label mb-6 text-accent'>
              {phase < 0.2 ? 'Assembled' : phase > 0.85 ? 'Coming back together' : 'Taken apart'}
            </p>
            {meanings}
          </div>
        </div>
      </div>
    </div>
  );
}