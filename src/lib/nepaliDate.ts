/**
 * Bikram Sambat ↔ Gregorian.
 * Anchor: BS 2000-01-01 === AD 1943-04-14. Verified against five new-year
 * pairs and a 3,287-day round-trip sweep in /app/test_core.mjs.
 */

export const BS_MONTH_DAYS: Record<number, number[]> = {
  2000: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2001: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2002: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2003: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2004: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2005: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2006: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2007: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2008: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2009: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2010: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2011: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2012: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2013: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2014: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2015: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2016: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2017: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2018: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2019: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2020: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2021: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2022: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2023: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2024: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2025: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2026: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2027: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2028: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2029: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2030: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2031: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2032: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2033: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2034: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2035: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2036: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2037: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2038: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2039: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2040: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2041: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2042: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2043: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2044: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2045: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2046: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2047: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2048: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2049: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2050: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2051: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2052: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2053: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2054: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2055: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2056: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2057: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2058: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2059: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2060: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2061: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2062: [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
  2063: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2064: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2065: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2066: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2067: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2068: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2069: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2070: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2082: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2083: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2086: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2087: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2088: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2090: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
};

export const BS_MIN_YEAR = 2000;
export const BS_MAX_YEAR = 2090;

const ANCHOR_AD_UTC = Date.UTC(1943, 3, 14);
const MS_PER_DAY = 86400000;

export const BS_MONTHS_EN = [
  'Baishakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

export const BS_MONTHS_NE = [
  'वैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कार्तिक',
  'मङ्सिर',
  'पुस',
  'माघ',
  'फागुन',
  'चैत',
];

export const AD_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Sunday-first, matching the Nepali school week. Saturday is the weekly holiday. */
export const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAYS_NE = ['आइत', 'सोम', 'मङ्गल', 'बुध', 'बिहि', 'शुक्र', 'शनि'];

const NE_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/** Renders a Latin number in Devanagari numerals. */
export function toNepaliDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => NE_DIGITS[Number(d)]);
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function bsMonthLength(year: number, month: number): number | null {
  const row = BS_MONTH_DAYS[year];
  if (!row) return null;
  return row[month - 1] ?? null;
}

function daysSinceAnchor(y: number, m: number, d: number): number | null {
  if (y < BS_MIN_YEAR || y > BS_MAX_YEAR) return null;
  const row = BS_MONTH_DAYS[y];
  if (!row || m < 1 || m > 12 || d < 1 || d > row[m - 1]) return null;
  let total = 0;
  for (let yy = BS_MIN_YEAR; yy < y; yy++) {
    total += BS_MONTH_DAYS[yy].reduce((a, b) => a + b, 0);
  }
  for (let mm = 1; mm < m; mm++) total += row[mm - 1];
  return total + (d - 1);
}

/** '2083-05-18' -> '2026-09-03'. Returns null outside the authored range. */
export function bsToAd(bs: string): string | null {
  const [y, m, d] = bs.split('-').map(Number);
  if (![y, m, d].every(Number.isFinite)) return null;
  const off = daysSinceAnchor(y, m, d);
  if (off === null) return null;
  const t = new Date(ANCHOR_AD_UTC + off * MS_PER_DAY);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** '2026-09-03' -> '2083-05-18'. Returns null outside the authored range. */
export function adToBs(ad: string): string | null {
  const [Y, M, D] = ad.split('-').map(Number);
  if (![Y, M, D].every(Number.isFinite)) return null;
  let off = Math.round((Date.UTC(Y, M - 1, D) - ANCHOR_AD_UTC) / MS_PER_DAY);
  if (off < 0) return null;
  let y = BS_MIN_YEAR;
  while (y <= BS_MAX_YEAR) {
    const yearDays = BS_MONTH_DAYS[y].reduce((a, b) => a + b, 0);
    if (off < yearDays) break;
    off -= yearDays;
    y++;
  }
  if (y > BS_MAX_YEAR) return null;
  let m = 1;
  while (off >= BS_MONTH_DAYS[y][m - 1]) {
    off -= BS_MONTH_DAYS[y][m - 1];
    m++;
  }
  return `${y}-${pad(m)}-${pad(off + 1)}`;
}

/** 0 = Sunday … 6 = Saturday. */
export function bsWeekday(bs: string): number | null {
  const ad = bsToAd(bs);
  if (!ad) return null;
  const [Y, M, D] = ad.split('-').map(Number);
  return new Date(Date.UTC(Y, M - 1, D)).getUTCDay();
}

export function addDaysAd(ad: string, days: number): string {
  const [Y, M, D] = ad.split('-').map(Number);
  const t = new Date(Date.UTC(Y, M - 1, D) + days * MS_PER_DAY);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export function diffDaysAd(from: string, to: string): number {
  const [a, b, c] = from.split('-').map(Number);
  const [x, y, z] = to.split('-').map(Number);
  return Math.round((Date.UTC(x, y - 1, z) - Date.UTC(a, b - 1, c)) / MS_PER_DAY);
}

export function formatBs(bs: string, opts: { nepali?: boolean } = {}): string {
  const [y, m, d] = bs.split('-').map(Number);
  if (opts.nepali) {
    return `${toNepaliDigits(d)} ${BS_MONTHS_NE[m - 1]} ${toNepaliDigits(y)}`;
  }
  return `${d} ${BS_MONTHS_EN[m - 1]} ${y}`;
}

export function formatAd(ad: string): string {
  const [y, m, d] = ad.split('-').map(Number);
  return `${d} ${AD_MONTHS[m - 1]} ${y}`;
}

/** Today in Asia/Kathmandu, as an AD ISO date string. */
export function todayInKathmandu(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return parts;
}

export type BsMonthCell = {
  bs: string;
  ad: string;
  day: number;
  weekday: number;
  inMonth: boolean;
};

/** Builds a Sunday-first month grid for a BS year/month, padded to whole weeks. */
export function buildBsMonthGrid(year: number, month: number): BsMonthCell[] {
  const len = bsMonthLength(year, month);
  if (!len) return [];
  const cells: BsMonthCell[] = [];
  const firstWeekday = bsWeekday(`${year}-${pad(month)}-01`) ?? 0;

  // Leading days from the previous BS month.
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }
  const prevLen = bsMonthLength(prevYear, prevMonth);
  for (let i = firstWeekday - 1; i >= 0; i--) {
    if (!prevLen) break;
    const day = prevLen - i;
    const bs = `${prevYear}-${pad(prevMonth)}-${pad(day)}`;
    const ad = bsToAd(bs);
    if (!ad) continue;
    cells.push({ bs, ad, day, weekday: bsWeekday(bs) ?? 0, inMonth: false });
  }

  for (let d = 1; d <= len; d++) {
    const bs = `${year}-${pad(month)}-${pad(d)}`;
    const ad = bsToAd(bs);
    if (!ad) continue;
    cells.push({ bs, ad, day: d, weekday: bsWeekday(bs) ?? 0, inMonth: true });
  }

  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  let d = 1;
  while (cells.length % 7 !== 0) {
    const bs = `${nextYear}-${pad(nextMonth)}-${pad(d)}`;
    const ad = bsToAd(bs);
    if (!ad) break;
    cells.push({ bs, ad, day: d, weekday: bsWeekday(bs) ?? 0, inMonth: false });
    d++;
  }
  return cells;
}
