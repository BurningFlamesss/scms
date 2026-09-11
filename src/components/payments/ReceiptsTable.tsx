import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, MoreHorizontal, Receipt, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { PaymentTransaction } from "#/types";
import { listPayments, refundPayment } from "#/services/operations";
import { useAuth } from "#/providers/AuthProvider";
import { DataTable, type Column, type SortState } from "#/components/common/DataTable";
import { FilterBar } from "#/components/common/FilterBar";
import { EmptyState } from "#/components/common/EmptyState";
import { StatusBadge } from "#/components/common/StatusBadge";
import { PersonCell } from "#/components/common/PersonCell";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { downloadTextFile, formatCurrency, formatDateTime, relativeTime, toCsv } from "#/lib/format";
import { ReceiptDialog } from "./ReceiptDialog";
import { METHOD_ICON, METHOD_LABEL, METHOD_OPTIONS, RECEIPT_STATUS_OPTIONS } from "./payments-constants";

const PAGE_SIZE = 10;

export function ReceiptsTable({ canManage }: { canManage: boolean }) {
  const { actor } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>({ key: "paidAt", dir: "desc" });
  const [viewing, setViewing] = useState<PaymentTransaction | null>(null);
  const [pendingRefund, setPendingRefund] = useState<PaymentTransaction | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["payments", { search, method, status }],
    queryFn: () => listPayments({ search, method, status, pageSize: 1000 }),
  });

  const rows = data?.rows ?? [];
  const sorted = [...rows].sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    switch (sort.key) {
      case "amount":
        return (a.amount - b.amount) * dir;
      case "student":
        return a.studentName.localeCompare(b.studentName) * dir;
      case "method":
        return a.method.localeCompare(b.method) * dir;
      case "status":
        return a.status.localeCompare(b.status) * dir;
      default:
        return (a.paidAt < b.paidAt ? -1 : 1) * dir;
    }
  });
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const refundMutation = useMutation({
    mutationFn: (id: string) => refundPayment(id, actor),
    onSuccess: (payment) => {
      toast.success(`${payment.receiptNo} refunded`);
      setPendingRefund(null);
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["payments-analytics"] });
      qc.invalidateQueries({ queryKey: ["payments-summary"] });
      qc.invalidateQueries({ queryKey: ["student-balances"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const exportRows = () => {
    if (sorted.length === 0) {
      toast.error("Nothing to export with these filters.");
      return;
    }
    const csv = toCsv(
      sorted.map((row) => ({
        receiptNo: row.receiptNo,
        invoiceNo: row.invoiceNo,
        student: row.studentName,
        amount: row.amount,
        method: row.method,
        reference: row.reference,
        status: row.status,
        paidAt: row.paidAt,
        recordedBy: row.recordedBy,
      })),
    );
    downloadTextFile(`northfield-receipts-${Date.now()}.csv`, csv);
    toast.success(`Exported ${sorted.length} receipts`);
  };

  const collected = sorted
    .filter((row) => row.status === "succeeded")
    .reduce((sum, row) => sum + row.amount, 0);

  const columns: Column<PaymentTransaction>[] = [
    {
      key: "receipt",
      header: "Receipt",
      render: (row) => (
        <PersonCell name={row.studentName} subtitle={row.receiptNo} mono testId={`receipts-row-name-${row.id}`} />
      ),
    },
    {
      key: "invoice",
      header: "Invoice",
      render: (row) => (
        <button
          type="button"
          className="num font-mono text-xs text-primary underline-offset-2 transition-colors hover:underline focus-ring"
          data-testid={`receipts-invoice-${row.id}`}
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/payments/invoices/${row.invoiceId}`);
          }}
        >
          {row.invoiceNo}
        </button>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      align: "right",
      render: (row) => (
        <span className="num text-sm font-semibold text-foreground">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: "method",
      header: "Method",
      sortable: true,
      render: (row) => {
        const Icon = METHOD_ICON[row.method];
        return (
          <span className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0">
              <span className="block truncate text-sm text-foreground">{METHOD_LABEL[row.method]}</span>
              <span className="num block truncate font-mono text-[11px] text-muted-foreground">{row.reference}</span>
            </span>
          </span>
        );
      },
    },
    {
      key: "paidAt",
      header: "Paid",
      sortable: true,
      render: (row) => (
        <div>
          <p className="num text-sm text-foreground">{formatDateTime(row.paidAt)}</p>
          <p className="text-xs text-muted-foreground">
            {relativeTime(row.paidAt)} · {row.recordedBy}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge value={row.status} testId={`receipts-status-${row.id}`} />,
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
              aria-label="Receipt actions"
              data-testid={`receipts-actions-${row.id}`}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover">
            <DropdownMenuLabel className="truncate font-mono text-xs">{row.receiptNo}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid={`receipts-view-${row.id}`} onClick={() => setViewing(row)}>
              <Receipt className="mr-2 h-3.5 w-3.5" /> View receipt
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/payments/invoices/${row.invoiceId}`)}>
              <FileText className="mr-2 h-3.5 w-3.5" /> Open invoice
            </DropdownMenuItem>
            {canManage && row.status === "succeeded" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  data-testid={`receipts-refund-${row.id}`}
                  onClick={() => setPendingRefund(row)}
                >
                  <RotateCcw className="mr-2 h-3.5 w-3.5" /> Refund payment
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div data-testid="receipts-panel">
      <FilterBar
        testId="receipts-filters"
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search by student, receipt, reference or invoice…"
        filters={[
          {
            key: "method",
            label: "Method",
            value: method,
            options: [{ value: "all", label: "Any method" }, ...METHOD_OPTIONS],
            onChange: (value) => {
              setMethod(value);
              setPage(1);
            },
            width: "w-[150px]",
          },
          {
            key: "status",
            label: "Status",
            value: status,
            options: RECEIPT_STATUS_OPTIONS,
            onChange: (value) => {
              setStatus(value);
              setPage(1);
            },
            width: "w-[140px]",
          },
        ]}
        onReset={() => {
          setSearch("");
          setMethod("all");
          setStatus("all");
          setPage(1);
        }}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs"
            data-testid="receipts-export"
            onClick={exportRows}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        }
      />

      <DataTable<PaymentTransaction>
        testId="receipts-table"
        columns={columns}
        rows={paged}
        rowId={(row) => row.id}
        rowTestId={(row) => `receipts-row-${row.id}`}
        loading={isLoading}
        error={isError ? true : undefined}
        onRetry={() => refetch()}
        onRowClick={(row) => setViewing(row)}
        sort={sort}
        onSortChange={(next) => {
          setSort(next);
          setPage(1);
        }}
        page={page}
        pageSize={PAGE_SIZE}
        total={sorted.length}
        onPageChange={setPage}
        footNote={
          <span data-testid="receipts-table-totals">
            {sorted.length} receipts · {formatCurrency(collected)} collected
          </span>
        }
        empty={
          <EmptyState
            icon={Receipt}
            title="No receipts yet"
            description="Record a payment against an invoice — or use the demo checkout — and the receipt appears here."
            secondaryLabel="Clear filters"
            onSecondary={() => {
              setSearch("");
              setMethod("all");
              setStatus("all");
            }}
            testId="receipts-empty"
          />
        }
      />

      <ReceiptDialog payment={viewing} onOpenChange={(open) => !open && setViewing(null)} />

      <ConfirmDialog
        open={Boolean(pendingRefund)}
        onOpenChange={(open) => !open && setPendingRefund(null)}
        title="Refund this payment?"
        description={`${formatCurrency(pendingRefund?.amount ?? 0)} will be reversed on ${
          pendingRefund?.invoiceNo
        } and the balance returns to ${pendingRefund?.studentName}'s account.`}
        confirmLabel="Refund payment"
        destructive
        busy={refundMutation.isPending}
        onConfirm={() => pendingRefund && refundMutation.mutate(pendingRefund.id)}
        testId="receipts-refund-confirm"
      />
    </div>
  );
}
