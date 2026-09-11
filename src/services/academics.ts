import type {
  Actor,
  AttendanceDayPoint,
  AttendanceRecord,
  AttendanceState,
  Course,
  SchoolClass,
  StaffMember,
  Student,
} from "@/types";
import { db, latency, matches, nowIso, persist, uid } from "@/lib/db";
import { recordAudit } from "@/services/audit";
import { todayKey } from "@/lib/format";

// ------------------------------------------------------------------- classes

export interface ClassQuery {
  search?: string;
  grade?: string;
  branchId?: string;
  academicYearId?: string;
}

export async function listClasses(query: ClassQuery = {}): Promise<SchoolClass[]> {
  await latency(220);
  const { search = "", grade = "all", branchId = "all", academicYearId = "all" } = query;
  return db().classes.filter((c) => {
    if (!matches(search, c.name, c.roomNo, c.grade)) return false;
    if (grade !== "all" && c.grade !== grade) return false;
    if (branchId !== "all" && c.branchId !== branchId) return false;
    if (academicYearId !== "all" && c.academicYearId !== academicYearId) return false;
    return true;
  });
}

export interface ClassDetail {
  cls: SchoolClass;
  teacher: StaffMember | null;
  students: Student[];
  courses: Course[];
  attendance: { rate: number; present: number; absent: number; late: number; excused: number };
}

export async function getClassDetail(id: string): Promise<ClassDetail | null> {
  await latency(240);
  const cls = db().classes.find((c) => c.id === id);
  if (!cls) return null;
  const students = db().students.filter((s) => s.classId === cls.id);
  const today = todayKey();
  const records = db().attendance.filter((a) => a.classId === cls.id && a.date === today);
  const count = (state: AttendanceState) => records.filter((r) => r.state === state).length;
  const present = count("present");
  return {
    cls,
    teacher: db().staff.find((s) => s.id === cls.classTeacherId) ?? null,
    students,
    courses: db().courses.filter((c) => cls.courseIds.includes(c.id)),
    attendance: {
      rate: records.length ? Math.round(((present + count("late")) / records.length) * 100) : 0,
      present,
      absent: count("absent"),
      late: count("late"),
      excused: count("excused"),
    },
  };
}

export interface ClassInput {
  grade: string;
  section: string;
  classTeacherId: string;
  roomNo: string;
  capacity: number;
  branchId: string;
  academicYearId: string;
}

export async function createClass(input: ClassInput, actor: Actor): Promise<SchoolClass> {
  await latency(380);
  const cls: SchoolClass = {
    id: uid("cls"),
    name: `${input.grade} · ${input.section}`,
    grade: input.grade,
    section: input.section,
    classTeacherId: input.classTeacherId,
    roomNo: input.roomNo,
    capacity: input.capacity,
    studentCount: 0,
    courseIds: db().courses.filter((c) => !c.isElective).slice(0, 6).map((c) => c.id),
    academicYearId: input.academicYearId,
    branchId: input.branchId,
    schedule: [],
    attendanceRate: 0,
  };
  db().classes.push(cls);
  persist();
  recordAudit({
    actor,
    action: "created",
    resourceType: "class",
    resourceId: cls.id,
    resourceLabel: cls.name,
    summary: `Created class ${cls.name} in room ${cls.roomNo}`,
  });
  return cls;
}

export async function updateClass(id: string, patch: Partial<SchoolClass>, actor: Actor): Promise<SchoolClass> {
  await latency(320);
  const cls = db().classes.find((c) => c.id === id);
  if (!cls) throw new Error("Class not found");
  Object.assign(cls, patch);
  if (patch.grade || patch.section) cls.name = `${cls.grade} · ${cls.section}`;
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "class",
    resourceId: cls.id,
    resourceLabel: cls.name,
    summary: `Updated ${cls.name}`,
  });
  return cls;
}

// ------------------------------------------------------------------- courses

export interface CourseQuery {
  search?: string;
  department?: string;
  elective?: string;
}

export async function listCourses(query: CourseQuery = {}): Promise<Course[]> {
  await latency(220);
  const { search = "", department = "all", elective = "all" } = query;
  return db().courses.filter((c) => {
    if (!matches(search, c.name, c.code, c.department)) return false;
    if (department !== "all" && c.department !== department) return false;
    if (elective !== "all" && String(c.isElective) !== elective) return false;
    return true;
  });
}

export interface CourseDetail {
  course: Course;
  teachers: StaffMember[];
  classes: SchoolClass[];
}

export async function getCourseDetail(id: string): Promise<CourseDetail | null> {
  await latency(220);
  const course = db().courses.find((c) => c.id === id);
  if (!course) return null;
  return {
    course,
    teachers: db().staff.filter((s) => course.teacherIds.includes(s.id)),
    classes: db().classes.filter((c) => course.classIds.includes(c.id)),
  };
}

export interface CourseInput {
  code: string;
  name: string;
  department: string;
  description: string;
  credits: number;
  weeklyHours: number;
  isElective: boolean;
  teacherIds: string[];
}

export async function createCourse(input: CourseInput, actor: Actor): Promise<Course> {
  await latency(380);
  const course: Course = {
    id: uid("crs"),
    ...input,
    classIds: [],
    syllabus: [],
    createdAt: nowIso(),
  };
  db().courses.unshift(course);
  persist();
  recordAudit({
    actor,
    action: "created",
    resourceType: "course",
    resourceId: course.id,
    resourceLabel: course.name,
    summary: `Created subject ${course.name} (${course.code})`,
  });
  return course;
}

export async function updateCourse(id: string, patch: Partial<Course>, actor: Actor): Promise<Course> {
  await latency(300);
  const course = db().courses.find((c) => c.id === id);
  if (!course) throw new Error("Subject not found");
  Object.assign(course, patch);
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "course",
    resourceId: course.id,
    resourceLabel: course.name,
    summary: `Updated subject ${course.name}`,
  });
  return course;
}

export function courseDepartments(): string[] {
  return Array.from(new Set(db().courses.map((c) => c.department))).sort();
}

// ---------------------------------------------------------------- attendance

export interface RegisterEntry {
  student: Student;
  state: AttendanceState | null;
  note?: string;
}

export interface ClassRegister {
  cls: SchoolClass;
  date: string;
  entries: RegisterEntry[];
  marked: boolean;
  markedBy?: string;
  markedAt?: string;
}

export async function getClassRegister(classId: string, date: string): Promise<ClassRegister | null> {
  await latency(240);
  const cls = db().classes.find((c) => c.id === classId);
  if (!cls) return null;
  const students = db().students.filter((s) => s.classId === classId && s.status === "active");
  const records = db().attendance.filter((a) => a.classId === classId && a.date === date);
  const entries: RegisterEntry[] = students
    .sort((a, b) => a.rollNo - b.rollNo)
    .map((student) => {
      const record = records.find((r) => r.personId === student.id);
      return { student, state: record?.state ?? null, note: record?.note };
    });
  return {
    cls,
    date,
    entries,
    marked: records.length > 0,
    markedBy: records[0]?.markedBy,
    markedAt: records[0]?.markedAt,
  };
}

export async function saveClassRegister(
  classId: string,
  date: string,
  entries: { studentId: string; state: AttendanceState; note?: string }[],
  actor: Actor,
): Promise<number> {
  await latency(460);
  const cls = db().classes.find((c) => c.id === classId);
  if (!cls) throw new Error("Class not found");
  const collection = db().attendance;
  entries.forEach((entry) => {
    const existing = collection.find(
      (a) => a.personId === entry.studentId && a.date === date && a.personType === "student",
    );
    if (existing) {
      existing.state = entry.state;
      existing.note = entry.note;
      existing.markedBy = actor.name;
      existing.markedAt = nowIso();
    } else {
      collection.push({
        id: uid("att"),
        date,
        personType: "student",
        personId: entry.studentId,
        classId,
        state: entry.state,
        note: entry.note,
        markedBy: actor.name,
        markedAt: nowIso(),
      });
    }
  });
  // keep the roll-up in sync
  const students = db().students.filter((s) => s.classId === classId);
  students.forEach((s) => {
    const own = collection.filter((a) => a.personId === s.id && a.personType === "student");
    if (own.length) {
      const good = own.filter((a) => a.state === "present" || a.state === "late").length;
      s.attendanceRate = Math.round((good / own.length) * 100);
    }
  });
  const dayRecords = collection.filter((a) => a.classId === classId && a.date === date);
  const good = dayRecords.filter((a) => a.state === "present" || a.state === "late").length;
  cls.attendanceRate = dayRecords.length ? Math.round((good / dayRecords.length) * 100) : cls.attendanceRate;
  persist();
  recordAudit({
    actor,
    action: "marked_attendance",
    resourceType: "class",
    resourceId: classId,
    resourceLabel: cls.name,
    summary: `Marked attendance for ${cls.name} (${entries.length} students)`,
  });
  return entries.length;
}

export interface AttendanceOverview {
  date: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  unmarked: number;
  rate: number;
  classes: {
    cls: SchoolClass;
    marked: boolean;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
    total: number;
  }[];
}

export async function getAttendanceOverview(date = todayKey()): Promise<AttendanceOverview> {
  await latency(280);
  const activeStudents = db().students.filter((s) => s.status === "active");
  const records = db().attendance.filter((a) => a.date === date && a.personType === "student");
  const count = (state: AttendanceState) => records.filter((r) => r.state === state).length;
  const present = count("present");
  const late = count("late");

  const classes = db().classes.map((cls) => {
    const own = records.filter((r) => r.classId === cls.id);
    const total = activeStudents.filter((s) => s.classId === cls.id).length;
    const p = own.filter((r) => r.state === "present").length;
    const l = own.filter((r) => r.state === "late").length;
    return {
      cls,
      marked: own.length > 0,
      present: p,
      absent: own.filter((r) => r.state === "absent").length,
      late: l,
      excused: own.filter((r) => r.state === "excused").length,
      total,
      rate: own.length ? Math.round(((p + l) / own.length) * 100) : 0,
    };
  });

  return {
    date,
    total: activeStudents.length,
    present,
    absent: count("absent"),
    late,
    excused: count("excused"),
    unmarked: Math.max(0, activeStudents.length - records.length),
    rate: records.length ? Math.round(((present + late) / records.length) * 1000) / 10 : 0,
    classes,
  };
}

export async function getAttendanceTrend(): Promise<AttendanceDayPoint[]> {
  await latency(200);
  return db().attendanceTrend;
}

export interface StaffRegisterEntry {
  staff: StaffMember;
  state: AttendanceState | null;
}

export async function getStaffRegister(date = todayKey()): Promise<StaffRegisterEntry[]> {
  await latency(240);
  const records = db().attendance.filter((a) => a.date === date && a.personType === "staff");
  return db()
    .staff.filter((s) => s.employmentStatus === "active")
    .map((staff) => ({
      staff,
      state: records.find((r) => r.personId === staff.id)?.state ?? null,
    }));
}

export async function saveStaffRegister(
  date: string,
  entries: { staffId: string; state: AttendanceState }[],
  actor: Actor,
): Promise<number> {
  await latency(420);
  const collection = db().attendance;
  entries.forEach((entry) => {
    const existing = collection.find(
      (a) => a.personId === entry.staffId && a.date === date && a.personType === "staff",
    );
    if (existing) {
      existing.state = entry.state;
      existing.markedBy = actor.name;
      existing.markedAt = nowIso();
    } else {
      collection.push({
        id: uid("att"),
        date,
        personType: "staff",
        personId: entry.staffId,
        state: entry.state,
        markedBy: actor.name,
        markedAt: nowIso(),
      });
    }
  });
  persist();
  recordAudit({
    actor,
    action: "marked_attendance",
    resourceType: "staff",
    resourceId: "bulk",
    resourceLabel: `${entries.length} staff`,
    summary: `Marked staff attendance for ${entries.length} employees`,
  });
  return entries.length;
}

export interface StudentAttendanceSummary {
  rate: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  records: AttendanceRecord[];
}

export async function getStudentAttendance(studentId: string): Promise<StudentAttendanceSummary> {
  await latency(220);
  const records = db()
    .attendance.filter((a) => a.personId === studentId && a.personType === "student")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const count = (state: AttendanceState) => records.filter((r) => r.state === state).length;
  const present = count("present");
  const late = count("late");
  return {
    rate: records.length ? Math.round(((present + late) / records.length) * 100) : 0,
    present,
    absent: count("absent"),
    late,
    excused: count("excused"),
    records,
  };
}

export interface AttendanceStats {
  byGrade: { grade: string; rate: number; students: number }[];
  chronic: { student: Student; rate: number }[];
  weekly: { day: string; rate: number }[];
}

export async function getAttendanceStats(): Promise<AttendanceStats> {
  await latency(300);
  const grades = Array.from(new Set(db().classes.map((c) => c.grade)));
  const byGrade = grades.map((grade) => {
    const students = db().students.filter((s) => s.grade === grade && s.status === "active");
    const rate = students.length
      ? Math.round(students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length)
      : 0;
    return { grade, rate, students: students.length };
  });
  const chronic = db()
    .students.filter((s) => s.status === "active" && s.attendanceRate < 82)
    .sort((a, b) => a.attendanceRate - b.attendanceRate)
    .slice(0, 8)
    .map((student) => ({ student, rate: student.attendanceRate }));
  const weekly = db()
    .attendanceTrend.slice(-5)
    .map((point) => ({
      day: new Date(point.date).toLocaleDateString(undefined, { weekday: "short" }),
      rate: point.rate,
    }));
  return { byGrade, chronic, weekly };
}
