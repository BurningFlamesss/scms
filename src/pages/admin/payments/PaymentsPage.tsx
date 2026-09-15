import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FilePlus2, Wallet } from "lucide-react";
import type { Invoice } from "#/types";
import { paymentsSummary } from "#/services/operations";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { InvoicesTable } from "#/components/payments/InvoicesTable";
import { ReceiptsTable } from "#/components/payments/ReceiptsTable";
import { FeeStructuresPanel } from "#/components/payments/FeeStructuresPanel";
import { PaymentsAnalytics } from "#/components/payments/PaymentsAnalytics";
import { InvoiceFormDialog } from "#/components/payments/InvoiceFormDialog";
import { RecordPaymentDialog } from "#/components/payments/RecordPaymentDialog";
import { rateTone } from "#/components/payments/payments-constants";
import { Button } from "#/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { formatCurrency } from "#/lib/format";
import { cn } from "#/lib/utils";

type Tab = "invoices" | "receipts" | "structures" | "analytics";

const TABS: { value: Tab; label: string }[] = [
  { value: "invoices", label: "Invoices" },
  { value: "receipts", label: "Receipts" },
  { value: "structures", label: "Fee structures" },
  { value: "analytics", label: "Analytics" },
];

export default function PaymentsPage() {
  const { can } = useAuth();
  const navigate = useNavigate();
  const searchParams = (useSearch({ strict: false }) as Record<string, string | undefined>) || {};
  const canManage = can("payments.manage");

  const tab = (searchParams.tab as Tab) ?? "invoices";
  const status = searchParams.status ?? "all";

  const [issueOpen, setIssueOpen] = useState(false);
  const [recording, setRecording] = useState<Invoice | null>(null);

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

  const { data: summary } = useQuery({
    queryKey: ["payments-summary"],
    queryFn: async () => paymentsSummary(),
  });

  const kpis = summary
    ? [
        { key: "billed", label: "Billed", value: formatCurrency(summary.billed), tone: "text-foreground", status: "all" },
        {
          key: "collected",
          label: "Collected",
          value: formatCurrency(summary.collected),
          tone: "text-success",
          status: "paid",
        },
        {
          key: "outstanding",
          label: "Outstanding",
          value: formatCurrency(summary.outstanding),
          tone: "text-destructive",
          status: "unpaid",
        },
        {
          key: "rate",
          label: "Collection rate",
          value: `${summary.collectionRate}%`,
          tone: rateTone(summary.collectionRate),
          status: "all",
        },
        {
          key: "overdue",
          label: "Overdue invoices",
          value: String(summary.overdueCount),
          tone: "text-destructive",
          status: "overdue",
        },
        {
          key: "overdue-amount",
          label: "Overdue value",
          value: formatCurrency(summary.overdueAmount),
          tone: "text-warning",
          status: "overdue",
        },
        { key: "paid", label: "Paid invoices", value: String(summary.paidCount), tone: "text-success", status: "paid" },
        {
          key: "partial",
          label: "Part-paid",
          value: String(summary.partialCount),
          tone: "text-accent",
          status: "partial",
        },
      ]
    : [];

  return (
    <div data-testid="payments-page">
      <PageHeader
        eyebrow="Operations"
        title="Payments"
        description="Issue invoices, record receipts and keep collections on track across every grade and term."
        meta={
          summary ? (
            <>
              <span data-testid="payments-meta-outstanding">
                {formatCurrency(summary.outstanding)} outstanding across {summary.unpaidCount} invoices
              </span>
              <span data-testid="payments-meta-rate">{summary.collectionRate}% collected this year</span>
              {!canManage && <span>Read-only for your role</span>}
            </>
          ) : undefined
        }
        actions={
          canManage ? (
            <Button size="sm" className="gap-1.5" data-testid="payments-issue-invoice" onClick={() => setIssueOpen(true)}>
              <FilePlus2 className="h-3.5 w-3.5" /> Issue invoice
            </Button>
          ) : undefined
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8" data-testid="payments-kpis">
        {kpis.map((kpi) => (
          <button
            key={kpi.key}
            type="button"
            data-testid={`payments-kpi-${kpi.key}`}
            onClick={() => {
              navigate({
                search: (prev: Record<string, any>) => {
                  const next = { ...prev };
                  next.tab = "invoices";
                  if (kpi.status === "all") delete next.status;
                  else next.status = kpi.status;
                  return next;
                },
                replace: true,
              });
            }}
            className={cn(
              "rounded-lg border bg-surface-1 px-3 py-2.5 text-left transition-colors duration-150 focus-ring",
              tab === "invoices" && status !== "all" && status === kpi.status
                ? "border-primary/50 bg-primary/[0.06]"
                : "border-hairline hover:border-primary/35 hover:bg-surface-2",
            )}
          >
            <p className="truncate text-[11px] font-medium text-muted-foreground">{kpi.label}</p>
            <p className={cn("num mt-1 font-display text-lg font-semibold leading-none", kpi.tone)}>{kpi.value}</p>
          </button>
        ))}
        {kpis.length === 0 &&
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-[62px] animate-pulse rounded-lg border border-hairline bg-surface-2" />
          ))}
      </div>

      <Tabs value={tab} onValueChange={(value: string) => setParam("tab", value)} className="mb-4">
        <TabsList className="h-9" data-testid="payments-tabs">
          {TABS.map((item) => (
            <TabsTrigger key={item.value} value={item.value} data-testid={`payments-tab-${item.value}`}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tab === "invoices" && (
        <InvoicesTable
          canManage={canManage}
          status={status}
          onStatusChange={(value) => setParam("status", value)}
          onRecordPayment={setRecording}
          onIssue={() => setIssueOpen(true)}
        />
      )}
      {tab === "receipts" && <ReceiptsTable canManage={canManage} />}
      {tab === "structures" && <FeeStructuresPanel canManage={canManage} />}
      {tab === "analytics" && <PaymentsAnalytics />}

      {tab === "structures" && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground" data-testid="payments-structures-hint">
          <Wallet className="h-3.5 w-3.5" /> Structures pre-fill the invoice amount for a grade — components are summed
          into the headline figure.
        </p>
      )}

      <InvoiceFormDialog open={issueOpen} onOpenChange={setIssueOpen} />
      <RecordPaymentDialog invoice={recording} onOpenChange={(open) => !open && setRecording(null)} />
    </div>
  );
}
