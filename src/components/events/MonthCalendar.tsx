import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "#/components/ui/button";
import { categoryDotClass } from "#/components/events/event-constants";
import { toDateKey, todayKey } from "#/lib/format";
import { cn } from "#/lib/utils";
import type { SchoolEvent } from "#/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface MonthCalendarProps {
  month: Date;
  onMonthChange: (next: Date) => void;
  events: SchoolEvent[];
  selectedDate: string;
  onSelectDate: (key: string) => void;
}

interface Cell {
  key: string;
  day: number;
  inMonth: boolean;
}

/**
 * Density-first month grid: each day shows up to two event slivers plus an
 * overflow count. Colour is limited to a small category dot per the guidelines.
 */
export function MonthCalendar({ month, onMonthChange, events, selectedDate, onSelectDate }: MonthCalendarProps) {
  const cells = useMemo<Cell[]>(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const first = new Date(year, monthIndex, 1);
    const startOffset = (first.getDay() + 6) % 7; // Monday-first grid
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const total = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    return Array.from({ length: total }, (_, index) => {
      const date = new Date(year, monthIndex, index - startOffset + 1);
      return {
        key: toDateKey(date),
        day: date.getDate(),
        inMonth: date.getMonth() === monthIndex,
      };
    });
  }, [month]);

  const byDay = useMemo(() => {
    const map = new Map<string, SchoolEvent[]>();
    cells.forEach((cell) => {
      const matches = events.filter((event) => event.startDate <= cell.key && event.endDate >= cell.key);
      if (matches.length) map.set(cell.key, matches);
    });
    return map;
  }, [cells, events]);

  const monthLabel = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const today = todayKey();

  return (
    <div className="panel overflow-hidden" data-testid="events-calendar">
      <header className="panel-header">
        <div className="min-w-0">
          <p className="eyebrow-label mb-0.5">Month</p>
          <h2 className="panel-title truncate" data-testid="events-calendar-month">
            {monthLabel}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            aria-label="Previous month"
            data-testid="events-calendar-prev"
            onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            data-testid="events-calendar-today"
            onClick={() => {
              const now = new Date();
              onMonthChange(new Date(now.getFullYear(), now.getMonth(), 1));
              onSelectDate(toDateKey(now));
            }}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            aria-label="Next month"
            data-testid="events-calendar-next"
            onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-7 border-b border-hairline bg-surface-2">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          const dayEvents = byDay.get(cell.key) ?? [];
          const isSelected = cell.key === selectedDate;
          const isToday = cell.key === today;
          return (
            <button
              key={cell.key}
              type="button"
              data-testid={`events-calendar-day-${cell.key}`}
              onClick={() => onSelectDate(cell.key)}
              className={cn(
                "min-h-[92px] border-b border-r border-hairline p-1.5 text-left align-top transition-colors duration-150 focus-ring",
                cell.inMonth ? "bg-surface-1" : "bg-surface-2/60",
                isSelected ? "bg-primary/[0.07]" : "hover:bg-surface-2",
              )}
            >
              <span className="mb-1 flex items-center justify-between">
                <span
                  className={cn(
                    "num grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold",
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : cell.inMonth
                        ? "text-foreground"
                        : "text-muted-foreground/60",
                  )}
                >
                  {cell.day}
                </span>
                {dayEvents.length > 0 && (
                  <span className="num text-[10px] text-muted-foreground">{dayEvents.length}</span>
                )}
              </span>
              <span className="block space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <span
                    key={event.id}
                    className="flex items-center gap-1 rounded border border-hairline bg-surface-2 px-1 py-0.5"
                  >
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", categoryDotClass(event.category))} />
                    <span className="min-w-0 truncate text-[10px] leading-4 text-foreground">{event.title}</span>
                  </span>
                ))}
                {dayEvents.length > 2 && (
                  <span className="num block px-1 text-[10px] text-muted-foreground">
                    +{dayEvents.length - 2} more
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
