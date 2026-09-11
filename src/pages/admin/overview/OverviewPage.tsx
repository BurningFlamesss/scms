import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  CalendarPlus,
  ClipboardCheck,
  Megaphone,
  UploadCloud,
  UserPlus,
} from "lucide-react";
import { getOverview } from "#/services/overview";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { MetricsStrip } from "#/components/common/MetricsStrip";
import { MetricsSkeleton, PanelSkeleton, ListSkeleton } from "#/components/common/Skeletons";
import { ErrorState } from "#/components/common/ErrorState";
import { StatusBadge } from "#/components/common/StatusBadge";
import { PersonCell } from "#/components/common/PersonCell";
import { Timeline } from "#/components/common/Timeline";
import { EmptyState } from "#/components/common/EmptyState";
import { Button } from "#/components/ui/button";
import { formatDate, formatNumber, relativeTime } from "#/lib/format";
import { cn } from "#/lib/utils";

const ATTENDANCE_STATES = [
  { key: "present", label: "Present", className: "bg-present" },
  { key: "late", label: "Late", className: "bg-late" },
  { key: "excused", label: "Excused", className: "bg-excused" },
  { key: "absent", label: "Absent", className: "bg-absent" },
] as const;

const TONE_RING: Record<string, string> = {
  accent: "text-accent bg-accent/12",
  warning: "text-warning bg-warning/15",
  critical: "text-destructive bg-destructive/12",
  neutral: "text-muted-foreground bg-muted",
};

export default function OverviewPage() {
  const { user, can } = useAuth();
  const navigate = useNavigate();
  const [attendanceView, setAttendanceView] = useState<"today" | "trend">("today");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["overview"],
    queryFn: getOverview,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name.split(" ")[0] ?? "there";

  if (isError) {
    return (
      <div className="panel">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const attendance = data?.attendance;
  const totalMarked = attendance ? attendance.present + attendance.late + attendance.excused + attendance.absent : 0;

  return (
    <div data-testid="overview-page">
      <PageHeader
        wash
        eyebrow={`${formatDate(new Date())} · Academic year 2025 – 2026`}
        title={`${greeting}, ${firstName}`}
        description="Everything happening across Northfield Academy right now — attendance, admissions, communications and finance."
        meta={
          <>
            <span>Main Campus</span>
            <span>Term 2 · Week 6</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> All systems operational
            </span>
          </>
        }
        actions={
          <>
            {can("attendance.mark") && (
              <Button variant="outline" size="sm" className="gap-1.5" data-testid="overview-mark-attendance" asChild>
                <Link to="/attendance">
                  <ClipboardCheck className="h-3.5 w-3.5" /> Mark attendance
                </Link>
              </Button>
            )}
            {can("notices.manage") && (
              <Button size="sm" className="gap-1.5" data-testid="overview-write-notice" asChild>
                <Link to="/notices/new">
                  <Megaphone className="h-3.5 w-3.5" /> Write a notice
                </Link>
              </Button>
            )}
          </>
        }
      />

      {isLoading || !data ? (
        <div className="space-y-5">
          <MetricsSkeleton />
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <PanelSkeleton height="h-56" />
            </div>
            <div className="lg:col-span-5">
              <PanelSkeleton height="h-56" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <MetricsStrip metrics={data.metrics} />

          <div className="grid gap-5 lg:grid-cols-12">
            {/* Attendance ------------------------------------------------ */}
            <Panel
              className="lg:col-span-7"
              title="Attendance"
              description={`${formatDate(attendance?.date)} · ${formatNumber(totalMarked)} of ${formatNumber(
                totalMarked + (attendance?.unmarked ?? 0),
              )} students marked`}
              testId="overview-attendance-panel"
              actions={
                <div className="flex rounded-md border border-hairline bg-surface-2 p-0.5">
                  {(["today", "trend"] as const).map((view) => (
                    <button
                      key={view}
                      type="button"
                      data-testid={`attendance-view-${view}`}
                      onClick={() => setAttendanceView(view)}
                      className={cn(
                        "rounded px-2.5 py-1 text-xs capitalize transition-colors",
                        attendanceView === view
                          ? "bg-surface-1 font-medium text-foreground shadow-panel"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {view === "today" ? "Today" : "22 days"}
                    </button>
                  ))}
                </div>
              }
            >
              {attendanceView === "today" ? (
                <div>
                  <div className="flex flex-wrap items-end gap-6">
                    <div>
                      <p className="num font-display text-3xl font-semibold leading-none text-foreground">
                        {attendance?.rate ?? 0}%
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Present or late today</p>
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                      {ATTENDANCE_STATES.map((state) => (
                        <div key={state.key} data-testid={`attendance-count-${state.key}`}>
                          <div className="flex items-center gap-1.5">
                            <span className={cn("h-1.5 w-1.5 rounded-full", state.className)} />
                            <span className="text-[11px] text-muted-foreground">{state.label}</span>
                          </div>
                          <p className="num mt-0.5 text-lg font-semibold text-foreground">
                            {attendance ? attendance[state.key] : 0}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                    {ATTENDANCE_STATES.map((state) => {
                      const value = attendance ? attendance[state.key] : 0;
                      const pct = totalMarked ? (value / totalMarked) * 100 : 0;
                      return (
                        <span
                          key={state.key}
                          className={state.className}
                          style={{ width: `${pct}%` }}
                          title={`${state.label}: ${value}`}
                        />
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-lg border border-hairline bg-surface-2 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-foreground">
                        {attendance?.unmarkedClasses.length
                          ? `${attendance.unmarkedClasses.length} registers still open`
                          : "Every register has been submitted"}
                      </p>
                      {can("attendance.mark") && attendance?.unmarkedClasses.length ? (
                        <Link
                          to="/attendance"
                          className="text-xs text-primary hover:underline"
                          data-testid="overview-open-attendance"
                        >
                          Open register
                        </Link>
                      ) : null}
                    </div>
                    {attendance?.unmarkedClasses.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {attendance.unmarkedClasses.slice(0, 8).map((cls) => (
                          <Link
                            key={cls.id}
                            to={`/attendance?class=${cls.id}`}
                            className="rounded-full border border-hairline bg-surface-1 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                          >
                            {cls.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="h-[232px]" data-testid="attendance-trend-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.attendanceTrend} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
                      <defs>
                        <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.22} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="hsl(var(--hairline))" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value: string) => value.slice(5)}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        interval={3}
                      />
                      <YAxis
                        domain={[80, 100]}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <ChartTooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--hairline))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="rate"
                        name="Attendance %"
                        stroke="hsl(var(--primary))"
                        strokeWidth={1.6}
                        fill="url(#attendanceFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            {/* Pending actions ------------------------------------------ */}
            <Panel
              className="lg:col-span-5"
              title="Needs attention"
              description="Work waiting on the school office"
              testId="overview-pending-actions"
              bodyClassName="p-2"
            >
              <ul className="divide-y divide-hairline">
                {data.pendingActions.map((action) => (
                  <li key={action.id}>
                    <Link
                      to={action.href}
                      data-testid={`pending-action-${action.id}`}
                      className="group flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-2 focus-ring"
                    >
                      <span
                        className={cn(
                          "num grid h-8 w-8 shrink-0 place-items-center rounded-md text-xs font-semibold",
                          TONE_RING[action.tone],
                        )}
                      >
                        {action.count}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{action.label}</span>
                        <span className="block truncate text-xs text-muted-foreground">{action.detail}</span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Enrollment ------------------------------------------------ */}
            <Panel
              className="lg:col-span-7"
              title="Enrolment & admissions"
              description="Active students against capacity, with monthly admissions"
              testId="overview-enrollment-panel"
            >
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.enrollmentTrend} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
                    <CartesianGrid stroke="hsl(var(--hairline))" vertical={false} />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--hairline))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="admissions" name="New admissions" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} barSize={12} />
                    <Line
                      type="monotone"
                      dataKey="students"
                      name="Enrolled students"
                      stroke="hsl(var(--primary))"
                      strokeWidth={1.8}
                      dot={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-hairline pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-4 rounded-full bg-primary" /> Enrolled students
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-4 rounded-full bg-accent" /> New admissions
                </span>
                <span className="ml-auto">Capacity {formatNumber(data.enrollmentTrend[0]?.capacity ?? 0)} seats</span>
              </div>
            </Panel>

            {/* Upcoming events ------------------------------------------ */}
            <Panel
              className="lg:col-span-5"
              title="Upcoming events"
              testId="overview-events-panel"
              bodyClassName="p-2"
              actions={
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild data-testid="overview-all-events">
                  <Link to="/events">All events</Link>
                </Button>
              }
            >
              {data.upcomingEvents.length === 0 ? (
                <EmptyState
                  compact
                  icon={CalendarPlus}
                  title="No events scheduled"
                  description="Add exams, sports fixtures or meetings so families can plan ahead."
                  primaryLabel={can("events.manage") ? "Schedule an event" : undefined}
                  onPrimary={() => navigate("/events?new=1")}
                  testId="overview-events-empty"
                />
              ) : (
                <ul className="divide-y divide-hairline">
                  {data.upcomingEvents.map((event) => (
                    <li key={event.id}>
                      <Link
                        to={`/events/${event.id}`}
                        className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-2 focus-ring"
                        data-testid={`overview-event-${event.id}`}
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-hairline bg-surface-2 text-center">
                          <span className="num block text-[13px] font-semibold leading-none text-foreground">
                            {new Date(event.startDate).getDate()}
                          </span>
                          <span className="block text-[9px] uppercase tracking-wide text-muted-foreground">
                            {new Date(event.startDate).toLocaleDateString(undefined, { month: "short" })}
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">{event.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {event.allDay ? "All day" : event.startTime} · {event.location}
                          </span>
                        </span>
                        <StatusBadge value={event.category} label={event.category} dot={false} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {/* Notices --------------------------------------------------- */}
            <Panel
              className="lg:col-span-7"
              title="Recent notices"
              testId="overview-notices-panel"
              bodyClassName="p-2"
              actions={
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link to="/notices">All notices</Link>
                </Button>
              }
            >
              {data.recentNotices.length === 0 ? (
                <EmptyState
                  compact
                  icon={Megaphone}
                  title="Nothing published yet"
                  description="Publish your first notice to reach students, guardians or staff."
                  primaryLabel={can("notices.manage") ? "Write a notice" : undefined}
                  onPrimary={() => navigate("/notices/new")}
                />
              ) : (
                <ul className="divide-y divide-hairline">
                  {data.recentNotices.map((notice) => (
                    <li key={notice.id}>
                      <Link
                        to={`/notices/${notice.id}`}
                        className="group flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-2 focus-ring"
                        data-testid={`overview-notice-${notice.id}`}
                      >
                        <span
                          className={cn(
                            "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                            notice.priority === "urgent"
                              ? "bg-priority-urgent"
                              : notice.priority === "high"
                                ? "bg-priority-high"
                                : notice.priority === "normal"
                                  ? "bg-priority-normal"
                                  : "bg-priority-low",
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">{notice.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {notice.audience.map((a) => a.label).join(" · ")} · {relativeTime(notice.publishAt)}
                          </span>
                        </span>
                        <span className="num shrink-0 text-xs text-muted-foreground">{notice.views} views</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {/* Activity -------------------------------------------------- */}
            <Panel
              className="lg:col-span-5"
              title="Recent activity"
              testId="overview-activity-panel"
              actions={
                can("activity.view") ? (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                    <Link to="/activity">Full log</Link>
                  </Button>
                ) : null
              }
            >
              {data.recentActivity.length === 0 ? (
                <ListSkeleton rows={3} />
              ) : (
                <Timeline
                  testId="overview-activity-timeline"
                  items={data.recentActivity.map((event) => ({
                    id: event.id,
                    title: event.summary,
                    actor: event.actorName,
                    at: event.createdAt,
                    chip: event.resourceType.replace(/_/g, " "),
                    tone:
                      event.action === "deleted"
                        ? "negative"
                        : event.action === "published" || event.action === "created"
                          ? "positive"
                          : "neutral",
                  }))}
                />
              )}
            </Panel>

            {/* Recently added students ----------------------------------- */}
            <Panel
              className="lg:col-span-6"
              title="Recently added students"
              testId="overview-recent-students"
              bodyClassName="p-2"
              actions={
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link to="/students">Register</Link>
                </Button>
              }
            >
              <ul className="divide-y divide-hairline">
                {data.recentStudents.map((student) => (
                  <li key={student.id} className="flex items-center gap-3 px-2 py-2">
                    <PersonCell
                      name={`${student.firstName} ${student.lastName}`}
                      subtitle={student.admissionNo}
                      avatarUrl={student.avatarUrl}
                      to={`/students/${student.id}`}
                      mono
                      testId={`overview-student-${student.id}`}
                    />
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {student.grade} · {student.section}
                    </span>
                    <StatusBadge value={student.status} />
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Grade distribution --------------------------------------- */}
            <Panel
              className="lg:col-span-6"
              title="Cohort strength"
              description="Enrolled students against seat capacity by grade"
              testId="overview-grade-distribution"
            >
              <ul className="space-y-2.5">
                {data.gradeDistribution.map((row) => {
                  const pct = row.capacity ? Math.round((row.students / row.capacity) * 100) : 0;
                  return (
                    <li key={row.grade} className="flex items-center gap-3">
                      <span className="w-8 shrink-0 text-xs font-medium text-muted-foreground">{row.grade}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                        <span
                          className={cn("block h-full rounded-full", pct > 92 ? "bg-accent" : "bg-primary")}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </span>
                      <span className="num w-16 shrink-0 text-right text-xs text-foreground">
                        {row.students}/{row.capacity}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-hairline pt-3 sm:grid-cols-4">
                {[
                  { label: "Enroll student", icon: UserPlus, to: "/students?new=1", permission: "students.manage" as const },
                  { label: "Import CSV", icon: UploadCloud, to: "/students?import=1", permission: "students.manage" as const },
                  { label: "New event", icon: CalendarPlus, to: "/events?new=1", permission: "events.manage" as const },
                  { label: "Website", icon: Megaphone, to: "/website", permission: "website.view" as const },
                ]
                  .filter((action) => can(action.permission))
                  .map((action) => (
                    <Link
                      key={action.label}
                      to={action.to}
                      data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
                      className="flex items-center gap-2 rounded-md border border-hairline bg-surface-2 px-2.5 py-2 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-surface-1 focus-ring"
                    >
                      <action.icon className="h-3.5 w-3.5 text-primary" />
                      <span className="truncate">{action.label}</span>
                    </Link>
                  ))}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
