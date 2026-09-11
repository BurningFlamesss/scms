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

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatDate(value?: string | Date, opts: { withYear?: boolean } = {}): string {
  if (!value) return "—";
  const date = typeof value === "string" ? (value.length <= 10 ? parseKey(value) : new Date(value)) : value;
  if (Number.isNaN(date.getTime())) return "—";
  const base = `${MONTHS[date.getMonth()]} ${date.getDate()}`;
  return opts.withYear === false ? base : `${base}, ${date.getFullYear()}`;
}

export function formatDateTime(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${formatDate(date)} · ${date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function formatTime(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function relativeTime(value?: string): string {
  if (!value) return "—";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 1) return "just now";
  if (Math.abs(mins) < 60) return `${mins < 0 ? "in " : ""}${Math.abs(mins)}m${mins < 0 ? "" : " ago"}`;
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return `${hours < 0 ? "in " : ""}${Math.abs(hours)}h${hours < 0 ? "" : " ago"}`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return `${days < 0 ? "in " : ""}${Math.abs(days)}d${days < 0 ? "" : " ago"}`;
  return formatDate(value);
}

export function dayLabel(key: string): string {
  const date = parseKey(key);
  const today = todayKey();
  if (key === today) return "Today";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === toDateKey(yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function titleCase(value: string): string {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}

export function avatarFor(name: string): string {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    name,
  )}&backgroundType=gradientLinear&fontWeight=600`;
}

export function photoFor(seed: string, w = 800, h = 600): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Last N weekdays (most recent first), skipping weekends. */
export function recentWeekdays(count: number, from = new Date()): string[] {
  const out: string[] = [];
  const cursor = new Date(from);
  while (out.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) out.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }
  return out;
}

export function isWeekend(key: string): boolean {
  const day = parseKey(key).getDay();
  return day === 0 || day === 6;
}

export function downloadTextFile(filename: string, content: string, mime = "text/csv"): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  if (!rows.length) return "";
  const keys = columns ?? Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const str = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  return [keys.join(","), ...rows.map((row) => keys.map((k) => escape(row[k])).join(","))].join("\n");
}
