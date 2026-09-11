import type { Department } from "#types";

const HUE: Record<Department, number> = {
  Administration: 34,
  Science: 168,
  Management: 38,
  English: 210,
  Mathematics: 222,
  Nepali: 12,
  "Social Studies": 48,
  "Computer Science": 196,
  "Physical Education": 140,
};

const SIZE = {
  lg: "h-16 w-16 text-lg",
  md: "h-10 w-10 text-sm",
  sm: "h-8 w-8 text-xs",
} as const;

const initialsOf = (name: string): string => {
  const cleaned = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

/**
 * Department-toned monogram. Deliberately no stock photography:
 * initials on a tinted disc, tuned per department hue.
 */
export const MonogramAvatar = ({
  name,
  department,
  size = "md",
  className = "",
  testId = "faculty-avatar",
}: {
  name: string;
  department: Department;
  size?: keyof typeof SIZE;
  className?: string;
  testId?: string;
}) => {
  const hue = HUE[department] ?? 34;

  return (
    <span
      data-testid={testId}
      aria-hidden="true"
      style={{ "--tone": String(hue) } as React.CSSProperties}
      className={[
        "inline-flex shrink-0 select-none items-center justify-center rounded-full border border-border font-semibold tracking-[-0.02em] shadow-xs",
        "bg-[hsl(var(--tone)_32%_92%)] text-[hsl(var(--tone)_42%_24%)]",
        "dark:bg-[hsl(var(--tone)_24%_20%)] dark:text-[hsl(var(--tone)_38%_78%)]",
        SIZE[size],
        className,
      ].join(" ")}
    >
      <span data-testid={`${testId}-initials`}>{initialsOf(name)}</span>
    </span>
  );
};
