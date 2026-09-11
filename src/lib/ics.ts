import { addDaysAd } from './nepaliDate';
import type { CalEvent } from '../content/types';

function icsEscape(s: string): string {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function compact(ad: string): string {
  return ad.replace(/-/g, '');
}

export function slugify(s: string): string {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function icsFilename(label: string): string {
  return `everest-${slugify(label)}.ics`;
}

/** Generates a valid VCALENDAR entirely in the browser. No server involved. */
export function buildIcs(events: CalEvent[], calName: string): string {
  const L: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Everest English Boarding Secondary School//Academic Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape(calName)}`,
    'X-WR-TIMEZONE:Asia/Kathmandu',
  ];
  for (const ev of events) {
    if (!ev.date.ad) continue;
    const start = ev.date.ad;
    const endExclusive = addDaysAd(ev.endDate?.ad || start, 1);
    L.push('BEGIN:VEVENT');
    L.push(`UID:${ev.id}@everestebss.edu.np`);
    L.push('DTSTAMP:20260101T000000Z');
    L.push(`DTSTART;VALUE=DATE:${compact(start)}`);
    L.push(`DTEND;VALUE=DATE:${compact(endExclusive)}`);
    L.push(`SUMMARY:${icsEscape(ev.title)}`);
    L.push(`DESCRIPTION:${icsEscape(`${ev.detail ? ev.detail + ' ' : ''}(BS ${ev.date.bs})`)}`);
    L.push(`CATEGORIES:${ev.kind.toUpperCase()}`);
    L.push('END:VEVENT');
  }
  L.push('END:VCALENDAR');
  return L.join('\r\n') + '\r\n';
}

export function downloadIcs(events: CalEvent[], label: string): void {
  const text = buildIcs(events, label);
  const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = icsFilename(label);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Clipboard with a graceful fallback for browsers without the async API. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
