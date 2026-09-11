import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link } from '@tanstack/react-router';
import { Pause, Play } from 'lucide-react';
import { duration, easing } from '../tokens';
import { notices } from '#/content/school';
import { cn } from '#/lib/utils';

function relative(iso: string): string {
  const then = new Date(iso + 'T00:00:00Z').getTime();
  const now = Date.now();
  const days = Math.max(0, Math.round((now - then) / 86400000));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return days + ' days ago';
  const months = Math.round(days / 30);
  if (months < 12) return months + (months === 1 ? ' month ago' : ' months ago');
  const years = Math.round(days / 365);
  return years + (years === 1 ? ' year ago' : ' years ago');
}

const ordered = [...notices].sort((a, b) => Number(b.pinned) - Number(a.pinned));

/**
 * A 44px strip carrying live school notices. Items hold for five seconds and
 * slide vertically for 400ms - never a continuous marquee, which is unreadable.
 * It pauses on hover, on keyboard focus, and on its own visible control
 * (WCAG 2.2.2). The rotating text is hidden from assistive technology; the full
 * list is exposed as a real <ul> underneath instead.
 */
export function NoticeTicker({ className, testId = 'notice-ticker' }: { className?: string; testId?: string }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const timer = useRef<number | null>(null);

  const paused = !playing || hovered || focused || Boolean(reduced);

  useEffect(() => {
    if (paused) return;
    timer.current = window.setTimeout(
      () => setI((n) => (n + 1) % ordered.length),
      duration.tickerHold,
    );
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [i, paused]);

  const notice = ordered[i];

  return (
    <div
      className={cn(
        'flex min-h-ticker w-full items-center gap-4 border-b-hair border-n-200 bg-paper',
        className,
      )}
      data-testid={testId}
      data-paused={paused ? 'true' : 'false'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    >
      <span className='u-label shrink-0 border-hair border-accent px-2 py-1 text-accent'>Notice</span>

      <div className='relative min-w-0 flex-1 overflow-hidden' style={{ height: 24 }} aria-hidden='true'>
        <AnimatePresence initial={false} mode='wait'>
          <motion.div
            key={notice.id}
            initial={reduced ? { opacity: 0 } : { y: 24, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: -24, opacity: 0 }}
            transition={{ duration: duration.tickerSlide / 1000, ease: easing.state }}
            className='absolute inset-0 flex items-center gap-4'
          >
            <span className='truncate text-body-s text-ink' data-testid='ticker-current'>
              {notice.title}
            </span>
            <span className='u-label hidden shrink-0 text-n-600 sm:inline'>{relative(notice.publishedAt)}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type='button'
        onClick={() => setPlaying((p) => !p)}
        data-testid='ticker-toggle'
        aria-pressed={!playing}
        className='inline-flex h-tap w-tap shrink-0 items-center justify-center rounded-ui text-n-600 hover:text-ink'
      >
        {playing ? <Pause aria-hidden='true' size={14} /> : <Play aria-hidden='true' size={14} />}
        <span className='sr-only'>{playing ? 'Pause the notice rotation' : 'Play the notice rotation'}</span>
      </button>

      <Link
        to='/calendar'
        className='u-label mr-4 hidden shrink-0 text-n-600 underline underline-offset-4 hover:text-ink lg:inline'
        data-testid='ticker-view-all'
      >
        View all notices
      </Link>

      {/* The authoritative list for assistive technology. */}
      <ul className='sr-only'>
        {ordered.map((n) => (
          <li key={n.id}>
            {n.title} — published {relative(n.publishedAt)}
          </li>
        ))}
      </ul>
    </div>
  );
}
