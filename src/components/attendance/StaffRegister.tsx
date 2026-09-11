import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Save, Search, Undo2, UserCog } from "lucide-react";
import { toast } from "sonner";
import type { AttendanceState } from "#/types";
import { getStaffRegister, saveStaffRegister } from "#/services/academics";
import { useAuth } from "#/providers/AuthProvider";
import { Panel } from "#/components/common/Panel";
import { EmptyState } from "#/components/common/EmptyState";
import { ErrorState } from "#/components/common/ErrorState";
import { TableSkeleton } from "#/components/common/Skeletons";
import { PersonCell } from "#/components/common/PersonCell";
import { StateToggle } from "#/components/attendance/StateToggle";
import { ATTENDANCE_STATES } from "#/components/attendance/attendance-constants";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { cn } from "#/lib/utils";

interface StaffRegisterProps {
  date: string;
  canMark: boolean;
}

export function StaffRegister({ date, canMark }: StaffRegisterProps) {
  const { actor } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [draft, setDraft] = useState<Record<string, AttendanceState | null>>({});
  const [dirty, setDirty] = useState(false);

  const { data: entries = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["staff-register", date],
    queryFn: () => getStaffRegister(date),
  });

  useEffect(() => {
    const next: Record<string, AttendanceState | null> = {};
    entries.forEach((entry) => {
      next[entry.staff.id] = entry.state;
    });
    setDraft(next);
    setDirty(false);
  }, [entries]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = Object.entries(draft)
        .filter(([, state]) => state !== null)
        .map(([staffId, state]) => ({ staffId, state: state as AttendanceState }));
      return saveStaffRegister(date, payload, actor);
    },
    onSuccess: (count) => {
      toast.success(`Staff attendance saved for ${count} employee${count === 1 ? "" : "s"}`);
      qc.invalidateQueries({ queryKey: ["staff-register"] });
      qc.invalidateQueries({ queryKey: ["attendance-overview"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const departments = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.staff.department))).sort(),
    [entries],
  );

  const rows = useMemo(
    () =>
      entries.filter((entry) => {
        if (department !== "all" && entry.staff.department !== department) return false;
        if (!search.trim()) return true;
        const needle = search.trim().toLowerCase();
        return `${entry.staff.firstName} ${entry.staff.lastName} ${entry.staff.employeeId} ${entry.staff.designation}`
          .toLowerCase()
          .includes(needle);
      }),
    [entries, department, search],
  );

  const counts = useMemo(() => {
    const values = Object.values(draft);
    const of = (state: AttendanceState) => values.filter((v) => v === state).length;
    return {
      present: of("present"),
      absent: of("absent"),
      late: of("late"),
      excused: of("excused"),
      unmarked: values.filter((v) => v === null).length,
    };
  }, [draft]);

  const markAll = (state: AttendanceState) => {
    const next: Record<string, AttendanceState | null> = {};
    entries.forEach((entry) => {
      next[entry.staff.id] = state;
    });
    setDraft(next);
    setDirty(true);
  };

  return (
    <Panel
      eyebrow="Staff register"
      title="Staff attendance"
      description={`${entries.length} active employees on the roster`}
      bodyClassName="p-0"
      testId="staff-register-panel"
      actions={
        canMark ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              data-testid="staff-mark-all-present"
              onClick={() => markAll("present")}
            >
              <CheckCheck className="h-3.5 w-3.5" /> All present
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              disabled={!dirty}
              data-testid="staff-reset-draft"
              onClick={() => {
                const next: Record<string, AttendanceState | null> = {};
                entries.forEach((entry) => {
                  next[entry.staff.id] = entry.state;
                });
                setDraft(next);
                setDirty(false);
              }}
            >
              <Undo2 className="h-3.5 w-3.5" /> Reset
            </Button>
          </>
        ) : null
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {ATTENDANCE_STATES.map((meta) => (
              <span key={meta.value} className="flex items-center gap-1.5" data-testid={`staff-count-${meta.value}`}>
                <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                <span className="num text-foreground">{counts[meta.value]}</span> {meta.label}
              </span>
            ))}
            {counts.unmarked > 0 && <span className="num">{counts.unmarked} unmarked</span>}
          </div>
          {canMark && (
            <Button
              size="sm"
              className="gap-1.5"
              disabled={!dirty || saveMutation.isPending}
              data-testid="staff-save-register"
              onClick={() => saveMutation.mutate()}
            >
              <Save className="h-3.5 w-3.5" />
              {saveMutation.isPending ? "Saving…" : dirty ? "Save attendance" : "No changes"}
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-2 border-b border-hairline p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            placeholder="Search by name, employee ID or designation…"
            className="h-9 border-hairline bg-surface-1 pl-8 text-sm"
            data-testid="staff-register-search"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
          />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="h-9 w-[190px] border-hairline bg-surface-1 text-xs" data-testid="staff-register-department">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all" className="text-xs">
              All departments
            </SelectItem>
            {departments.map((item) => (
              <SelectItem key={item} value={item} className="text-xs">
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} testId="staff-register-error" />
      ) : isLoading ? (
        <TableSkeleton rows={8} columns={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          compact
          icon={UserCog}
          title="No staff match these filters"
          description="Try another department or clear the search to see the whole roster."
          primaryLabel="Clear filters"
          onPrimary={() => {
            setSearch("");
            setDepartment("all");
          }}
          testId="staff-register-empty"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="bg-surface-2">
              <tr className="border-b border-hairline">
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Employee
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Department
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Designation
                </th>
                <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Mark
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {rows.map((entry) => (
                <tr
                  key={entry.staff.id}
                  className="transition-colors duration-150 hover:bg-surface-2"
                  data-testid={`staff-attendance-row-${entry.staff.id}`}
                >
                  <td className="px-4 py-2">
                    <PersonCell
                      name={`${entry.staff.firstName} ${entry.staff.lastName}`}
                      subtitle={entry.staff.employeeId}
                      avatarUrl={entry.staff.avatarUrl}
                      to={`/staff/${entry.staff.id}`}
                      size="sm"
                      mono
                      testId={`staff-attendance-link-${entry.staff.id}`}
                    />
                  </td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">{entry.staff.department}</td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">{entry.staff.designation}</td>
                  <td className="px-4 py-2 text-right">
                    <StateToggle
                      value={draft[entry.staff.id] ?? null}
                      disabled={!canMark}
                      compact
                      onChange={(state) => {
                        setDraft((prev) => ({ ...prev, [entry.staff.id]: state }));
                        setDirty(true);
                      }}
                      testIdPrefix={`staff-state-${entry.staff.id}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
