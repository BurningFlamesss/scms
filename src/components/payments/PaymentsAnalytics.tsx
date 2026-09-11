import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getPaymentsAnalytics, studentBalances } from "#/services/operations";
import { Panel } from "#/components/common/Panel";
import { PanelSkeleton } from "#/components/common/Skeletons";
import { PersonCell } from "#/components/common/PersonCell";
import { formatCurrency } from "#/lib/format";
import { cn } from "#/lib/utils";

const TOOLTIP_STYLE = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--hairline))",
  borderRadius: 8,
  fontSize: 12,
} as const;

export function PaymentsAnalytics() {
  const { data, isLoading } = useQuery({ queryKey: ["payments-analytics"], queryFn: getPaymentsAnalytics });
  const { data: balances = [] } = useQuery({ queryKey: ["student-balances"], queryFn: () => studentBalances(8) });

  if (isLoading || !data) {
    return (
      <div className="grid gap-5 lg:grid-cols-2" data-testid="payments-analytics-loading">
        <PanelSkeleton height="h-60" />
        <PanelSkeleton height="h-60" />
        <PanelSkeleton height="h-60" />
        <PanelSkeleton height="h-60" />
      </div>
    );
  }

  const maxAgeing = Math.max(1, ...data.ageing.map((row) => row.amount));
  const maxMethod = Math.max(1, ...data.methods.map((row) => row.amount));

  return (
    <div className="grid gap-5 lg:grid-cols-12" data-testid="payments-analytics">
      <Panel
        className="lg:col-span-7"
        eyebrow="Cash flow"
        title="Billed vs collected"
        description="Last six months of invoicing and receipts"
        testId="payments-collections-panel"
      >
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.collections} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
              <CartesianGrid stroke="hsl(var(--hairline))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: number) => formatCurrency(Number(value))}
              />
              <Bar dataKey="billed" name="Billed" fill="hsl(var(--chart-3))" radius={[3, 3, 0, 0]} barSize={18} />
              <Line
                type="monotone"
                dataKey="collected"
                name="Collected"
                stroke="hsl(var(--primary))"
                strokeWidth={1.8}
                dot={{ r: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-hairline pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-4 rounded-full bg-chart-3" /> Billed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-4 rounded-full bg-primary" /> Collected
          </span>
        </div>
      </Panel>

      <Panel
        className="lg:col-span-5"
        eyebrow="Ageing"
        title="Outstanding by age"
        description="Unpaid balance grouped by days past due"
        testId="payments-ageing-panel"
      >
        <ul className="space-y-3">
          {data.ageing.map((row) => (
            <li key={row.bucket} data-testid={`payments-ageing-${row.bucket.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground">{row.bucket}</span>
                <span className="num font-semibold text-foreground">{formatCurrency(row.amount)}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <span
                    className={cn(
                      "block h-full rounded-full",
                      row.bucket === "Due soon" ? "bg-info" : row.bucket === "31+ days" ? "bg-destructive" : "bg-warning",
                    )}
                    style={{ width: `${Math.round((row.amount / maxAgeing) * 100)}%` }}
                  />
                </span>
                <span className="num w-20 shrink-0 text-right text-xs text-muted-foreground">
                  {row.count} invoices
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        className="lg:col-span-7"
        eyebrow="Cohorts"
        title="Collection rate by grade"
        description="Share of the billed amount already collected"
        testId="payments-grade-panel"
      >
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byGrade} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="hsl(var(--hairline))" vertical={false} />
              <XAxis
                dataKey="grade"
                tickFormatter={(value: string) => value.replace("Grade ", "G")}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => `${value}%`} />
              <Bar dataKey="rate" name="Collected %" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel
        className="lg:col-span-5"
        eyebrow="Channels"
        title="Collected by method"
        testId="payments-methods-panel"
      >
        <ul className="space-y-3">
          {data.methods.map((row) => (
            <li key={row.method} data-testid={`payments-method-${row.method}`}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground">{row.label}</span>
                <span className="num font-semibold text-foreground">{formatCurrency(row.amount)}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <span
                    className="block h-full rounded-full bg-chart-3"
                    style={{ width: `${Math.round((row.amount / maxMethod) * 100)}%` }}
                  />
                </span>
                <span className="num w-20 shrink-0 text-right text-xs text-muted-foreground">
                  {row.count} receipts
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        className="lg:col-span-12"
        eyebrow="Watchlist"
        title="Largest outstanding balances"
        description="Follow up with these guardians first"
        bodyClassName="p-2"
        testId="payments-balances-panel"
      >
        <ul className="grid gap-1 sm:grid-cols-2 xl:grid-cols-4">
          {balances.map((student) => (
            <li
              key={student.id}
              className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-surface-2"
              data-testid={`payments-balance-${student.id}`}
            >
              <div className="min-w-0 flex-1">
                <PersonCell
                  name={`${student.firstName} ${student.lastName}`}
                  subtitle={`${student.grade} · ${student.guardian.name}`}
                  avatarUrl={student.avatarUrl}
                  to={`/students/${student.id}`}
                  size="sm"
                />
              </div>
              <span className="num shrink-0 text-sm font-semibold text-destructive">
                {formatCurrency(student.feeBalance)}
              </span>
            </li>
          ))}
          {balances.length === 0 && (
            <li className="px-2 py-3 text-sm text-muted-foreground">Every student balance is settled.</li>
          )}
        </ul>
        <div className="px-2 pt-2">
          <Link
            to="/students"
            className="text-xs text-primary underline-offset-2 hover:underline"
            data-testid="payments-balances-all"
          >
            Open the student register
          </Link>
        </div>
      </Panel>
    </div>
  );
}
