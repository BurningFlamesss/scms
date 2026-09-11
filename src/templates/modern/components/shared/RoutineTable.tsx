import { CalendarClock, CircleDot } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { routineDoc } from "#lib/documents";
import { minutesOfDay, nowMinutes, todaySchoolWeekday } from "#lib/dates";
import { downloadOfficialPdf } from "#lib/pdf";
import type { Routine } from "#types";
import { Button } from "../kit";
import { DownloadButton } from "./DownloadButton";

/**
 * Printed-timetable aesthetic: hairline rules, tabular monospaced times,
 * sticky day column, today's row tinted, and a live current-period marker.
 */
export const RoutineTable = ({ routine }: { routine: Routine }) => {
  const today = todaySchoolWeekday();
  const [clock, setClock] = useState<number>(() => nowMinutes());
  const [focusToday, setFocusToday] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setClock(nowMinutes()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const activeIndex = useMemo(
    () =>
      routine.periods.findIndex(
        (p) =>
          clock >= minutesOfDay(p.start) && clock < minutesOfDay(p.end),
      ),
    [routine.periods, clock],
  );

  const activePeriod = activeIndex >= 0 ? routine.periods[activeIndex] : null;
  const activeSubject =
    today && activeIndex >= 0
      ? routine.rows.find((r) => r.day === today)?.slots[activeIndex]
      : null;

  return (
    <section data-testid="routine-panel" className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <dl className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <dt className="t-eyebrow">Shift</dt>
            <dd className="mt-1 text-sm text-foreground">{routine.shift}</dd>
          </div>
          <div>
            <dt className="t-eyebrow">Rooms</dt>
            <dd className="mt-1 text-sm text-foreground">{routine.room}</dd>
          </div>
          <div>
            <dt className="t-eyebrow">Effective from</dt>
            <dd className="mt-1 font-mono text-sm tabular-nums text-foreground">
              {routine.effectiveFrom}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-2">
          {today ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setFocusToday((v) => !v)}
              data-testid="routine-jump-today-button"
              className="h-9 gap-2 rounded-field px-3 text-[13px] text-muted-foreground transition-colors duration-fast hover:bg-secondary hover:text-foreground"
            >
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              {focusToday ? "Show full week" : `Show only ${today}`}
            </Button>
          ) : null}
          <DownloadButton
            label="Routine PDF"
            size="sm"
            testId="routine-download-pdf-button"
            onDownload={() => downloadOfficialPdf(routineDoc(routine))}
          />
        </div>
      </div>

      {activePeriod && activeSubject ? (
        <p
          data-testid="routine-now-indicator"
          className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5"
        >
          <CircleDot className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
            Right now
          </span>
          <span className="text-[13px] text-foreground">
            Period {activePeriod.label} · {activeSubject}
          </span>
          <span className="t-meta">
            {activePeriod.start}–{activePeriod.end}
          </span>
        </p>
      ) : (
        <p data-testid="routine-now-indicator" className="t-meta mt-5">
          {today
            ? "No period is running at this moment."
            : "Saturday is the weekly holiday — no classes today."}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-card border border-border bg-card">
        <div className="rail-scroll overflow-x-auto">
          <table
            data-testid="routine-table"
            className="w-full min-w-[760px] border-collapse text-left"
          >
            <caption className="sr-only">
              {routine.label} weekly class routine
            </caption>
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th
                  scope="col"
                  className="sticky left-0 z-[1] w-[112px] bg-secondary px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Day
                </th>
                {routine.periods.map((period, index) => (
                  <th
                    key={`${period.label}-${period.start}`}
                    scope="col"
                    className={[
                      "border-l border-border px-3 py-3 align-top",
                      index === activeIndex ? "bg-accent/10" : "",
                    ].join(" ")}
                  >
                    <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {period.label}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] tabular-nums text-muted-foreground">
                      {period.start}–{period.end}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routine.rows
                .filter((row) => !focusToday || row.day === today)
                .map((row, rowIndex) => {
                  const isToday = row.day === today;
                  return (
                    <tr
                      key={row.day}
                      data-testid={`routine-row-${row.day.toLowerCase()}`}
                      data-today={isToday}
                      className={[
                        "border-b border-rule-soft last:border-b-0",
                        isToday
                          ? "bg-accent/[0.07]"
                          : rowIndex % 2 === 1
                            ? "bg-secondary/40"
                            : "",
                      ].join(" ")}
                    >
                      <th
                        scope="row"
                        className={[
                          "sticky left-0 z-[1] px-4 py-3 text-left align-top",
                          isToday
                            ? "bg-[hsl(var(--accent)/0.1)]"
                            : rowIndex % 2 === 1
                              ? "bg-[hsl(var(--secondary))]"
                              : "bg-card",
                        ].join(" ")}
                      >
                        <span className="block text-[13px] font-medium text-foreground">
                          {row.day}
                        </span>
                        {isToday ? (
                          <span className="mt-1 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                            Today
                          </span>
                        ) : null}
                      </th>
                      {row.slots.map((slot, slotIndex) => {
                        const period = routine.periods[slotIndex];
                        const isBreak = period?.isBreak;
                        const isNow = isToday && slotIndex === activeIndex;
                        return (
                          <td
                            key={`${row.day}-${slotIndex}`}
                            className={[
                              "border-l border-rule-soft px-3 py-3 align-top text-[13px]",
                              isBreak
                                ? "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                                : "text-foreground",
                              isNow ? "bg-accent/[0.14] font-medium" : "",
                            ].join(" ")}
                          >
                            {slot}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="t-meta mt-3">
        Saturday is the weekly holiday. Practical and studio periods run in the
        final slot without interruption.
      </p>
    </section>
  );
};
