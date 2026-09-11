/** Minimal RFC-5545 generator so deadlines can be saved to any calendar app. */

export interface CalendarEvent {
  uid: string;
  title: string;
  description: string;
  location?: string;
  /** YYYY-MM-DD */
  date: string;
  /** Days of advance reminder */
  remindDaysBefore?: number;
}

const esc = (value: string): string =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

const compact = (iso: string): string => iso.replace(/-/g, "");

const nextDay = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return compact(d.toISOString().slice(0, 10));
};

export function buildIcs(event: CalendarEvent): string {
  const stamp = `${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Everest English Boarding Secondary School//Notices//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}@everestbutwal.edu.np`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(event.date)}`,
    `DTEND;VALUE=DATE:${nextDay(event.date)}`,
    `SUMMARY:${esc(event.title)}`,
    `DESCRIPTION:${esc(event.description)}`,
    `LOCATION:${esc(event.location ?? "Everest English Boarding Secondary School, Butwal-8")}`,
    "STATUS:CONFIRMED",
    "TRANSP:TRANSPARENT",
    "BEGIN:VALARM",
    `TRIGGER:-P${event.remindDaysBefore ?? 3}D`,
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(`Reminder: ${event.title}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function downloadIcs(event: CalendarEvent, fileName: string): string {
  const blob = new Blob([buildIcs(event)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const name = fileName.endsWith(".ics") ? fileName : `${fileName}.ics`;
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return name;
}

/** Copy helper with a graceful fallback for non-secure contexts. */
export async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

import { calendarEvents } from '../content/calendar';
import { terms } from '../content/calendar';
import { countdownTo, daysUntil, formatAd } from './dates';
import { bsToAd, adToBs } from './nepaliDate';
import type { EventKind, CalEvent } from '../content/types';

/** Returns "X days Y hours" or "Closed" for a deadline. */
export function countdownLabel(deadlineAd: string): string {
  const { days, hours, closed } = countdownTo(deadlineAd);
  if (closed) return 'Closed';
  return `${days}d ${hours}h`;
}

/** Returns events that fall within a given term. */
export function eventsInTerm(termId: string): CalEvent[] {
  const term = terms.find((t) => t.id === termId);
  if (!term) return [];
  return calendarEvents.filter((e) => {
    const ad = e.date.ad;
    return ad >= term.start.ad && ad <= term.end.ad;
  });
}

/** Returns events that occur on a specific Bikram Sambat date. */
export function eventsOnBs(bsDate: string): CalEvent[] {
  return calendarEvents.filter((e) => e.date.bs === bsDate);
}

/** Finds the next event of given kind(s) after today. */
export function nextOfKind(kinds: EventKind[]): CalEvent | null {
  const todayAd = new Date().toISOString().slice(0, 10);
  const upcoming = calendarEvents
    .filter((e) => kinds.includes(e.kind) && e.date.ad >= todayAd)
    .sort((a, b) => a.date.ad.localeCompare(b.date.ad));
  return upcoming[0] ?? null;
}

/** Returns today's date in YYYY-MM-DD format. */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
