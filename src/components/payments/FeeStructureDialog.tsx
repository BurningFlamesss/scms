import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import type { FeeStructure } from "#/types";
import { createFeeStructure, updateFeeStructure } from "#/services/operations";
import { listAcademicYears } from "#/services/website";
import { useAuth } from "#/providers/AuthProvider";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { formatCurrency } from "#/lib/format";

interface FeeStructureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  structure?: FeeStructure | null;
  grades: string[];
}

interface ComponentRow {
  label: string;
  amount: number;
}

const DEFAULT_COMPONENTS: ComponentRow[] = [
  { label: "Tuition", amount: 3200 },
  { label: "Technology & labs", amount: 240 },
];

export function FeeStructureDialog({ open, onOpenChange, structure, grades }: FeeStructureDialogProps) {
  const { actor } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [frequency, setFrequency] = useState<FeeStructure["frequency"]>("term");
  const [academicYearId, setAcademicYearId] = useState("");
  const [components, setComponents] = useState<ComponentRow[]>(DEFAULT_COMPONENTS);
  const [error, setError] = useState("");

  const { data: years = [] } = useQuery({ queryKey: ["academic-years"], queryFn: listAcademicYears, enabled: open });

  useEffect(() => {
    if (!open) return;
    setError("");
    if (structure) {
      setName(structure.name);
      setGrade(structure.grade);
      setFrequency(structure.frequency);
      setAcademicYearId(structure.academicYearId);
      setComponents(structure.components.map((row) => ({ ...row })));
    } else {
      setName("");
      setGrade(grades[0] ?? "");
      setFrequency("term");
      setAcademicYearId(years.find((year) => year.isCurrent)?.id ?? years[0]?.id ?? "");
      setComponents(DEFAULT_COMPONENTS.map((row) => ({ ...row })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, structure, years.length]);

  const total = components.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  const mutation = useMutation({
    mutationFn: () =>
      structure
        ? updateFeeStructure(structure.id, { name, grade, frequency, academicYearId, components }, actor)
        : createFeeStructure({ name, grade, frequency, academicYearId, components }, actor),
    onSuccess: () => {
      toast.success(structure ? "Fee structure updated" : "Fee structure created");
      qc.invalidateQueries({ queryKey: ["fee-structures"] });
      onOpenChange(false);
    },
    onError: (err: Error) => setError(err.message),
  });

  const submit = () => {
    if (!name.trim()) return setError("Give the structure a name, e.g. “Grade 8 — Annual Fee”.");
    if (!grade) return setError("Choose the grade this structure applies to.");
    if (components.length === 0) return setError("Add at least one fee component.");
    if (components.some((row) => !row.label.trim())) return setError("Every component needs a label.");
    return mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-hairline bg-popover sm:max-w-lg"
        data-testid="fee-structure-dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Wallet className="h-4 w-4 text-primary" /> {structure ? "Edit fee structure" : "New fee structure"}
          </DialogTitle>
          <DialogDescription>
            Components are summed into the headline amount used when issuing invoices for this grade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="fee-name" className="text-xs">
              Name
            </Label>
            <Input
              id="fee-name"
              value={name}
              placeholder="Grade 8 — Annual Fee"
              data-testid="fee-structure-name"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
            />
          </div>

          <div className="grid gap-3.5 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Grade</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger data-testid="fee-structure-grade">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {grades.map((item) => (
                    <SelectItem key={item} value={item} className="text-xs">
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Frequency</Label>
              <Select
                value={frequency}
                onValueChange={(value: string) => setFrequency(value as FeeStructure["frequency"])}
              >
                <SelectTrigger data-testid="fee-structure-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="annual" className="text-xs">
                    Annual
                  </SelectItem>
                  <SelectItem value="term" className="text-xs">
                    Per term
                  </SelectItem>
                  <SelectItem value="monthly" className="text-xs">
                    Monthly
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Academic year</Label>
              <Select value={academicYearId} onValueChange={setAcademicYearId}>
                <SelectTrigger data-testid="fee-structure-year">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {years.map((year) => (
                    <SelectItem key={year.id} value={year.id} className="text-xs">
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border border-hairline">
            <div className="flex items-center justify-between border-b border-hairline px-3 py-2">
              <p className="eyebrow-label">Components</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
                data-testid="fee-structure-add-component"
                onClick={() => setComponents((prev) => [...prev, { label: "", amount: 0 }])}
              >
                <Plus className="h-3.5 w-3.5" /> Add component
              </Button>
            </div>
            <ul className="divide-y divide-hairline">
              {components.map((row, index) => (
                <li key={index} className="flex items-center gap-2 px-3 py-2">
                  <Input
                    value={row.label}
                    placeholder="Component"
                    className="h-8 flex-1 text-xs"
                    data-testid={`fee-structure-component-label-${index}`}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setComponents((prev) =>
                        prev.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)),
                      )
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    value={row.amount}
                    className="num h-8 w-28 text-xs"
                    data-testid={`fee-structure-component-amount-${index}`}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setComponents((prev) =>
                        prev.map((item, i) => (i === index ? { ...item, amount: Number(event.target.value) } : item)),
                      )
                    }
                  />
                  <button
                    type="button"
                    aria-label="Remove component"
                    className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive focus-ring"
                    data-testid={`fee-structure-remove-component-${index}`}
                    onClick={() => setComponents((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-hairline px-3 py-2">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="num text-sm font-semibold text-foreground" data-testid="fee-structure-total">
                {formatCurrency(total)}
              </p>
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive" data-testid="fee-structure-error">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="fee-structure-cancel">
            Cancel
          </Button>
          <Button disabled={mutation.isPending} onClick={submit} data-testid="fee-structure-submit">
            {mutation.isPending ? "Saving…" : structure ? "Save structure" : "Create structure"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
