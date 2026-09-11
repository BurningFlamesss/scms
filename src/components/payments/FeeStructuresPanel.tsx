import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, MoreHorizontal, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import type { FeeStructure } from "#/types";
import { createFeeStructure, deleteFeeStructure, listFeeStructures } from "#/services/operations";
import { listAcademicYears } from "#/services/website";
import { listClasses } from "#/services/academics";
import { useAuth } from "#/providers/AuthProvider";
import { Panel } from "#/components/common/Panel";
import { EmptyState } from "#/components/common/EmptyState";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { FilterBar, toOptions } from "#/components/common/FilterBar";
import { Button } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { formatCurrency } from "#/lib/format";
import { FeeStructureDialog } from "./FeeStructureDialog";
import { FREQUENCY_LABEL } from "./payments-constants";

export function FeeStructuresPanel({ canManage }: { canManage: boolean }) {
  const { actor } = useAuth();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FeeStructure | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FeeStructure | null>(null);

  const { data: structures = [], isLoading } = useQuery({
    queryKey: ["fee-structures"],
    queryFn: listFeeStructures,
  });
  const { data: years = [] } = useQuery({ queryKey: ["academic-years"], queryFn: listAcademicYears });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => listClasses() });

  const grades = Array.from(
    new Set([...classes.map((cls) => cls.grade), ...structures.map((row) => row.grade)]),
  ).sort();

  const rows = structures.filter((row) => {
    if (grade !== "all" && row.grade !== grade) return false;
    if (!search.trim()) return true;
    const needle = search.trim().toLowerCase();
    return row.name.toLowerCase().includes(needle) || row.grade.toLowerCase().includes(needle);
  });

  const duplicateMutation = useMutation({
    mutationFn: (structure: FeeStructure) =>
      createFeeStructure(
        {
          name: `${structure.name} (copy)`,
          grade: structure.grade,
          frequency: structure.frequency,
          academicYearId: structure.academicYearId,
          components: structure.components.map((component) => ({ ...component })),
        },
        actor,
      ),
    onSuccess: (structure) => {
      toast.success(`${structure.name} created`);
      qc.invalidateQueries({ queryKey: ["fee-structures"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFeeStructure(id, actor),
    onSuccess: () => {
      toast.success("Fee structure deleted");
      setPendingDelete(null);
      qc.invalidateQueries({ queryKey: ["fee-structures"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const yearLabel = (id: string) => years.find((year) => year.id === id)?.label ?? "—";

  return (
    <div data-testid="fee-structures-panel">
      <FilterBar
        testId="fee-structures-filters"
        search={search}
        onSearchChange={setSearch}
        placeholder="Search fee structures…"
        filters={[
          {
            key: "grade",
            label: "Grade",
            value: grade,
            options: toOptions(grades, "All grades"),
            onChange: setGrade,
          },
        ]}
        onReset={() => {
          setSearch("");
          setGrade("all");
        }}
        actions={
          canManage ? (
            <Button
              size="sm"
              className="h-9 gap-1.5 text-xs"
              data-testid="fee-structures-new"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> New structure
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="fee-structures-loading">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="panel space-y-3 p-4">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Wallet}
            title="No fee structures yet"
            description="Fee structures group tuition and other components per grade, and pre-fill the amount when you issue invoices."
            primaryLabel={canManage ? "Create a structure" : undefined}
            onPrimary={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            testId="fee-structures-empty"
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="fee-structures-grid">
          {rows.map((structure) => (
            <Panel
              key={structure.id}
              testId={`fee-structure-card-${structure.id}`}
              eyebrow={`${structure.grade} · ${FREQUENCY_LABEL[structure.frequency]}`}
              title={structure.name}
              description={yearLabel(structure.academicYearId)}
              actions={
                canManage ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Fee structure actions"
                        data-testid={`fee-structure-actions-${structure.id}`}
                        className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 bg-popover">
                      <DropdownMenuItem
                        data-testid={`fee-structure-edit-${structure.id}`}
                        onClick={() => {
                          setEditing(structure);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit structure
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        data-testid={`fee-structure-duplicate-${structure.id}`}
                        onClick={() => duplicateMutation.mutate(structure)}
                      >
                        <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        data-testid={`fee-structure-delete-${structure.id}`}
                        onClick={() => setPendingDelete(structure)}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : undefined
              }
            >
              <p
                className="num font-display text-2xl font-semibold leading-none text-foreground"
                data-testid={`fee-structure-amount-${structure.id}`}
              >
                {formatCurrency(structure.amount)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {structure.components.length} component{structure.components.length === 1 ? "" : "s"} ·{" "}
                {FREQUENCY_LABEL[structure.frequency].toLowerCase()}
              </p>
              <ul className="mt-3 space-y-1.5 border-t border-hairline pt-3">
                {structure.components.map((component, index) => (
                  <li key={`${structure.id}-${index}`} className="flex items-center justify-between gap-3 text-xs">
                    <span className="truncate text-muted-foreground">{component.label}</span>
                    <span className="num shrink-0 font-medium text-foreground">
                      {formatCurrency(component.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      )}

      <FeeStructureDialog
        open={dialogOpen}
        structure={editing}
        grades={grades}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this fee structure?"
        description={`${pendingDelete?.name} will be removed. Invoices already issued against it keep their amounts.`}
        confirmLabel="Delete structure"
        destructive
        busy={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        testId="fee-structures-delete-confirm"
      />
    </div>
  );
}
