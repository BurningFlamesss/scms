import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  Bus,
  CalendarDays,
  Download,
  FileText,
  GraduationCap,
  MailPlus,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import { deleteStudent, getStudent, inviteGuardian, setStudentStatus } from "#/services/students";
import { getStudentAttendance, listClasses, getClassDetail } from "#/services/academics";
import { listAudit } from "#/services/audit";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel, KeyValue } from "#/components/common/Panel";
import { StatusBadge } from "#/components/common/StatusBadge";
import { DetailSkeleton } from "#/components/common/Skeletons";
import { EmptyState } from "#/components/common/EmptyState";
import { Timeline } from "#/components/common/Timeline";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { StudentFormDialog } from "#/pages/admin/students/StudentFormDialog";
import { Button } from "#/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { Separator } from "#/components/ui/separator";
import { downloadTextFile, formatCurrency, formatDate, formatDateTime, toCsv } from "#/lib/format";
import { cn } from "#/lib/utils";

const TABS = [
  { key: "personal", label: "Personal" },
  { key: "academic", label: "Academic" },
  { key: "guardian", label: "Guardian" },
  { key: "attendance", label: "Attendance" },
  { key: "courses", label: "Courses" },
  { key: "documents", label: "Documents" },
  { key: "activity", label: "Activity" },
];

export default function StudentProfilePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { actor, can } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ title: string; description: string; label: string; destructive?: boolean; run: () => void } | null>(null);

  const { data: student, isLoading } = useQuery({ queryKey: ["student", id], queryFn: () => getStudent(id) });
  const { data: attendance } = useQuery({
    queryKey: ["student-attendance", id],
    queryFn: () => getStudentAttendance(id),
    enabled: Boolean(student),
  });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => listClasses() });
  const { data: classDetail } = useQuery({
    queryKey: ["class-detail", student?.classId],
    queryFn: () => getClassDetail(student!.classId),
    enabled: Boolean(student?.classId),
  });
  const { data: activity = [] } = useQuery({
    queryKey: ["audit", "student", id],
    queryFn: () => listAudit({ search: student ? `${student.firstName} ${student.lastName}` : "", limit: 12 }),
    enabled: Boolean(student),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["student", id] });
    qc.invalidateQueries({ queryKey: ["students"] });
    qc.invalidateQueries({ queryKey: ["overview"] });
  };

  const statusMutation = useMutation({
    mutationFn: (next: "inactive" | "graduated" | "suspended" | "active") => setStudentStatus(id, next, actor),
    onSuccess: (updated) => {
      toast.success(`Status changed to ${updated.status}`);
      setConfirm(null);
      invalidate();
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () => inviteGuardian(id, actor),
    onSuccess: (updated) => {
      toast.success(`Invitation sent to ${updated.guardian.name}`);
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudent(id, actor),
    onSuccess: () => {
      toast.success("Student record deleted");
      navigate("/admin/students");
    },
  });

  if (isLoading) return <DetailSkeleton />;

  if (!student) {
    return (
      <div className="panel">
        <EmptyState
          title="Student not found"
          description="This record may have been deleted or the link is out of date."
          primaryLabel="Back to register"
          onPrimary={() => navigate("/admin/students")}
          testId="student-not-found"
        />
      </div>
    );
  }

  const fullName = `${student.firstName} ${student.lastName}`;
  const exportRecord = () => {
    downloadTextFile(
      `${student.admissionNo}.csv`,
      toCsv([
        {
          admissionNo: student.admissionNo,
          name: fullName,
          grade: student.grade,
          section: student.section,
          rollNo: student.rollNo,
          status: student.status,
          dateOfBirth: student.dateOfBirth,
          guardian: student.guardian.name,
          guardianPhone: student.guardian.phone,
          guardianEmail: student.guardian.email,
          attendanceRate: student.attendanceRate,
          feeBalance: student.feeBalance,
        },
      ]),
    );
    toast.success("Student record exported");
  };

  return (
    <div data-testid="student-profile-page">
      <Button variant="ghost" size="sm" className="mb-3 gap-1.5 text-xs" asChild data-testid="student-back">
        <Link to="/admin/students">
          <ArrowLeft className="h-3.5 w-3.5" /> Student register
        </Link>
      </Button>

      <div className="panel mb-5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <img
            src={student.avatarUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded-xl border border-hairline object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold tracking-[-0.02em] text-foreground" data-testid="student-name">
                {fullName}
              </h1>
              <StatusBadge value={student.status} testId="student-profile-status" />
              {student.guardian.invited && (
                <span className="flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[11px] text-success">
                  <BadgeCheck className="h-3 w-3" /> Guardian invited
                </span>
              )}
            </div>
            <p className="num mt-1 font-mono text-xs text-muted-foreground">{student.admissionNo}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> {student.grade} · {student.section} · Roll {student.rollNo}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {student.guardian.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {student.city}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Admitted {formatDate(student.admissionDate)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={exportRecord} data-testid="student-export">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            {can("students.manage") && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  data-testid="student-invite-guardian"
                  disabled={inviteMutation.isPending}
                  onClick={() => inviteMutation.mutate()}
                >
                  <MailPlus className="h-3.5 w-3.5" /> Invite guardian
                </Button>
                <Button size="sm" className="gap-1.5" data-testid="student-edit" onClick={() => setEditOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Tabs defaultValue="personal">
            <TabsList className="mb-4 h-9 w-full justify-start overflow-x-auto">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="text-xs" data-testid={`student-tab-${tab.key}`}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="personal">
              <Panel title="Personal information" testId="student-personal-panel">
                <dl className="grid gap-4 sm:grid-cols-3">
                  <KeyValue label="Full name" value={fullName} />
                  <KeyValue label="Date of birth" value={formatDate(student.dateOfBirth)} />
                  <KeyValue label="Gender" value={student.gender === "male" ? "Male" : "Female"} />
                  <KeyValue label="Blood group" value={student.bloodGroup} />
                  <KeyValue label="Nationality" value={student.nationality} />
                  <KeyValue label="House" value={student.houseName} />
                  <KeyValue label="Email" value={student.email} />
                  <KeyValue label="Phone" value={student.phone} />
                  <KeyValue label="Emergency contact" value={student.emergencyContact} />
                  <KeyValue label="Address" value={`${student.address}, ${student.city}`} />
                </dl>
              </Panel>
            </TabsContent>

            <TabsContent value="academic">
              <div className="space-y-4">
                <Panel title="Academic information" testId="student-academic-panel">
                  <dl className="grid gap-4 sm:grid-cols-3">
                    <KeyValue label="Grade" value={student.grade} />
                    <KeyValue label="Section" value={student.section} />
                    <KeyValue label="Roll number" value={String(student.rollNo)} mono />
                    <KeyValue label="Class teacher" value={classDetail?.teacher ? `${classDetail.teacher.firstName} ${classDetail.teacher.lastName}` : "—"} />
                    <KeyValue label="Room" value={classDetail?.cls.roomNo} mono />
                    <KeyValue label="Academic year" value="2025 – 2026" />
                  </dl>
                </Panel>
                <Panel title="Admission information" testId="student-admission-panel">
                  <dl className="grid gap-4 sm:grid-cols-3">
                    <KeyValue label="Admission number" value={student.admissionNo} mono />
                    <KeyValue label="Admission date" value={formatDate(student.admissionDate)} />
                    <KeyValue label="Admission year" value={String(student.admissionYear)} />
                    <KeyValue label="Campus" value={student.branchId === "branch_main" ? "EEBSS Main Campus" : "Riverside Campus"} />
                    <KeyValue label="Record created" value={formatDateTime(student.createdAt)} />
                    <KeyValue label="Last updated" value={formatDateTime(student.updatedAt)} />
                  </dl>
                </Panel>
              </div>
            </TabsContent>

            <TabsContent value="guardian">
              <Panel
                title="Guardian information"
                testId="student-guardian-panel"
                actions={
                  can("students.manage") ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      onClick={() => inviteMutation.mutate()}
                    >
                      <MailPlus className="h-3.5 w-3.5" /> Invite to portal
                    </Button>
                  ) : null
                }
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-xs font-semibold text-muted-foreground">
                    {student.guardian.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{student.guardian.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.guardian.relation} · {student.guardian.occupation ?? "—"}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <StatusBadge value={student.guardian.invited ? "activated" : "none"} label={student.guardian.invited ? "Portal access" : "Not invited"} />
                  </div>
                </div>
                <Separator className="my-4" />
                <dl className="grid gap-4 sm:grid-cols-2">
                  <KeyValue label="Phone" value={student.guardian.phone} />
                  <KeyValue label="Email" value={student.guardian.email} />
                  <KeyValue label="Emergency contact" value={student.emergencyContact} />
                  <KeyValue label="Address" value={`${student.address}, ${student.city}`} />
                </dl>
              </Panel>
            </TabsContent>

            <TabsContent value="attendance">
              <Panel
                title="Attendance"
                description={`${attendance?.records.length ?? 0} recorded school days`}
                testId="student-attendance-panel"
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Present", value: attendance?.present ?? 0, className: "text-success" },
                    { label: "Late", value: attendance?.late ?? 0, className: "text-accent" },
                    { label: "Excused", value: attendance?.excused ?? 0, className: "text-info" },
                    { label: "Absent", value: attendance?.absent ?? 0, className: "text-destructive" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-hairline bg-surface-2 p-3">
                      <p className="text-[11px] text-muted-foreground">{item.label}</p>
                      <p className={cn("num mt-0.5 text-lg font-semibold", item.className)}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {attendance?.records.length ? (
                  <ul className="mt-4 divide-y divide-hairline">
                    {attendance.records.slice(0, 10).map((record) => (
                      <li key={record.id} className="flex items-center gap-3 py-2">
                        <span className="num w-24 shrink-0 text-xs text-muted-foreground">{formatDate(record.date)}</span>
                        <StatusBadge value={record.state} />
                        {record.note && <span className="truncate text-xs text-muted-foreground">{record.note}</span>}
                        <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{record.markedBy}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    compact
                    title="No attendance recorded yet"
                    description="Attendance appears here once the class register has been submitted."
                  />
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="courses">
              <Panel title="Enrolled subjects" testId="student-courses-panel" bodyClassName="p-2">
                {classDetail?.courses.length ? (
                  <ul className="divide-y divide-hairline">
                    {classDetail.courses.map((course) => (
                      <li key={course.id} className="flex items-center gap-3 px-2 py-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary font-mono text-[10px] text-muted-foreground">
                          {course.code.split("-")[0]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <Link to={`/admin/courses/${course.id}`} className="block truncate text-sm text-foreground hover:text-primary">
                            {course.name}
                          </Link>
                          <p className="truncate text-xs text-muted-foreground">
                            {course.department} · {course.weeklyHours}h/week
                          </p>
                        </div>
                        {course.isElective && <StatusBadge value="internal" label="Elective" dot={false} />}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState compact title="No subjects assigned" description="Assign subjects to this class to populate the student's timetable." />
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="documents">
              <Panel title="Documents" description="Admission and verification paperwork" testId="student-documents-panel" bodyClassName="p-2">
                {student.documents.length ? (
                  <ul className="divide-y divide-hairline">
                    {student.documents.map((document) => (
                      <li key={document.id} className="flex items-center gap-3 px-2 py-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-foreground">{document.name}</p>
                          <p className="num truncate text-xs text-muted-foreground">
                            {(document.sizeKb / 1024).toFixed(1)} MB · uploaded {formatDate(document.uploadedAt)}
                          </p>
                        </div>
                        <StatusBadge value={document.verified ? "active" : "pending"} label={document.verified ? "Verified" : "Pending"} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    compact
                    icon={FileText}
                    title="No documents on file"
                    description="Birth certificates, transcripts and immunisation records will appear here."
                  />
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="activity">
              <Panel title="Recent activity" testId="student-activity-panel">
                {activity.length ? (
                  <Timeline
                    items={activity.map((event) => ({
                      id: event.id,
                      title: event.summary,
                      actor: event.actorName,
                      at: event.createdAt,
                      chip: event.action.replace(/_/g, " "),
                    }))}
                  />
                ) : (
                  <EmptyState compact title="No activity recorded" description="Edits and status changes for this student will be listed here." />
                )}
              </Panel>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Panel title="Snapshot" testId="student-snapshot">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Attendance</span>
                  <span className="num font-medium text-foreground">{student.attendanceRate}%</span>
                </div>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <span
                    className={cn(
                      "block h-full rounded-full",
                      student.attendanceRate >= 92 ? "bg-success" : student.attendanceRate >= 82 ? "bg-warning" : "bg-destructive",
                    )}
                    style={{ width: `${student.attendanceRate}%` }}
                  />
                </span>
                {student.attendanceRate < 82 && (
                  <p className="mt-1.5 text-[11px] text-destructive">Below the 82% intervention threshold</p>
                )}
              </div>
              <Separator />
              <KeyValue
                label="Fee balance"
                value={student.feeBalance > 0 ? formatCurrency(student.feeBalance) : "Settled"}
                testId="student-fee-balance"
              />
              <KeyValue
                label="Transport"
                value={
                  student.transportRouteId ? (
                    <Link to="/admin/transportation" className="flex items-center gap-1.5 text-primary hover:underline">
                      <Bus className="h-3.5 w-3.5" /> Route assigned
                    </Link>
                  ) : (
                    "Not using transport"
                  )
                }
              />
              <KeyValue label="Class" value={<Link to={`/admin/classes/${student.classId}`} className="text-primary hover:underline">{student.grade} · {student.section}</Link>} />
            </div>
          </Panel>

          {can("students.manage") && (
            <Panel title="Status & lifecycle" testId="student-lifecycle">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs"
                  data-testid="student-graduate"
                  onClick={() =>
                    setConfirm({
                      title: "Graduate this student?",
                      description: `${fullName} will be marked as graduated and removed from active registers.`,
                      label: "Graduate",
                      run: () => statusMutation.mutate("graduated"),
                    })
                  }
                >
                  <GraduationCap className="h-3.5 w-3.5" /> Graduate student
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs"
                  data-testid="student-deactivate"
                  onClick={() =>
                    setConfirm({
                      title: "Deactivate this student?",
                      description: `${fullName} will lose portal access and be hidden from attendance registers.`,
                      label: "Deactivate",
                      run: () => statusMutation.mutate("inactive"),
                    })
                  }
                >
                  <UserMinus className="h-3.5 w-3.5" /> Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs text-destructive"
                  data-testid="student-delete"
                  onClick={() =>
                    setConfirm({
                      title: "Delete this student record?",
                      description: "This permanently removes the student, guardian links and documents. This cannot be undone.",
                      label: "Delete permanently",
                      destructive: true,
                      run: () => deleteMutation.mutate(),
                    })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete record
                </Button>
              </div>
            </Panel>
          )}
        </aside>
      </div>

      <StudentFormDialog
        open={editOpen}
        student={student}
        classes={classes}
        branches={[
          { value: "branch_main", label: "EEBSS Main Campus" },
          { value: "branch_riverside", label: "Riverside Campus" },
        ]}
        onOpenChange={setEditOpen}
        onSaved={invalidate}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.title ?? ""}
        description={confirm?.description ?? ""}
        confirmLabel={confirm?.label}
        destructive={confirm?.destructive}
        busy={statusMutation.isPending || deleteMutation.isPending}
        onConfirm={() => confirm?.run()}
        testId="student-profile-confirm"
      />
    </div>
  );
}
