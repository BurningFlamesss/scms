import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertOctagon } from "lucide-react";
import { getAttendanceStats, getAttendanceTrend } from "#/services/academics";
import { Panel } from "#/components/common/Panel";
import { PanelSkeleton } from "#/components/common/Skeletons";
import { EmptyState } from "#/components/common/EmptyState";
import { PersonCell } from "#/components/common/PersonCell";
import { rateBar, rateTone } from "#/components/attendance/attendance-constants";
import { cn } from "#/lib/utils";

const TOOLTIP_STYLE = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--hairline))",
  borderRadius: 8,
  fontSize: 12,
} as const;

export function AttendanceStats() {
  const { data: stats, isLoading } = useQuery({ queryKey: ["attendance-stats"], queryFn: getAttendanceStats });
  const { data: trend = [], isLoading: trendLoading } = useQuery({
    queryKey: ["attendance-trend"],
    queryFn: getAttendanceTrend,
  });

  if (isLoading || trendLoading || !stats) {
    return (
      <div className="grid gap-5 lg:grid-cols-2" data-testid="attendance-stats-loading">
        <PanelSkeleton height="h-56" />
        <PanelSkeleton height="h-56" />
        <PanelSkeleton height="h-56" />
        <PanelSkeleton height="h-56" />
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-12" data-testid="attendance-stats">
      <Panel
        className="lg:col-span-7"
        eyebrow="Trend"
        title="Attendance rate"
        description="Rolling school-wide rate across recent school days"
        testId="attendance-trend-panel"
      >
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="attendanceStatsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--hairline))" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => value.slice(5)}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                interval={3}
              />
              <YAxis
                domain={[75, 100]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip contentStyle={TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="rate"
                name="Attendance %"
                stroke="hsl(var(--primary))"
                strokeWidth={1.6}
                fill="url(#attendanceStatsFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel
        className="lg:col-span-5"
        eyebrow="This week"
        title="Rate by weekday"
        description="Where the week loses attendance"
        testId="attendance-weekday-panel"
      >
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weekly} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="hsl(var(--hairline))" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[70, 100]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="rate" name="Attendance %" fill="hsl(var(--chart-3))" radius={[3, 3, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel
        className="lg:col-span-7"
        eyebrow="Cohorts"
        title="Rate by grade"
        description="Average of every active student in the grade"
        testId="attendance-grade-panel"
      >
        <ul className="space-y-2.5">
          {stats.byGrade.map((row) => (
            <li key={row.grade} className="flex items-center gap-3" data-testid={`attendance-grade-${row.grade.replace(/\s+/g, "-").toLowerCase()}`}>
              <span className="w-20 shrink-0 text-sm text-foreground">{row.grade}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <span
                  className={cn("block h-full rounded-full", rateBar(row.rate))}
                  style={{ width: `${row.rate}%` }}
                />
              </span>
              <span className={cn("num w-12 shrink-0 text-right text-sm font-semibold", rateTone(row.rate))}>
                {row.rate}%
              </span>
              <span className="num w-20 shrink-0 text-right text-xs text-muted-foreground">
                {row.students} students
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        className="lg:col-span-5"
        eyebrow="Watchlist"
        title="Chronic absence"
        description="Students under 82% for the term"
        testId="attendance-watchlist-panel"
        bodyClassName="p-2"
      >
        {stats.chronic.length === 0 ? (
          <EmptyState
            compact
            icon={AlertOctagon}
            title="No students at risk"
            description="Every active student is above the 82% intervention threshold."
            testId="attendance-watchlist-empty"
          />
        ) : (
          <ul className="divide-y divide-hairline">
            {stats.chronic.map((row) => (
              <li key={row.student.id} className="flex items-center gap-3 px-2 py-2">
                <div className="min-w-0 flex-1">
                  <PersonCell
                    name={`${row.student.firstName} ${row.student.lastName}`}
                    subtitle={`${row.student.grade} · ${row.student.section}`}
                    avatarUrl={row.student.avatarUrl}
                    to={`/students/${row.student.id}`}
                    size="sm"
                    testId={`attendance-watchlist-${row.student.id}`}
                  />
                </div>
                <span className={cn("num shrink-0 text-sm font-semibold", rateTone(row.rate))}>{row.rate}%</span>
              </li>
            ))}
          </ul>
        )}
        <div className="px-2 pt-2">
          <Link
            to="/students?status=active"
            className="text-xs text-primary underline-offset-2 hover:underline"
            data-testid="attendance-watchlist-all"
          >
            Open the student register
          </Link>
        </div>
      </Panel>
    </div>
  );
}
