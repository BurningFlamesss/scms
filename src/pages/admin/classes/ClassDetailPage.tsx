import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ClipboardCheck, DoorOpen, Users } from "lucide-react";
import { getClassDetail } from "#/services/academics";
import { Panel, KeyValue } from "#/components/common/Panel";
import { DetailSkeleton } from "#/components/common/Skeletons";
import { EmptyState } from "#/components/common/EmptyState";
import { StatusBadge } from "#/components/common/StatusBadge";
import { PersonCell } from "#/components/common/PersonCell";
import { Button } from "#/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { useAuth } from "#/providers/AuthProvider";
import { cn } from "#/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

export default function ClassDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { can } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["class-detail", id], queryFn: () => getClassDetail(id) });

  if (isLoading) return <DetailSkeleton />;
  if (!data) {
    return (
      <div className="panel">
        <EmptyState
          title="Class not found"
          description="This class may have been removed for the current academic year."
          primaryLabel="Back to classes"
          onPrimary={() => navigate("/admin/classes")}
        />
      </div>
    );
  }

  const { cls, teacher, students, courses, attendance } = data;

  return (
    <div data-testid="class-detail-page">
      <Button variant="ghost" size="sm" className="mb-3 gap-1.5 text-xs" asChild>
        <Link to="/admin/classes">
          <ArrowLeft className="h-3.5 w-3.5" /> Classes
        </Link>
      </Button>

      <div className="panel mb-5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-semibold tracking-[-0.02em] text-foreground" data-testid="class-name">
              {cls.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <DoorOpen className="h-3.5 w-3.5" /> Room {cls.roomNo}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {cls.studentCount} of {cls.capacity} seats
              </span>
              <span>Academic year 2025 – 2026</span>
              <span>{cls.branchId === "branch_main" ? "Main Campus" : "Riverside Campus"}</span>
            </div>
          </div>
          {can("attendance.mark") && (
            <Button size="sm" className="gap-1.5" asChild data-testid="class-mark-attendance">
              <Link to={`/admin/attendance?class=${cls.id}`}>
                <ClipboardCheck className="h-3.5 w-3.5" /> Mark attendance
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Tabs defaultValue="students">
            <TabsList className="mb-4 h-9">
              <TabsTrigger value="students" className="text-xs" data-testid="class-tab-students">
                Students
              </TabsTrigger>
              <TabsTrigger value="subjects" className="text-xs" data-testid="class-tab-subjects">
                Subjects
              </TabsTrigger>
              <TabsTrigger value="schedule" className="text-xs" data-testid="class-tab-schedule">
                Schedule
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students">
              <Panel title="Class list" description={`${students.length} students`} bodyClassName="p-2" testId="class-students-panel">
                {students.length ? (
                  <ul className="divide-y divide-hairline">
                    {students
                      .slice()
                      .sort((a, b) => a.rollNo - b.rollNo)
                      .map((student) => (
                        <li key={student.id} className="flex items-center gap-3 px-2 py-2">
                          <span className="num w-6 shrink-0 text-xs text-muted-foreground">{student.rollNo}</span>
                          <PersonCell
                            name={`${student.firstName} ${student.lastName}`}
                            subtitle={student.admissionNo}
                            avatarUrl={student.avatarUrl}
                            to={`/admin/students/${student.id}`}
                            mono
                          />
                          <span className="num ml-auto shrink-0 text-xs text-muted-foreground">
                            {student.attendanceRate}%
                          </span>
                          <StatusBadge value={student.status} />
                        </li>
                      ))}
                  </ul>
                ) : (
                  <EmptyState compact title="No students in this class" description="Transfer or enroll students to populate the class list." />
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="subjects">
              <Panel title="Subjects taught" bodyClassName="p-2" testId="class-subjects-panel">
                <ul className="divide-y divide-hairline">
                  {courses.map((course) => (
                    <li key={course.id} className="flex items-center gap-3 px-2 py-2.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary font-mono text-[10px] text-muted-foreground">
                        {course.code.split("-")[0]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link to={`/admin/courses/${course.id}`} className="block truncate text-sm text-foreground hover:text-primary">
                          {course.name}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">{course.department}</p>
                      </div>
                      <span className="num text-xs text-muted-foreground">{course.weeklyHours}h/week</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </TabsContent>

            <TabsContent value="schedule">
              <Panel title="Weekly timetable" testId="class-schedule-panel" bodyClassName="p-3">
                <div className="grid gap-3 sm:grid-cols-5">
                  {DAYS.map((day) => (
                    <div key={day}>
                      <p className="eyebrow-label mb-1.5">{day}</p>
                      <ul className="space-y-1.5">
                        {cls.schedule
                          .filter((period) => period.day === day)
                          .map((period) => (
                            <li key={period.id} className="rounded-md border border-hairline bg-surface-2 p-2">
                              <p className="num text-[10px] text-muted-foreground">
                                {period.start} – {period.end}
                              </p>
                              <p className="mt-0.5 truncate text-xs font-medium text-foreground">{period.courseName}</p>
                              <p className="truncate text-[11px] text-muted-foreground">{period.staffName}</p>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Panel>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Panel title="Class teacher" testId="class-teacher-panel">
            {teacher ? (
              <div className="flex items-center gap-3">
                <img src={teacher.avatarUrl} alt="" className="h-10 w-10 rounded-lg border border-hairline" />
                <div className="min-w-0">
                  <Link to={`/admin/staff/${teacher.id}`} className="block truncate text-sm font-medium text-foreground hover:text-primary">
                    {teacher.firstName} {teacher.lastName}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {teacher.designation} · {teacher.department}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState compact title="No class teacher assigned yet" description="Nominate a member of staff to oversee this class." />
            )}
          </Panel>

          <Panel title="Attendance today" testId="class-attendance-panel">
            <p className="num font-display text-2xl font-semibold text-foreground">{attendance.rate}%</p>
            <div className="mt-3 space-y-2">
              {[
                { label: "Present", value: attendance.present, className: "bg-present" },
                { label: "Late", value: attendance.late, className: "bg-late" },
                { label: "Excused", value: attendance.excused, className: "bg-excused" },
                { label: "Absent", value: attendance.absent, className: "bg-absent" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2 text-xs">
                  <span className={cn("h-1.5 w-1.5 rounded-full", row.className)} />
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="num ml-auto font-medium text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Class details" testId="class-meta-panel">
            <div className="space-y-3">
              <KeyValue label="Grade" value={cls.grade} />
              <KeyValue label="Section" value={cls.section} />
              <KeyValue label="Room" value={cls.roomNo} mono />
              <KeyValue label="Capacity" value={`${cls.studentCount} / ${cls.capacity}`} />
              <KeyValue label="Subjects" value={String(courses.length)} />
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
