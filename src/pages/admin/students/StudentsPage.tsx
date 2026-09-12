import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  GraduationCap,
  MailPlus,
  MoreHorizontal,
  Pencil,
  Trash2,
  UploadCloud,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  bulkStudentAction,
  deleteStudent,
  inviteGuardian,
  listStudents,
  setStudentStatus,
  studentFilterOptions,
  transferStudent,
  type BulkStudentAction,
} from "#/services/students";
import { listClasses } from "#/services/academics";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { FilterBar, toOptions } from "#/components/common/FilterBar";
import { DataTable, type Column, type SortState } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { StatusBadge } from "#/components/common/StatusBadge";
import { PersonCell } from "#/components/common/PersonCell";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { StudentFormDialog } from "#/pages/admin/students/StudentFormDialog";
import { CsvImportWizard } from "#/components/csv/CsvImportWizard";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { downloadTextFile, formatCurrency, toCsv } from "#/lib/format";
import type { Student } from "#/types";
import { cn } from "#/lib/utils";

export default function StudentsPage() {
  const { actor, can } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const searchParams = (useSearch({ strict: false }) as Record<string, string | undefined>) || {};

  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("all");
  const [section, setSection] = useState("all");
  const [status, setStatus] = useState(searchParams.status ?? "all");
  const [year, setYear] = useState("all");
  const [branch, setBranch] = useState("all");
  const [sort, setSort] = useState<SortState>({ key: "firstName", dir: "asc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(searchParams.new === "1");
  const [importOpen, setImportOpen] = useState(searchParams.import === "1");
  const [editing, setEditing] = useState<Student | null>(null);
  const [transferTarget, setTransferTarget] = useState<Student | null>(null);
  const [transferClassId, setTransferClassId] = useState("");
  const [confirm, setConfirm] = useState<{
    title: string;
    description: string;
    label: string;
    destructive?: boolean;
    run: () => void;
  } | null>(null);

  useEffect(() => {
    if (searchParams.new === "1") setFormOpen(true);
    if (searchParams.import === "1") setImportOpen(true);
  }, [searchParams.new, searchParams.import]);

  const clearParams = () => {
    navigate({
      search: (prev: Record<string, any>) => {
        const next = { ...prev };
        delete next.new;
        delete next.import;
        return next;
      },
      replace: true,
    });
  };

  const options = useMemo(() => studentFilterOptions(), []);
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => listClasses() });

  const query = { search, grade, section, status, admissionYear: year, branchId: branch, sort: sort.key, dir: sort.dir, page, pageSize: 10 };
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["students", query],
    queryFn: () => listStudents(query),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["students"] });
    qc.invalidateQueries({ queryKey: ["overview"] });
    qc.invalidateQueries({ queryKey: ["classes"] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: Student["status"] }) => setStudentStatus(id, next, actor),
    onSuccess: (student) => {
      toast.success(`${student.firstName} ${student.lastName} is now ${student.status}`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteStudent(id, actor),
    onSuccess: () => {
      toast.success("Student record deleted");
      setConfirm(null);
      invalidate();
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (id: string) => inviteGuardian(id, actor),
    onSuccess: (student) => {
      toast.success(`Invitation sent to ${student.guardian.name}`);
      invalidate();
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const transferMutation = useMutation({
    mutationFn: () => transferStudent(transferTarget!.id, transferClassId, actor),
    onSuccess: (student) => {
      toast.success(`Transferred to ${student.grade} · ${student.section}`);
      setTransferTarget(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkMutation = useMutation({
    mutationFn: (action: BulkStudentAction) => bulkStudentAction(selected, action, actor),
    onSuccess: (count) => {
      toast.success(`${count} student${count === 1 ? "" : "s"} updated`);
      setSelected([]);
      setConfirm(null);
      invalidate();
    },
  });

  const exportSelection = (rows: Student[]) => {
    const csv = toCsv(
      rows.map((s) => ({
        admissionNo: s.admissionNo,
        firstName: s.firstName,
        lastName: s.lastName,
        grade: s.grade,
        section: s.section,
        status: s.status,
        guardian: s.guardian.name,
        guardianPhone: s.guardian.phone,
        email: s.email,
        attendanceRate: s.attendanceRate,
        feeBalance: s.feeBalance,
      })),
    );
    downloadTextFile(`northfield-students-${Date.now()}.csv`, csv);
    toast.success(`Exported ${rows.length} student records`);
  };

  const columns: Column<Student>[] = [
    {
      key: "firstName",
      header: "Student",
      sortable: true,
      render: (student) => (
        <PersonCell
          name={`${student.firstName} ${student.lastName}`}
          subtitle={student.admissionNo}
          avatarUrl={student.avatarUrl}
          to={`/students/${student.id}`}
          mono
          testId={`student-link-${student.id}`}
        />
      ),
    },
    {
      key: "grade",
      header: "Class",
      sortable: true,
      render: (student) => (
        <div>
          <p className="text-sm text-foreground">
            {student.grade} · {student.section}
          </p>
          <p className="num text-xs text-muted-foreground">Roll {student.rollNo}</p>
        </div>
      ),
    },
    {
      key: "guardian",
      header: "Guardian",
      render: (student) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-foreground">{student.guardian.name}</p>
          <p className="num truncate text-xs text-muted-foreground">
            {student.guardian.relation} · {student.guardian.phone}
          </p>
        </div>
      ),
    },
    {
      key: "attendanceRate",
      header: "Attendance",
      sortable: true,
      render: (student) => (
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-2">
            <span
              className={cn(
                "block h-full rounded-full",
                student.attendanceRate >= 92 ? "bg-success" : student.attendanceRate >= 82 ? "bg-warning" : "bg-destructive",
              )}
              style={{ width: `${student.attendanceRate}%` }}
            />
          </span>
          <span className="num text-xs text-muted-foreground">{student.attendanceRate}%</span>
        </div>
      ),
    },
    {
      key: "feeBalance",
      header: "Fees",
      sortable: true,
      align: "right",
      render: (student) =>
        student.feeBalance > 0 ? (
          <span className="num text-sm text-destructive">{formatCurrency(student.feeBalance)}</span>
        ) : (
          <span className="text-xs text-muted-foreground">Settled</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (student) => <StatusBadge value={student.status} testId={`student-status-${student.id}`} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (student) => (
        <div className="flex items-center justify-end gap-1">
          {can("students.manage") && (
            <button
              type="button"
              aria-label="Edit student"
              data-testid={`student-edit-${student.id}`}
              className="row-actions rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(student);
                setFormOpen(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More actions"
                data-testid={`student-actions-${student.id}`}
                className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-ring"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-popover">
              <DropdownMenuLabel className="text-xs">
                {student.firstName} {student.lastName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/students/${student.id}`)} data-testid={`student-view-${student.id}`}>
                View profile
              </DropdownMenuItem>
              {can("students.manage") && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      setEditing(student);
                      setFormOpen(true);
                    }}
                  >
                    Edit details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-testid={`student-transfer-${student.id}`}
                    onClick={() => {
                      setTransferTarget(student);
                      setTransferClassId(student.classId);
                    }}
                  >
                    Transfer class
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => inviteMutation.mutate(student.id)}>
                    <MailPlus className="mr-2 h-3.5 w-3.5" /> Invite guardian
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportSelection([student])}>
                    <Download className="mr-2 h-3.5 w-3.5" /> Export record
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      setConfirm({
                        title: "Graduate this student?",
                        description: `${student.firstName} ${student.lastName} will be marked as graduated and removed from active class lists.`,
                        label: "Graduate student",
                        run: () => statusMutation.mutate({ id: student.id, next: "graduated" }),
                      })
                    }
                  >
                    <GraduationCap className="mr-2 h-3.5 w-3.5" /> Graduate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setConfirm({
                        title: "Deactivate this student?",
                        description: `${student.firstName} ${student.lastName} will lose portal access and will not appear in attendance registers.`,
                        label: "Deactivate",
                        run: () => statusMutation.mutate({ id: student.id, next: "inactive" }),
                      })
                    }
                  >
                    <UserMinus className="mr-2 h-3.5 w-3.5" /> Deactivate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    data-testid={`student-delete-${student.id}`}
                    onClick={() =>
                      setConfirm({
                        title: "Delete this student record?",
                        description: `This permanently removes ${student.firstName} ${student.lastName}, including guardian links and documents. This cannot be undone.`,
                        label: "Delete permanently",
                        destructive: true,
                        run: () => removeMutation.mutate(student.id),
                      })
                    }
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete record
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const noFilters = !search && grade === "all" && section === "all" && status === "all" && year === "all" && branch === "all";

  return (
    <div data-testid="students-page">
      <PageHeader
        eyebrow="People"
        title="Students"
        description="The full student register with guardians, attendance health and fee position."
        meta={
          <>
            <span data-testid="students-total-count">{data?.total ?? 0} matching records</span>
            <span>{options.grades.length} grades · {classes.length} classes</span>
          </>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              data-testid="students-export"
              onClick={() => exportSelection(data?.rows ?? [])}
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            {can("students.manage") && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  data-testid="students-import"
                  onClick={() => setImportOpen(true)}
                >
                  <UploadCloud className="h-3.5 w-3.5" /> Import CSV
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  data-testid="students-add"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                >
                  <UserPlus className="h-3.5 w-3.5" /> Enroll student
                </Button>
              </>
            )}
          </>
        }
      />

      <FilterBar
        testId="students-filters"
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search by name, admission number or guardian…"
        filters={[
          { key: "grade", label: "Grade", value: grade, options: toOptions(options.grades, "All grades"), onChange: (v) => { setGrade(v); setPage(1); } },
          { key: "section", label: "Section", value: section, options: toOptions(options.sections, "All sections"), onChange: (v) => { setSection(v); setPage(1); }, width: "w-[130px]" },
          {
            key: "status",
            label: "Status",
            value: status,
            options: [
              { value: "all", label: "Any status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "graduated", label: "Graduated" },
              { value: "transferred", label: "Transferred" },
              { value: "suspended", label: "Suspended" },
            ],
            onChange: (v) => { setStatus(v); setPage(1); },
          },
          { key: "year", label: "Admission year", value: year, options: toOptions(options.years, "Any year"), onChange: (v) => { setYear(v); setPage(1); }, width: "w-[130px]" },
          {
            key: "branch",
            label: "Branch",
            value: branch,
            options: [{ value: "all", label: "All campuses" }, ...options.branches],
            onChange: (v) => { setBranch(v); setPage(1); },
            width: "w-[170px]",
          },
        ]}
        onReset={() => {
          setSearch("");
          setGrade("all");
          setSection("all");
          setStatus("all");
          setYear("all");
          setBranch("all");
          setPage(1);
        }}
      />

      <DataTable<Student>
        testId="students-table"
        columns={columns}
        rows={data?.rows ?? []}
        rowId={(student) => student.id}
        rowTestId={(student) => `student-row-${student.id}`}
        loading={isLoading}
        error={isError ? true : undefined}
        onRetry={() => refetch()}
        onRowClick={(student) => navigate(`/students/${student.id}`)}
        selectable={can("students.manage")}
        selected={selected}
        onSelectedChange={setSelected}
        sort={sort}
        onSortChange={(next) => {
          setSort(next);
          setPage(1);
        }}
        page={data?.page ?? 1}
        pageSize={10}
        total={data?.total ?? 0}
        onPageChange={setPage}
        bulkActions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              data-testid="students-bulk-export"
              onClick={() => exportSelection((data?.rows ?? []).filter((s) => selected.includes(s.id)))}
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              data-testid="students-bulk-invite"
              onClick={() => bulkMutation.mutate("invite_guardian")}
            >
              <MailPlus className="h-3.5 w-3.5" /> Invite guardians
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              data-testid="students-bulk-graduate"
              onClick={() =>
                setConfirm({
                  title: `Graduate ${selected.length} students?`,
                  description: "They will be marked as graduated and removed from active class registers.",
                  label: "Graduate students",
                  run: () => bulkMutation.mutate("graduate"),
                })
              }
            >
              <GraduationCap className="h-3.5 w-3.5" /> Graduate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs text-destructive"
              data-testid="students-bulk-delete"
              onClick={() =>
                setConfirm({
                  title: `Delete ${selected.length} student records?`,
                  description: "This permanently removes the selected students and their guardian links. This cannot be undone.",
                  label: "Delete permanently",
                  destructive: true,
                  run: () => bulkMutation.mutate("delete"),
                })
              }
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </>
        }
        empty={
          noFilters ? (
            <EmptyState
              icon={Users}
              title="No students yet"
              description="Import students from a CSV file or add the first student manually to start building the register."
              primaryLabel={can("students.manage") ? "Enroll first student" : undefined}
              onPrimary={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              secondaryLabel={can("students.manage") ? "Import from CSV" : undefined}
              onSecondary={() => setImportOpen(true)}
              testId="students-empty"
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No students match these filters"
              description="Try a different grade, section or status — or clear the filters to see the whole register."
              primaryLabel="Clear filters"
              onPrimary={() => {
                setSearch("");
                setGrade("all");
                setSection("all");
                setStatus("all");
                setYear("all");
                setBranch("all");
              }}
              testId="students-empty-filtered"
            />
          )
        }
      />

      <StudentFormDialog
        open={formOpen}
        student={editing}
        classes={classes}
        branches={options.branches}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditing(null);
            clearParams();
          }
        }}
        onSaved={invalidate}
      />

      <CsvImportWizard
        open={importOpen}
        onOpenChange={(open) => {
          setImportOpen(open);
          if (!open) clearParams();
        }}
        onImported={invalidate}
      />

      <Dialog open={Boolean(transferTarget)} onOpenChange={(open) => !open && setTransferTarget(null)}>
        <DialogContent className="bg-popover sm:max-w-md" data-testid="transfer-dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Transfer student</DialogTitle>
            <DialogDescription>
              Move {transferTarget?.firstName} {transferTarget?.lastName} to another class. Roll numbers are reassigned
              automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Destination class</p>
            <Select value={transferClassId} onValueChange={setTransferClassId}>
              <SelectTrigger data-testid="transfer-class-select">
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id} data-testid={`transfer-class-${cls.id}`}>
                    {cls.name} · {cls.studentCount}/{cls.capacity} seats
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferTarget(null)}>
              Cancel
            </Button>
            <Button
              data-testid="transfer-confirm"
              disabled={!transferClassId || transferMutation.isPending}
              onClick={() => transferMutation.mutate()}
            >
              {transferMutation.isPending ? "Transferring…" : "Transfer student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.title ?? ""}
        description={confirm?.description ?? ""}
        confirmLabel={confirm?.label}
        destructive={confirm?.destructive}
        busy={removeMutation.isPending || bulkMutation.isPending || statusMutation.isPending}
        onConfirm={() => confirm?.run()}
        testId="students-confirm"
      />
    </div>
  );
}
