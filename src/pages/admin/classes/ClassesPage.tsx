import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GalleryVerticalEnd, Plus } from "lucide-react";
import { toast } from "sonner";
import { createClass, listClasses, type ClassInput } from "#/services/academics";
import { listStaff } from "#/services/staff";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { FilterBar, toOptions } from "#/components/common/FilterBar";
import { EmptyState } from "#/components/common/EmptyState";
import { PanelSkeleton } from "#/components/common/Skeletons";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { cn } from "#/lib/utils";

export default function ClassesPage() {
  const { actor, can } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("all");
  const [branch, setBranch] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ClassInput>({
    grade: "Grade 6",
    section: "D",
    classTeacherId: "",
    roomNo: "104",
    capacity: 32,
    branchId: "branch_main",
    academicYearId: "ay_2025",
  });

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["classes", { search, grade, branch }],
    queryFn: () => listClasses({ search, grade, branchId: branch }),
  });
  const { data: staff } = useQuery({ queryKey: ["staff", "all"], queryFn: () => listStaff({ pageSize: 100 }) });

  const grades = useMemo(() => Array.from(new Set(classes.map((c) => c.grade))).sort(), [classes]);
  const teachers = staff?.rows ?? [];

  const createMutation = useMutation({
    mutationFn: () => createClass(form, actor),
    onSuccess: (cls) => {
      toast.success(`${cls.name} created`);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const grouped = classes.reduce<Record<string, typeof classes>>((acc, cls) => {
    acc[cls.grade] = acc[cls.grade] ? [...acc[cls.grade], cls] : [cls];
    return acc;
  }, {});

  return (
    <div data-testid="classes-page">
      <PageHeader
        eyebrow="Academics"
        title="Classes & Sections"
        description="Every grade and section for the 2025 – 2026 academic year, with class teachers and occupancy."
        meta={
          <>
            <span data-testid="classes-count">{classes.length} classes</span>
            <span>{classes.reduce((sum, c) => sum + c.studentCount, 0)} enrolled students</span>
          </>
        }
        actions={
          can("classes.manage") ? (
            <Button size="sm" className="gap-1.5" data-testid="classes-add" onClick={() => setOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> New class
            </Button>
          ) : null
        }
      />

      <FilterBar
        testId="classes-filters"
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by class name or room…"
        filters={[
          { key: "grade", label: "Grade", value: grade, options: toOptions(grades, "All grades"), onChange: setGrade },
          {
            key: "branch",
            label: "Campus",
            value: branch,
            options: [
              { value: "all", label: "All campuses" },
              { value: "branch_main", label: "Main Campus" },
              { value: "branch_riverside", label: "Riverside Campus" },
            ],
            onChange: setBranch,
            width: "w-[170px]",
          },
        ]}
        onReset={() => {
          setSearch("");
          setGrade("all");
          setBranch("all");
        }}
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <PanelSkeleton key={i} height="h-24" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={GalleryVerticalEnd}
            title="No classes found"
            description="Create a class to start assigning students, subjects and a class teacher."
            primaryLabel={can("classes.manage") ? "New class" : undefined}
            onPrimary={() => setOpen(true)}
            testId="classes-empty"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([gradeName, group]) => (
            <section key={gradeName}>
              <div className="mb-2.5 flex items-center gap-3">
                <h2 className="font-display text-sm font-semibold text-foreground">{gradeName}</h2>
                <span className="h-px flex-1 bg-hairline" />
                <span className="num text-xs text-muted-foreground">
                  {group.reduce((sum, c) => sum + c.studentCount, 0)} students
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.map((cls) => {
                  const teacher = teachers.find((t) => t.id === cls.classTeacherId);
                  const occupancy = Math.round((cls.studentCount / cls.capacity) * 100);
                  return (
                    <Link
                      key={cls.id}
                      to={`/classes/${cls.id}`}
                      data-testid={`class-card-${cls.id}`}
                      className="panel group p-4 transition-colors hover:border-primary/35 focus-ring"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-display text-sm font-semibold text-foreground">{cls.name}</p>
                          <p className="num mt-0.5 text-xs text-muted-foreground">Room {cls.roomNo}</p>
                        </div>
                        <span className="num rounded-md bg-surface-2 px-2 py-1 text-xs font-medium text-foreground">
                          {cls.studentCount}/{cls.capacity}
                        </span>
                      </div>

                      <div className="mt-3">
                        <span className="block h-1.5 overflow-hidden rounded-full bg-surface-2">
                          <span
                            className={cn("block h-full rounded-full", occupancy > 92 ? "bg-accent" : "bg-primary")}
                            style={{ width: `${Math.min(100, occupancy)}%` }}
                          />
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {teacher ? (
                          <>
                            <img src={teacher.avatarUrl} alt="" className="h-6 w-6 rounded-full border border-hairline" />
                            <span className="min-w-0 truncate text-xs text-muted-foreground">
                              {teacher.firstName} {teacher.lastName}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">No class teacher assigned</span>
                        )}
                        <span className="num ml-auto shrink-0 text-xs text-muted-foreground">
                          {cls.attendanceRate}% attendance
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-popover sm:max-w-lg" data-testid="class-form-dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Create class</DialogTitle>
            <DialogDescription>Core subjects are attached automatically and can be edited afterwards.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Grade</Label>
              <Input value={form.grade} data-testid="class-grade" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, grade: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Section</Label>
              <Input value={form.section} data-testid="class-section" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, section: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Room</Label>
              <Input value={form.roomNo} data-testid="class-room" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, roomNo: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Capacity</Label>
              <Input
                type="number"
                value={form.capacity}
                data-testid="class-capacity"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, capacity: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Class teacher</Label>
              <Select value={form.classTeacherId} onValueChange={(v: string) => setForm({ ...form, classTeacherId: v })}>
                <SelectTrigger data-testid="class-teacher">
                  <SelectValue placeholder="Choose a teacher" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {teachers.slice(0, 40).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} · {t.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button data-testid="class-form-save" disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>
              {createMutation.isPending ? "Creating…" : "Create class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
