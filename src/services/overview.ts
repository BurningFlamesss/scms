import type {
  AppNotification,
  Application,
  AttendanceDayPoint,
  AuditEvent,
  EnrollmentPoint,
  Notice,
  SchoolClass,
  SchoolEvent,
  StaffMember,
  Student,
} from "@/types";
import { db, latency } from "@/lib/db";
import { todayKey } from "@/lib/format";

export interface OverviewMetric {
  key: string;
  label: string;
  value: string;
  delta?: string;
  trend: "up" | "down" | "flat";
  tone: "neutral" | "accent" | "success" | "warning";
  href: string;
  spark: number[];
}

export interface PendingAction {
  id: string;
  label: string;
  detail: string;
  count: number;
  tone: "accent" | "warning" | "critical" | "neutral";
  href: string;
}

export interface OverviewData {
  metrics: OverviewMetric[];
  attendance: {
    date: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
    unmarked: number;
    rate: number;
    unmarkedClasses: SchoolClass[];
  };
  attendanceTrend: AttendanceDayPoint[];
  enrollmentTrend: EnrollmentPoint[];
  upcomingEvents: SchoolEvent[];
  recentNotices: Notice[];
  pendingActions: PendingAction[];
  recentStudents: Student[];
  recentActivity: AuditEvent[];
  staffOnLeave: StaffMember[];
  newApplications: Application[];
  notifications: AppNotification[];
  gradeDistribution: { grade: string; students: number; capacity: number }[];
}

function spark(base: number, points = 8): number[] {
  return Array.from({ length: points }, (_, i) =>
    Math.max(0, Math.round(base * (0.9 + Math.sin(i * 1.1) * 0.06 + i * 0.01))),
  );
}

export async function getOverview(): Promise<OverviewData> {
  await latency(360);
  const data = db();
  const today = todayKey();

  const activeStudents = data.students.filter((s) => s.status === "active");
  const activeStaff = data.staff.filter((s) => s.employmentStatus === "active");
  const todayRecords = data.attendance.filter((a) => a.date === today && a.personType === "student");
  const present = todayRecords.filter((r) => r.state === "present").length;
  const late = todayRecords.filter((r) => r.state === "late").length;
  const absent = todayRecords.filter((r) => r.state === "absent").length;
  const excused = todayRecords.filter((r) => r.state === "excused").length;
  const rate = todayRecords.length ? Math.round(((present + late) / todayRecords.length) * 1000) / 10 : 0;

  const markedClassIds = new Set(todayRecords.map((r) => r.classId));
  const unmarkedClasses = data.classes.filter((c) => !markedClassIds.has(c.id) && c.studentCount > 0);

  const pendingApplications = data.applications.filter((a) => a.status === "pending");
  const upcoming = data.events
    .filter((e) => e.startDate >= today && e.status !== "cancelled" && e.status !== "draft")
    .sort((a, b) => (a.startDate < b.startDate ? -1 : 1));
  const publishedNotices = data.notices
    .filter((n) => n.status === "published")
    .sort((a, b) => (a.publishAt < b.publishAt ? 1 : -1));
  const overdueInvoices = data.invoices.filter((i) => i.status === "overdue");
  const expiringInvites = data.users.filter(
    (u) =>
      u.invitationStatus === "pending" &&
      u.invitationExpiresAt &&
      new Date(u.invitationExpiresAt).getTime() - Date.now() < 3 * 86400000,
  );
  const draftNotices = data.notices.filter((n) => n.status === "draft");
  const unpublishedPages = data.websitePages.filter((p) => p.hasUnpublishedChanges);

  const metrics: OverviewMetric[] = [
    {
      key: "students",
      label: "Students",
      value: activeStudents.length.toLocaleString(),
      delta: "+12 this term",
      trend: "up",
      tone: "neutral",
      href: "/students",
      spark: spark(activeStudents.length),
    },
    {
      key: "staff",
      label: "Active staff",
      value: String(activeStaff.length),
      delta: `${data.staff.length - activeStaff.length} inactive`,
      trend: "flat",
      tone: "neutral",
      href: "/staff",
      spark: spark(activeStaff.length),
    },
    {
      key: "attendance",
      label: "Attendance today",
      value: `${rate}%`,
      delta: `${absent} absent · ${late} late`,
      trend: rate >= 95 ? "up" : "down",
      tone: rate >= 95 ? "success" : "warning",
      href: "/attendance",
      spark: data.attendanceTrend.slice(-8).map((p) => p.rate),
    },
    {
      key: "admissions",
      label: "Pending admissions",
      value: String(pendingApplications.length),
      delta: "awaiting review",
      trend: "up",
      tone: "accent",
      href: "/admissions",
      spark: spark(pendingApplications.length),
    },
    {
      key: "events",
      label: "Upcoming events",
      value: String(upcoming.length),
      delta: upcoming[0] ? `next: ${upcoming[0].startDate}` : "none scheduled",
      trend: "flat",
      tone: "neutral",
      href: "/events",
      spark: spark(upcoming.length),
    },
    {
      key: "notices",
      label: "Live notices",
      value: String(publishedNotices.length),
      delta: `${draftNotices.length} in draft`,
      trend: "flat",
      tone: "neutral",
      href: "/notices",
      spark: spark(publishedNotices.length),
    },
    {
      key: "fees",
      label: "Fees outstanding",
      value: `$${Math.round(
        data.invoices.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0) / 1000,
      )}k`,
      delta: `${overdueInvoices.length} overdue`,
      trend: "down",
      tone: overdueInvoices.length > 8 ? "warning" : "neutral",
      href: "/payments",
      spark: spark(overdueInvoices.length + 10),
    },
    {
      key: "transport",
      label: "Students on transport",
      value: String(new Set(data.routes.flatMap((r) => r.assignedStudentIds)).size),
      delta: `${data.routes.filter((r) => r.status === "active").length} active routes`,
      trend: "flat",
      tone: "neutral",
      href: "/transportation",
      spark: spark(24),
    },
  ];

  const pendingActions: PendingAction[] = [
    {
      id: "pa_attendance",
      label: "Registers not submitted",
      detail: unmarkedClasses.length
        ? `${unmarkedClasses
            .slice(0, 3)
            .map((c) => c.name)
            .join(", ")}${unmarkedClasses.length > 3 ? " and more" : ""}`
        : "Every class has submitted today's register",
      count: unmarkedClasses.length,
      tone: unmarkedClasses.length ? "warning" : "neutral",
      href: "/attendance",
    },
    {
      id: "pa_admissions",
      label: "Applications awaiting review",
      detail: pendingApplications.length
        ? `Oldest submitted ${new Date(
            pendingApplications[pendingApplications.length - 1].submittedAt,
          ).toLocaleDateString()}`
        : "No applications in the queue",
      count: pendingApplications.length,
      tone: pendingApplications.length ? "accent" : "neutral",
      href: "/admissions",
    },
    {
      id: "pa_fees",
      label: "Overdue invoices",
      detail: `$${overdueInvoices
        .reduce((sum, i) => sum + (i.amount - i.amountPaid), 0)
        .toLocaleString()} outstanding`,
      count: overdueInvoices.length,
      tone: overdueInvoices.length ? "critical" : "neutral",
      href: "/payments",
    },
    {
      id: "pa_invites",
      label: "Invitations expiring soon",
      detail: expiringInvites.length
        ? expiringInvites.map((u) => u.name).slice(0, 2).join(", ")
        : "No invitations expiring",
      count: expiringInvites.length,
      tone: expiringInvites.length ? "warning" : "neutral",
      href: "/users",
    },
    {
      id: "pa_notices",
      label: "Notices in draft",
      detail: draftNotices.length ? draftNotices[0].title : "Nothing waiting to publish",
      count: draftNotices.length,
      tone: draftNotices.length ? "neutral" : "neutral",
      href: "/notices?status=draft",
    },
    {
      id: "pa_website",
      label: "Website changes unpublished",
      detail: unpublishedPages.length
        ? unpublishedPages.map((p) => p.title).join(", ")
        : "Website is up to date",
      count: unpublishedPages.length,
      tone: unpublishedPages.length ? "accent" : "neutral",
      href: "/website",
    },
  ];

  const grades = Array.from(new Set(data.classes.map((c) => c.grade)));
  const gradeDistribution = grades.map((grade) => ({
    grade: grade.replace("Grade ", "G"),
    students: activeStudents.filter((s) => s.grade === grade).length,
    capacity: data.classes.filter((c) => c.grade === grade).reduce((sum, c) => sum + c.capacity, 0),
  }));

  return {
    metrics,
    attendance: {
      date: today,
      present,
      absent,
      late,
      excused,
      unmarked: Math.max(0, activeStudents.length - todayRecords.length),
      rate,
      unmarkedClasses,
    },
    attendanceTrend: data.attendanceTrend,
    enrollmentTrend: data.enrollmentTrend,
    upcomingEvents: upcoming.slice(0, 5),
    recentNotices: publishedNotices.slice(0, 5),
    pendingActions,
    recentStudents: [...data.students]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 5),
    recentActivity: data.auditEvents.slice(0, 7),
    staffOnLeave: data.staff.filter((s) => s.employmentStatus === "on_leave").slice(0, 4),
    newApplications: pendingApplications.slice(0, 4),
    notifications: data.notifications.slice(0, 5),
    gradeDistribution,
  };
}
