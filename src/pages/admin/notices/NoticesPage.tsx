import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  Eye,
  Megaphone,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteNotice,
  listNotices,
  noticeCounts,
  setNoticeStatus,
  updateNotice,
} from "#/services/communications";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { FilterBar } from "#/components/common/FilterBar";
import { DataTable, type Column } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { StatusBadge } from "#/components/common/StatusBadge";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { Button } from "#/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { formatDate, formatNumber, relativeTime } from "#/lib/format";
import type { Notice, NoticeStatus } from "#/types";

const STATUS_TABS: { value: string; label: string; countKey: keyof ReturnType<typeof noticeCounts> }[] = [
  { value: "all", label: "All", countKey: "all" },
  { value: "published", label: "Published", countKey: "published" },
  { value: "scheduled", label: "Scheduled", countKey: "scheduled" },
  { value: "draft", label: "Drafts", countKey: "draft" },
  { value: "archived", label: "Archived", countKey: "archived" },
];

export default function NoticesPage() {
  const { actor, can } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const searchParams = (useSearch({ strict: false }) as Record<string, string | undefined>) || {};

  const [status, setStatus] = useState(searchParams.status ?? "all");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Notice | null>(null);

  // Sidebar sub-navigation drives the status tab through the query string.
  useEffect(() => {
    const next = searchParams.status ?? "all";
    setStatus(next);
    setPage(1);
  }, [searchParams.status]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notices", { search, status, priority, page }],
    queryFn: () => listNotices({ search, status, priority, page, pageSize: 8 }),
  });

  // Recomputed whenever the notice list refetches so tab counts stay in sync.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const counts = useMemo(() => noticeCounts(), [data]);

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["notices"] });
    void qc.invalidateQueries({ queryKey: ["overview"] });
    void qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: NoticeStatus }) => setNoticeStatus(vars.id, vars.status, actor),
    onSuccess: (notice) => {
      toast.success(
        notice.status === "published"
          ? `“${notice.title}” is now live`
          : `“${notice.title}” moved to ${notice.status}`,
      );
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const pinMutation = useMutation({
    mutationFn: (notice: Notice) => updateNotice(notice.id, { pinned: !notice.pinned }, actor),
    onSuccess: (notice) => {
      toast.success(notice.pinned ? "Pinned to the top of the board" : "Unpinned");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (notice: Notice) => deleteNotice(notice.id, actor),
    onSuccess: () => {
      toast.success("Notice deleted");
      setPendingDelete(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const changeStatusTab = (value: string) => {
    navigate({
      search: (prev: Record<string, any>) => {
        const next = { ...prev };
        if (value === "all") delete next.status;
        else next.status = value;
        return next;
      },
      replace: true,
    });
  };

  const columns: Column<Notice>[] = [
    {
      key: "title",
      header: "Notice",
      render: (notice) => (
        <div className="flex min-w-0 items-start gap-2">
          {notice.pinned && <Pin className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" aria-label="Pinned" />}
          <div className="min-w-0">
            <Link
              to={`/admin/notices/${notice.id}`}
              className="block truncate text-sm font-medium text-foreground transition-colors hover:text-primary focus-ring"
              data-testid={`notice-link-${notice.id}`}
              onClick={(event) => event.stopPropagation()}
            >
              {notice.title}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{notice.summary}</p>
          </div>
        </div>
      ),
    },
    {
      key: "audience",
      header: "Audience",
      render: (notice) => (
        <div className="flex flex-wrap gap-1" data-testid={`notice-audience-${notice.id}`}>
          {notice.audience.slice(0, 2).map((target) => (
            <span
              key={`${target.kind}-${target.value ?? "any"}`}
              className="rounded border border-hairline bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted-foreground"
            >
              {target.label}
            </span>
          ))}
          {notice.audience.length > 2 && (
            <span className="num rounded border border-hairline bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted-foreground">
              +{notice.audience.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (notice) => <StatusBadge value={notice.priority} testId={`notice-priority-${notice.id}`} />,
    },
    {
      key: "status",
      header: "Status",
      render: (notice) => <StatusBadge value={notice.status} testId={`notice-status-${notice.id}`} />,
    },
    {
      key: "publishAt",
      header: "Publish",
      render: (notice) => (
        <div className="min-w-0">
          <p className="num truncate text-xs text-foreground">{formatDate(notice.publishAt)}</p>
          <p className="truncate text-[11px] text-muted-foreground">{relativeTime(notice.publishAt)}</p>
        </div>
      ),
    },
    {
      key: "views",
      header: "Views",
      align: "right",
      render: (notice) => <span className="num text-sm text-muted-foreground">{formatNumber(notice.views)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (notice) => (
        <div className="flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="row-actions h-7 w-7"
            aria-label="Open notice"
            data-testid={`notice-view-${notice.id}`}
            onClick={() => navigate(`/admin/notices/${notice.id}`)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Notice actions"
                data-testid={`notice-menu-${notice.id}`}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover">
              <DropdownMenuItem
                className="gap-2 text-xs"
                data-testid={`notice-action-open-${notice.id}`}
                onClick={() => navigate(`/admin/notices/${notice.id}`)}
              >
                <Eye className="h-3.5 w-3.5" /> Open
              </DropdownMenuItem>
              {can("notices.manage") && (
                <DropdownMenuItem
                  className="gap-2 text-xs"
                  data-testid={`notice-action-edit-${notice.id}`}
                  onClick={() => navigate(`/admin/notices/${notice.id}/edit`)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </DropdownMenuItem>
              )}
              {can("notices.manage") && (
                <DropdownMenuItem
                  className="gap-2 text-xs"
                  data-testid={`notice-action-pin-${notice.id}`}
                  onClick={() => pinMutation.mutate(notice)}
                >
                  {notice.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  {notice.pinned ? "Unpin" : "Pin to top"}
                </DropdownMenuItem>
              )}
              {can("notices.publish") && notice.status !== "published" && (
                <DropdownMenuItem
                  className="gap-2 text-xs"
                  data-testid={`notice-action-publish-${notice.id}`}
                  onClick={() => statusMutation.mutate({ id: notice.id, status: "published" })}
                >
                  <Send className="h-3.5 w-3.5" /> Publish now
                </DropdownMenuItem>
              )}
              {can("notices.publish") && notice.status === "published" && (
                <DropdownMenuItem
                  className="gap-2 text-xs"
                  data-testid={`notice-action-unpublish-${notice.id}`}
                  onClick={() => statusMutation.mutate({ id: notice.id, status: "draft" })}
                >
                  <Undo2 className="h-3.5 w-3.5" /> Revert to draft
                </DropdownMenuItem>
              )}
              {can("notices.manage") && notice.status !== "archived" && (
                <DropdownMenuItem
                  className="gap-2 text-xs"
                  data-testid={`notice-action-archive-${notice.id}`}
                  onClick={() => statusMutation.mutate({ id: notice.id, status: "archived" })}
                >
                  <Archive className="h-3.5 w-3.5" /> Archive
                </DropdownMenuItem>
              )}
              {can("notices.publish") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 text-xs text-destructive"
                    data-testid={`notice-action-delete-${notice.id}`}
                    onClick={() => setPendingDelete(notice)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div data-testid="notices-page">
      <PageHeader
        eyebrow="Communications"
        title="Notices"
        description="Draft, schedule and publish announcements to precisely the right audience."
        meta={
          <>
            <span data-testid="notices-count-published">{counts.published} published</span>
            <span data-testid="notices-count-draft">{counts.draft} drafts</span>
            <span data-testid="notices-count-scheduled">{counts.scheduled} scheduled</span>
          </>
        }
        actions={
          can("notices.manage") ? (
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/admin/notices/new" data-testid="notices-new">
                <Plus className="h-3.5 w-3.5" /> Write a notice
              </Link>
            </Button>
          ) : null
        }
      />

      <Tabs value={status} onValueChange={changeStatusTab} className="mb-4">
        <TabsList className="h-9" data-testid="notices-status-tabs">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-7 gap-1.5 px-3 text-xs"
              data-testid={`notices-tab-${tab.value}`}
            >
              {tab.label}
              <span className="num text-[11px] text-muted-foreground">{counts[tab.countKey]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <FilterBar
        testId="notices-filters"
        search={search}
        onSearchChange={(value: string) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search notices by title, summary or author…"
        filters={[
          {
            key: "priority",
            label: "Priority",
            value: priority,
            options: [
              { value: "all", label: "All priorities" },
              { value: "urgent", label: "Urgent" },
              { value: "high", label: "High" },
              { value: "normal", label: "Normal" },
              { value: "low", label: "Low" },
            ],
            onChange: (value: string) => {
              setPriority(value);
              setPage(1);
            },
            width: "w-[150px]",
          },
        ]}
        onReset={() => {
          setSearch("");
          setPriority("all");
          setPage(1);
        }}
      />

      <DataTable<Notice>
        testId="notices-table"
        columns={columns}
        rows={data?.rows ?? []}
        rowId={(notice) => notice.id}
        rowTestId={(notice) => `notice-row-${notice.id}`}
        loading={isLoading}
        error={isError ? true : undefined}
        onRetry={() => void refetch()}
        onRowClick={(notice) => navigate(`/admin/notices/${notice.id}`)}
        page={page}
        pageSize={8}
        total={data?.total ?? 0}
        onPageChange={setPage}
        empty={
          <EmptyState
            icon={Megaphone}
            title="No notices here yet"
            description="Nothing matches this view. Change the status tab or write a new notice for students, guardians or staff."
            primaryLabel={can("notices.manage") ? "Write a notice" : undefined}
            onPrimary={() => navigate("/admin/notices/new")}
            testId="notices-empty"
          />
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open: boolean) => !open && setPendingDelete(null)}
        title="Delete this notice?"
        description={`“${pendingDelete?.title ?? ""}” will be removed permanently. Recipients who already read it keep no copy.`}
        confirmLabel="Delete notice"
        destructive
        busy={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete)}
        testId="notice-delete-dialog"
      />
    </div>
  );
}
