import type { EventCategory, EventStatus } from "#/types";
import { cn } from "#/lib/utils";

export const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "exam", label: "Examination" },
  { value: "sports", label: "Sports" },
  { value: "cultural", label: "Cultural" },
  { value: "trip", label: "Trip" },
  { value: "competition", label: "Competition" },
  { value: "meeting", label: "Meeting" },
  { value: "holiday", label: "Holiday" },
  { value: "program", label: "Programme" },
];

export const EVENT_STATUSES: { value: EventStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const CATEGORY_LABEL: Record<EventCategory, string> = EVENT_CATEGORIES.reduce(
  (acc, item) => ({ ...acc, [item.value]: item.label }),
  {} as Record<EventCategory, string>,
);

/** Chip styling per category — small colour areas only, per the design system. */
const CATEGORY_CLASS: Record<EventCategory, string> = {
  exam: "bg-info/12 text-info",
  sports: "bg-success/12 text-success",
  cultural: "bg-accent/14 text-accent",
  trip: "bg-primary/12 text-primary",
  competition: "bg-warning/18 text-warning",
  meeting: "bg-muted text-muted-foreground",
  holiday: "bg-accent/14 text-accent",
  program: "bg-primary/12 text-primary",
};

const CATEGORY_DOT: Record<EventCategory, string> = {
  exam: "bg-info",
  sports: "bg-success",
  cultural: "bg-accent",
  trip: "bg-primary",
  competition: "bg-warning",
  meeting: "bg-muted-foreground",
  holiday: "bg-accent",
  program: "bg-primary",
};

export function categoryDotClass(category: EventCategory): string {
  return CATEGORY_DOT[category];
}

export function CategoryChip({
  category,
  className,
  testId,
}: {
  category: EventCategory;
  className?: string;
  testId?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        CATEGORY_CLASS[category],
        className,
      )}
      data-testid={testId}
      data-category={category}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", CATEGORY_DOT[category])} />
      {CATEGORY_LABEL[category]}
    </span>
  );
}
