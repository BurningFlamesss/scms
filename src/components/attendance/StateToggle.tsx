import type { AttendanceState } from "#/types";
import { ATTENDANCE_STATES } from "#/components/attendance/attendance-constants";
import { cn } from "#/lib/utils";

interface StateToggleProps {
  value: AttendanceState | null;
  onChange: (state: AttendanceState) => void;
  disabled?: boolean;
  compact?: boolean;
  testIdPrefix: string;
}

/**
 * Four-state segmented marker. One tap per student — the fastest possible way
 * to run a register on a laptop or a tablet.
 */
export function StateToggle({
  value,
  onChange,
  disabled = false,
  compact = false,
  testIdPrefix,
}: StateToggleProps) {
  return (
    <div
      className="inline-flex overflow-hidden rounded-md border border-hairline bg-surface-1"
      role="group"
      aria-label="Attendance state"
      data-testid={`${testIdPrefix}-toggle`}
      data-state={value ?? "unmarked"}
    >
      {ATTENDANCE_STATES.map((meta) => {
        const Icon = meta.icon;
        const active = value === meta.value;
        return (
          <button
            key={meta.value}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            aria-label={meta.label}
            title={meta.label}
            data-testid={`${testIdPrefix}-${meta.value}`}
            onClick={(event) => {
              event.stopPropagation();
              onChange(meta.value);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 border-r border-hairline px-2 text-xs font-medium transition-colors duration-150 last:border-r-0 focus-ring disabled:cursor-not-allowed disabled:opacity-45",
              compact ? "h-7" : "h-8",
              active
                ? meta.active
                : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {!compact && <span className="hidden sm:inline">{meta.label}</span>}
            {compact && <span className="num">{meta.short}</span>}
          </button>
        );
      })}
    </div>
  );
}
