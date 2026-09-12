import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CreditCard,
  Download,
  FileText,
  Receipt,
  RotateCcw,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { PaymentTransaction } from "#/types";
import { deleteInvoice, getInvoiceDetail, refundPayment, voidInvoice } from "#/services/operations";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel, KeyValue } from "#/components/common/Panel";
import { DetailSkeleton } from "#/components/common/Skeletons";
import { EmptyState } from "#/components/common/EmptyState";
import { ErrorState } from "#/components/common/ErrorState";
import { StatusBadge } from "#/components/common/StatusBadge";
import { PersonCell } from "#/components/common/PersonCell";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { RecordPaymentDialog } from "#/components/payments/RecordPaymentDialog";
import { ReceiptDialog } from "#/components/payments/ReceiptDialog";
import { METHOD_ICON, METHOD_LABEL, balanceOf, dueDescriptor, paidShare } from "#/components/payments/payments-constants";
import { Button } from "#/components/ui/button";
import { downloadTextFile, formatCurrency, formatDate, formatDateTime, relativeTime, toCsv } from "#/lib/format";
import { cn } from "#/lib/utils";

export default function InvoiceDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { actor, can } = useAuth();
  const canManage = can("payments.manage");

  const [recordOpen, setRecordOpen] = useState(false);
  const [viewing, setViewing] = useState<PaymentTransaction | null>(null);
  const [pendingRefund, setPendingRefund] = useState<PaymentTransaction | null>(null);
  const [voidOpen, setVoidOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceDetail(id),
    enabled: Boolean(id),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["invoice", id] });
    qc.invalidateQueries({ queryKey: ["invoices"] });
    qc.invalidateQueries({ queryKey: ["payments"] });
    qc.invalidateQueries({ queryKey: ["payments-analytics"] });
    qc.invalidateQueries({ queryKey: ["payments-summary"] });
    qc.invalidateQueries({ queryKey: ["student-balances"] });
    qc.invalidateQueries({ queryKey: ["students"] });
    qc.invalidateQueries({ queryKey: ["overview"] });
  };

  const voidMutation = useMutation({
    mutationFn: () => voidInvoice(id, actor),
    onSuccess: (invoice) => {
      toast.success(`${invoice.invoiceNo} voided`);
      setVoidOpen(false);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteInvoice(id, actor),
    onSuccess: () => {
      toast.success("Invoice deleted");
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["payments-summary"] });
      navigate("/admin/payments");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const refundMutation = useMutation({
    mutationFn: (paymentId: string) => refundPayment(paymentId, actor),
    onSuccess: (payment) => {
      toast.success(`${payment.receiptNo} refunded`);
      setPendingRefund(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) return <DetailSkeleton />;
  if (isError) {
    return (
      <div className="panel">
        <ErrorState onRetry={() => refetch()} testId="invoice-detail-error" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="panel">
        <EmptyState
          icon={FileText}
          title="Invoice not found"
          description="It may have been deleted. Head back to the ledger to pick another invoice."
          primaryLabel="Back to payments"
          onPrimary={() => navigate("/admin/payments")}
          testId="invoice-detail-missing"
        />
      </div>
    );
  }

  const { invoice, student, structure, payments } = data;
  const balance = balanceOf(invoice);
  const due = dueDescriptor(invoice);
  const settled = invoice.status === "paid" || invoice.status === "void";

  const exportReceipts = () => {
    if (payments.length === 0) {
      toast.error("No receipts to export for this invoice yet.");
      return;
    }
    const csv = toCsv(
      payments.map((row) => ({
        receiptNo: row.receiptNo,
        amount: row.amount,
        method: row.method,
        reference: row.reference,
        status: row.status,
        paidAt: row.paidAt,
        recordedBy: row.recordedBy,
      })),
    );
    downloadTextFile(`${invoice.invoiceNo}-receipts.csv`, csv);
    toast.success(`Exported ${payments.length} receipts`);
  };

  return (
    <div data-testid="invoice-detail-page">
      <PageHeader
        eyebrow="Payments"
        title={invoice.invoiceNo}
        description={`${invoice.term} fees for ${invoice.studentName} · ${invoice.grade}`}
        meta={
          <>
            <StatusBadge value={invoice.status} testId="invoice-status-badge" />
            <span data-testid="invoice-due-meta">
              Due {formatDate(invoice.dueDate)} · <span className={due.tone}>{due.label}</span>
            </span>
            <span>Issued {formatDate(invoice.issuedDate)}</span>
          </>
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/admin/payments" data-testid="invoice-back">
                <ArrowLeft className="h-3.5 w-3.5" /> All invoices
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              data-testid="invoice-export-receipts"
              onClick={exportReceipts}
            >
              <Download className="h-3.5 w-3.5" /> Receipts CSV
            </Button>
            {!settled && (
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link to={`/admin/payments/checkout/${invoice.id}`} data-testid="invoice-pay-online">
                  <CreditCard className="h-3.5 w-3.5" /> Pay online
                </Link>
              </Button>
            )}
            {canManage && !settled && (
              <Button size="sm" className="gap-1.5" data-testid="invoice-record-payment" onClick={() => setRecordOpen(true)}>
                <Receipt className="h-3.5 w-3.5" /> Record payment
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <Panel eyebrow="Balance" title="Amounts" testId="invoice-amounts-panel">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-hairline bg-surface-2 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">Invoiced</p>
                <p className="num mt-1 font-display text-xl font-semibold leading-none text-foreground" data-testid="invoice-amount">
                  {formatCurrency(invoice.amount)}
                </p>
              </div>
              <div className="rounded-lg border border-hairline bg-surface-2 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">Collected</p>
                <p className="num mt-1 font-display text-xl font-semibold leading-none text-success" data-testid="invoice-paid">
                  {formatCurrency(invoice.amountPaid)}
                </p>
              </div>
              <div className="rounded-lg border border-hairline bg-surface-2 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">Balance</p>
                <p
                  className={cn(
                    "num mt-1 font-display text-xl font-semibold leading-none",
                    balance > 0 && invoice.status !== "void" ? "text-destructive" : "text-muted-foreground",
                  )}
                  data-testid="invoice-balance"
                >
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{paidShare(invoice)}% collected</span>
                <span className="num">{payments.filter((p) => p.status === "succeeded").length} receipts</span>
              </div>
              <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-surface-2">
                <span
                  className={cn(
                    "block h-full rounded-full transition-transform duration-200",
                    invoice.status === "void" ? "bg-muted-foreground" : "bg-success",
                  )}
                  style={{ width: `${paidShare(invoice)}%` }}
                  data-testid="invoice-progress"
                />
              </span>
            </div>
          </Panel>

          <Panel
            eyebrow="Breakdown"
            title={structure ? structure.name : "Fee components"}
            description={structure ? `${structure.grade} · ${structure.frequency}` : "No structure linked"}
            testId="invoice-breakdown-panel"
          >
            {structure ? (
              <ul className="divide-y divide-hairline">
                {structure.components.map((component, index) => (
                  <li key={`${structure.id}-${index}`} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="truncate text-foreground">{component.label}</span>
                    <span className="num shrink-0 text-muted-foreground">{formatCurrency(component.amount)}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-3 pt-2.5 text-sm">
                  <span className="font-medium text-foreground">Structure total</span>
                  <span className="num font-semibold text-foreground">{formatCurrency(structure.amount)}</span>
                </li>
                <li className="flex items-center justify-between gap-3 pt-2.5 text-sm">
                  <span className="font-medium text-foreground">This invoice ({invoice.term})</span>
                  <span className="num font-semibold text-primary">{formatCurrency(invoice.amount)}</span>
                </li>
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                This invoice was issued without a linked fee structure, so only the headline amount applies.
              </p>
            )}
          </Panel>

          <Panel
            eyebrow="Receipts"
            title="Payment history"
            description="Every receipt recorded against this invoice"
            bodyClassName={payments.length ? "p-0" : "p-4"}
            testId="invoice-receipts-panel"
          >
            {payments.length === 0 ? (
              <EmptyState
                icon={Receipt}
                compact
                title="No payments yet"
                description="Record a payment or use the demo checkout to collect this invoice."
                primaryLabel={canManage && !settled ? "Record a payment" : undefined}
                onPrimary={() => setRecordOpen(true)}
                testId="invoice-receipts-empty"
              />
            ) : (
              <ul className="divide-y divide-hairline">
                {payments.map((payment) => {
                  const Icon = METHOD_ICON[payment.method];
                  return (
                    <li
                      key={payment.id}
                      className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                      data-testid={`invoice-receipt-${payment.id}`}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-hairline bg-surface-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="num truncate font-mono text-xs text-foreground">{payment.receiptNo}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {METHOD_LABEL[payment.method]} · {payment.reference} · {relativeTime(payment.paidAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="num text-sm font-semibold text-foreground">{formatCurrency(payment.amount)}</p>
                        <p className="text-[11px] text-muted-foreground">{formatDateTime(payment.paidAt)}</p>
                      </div>
                      <StatusBadge value={payment.status} testId={`invoice-receipt-status-${payment.id}`} />
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          data-testid={`invoice-receipt-view-${payment.id}`}
                          onClick={() => setViewing(payment)}
                        >
                          View
                        </Button>
                        {canManage && payment.status === "succeeded" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 px-2 text-xs text-destructive"
                            data-testid={`invoice-receipt-refund-${payment.id}`}
                            onClick={() => setPendingRefund(payment)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Refund
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-5 lg:col-span-4">
          <Panel eyebrow="Student" title="Billed to" testId="invoice-student-panel">
            {student ? (
              <>
                <PersonCell
                  name={`${student.firstName} ${student.lastName}`}
                  subtitle={student.admissionNo}
                  avatarUrl={student.avatarUrl}
                  to={`/admin/students/${student.id}`}
                  size="lg"
                  mono
                  testId="invoice-student-link"
                />
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <KeyValue label="Grade" value={`${student.grade} ${student.section}`} />
                  <KeyValue label="Roll no" value={student.rollNo} mono />
                  <KeyValue label="Guardian" value={student.guardian.name} />
                  <KeyValue label="Guardian phone" value={student.guardian.phone} mono />
                  <KeyValue
                    label="Account balance"
                    value={
                      <span className={student.feeBalance > 0 ? "text-destructive" : "text-success"}>
                        {formatCurrency(student.feeBalance)}
                      </span>
                    }
                    testId="invoice-student-balance"
                  />
                  <KeyValue label="Status" value={<StatusBadge value={student.status} />} />
                </dl>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">The student record for this invoice is no longer available.</p>
            )}
          </Panel>

          <Panel eyebrow="Invoice" title="Details" testId="invoice-meta-panel">
            <dl className="grid gap-4 sm:grid-cols-2">
              <KeyValue label="Invoice no" value={invoice.invoiceNo} mono testId="invoice-no" />
              <KeyValue label="Term" value={invoice.term} />
              <KeyValue label="Issued" value={formatDate(invoice.issuedDate)} />
              <KeyValue label="Due" value={formatDate(invoice.dueDate)} />
              <KeyValue label="Structure" value={structure?.name} />
              <KeyValue label="Status" value={<StatusBadge value={invoice.status} />} />
            </dl>
          </Panel>

          {canManage && (
            <Panel eyebrow="Danger zone" title="Invoice lifecycle" testId="invoice-danger-panel">
              <div className="flex flex-col gap-2">
                {invoice.status !== "void" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start gap-1.5"
                    data-testid="invoice-void"
                    onClick={() => setVoidOpen(true)}
                  >
                    <ShieldOff className="h-3.5 w-3.5" /> Void this invoice
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-1.5 text-destructive"
                  data-testid="invoice-delete"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete invoice
                </Button>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Voiding clears the outstanding balance from the student account. Deleting also removes every receipt
                recorded against this invoice.
              </p>
            </Panel>
          )}
        </div>
      </div>

      <RecordPaymentDialog invoice={recordOpen ? invoice : null} onOpenChange={(open) => setRecordOpen(open)} />
      <ReceiptDialog payment={viewing} onOpenChange={(open) => !open && setViewing(null)} />

      <ConfirmDialog
        open={Boolean(pendingRefund)}
        onOpenChange={(open) => !open && setPendingRefund(null)}
        title="Refund this payment?"
        description={`${formatCurrency(pendingRefund?.amount ?? 0)} will be reversed and the balance returns to ${
          invoice.studentName
        }'s account.`}
        confirmLabel="Refund payment"
        destructive
        busy={refundMutation.isPending}
        onConfirm={() => pendingRefund && refundMutation.mutate(pendingRefund.id)}
        testId="invoice-refund-confirm"
      />

      <ConfirmDialog
        open={voidOpen}
        onOpenChange={setVoidOpen}
        title="Void this invoice?"
        description={`${invoice.invoiceNo} will be marked void and the outstanding ${formatCurrency(
          balance,
        )} is removed from ${invoice.studentName}'s account.`}
        confirmLabel="Void invoice"
        busy={voidMutation.isPending}
        onConfirm={() => voidMutation.mutate()}
        testId="invoice-void-confirm"
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this invoice?"
        description={`${invoice.invoiceNo} and its ${payments.length} receipt(s) will be permanently removed.`}
        confirmLabel="Delete invoice"
        destructive
        busy={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        testId="invoice-delete-confirm"
      />
    </div>
  );
}
