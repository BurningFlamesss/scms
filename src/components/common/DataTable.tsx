import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Checkbox } from "#/components/ui/checkbox";
import { Button } from "#/components/ui/button";
import { TableSkeleton } from "#/components/common/Skeletons";
import { ErrorState } from "#/components/common/ErrorState";
import { cn } from "#/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  headClassName?: string;
  cellClassName?: string;
  render: (row: T) => React.ReactNode;
}

export interface SortState {
  key: string;
  dir: "asc" | "desc";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowId: (row: T) => string;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  empty?: React.ReactNode;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  bulkActions?: React.ReactNode;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  testId: string;
  rowTestId?: (row: T) => string;
  footNote?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowId,
  loading = false,
  error,
  onRetry,
  empty,
  onRowClick,
  selectable = false,
  selected = [],
  onSelectedChange,
  bulkActions,
  sort,
  onSortChange,
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  testId,
  rowTestId,
  footNote,
}: DataTableProps<T>) {
  const allSelected = rows.length > 0 && rows.every((row) => selected.includes(rowId(row)));
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const toggleAll = () => {
    if (!onSelectedChange) return;
    onSelectedChange(allSelected ? [] : rows.map(rowId));
  };

  const toggleOne = (id: string) => {
    if (!onSelectedChange) return;
    onSelectedChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const changeSort = (key: string) => {
    if (!onSortChange) return;
    onSortChange({ key, dir: sort?.key === key && sort.dir === "asc" ? "desc" : "asc" });
  };

  return (
    <div className="panel overflow-hidden" data-testid={testId}>
      {selectable && selected.length > 0 && (
        <div
          className="sticky top-14 z-20 flex flex-wrap items-center gap-3 border-b border-hairline bg-primary/[0.06] px-4 py-2.5"
          data-testid={`${testId}-bulk-bar`}
        >
          <span className="num text-xs font-medium text-foreground">
            {selected.length} selected
          </span>
          <button
            type="button"
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            data-testid={`${testId}-clear-selection`}
            onClick={() => onSelectedChange?.([])}
          >
            Clear
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">{bulkActions}</div>
        </div>
      )}

      {error ? (
        <ErrorState onRetry={onRetry} />
      ) : loading ? (
        <TableSkeleton rows={Math.min(pageSize, 6)} columns={columns.length} />
      ) : rows.length === 0 ? (
        <>{empty}</>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="bg-surface-2">
              <tr className="border-b border-hairline">
                {selectable && (
                  <th className="w-9 px-4 py-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all rows"
                      data-testid={`${testId}-select-all`}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "whitespace-nowrap px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center",
                      column.headClassName,
                    )}
                  >
                    {column.sortable && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => changeSort(column.key)}
                        data-testid={`${testId}-sort-${column.key}`}
                        className="inline-flex items-center gap-1 transition-colors hover:text-foreground focus-ring"
                      >
                        {column.header}
                        {sort?.key === column.key ? (
                          sort.dir === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUp className="h-3 w-3 opacity-25" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {rows.map((row) => {
                const id = rowId(row);
                const isSelected = selected.includes(id);
                return (
                  <tr
                    key={id}
                    data-testid={rowTestId ? rowTestId(row) : `${testId}-row-${id}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "group transition-colors duration-150",
                      onRowClick && "cursor-pointer",
                      isSelected ? "bg-primary/[0.05]" : "hover:bg-surface-2",
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(id)}
                          aria-label="Select row"
                          data-testid={`${testId}-select-${id}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-4 py-2.5 align-middle",
                          column.align === "right" && "text-right",
                          column.align === "center" && "text-center",
                          column.cellClassName,
                        )}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(total > 0 || footNote) && !loading && !error && rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-4 py-2.5">
          <p className="num text-xs text-muted-foreground" data-testid={`${testId}-summary`}>
            {footNote ?? (
              <>
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
              </>
            )}
          </p>
          {onPageChange && pageCount > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                disabled={page <= 1}
                data-testid={`${testId}-prev-page`}
                onClick={() => onPageChange(page - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </Button>
              <span className="num px-2 text-xs text-muted-foreground" data-testid={`${testId}-page-indicator`}>
                {page} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                disabled={page >= pageCount}
                data-testid={`${testId}-next-page`}
                onClick={() => onPageChange(page + 1)}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
