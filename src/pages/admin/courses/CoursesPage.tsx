import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Library, Plus } from "lucide-react";
import { toast } from "sonner";
import { courseDepartments, createCourse, listCourses, type CourseInput } from "#/services/academics";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { FilterBar, toOptions } from "#/components/common/FilterBar";
import { DataTable, type Column } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { StatusBadge } from "#/components/common/StatusBadge";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import type { Course } from "#/types";

export default function CoursesPage() {
  const { actor, can } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [elective, setElective] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CourseInput>({
    code: "",
    name: "",
    department: "Mathematics",
    description: "",
    credits: 4,
    weeklyHours: 4,
    isElective: false,
    teacherIds: [],
  });

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses", { search, department, elective }],
    queryFn: () => listCourses({ search, department, elective }),
  });

  const createMutation = useMutation({
    mutationFn: () => createCourse(form, actor),
    onSuccess: (course) => {
      toast.success(`${course.name} added to ${course.department}`);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const columns: Column<Course>[] = [
    {
      key: "name",
      header: "Subject",
      render: (course) => (
        <div className="min-w-0">
          <Link to={`/courses/${course.id}`} className="block truncate text-sm font-medium text-foreground hover:text-primary" data-testid={`course-link-${course.id}`}>
            {course.name}
          </Link>
          <p className="num truncate font-mono text-[11px] text-muted-foreground">{course.code}</p>
        </div>
      ),
    },
    { key: "department", header: "Department", render: (course) => <span className="text-sm text-muted-foreground">{course.department}</span> },
    {
      key: "teachers",
      header: "Teachers",
      render: (course) => <span className="num text-sm text-foreground">{course.teacherIds.length}</span>,
    },
    {
      key: "classes",
      header: "Classes",
      render: (course) => <span className="num text-sm text-foreground">{course.classIds.length}</span>,
    },
    {
      key: "weeklyHours",
      header: "Load",
      render: (course) => (
        <span className="num text-xs text-muted-foreground">
          {course.weeklyHours}h/week · {course.credits} credits
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (course) => <StatusBadge value={course.isElective ? "internal" : "normal"} label={course.isElective ? "Elective" : "Core"} dot={false} />,
    },
  ];

  return (
    <div data-testid="courses-page">
      <PageHeader
        eyebrow="Academics"
        title="Courses & Subjects"
        description="The academic catalogue with teaching allocations, weekly load and syllabus outlines."
        meta={<span data-testid="courses-count">{courses.length} subjects</span>}
        actions={
          can("courses.manage") ? (
            <Button size="sm" className="gap-1.5" data-testid="courses-add" onClick={() => setOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> New subject
            </Button>
          ) : null
        }
      />

      <FilterBar
        testId="courses-filters"
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by subject name or code…"
        filters={[
          { key: "department", label: "Department", value: department, options: toOptions(courseDepartments(), "All departments"), onChange: setDepartment, width: "w-[170px]" },
          {
            key: "type",
            label: "Type",
            value: elective,
            options: [
              { value: "all", label: "All types" },
              { value: "false", label: "Core" },
              { value: "true", label: "Elective" },
            ],
            onChange: setElective,
            width: "w-[130px]",
          },
        ]}
        onReset={() => {
          setSearch("");
          setDepartment("all");
          setElective("all");
        }}
      />

      <DataTable<Course>
        testId="courses-table"
        columns={columns}
        rows={courses}
        rowId={(c) => c.id}
        rowTestId={(c) => `course-row-${c.id}`}
        loading={isLoading}
        total={courses.length}
        pageSize={courses.length || 1}
        footNote={`${courses.length} subjects in the catalogue`}
        empty={
          <EmptyState
            icon={Library}
            title="No subjects match"
            description="Adjust the department or type filter, or add a new subject to the catalogue."
            primaryLabel={can("courses.manage") ? "New subject" : undefined}
            onPrimary={() => setOpen(true)}
            testId="courses-empty"
          />
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-popover sm:max-w-lg" data-testid="course-form-dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Create subject</DialogTitle>
            <DialogDescription>Add a subject to the catalogue, then assign teachers and classes.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Subject name *</Label>
              <Input value={form.name} data-testid="course-name" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Code *</Label>
              <Input value={form.code} placeholder="MATH-301" data-testid="course-code" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Department</Label>
              <Select value={form.department} onValueChange={(v: string) => setForm({ ...form, department: v })}>
                <SelectTrigger data-testid="course-department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {courseDepartments().map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={String(form.isElective)} onValueChange={(v: string) => setForm({ ...form, isElective: v === "true" })}>
                <SelectTrigger data-testid="course-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="false">Core</SelectItem>
                  <SelectItem value="true">Elective</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Weekly hours</Label>
              <Input
                type="number"
                value={form.weeklyHours}
                data-testid="course-hours"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, weeklyHours: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Credits</Label>
              <Input
                type="number"
                value={form.credits}
                data-testid="course-credits"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, credits: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={form.description}
                rows={3}
                data-testid="course-description"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              data-testid="course-form-save"
              disabled={!form.name || !form.code || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? "Creating…" : "Create subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
