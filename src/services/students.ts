import type { Actor, Paginated, Student, StudentStatus } from "@/types";
import { db, latency, matches, nowIso, paginate, persist, sortRows, uid } from "@/lib/db";
import { recordAudit } from "@/services/audit";
import { pushNotification } from "@/services/notifications";
import { avatarFor } from "@/lib/format";

export interface StudentQuery {
  search?: string;
  grade?: string;
  section?: string;
  status?: string;
  admissionYear?: string;
  branchId?: string;
  classId?: string;
  sort?: string;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

function fullName(s: { firstName: string; lastName: string }): string {
  return `${s.firstName} ${s.lastName}`;
}

export async function listStudents(query: StudentQuery = {}): Promise<Paginated<Student>> {
  await latency();
  const {
    search = "",
    grade = "all",
    section = "all",
    status = "all",
    admissionYear = "all",
    branchId = "all",
    classId,
    sort = "firstName",
    dir = "asc",
    page = 1,
    pageSize = 10,
  } = query;

  const filtered = db().students.filter((s) => {
    if (!matches(search, fullName(s), s.admissionNo, s.guardian.name, s.email)) return false;
    if (grade !== "all" && s.grade !== grade) return false;
    if (section !== "all" && s.section !== section) return false;
    if (status !== "all" && s.status !== status) return false;
    if (admissionYear !== "all" && String(s.admissionYear) !== admissionYear) return false;
    if (branchId !== "all" && s.branchId !== branchId) return false;
    if (classId && s.classId !== classId) return false;
    return true;
  });

  return paginate(sortRows(filtered, sort, dir), page, pageSize);
}

export async function getStudent(id: string): Promise<Student | null> {
  await latency(200);
  return db().students.find((s) => s.id === id) ?? null;
}

export function studentFilterOptions() {
  const students = db().students;
  return {
    grades: Array.from(new Set(students.map((s) => s.grade))).sort(),
    sections: Array.from(new Set(students.map((s) => s.section))).sort(),
    years: Array.from(new Set(students.map((s) => String(s.admissionYear)))).sort().reverse(),
    branches: db().branches.map((b) => ({ value: b.id, label: b.name })),
  };
}

export interface StudentInput {
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  dateOfBirth: string;
  classId: string;
  branchId: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  bloodGroup?: string;
  guardianName: string;
  guardianRelation: "Father" | "Mother" | "Guardian";
  guardianPhone: string;
  guardianEmail: string;
}

function buildStudent(input: StudentInput): Student {
  const cls = db().classes.find((c) => c.id === input.classId) ?? db().classes[0];
  const name = `${input.firstName} ${input.lastName}`;
  const year = new Date().getFullYear();
  const rollNo = db().students.filter((s) => s.classId === cls.id).length + 1;
  return {
    id: uid("stu"),
    admissionNo: `NFA-${year}-${String(1000 + db().students.length + 1).slice(-4)}`,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    avatarUrl: avatarFor(name),
    gender: input.gender,
    dateOfBirth: input.dateOfBirth,
    grade: cls.grade,
    section: cls.section,
    classId: cls.id,
    rollNo,
    branchId: input.branchId || cls.branchId,
    admissionYear: year,
    admissionDate: new Date().toISOString().slice(0, 10),
    status: "active",
    email: input.email?.trim() || `${input.firstName}.${input.lastName}@student.northfield.edu`.toLowerCase(),
    phone: input.phone?.trim() || input.guardianPhone,
    address: input.address?.trim() || "—",
    city: input.city?.trim() || "Northfield",
    bloodGroup: input.bloodGroup || "O+",
    nationality: "American",
    guardian: {
      id: uid("grd"),
      name: input.guardianName.trim(),
      relation: input.guardianRelation,
      phone: input.guardianPhone,
      email: input.guardianEmail,
      invited: false,
    },
    emergencyContact: input.guardianPhone,
    houseName: ["Aurora", "Meridian", "Summit", "Vanguard"][db().students.length % 4],
    attendanceRate: 100,
    feeBalance: 0,
    documents: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

function syncClassCounts(): void {
  db().classes.forEach((c) => {
    c.studentCount = db().students.filter((s) => s.classId === c.id && s.status === "active").length;
  });
  db().branches.forEach((b) => {
    b.studentCount = db().students.filter((s) => s.branchId === b.id && s.status === "active").length;
  });
}

export async function createStudent(input: StudentInput, actor: Actor): Promise<Student> {
  await latency(420);
  const student = buildStudent(input);
  db().students.unshift(student);
  syncClassCounts();
  persist();
  recordAudit({
    actor,
    action: "created",
    resourceType: "student",
    resourceId: student.id,
    resourceLabel: fullName(student),
    summary: `Enrolled ${fullName(student)} into ${student.grade} · ${student.section}`,
  });
  pushNotification({
    kind: "user",
    title: "Student enrolled",
    body: `${fullName(student)} was added to ${student.grade} · ${student.section}.`,
    severity: "success",
    href: `/students/${student.id}`,
    actorName: actor.name,
  });
  return student;
}

export async function updateStudent(id: string, patch: Partial<Student>, actor: Actor): Promise<Student> {
  await latency(360);
  const student = db().students.find((s) => s.id === id);
  if (!student) throw new Error("Student not found");
  Object.assign(student, patch, { updatedAt: nowIso() });
  if (patch.classId) {
    const cls = db().classes.find((c) => c.id === patch.classId);
    if (cls) {
      student.grade = cls.grade;
      student.section = cls.section;
    }
  }
  syncClassCounts();
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "student",
    resourceId: student.id,
    resourceLabel: fullName(student),
    summary: `Updated ${fullName(student)}’s record`,
  });
  return student;
}

export async function setStudentStatus(
  id: string,
  status: StudentStatus,
  actor: Actor,
): Promise<Student> {
  await latency(320);
  const student = db().students.find((s) => s.id === id);
  if (!student) throw new Error("Student not found");
  student.status = status;
  student.updatedAt = nowIso();
  syncClassCounts();
  persist();
  recordAudit({
    actor,
    action: "status_changed",
    resourceType: "student",
    resourceId: student.id,
    resourceLabel: fullName(student),
    summary: `Changed ${fullName(student)}’s status to ${status.replace(/^\w/, (c) => c.toUpperCase())}`,
  });
  return student;
}

export async function transferStudent(id: string, classId: string, actor: Actor): Promise<Student> {
  await latency(360);
  const student = db().students.find((s) => s.id === id);
  const cls = db().classes.find((c) => c.id === classId);
  if (!student || !cls) throw new Error("Student or class not found");
  const from = `${student.grade} · ${student.section}`;
  student.classId = cls.id;
  student.grade = cls.grade;
  student.section = cls.section;
  student.rollNo = db().students.filter((s) => s.classId === cls.id).length;
  student.updatedAt = nowIso();
  syncClassCounts();
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "student",
    resourceId: student.id,
    resourceLabel: fullName(student),
    summary: `Transferred ${fullName(student)} from ${from} to ${cls.name}`,
  });
  return student;
}

export async function deleteStudent(id: string, actor: Actor): Promise<void> {
  await latency(320);
  const index = db().students.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Student not found");
  const [removed] = db().students.splice(index, 1);
  syncClassCounts();
  persist();
  recordAudit({
    actor,
    action: "deleted",
    resourceType: "student",
    resourceId: removed.id,
    resourceLabel: fullName(removed),
    summary: `Deleted student record for ${fullName(removed)}`,
  });
}

export async function inviteGuardian(id: string, actor: Actor): Promise<Student> {
  await latency(400);
  const student = db().students.find((s) => s.id === id);
  if (!student) throw new Error("Student not found");
  student.guardian.invited = true;
  const existing = db().users.find((u) => u.email === student.guardian.email);
  if (!existing) {
    db().users.unshift({
      id: uid("usr"),
      name: student.guardian.name,
      email: student.guardian.email,
      avatarUrl: avatarFor(student.guardian.name),
      role: "guardian",
      profileType: "guardian",
      profileId: student.guardian.id,
      profileLabel: `${student.guardian.relation} of ${fullName(student)}`,
      accountStatus: "invited",
      invitationStatus: "pending",
      invitedAt: nowIso(),
      invitationExpiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      emailVerified: false,
      branchId: student.branchId,
      createdAt: nowIso(),
    });
  }
  persist();
  recordAudit({
    actor,
    action: "invited",
    resourceType: "user",
    resourceId: student.guardian.id,
    resourceLabel: student.guardian.name,
    summary: `Invited ${student.guardian.name} as guardian of ${fullName(student)}`,
  });
  pushNotification({
    kind: "invitation",
    title: "Guardian invited",
    body: `${student.guardian.name} was invited to the guardian portal.`,
    severity: "info",
    href: "/users",
    actorName: actor.name,
  });
  return student;
}

export type BulkStudentAction = "deactivate" | "graduate" | "invite_guardian" | "delete";

export async function bulkStudentAction(
  ids: string[],
  action: BulkStudentAction,
  actor: Actor,
): Promise<number> {
  await latency(520);
  let affected = 0;
  ids.forEach((id) => {
    const student = db().students.find((s) => s.id === id);
    if (!student) return;
    affected += 1;
    if (action === "deactivate") student.status = "inactive";
    if (action === "graduate") student.status = "graduated";
    if (action === "invite_guardian") student.guardian.invited = true;
    student.updatedAt = nowIso();
  });
  if (action === "delete") {
    const collection = db().students;
    ids.forEach((id) => {
      const idx = collection.findIndex((s) => s.id === id);
      if (idx >= 0) collection.splice(idx, 1);
    });
  }
  syncClassCounts();
  persist();
  const labels: Record<BulkStudentAction, string> = {
    deactivate: "Deactivated",
    graduate: "Graduated",
    invite_guardian: "Invited guardians for",
    delete: "Deleted",
  };
  recordAudit({
    actor,
    action: action === "delete" ? "deleted" : "status_changed",
    resourceType: "student",
    resourceId: "bulk",
    resourceLabel: `${affected} students`,
    summary: `${labels[action]} ${affected} student${affected === 1 ? "" : "s"}`,
  });
  return affected;
}

export interface StudentImportRow {
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
  gender?: string;
  dateOfBirth?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
}

export async function importStudents(
  rows: StudentImportRow[],
  actor: Actor,
): Promise<{ created: number; skipped: number }> {
  await latency(700);
  let created = 0;
  let skipped = 0;
  rows.forEach((row) => {
    const cls =
      db().classes.find((c) => c.grade === row.grade && c.section === row.section) ??
      db().classes.find((c) => c.grade === row.grade);
    if (!cls) {
      skipped += 1;
      return;
    }
    const student = buildStudent({
      firstName: row.firstName,
      lastName: row.lastName,
      gender: row.gender === "male" || row.gender === "female" ? row.gender : "female",
      dateOfBirth: row.dateOfBirth || "2012-01-01",
      classId: cls.id,
      branchId: cls.branchId,
      guardianName: row.guardianName,
      guardianRelation: "Guardian",
      guardianPhone: row.guardianPhone,
      guardianEmail: row.guardianEmail || `${row.guardianName.split(" ").join(".")}@familymail.com`.toLowerCase(),
    });
    db().students.unshift(student);
    created += 1;
  });
  syncClassCounts();
  persist();
  recordAudit({
    actor,
    action: "imported",
    resourceType: "student",
    resourceId: "import",
    resourceLabel: `${created} students`,
    summary: `Imported ${created} students from CSV`,
  });
  pushNotification({
    kind: "system",
    title: "CSV import finished",
    body: `${created} students imported${skipped ? `, ${skipped} skipped` : ""}.`,
    severity: created ? "success" : "warning",
    href: "/students",
    actorName: actor.name,
  });
  return { created, skipped };
}

export function findDuplicateStudents(rows: StudentImportRow[]): Set<number> {
  const existing = new Set(
    db().students.map((s) => `${s.firstName} ${s.lastName} ${s.grade}`.toLowerCase()),
  );
  const seen = new Set<string>();
  const dupes = new Set<number>();
  rows.forEach((row, i) => {
    const key = `${row.firstName} ${row.lastName} ${row.grade}`.toLowerCase();
    if (existing.has(key) || seen.has(key)) dupes.add(i);
    seen.add(key);
  });
  return dupes;
}
