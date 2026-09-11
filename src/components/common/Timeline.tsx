import { dayLabel, relativeTime } from "#/lib/format";
import { cn } from "#/lib/utils";

export interface TimelineItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actor?: string;
  actorAvatar?: string;
  at: string;
  tone?: "neutral" | "positive" | "negative" | "accent";
  chip?: string;
}

const TONE_DOT = {
  neutral: "bg-muted-foreground/50",
  positive: "bg-success",
  negative: "bg-destructive",
  accent: "bg-accent",
};

interface TimelineProps {
  items: TimelineItem[];
  groupByDay?: boolean;
  testId?: string;
}

export function Timeline({ items, groupByDay = false, testId = "timeline" }: TimelineProps) {
  if (!groupByDay) {
    return (
      <ol className="relative space-y-4 pl-6 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-hairline" data-testid={testId}>
        {items.map((item) => (
          <TimelineRow key={item.id} item={item} />
        ))}
      </ol>
    );
  }

  const groups = items.reduce<Record<string, TimelineItem[]>>((acc, item) => {
    const key = item.at.slice(0, 10);
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});

  return (
    <div data-testid={testId}>
      {Object.entries(groups).map(([day, group]) => (
        <div key={day} className="mb-5 last:mb-0">
          <p className="eyebrow-label mb-2.5">{dayLabel(day)}</p>
          <ol className="relative space-y-4 pl-6 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-hairline">
            {group.map((item) => (
              <TimelineRow key={item.id} item={item} />
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

function TimelineRow({ item }: { item: TimelineItem }) {
  return (
    <li className="relative" data-testid="timeline-item">
      <span
        className={cn(
          "absolute -left-6 top-1.5 h-[7px] w-[7px] rounded-full ring-4 ring-surface-1",
          TONE_DOT[item.tone ?? "neutral"],
        )}
      />
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-sm leading-snug text-foreground">{item.title}</p>
        {item.chip && (
          <span className="rounded border border-hairline bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            {item.chip}
          </span>
        )}
      </div>
      {item.description && (
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
      )}
      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {item.actorAvatar && (
          <img src={item.actorAvatar} alt="" className="h-4 w-4 rounded-full border border-hairline" />
        )}
        {item.actor && <span>{item.actor}</span>}
        {item.actor && <span aria-hidden>·</span>}
        <time dateTime={item.at}>{relativeTime(item.at)}</time>
      </div>
    </li>
  );
}
