import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCheck,
  ClipboardCheck,
  Filter,
  Save,
  ScanLine,
  Search,
  Undo2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { AttendanceState } from "#/types";
import { getAttendanceOverview, getClassRegister, saveClassRegister } from "#/services/academics";
import { useAuth } from "#/providers/AuthProvider";
import { Panel } from "#/components/common/Panel";
import { EmptyState } from "#/components/common/EmptyState";
import { ErrorState } from "#/components/common/ErrorState";
import { ListSkeleton, TableSkeleton } from "#/components/common/Skeletons";
import { PersonCell } from "#/components/common/PersonCell";
import { StateToggle } from "#/components/attendance/StateToggle";
import { PhotoScanDialog } from "#/components/attendance/PhotoScanDialog";
import { ATTENDANCE_STATES, rateBar, rateTone } from "#/components/attendance/attendance-constants";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { formatDateTime } from "#/lib/format";
import { cn } from "#/lib/utils";

interface DraftEntry {
  state: AttendanceState | null;
  note?: string;
}

interface DailyRegisterProps {
  date: string;
  classId: string;
  onClassChange: (classId: string) => void;
  canMark: boolean;
}

export function DailyRegister({ date, classId, onClassChange, canMark }: DailyRegisterProps) {
  const { actor } = useAuth();
  const qc = useQueryClient();
  const [classSearch, setClassSearch] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [draft, setDraft] = useState<Record<string, DraftEntry>>({});
  const [dirty, setDirty] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["attendance-overview", date],
    queryFn: () => getAttendanceOverview(date),
  });

  const {
    data: register,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["class-register", classId, date],
    queryFn: () => getClassRegister(classId, date),
    enabled: Boolean(classId),
  });

  useEffect(() => {
    if (!register) return;
    const next: Record<string, DraftEntry> = {};
    register.entries.forEach((entry) => {
      next[entry.student.id] = { state: entry.state, note: entry.note };
    });
    setDraft(next);
    setDirty(false);
  }, [register]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const entries = Object.entries(draft)
        .filter(([, value]) => value.state !== null)
        .map(([studentId, value]) => ({ studentId, state: value.state as AttendanceState, note: value.note }));
      return saveClassRegister(classId, date, entries, actor);
    },
    onSuccess: (count) => {
      toast.success(`Register submitted for ${count} student${count === 1 ? "" : "s"}`);
      qc.invalidateQueries({ queryKey: ["class-register"] });
      qc.invalidateQueries({ queryKey: ["attendance-overview"] });
      qc.invalidateQueries({ queryKey: ["attendance-stats"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const classes = useMemo(() => {
    const rows = overview?.classes ?? [];
    return rows.filter((row) => {
      if (openOnly && row.marked) return false;
      if (!classSearch.trim()) return true;
      return `${row.cls.name} ${row.cls.roomNo}`.toLowerCase().includes(classSearch.trim().toLowerCase());
    });
  }, [overview, classSearch, openOnly]);

  const markedCount = overview?.classes.filter((row) => row.marked).length ?? 0;
  const totalClasses = overview?.classes.length ?? 0;

  const setState = (studentId: string, state: AttendanceState) => {
    setDraft((prev) => ({ ...prev, [studentId]: { ...prev[studentId], state } }));
    setDirty(true);
  };

  const setNote = (studentId: string, note: string) => {
    setDraft((prev) => ({ ...prev, [studentId]: { ...prev[studentId], note } }));
    setDirty(true);
  };

  const markAll = (state: AttendanceState) => {
    if (!register) return;
    const next: Record<string, DraftEntry> = {};
    register.entries.forEach((entry) => {
      next[entry.student.id] = { ...draft[entry.student.id], state };
    });
    setDraft(next);
    setDirty(true);
  };

  const resetDraft = () => {
    if (!register) return;
    const next: Record<string, DraftEntry> = {};
    register.entries.forEach((entry) => {
      next[entry.student.id] = { state: entry.state, note: entry.note };
    });
    setDraft(next);
    setDirty(false);
  };

  const counts = useMemo(() => {
    const values = Object.values(draft);
    const of = (state: AttendanceState) => values.filter((v) => v.state === state).length;
    return {
      present: of("present"),
      absent: of("absent"),
      late: of("late"),
      excused: of("excused"),
      unmarked: values.filter((v) => v.state === null).length,
      total: values.length,
    };
  }, [draft]);

  const applyScan = (states: Record<string, AttendanceState>, absentCount: number) => {
    setDraft((prev) => {
      const next = { ...prev };
      Object.entries(states).forEach(([studentId, state]) => {
        next[studentId] = { ...next[studentId], state };
      });
      return next;
    });
    setDirty(true);
    toast.success(`Photo applied — ${absentCount} marked absent. Review, then submit the register.`);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)]">
      {/* Class rail ------------------------------------------------------- */}
      <Panel
        eyebrow="Registers"
        title="Classes"
        description={`${markedCount} of ${totalClasses} submitted`}
        bodyClassName="p-2"
        testId="attendance-class-rail"
        actions={
          <Button
            variant={openOnly ? "secondary" : "ghost"}
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
            data-testid="attendance-open-only-toggle"
            onClick={() => setOpenOnly((value) => !value)}
          >
            <Filter className="h-3.5 w-3.5" /> Open only
          </Button>
        }
      >
        <div className="relative mb-2 px-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={classSearch}
            placeholder="Find a class…"
            className="h-8 border-hairline bg-surface-1 pl-8 text-xs"
            data-testid="attendance-class-search"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setClassSearch(event.target.value)}
          />
        </div>

        {overviewLoading ? (
          <div className="p-2">
            <ListSkeleton rows={6} />
          </div>
        ) : classes.length === 0 ? (
          <EmptyState
            compact
            icon={ClipboardCheck}
            title="Nothing open"
            description={
              openOnly
                ? "Every register for this date has already been submitted."
                : "No class matches that search."
            }
            testId="attendance-class-rail-empty"
          />
        ) : (
          <ul className="max-h-[560px] space-y-0.5 overflow-y-auto" data-testid="attendance-class-list">
            {classes.map((row) => {
              const active = row.cls.id === classId;
              return (
                <li key={row.cls.id}>
                  <button
                    type="button"
                    onClick={() => onClassChange(row.cls.id)}
                    data-testid={`attendance-class-${row.cls.id}`}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors duration-150 focus-ring",
                      active
                        ? "bg-secondary before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-[2px] before:rounded-full before:bg-primary"
                        : "hover:bg-surface-2",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{row.cls.name}</span>
                      <span className="num block truncate text-[11px] text-muted-foreground">
                        Room {row.cls.roomNo} · {row.total} students
                      </span>
                    </span>
                    {row.marked ? (
                      <span className={cn("num shrink-0 text-xs font-semibold", rateTone(row.rate))}>{row.rate}%</span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-accent/14 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                        Open
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {/* Register --------------------------------------------------------- */}
      <Panel
        eyebrow="Daily register"
        title={register?.cls.name ?? "Select a class"}
        description={
          register?.marked
            ? `Submitted by ${register.markedBy} · ${formatDateTime(register.markedAt)}`
            : "Not submitted yet for this date"
        }
        bodyClassName="p-0"
        testId="attendance-register-panel"
        actions={
          canMark && register ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
                data-testid="attendance-scan-open"
                onClick={() => setScanOpen(true)}
              >
                <ScanLine className="h-3.5 w-3.5" /> Scan photo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
                data-testid="attendance-mark-all-present-button"
                onClick={() => markAll("present")}
              >
                <CheckCheck className="h-3.5 w-3.5" /> All present
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
                disabled={!dirty}
                data-testid="attendance-reset-draft"
                onClick={resetDraft}
              >
                <Undo2 className="h-3.5 w-3.5" /> Reset
              </Button>
            </>
          ) : null
        }
        footer={
          register ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                {ATTENDANCE_STATES.map((meta) => (
                  <span key={meta.value} className="flex items-center gap-1.5" data-testid={`attendance-count-${meta.value}`}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                    <span className="num text-foreground">{counts[meta.value]}</span> {meta.label}
                  </span>
                ))}
                {counts.unmarked > 0 && (
                  <span className="num" data-testid="attendance-count-unmarked">
                    {counts.unmarked} unmarked
                  </span>
                )}
              </div>
              {canMark && (
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={!dirty || saveMutation.isPending || counts.total === 0}
                  data-testid="attendance-save-register"
                  onClick={() => saveMutation.mutate()}
                >
                  <Save className="h-3.5 w-3.5" />
                  {saveMutation.isPending ? "Submitting…" : dirty ? "Submit register" : "No changes"}
                </Button>
              )}
            </div>
          ) : null
        }
      >
        {isError ? (
          <ErrorState onRetry={() => refetch()} testId="attendance-register-error" />
        ) : isLoading || !register ? (
          <TableSkeleton rows={8} columns={4} />
        ) : register.entries.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No active students in this class"
            description="Enrol students into this class to start running its daily register."
            testId="attendance-register-empty"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead className="bg-surface-2">
                <tr className="border-b border-hairline">
                  <th className="w-14 px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Roll
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Student
                  </th>
                  <th className="w-32 px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Term rate
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Note
                  </th>
                  <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Mark
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {register.entries.map((entry) => {
                  const value = draft[entry.student.id] ?? { state: entry.state, note: entry.note };
                  return (
                    <tr
                      key={entry.student.id}
                      className="group transition-colors duration-150 hover:bg-surface-2"
                      data-testid={`attendance-row-${entry.student.id}`}
                    >
                      <td className="num px-4 py-2 text-xs text-muted-foreground">{entry.student.rollNo}</td>
                      <td className="px-4 py-2">
                        <PersonCell
                          name={`${entry.student.firstName} ${entry.student.lastName}`}
                          subtitle={entry.student.admissionNo}
                          avatarUrl={entry.student.avatarUrl}
                          to={`/students/${entry.student.id}`}
                          size="sm"
                          mono
                          testId={`attendance-student-link-${entry.student.id}`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-2">
                            <span
                              className={cn("block h-full rounded-full", rateBar(entry.student.attendanceRate))}
                              style={{ width: `${entry.student.attendanceRate}%` }}
                            />
                          </span>
                          <span className="num text-xs text-muted-foreground">{entry.student.attendanceRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          value={value.note ?? ""}
                          placeholder={value.state && value.state !== "present" ? "Reason…" : "Add note"}
                          disabled={!canMark}
                          className="h-8 max-w-[190px] border-hairline bg-surface-1 text-xs"
                          data-testid={`attendance-note-${entry.student.id}`}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            setNote(entry.student.id, event.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <StateToggle
                          value={value.state}
                          disabled={!canMark}
                          onChange={(state) => setState(entry.student.id, state)}
                          testIdPrefix={`attendance-state-${entry.student.id}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {register && (
        <PhotoScanDialog
          open={scanOpen}
          onOpenChange={setScanOpen}
          classId={register.cls.id}
          className={register.cls.name}
          date={date}
          onApply={applyScan}
        />
      )}
    </div>
  );
}
