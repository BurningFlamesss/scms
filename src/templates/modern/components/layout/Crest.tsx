import type { ReactNode } from 'react';

/**
 * The school crest as layered SVG. Each element is a separately addressable
 * group so the About page can take it apart along its own vectors using
 * transform only.
 */

export const CREST_VIEWBOX = '0 0 400 400';

export function CrestRing({ tone }: { tone: string }) {
  return (
    <g>
      <circle cx='200' cy='200' r='186' fill='none' stroke={tone} strokeWidth='3' />
      <circle cx='200' cy='200' r='168' fill='none' stroke={tone} strokeWidth='1' />
      <path id='crest-ring-path' d='M 52 200 A 148 148 0 0 0 348 200' fill='none' />
      <text fill={tone} fontSize='30' fontFamily="'Mukta', sans-serif" letterSpacing='1'>
        <textPath href='#crest-ring-path' startOffset='50%' textAnchor='middle'>
          एभरेस्ट माध्यमिक विद्यालय
        </textPath>
      </text>
    </g>
  );
}

export function CrestPeak({ tone }: { tone: string }) {
  return (
    <g>
      <path d='M200 74 L262 176 L138 176 Z' fill='none' stroke={tone} strokeWidth='4' />
      <path d='M200 74 L222 110 L200 122 L178 110 Z' fill={tone} />
      <path d='M150 176 L170 152 L186 176 Z' fill={tone} opacity='0.35' />
    </g>
  );
}

export function CrestBook({ tone }: { tone: string }) {
  return (
    <g>
      <path d='M118 234 L196 218 L196 288 L118 302 Z' fill='none' stroke={tone} strokeWidth='4' />
      <path d='M282 234 L204 218 L204 288 L282 302 Z' fill='none' stroke={tone} strokeWidth='4' />
      <path d='M196 218 L200 214 L204 218' fill='none' stroke={tone} strokeWidth='4' />
      <line x1='134' y1='250' x2='182' y2='240' stroke={tone} strokeWidth='2' />
      <line x1='134' y1='266' x2='182' y2='256' stroke={tone} strokeWidth='2' />
      <line x1='266' y1='250' x2='218' y2='240' stroke={tone} strokeWidth='2' />
      <line x1='266' y1='266' x2='218' y2='256' stroke={tone} strokeWidth='2' />
    </g>
  );
}

export function CrestStar({ tone }: { tone: string }) {
  return (
    <path
      d='M200 138 L211 170 L245 170 L218 190 L228 222 L200 202 L172 222 L182 190 L155 170 L189 170 Z'
      fill={tone}
    />
  );
}

export function CrestYear({ tone, textTone }: { tone: string; textTone: string }) {
  return (
    <g>
      <path d='M136 312 L264 312 L250 340 L150 340 Z' fill={tone} />
      <text
        x='200'
        y='333'
        fill={textTone}
        fontSize='21'
        textAnchor='middle'
        fontFamily="'IBM Plex Mono', monospace"
        letterSpacing='2'
      >
        2052 BS
      </text>
    </g>
  );
}

export type CrestTone = { line: string; solid: string; onSolid: string };

/** Composed crest. `wrap` lets the About page wrap each part in a motion group. */
export function Crest({
  size = 64,
  tone,
  title = 'The Everest English Boarding Secondary School crest',
  wrap,
  className,
}: {
  size?: number;
  tone: CrestTone;
  title?: string;
  wrap?: (id: string, node: ReactNode) => ReactNode;
  className?: string;
}) {
  const parts: Array<[string, ReactNode]> = [
    ['ring', <CrestRing key='ring' tone={tone.line} />],
    ['peak', <CrestPeak key='peak' tone={tone.line} />],
    ['book', <CrestBook key='book' tone={tone.line} />],
    ['star', <CrestStar key='star' tone={tone.solid} />],
    ['year', <CrestYear key='year' tone={tone.solid} textTone={tone.onSolid} />],
  ];
  return (
    <svg
      viewBox={CREST_VIEWBOX}
      width={size}
      height={size}
      role='img'
      aria-label={title}
      className={className}
      overflow='visible'
    >
      {parts.map(([id, node]) => (wrap ? wrap(id, node) : <g key={id}>{node}</g>))}
    </svg>
  );
}
