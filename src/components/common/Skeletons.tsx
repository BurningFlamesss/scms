import { Skeleton } from "#/components/ui/skeleton";

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y divide-hairline" data-testid="table-skeleton">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <Skeleton className="h-3.5 w-[22%]" />
          {Array.from({ length: Math.max(0, columns - 2) }).map((__, c) => (
            <Skeleton key={c} className="h-3 w-[12%]" />
          ))}
          <Skeleton className="ml-auto h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

export function PanelSkeleton({ height = "h-52" }: { height?: string }) {
  return (
    <div className="panel p-4" data-testid="panel-skeleton">
      <Skeleton className="mb-3 h-3.5 w-32" />
      <Skeleton className={`w-full ${height}`} />
    </div>
  );
}

export function MetricsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8" data-testid="metrics-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="panel p-3">
          <Skeleton className="mb-2 h-2.5 w-16" />
          <Skeleton className="mb-2 h-5 w-12" />
          <Skeleton className="h-6 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" data-testid="list-skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-5" data-testid="detail-skeleton">
      <div className="panel flex items-center gap-4 p-5">
        <Skeleton className="h-16 w-16 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <PanelSkeleton height="h-40" />
          <PanelSkeleton height="h-32" />
        </div>
        <PanelSkeleton height="h-64" />
      </div>
    </div>
  );
}
