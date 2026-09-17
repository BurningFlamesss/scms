export interface ChipOption {
  value: string;
  label: string;
  count?: number;
}

/** Outline chips used for every filter surface on the site. */
export const FilterChips = ({
  options,
  value,
  onChange,
  testId,
  label,
}: {
  options: ChipOption[];
  value: string;
  onChange: (next: string) => void;
  testId: string;
  label: string;
}) => (
  <div
    role="group"
    aria-label={label}
    data-testid={testId}
    className="flex flex-wrap gap-2"
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={active}
          data-testid={`${testId}-${option.value}`}
          data-active={active}
          className={[
            "group inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-fast",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            active
              ? "border-accent/40 bg-accent/12 font-medium text-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
          ].join(" ")}
        >
          {option.label}
          {typeof option.count === "number" ? (
            <span className="inline-flex items-center justify-center rounded-full bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-accent group-data-[active=true]:bg-background group-data-[active=true]:text-foreground">
              {option.count}
            </span>
          ) : null}
        </button>
      );
    })}
  </div>
);
