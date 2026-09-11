import { Search, X } from "lucide-react";
import { Input } from "../kit";

export const SearchField = ({
  value,
  onChange,
  placeholder,
  testId,
  label,
  className = "",
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  testId: string;
  label: string;
  className?: string;
}) => (
  <div className={`relative ${className}`}>
    <label className="sr-only" htmlFor={testId}>
      {label}
    </label>
    <Search
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      aria-hidden="true"
    />
    <Input
      id={testId}
      type="search"
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        onChange(event.target.value)
      }
      placeholder={placeholder}
      data-testid={testId}
      className="h-11 rounded-field border-input bg-background pl-10 pr-10 text-sm transition-colors duration-fast placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden"
    />
    {value ? (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        data-testid={`${testId}-clear`}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors duration-fast hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    ) : null}
  </div>
);
