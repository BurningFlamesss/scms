import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { BookOpen, Bus, Eye, EyeOff, FlaskConical, Music4, Palette, RotateCcw, Trophy } from 'lucide-react';
import { duration, easingCss } from '../tokens';
import { cn } from '#/lib/utils';

type GameSymbol = { id: string; label: string; Icon: typeof BookOpen };

/** Six pairs drawn from things that actually happen on this campus. */
const SYMBOLS: GameSymbol[] = [
  { id: 'library', label: 'Library', Icon: BookOpen },
  { id: 'laboratory', label: 'Laboratory', Icon: FlaskConical },
  { id: 'bus', label: 'School bus', Icon: Bus },
  { id: 'sports', label: 'Sports ground', Icon: Trophy },
  { id: 'music', label: 'Music room', Icon: Music4 },
  { id: 'art', label: 'Art room', Icon: Palette },
];

const COLS = 4;
const STORAGE_KEY = 'everest.activate.game';

type Tile = { key: string; symbolId: string; label: string; Icon: typeof BookOpen };

function buildDeck(): Tile[] {
  const deck: Tile[] = SYMBOLS.flatMap((s) => [
    { key: s.id + '-a', symbolId: s.id, label: s.label, Icon: s.Icon },
    { key: s.id + '-b', symbolId: s.id, label: s.label, Icon: s.Icon },
  ]);
  // Fisher-Yates, so every visit deals a different board.
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * A companion, not a gate. It sits beside the activation form to keep a child
 * busy while a guardian fills the fields in — nothing on this page depends on
 * finishing it, and it can be put away entirely.
 *
 * Notes on the rules it has to obey:
 * - It lives on the brand panel, so it is built from paper and the grey ramp
 *   only. The action colour is not used anywhere here.
 * - The flip is a CSS transition on `transform`, not an eighth Framer
 *   primitive, and it reads its numbers from the motion tokens.
 * - Reduced motion turns the flip instant, and the board stays fully playable.
 */
export function MemoryMatch() {
  const reduced = Boolean(useReducedMotion());
  const [deck, setDeck] = useState<Tile[]>(buildDeck);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [say, setSay] = useState('');
  const [hidden, setHidden] = useState(false);

  const holdRef = useRef<number | null>(null);
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const showRef = useRef<HTMLButtonElement>(null);
  const hideRef = useRef<HTMLButtonElement>(null);

  // Dismissal survives navigation within the tab, but never outlives the tab.
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === 'hidden') setHidden(true);
    } catch {
      /* private browsing — the game simply stays visible */
    }
  }, []);

  const persist = useCallback((next: boolean) => {
    setHidden(next);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, next ? 'hidden' : 'shown');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(
    () => () => {
      if (holdRef.current) window.clearTimeout(holdRef.current);
    },
    [],
  );

  const won = matched.length === SYMBOLS.length;

  const reset = useCallback(() => {
    if (holdRef.current) window.clearTimeout(holdRef.current);
    setDeck(buildDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setLocked(false);
    setSay('The board has been dealt again. Six pairs to find.');
  }, []);

  const reveal = (tile: Tile) => {
    if (locked || won) return;
    if (matched.includes(tile.symbolId)) return;
    if (flipped.includes(tile.key) || flipped.length === 2) return;

    const next = [...flipped, tile.key];
    setFlipped(next);

    if (next.length < 2) {
      setSay(tile.label + ' turned over.');
      return;
    }

    const [first, second] = next.map((k) => deck.find((t) => t.key === k)!);
    const nextMoves = moves + 1;
    setMoves(nextMoves);

    if (first.symbolId === second.symbolId) {
      const nextMatched = [...matched, first.symbolId];
      setMatched(nextMatched);
      setFlipped([]);
      setSay(
        nextMatched.length === SYMBOLS.length
          ? 'All six pairs found in ' + nextMoves + ' turns. Well played.'
          : first.label + ' paired. ' + nextMatched.length + ' of ' + SYMBOLS.length + ' done.',
      );
      return;
    }

    setLocked(true);
    setSay(first.label + ' and ' + second.label + ' are not a pair.');
    holdRef.current = window.setTimeout(
      () => {
        setFlipped([]);
        setLocked(false);
      },
      reduced ? 400 : duration.mismatch,
    );
  };

  /** Arrow keys walk the board; Tab still reaches every tile in reading order. */
  const onTileKey = (e: React.KeyboardEvent, i: number) => {
    const map: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      ArrowDown: i + COLS,
      ArrowUp: i - COLS,
    };
    const target = map[e.key];
    if (target === undefined) return;
    if (target < 0 || target >= deck.length) return;
    e.preventDefault();
    tileRefs.current[target]?.focus();
  };

  const status = useMemo(
    () => matched.length + ' of ' + SYMBOLS.length + ' pairs · ' + moves + (moves === 1 ? ' turn' : ' turns'),
    [matched.length, moves],
  );

  if (hidden) {
    return (
      <div className='flex flex-col gap-3 border-t-hair border-paper/20 pt-6' data-testid='memory-hidden'>
        <p className='u-label text-paper/75'>While you fill in the form</p>
        <p className='max-w-measure text-body-s text-paper/80'>
          There is a small matching game here for anyone waiting. It is put away for now.
        </p>
        <button
          ref={showRef}
          type='button'
          onClick={() => {
            persist(false);
            // Move focus to the control that replaces this one.
            window.setTimeout(() => hideRef.current?.focus(), 0);
          }}
          data-testid='memory-show'
          className='u-label inline-flex w-fit min-h-tap items-center gap-2 rounded-ui border-hair border-paper/40 px-3 text-paper transition-colors duration-micro ease-state hover:bg-[#FEF2F2]/10 hover:border-paper'
        >
          <Eye aria-hidden='true' size={14} />
          Bring the game back
        </button>
      </div>
    );
  }

  return (
    <section
      className='flex flex-col gap-4 border-t-hair border-paper/20 pt-6'
      aria-labelledby='memory-heading'
      data-testid='memory-match'
    >
      <div className='flex flex-wrap items-baseline justify-between gap-3'>
        <div className='flex flex-col gap-1'>
          <h2 id='memory-heading' className='u-label text-paper/75'>
            While you fill in the form
          </h2>
          <p className='text-body-s text-paper/80'>Find the six pairs. Nothing here affects your activation.</p>
        </div>
        <p className='u-label tnum shrink-0 text-paper' data-testid='memory-status'>
          {status}
        </p>
      </div>

      <ul className='grid max-w-measure-narrow grid-cols-4 gap-2' data-testid='memory-board'>
        {deck.map((tile, i) => {
          const isMatched = matched.includes(tile.symbolId);
          const isUp = isMatched || flipped.includes(tile.key);
          const { Icon } = tile;
          const name = isMatched
            ? tile.label + ', paired'
            : isUp
              ? tile.label + ', turned over'
              : 'Face-down card ' + (i + 1) + ' of ' + deck.length;
          return (
            <li key={tile.key}>
              <button
                ref={(el) => {
                  tileRefs.current[i] = el;
                }}
                type='button'
                onClick={() => reveal(tile)}
                onKeyDown={(e) => onTileKey(e, i)}
                aria-disabled={isMatched || undefined}
                aria-label={name}
                data-testid={'memory-tile-' + i}
                data-state={isMatched ? 'paired' : isUp ? 'up' : 'down'}
                className='relative block aspect-square w-full rounded-ui'
                style={{ perspective: '600px' }}
              >
                <span
                  aria-hidden='true'
                  className='absolute inset-0'
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transitionProperty: 'transform',
                    transitionDuration: (reduced ? 0 : duration.flip) + 'ms',
                    transitionTimingFunction: easingCss.state,
                  }}
                >
                  <span
                    className='absolute inset-0 flex items-center justify-center rounded-ui border-hair border-paper/50 bg-[#FEF2F2]/[0.14]'
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className='u-label tnum text-paper/80'>{String(i + 1).padStart(2, '0')}</span>
                  </span>
                  <span
                    className={cn(
                      'absolute inset-0 flex items-center justify-center rounded-ui border-hair',
                      isMatched ? 'border-paper/40 bg-[#FEF2F2]/70' : 'border-paper bg-[#FEF2F2]',
                    )}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <Icon aria-hidden='true' size={20} className={isMatched ? 'text-n-600' : 'text-ink'} />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* One polite region carries every change, so the board itself stays quiet. */}
      <p className='sr-only' role='status' aria-live='polite' data-testid='memory-live'>
        {say}
      </p>

      {won ? (
        <p className='text-body-s text-paper' data-testid='memory-won'>
          All six pairs, in {moves} turns. Deal again, or carry on with the form.
        </p>
      ) : null}

      <div className='flex flex-wrap gap-2'>
        <button
          type='button'
          onClick={reset}
          data-testid='memory-reset'
          className='u-label inline-flex min-h-tap items-center gap-2 rounded-ui border-hair border-paper/40 px-3 text-paper transition-colors duration-micro ease-state hover:border-paper hover:bg-[#FEF2F2]/10'
        >
          <RotateCcw aria-hidden='true' size={14} />
          Deal again
        </button>
        <button
          ref={hideRef}
          type='button'
          onClick={() => {
            persist(true);
            window.setTimeout(() => showRef.current?.focus(), 0);
          }}
          data-testid='memory-hide'
          className='u-label inline-flex min-h-tap items-center gap-2 rounded-ui border-hair border-paper/40 px-3 text-paper transition-colors duration-micro ease-state hover:border-paper hover:bg-[#FEF2F2]/10'
        >
          <EyeOff aria-hidden='true' size={14} />
          Put the game away
        </button>
      </div>
    </section>
  );
}
