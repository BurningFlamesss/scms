import type { Weekday } from "../types";

export const WEEKDAYS: Weekday[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const toDate = (iso: string): Date => new Date(`${iso}T00:00:00`);

/** "2026-09-01" -> "01 Sep 2026" */
export function formatAd(iso: string): string {
  const d = toDate(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  return `${day} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "2026-09-01" -> "Tuesday" */
export function weekdayOf(iso: string): string {
  const d = toDate(iso);
  if (Number.isNaN(d.getTime())) return "";
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][d.getDay()];
}

/** Today's weekday, clamped to the six-day Nepali school week. */
export function todaySchoolWeekday(): Weekday | null {
  const idx = new Date().getDay();
  if (idx === 6) return null; // Saturday is the weekly holiday
  return WEEKDAYS[idx];
}

/** Whole days from now until the given date (negative once past). */
export function daysUntil(iso: string): number {
  const target = toDate(iso).getTime();
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  return Math.round((target - startOfToday) / 86_400_000);
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  closed: boolean;
  totalMs: number;
}

/** Live countdown parts to 23:59:59 of the deadline day. */
export function countdownTo(iso: string): Countdown {
  const end = new Date(`${iso}T23:59:59`).getTime();
  const diff = end - Date.now();
  if (Number.isNaN(end) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, closed: true, totalMs: 0 };
  }
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    closed: false,
    totalMs: diff,
  };
}

/** "Today", "Yesterday", "4 days ago", "in 6 days" */
export function relativeDay(iso: string): string {
  const diff = daysUntil(iso);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) {
    const n = Math.abs(diff);
    if (n < 30) return `${n} days ago`;
    const months = Math.round(n / 30);
    return months <= 1 ? "Last month" : `${months} months ago`;
  }
  if (diff < 30) return `in ${diff} days`;
  const months = Math.round(diff / 30);
  return months <= 1 ? "next month" : `in ${months} months`;
}

/** Dual-calendar line used across notices and scholarships. */
export function dualDate(bs: string, ad: string): string {
  return `${bs} BS  ·  ${formatAd(ad)}`;
}

/** Was the item published within the last `days` days? */
export function isFresh(iso: string, days = 10): boolean {
  const diff = daysUntil(iso);
  return diff <= 0 && diff > -days;
}

export function formatNpr(amount: number): string {
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

/** "08:45" -> minutes since midnight */
export function minutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => Number.parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return -1;
  return h * 60 + m;
}

export function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
