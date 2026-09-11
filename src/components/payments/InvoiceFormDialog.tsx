import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, FilePlus2 } from "lucide-react";
import { toast } from "sonner";
import { createInvoice } from "@/services/operations";
import { listStudents } from "@/services/students";
import { listFeeStructures } from "@/services/operations";
import { useAuth } from "@/providers/AuthProvider";
import { DateField } from "@/components/common/DateField";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, formatCurrency, toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceFormDialog({ open, onOpenChange }: InvoiceFormDialogProps) {
  const { actor } = useAuth();
  const qc = useQueryClient();
  const [studentId, setStudentId] = useState("");
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);
  const [feeStructureId, setFeeStructureId] = useState("");
  const [term, setTerm] = useState("Term 2");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState(toDateKey(addDays(new Date(), 30)));
  const [error, setError] = useState("");

  const { data: studentPage } = useQuery({
    queryKey: ["students", "invoice-picker"],
    queryFn: () => listStudents({ status: "active", pageSize: 500 }),
    enabled: open,
  });
  const { data: structures = [] } = useQuery({
    queryKey: ["fee-structures"],
    queryFn: listFeeStructures,
    enabled: open,
  });

  const students = studentPage?.rows ?? [];
  const student = students.find((row) => row.id === studentId);

  useEffect(() => {
    if (!open) return;
    setStudentId("");
    setFeeStructureId("");
    setTerm("Term 2");
    setAmount(0);
    setDueDate(toDateKey(addDays(new Date(), 30)));
    setError("");
  }, [open]);

  // Default the fee structure (and amount) from the student's grade.
  useEffect(() => {
    if (!student) return;
    const match = structures.find((row) => row.grade === student.grade);
    if (match) {
      setFeeStructureId(match.id);
      setAmount(Math.round(match.amount / 3));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, structures.length]);

  const mutation = useMutation({
    mutationFn: () => createInvoice({ studentId, feeStructureId, term, amount, dueDate }, actor),
    onSuccess: (invoice) => {
      toast.success(`${invoice.invoiceNo} issued to ${invoice.studentName}`);
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["payments-analytics"] });
      qc.invalidateQueries({ queryKey: ["student-balances"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      onOpenChange(false);
    },
    onError: (err: Error) => setError(err.message),
  });

  const submit = () => {
    if (!studentId) return setError("Choose the student this invoice is for.");
    if (!feeStructureId) return setError("Choose a fee structure.");
    if (!amount || amount <= 0) return setError("Enter an invoice amount greater than zero.");
    return mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-hairline bg-popover sm:max-w-lg" data-testid="invoice-form-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <FilePlus2 className="h-4 w-4 text-primary" /> Issue an invoice
          </DialogTitle>
          <DialogDescription>
            The invoice is added as unpaid and the student's outstanding balance updates immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label className="text-xs">Student</Label>
            <Popover open={studentPickerOpen} onOpenChange={setStudentPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                  data-testid="invoice-form-student"
                >
                  <span className={cn("truncate", !student && "text-muted-foreground")}>
                    {student ? `${student.firstName} ${student.lastName} · ${student.grade} ${student.section}` : "Search for a student…"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] border-hairline bg-popover p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search students…" data-testid="invoice-form-student-search" />
                  <CommandList>
                    <CommandEmpty>No student matches that search.</CommandEmpty>
                    <CommandGroup>
                      {students.slice(0, 200).map((row) => (
                        <CommandItem
                          key={row.id}
                          value={`${row.firstName} ${row.lastName} ${row.admissionNo}`}
                          data-testid={`invoice-form-student-${row.id}`}
                          onSelect={() => {
                            setStudentId(row.id);
                            setStudentPickerOpen(false);
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-3.5 w-3.5", row.id === studentId ? "opacity-100" : "opacity-0")}
                          />
                          <span className="min-w-0 flex-1 truncate">
                            {row.firstName} {row.lastName}
                          </span>
                          <span className="num ml-2 font-mono text-[10px] text-muted-foreground">{row.admissionNo}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {student && student.feeBalance > 0 && (
              <p className="text-[11px] text-muted-foreground">
                Existing balance {formatCurrency(student.feeBalance)}
              </p>
            )}
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Fee structure</Label>
              <Select value={feeStructureId} onValueChange={setFeeStructureId}>
                <SelectTrigger data-testid="invoice-form-structure">
                  <SelectValue placeholder="Choose a structure" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {structures.map((row) => (
                    <SelectItem key={row.id} value={row.id} className="text-xs">
                      {row.name} · {formatCurrency(row.amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Term</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger data-testid="invoice-form-term">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                  <SelectItem value="Annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-amount" className="text-xs">
                Amount
              </Label>
              <Input
                id="invoice-amount"
                type="number"
                min={0}
                value={amount}
                data-testid="invoice-form-amount"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAmount(Number(event.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Due date</Label>
              <DateField value={dueDate} onChange={setDueDate} testId="invoice-form-due-date" />
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive" data-testid="invoice-form-error">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="invoice-form-cancel">
            Cancel
          </Button>
          <Button disabled={mutation.isPending} onClick={submit} data-testid="invoice-form-submit">
            {mutation.isPending ? "Issuing…" : "Issue invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
