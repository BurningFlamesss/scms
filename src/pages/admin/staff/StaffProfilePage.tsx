import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, CalendarDays, Mail, MailPlus, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { getStaff, inviteStaff } from "#/services/staff";
import { listClasses, listCourses } from "#/services/academics";
import { useAuth } from "#/providers/AuthProvider";
import { Panel, KeyValue } from "#/components/common/Panel";
import { StatusBadge } from "#/components/common/StatusBadge";
import { DetailSkeleton } from "#/components/common/Skeletons";
import { EmptyState } from "#/components/common/EmptyState";
import { Button } from "#/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { ROLE_LABEL } from "#/lib/permissions";
import { formatDate } from "#/lib/format";

export default function StaffProfilePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { actor, can } = useAuth();

  const { data: member, isLoading } = useQuery({ queryKey: ["staff", id], queryFn: () => getStaff(id) });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => listClasses() });
  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: () => listCourses() });

  const inviteMutation = useMutation({
    mutationFn: () => inviteStaff(id, actor),
    onSuccess: () => {
      toast.success("Invitation sent");
      qc.invalidateQueries({ queryKey: ["staff", id] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });

  if (isLoading) return <DetailSkeleton />;
  if (!member) {
    return (
      <div className="panel">
        <EmptyState
          title="Staff member not found"
          description="This record may have been removed from the directory."
          primaryLabel="Back to directory"
          onPrimary={() => navigate("/admin/staff")}
        />
      </div>
    );
  }

  const assignedClasses = classes.filter((c) => member.assignedClassIds.includes(c.id) || c.classTeacherId === member.id);
  const assignedCourses = courses.filter((c) => member.assignedCourseIds.includes(c.id) || c.teacherIds.includes(member.id));

  return (
    <div data-testid="staff-profile-page">
      <Button variant="ghost" size="sm" className="mb-3 gap-1.5 text-xs" asChild>
        <Link to="/admin/staff">
          <ArrowLeft className="h-3.5 w-3.5" /> Staff directory
        </Link>
      </Button>

      <div className="panel mb-5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <img src={member.avatarUrl} alt="" className="h-16 w-16 shrink-0 rounded-xl border border-hairline" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold tracking-[-0.02em]" data-testid="staff-name">
                {member.firstName} {member.lastName}
              </h1>
              <StatusBadge value={member.employmentStatus} testId="staff-profile-status" />
              <StatusBadge value="internal" label={ROLE_LABEL[member.role]} dot={false} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {member.designation} · {member.department}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <span className="num flex items-center gap-1.5 font-mono">
                <Briefcase className="h-3.5 w-3.5" /> {member.employeeId}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {member.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {member.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Joined {formatDate(member.joiningDate)}
              </span>
            </div>
          </div>
          {can("staff.manage") && (
            <Button
              size="sm"
              className="gap-1.5"
              data-testid="staff-profile-invite"
              disabled={inviteMutation.isPending}
              onClick={() => inviteMutation.mutate()}
            >
              <MailPlus className="h-3.5 w-3.5" /> Invite to console
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Tabs defaultValue="employment">
            <TabsList className="mb-4 h-9">
              <TabsTrigger value="employment" className="text-xs" data-testid="staff-tab-employment">
                Employment
              </TabsTrigger>
              <TabsTrigger value="assignments" className="text-xs" data-testid="staff-tab-assignments">
                Assignments
              </TabsTrigger>
              <TabsTrigger value="personal" className="text-xs" data-testid="staff-tab-personal">
                Personal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employment">
              <Panel title="Employment record" testId="staff-employment-panel">
                <dl className="grid gap-4 sm:grid-cols-3">
                  <KeyValue label="Employee ID" value={member.employeeId} mono />
                  <KeyValue label="Designation" value={member.designation} />
                  <KeyValue label="Department" value={member.department} />
                  <KeyValue label="Employment type" value={member.employmentType.replace(/_/g, " ")} />
                  <KeyValue label="Joining date" value={formatDate(member.joiningDate)} />
                  <KeyValue label="Experience" value={`${member.experienceYears} years`} />
                  <KeyValue label="Qualification" value={member.qualification} />
                  <KeyValue label="Campus" value={member.branchId === "branch_main" ? "Main Campus" : "Riverside Campus"} />
                  <KeyValue label="Attendance" value={`${member.attendanceRate}%`} />
                </dl>
              </Panel>
            </TabsContent>

            <TabsContent value="assignments">
              <div className="space-y-4">
                <Panel title="Classes" description={`${assignedClasses.length} assigned`} bodyClassName="p-2" testId="staff-classes-panel">
                  {assignedClasses.length ? (
                    <ul className="divide-y divide-hairline">
                      {assignedClasses.map((cls) => (
                        <li key={cls.id} className="flex items-center gap-3 px-2 py-2.5">
                          <Link to={`/admin/classes/${cls.id}`} className="text-sm text-foreground hover:text-primary">
                            {cls.name}
                          </Link>
                          {cls.classTeacherId === member.id && (
                            <StatusBadge value="normal" label="Class teacher" dot={false} />
                          )}
                          <span className="num ml-auto text-xs text-muted-foreground">
                            {cls.studentCount} students · Room {cls.roomNo}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState compact title="No classes assigned" description="Assign this staff member as a class teacher or subject teacher." />
                  )}
                </Panel>

                <Panel title="Subjects" description={`${assignedCourses.length} taught`} bodyClassName="p-2" testId="staff-courses-panel">
                  {assignedCourses.length ? (
                    <ul className="divide-y divide-hairline">
                      {assignedCourses.map((course) => (
                        <li key={course.id} className="flex items-center gap-3 px-2 py-2.5">
                          <Link to={`/admin/courses/${course.id}`} className="text-sm text-foreground hover:text-primary">
                            {course.name}
                          </Link>
                          <span className="num ml-auto font-mono text-xs text-muted-foreground">{course.code}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState compact title="No subjects assigned" description="Subject allocations appear here once the timetable is set." />
                  )}
                </Panel>
              </div>
            </TabsContent>

            <TabsContent value="personal">
              <Panel title="Personal information" testId="staff-personal-panel">
                <dl className="grid gap-4 sm:grid-cols-3">
                  <KeyValue label="Gender" value={member.gender === "male" ? "Male" : "Female"} />
                  <KeyValue label="Date of birth" value={member.dateOfBirth} />
                  <KeyValue label="Phone" value={member.phone} />
                  <KeyValue label="Email" value={member.email} />
                  <KeyValue label="Address" value={member.address} />
                </dl>
              </Panel>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Panel title="At a glance" testId="staff-snapshot">
            <div className="space-y-3">
              <KeyValue label="Console role" value={ROLE_LABEL[member.role]} />
              <KeyValue label="Class teacher" value={member.isClassTeacher ? "Yes" : "No"} />
              <KeyValue label="Documents" value={`${member.documents.length} on file`} />
              <KeyValue label="Location" value={<span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{member.address}</span>} />
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
