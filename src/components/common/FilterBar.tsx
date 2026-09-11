import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";

export interface FilterDef {
  key: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  width?: string;
}

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: FilterDef[];
  onReset?: () => void;
  actions?: React.ReactNode;
  testId?: string;
}

export function FilterBar({
  search,
  onSearchChange,
  placeholder = "Search…",
  filters = [],
  onReset,
  actions,
  testId = "filter-bar",
}: FilterBarProps) {
  const dirty = Boolean(search) || filters.some((f) => f.value !== "all");

  return (
    <div
      className="mb-4 flex flex-col gap-2.5 rounded-xl border border-hairline bg-surface-1 p-2.5 sm:flex-row sm:items-center"
      data-testid={testId}
    >
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          placeholder={placeholder}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          className="h-9 border-hairline bg-surface-1 pl-8 text-sm"
          data-testid={`${testId}-search`}
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            data-testid={`${testId}-clear-search`}
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.length > 0 && (
          <SlidersHorizontal className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
        )}
        {filters.map((filter) => (
          <Select key={filter.key} value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger
              className={`h-9 border-hairline bg-surface-1 text-xs ${filter.width ?? "w-[140px]"}`}
              data-testid={`${testId}-${filter.key}`}
            >
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {filter.options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-xs"
                  data-testid={`${testId}-${filter.key}-${option.value}`}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {dirty && onReset && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs text-muted-foreground"
            onClick={onReset}
            data-testid={`${testId}-reset`}
          >
            Reset
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}

export const ALL_OPTION = { value: "all", label: "All" };

export function toOptions(values: string[], allLabel = "All"): { value: string; label: string }[] {
  return [{ value: "all", label: allLabel }, ...values.map((v) => ({ value: v, label: v }))];
}
