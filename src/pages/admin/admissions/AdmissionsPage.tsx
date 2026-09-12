import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  CheckCircle2,
  Download,
  GraduationCap,
  Kanban,
  MoreHorizontal,
  Rows3,
  Trash2,
  UserPlus,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { Application, ApplicationStatus } from "#/types";
import {
  applicationFilterOptions,
  deleteApplication,
  listApplications,
  setApplicationStatus,
} from "#/services/operations";
import { listBranches } from "#/services/website";
import { listClasses } from "#/services/academics";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { FilterBar, toOptions } from "#/components/common/FilterBar";
import { DataTable, type Column } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { ErrorState } from "#/components/common/ErrorState";
import { StatusBadge } from "#/components/common/StatusBadge";
import { PersonCell } from "#/components/common/PersonCell";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { KanbanBoard } from "#/components/admissions/KanbanBoard";
import { ApplicationFormDialog } from "#/components/admissions/ApplicationFormDialog";
import { ConvertApplicantDialog } from "#/components/admissions/ConvertApplicantDialog";
import { PIPELINE, SOURCE_LABEL, scoreTone } from "#/components/admissions/pipeline-constants";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Skeleton } from "#/components/ui/skeleton";
import { downloadTextFile, formatDate, relativeTime, toCsv } from "#/lib/format";
import { cn } from "#/lib/utils";

export default function AdmissionsPage() {
  const { actor, can } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const searchParams = (useSearch({ strict: false }) as Record<string, string | undefined>) || {};

  const statusParam = searchParams.status ?? "all";
  const view = searchParams.view ?? (statusParam !== "all" ? "table" : "board");
  const canManage = can("admissions.manage");

  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("all");
  const [source, setSource] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [converting, setConverting] = useState<Application | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Application | null>(null);

  const setParam = (key: string, value: string) => {
    navigate({
      search: (prev: Record<string, any>) => {
        const next = { ...prev };
        if (value === "all" || !value) delete next[key];
        else next[key] = value;
        return next;
      },
      replace: true,
    });
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["applications", { search, grade, source }],
    queryFn: () => listApplications({ search, grade, source, pageSize: 500 }),
  });
  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: listBranches });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => listClasses() });

  const all = data?.rows ?? [];
  // NOTE: the mock layer mutates records in place, so react-query's structural
  // sharing can hand back the same array reference after a status change.
  // These derivations are cheap, so they run every render instead of memoising
  // on an identity that never changes.
  const options = applicationFilterOptions();
  const grades = Array.from(new Set([...options.grades, ...classes.map((cls) => cls.grade)])).sort();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["applications"] });
    qc.invalidateQueries({ queryKey: ["overview"] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      setApplicationStatus(id, status, actor),
    onSuccess: (application) => {
      toast.success(`${application.applicantName} moved to ${application.status}`);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteApplication(id, actor),
    onSuccess: () => {
      toast.success("Application deleted");
      setPendingDelete(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const target = String(over.id) as ApplicationStatus;
    const application = all.find((row) => row.id === String(active.id));
    if (!application || application.status === target) return;
    if (target === "converted") {
      setConverting(application);
      return;
    }
    statusMutation.mutate({ id: application.id, status: target });
  };

  const summary = PIPELINE.map((stage) => ({
    ...stage,
    count: all.filter((row) => row.status === stage.status).length,
  }));

  const tableRows = statusParam === "all" ? all : all.filter((row) => row.status === statusParam);

  const pageSize = 10;
  const pagedRows = tableRows.slice((page - 1) * pageSize, page * pageSize);

  const exportRows = () => {
    const csv = toCsv(
      tableRows.map((row) => ({
        applicationNo: row.applicationNo,
        applicant: row.applicantName,
        grade: row.gradeApplied,
        status: row.status,
        score: row.entranceScore ?? "",
        source: row.source,
        guardian: row.guardian.name,
        guardianPhone: row.guardian.phone,
        submitted: row.submittedAt.slice(0, 10),
      })),
    );
    downloadTextFile(`northfield-admissions-${Date.now()}.csv`, csv);
    toast.success(`Exported ${tableRows.length} applications`);
  };

  const columns: Column<Application>[] = [
    {
      key: "applicant",
      header: "Applicant",
      render: (row) => (
        <PersonCell
          name={row.applicantName}
          subtitle={row.applicationNo}
          avatarUrl={row.avatarUrl}
          to={`/admissions/${row.id}`}
          mono
          testId={`admissions-row-link-${row.id}`}
        />
      ),
    },
    {
      key: "grade",
      header: "Grade",
      render: (row) => (
        <div>
          <p className="text-sm text-foreground">{row.gradeApplied}</p>
          <p className="truncate text-xs text-muted-foreground">from {row.previousSchool}</p>
        </div>
      ),
    },
    {
      key: "guardian",
      header: "Guardian",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-foreground">{row.guardian.name}</p>
          <p className="num truncate text-xs text-muted-foreground">{row.guardian.phone}</p>
        </div>
      ),
    },
    {
      key: "score",
      header: "Score",
      align: "right",
      render: (row) => (
        <span className={cn("num text-sm font-semibold", scoreTone(row.entranceScore))}>
          {row.entranceScore ?? "—"}
        </span>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (row) => (
        <span className="text-xs text-muted-foreground">{SOURCE_LABEL[row.source] ?? row.source}</span>
      ),
    },
    {
      key: "submitted",
      header: "Submitted",
      render: (row) => (
        <div>
          <p className="num text-sm text-foreground">{formatDate(row.submittedAt)}</p>
          <p className="text-xs text-muted-foreground">{relativeTime(row.submittedAt)}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge value={row.status} testId={`admissions-status-${row.id}`} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Application actions"
              data-testid={`admissions-actions-${row.id}`}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-popover">
            <DropdownMenuLabel className="truncate text-xs">{row.applicantName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(`/admissions/${row.id}`)} data-testid={`admissions-view-${row.id}`}>
              Open application
            </DropdownMenuItem>
            {canManage && (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    setEditing(row);
                    setFormOpen(true);
                  }}
                >
                  Edit details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-testid={`admissions-accept-${row.id}`}
                  onClick={() => statusMutation.mutate({ id: row.id, status: "accepted" })}
                >
                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Make an offer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => statusMutation.mutate({ id: row.id, status: "waitlisted" })}>
                  Move to waitlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => statusMutation.mutate({ id: row.id, status: "rejected" })}>
                  <XCircle className="mr-2 h-3.5 w-3.5" /> Decline
                </DropdownMenuItem>
                {row.status !== "converted" && (
                  <DropdownMenuItem data-testid={`admissions-convert-${row.id}`} onClick={() => setConverting(row)}>
                    <GraduationCap className="mr-2 h-3.5 w-3.5" /> Enrol as student
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  data-testid={`admissions-delete-${row.id}`}
                  onClick={() => setPendingDelete(row)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete application
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div data-testid="admissions-page">
      <PageHeader
        eyebrow="Operations"
        title="Admissions"
        description="Move applications through the pipeline, review assessments and enrol accepted applicants."
        meta={
          <>
            <span data-testid="admissions-total">{all.length} applications in view</span>
            <span>{summary.find((s) => s.status === "pending")?.count ?? 0} awaiting review</span>
            <span>{summary.find((s) => s.status === "converted")?.count ?? 0} enrolled</span>
          </>
        }
        actions={
          <>
            <div className="flex items-center rounded-md border border-hairline bg-surface-1 p-0.5">
              <button
                type="button"
                data-testid="admissions-view-board"
                onClick={() => setParam("view", "board")}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors duration-150 focus-ring",
                  view === "board" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Kanban className="h-3.5 w-3.5" /> Pipeline
              </button>
              <button
                type="button"
                data-testid="admissions-view-table"
                onClick={() => setParam("view", "table")}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors duration-150 focus-ring",
                  view === "table" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Rows3 className="h-3.5 w-3.5" /> Table
              </button>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" data-testid="admissions-export" onClick={exportRows}>
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            {canManage && (
              <Button
                size="sm"
                className="gap-1.5"
                data-testid="admissions-new"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <UserPlus className="h-3.5 w-3.5" /> New application
              </Button>
            )}
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5" data-testid="admissions-summary">
        {summary.map((stage) => (
          <button
            key={stage.status}
            type="button"
            onClick={() => {
              setParam("status", statusParam === stage.status ? "all" : stage.status);
              setPage(1);
            }}
            data-testid={`admissions-summary-${stage.status}`}
            className={cn(
              "rounded-lg border bg-surface-1 px-3 py-2.5 text-left transition-colors duration-150 focus-ring",
              statusParam === stage.status ? "border-primary/50 bg-primary/6" : "border-hairline hover:border-primary/35",
            )}
          >
            <span className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", stage.rail)} />
              <span className="truncate text-[11px] font-medium text-muted-foreground">{stage.label}</span>
            </span>
            <span className="num mt-1 block font-display text-lg font-semibold leading-none text-foreground">
              {stage.count}
            </span>
          </button>
        ))}
      </div>

      <FilterBar
        testId="admissions-filters"
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search by applicant, application number or guardian…"
        filters={[
          {
            key: "grade",
            label: "Grade",
            value: grade,
            options: toOptions(options.grades, "All grades"),
            onChange: (value) => {
              setGrade(value);
              setPage(1);
            },
          },
          {
            key: "source",
            label: "Source",
            value: source,
            options: [
              { value: "all", label: "Any source" },
              ...options.sources.map((item) => ({ value: item, label: SOURCE_LABEL[item] ?? item })),
            ],
            onChange: (value) => {
              setSource(value);
              setPage(1);
            },
            width: "w-[150px]",
          },
          ...(view === "table"
            ? [
                {
                  key: "status",
                  label: "Status",
                  value: statusParam,
                  options: [
                    { value: "all", label: "Any status" },
                    ...PIPELINE.map((stage) => ({ value: stage.status, label: stage.label })),
                  ],
                  onChange: (value: string) => {
                    setParam("status", value);
                    setPage(1);
                  },
                  width: "w-[150px]",
                },
              ]
            : []),
        ]}
        onReset={() => {
          setSearch("");
          setGrade("all");
          setSource("all");
          setParam("status", "all");
          setPage(1);
        }}
      />

      {isError ? (
        <div className="panel">
          <ErrorState onRetry={() => refetch()} testId="admissions-error" />
        </div>
      ) : isLoading ? (
        <div className="flex gap-3 overflow-hidden" data-testid="admissions-loading">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="panel min-w-[240px] flex-1 space-y-2 p-3">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : view === "board" ? (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
          <KanbanBoard
            applications={all}
            canManage={canManage}
            highlightStatus={statusParam === "all" ? undefined : statusParam}
          />
        </DndContext>
      ) : (
        <DataTable<Application>
          testId="admissions-table"
          columns={columns}
          rows={pagedRows}
          rowId={(row) => row.id}
          rowTestId={(row) => `admissions-table-row-${row.id}`}
          onRowClick={(row) => navigate(`/admissions/${row.id}`)}
          page={page}
          pageSize={pageSize}
          total={tableRows.length}
          onPageChange={setPage}
          empty={
            <EmptyState
              icon={GraduationCap}
              title="No applications match these filters"
              description="Try another grade, source or status — or clear the filters to see the whole pipeline."
              primaryLabel="Clear filters"
              onPrimary={() => {
                setSearch("");
                setGrade("all");
                setSource("all");
                setParam("status", "all");
              }}
              testId="admissions-table-empty"
            />
          }
        />
      )}

      {canManage && view === "board" && all.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground" data-testid="admissions-board-hint">
          Drag a card by its handle to change its stage. Dropping into “Enrolled” opens the class-placement step.
        </p>
      )}

      <ApplicationFormDialog
        open={formOpen}
        application={editing}
        grades={grades}
        branches={branches}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
      />

      <ConvertApplicantDialog application={converting} onOpenChange={(open) => !open && setConverting(null)} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this application?"
        description={`${pendingDelete?.applicantName}'s application (${pendingDelete?.applicationNo}) and its notes will be permanently removed.`}
        confirmLabel="Delete application"
        destructive
        busy={removeMutation.isPending}
        onConfirm={() => pendingDelete && removeMutation.mutate(pendingDelete.id)}
        testId="admissions-delete-confirm"
      />
    </div>
  );
}
