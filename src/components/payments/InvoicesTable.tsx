import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Download, FileText, MoreHorizontal, Receipt, ShieldOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Invoice } from "#/types";
import { deleteInvoice, invoiceFilterOptions, listInvoices, voidInvoice } from "#/services/operations";
import { useAuth } from "#/providers/AuthProvider";
import { DataTable, type Column, type SortState } from "#/components/common/DataTable";
import { FilterBar, toOptions } from "#/components/common/FilterBar";
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
import { downloadTextFile, formatCurrency, formatDate, toCsv } from "#/lib/format";
import { cn } from "#/lib/utils";
import { INVOICE_STATUS_OPTIONS, balanceOf, dueDescriptor, paidShare } from "./payments-constants";

interface InvoicesTableProps {
  canManage: boolean;
  status: string;
  onStatusChange: (value: string) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onIssue: () => void;
}

const PAGE_SIZE = 10;

export function InvoicesTable({
  canManage,
  status,
  onStatusChange,
  onRecordPayment,
  onIssue,
}: InvoicesTableProps) {
  const { actor } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("all");
  const [term, setTerm] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>({ key: "dueDate", dir: "asc" });
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingVoid, setPendingVoid] = useState<Invoice | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["invoices", { search, status, grade }],
    queryFn: () => listInvoices({ search, status, grade, pageSize: 1000 }),
  });

  const options = invoiceFilterOptions();
  const rows = (data?.rows ?? []).filter((row) => term === "all" || row.term === term);

  const sorted = [...rows].sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    switch (sort.key) {
      case "student":
        return a.studentName.localeCompare(b.studentName) * dir;
      case "amount":
        return (a.amount - b.amount) * dir;
      case "paid":
        return (a.amountPaid - b.amountPaid) * dir;
      case "balance":
        return (balanceOf(a) - balanceOf(b)) * dir;
      case "status":
        return a.status.localeCompare(b.status) * dir;
      case "invoiceNo":
        return a.invoiceNo.localeCompare(b.invoiceNo) * dir;
      default:
        return (a.dueDate < b.dueDate ? -1 : 1) * dir;
    }
  });

  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["invoices"] });
    qc.invalidateQueries({ queryKey: ["payments"] });
    qc.invalidateQueries({ queryKey: ["payments-analytics"] });
    qc.invalidateQueries({ queryKey: ["payments-summary"] });
    qc.invalidateQueries({ queryKey: ["student-balances"] });
    qc.invalidateQueries({ queryKey: ["students"] });
    qc.invalidateQueries({ queryKey: ["overview"] });
  };

  const voidMutation = useMutation({
    mutationFn: (id: string) => voidInvoice(id, actor),
    onSuccess: (invoice) => {
      toast.success(`${invoice.invoiceNo} voided`);
      setPendingVoid(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id, actor),
    onSuccess: () => {
      toast.success("Invoice deleted");
      setPendingDelete(null);
      setSelected([]);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const exportRows = (list: Invoice[]) => {
    if (list.length === 0) {
      toast.error("Nothing to export with these filters.");
      return;
    }
    const csv = toCsv(
      list.map((row) => ({
        invoiceNo: row.invoiceNo,
        student: row.studentName,
        grade: row.grade,
        term: row.term,
        amount: row.amount,
        amountPaid: row.amountPaid,
        balance: balanceOf(row),
        issued: row.issuedDate,
        due: row.dueDate,
        status: row.status,
      })),
    );
    downloadTextFile(`northfield-invoices-${Date.now()}.csv`, csv);
    toast.success(`Exported ${list.length} invoices`);
  };

  const resetFilters = () => {
    setSearch("");
    setGrade("all");
    setTerm("all");
    onStatusChange("all");
    setPage(1);
  };

  const columns: Column<Invoice>[] = [
    {
      key: "invoiceNo",
      header: "Invoice",
      sortable: true,
      render: (row) => (
        <PersonCell
          name={row.studentName}
          subtitle={row.invoiceNo}
          avatarUrl={row.studentAvatar}
          to={`/payments/invoices/${row.id}`}
          mono
          testId={`invoices-row-link-${row.id}`}
        />
      ),
    },
    {
      key: "term",
      header: "Grade / term",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-foreground">{row.grade}</p>
          <p className="truncate text-xs text-muted-foreground">{row.term}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Invoiced",
      sortable: true,
      align: "right",
      render: (row) => <span className="num text-sm text-foreground">{formatCurrency(row.amount)}</span>,
    },
    {
      key: "paid",
      header: "Collected",
      sortable: true,
      align: "right",
      render: (row) => (
        <div className="ml-auto w-24">
          <p className="num text-sm font-medium text-success">{formatCurrency(row.amountPaid)}</p>
          <span className="mt-1 block h-1 overflow-hidden rounded-full bg-surface-2">
            <span
              className={cn("block h-full rounded-full", row.status === "void" ? "bg-muted-foreground" : "bg-success")}
              style={{ width: `${paidShare(row)}%` }}
            />
          </span>
        </div>
      ),
    },
    {
      key: "balance",
      header: "Balance",
      sortable: true,
      align: "right",
      render: (row) => (
        <span
          className={cn(
            "num text-sm font-semibold",
            balanceOf(row) > 0 && row.status !== "void" ? "text-destructive" : "text-muted-foreground",
          )}
          data-testid={`invoices-balance-${row.id}`}
        >
          {formatCurrency(balanceOf(row))}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due",
      sortable: true,
      render: (row) => {
        const due = dueDescriptor(row);
        return (
          <div>
            <p className="num text-sm text-foreground">{formatDate(row.dueDate)}</p>
            <p className={cn("text-xs", due.tone)}>{due.label}</p>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge value={row.status} testId={`invoices-status-${row.id}`} />,
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
              aria-label="Invoice actions"
              data-testid={`invoices-actions-${row.id}`}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-popover">
            <DropdownMenuLabel className="truncate font-mono text-xs">{row.invoiceNo}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-testid={`invoices-open-${row.id}`}
              onClick={() => navigate(`/payments/invoices/${row.id}`)}
            >
              <FileText className="mr-2 h-3.5 w-3.5" /> Open invoice
            </DropdownMenuItem>
            {canManage && row.status !== "paid" && row.status !== "void" && (
              <DropdownMenuItem data-testid={`invoices-record-${row.id}`} onClick={() => onRecordPayment(row)}>
                <Receipt className="mr-2 h-3.5 w-3.5" /> Record a payment
              </DropdownMenuItem>
            )}
            {row.status !== "paid" && row.status !== "void" && (
              <DropdownMenuItem
                data-testid={`invoices-checkout-${row.id}`}
                onClick={() => navigate(`/payments/checkout/${row.id}`)}
              >
                <CreditCard className="mr-2 h-3.5 w-3.5" /> Pay online (demo)
              </DropdownMenuItem>
            )}
            {canManage && (
              <>
                <DropdownMenuSeparator />
                {row.status !== "void" && (
                  <DropdownMenuItem data-testid={`invoices-void-${row.id}`} onClick={() => setPendingVoid(row)}>
                    <ShieldOff className="mr-2 h-3.5 w-3.5" /> Void invoice
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  data-testid={`invoices-delete-${row.id}`}
                  onClick={() => setPendingDelete(row)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete invoice
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const totals = rows.reduce(
    (acc, row) => ({
      billed: acc.billed + row.amount,
      collected: acc.collected + row.amountPaid,
    }),
    { billed: 0, collected: 0 },
  );

  return (
    <div data-testid="invoices-panel">
      <FilterBar
        testId="invoices-filters"
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search by student or invoice number…"
        filters={[
          {
            key: "status",
            label: "Status",
            value: status,
            options: INVOICE_STATUS_OPTIONS,
            onChange: (value) => {
              onStatusChange(value);
              setPage(1);
            },
            width: "w-[140px]",
          },
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
            key: "term",
            label: "Term",
            value: term,
            options: toOptions(options.terms, "All terms"),
            onChange: (value) => {
              setTerm(value);
              setPage(1);
            },
            width: "w-[130px]",
          },
        ]}
        onReset={resetFilters}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs"
            data-testid="invoices-export"
            onClick={() => exportRows(rows)}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        }
      />

      <DataTable<Invoice>
        testId="invoices-table"
        columns={columns}
        rows={paged}
        rowId={(row) => row.id}
        rowTestId={(row) => `invoices-row-${row.id}`}
        loading={isLoading}
        error={isError ? true : undefined}
        onRetry={() => refetch()}
        onRowClick={(row) => navigate(`/payments/invoices/${row.id}`)}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        bulkActions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              data-testid="invoices-bulk-export"
              onClick={() => exportRows(rows.filter((row) => selected.includes(row.id)))}
            >
              <Download className="h-3.5 w-3.5" /> Export selected
            </Button>
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs text-destructive"
                data-testid="invoices-bulk-void"
                onClick={() => {
                  const target = rows.find((row) => selected.includes(row.id) && row.status !== "void");
                  if (!target) {
                    toast.error("Selected invoices are already void.");
                    return;
                  }
                  setPendingVoid(target);
                }}
              >
                <ShieldOff className="h-3.5 w-3.5" /> Void
              </Button>
            )}
          </>
        }
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
          <span data-testid="invoices-table-totals">
            {sorted.length} invoices · {formatCurrency(totals.billed)} billed · {formatCurrency(totals.collected)}{" "}
            collected
          </span>
        }
        empty={
          <EmptyState
            icon={FileText}
            title="No invoices match these filters"
            description="Try another status, grade or term — or issue a new invoice for a student."
            primaryLabel={canManage ? "Issue an invoice" : undefined}
            onPrimary={onIssue}
            secondaryLabel="Clear filters"
            onSecondary={resetFilters}
            testId="invoices-empty"
          />
        }
      />

      <ConfirmDialog
        open={Boolean(pendingVoid)}
        onOpenChange={(open) => !open && setPendingVoid(null)}
        title="Void this invoice?"
        description={`${pendingVoid?.invoiceNo} will be marked void and the outstanding balance of ${formatCurrency(
          pendingVoid ? balanceOf(pendingVoid) : 0,
        )} is removed from ${pendingVoid?.studentName}'s account.`}
        confirmLabel="Void invoice"
        busy={voidMutation.isPending}
        onConfirm={() => pendingVoid && voidMutation.mutate(pendingVoid.id)}
        testId="invoices-void-confirm"
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this invoice?"
        description={`${pendingDelete?.invoiceNo} and every receipt recorded against it will be permanently removed.`}
        confirmLabel="Delete invoice"
        destructive
        busy={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        testId="invoices-delete-confirm"
      />
    </div>
  );
}
