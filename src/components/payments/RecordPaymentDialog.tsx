import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Receipt } from "lucide-react";
import { toast } from "sonner";
import type { Invoice, PaymentMethod } from "#/types";
import { recordPayment } from "#/services/operations";
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
import { formatCurrency, formatDate } from "#/lib/format";

interface RecordPaymentDialogProps {
  invoice: Invoice | null;
  onOpenChange: (open: boolean) => void;
}

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "wallet", label: "Wallet" },
];

export function RecordPaymentDialog({ invoice, onOpenChange }: RecordPaymentDialogProps) {
  const { actor } = useAuth();
  const qc = useQueryClient();
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  const balance = invoice ? invoice.amount - invoice.amountPaid : 0;

  useEffect(() => {
    if (!invoice) return;
    setAmount(invoice.amount - invoice.amountPaid);
    setMethod("bank_transfer");
    setReference("");
    setError("");
  }, [invoice]);

  const mutation = useMutation({
    mutationFn: () => recordPayment(invoice!.id, amount, method, reference, actor),
    onSuccess: (payment) => {
      toast.success(`${formatCurrency(payment.amount)} recorded · receipt ${payment.receiptNo}`);
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["payments-analytics"] });
      qc.invalidateQueries({ queryKey: ["student-balances"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
      onOpenChange(false);
    },
    onError: (err: Error) => setError(err.message),
  });

  const submit = () => {
    if (!amount || amount <= 0) return setError("Enter an amount greater than zero.");
    if (amount > balance) return setError(`That is more than the outstanding balance of ${formatCurrency(balance)}.`);
    return mutation.mutate();
  };

  return (
    <Dialog open={Boolean(invoice)} onOpenChange={onOpenChange}>
      <DialogContent className="border-hairline bg-popover sm:max-w-md" data-testid="record-payment-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Receipt className="h-4 w-4 text-primary" /> Record a payment
          </DialogTitle>
          <DialogDescription>
            {invoice
              ? `${invoice.invoiceNo} · ${invoice.studentName} · due ${formatDate(invoice.dueDate)}`
              : "Choose an invoice first."}
          </DialogDescription>
        </DialogHeader>

        {invoice && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-hairline bg-surface-2 px-2.5 py-2">
                <p className="text-[11px] text-muted-foreground">Invoiced</p>
                <p className="num text-sm font-semibold text-foreground">{formatCurrency(invoice.amount)}</p>
              </div>
              <div className="rounded-lg border border-hairline bg-surface-2 px-2.5 py-2">
                <p className="text-[11px] text-muted-foreground">Paid</p>
                <p className="num text-sm font-semibold text-success">{formatCurrency(invoice.amountPaid)}</p>
              </div>
              <div className="rounded-lg border border-hairline bg-surface-2 px-2.5 py-2">
                <p className="text-[11px] text-muted-foreground">Balance</p>
                <p className="num text-sm font-semibold text-destructive" data-testid="record-payment-balance">
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payment-amount" className="text-xs">
                Amount
              </Label>
              <Input
                id="payment-amount"
                type="number"
                min={0}
                max={balance}
                value={amount}
                data-testid="record-payment-amount"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAmount(Number(event.target.value))}
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className="rounded border border-hairline px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-ring"
                  data-testid="record-payment-full"
                  onClick={() => setAmount(balance)}
                >
                  Full balance
                </button>
                <button
                  type="button"
                  className="rounded border border-hairline px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-ring"
                  data-testid="record-payment-half"
                  onClick={() => setAmount(Math.round(balance / 2))}
                >
                  Half
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Method</Label>
              <Select value={method} onValueChange={(value: string) => setMethod(value as PaymentMethod)}>
                <SelectTrigger data-testid="record-payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {METHODS.map((item) => (
                    <SelectItem key={item.value} value={item.value} data-testid={`record-payment-method-${item.value}`}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payment-reference" className="text-xs">
                Reference (optional)
              </Label>
              <Input
                id="payment-reference"
                value={reference}
                placeholder="TXN123456 or cheque number"
                data-testid="record-payment-reference"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setReference(event.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive" data-testid="record-payment-error">
                {error}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="record-payment-cancel">
            Cancel
          </Button>
          <Button disabled={mutation.isPending} onClick={submit} data-testid="record-payment-submit">
            {mutation.isPending ? "Recording…" : "Record payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
