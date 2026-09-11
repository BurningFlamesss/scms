import { Link } from "@tanstack/react-router";
import { cn } from "#/lib/utils";

interface PersonCellProps {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  to?: string;
  size?: "sm" | "md" | "lg";
  mono?: boolean;
  testId?: string;
}

const SIZES = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
  lg: "h-11 w-11",
};

export function PersonCell({
  name,
  subtitle,
  avatarUrl,
  to,
  size = "md",
  mono = false,
  testId,
}: PersonCellProps) {
  const content = (
    <span className="flex min-w-0 items-center gap-2.5">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className={cn("shrink-0 rounded-full border border-hairline object-cover", SIZES[size])}
          loading="lazy"
        />
      ) : (
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-full border border-hairline bg-surface-2 text-[11px] font-semibold text-muted-foreground",
            SIZES[size],
          )}
        >
          {name
            .split(" ")
            .slice(0, 2)
            .map((p) => p[0])
            .join("")}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-foreground">{name}</span>
        {subtitle && (
          <span className={cn("block truncate text-xs text-muted-foreground", mono && "font-mono text-[11px]")}>
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="inline-flex min-w-0 max-w-full rounded transition-colors hover:text-primary focus-ring"
        data-testid={testId}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </Link>
    );
  }
  return (
    <span className="inline-flex min-w-0 max-w-full" data-testid={testId}>
      {content}
    </span>
  );
}
