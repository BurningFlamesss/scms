import { useEffect, useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { getAttendanceOverview } from "#/services/academics";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { DateField } from "#/components/common/DateField";
import { DailyRegister } from "#/components/attendance/DailyRegister";
import { StaffRegister } from "#/components/attendance/StaffRegister";
import { AttendanceStats } from "#/components/attendance/AttendanceStats";
import { ATTENDANCE_STATES, rateTone } from "#/components/attendance/attendance-constants";
import { Button } from "#/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { downloadTextFile, formatDate, toCsv, todayKey } from "#/lib/format";
import { cn } from "#/lib/utils";

type View = "daily" | "staff" | "stats";

const VIEWS: { value: View; label: string }[] = [
  { value: "daily", label: "Daily register" },
  { value: "staff", label: "Staff attendance" },
  { value: "stats", label: "Statistics" },
];

export default function AttendancePage() {
  const { can } = useAuth();
  const navigate = useNavigate();
  const searchParams = (useSearch({ strict: false }) as Record<string, string | undefined>) || {};

  const view = (searchParams.view as View) ?? "daily";
  const date = searchParams.date ?? todayKey();
  const classId = searchParams.class ?? "";
  const canMark = can("attendance.mark");

  const setParam = (key: string, value: string) => {
    navigate({
      search: (prev: Record<string, any>) => ({ ...prev, [key]: value }),
      replace: true,
    });
  };

  const { data: overview } = useQuery({
    queryKey: ["attendance-overview", date],
    queryFn: () => getAttendanceOverview(date),
  });

  // Land on the first register that still needs attention.
  useEffect(() => {
    if (classId || !overview?.classes.length) return;
    const target = overview.classes.find((row) => !row.marked) ?? overview.classes[0];
    setParam("class", target.cls.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, overview]);

  const metrics = useMemo(() => {
    if (!overview) return [];
    return [
      { key: "rate", label: "Attendance rate", value: `${overview.rate}%`, tone: rateTone(overview.rate) },
      { key: "roster", label: "Active students", value: String(overview.total) },
      ...ATTENDANCE_STATES.map((meta) => ({
        key: meta.value,
        label: meta.label,
        value: String(overview[meta.value]),
        tone: meta.text,
      })),
      { key: "unmarked", label: "Unmarked", value: String(overview.unmarked) },
      {
        key: "registers",
        label: "Registers open",
        value: String(overview.classes.filter((row) => !row.marked).length),
      },
    ];
  }, [overview]);

  const exportSummary = () => {
    if (!overview) return;
    const csv = toCsv(
      overview.classes.map((row) => ({
        date: overview.date,
        class: row.cls.name,
        room: row.cls.roomNo,
        students: row.total,
        submitted: row.marked ? "yes" : "no",
        present: row.present,
        absent: row.absent,
        late: row.late,
        excused: row.excused,
        rate: row.rate,
      })),
    );
    downloadTextFile(`northfield-attendance-${overview.date}.csv`, csv);
    toast.success("Attendance summary exported");
  };

  return (
    <div data-testid="attendance-page">
      <PageHeader
        eyebrow="Operations"
        title="Attendance"
        description="Run the daily register class by class, mark staff, and watch the cohorts that need intervention."
        meta={
          <>
            <span data-testid="attendance-date-label">{formatDate(date)}</span>
            {overview && (
              <span data-testid="attendance-marked-summary">
                {overview.classes.filter((row) => row.marked).length}/{overview.classes.length} registers submitted
              </span>
            )}
            {!canMark && <span>Read-only for your role</span>}
          </>
        }
        actions={
          <>
            <DateField value={date} onChange={(next) => setParam("date", next)} maxToday stepper testId="attendance-date" />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              data-testid="attendance-export"
              onClick={exportSummary}
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8" data-testid="attendance-metrics">
        {metrics.map((metric) => (
          <div
            key={metric.key}
            className="rounded-lg border border-hairline bg-surface-1 px-3 py-2.5"
            data-testid={`attendance-metric-${metric.key}`}
          >
            <p className="truncate text-[11px] font-medium text-muted-foreground">{metric.label}</p>
            <p className={cn("num mt-1 font-display text-lg font-semibold leading-none", metric.tone ?? "text-foreground")}>
              {metric.value}
            </p>
          </div>
        ))}
        {metrics.length === 0 &&
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-[62px] animate-pulse rounded-lg border border-hairline bg-surface-2" />
          ))}
      </div>

      <Tabs value={view} onValueChange={(value: string) => setParam("view", value)} className="mb-5">
        <TabsList data-testid="attendance-view-tabs">
          {VIEWS.map((item) => (
            <TabsTrigger key={item.value} value={item.value} data-testid={`attendance-view-${item.value}`}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {view === "daily" && (
        <DailyRegister
          date={date}
          classId={classId}
          canMark={canMark}
          onClassChange={(next) => setParam("class", next)}
        />
      )}
      {view === "staff" && <StaffRegister date={date} canMark={canMark} />}
      {view === "stats" && <AttendanceStats />}
    </div>
  );
}
