import type {
  AcademicYear,
  Album,
  AppNotification,
  Application,
  AttendanceDayPoint,
  AttendanceRecord,
  AuditEvent,
  Branch,
  Course,
  Driver,
  EnrollmentPoint,
  FeeStructure,
  Invoice,
  Notice,
  PaymentTransaction,
  RoleDefinition,
  SchoolClass,
  SchoolEvent,
  SchoolSettings,
  SessionRecord,
  StaffMember,
  Student,
  TransportRoute,
  UserAccount,
  Vehicle,
  WebsitePage,
} from "@/types";
import { buildSeed } from "@/mock/seed";
import { todayKey } from "@/lib/format";

export interface Collections {
  meta: { seedDate: string; version: number };
  branches: Branch[];
  academicYears: AcademicYear[];
  classes: SchoolClass[];
  courses: Course[];
  staff: StaffMember[];
  students: Student[];
  users: UserAccount[];
  roles: RoleDefinition[];
  sessions: SessionRecord[];
  attendance: AttendanceRecord[];
  attendanceTrend: AttendanceDayPoint[];
  enrollmentTrend: EnrollmentPoint[];
  notices: Notice[];
  events: SchoolEvent[];
  albums: Album[];
  applications: Application[];
  drivers: Driver[];
  routes: TransportRoute[];
  vehicles: Vehicle[];
  feeStructures: FeeStructure[];
  invoices: Invoice[];
  payments: PaymentTransaction[];
  notifications: AppNotification[];
  auditEvents: AuditEvent[];
  websitePages: WebsitePage[];
  settings: SchoolSettings;
}

const STORAGE_KEY = "scms.db.v4";
const SCHEMA_VERSION = 4;

let cache: Collections | null = null;

function hydrate(): Collections {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Collections;
      // The demo dataset is anchored to "today" (attendance registers, upcoming
      // events, due dates). If the schema changed or the day rolled over we
      // re-seed so the dashboard always reads as a live school day.
      if (parsed?.meta?.version === SCHEMA_VERSION && parsed.meta.seedDate === todayKey()) {
        cache = parsed;
        return cache;
      }
    }
  } catch {
    /* corrupted store — fall through to a fresh seed */
  }
  cache = buildSeed();
  persist();
  return cache;
}

export function db(): Collections {
  return hydrate();
}

export function persist(): void {
  if (!cache) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* storage full or unavailable — in-memory state still works this session */
  }
}

export function resetDb(): Collections {
  window.localStorage.removeItem(STORAGE_KEY);
  cache = null;
  return hydrate();
}

/** Simulated network latency so loading states are real, not decorative. */
export function latency(ms = 0): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Case-insensitive "contains" match across several fields. */
export function matches(term: string, ...fields: (string | number | undefined)[]): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((f) => String(f ?? "").toLowerCase().includes(needle));
}

export function paginate<T>(rows: T[], page = 1, pageSize = 10) {
  const total = rows.length;
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total, page: safePage, pageSize };
}

export function sortRows<T>(rows: T[], key: keyof T | string, dir: "asc" | "desc" = "asc"): T[] {
  const factor = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[key as string];
    const bv = (b as Record<string, unknown>)[key as string];
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * factor;
    return String(av ?? "").localeCompare(String(bv ?? "")) * factor;
  });
}
