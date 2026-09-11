import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, ArrowLeft, Megaphone, Pencil, Pin, PinOff, Send, Trash2, Undo2, Users } from "lucide-react";
import { toast } from "sonner";
import { deleteNotice, getNotice, setNoticeStatus, updateNotice, audienceReach } from "#/services/communications";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { KeyValue, Panel } from "#/components/common/Panel";
import { StatusBadge } from "#/components/common/StatusBadge";
import { EmptyState } from "#/components/common/EmptyState";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { DetailSkeleton } from "#/components/common/Skeletons";
import { Button } from "#/components/ui/button";
import { formatDateTime, formatNumber, relativeTime } from "#/lib/format";
import type { NoticeStatus } from "#/types";

export default function NoticeDetailPage() {
  const { id = "" } = useParams();
  const { actor, can } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: notice, isLoading } = useQuery({
    queryKey: ["notice", id],
    queryFn: () => getNotice(id),
    enabled: Boolean(id),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["notices"] });
    void qc.invalidateQueries({ queryKey: ["notice", id] });
    void qc.invalidateQueries({ queryKey: ["overview"] });
  };

  const statusMutation = useMutation({
    mutationFn: (status: NoticeStatus) => setNoticeStatus(id, status, actor),
    onSuccess: (updated) => {
      toast.success(
        updated.status === "published" ? `“${updated.title}” is now live` : `Moved to ${updated.status}`,
      );
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const pinMutation = useMutation({
    mutationFn: () => updateNotice(id, { pinned: !notice?.pinned }, actor),
    onSuccess: (updated) => {
      toast.success(updated.pinned ? "Pinned to the top" : "Unpinned");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteNotice(id, actor),
    onSuccess: () => {
      toast.success("Notice deleted");
      invalidate();
      navigate("/notices");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) return <DetailSkeleton />;

  if (!notice) {
    return (
      <div className="panel" data-testid="notice-not-found">
        <EmptyState
          icon={Megaphone}
          title="That notice no longer exists"
          description="It may have been deleted. Head back to the notice board to see everything that's live."
          primaryLabel="Back to notices"
          onPrimary={() => navigate("/notices")}
          testId="notice-not-found-empty"
        />
      </div>
    );
  }

  const reach = audienceReach(notice.audience);
  const hasContent = notice.content.replace(/<[^>]*>/g, "").trim().length > 0;

  return (
    <div data-testid="notice-detail-page">
      <PageHeader
        eyebrow="Notice"
        title={notice.title}
        description={notice.summary}
        meta={
          <>
            <StatusBadge value={notice.status} testId="notice-detail-status" />
            <StatusBadge value={notice.priority} testId="notice-detail-priority" />
            {notice.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/14 px-2 py-0.5 text-accent">
                <Pin className="h-3 w-3" /> Pinned
              </span>
            )}
            <span data-testid="notice-detail-author">By {notice.authorName}</span>
            <span data-testid="notice-detail-publish">{formatDateTime(notice.publishAt)}</span>
            <span className="num" data-testid="notice-detail-views">
              {formatNumber(notice.views)} views
            </span>
          </>
        }
        actions={
          <>
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link to="/notices" data-testid="notice-detail-back">
                <ArrowLeft className="h-3.5 w-3.5" /> All notices
              </Link>
            </Button>
            {can("notices.manage") && (
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link to={`/notices/${notice.id}/edit`} data-testid="notice-detail-edit">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
              </Button>
            )}
            {can("notices.manage") && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={pinMutation.isPending}
                data-testid="notice-detail-pin"
                onClick={() => pinMutation.mutate()}
              >
                {notice.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                {notice.pinned ? "Unpin" : "Pin"}
              </Button>
            )}
            {can("notices.manage") && notice.status !== "archived" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={statusMutation.isPending}
                data-testid="notice-detail-archive"
                onClick={() => statusMutation.mutate("archived")}
              >
                <Archive className="h-3.5 w-3.5" /> Archive
              </Button>
            )}
            {can("notices.publish") &&
              (notice.status === "published" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={statusMutation.isPending}
                  data-testid="notice-detail-unpublish"
                  onClick={() => statusMutation.mutate("draft")}
                >
                  <Undo2 className="h-3.5 w-3.5" /> Revert to draft
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={statusMutation.isPending}
                  data-testid="notice-detail-publish"
                  onClick={() => statusMutation.mutate("published")}
                >
                  <Send className="h-3.5 w-3.5" /> Publish now
                </Button>
              ))}
            {can("notices.publish") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                aria-label="Delete notice"
                data-testid="notice-detail-delete"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Notice content" testId="notice-detail-content">
          <article className="space-y-4">
            {notice.featuredImage && (
              <img
                src={notice.featuredImage}
                alt=""
                className="aspect-[16/9] w-full rounded-lg border border-hairline object-cover"
                data-testid="notice-detail-image"
              />
            )}
            {hasContent ? (
              <div
                className="prose-editor"
                data-testid="notice-detail-body"
                dangerouslySetInnerHTML={{ __html: notice.content }}
              />
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="notice-detail-body">
                This notice has no body text — the summary above is all recipients will see.
              </p>
            )}
          </article>
        </Panel>

        <div className="space-y-5">
          <Panel
            title="Audience"
            description={`${formatNumber(reach)} recipients`}
            testId="notice-detail-audience"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {notice.audience.map((target) => (
                  <span
                    key={`${target.kind}-${target.value ?? "any"}`}
                    className="rounded-full border border-hairline bg-surface-2 px-2 py-0.5 text-[11px] text-foreground"
                  >
                    {target.label}
                  </span>
                ))}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> Reaches {formatNumber(reach)} students, guardians and staff
              </p>
            </div>
          </Panel>

          <Panel title="Details" testId="notice-detail-meta">
            <dl className="grid grid-cols-2 gap-4">
              <KeyValue label="Author" value={notice.authorName} />
              <KeyValue label="Status" value={<StatusBadge value={notice.status} />} />
              <KeyValue label="Priority" value={<StatusBadge value={notice.priority} />} />
              <KeyValue label="Views" value={formatNumber(notice.views)} mono />
              <KeyValue label="Publish at" value={formatDateTime(notice.publishAt)} />
              <KeyValue label="Expires" value={notice.expiresAt ? formatDateTime(notice.expiresAt) : "No expiry"} />
              <KeyValue label="Created" value={relativeTime(notice.createdAt)} />
              <KeyValue label="Last updated" value={relativeTime(notice.updatedAt)} />
            </dl>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this notice?"
        description={`“${notice.title}” will be removed permanently from the notice board.`}
        confirmLabel="Delete notice"
        destructive
        busy={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        testId="notice-detail-delete-dialog"
      />
    </div>
  );
}
