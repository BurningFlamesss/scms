import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Calendar } from "#/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";
import { addDays, formatDate, parseKey, toDateKey, todayKey } from "#/lib/format";
import { cn } from "#/lib/utils";

interface DateFieldProps {
  /** yyyy-mm-dd */
  value: string;
  onChange: (value: string) => void;
  /** Block future dates (registers can't be marked ahead of time). */
  maxToday?: boolean;
  /** Show prev/next day stepper buttons around the trigger. */
  stepper?: boolean;
  className?: string;
  testId: string;
}

export function DateField({
  value,
  onChange,
  maxToday = false,
  stepper = false,
  className,
  testId,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const today = todayKey();
  const selected = value ? parseKey(value) : undefined;
  const nextDisabled = maxToday && value >= today;

  const step = (delta: number) => {
    const next = toDateKey(addDays(parseKey(value), delta));
    if (maxToday && next > today) return;
    onChange(next);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stepper && (
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          aria-label="Previous day"
          data-testid={`${testId}-prev`}
          onClick={() => step(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 min-w-[150px] justify-start gap-2 text-sm font-normal"
            data-testid={testId}
          >
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="num">{value === today ? `Today · ${formatDate(value)}` : formatDate(value)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto border-hairline bg-popover p-0" data-testid={`${testId}-popover`}>
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            disabled={maxToday ? { after: new Date() } : undefined}
            onSelect={(date?: Date) => {
              if (!date) return;
              onChange(toDateKey(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {stepper && (
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          aria-label="Next day"
          disabled={nextDisabled}
          data-testid={`${testId}-next`}
          onClick={() => step(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
