import type {
  AcademicYear,
  Album,
  Application,
  AppNotification,
  AttendanceDayPoint,
  AttendanceRecord,
  AttendanceState,
  AuditEvent,
  Branch,
  ContentBlock,
  Course,
  Driver,
  DocumentFile,
  EnrollmentPoint,
  EventCategory,
  EventStatus,
  FeeStructure,
  Guardian,
  Invoice,
  Notice,
  NoticePriority,
  NoticeStatus,
  PaymentTransaction,
  RoleDefinition,
  SchedulePeriod,
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
import { chance, createRng, intBetween, pick, pickMany, type Rng } from "@/lib/rng";
import { addDays, avatarFor, photoFor, recentWeekdays, toDateKey, todayKey } from "@/lib/format";
import { stopCoordinate } from "@/lib/geo";
import type { Collections } from "@/lib/db";

const FIRST_M = [
  "Aarav", "Rohan", "Ibrahim", "Noah", "Kabir", "Ethan", "Zayd", "Liam", "Arjun", "Musa",
  "Daniel", "Omar", "Elias", "Kian", "Theo", "Jonah", "Idris", "Caleb", "Ravi", "Samuel",
];
const FIRST_F = [
  "Aisha", "Maya", "Zara", "Amara", "Hana", "Leah", "Ananya", "Sofia", "Iman", "Nora",
  "Elena", "Priya", "Fatima", "Clara", "Ivy", "Rania", "Sena", "Naomi", "Layla", "Grace",
];
const LAST = [
  "Rahman", "Okafor", "Silva", "Farouk", "Mensah", "Iqbal", "Adeyemi", "Nair", "Haddad", "Bello",
  "Duarte", "Kowalski", "Whitfield", "Ibarra", "Kimura", "Ferreira", "Novak", "Osei", "Delacroix", "Sandoval",
];
const STREETS = ["Maple", "Oak", "Birch", "Cedar", "Aspen", "Juniper", "Willow", "Linden"];
const CITIES = ["Northfield", "Riverside", "Ashbourne", "Kingsmere"];
const BLOOD = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+"];
const HOUSES = ["Aurora", "Meridian", "Summit", "Vanguard"];
const OCCUPATIONS = ["Engineer", "Physician", "Architect", "Entrepreneur", "Teacher", "Accountant", "Designer", "Logistics Manager"];

const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

const DEPARTMENTS = [
  "Mathematics", "Science", "Languages", "Humanities", "Arts",
  "Physical Education", "Administration", "Technology", "Student Support", "Library",
];

const COURSE_DEFS: { code: string; name: string; department: string; elective?: boolean }[] = [
  { code: "MATH-101", name: "Mathematics", department: "Mathematics" },
  { code: "MATH-210", name: "Advanced Mathematics", department: "Mathematics", elective: true },
  { code: "SCI-110", name: "Integrated Science", department: "Science" },
  { code: "PHY-201", name: "Physics", department: "Science" },
  { code: "CHE-202", name: "Chemistry", department: "Science" },
  { code: "BIO-203", name: "Biology", department: "Science" },
  { code: "ENG-101", name: "English Language", department: "Languages" },
  { code: "ENG-220", name: "English Literature", department: "Languages" },
  { code: "FRA-110", name: "French", department: "Languages", elective: true },
  { code: "SPA-110", name: "Spanish", department: "Languages", elective: true },
  { code: "HIS-130", name: "World History", department: "Humanities" },
  { code: "GEO-140", name: "Geography", department: "Humanities" },
  { code: "CIV-150", name: "Civics & Ethics", department: "Humanities" },
  { code: "CSC-160", name: "Computer Science", department: "Technology" },
  { code: "ART-170", name: "Visual Arts", department: "Arts", elective: true },
  { code: "MUS-175", name: "Music", department: "Arts", elective: true },
  { code: "PED-180", name: "Physical Education", department: "Physical Education" },
  { code: "BUS-190", name: "Business Studies", department: "Humanities", elective: true },
];

const DESIGNATIONS: Record<string, string[]> = {
  Mathematics: ["Head of Department", "Senior Teacher", "Teacher"],
  Science: ["Head of Department", "Senior Teacher", "Teacher", "Lab Coordinator"],
  Languages: ["Head of Department", "Teacher", "Assistant Teacher"],
  Humanities: ["Senior Teacher", "Teacher"],
  Arts: ["Teacher", "Visiting Faculty"],
  "Physical Education": ["Sports Director", "Coach"],
  Administration: ["Principal", "Vice Principal", "Registrar", "Accountant", "Front Office Executive"],
  Technology: ["IT Administrator", "Systems Support"],
  "Student Support": ["School Counsellor", "Special Needs Educator", "School Nurse"],
  Library: ["Librarian", "Library Assistant"],
};

function phone(rng: Rng): string {
  return `+1 (555) ${intBetween(rng, 200, 989)}-${intBetween(rng, 1000, 9999)}`;
}

function personName(rng: Rng, gender: "male" | "female"): { firstName: string; lastName: string } {
  return {
    firstName: gender === "male" ? pick(rng, FIRST_M) : pick(rng, FIRST_F),
    lastName: pick(rng, LAST),
  };
}

function doc(rng: Rng, name: string, type: DocumentFile["type"], verified = true): DocumentFile {
  return {
    id: `doc_${name.toLowerCase().replace(/\W+/g, "_")}_${intBetween(rng, 100, 999)}`,
    name,
    type,
    sizeKb: intBetween(rng, 90, 4200),
    uploadedAt: new Date(Date.now() - intBetween(rng, 2, 400) * 86400000).toISOString(),
    url: "#",
    verified,
  };
}

function makeGuardian(rng: Rng, lastName: string): Guardian {
  const relation = pick(rng, ["Father", "Mother", "Guardian"] as const);
  const first = relation === "Mother" ? pick(rng, FIRST_F) : pick(rng, FIRST_M);
  const name = `${first} ${lastName}`;
  return {
    id: `grd_${first}_${lastName}_${intBetween(rng, 10, 99)}`.toLowerCase(),
    name,
    relation,
    phone: phone(rng),
    email: `${first}.${lastName}@familymail.com`.toLowerCase(),
    occupation: pick(rng, OCCUPATIONS),
    invited: chance(rng, 0.55),
  };
}

// ---------------------------------------------------------------------------

export function buildSeed(): Collections {
  const rng = createRng(0x5c3f19);
  const now = new Date();
  const nowIso = now.toISOString();
  const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

  const branches: Branch[] = [
    {
      id: "branch_main",
      name: "Northfield Main Campus",
      code: "NFA-MAIN",
      address: "120 Academy Drive, Northfield",
      phone: "+1 (555) 240-1100",
      isMain: true,
      studentCount: 0,
    },
    {
      id: "branch_riverside",
      name: "Riverside Campus",
      code: "NFA-RIV",
      address: "8 Riverbank Road, Riverside",
      phone: "+1 (555) 240-1180",
      isMain: false,
      studentCount: 0,
    },
  ];

  const academicYears: AcademicYear[] = [
    { id: "ay_2024", label: "2024 – 2025", startDate: "2024-08-12", endDate: "2025-06-20", isCurrent: false, status: "closed" },
    { id: "ay_2025", label: "2025 – 2026", startDate: "2025-08-11", endDate: "2026-06-19", isCurrent: true, status: "active" },
    { id: "ay_2026", label: "2026 – 2027", startDate: "2026-08-10", endDate: "2027-06-18", isCurrent: false, status: "planning" },
  ];

  // ------------------------------------------------------------------ classes
  const classes: SchoolClass[] = [];
  GRADES.forEach((grade, gi) => {
    const sections = gi <= 4 ? ["A", "B", "C"] : ["A", "B"];
    sections.forEach((section) => {
      classes.push({
        id: `cls_${grade.split(" ")[1]}${section}`,
        name: `${grade} · ${section}`,
        grade,
        section,
        classTeacherId: "",
        roomNo: `${gi + 1}0${section === "A" ? 1 : section === "B" ? 2 : 3}`,
        capacity: 32,
        studentCount: 0,
        courseIds: [],
        academicYearId: "ay_2025",
        branchId: gi >= 5 ? "branch_main" : chance(rng, 0.82) ? "branch_main" : "branch_riverside",
        schedule: [],
        attendanceRate: 0,
      });
    });
  });

  // -------------------------------------------------------------------- staff
  const staff: StaffMember[] = [];
  const fixedStaff: Partial<StaffMember>[] = [
    { id: "stf_super", firstName: "Amara", lastName: "Whitfield", department: "Administration", designation: "Principal", role: "super_admin", email: "super@northfield.edu", gender: "female" },
    { id: "stf_admin", firstName: "Dana", lastName: "Whitfield", department: "Administration", designation: "Registrar", role: "admin", email: "admin@northfield.edu", gender: "female" },
    { id: "stf_staff", firstName: "Musa", lastName: "Okafor", department: "Science", designation: "Senior Teacher", role: "staff", email: "staff@northfield.edu", gender: "male" },
  ];

  const totalStaff = 44;
  for (let i = 0; i < totalStaff; i += 1) {
    const fixed = fixedStaff[i];
    const gender = (fixed?.gender as "male" | "female") ?? (chance(rng, 0.45) ? "male" : "female");
    const nm = fixed?.firstName
      ? { firstName: fixed.firstName as string, lastName: fixed.lastName as string }
      : personName(rng, gender);
    const department = fixed?.department ?? pick(rng, DEPARTMENTS);
    const designation = fixed?.designation ?? pick(rng, DESIGNATIONS[department] ?? ["Teacher"]);
    const full = `${nm.firstName} ${nm.lastName}`;
    const joiningYear = intBetween(rng, 2009, 2025);
    const employmentStatus = fixed
      ? "active"
      : rng() > 0.88
        ? pick(rng, ["on_leave", "probation", "retired", "terminated"] as const)
        : "active";
    staff.push({
      id: fixed?.id ?? `stf_${String(i + 1).padStart(3, "0")}`,
      employeeId: `EMP-${String(1000 + i * 7).slice(-4)}`,
      firstName: nm.firstName,
      lastName: nm.lastName,
      avatarUrl: avatarFor(full),
      gender,
      email: fixed?.email ?? `${nm.firstName}.${nm.lastName}@northfield.edu`.toLowerCase(),
      phone: phone(rng),
      department,
      designation,
      employmentStatus,
      employmentType: chance(rng, 0.82) ? "full_time" : chance(rng, 0.5) ? "part_time" : "contract",
      joiningDate: `${joiningYear}-0${intBetween(rng, 1, 9)}-1${intBetween(rng, 0, 8)}`,
      branchId: chance(rng, 0.85) ? "branch_main" : "branch_riverside",
      role: (fixed?.role as StaffMember["role"]) ?? "staff",
      qualification: pick(rng, ["M.Ed.", "M.Sc.", "M.A.", "B.Ed.", "Ph.D.", "B.Sc. (Hons)"]),
      experienceYears: Math.max(1, 2026 - joiningYear + intBetween(rng, 0, 6)),
      address: `${intBetween(rng, 12, 940)} ${pick(rng, STREETS)} Street, ${pick(rng, CITIES)}`,
      dateOfBirth: `${intBetween(rng, 1972, 1996)}-0${intBetween(rng, 1, 9)}-2${intBetween(rng, 0, 8)}`,
      assignedClassIds: [],
      assignedCourseIds: [],
      attendanceRate: intBetween(rng, 88, 100),
      isClassTeacher: false,
      documents: [doc(rng, "Employment contract.pdf", "pdf"), doc(rng, "Teaching certificate.pdf", "pdf")],
      createdAt: iso(intBetween(rng, 40, 1800)),
      updatedAt: iso(intBetween(rng, 1, 30)),
    });
  }

  const teachers = staff.filter(
    (s) => s.employmentStatus === "active" && !["Administration", "Technology", "Library"].includes(s.department),
  );

  // ------------------------------------------------------------------ courses
  const courses: Course[] = COURSE_DEFS.map((def, i) => {
    const deptTeachers = teachers.filter((t) => t.department === def.department);
    const assigned = (deptTeachers.length ? deptTeachers : teachers).slice(0, 3).map((t) => t.id);
    const usedByClasses = def.elective
      ? classes.filter((_, ci) => ci % 3 === i % 3).map((c) => c.id)
      : classes.map((c) => c.id);
    return {
      id: `crs_${def.code.toLowerCase().replace(/-/g, "_")}`,
      code: def.code,
      name: def.name,
      department: def.department,
      description: `${def.name} builds conceptual depth through inquiry-led lessons, continuous assessment and practical work aligned to the Northfield academic framework.`,
      credits: intBetween(rng, 2, 6),
      weeklyHours: intBetween(rng, 2, 6),
      teacherIds: assigned,
      classIds: usedByClasses,
      isElective: Boolean(def.elective),
      syllabus: Array.from({ length: 4 }, (_, u) => ({
        unit: u + 1,
        title: [`Foundations of ${def.name}`, "Core Concepts", "Applied Practice", "Assessment & Review"][u],
        hours: intBetween(rng, 8, 22),
        topics: pickMany(
          rng,
          [
            "Guided inquiry",
            "Practical lab work",
            "Case studies",
            "Group projects",
            "Formative assessment",
            "Field observation",
            "Digital portfolio",
          ],
          3,
        ),
      })),
      createdAt: iso(intBetween(rng, 200, 900)),
    };
  });

  // assign class teachers + schedules
  classes.forEach((cls, i) => {
    const teacher = teachers[i % teachers.length];
    cls.classTeacherId = teacher.id;
    teacher.isClassTeacher = true;
    teacher.assignedClassIds.push(cls.id);
    cls.courseIds = courses.filter((c) => c.classIds.includes(cls.id)).slice(0, 8).map((c) => c.id);
    const days: SchedulePeriod["day"][] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const slots = ["08:30", "09:25", "10:20", "11:35", "12:30", "13:45"];
    days.forEach((day) => {
      slots.slice(0, 5).forEach((start, si) => {
        const course = courses.find((c) => c.id === cls.courseIds[(si + days.indexOf(day)) % cls.courseIds.length]);
        if (!course) return;
        const courseTeacher = staff.find((s) => s.id === course.teacherIds[0]) ?? teacher;
        courseTeacher.assignedCourseIds.push(course.id);
        cls.schedule.push({
          id: `per_${cls.id}_${day}_${si}`,
          day,
          start,
          end: slots[si + 1] ?? "14:40",
          courseId: course.id,
          courseName: course.name,
          staffId: courseTeacher.id,
          staffName: `${courseTeacher.firstName} ${courseTeacher.lastName}`,
          room: cls.roomNo,
        });
      });
    });
  });
  staff.forEach((s) => {
    s.assignedCourseIds = Array.from(new Set(s.assignedCourseIds)).slice(0, 4);
  });

  // ----------------------------------------------------------------- students
  const students: Student[] = [];
  let studentIndex = 0;
  classes.forEach((cls) => {
    const count = intBetween(rng, 8, 12);
    for (let r = 1; r <= count; r += 1) {
      studentIndex += 1;
      const gender = chance(rng, 0.5) ? "male" : "female";
      const nm = personName(rng, gender);
      const full = `${nm.firstName} ${nm.lastName}`;
      const gradeNum = Number(cls.grade.split(" ")[1]);
      const admissionYear = Math.max(2018, 2026 - (gradeNum - 5) - intBetween(rng, 0, 1));
      const status: Student["status"] =
        rng() > 0.93 ? pick(rng, ["inactive", "transferred", "suspended"] as const) : "active";
      students.push({
        id: `stu_${String(studentIndex).padStart(4, "0")}`,
        admissionNo: `NFA-${admissionYear}-${String(1000 + studentIndex).slice(-4)}`,
        firstName: nm.firstName,
        lastName: nm.lastName,
        avatarUrl: avatarFor(full),
        gender,
        dateOfBirth: `${2026 - gradeNum - 5}-${String(intBetween(rng, 1, 12)).padStart(2, "0")}-${String(intBetween(rng, 1, 28)).padStart(2, "0")}`,
        grade: cls.grade,
        section: cls.section,
        classId: cls.id,
        rollNo: r,
        branchId: cls.branchId,
        admissionYear,
        admissionDate: `${admissionYear}-08-${String(intBetween(rng, 10, 28)).padStart(2, "0")}`,
        status,
        email: `${nm.firstName}.${nm.lastName}${studentIndex}@student.northfield.edu`.toLowerCase(),
        phone: phone(rng),
        address: `${intBetween(rng, 10, 980)} ${pick(rng, STREETS)} Street`,
        city: pick(rng, CITIES),
        bloodGroup: pick(rng, BLOOD),
        nationality: pick(rng, ["American", "Canadian", "Nigerian", "Indian", "Brazilian", "Lebanese"]),
        guardian: makeGuardian(rng, nm.lastName),
        emergencyContact: phone(rng),
        houseName: pick(rng, HOUSES),
        attendanceRate: intBetween(rng, 72, 100),
        feeBalance: chance(rng, 0.34) ? intBetween(rng, 1, 18) * 125 : 0,
        documents: [
          doc(rng, "Birth certificate.pdf", "pdf"),
          doc(rng, "Previous report card.pdf", "pdf", chance(rng, 0.8)),
          doc(rng, "Immunisation record.pdf", "pdf", chance(rng, 0.7)),
        ],
        createdAt: iso(intBetween(rng, 3, 1200)),
        updatedAt: iso(intBetween(rng, 0, 30)),
      });
    }
    cls.studentCount = count;
    cls.attendanceRate = intBetween(rng, 88, 99);
  });

  branches.forEach((b) => {
    b.studentCount = students.filter((s) => s.branchId === b.id && s.status === "active").length;
  });

  // -------------------------------------------------------------------- users
  const users: UserAccount[] = staff.map((s, i) => {
    const invited = s.employmentStatus === "active" && rng() > 0.82;
    return {
      id:
        s.id === "stf_super" ? "usr_super" : s.id === "stf_admin" ? "usr_admin" : s.id === "stf_staff" ? "usr_staff" : `usr_stf_${i}`,
      name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      avatarUrl: s.avatarUrl,
      role: s.role,
      profileType: "staff",
      profileId: s.id,
      profileLabel: `${s.designation} · ${s.department}`,
      accountStatus: invited ? "invited" : s.employmentStatus === "active" ? "active" : "deactivated",
      invitationStatus: invited ? pick(rng, ["pending", "expired"] as const) : "activated",
      invitedAt: invited ? iso(intBetween(rng, 1, 22)) : undefined,
      invitationExpiresAt: invited ? new Date(now.getTime() + intBetween(rng, -6, 9) * 86400000).toISOString() : undefined,
      emailVerified: !invited,
      lastActiveAt: invited ? undefined : iso(intBetween(rng, 0, 14)),
      branchId: s.branchId,
      createdAt: s.createdAt,
    };
  });

  students.slice(0, 14).forEach((s, i) => {
    users.push({
      id: `usr_stu_${i}`,
      name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      avatarUrl: s.avatarUrl,
      role: "student",
      profileType: "student",
      profileId: s.id,
      profileLabel: `${s.grade} · ${s.section}`,
      accountStatus: "active",
      invitationStatus: "activated",
      emailVerified: true,
      lastActiveAt: iso(intBetween(rng, 0, 9)),
      branchId: s.branchId,
      createdAt: s.createdAt,
    });
  });

  students.slice(20, 34).forEach((s, i) => {
    const pending = i % 3 === 0;
    users.push({
      id: `usr_grd_${i}`,
      name: s.guardian.name,
      email: s.guardian.email,
      avatarUrl: avatarFor(s.guardian.name),
      role: "guardian",
      profileType: "guardian",
      profileId: s.guardian.id,
      profileLabel: `${s.guardian.relation} of ${s.firstName} ${s.lastName}`,
      accountStatus: pending ? "invited" : "active",
      invitationStatus: pending ? "pending" : "activated",
      invitedAt: pending ? iso(intBetween(rng, 1, 10)) : undefined,
      invitationExpiresAt: pending ? new Date(now.getTime() + 5 * 86400000).toISOString() : undefined,
      emailVerified: !pending,
      lastActiveAt: pending ? undefined : iso(intBetween(rng, 0, 20)),
      branchId: s.branchId,
      createdAt: iso(intBetween(rng, 20, 400)),
    });
  });

  const roles: RoleDefinition[] = (
    [
      ["super_admin", "Super Admin", "Unrestricted access including roles, permissions and organization settings."],
      ["admin", "Admin", "Runs day-to-day school operations: people, admissions, finance and website."],
      ["staff", "Staff", "Teaching and support staff. Marks attendance and drafts communications."],
      ["student", "Student", "Portal access to notices, events and personal academic records."],
      ["guardian", "Guardian", "Portal access to their children's records, fees and school communications."],
    ] as const
  ).map(([key, label, description]) => ({
    key,
    label,
    description,
    isSystem: key === "super_admin",
    permissions: [],
    userCount: users.filter((u) => u.role === key).length,
  }));

  const sessions: SessionRecord[] = [
    { id: "ses_1", userId: "usr_admin", userName: "Dana Whitfield", device: "MacBook Pro", browser: "Chrome 141", ip: "172.58.20.14", location: "Northfield, US", lastActiveAt: nowIso, current: true },
    { id: "ses_2", userId: "usr_admin", userName: "Dana Whitfield", device: "iPhone 16", browser: "Safari Mobile", ip: "172.58.44.90", location: "Northfield, US", lastActiveAt: iso(1), current: false },
    { id: "ses_3", userId: "usr_super", userName: "Amara Whitfield", device: "iPad Pro", browser: "Safari 18", ip: "104.28.14.2", location: "Riverside, US", lastActiveAt: iso(0.2), current: false },
    { id: "ses_4", userId: "usr_staff", userName: "Musa Okafor", device: "Windows 11 Desktop", browser: "Edge 140", ip: "98.44.12.66", location: "Northfield, US", lastActiveAt: iso(2), current: false },
  ];

  // --------------------------------------------------------------- attendance
  const activeStudents = students.filter((s) => s.status === "active");
  const days = recentWeekdays(8, now);
  const attendance: AttendanceRecord[] = [];
  days.forEach((date, di) => {
    activeStudents.forEach((s) => {
      const roll = rng();
      let state: AttendanceState = "present";
      if (roll > 0.965) state = "absent";
      else if (roll > 0.94) state = "late";
      else if (roll > 0.925) state = "excused";
      if (di === 0 && rng() > 0.86) return; // today: a few classes not marked yet
      attendance.push({
        id: `att_${s.id}_${date}`,
        date,
        personType: "student",
        personId: s.id,
        classId: s.classId,
        state,
        markedBy: "Dana Whitfield",
        markedAt: `${date}T08:${intBetween(rng, 10, 55)}:00.000Z`,
        note: state === "excused" ? pick(rng, ["Medical appointment", "Family travel", "Sports fixture"]) : undefined,
      });
    });
  });
  staff.filter((s) => s.employmentStatus === "active").forEach((s) => {
    const roll = rng();
    attendance.push({
      id: `att_${s.id}_${days[0]}`,
      date: days[0],
      personType: "staff",
      personId: s.id,
      state: roll > 0.94 ? "absent" : roll > 0.9 ? "late" : "present",
      markedBy: "Front Office",
      markedAt: `${days[0]}T07:${intBetween(rng, 40, 59)}:00.000Z`,
    });
  });

  const attendanceTrend: AttendanceDayPoint[] = recentWeekdays(22, now)
    .reverse()
    .map((date) => {
      const total = activeStudents.length;
      const absent = intBetween(rng, 2, 14);
      const late = intBetween(rng, 1, 9);
      const excused = intBetween(rng, 0, 6);
      const present = total - absent - late - excused;
      return {
        date,
        present,
        absent,
        late,
        excused,
        rate: Math.round(((present + late) / total) * 1000) / 10,
      };
    });

  const enrollmentTrend: EnrollmentPoint[] = [
    "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
  ].map((period, i) => ({
    period,
    students: Math.round(activeStudents.length * (0.86 + i * 0.013)),
    capacity: classes.length * 32,
    admissions: intBetween(rng, 3, 22),
  }));

  // ------------------------------------------------------------------ notices
  const NOTICE_SEEDS: [string, NoticeStatus, NoticePriority, string][] = [
    ["Mid-term examination schedule released", "published", "high", "Grade 6–12 mid-term timetable is now available. Please review reporting times with your ward."],
    ["Parent-teacher conference — booking open", "published", "normal", "Slots are open for the spring conference. Book through the guardian portal before Friday."],
    ["Campus closed for Founders' Day", "published", "normal", "The campus will remain closed on Founders' Day. Transport services are suspended."],
    ["Updated transport routes for Riverside", "published", "high", "Route R-04 has three revised stops effective next Monday."],
    ["Winter uniform changeover", "published", "low", "Students should switch to the winter uniform from the first Monday of next month."],
    ["Science fair registration now open", "published", "normal", "Teams of up to three students may register for the inter-house science fair."],
    ["Library extended hours during exams", "published", "low", "The library will remain open until 7:00 PM through the examination period."],
    ["Immunisation drive — consent required", "published", "urgent", "Guardians must submit consent forms before the school health drive."],
    ["Fee instalment 2 reminder", "published", "high", "The second instalment is due at the end of this month. Late fees apply thereafter."],
    ["New counselling support hours", "published", "normal", "Student support is now available every weekday afternoon without prior appointment."],
    ["Annual sports day — house allocations", "published", "normal", "House allocations and event entries have been published on the notice board."],
    ["Grade 10 field trip permission slips", "scheduled", "high", "Permission slips for the geology field trip must be returned before departure."],
    ["Summer enrichment programme preview", "scheduled", "low", "A preview of the summer enrichment tracks will be shared with all guardians."],
    ["Digital citizenship workshop", "scheduled", "normal", "A workshop on responsible technology use for Grade 7 and 8 students."],
    ["Draft: Revised late-arrival policy", "draft", "normal", "Working draft of the revised late-arrival and gate-closing policy."],
    ["Draft: Cafeteria menu refresh", "draft", "low", "Proposed seasonal menu with expanded vegetarian options."],
    ["Draft: Staff development calendar", "draft", "normal", "Internal draft of the professional development calendar for next term."],
    ["Archived: Last term examination results", "archived", "normal", "Results for the previous term have been archived for records."],
    ["Archived: Monsoon transport advisory", "archived", "high", "Advisory issued during the monsoon disruption last term."],
    ["Archived: Book fair wrap-up", "archived", "low", "Summary and thanks following the annual book fair."],
  ];

  const audiencePresets = [
    [{ kind: "everyone", label: "Everyone" }],
    [{ kind: "guardians", label: "Guardians" }, { kind: "students", label: "Students" }],
    [{ kind: "staff", label: "Staff" }],
    [{ kind: "grade", value: "Grade 10", label: "Grade 10" }],
    [{ kind: "class", value: "cls_9A", label: "Grade 9 · A" }, { kind: "guardians", label: "Guardians" }],
  ] as Notice["audience"][];

  const notices: Notice[] = NOTICE_SEEDS.map(([title, status, priority, summary], i) => {
    const author = pick(rng, staff.filter((s) => s.department === "Administration"));
    const publishOffset = status === "scheduled" ? intBetween(rng, 2, 18) : -intBetween(rng, 0, 40);
    return {
      id: `not_${String(i + 1).padStart(3, "0")}`,
      title,
      summary,
      content: `<p>${summary}</p><p>Please refer to the school handbook for the full policy text. Questions can be directed to the front office during working hours.</p><ul><li>Applies to all campuses unless stated otherwise</li><li>Guardians will receive an email copy</li><li>Contact the registrar for exceptions</li></ul>`,
      featuredImage: chance(rng, 0.55) ? photoFor(`notice-${i}`, 1200, 600) : undefined,
      attachments: chance(rng, 0.4) ? [doc(rng, "Details.pdf", "pdf")] : [],
      audience: pick(rng, audiencePresets),
      status,
      priority,
      publishAt: new Date(now.getTime() + publishOffset * 86400000).toISOString(),
      expiresAt: chance(rng, 0.5) ? new Date(now.getTime() + intBetween(rng, 20, 90) * 86400000).toISOString() : undefined,
      pinned: i < 2,
      authorId: author.id,
      authorName: `${author.firstName} ${author.lastName}`,
      views: status === "published" ? intBetween(rng, 60, 1400) : 0,
      createdAt: iso(intBetween(rng, 1, 60)),
      updatedAt: iso(intBetween(rng, 0, 20)),
    };
  });

  // ------------------------------------------------------------------- events
  const EVENT_SEEDS: [string, EventCategory, number, string][] = [
    ["Mid-term Examinations — Grade 9 & 10", "exam", 6, "Examination Halls A–C"],
    ["Inter-house Athletics Meet", "sports", 12, "Northfield Sports Ground"],
    ["Spring Cultural Evening", "cultural", 19, "Main Auditorium"],
    ["Grade 8 Geology Field Trip", "trip", 9, "Ashbourne Ridge"],
    ["Regional Mathematics Olympiad", "competition", 24, "Riverside Campus Hall"],
    ["Parent-Teacher Conference", "meeting", 3, "Classrooms · Block B"],
    ["Founders' Day Holiday", "holiday", 15, "Campus closed"],
    ["Robotics Club Showcase", "program", 8, "Innovation Lab"],
    ["Annual Science Fair", "program", 30, "Exhibition Centre"],
    ["Grade 12 Career Counselling Week", "program", 21, "Counselling Suite"],
    ["Swimming Gala", "sports", 27, "Aquatics Centre"],
    ["Inter-school Debate Championship", "competition", 35, "Main Auditorium"],
    ["Staff Development Workshop", "meeting", 5, "Conference Room 2"],
    ["Music Recital — Winter Ensemble", "cultural", -6, "Recital Hall"],
    ["Grade 6 Orientation Morning", "program", -12, "Assembly Hall"],
    ["Term 1 Final Examinations", "exam", -22, "Examination Halls A–C"],
    ["Founders' Cup Football Final", "sports", -30, "Northfield Sports Ground"],
    ["Art & Design Exhibition", "cultural", -18, "Gallery Wing"],
    ["Guardians' Finance Briefing", "meeting", 2, "Auditorium Annexe"],
    ["Spelling Bee Finals", "competition", 1, "Library Commons"],
  ];

  const events: SchoolEvent[] = EVENT_SEEDS.map(([title, category, offset, location], i) => {
    const start = addDays(now, offset);
    const spanDays = category === "exam" ? 4 : category === "trip" ? 1 : 0;
    const end = addDays(start, spanDays);
    const status: EventStatus =
      offset < -1 ? "completed" : offset === 0 ? "ongoing" : i % 11 === 0 ? "draft" : "scheduled";
    const organizer = pick(rng, staff.filter((s) => s.employmentStatus === "active"));
    return {
      id: `evt_${String(i + 1).padStart(3, "0")}`,
      title,
      description: `${title} is part of the Northfield academic and co-curricular calendar. Coordinators will publish detailed schedules and duty rosters one week in advance.`,
      category,
      status: i === 16 ? "cancelled" : status,
      startDate: toDateKey(start),
      endDate: toDateKey(end),
      allDay: category === "holiday" || category === "exam",
      startTime: category === "holiday" ? undefined : pick(rng, ["08:30", "09:00", "10:00", "14:00", "17:30"]),
      endTime: category === "holiday" ? undefined : pick(rng, ["11:30", "12:30", "16:00", "19:30"]),
      location,
      coverImage: photoFor(`event-${i}`, 1400, 700),
      organizerId: organizer.id,
      organizerName: `${organizer.firstName} ${organizer.lastName}`,
      participants: [
        { label: pick(rng, ["Grade 6–8", "Grade 9–10", "Grade 11–12", "All grades"]), count: intBetween(rng, 40, 220) },
        { label: "Staff", count: intBetween(rng, 4, 26) },
      ],
      registrationRequired: ["competition", "trip", "program"].includes(category),
      registrationCount: intBetween(rng, 0, 120),
      capacity: chance(rng, 0.6) ? intBetween(rng, 80, 400) : undefined,
      albumId: offset < -10 ? `alb_${(i % 8) + 1}` : undefined,
      createdAt: iso(intBetween(rng, 10, 120)),
      updatedAt: iso(intBetween(rng, 0, 10)),
    };
  });

  // ------------------------------------------------------------------ gallery
  const ALBUM_SEEDS: [string, string][] = [
    ["Annual Sports Day 2026", "Track finals, house relays and the closing ceremony."],
    ["Spring Cultural Evening", "Dance, drama and the senior choir performance."],
    ["Science Fair Highlights", "Student-built prototypes and judging rounds."],
    ["Campus Life", "Everyday moments across the Northfield campus."],
    ["Grade 8 Field Trip", "Geology field study at Ashbourne Ridge."],
    ["Founders' Day", "Assembly, awards and the alumni address."],
    ["Art & Design Exhibition", "Portfolio work from the visual arts programme."],
    ["New Library Wing", "Opening of the redesigned library commons."],
  ];

  const albums: Album[] = ALBUM_SEEDS.map(([title, description], i) => {
    const imageCount = intBetween(rng, 6, 10);
    const images = Array.from({ length: imageCount }, (_, j) => ({
      id: `img_${i + 1}_${j + 1}`,
      url: photoFor(`album-${i + 1}-${j + 1}`, 900, 700),
      caption: pick(rng, [
        "Opening ceremony",
        "Students at work",
        "House captains",
        "Prize distribution",
        "Behind the scenes",
        "Group photograph",
        "Faculty coordinators",
        "Finale",
      ]),
      order: j,
      featured: j === 0,
      uploadedAt: iso(intBetween(rng, 5, 200)),
    }));
    return {
      id: `alb_${i + 1}`,
      title,
      description,
      visibility: i % 4 === 3 ? "internal" : "public",
      eventId: i < 3 ? events[i]?.id : undefined,
      coverImageId: images[0].id,
      images,
      createdAt: iso(intBetween(rng, 20, 300)),
      updatedAt: iso(intBetween(rng, 1, 30)),
    };
  });

  // --------------------------------------------------------------- admissions
  const applications: Application[] = Array.from({ length: 28 }, (_, i) => {
    const gender = chance(rng, 0.5) ? "male" : "female";
    const nm = personName(rng, gender);
    const full = `${nm.firstName} ${nm.lastName}`;
    const status = (
      i < 11 ? "pending" : i < 17 ? "accepted" : i < 21 ? "waitlisted" : i < 25 ? "rejected" : "converted"
    ) as Application["status"];
    const submitted = iso(intBetween(rng, 1, 45));
    const gradeApplied = pick(rng, GRADES);
    return {
      id: `app_${String(i + 1).padStart(3, "0")}`,
      applicationNo: `ADM-2026-${String(100 + i)}`,
      applicantName: full,
      avatarUrl: avatarFor(full),
      gradeApplied,
      status,
      submittedAt: submitted,
      dateOfBirth: `${2026 - Number(gradeApplied.split(" ")[1]) - 5}-0${intBetween(rng, 1, 9)}-1${intBetween(rng, 0, 8)}`,
      gender,
      email: `${nm.firstName}.${nm.lastName}@applicantmail.com`.toLowerCase(),
      phone: phone(rng),
      address: `${intBetween(rng, 10, 900)} ${pick(rng, STREETS)} Street, ${pick(rng, CITIES)}`,
      guardian: makeGuardian(rng, nm.lastName),
      previousSchool: pick(rng, [
        "Ashbourne Preparatory",
        "Riverside Public School",
        "St. Clement's Academy",
        "Kingsmere Grammar",
        "Home schooled",
      ]),
      previousGrade: `Grade ${Math.max(1, Number(gradeApplied.split(" ")[1]) - 1)}`,
      entranceScore: chance(rng, 0.75) ? intBetween(rng, 48, 98) : undefined,
      branchId: chance(rng, 0.8) ? "branch_main" : "branch_riverside",
      source: pick(rng, ["website", "walk_in", "referral", "agent"] as const),
      documents: [
        doc(rng, "Application form.pdf", "pdf"),
        doc(rng, "Birth certificate.pdf", "pdf", chance(rng, 0.85)),
        doc(rng, "Transcript.pdf", "pdf", chance(rng, 0.6)),
      ],
      notes:
        chance(rng, 0.5)
          ? [
              {
                id: `apn_${i}`,
                author: "Dana Whitfield",
                text: pick(rng, [
                  "Guardian requested a campus tour before confirming.",
                  "Strong entrance assessment; recommend interview fast-track.",
                  "Awaiting transcript from previous school.",
                  "Sibling already enrolled in Grade 7 · B.",
                ]),
                createdAt: iso(intBetween(rng, 1, 20)),
              },
            ]
          : [],
      timeline: [
        {
          id: `tl_${i}_1`,
          label: "Application submitted",
          description: "Received through the public admissions form.",
          actor: full,
          at: submitted,
          tone: "neutral",
        },
        {
          id: `tl_${i}_2`,
          label: "Documents reviewed",
          description: "Registrar verified submitted documents.",
          actor: "Dana Whitfield",
          at: iso(intBetween(rng, 1, 20)),
          tone: "neutral",
        },
        ...(status === "accepted" || status === "converted"
          ? [
              {
                id: `tl_${i}_3`,
                label: "Offer extended",
                description: `Seat offered for ${gradeApplied}.`,
                actor: "Amara Whitfield",
                at: iso(intBetween(rng, 0, 8)),
                tone: "positive" as const,
              },
            ]
          : []),
        ...(status === "rejected"
          ? [
              {
                id: `tl_${i}_3`,
                label: "Application declined",
                description: "Grade cohort at capacity for this academic year.",
                actor: "Amara Whitfield",
                at: iso(intBetween(rng, 0, 8)),
                tone: "negative" as const,
              },
            ]
          : []),
      ],
    };
  });

  // ----------------------------------------------------------- transportation
  const drivers: Driver[] = Array.from({ length: 6 }, (_, i) => {
    const nm = personName(rng, "male");
    const full = `${nm.firstName} ${nm.lastName}`;
    return {
      id: `drv_${i + 1}`,
      name: full,
      avatarUrl: avatarFor(full),
      phone: phone(rng),
      licenseNo: `DL-${intBetween(rng, 100000, 999999)}`,
      experienceYears: intBetween(rng, 3, 22),
      status: i === 5 ? "on_leave" : "active",
    };
  });

  const STOP_NAMES = [
    "Maple Crossing", "Riverbank Gate", "Ashbourne Square", "Kingsmere Park", "Cedar Heights",
    "Linden Circle", "Old Mill Road", "Willow Court", "Summit Plaza", "Junipers End",
  ];

  const routes: TransportRoute[] = Array.from({ length: 6 }, (_, i) => {
    const stopCount = intBetween(rng, 4, 7);
    const assigned = pickMany(rng, activeStudents, intBetween(rng, 14, 30)).map((s) => s.id);
    return {
      id: `rte_${i + 1}`,
      name: `${pick(rng, ["North", "South", "East", "West", "Riverside", "Central"])} Corridor`,
      code: `R-0${i + 1}`,
      vehicleId: `veh_${i + 1}`,
      distanceKm: intBetween(rng, 8, 34),
      morningStart: `06:${intBetween(rng, 30, 55)}`,
      eveningStart: `15:${intBetween(rng, 10, 45)}`,
      status: i === 5 ? "suspended" : "active",
      assignedStudentIds: assigned,
      stops: Array.from({ length: stopCount }, (_, j) => ({
        id: `stp_${i + 1}_${j + 1}`,
        name: STOP_NAMES[(i * 2 + j) % STOP_NAMES.length],
        landmark: pick(rng, ["Near community centre", "Opposite pharmacy", "Beside the park", "Next to the clinic"]),
        pickupTime: `06:${String(intBetween(rng, 30, 59)).padStart(2, "0")}`,
        dropTime: `15:${String(intBetween(rng, 20, 59)).padStart(2, "0")}`,
        order: j,
        studentCount: Math.max(1, Math.floor(assigned.length / stopCount) + intBetween(rng, -2, 3)),
        ...stopCoordinate(i, j, stopCount),
      })),
    };
  });

  const vehicles: Vehicle[] = Array.from({ length: 6 }, (_, i) => ({
    id: `veh_${i + 1}`,
    code: `BUS-0${i + 1}`,
    type: i < 4 ? "bus" : i === 4 ? "minibus" : "van",
    regNo: `NF-${intBetween(rng, 10, 99)}-${pick(rng, ["AB", "CD", "EF", "GH"])}-${intBetween(rng, 1000, 9999)}`,
    model: pick(rng, ["Volvo 9400", "Tata Starbus", "Mercedes Sprinter", "Ashok Leyland Oyster"]),
    year: intBetween(rng, 2017, 2025),
    capacity: i < 4 ? intBetween(rng, 40, 56) : intBetween(rng, 16, 26),
    driverId: `drv_${i + 1}`,
    routeId: `rte_${i + 1}`,
    status: i === 4 ? "maintenance" : i === 5 ? "inactive" : "active",
    lastServiceDate: toDateKey(addDays(now, -intBetween(rng, 10, 120))),
    insuranceExpiry: toDateKey(addDays(now, intBetween(rng, 20, 300))),
    gpsEnabled: chance(rng, 0.7),
  }));

  activeStudents.forEach((s) => {
    const route = routes.find((r) => r.assignedStudentIds.includes(s.id));
    if (route) s.transportRouteId = route.id;
  });

  // ----------------------------------------------------------------- payments
  const feeStructures: FeeStructure[] = GRADES.map((grade, i) => {
    const tuition = 3200 + i * 260;
    const components: { label: string; amount: number }[] = [
      { label: "Tuition", amount: tuition },
      { label: "Technology & labs", amount: 240 + i * 15 },
      { label: "Library", amount: 90 },
      { label: "Activities", amount: 180 },
    ];
    return {
      id: `fee_${i + 1}`,
      name: `${grade} — Annual Fee`,
      grade,
      frequency: "term",
      amount: components.reduce((sum, c) => sum + c.amount, 0),
      components,
      academicYearId: "ay_2025",
      active: true,
    };
  });

  const invoices: Invoice[] = [];
  const payments: PaymentTransaction[] = [];
  activeStudents.forEach((s, i) => {
    const structure = feeStructures.find((f) => f.grade === s.grade) ?? feeStructures[0];
    const termAmount = Math.round(structure.amount / 3);
    const roll = rng();
    const status: Invoice["status"] = roll > 0.72 ? (roll > 0.9 ? "overdue" : "partial") : "paid";
    const amountPaid = status === "paid" ? termAmount : status === "partial" ? Math.round(termAmount * 0.45) : 0;
    const dueOffset = status === "overdue" ? -intBetween(rng, 3, 30) : intBetween(rng, 2, 40);
    const invoice: Invoice = {
      id: `inv_${String(i + 1).padStart(4, "0")}`,
      invoiceNo: `INV-2026-${String(2000 + i)}`,
      studentId: s.id,
      studentName: `${s.firstName} ${s.lastName}`,
      studentAvatar: s.avatarUrl,
      grade: s.grade,
      feeStructureId: structure.id,
      term: "Term 2",
      amount: termAmount,
      amountPaid,
      issuedDate: toDateKey(addDays(now, -intBetween(rng, 20, 60))),
      dueDate: toDateKey(addDays(now, dueOffset)),
      status,
    };
    invoices.push(invoice);
    s.feeBalance = termAmount - amountPaid;
    if (amountPaid > 0) {
      payments.push({
        id: `pay_${String(i + 1).padStart(4, "0")}`,
        receiptNo: `RCP-2026-${String(5000 + i)}`,
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        studentId: s.id,
        studentName: invoice.studentName,
        amount: amountPaid,
        method: pick(rng, ["card", "bank_transfer", "cash", "cheque", "wallet"] as const),
        reference: `TXN${intBetween(rng, 100000, 999999)}`,
        status: rng() > 0.96 ? "pending" : "succeeded",
        paidAt: iso(intBetween(rng, 0, 40)),
        recordedBy: "Dana Whitfield",
      });
    }
  });

  // ------------------------------------------------------------ notifications
  const notifications: AppNotification[] = [
    { kind: "admission", title: "New admission application", body: `${applications[0].applicantName} applied for ${applications[0].gradeApplied}.`, severity: "info", href: `/admissions/${applications[0].id}` },
    { kind: "attendance", title: "Attendance not marked", body: "3 classes have not submitted today's attendance register.", severity: "warning", href: "/attendance" },
    { kind: "payment", title: "Overdue fees crossed threshold", body: "14 invoices are now past their due date.", severity: "critical", href: "/payments" },
    { kind: "notice", title: "Notice published", body: "“Immunisation drive — consent required” is now live for guardians.", severity: "success", href: "/notices" },
    { kind: "invitation", title: "Invitation accepted", body: "Ravi Nair activated their guardian account.", severity: "success", href: "/users" },
    { kind: "event", title: "Event starts tomorrow", body: "Parent-Teacher Conference · Classrooms Block B.", severity: "info", href: "/events" },
    { kind: "user", title: "New staff user created", body: "An account was created for the new Arts faculty member.", severity: "info", href: "/users" },
    { kind: "system", title: "Website content published", body: "Homepage changes were published to the public site.", severity: "success", href: "/website" },
    { kind: "admission", title: "Application waitlisted", body: `${applications[18].applicantName} moved to the waitlist for ${applications[18].gradeApplied}.`, severity: "info", href: `/admissions/${applications[18].id}` },
    { kind: "attendance", title: "Attendance risk flagged", body: "6 students dropped below 75% attendance this month.", severity: "warning", href: "/attendance" },
    { kind: "invitation", title: "Invitation expiring", body: "2 staff invitations expire within 48 hours.", severity: "warning", href: "/users" },
    { kind: "system", title: "Backup completed", body: "Nightly data backup finished successfully.", severity: "info" },
    { kind: "payment", title: "Payment received", body: "Term 2 instalment received for 8 students.", severity: "success", href: "/payments" },
    { kind: "event", title: "Event registration filling up", body: "Regional Mathematics Olympiad is at 82% capacity.", severity: "info", href: "/events" },
  ].map((n, i) => ({
    id: `ntf_${i + 1}`,
    ...n,
    kind: n.kind as AppNotification["kind"],
    severity: n.severity as AppNotification["severity"],
    read: i > 5,
    actorName: i % 3 === 0 ? "Dana Whitfield" : i % 3 === 1 ? "System" : "Amara Whitfield",
    createdAt: iso(i * 0.35),
  }));

  // -------------------------------------------------------------------- audit
  const AUDIT_TEMPLATES: [AuditEvent["action"], string, string][] = [
    ["created", "student", "Enrolled {name} into {class}"],
    ["published", "notice", "Published notice “{title}”"],
    ["invited", "user", "Invited {name} as Guardian"],
    ["updated", "class", "Updated timetable for {class}"],
    ["status_changed", "student", "Changed {name}’s status to Transferred"],
    ["marked_attendance", "class", "Marked attendance for {class}"],
    ["recorded_payment", "invoice", "Recorded a Term 2 payment for {name}"],
    ["updated", "website_page", "Edited the Homepage hero block"],
    ["created", "event", "Created event “{title}”"],
    ["archived", "notice", "Archived notice “{title}”"],
    ["exported", "student", "Exported the student register (CSV)"],
    ["imported", "student", "Imported 24 students from CSV"],
  ];

  const auditActors = [
    { id: "usr_admin", name: "Dana Whitfield", role: "admin" as const },
    { id: "usr_super", name: "Amara Whitfield", role: "super_admin" as const },
    { id: "usr_staff", name: "Musa Okafor", role: "staff" as const },
  ];

  const auditEvents: AuditEvent[] = Array.from({ length: 42 }, (_, i) => {
    const [action, resourceType, template] = AUDIT_TEMPLATES[i % AUDIT_TEMPLATES.length];
    const actor = auditActors[i % auditActors.length];
    const student = students[(i * 7) % students.length];
    const cls = classes[(i * 3) % classes.length];
    const notice = notices[(i * 5) % notices.length];
    const label = resourceType === "notice" ? notice.title : resourceType === "class" ? cls.name : `${student.firstName} ${student.lastName}`;
    return {
      id: `aud_${String(i + 1).padStart(3, "0")}`,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action,
      resourceType,
      resourceId: resourceType === "notice" ? notice.id : resourceType === "class" ? cls.id : student.id,
      resourceLabel: label,
      summary: template
        .replace("{name}", `${student.firstName} ${student.lastName}`)
        .replace("{class}", cls.name)
        .replace("{title}", notice.title),
      createdAt: iso(i * 0.42 + 0.05),
    };
  });

  // ------------------------------------------------------------------ website
  const block = (
    id: string,
    type: ContentBlock["type"],
    label: string,
    order: number,
    fields: Record<string, unknown>,
    visible = true,
  ): ContentBlock => ({ id, type, label, visible, order, fields, updatedAt: iso(intBetween(rng, 0, 14)) });

  const websitePages: WebsitePage[] = [
    {
      id: "wp_home",
      key: "homepage",
      title: "Homepage",
      path: "/",
      status: "published",
      hasUnpublishedChanges: true,
      updatedAt: iso(0.4),
      publishedAt: iso(6),
      updatedBy: "Dana Whitfield",
      seo: {
        title: "Northfield Academy — Learning that lasts",
        description: "An independent day school for Grades 6–12 in Northfield, offering inquiry-led academics, arts and athletics.",
        keywords: "school, northfield academy, admissions, grades 6-12",
      },
      blocks: [
        block("blk_home_hero", "hero", "Hero", 0, {
          headline: "A modern education, grounded in character.",
          subheadline:
            "Northfield Academy prepares curious students for a changing world through inquiry-led academics, a strong arts programme and competitive athletics.",
          primaryCtaLabel: "Start an application",
          primaryCtaHref: "/admissions",
          secondaryCtaLabel: "Book a campus tour",
          secondaryCtaHref: "/contact",
          image: photoFor("cms-hero-campus", 1600, 900),
          eyebrow: "Admissions open for 2026 – 2027",
        }),
        block("blk_home_stats", "stats", "Key statistics", 1, {
          items: [
            { label: "Students", value: "1,180" },
            { label: "Faculty", value: "96" },
            { label: "Student–teacher ratio", value: "12:1" },
            { label: "University placement", value: "98%" },
          ],
        }),
        block("blk_home_intro", "intro", "Introduction", 2, {
          title: "Where curiosity becomes capability",
          body:
            "Our programme balances academic rigour with creative and physical development. Small classes, specialist faculty and a culture of mentorship help every student find their strengths.",
          image: photoFor("cms-intro-library", 1200, 800),
        }),
        block("blk_home_featured_notices", "featured_notices", "Featured notices", 3, {
          title: "Latest from the school office",
          count: 3,
          source: "published",
        }),
        block("blk_home_featured_events", "featured_events", "Featured events", 4, {
          title: "What's coming up",
          count: 4,
        }),
        block("blk_home_cta", "cta", "Call to action", 5, {
          title: "Applications for 2026 – 2027 are open",
          body: "Submit an enquiry and our admissions team will guide you through assessments, visits and enrolment.",
          buttonLabel: "Enquire now",
          buttonHref: "/admissions",
        }),
        block("blk_home_headline", "headline", "Announcement banner", 6, {
          eyebrow: "Notice",
          title: "Founders' Day — campus closed",
          body: "The campus and transport services will be closed on Founders' Day.",
        }, false),
      ],
    },
    {
      id: "wp_about",
      key: "about",
      title: "About",
      path: "/about",
      status: "published",
      hasUnpublishedChanges: false,
      updatedAt: iso(9),
      publishedAt: iso(9),
      updatedBy: "Amara Whitfield",
      seo: {
        title: "About Northfield Academy",
        description: "Our history, mission and the people who shape Northfield Academy.",
        keywords: "about, history, mission, vision, principal",
      },
      blocks: [
        block("blk_about_history", "history", "School history", 0, {
          title: "Sixty years of Northfield",
          body:
            "Founded in 1966 as a small day school of forty students, Northfield Academy has grown into an independent institution serving families across three districts — while keeping the intimacy of its founding classrooms.",
          image: photoFor("cms-history", 1200, 800),
          milestones: [
            { year: "1966", title: "Northfield opens with 40 students" },
            { year: "1984", title: "Science and arts wings added" },
            { year: "2003", title: "Riverside campus established" },
            { year: "2024", title: "New library commons opened" },
          ],
        }),
        block("blk_about_mission", "mission_vision", "Mission & vision", 1, {
          mission:
            "To educate confident, thoughtful students who contribute to their communities with integrity and curiosity.",
          vision:
            "A school where every student is known, challenged and supported — academically, creatively and personally.",
          values: ["Curiosity", "Integrity", "Respect", "Perseverance", "Service"],
        }),
        block("blk_about_principal", "principal_message", "Principal's message", 2, {
          name: "Amara Whitfield",
          role: "Principal",
          message:
            "Our promise is simple: every child is known by name and taught by people who care about how they think, not only what they score. Visit us and you will feel it in the corridors.",
          photo: avatarFor("Amara Whitfield"),
        }),
        block("blk_about_facilities", "facilities", "Facilities", 3, {
          items: [
            { title: "Library Commons", description: "18,000 volumes, quiet study pods and a media lab.", image: photoFor("cms-fac-library", 800, 600) },
            { title: "Science Block", description: "Six specialist laboratories for physics, chemistry and biology.", image: photoFor("cms-fac-science", 800, 600) },
            { title: "Sports Ground", description: "400m track, football pitch and an indoor multi-sport hall.", image: photoFor("cms-fac-sports", 800, 600) },
            { title: "Arts Wing", description: "Studios for visual arts, ceramics, music and drama.", image: photoFor("cms-fac-arts", 800, 600) },
          ],
        }),
        block("blk_about_achievements", "achievements", "Achievements", 4, {
          items: [
            { year: "2026", title: "Regional Mathematics Olympiad — 1st place", description: "Senior team placed first among 42 schools." },
            { year: "2025", title: "National Debate Championship — finalists", description: "Grade 11 team reached the national final." },
            { year: "2025", title: "Inter-school Athletics — overall champions", description: "Won the aggregate trophy for the third year." },
          ],
        }),
      ],
    },
    {
      id: "wp_contact",
      key: "contact",
      title: "Contact",
      path: "/contact",
      status: "published",
      hasUnpublishedChanges: false,
      updatedAt: iso(14),
      publishedAt: iso(14),
      updatedBy: "Dana Whitfield",
      seo: {
        title: "Contact Northfield Academy",
        description: "Office hours, phone, email and directions to both campuses.",
        keywords: "contact, address, phone, office hours",
      },
      blocks: [
        block("blk_contact_details", "contact_details", "Contact details", 0, {
          phone: "+1 (555) 240-1100",
          secondaryPhone: "+1 (555) 240-1180",
          email: "office@northfield.edu",
          admissionsEmail: "admissions@northfield.edu",
          address: "120 Academy Drive, Northfield",
        }),
        block("blk_contact_hours", "office_hours", "Office hours", 1, {
          weekdays: "8:00 AM – 4:30 PM",
          saturday: "9:00 AM – 12:30 PM",
          sunday: "Closed",
          note: "Admissions counsellors are available by appointment during term time.",
        }),
        block("blk_contact_social", "social_links", "Social links", 2, {
          facebook: "https://facebook.com/northfieldacademy",
          instagram: "https://instagram.com/northfieldacademy",
          x: "https://x.com/northfieldacad",
          youtube: "https://youtube.com/@northfieldacademy",
          linkedin: "https://linkedin.com/school/northfield-academy",
        }),
        block("blk_contact_map", "map", "Map & directions", 3, {
          label: "Main Campus",
          latitude: "41.8781",
          longitude: "-87.6298",
          directions: "Enter from Academy Drive; visitor parking is available beside the reception block.",
        }),
      ],
    },
    {
      id: "wp_other",
      key: "other",
      title: "Other content",
      path: "/other",
      status: "draft",
      hasUnpublishedChanges: true,
      updatedAt: iso(1.2),
      updatedBy: "Dana Whitfield",
      seo: {
        title: "Academics, admissions & gallery",
        description: "Supporting content blocks used across the public website.",
        keywords: "academics, admissions, gallery, faculty",
      },
      blocks: [
        block("blk_other_announcements", "announcements", "Announcements", 0, {
          items: [
            { title: "Term 2 fee window open", body: "Instalments can be paid through the guardian portal.", date: toDateKey(addDays(now, -2)) },
            { title: "Uniform shop timings", body: "Open Tuesday and Thursday, 9:00 AM – 1:00 PM.", date: toDateKey(addDays(now, -8)) },
          ],
        }),
        block("blk_other_academics", "academics", "Academic information", 1, {
          title: "A programme built around depth",
          body: "Students progress through a middle-years foundation into specialised senior pathways with guided electives.",
          programs: [
            { title: "Middle Years (6–8)", description: "Broad foundation with integrated science and languages." },
            { title: "Senior School (9–10)", description: "Specialist sciences, humanities and first electives." },
            { title: "Advanced Pathways (11–12)", description: "Focused streams with university counselling." },
          ],
        }),
        block("blk_other_admissions", "admissions_info", "Admission information", 2, {
          title: "How admissions work",
          body: "Four straightforward steps from enquiry to enrolment.",
          deadline: toDateKey(addDays(now, 46)),
          steps: [
            { title: "Enquiry", description: "Submit the online enquiry form." },
            { title: "Assessment", description: "Grade-appropriate assessment and interaction." },
            { title: "Offer", description: "Offer letter with fee schedule." },
            { title: "Enrolment", description: "Document verification and seat confirmation." },
          ],
        }),
        block("blk_other_faculty", "faculty", "Faculty information", 3, {
          title: "Taught by specialists",
          body: "96 faculty members across ten departments, with an average of eleven years of classroom experience.",
          highlightStaffIds: staff.slice(0, 4).map((s) => s.id),
        }),
        block("blk_other_gallery", "gallery_grid", "Gallery grid", 4, {
          title: "Life at Northfield",
          albumIds: ["alb_1", "alb_2", "alb_4"],
        }),
      ],
    },
  ];

  const settings: SchoolSettings = {
    name: "Northfield Academy",
    shortName: "Northfield",
    tagline: "Learning that lasts",
    description:
      "An independent day school for Grades 6–12 offering inquiry-led academics, a strong arts programme and competitive athletics across two campuses.",
    email: "office@northfield.edu",
    phone: "+1 (555) 240-1100",
    address: "120 Academy Drive",
    city: "Northfield",
    country: "United States",
    website: "https://northfield.edu",
    officeHours: "Mon – Fri · 8:00 AM – 4:30 PM",
    established: 1966,
    branding: { primaryHue: "Institutional Blue", accentHue: "Signal Orange", logoMark: "NA" },
    socials: {
      facebook: "https://facebook.com/northfieldacademy",
      instagram: "https://instagram.com/northfieldacademy",
      x: "https://x.com/northfieldacad",
      youtube: "https://youtube.com/@northfieldacademy",
      linkedin: "https://linkedin.com/school/northfield-academy",
    },
    seo: {
      metaTitle: "Northfield Academy — Learning that lasts",
      metaDescription:
        "Independent day school for Grades 6–12. Inquiry-led academics, arts and athletics in Northfield.",
      keywords: "school, academy, admissions, grades 6-12, northfield",
      indexable: true,
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      digestFrequency: "daily",
      rules: [
        { id: "rule_admission", label: "New admission application", description: "When a new application is submitted through the website.", email: true, sms: false, inApp: true },
        { id: "rule_attendance", label: "Attendance not marked", description: "When a class register is unsubmitted after 10:00 AM.", email: true, sms: false, inApp: true },
        { id: "rule_payment", label: "Payment overdue", description: "When an invoice passes its due date.", email: true, sms: true, inApp: true },
        { id: "rule_notice", label: "Notice published", description: "When a notice goes live to any audience.", email: false, sms: false, inApp: true },
        { id: "rule_invite", label: "Invitation activity", description: "When invitations are accepted, expire or are revoked.", email: true, sms: false, inApp: true },
      ],
    },
    security: {
      passwordMinLength: 10,
      requireMfaForAdmins: true,
      sessionTimeoutMins: 60,
      allowGuardianSelfSignup: false,
    },
    publicSite: { enabled: true, maintenanceMode: false, showAdmissions: true, showGallery: true },
  };

  return {
    meta: { seedDate: todayKey(), version: 3 },
    branches,
    academicYears,
    classes,
    courses,
    staff,
    students,
    users,
    roles,
    sessions,
    attendance,
    attendanceTrend,
    enrollmentTrend,
    notices,
    events,
    albums,
    applications,
    drivers,
    routes,
    vehicles,
    feeStructures,
    invoices,
    payments,
    notifications,
    auditEvents,
    websitePages,
    settings,
  };
}
