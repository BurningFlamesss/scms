import { useEffect, useState } from 'react';

/** Matches a media query, SSR-safe and reactive. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
}

/** True only for precise pointers — magneticHover and plan-block lift gate on this. */
export function usePointerFine(): boolean {
  return useMediaQuery('(pointer: fine)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function usePrefersContrast(): boolean {
  return useMediaQuery('(prefers-contrast: more)');
}

export type KathmanduNow = {
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  hour: number;
  minute: number;
  /** Minutes since midnight, Nepal time. */
  minutes: number;
  timeLabel: string;
  isoDate: string;
};

function readKathmandu(): KathmanduNow {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kathmandu',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const wdMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const weekday = wdMap[get('weekday')] ?? 0;
  const hour = Number(get('hour'));
  const minute = Number(get('minute'));
  const isoDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return {
    weekday,
    hour,
    minute,
    minutes: hour * 60 + minute,
    timeLabel: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    isoDate,
  };
}

/** Live Nepal Time, ticking once a minute. */
export function useKathmanduNow(): KathmanduNow {
  const [now, setNow] = useState<KathmanduNow>(() => readKathmandu());
  useEffect(() => {
    const id = window.setInterval(() => setNow(readKathmandu()), 30000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/** Parses 'HH:MM' into minutes since midnight. */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
