import { cn } from "#/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "accent" | "primary";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-warning/18 text-warning",
  danger: "bg-destructive/12 text-destructive",
  info: "bg-info/12 text-info",
  accent: "bg-accent/14 text-accent",
  primary: "bg-primary/12 text-primary",
};

const DOT_CLASS: Record<Tone, string> = {
  neutral: "bg-muted-foreground",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
  accent: "bg-accent",
  primary: "bg-primary",
};

/** Single source of truth for every status word used across the product. */
const STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  // people
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "neutral" },
  graduated: { label: "Graduated", tone: "info" },
  transferred: { label: "Transferred", tone: "warning" },
  suspended: { label: "Suspended", tone: "danger" },
  probation: { label: "Probation", tone: "warning" },
  on_leave: { label: "On leave", tone: "info" },
  retired: { label: "Retired", tone: "neutral" },
  terminated: { label: "Terminated", tone: "danger" },
  // accounts
  invited: { label: "Invited", tone: "accent" },
  deactivated: { label: "Deactivated", tone: "neutral" },
  pending: { label: "Pending", tone: "accent" },
  activated: { label: "Activated", tone: "success" },
  expired: { label: "Expired", tone: "danger" },
  revoked: { label: "Revoked", tone: "danger" },
  none: { label: "—", tone: "neutral" },
  // content
  draft: { label: "Draft", tone: "neutral" },
  scheduled: { label: "Scheduled", tone: "info" },
  published: { label: "Published", tone: "success" },
  archived: { label: "Archived", tone: "neutral" },
  ongoing: { label: "Ongoing", tone: "accent" },
  completed: { label: "Completed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
  // priority
  low: { label: "Low", tone: "neutral" },
  normal: { label: "Normal", tone: "primary" },
  high: { label: "High", tone: "accent" },
  urgent: { label: "Urgent", tone: "danger" },
  // attendance
  present: { label: "Present", tone: "success" },
  absent: { label: "Absent", tone: "danger" },
  late: { label: "Late", tone: "accent" },
  excused: { label: "Excused", tone: "info" },
  // admissions
  accepted: { label: "Accepted", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  waitlisted: { label: "Waitlisted", tone: "accent" },
  converted: { label: "Enrolled", tone: "primary" },
  // finance
  paid: { label: "Paid", tone: "success" },
  partial: { label: "Partial", tone: "accent" },
  unpaid: { label: "Unpaid", tone: "warning" },
  overdue: { label: "Overdue", tone: "danger" },
  void: { label: "Void", tone: "neutral" },
  succeeded: { label: "Succeeded", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  refunded: { label: "Refunded", tone: "info" },
  // operations
  maintenance: { label: "Maintenance", tone: "warning" },
  public: { label: "Public", tone: "success" },
  internal: { label: "Internal", tone: "info" },
  private: { label: "Private", tone: "neutral" },
  planning: { label: "Planning", tone: "info" },
  closed: { label: "Closed", tone: "neutral" },
};

interface StatusBadgeProps {
  value: string;
  label?: string;
  dot?: boolean;
  className?: string;
  testId?: string;
}

export function StatusBadge({ value, label, dot = true, className, testId }: StatusBadgeProps) {
  const entry = STATUS_MAP[value] ?? { label: label ?? value, tone: "neutral" as Tone };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        TONE_CLASS[entry.tone],
        className,
      )}
      data-testid={testId}
      data-status={value}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASS[entry.tone])} />}
      {label ?? entry.label}
    </span>
  );
}

export function CountPill({
  value,
  tone = "neutral",
  className,
}: {
  value: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={cn("num rounded-full px-1.5 py-0.5 text-[11px] font-semibold", TONE_CLASS[tone], className)}>
      {value}
    </span>
  );
}
