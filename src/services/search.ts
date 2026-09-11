import type { SearchResult } from "@/types";
import { db, latency } from "@/lib/db";

/**
 * Global search across the entities an administrator actually looks for.
 * Backed by the local store today; the shape matches a `/api/search` response.
 */
export async function globalSearch(term: string, limitPerType = 4): Promise<SearchResult[]> {
  await latency(140);
  const needle = term.trim().toLowerCase();
  if (needle.length < 1) return [];
  const results: SearchResult[] = [];

  const hit = (haystack: string) => haystack.toLowerCase().includes(needle);

  db()
    .students.filter((s) => hit(`${s.firstName} ${s.lastName} ${s.admissionNo} ${s.guardian.name}`))
    .slice(0, limitPerType)
    .forEach((s) =>
      results.push({
        id: s.id,
        type: "student",
        title: `${s.firstName} ${s.lastName}`,
        subtitle: `${s.admissionNo} · ${s.grade} · ${s.section}`,
        href: `/students/${s.id}`,
        avatarUrl: s.avatarUrl,
      }),
    );

  db()
    .staff.filter((s) => hit(`${s.firstName} ${s.lastName} ${s.employeeId} ${s.designation} ${s.department}`))
    .slice(0, limitPerType)
    .forEach((s) =>
      results.push({
        id: s.id,
        type: "staff",
        title: `${s.firstName} ${s.lastName}`,
        subtitle: `${s.designation} · ${s.department}`,
        href: `/staff/${s.id}`,
        avatarUrl: s.avatarUrl,
      }),
    );

  db()
    .notices.filter((n) => hit(`${n.title} ${n.summary}`))
    .slice(0, limitPerType)
    .forEach((n) =>
      results.push({
        id: n.id,
        type: "notice",
        title: n.title,
        subtitle: `${n.status} · ${n.priority} priority`,
        href: `/notices/${n.id}`,
      }),
    );

  db()
    .events.filter((e) => hit(`${e.title} ${e.location} ${e.category}`))
    .slice(0, limitPerType)
    .forEach((e) =>
      results.push({
        id: e.id,
        type: "event",
        title: e.title,
        subtitle: `${e.category} · ${e.startDate}`,
        href: `/events/${e.id}`,
      }),
    );

  db()
    .classes.filter((c) => hit(`${c.name} ${c.roomNo}`))
    .slice(0, limitPerType)
    .forEach((c) =>
      results.push({
        id: c.id,
        type: "class",
        title: c.name,
        subtitle: `Room ${c.roomNo} · ${c.studentCount} students`,
        href: `/classes/${c.id}`,
      }),
    );

  db()
    .courses.filter((c) => hit(`${c.name} ${c.code} ${c.department}`))
    .slice(0, limitPerType)
    .forEach((c) =>
      results.push({
        id: c.id,
        type: "course",
        title: c.name,
        subtitle: `${c.code} · ${c.department}`,
        href: `/courses/${c.id}`,
      }),
    );

  db()
    .websitePages.filter((p) => hit(`${p.title} ${p.path}`))
    .slice(0, limitPerType)
    .forEach((p) =>
      results.push({
        id: p.id,
        type: "page",
        title: `${p.title} page`,
        subtitle: `Website · ${p.status}`,
        href: `/website?page=${p.key}`,
      }),
    );

  db()
    .applications.filter((a) => hit(`${a.applicantName} ${a.applicationNo}`))
    .slice(0, limitPerType)
    .forEach((a) =>
      results.push({
        id: a.id,
        type: "application",
        title: a.applicantName,
        subtitle: `${a.applicationNo} · ${a.status}`,
        href: `/admissions/${a.id}`,
        avatarUrl: a.avatarUrl,
      }),
    );

  return results;
}
