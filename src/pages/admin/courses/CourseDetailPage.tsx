import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { getCourseDetail } from "#/services/academics";
import { Panel, KeyValue } from "#/components/common/Panel";
import { DetailSkeleton } from "#/components/common/Skeletons";
import { EmptyState } from "#/components/common/EmptyState";
import { StatusBadge } from "#/components/common/StatusBadge";
import { PersonCell } from "#/components/common/PersonCell";
import { Button } from "#/components/ui/button";

export default function CourseDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["course-detail", id], queryFn: () => getCourseDetail(id) });

  if (isLoading) return <DetailSkeleton />;
  if (!data) {
    return (
      <div className="panel">
        <EmptyState
          title="Subject not found"
          description="This subject may have been removed from the catalogue."
          primaryLabel="Back to catalogue"
          onPrimary={() => navigate("/courses")}
        />
      </div>
    );
  }

  const { course, teachers, classes } = data;

  return (
    <div data-testid="course-detail-page">
      <Button variant="ghost" size="sm" className="mb-3 gap-1.5 text-xs" asChild>
        <Link to="/courses">
          <ArrowLeft className="h-3.5 w-3.5" /> Courses & Subjects
        </Link>
      </Button>

      <div className="panel mb-5 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-xl font-semibold tracking-[-0.02em]" data-testid="course-name">
            {course.name}
          </h1>
          <StatusBadge value={course.isElective ? "internal" : "normal"} label={course.isElective ? "Elective" : "Core"} dot={false} />
        </div>
        <p className="num mt-1 font-mono text-xs text-muted-foreground">{course.code}</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{course.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> {course.department}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {course.weeklyHours} hours per week
          </span>
          <span>{course.credits} credits</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Syllabus" description={`${course.syllabus.length} units`} testId="course-syllabus-panel">
            {course.syllabus.length ? (
              <ol className="space-y-3">
                {course.syllabus.map((unit) => (
                  <li key={unit.unit} className="rounded-lg border border-hairline bg-surface-2 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">
                        Unit {unit.unit} · {unit.title}
                      </p>
                      <span className="num shrink-0 text-xs text-muted-foreground">{unit.hours}h</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {unit.topics.map((topic) => (
                        <span key={topic} className="rounded-full border border-hairline bg-surface-1 px-2 py-0.5 text-[11px] text-muted-foreground">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState compact title="No syllabus yet" description="Add units and topics so teachers can plan lessons." />
            )}
          </Panel>

          <Panel title="Classes using this subject" bodyClassName="p-2" testId="course-classes-panel">
            {classes.length ? (
              <ul className="grid gap-1.5 p-1 sm:grid-cols-3">
                {classes.map((cls) => (
                  <li key={cls.id}>
                    <Link
                      to={`/classes/${cls.id}`}
                      className="block rounded-md border border-hairline bg-surface-2 px-2.5 py-2 text-xs text-foreground transition-colors hover:border-primary/40"
                    >
                      {cls.name}
                      <span className="num block text-[11px] text-muted-foreground">{cls.studentCount} students</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact title="Not yet allocated" description="Assign this subject to classes from the class timetable." />
            )}
          </Panel>
        </div>

        <aside className="space-y-4">
          <Panel title="Assigned teachers" testId="course-teachers-panel">
            {teachers.length ? (
              <ul className="space-y-3">
                {teachers.map((teacher) => (
                  <li key={teacher.id}>
                    <PersonCell
                      name={`${teacher.firstName} ${teacher.lastName}`}
                      subtitle={`${teacher.designation} · ${teacher.department}`}
                      avatarUrl={teacher.avatarUrl}
                      to={`/staff/${teacher.id}`}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No teachers assigned yet.</p>
            )}
          </Panel>

          <Panel title="Details" testId="course-meta-panel">
            <div className="space-y-3">
              <KeyValue label="Code" value={course.code} mono />
              <KeyValue label="Department" value={course.department} />
              <KeyValue label="Credits" value={String(course.credits)} />
              <KeyValue label="Weekly hours" value={String(course.weeklyHours)} />
              <KeyValue label="Type" value={course.isElective ? "Elective" : "Core subject"} />
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
