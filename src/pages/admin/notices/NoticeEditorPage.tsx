import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, ChevronDown, Save, Send, Users, X } from "lucide-react";
import { toast } from "sonner";
import {
  audienceOptions,
  audienceReach,
  createNotice,
  getNotice,
  updateNotice,
  type NoticeInput,
} from "#/services/communications";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { RichTextEditor } from "#/components/common/RichTextEditor";
import { ImageUploader } from "#/components/common/ImageUploader";
import { StatusBadge } from "#/components/common/StatusBadge";
import { DetailSkeleton } from "#/components/common/Skeletons";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Switch } from "#/components/ui/switch";
import { Separator } from "#/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";
import { ScrollArea } from "#/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { formatDateTime, formatNumber } from "#/lib/format";
import type { AudienceTarget, NoticePriority, NoticeStatus } from "#/types";

const PRIORITIES: { value: NoticePriority; label: string; hint: string }[] = [
  { value: "low", label: "Low", hint: "Informational only" },
  { value: "normal", label: "Normal", hint: "Standard announcement" },
  { value: "high", label: "High", hint: "Highlighted in lists" },
  { value: "urgent", label: "Urgent", hint: "Pushed to the top with accent styling" },
];

const STATUSES: { value: NoticeStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

function targetKey(target: AudienceTarget): string {
  return `${target.kind}:${target.value ?? ""}`;
}

function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

function fromLocalInput(value: string): string {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

const EMPTY_FORM: NoticeInput = {
  title: "",
  summary: "",
  content: "<p></p>",
  featuredImage: undefined,
  audience: [{ kind: "everyone", label: "Everyone" }],
  priority: "normal",
  status: "draft",
  publishAt: new Date().toISOString(),
  expiresAt: undefined,
  pinned: false,
};

export default function NoticeEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { actor, can } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState<NoticeInput>(EMPTY_FORM);
  const [audienceOpen, setAudienceOpen] = useState(false);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["notice", id],
    queryFn: () => getNotice(id as string),
    enabled: isEdit,
  });

  useEffect(() => {
    if (!existing) return;
    setForm({
      title: existing.title,
      summary: existing.summary,
      content: existing.content,
      featuredImage: existing.featuredImage,
      audience: existing.audience,
      priority: existing.priority,
      status: existing.status,
      publishAt: existing.publishAt,
      expiresAt: existing.expiresAt,
      pinned: existing.pinned,
    });
  }, [existing]);

  const options = useMemo(() => audienceOptions(), []);
  const selectedKeys = new Set(form.audience.map(targetKey));
  const reach = useMemo(() => audienceReach(form.audience), [form.audience]);

  const patch = (next: Partial<NoticeInput>) => setForm((current) => ({ ...current, ...next }));

  const toggleTarget = (target: AudienceTarget) => {
    const key = targetKey(target);
    setForm((current) => ({
      ...current,
      audience: current.audience.some((t) => targetKey(t) === key)
        ? current.audience.filter((t) => targetKey(t) !== key)
        : [...current.audience, target],
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async (status: NoticeStatus) => {
      const payload: NoticeInput = {
        ...form,
        status,
        publishAt: status === "published" ? new Date().toISOString() : form.publishAt,
      };
      if (isEdit && id) return updateNotice(id, payload, actor);
      return createNotice(payload, actor);
    },
    onSuccess: (notice) => {
      void qc.invalidateQueries({ queryKey: ["notices"] });
      void qc.invalidateQueries({ queryKey: ["notice", notice.id] });
      void qc.invalidateQueries({ queryKey: ["overview"] });
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(
        notice.status === "published"
          ? `“${notice.title}” published to ${formatNumber(reach)} recipients`
          : `“${notice.title}” saved as ${notice.status}`,
      );
      navigate(`/admin/notices/${notice.id}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const invalid = !form.title.trim() || !form.summary.trim() || form.audience.length === 0;

  const submit = (status: NoticeStatus) => {
    if (invalid) {
      toast.error("Add a title, a one-line summary and at least one audience.");
      return;
    }
    saveMutation.mutate(status);
  };

  if (isEdit && isLoading) return <DetailSkeleton />;

  return (
    <div data-testid="notice-editor-page">
      <PageHeader
        eyebrow={isEdit ? "Edit notice" : "New notice"}
        title={form.title || (isEdit ? "Edit notice" : "Write a notice")}
        description="Compose the announcement, choose who should see it, then save as a draft or publish."
        meta={
          <>
            <StatusBadge value={form.status} testId="notice-editor-status-chip" />
            <span className="inline-flex items-center gap-1.5" data-testid="notice-editor-reach">
              <Users className="h-3 w-3" /> {formatNumber(reach)} recipients
            </span>
          </>
        }
        actions={
          <>
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link to="/admin/notices" data-testid="notice-editor-cancel">
                <ArrowLeft className="h-3.5 w-3.5" /> Cancel
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={saveMutation.isPending}
              data-testid="notice-editor-save-draft"
              onClick={() => submit(form.status === "published" ? "published" : "draft")}
            >
              <Save className="h-3.5 w-3.5" /> {isEdit ? "Save changes" : "Save draft"}
            </Button>
            {can("notices.publish") && (
              <Button
                size="sm"
                className="gap-1.5"
                disabled={saveMutation.isPending}
                data-testid="notice-editor-publish"
                onClick={() => submit("published")}
              >
                <Send className="h-3.5 w-3.5" /> {saveMutation.isPending ? "Working…" : "Publish now"}
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Tabs defaultValue="write">
            <TabsList className="mb-4 h-9" data-testid="notice-editor-tabs">
              <TabsTrigger value="write" className="h-7 px-3 text-xs" data-testid="notice-editor-tab-write">
                Write
              </TabsTrigger>
              <TabsTrigger value="preview" className="h-7 px-3 text-xs" data-testid="notice-editor-tab-preview">
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="write" className="mt-0 space-y-5">
              <Panel title="Content" testId="notice-editor-content-panel">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs" htmlFor="notice-title">
                      Title *
                    </Label>
                    <Input
                      id="notice-title"
                      value={form.title}
                      placeholder="e.g. Parent–teacher meetings for Term 2"
                      data-testid="notice-title-input"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => patch({ title: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs" htmlFor="notice-summary">
                      Summary *
                    </Label>
                    <Textarea
                      id="notice-summary"
                      rows={2}
                      value={form.summary}
                      placeholder="One line shown in lists, notifications and the website feed."
                      data-testid="notice-summary-input"
                      onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => patch({ summary: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Body</Label>
                    <RichTextEditor
                      value={form.content}
                      onChange={(html: string) => patch({ content: html })}
                      testId="notice-content-editor"
                    />
                  </div>
                </div>
              </Panel>

              <Panel title="Featured image" description="Optional — shown on the website and notice detail" testId="notice-editor-image-panel">
                <ImageUploader
                  value={form.featuredImage}
                  onChange={(url: string | undefined) => patch({ featuredImage: url })}
                  label="Notice image"
                  testId="notice-image-uploader"
                />
              </Panel>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <Panel title="Preview" description="How recipients will read this notice" testId="notice-editor-preview">
                <article className="space-y-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <StatusBadge value={form.priority} />
                      <StatusBadge value={form.status} />
                      {form.pinned && (
                        <span className="rounded-full bg-accent/14 px-2 py-0.5 text-xs font-medium text-accent">Pinned</span>
                      )}
                    </div>
                    <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-foreground" data-testid="notice-preview-title">
                      {form.title || "Untitled notice"}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground" data-testid="notice-preview-summary">
                      {form.summary || "Add a summary to describe this notice in one line."}
                    </p>
                  </div>
                  {form.featuredImage && (
                    <img
                      src={form.featuredImage}
                      alt=""
                      className="aspect-[16/9] w-full rounded-lg border border-hairline object-cover"
                    />
                  )}
                  <div
                    className="prose-editor"
                    data-testid="notice-preview-body"
                    dangerouslySetInnerHTML={{ __html: form.content || "<p></p>" }}
                  />
                  <Separator />
                  <p className="text-xs text-muted-foreground">
                    Visible to: {form.audience.map((target) => target.label).join(" · ")}
                  </p>
                </article>
              </Panel>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-5">
          <Panel title="Publishing" testId="notice-editor-publishing-panel">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={(value: string) => patch({ status: value as NoticeStatus })}>
                  <SelectTrigger data-testid="notice-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value} className="text-xs">
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs" htmlFor="notice-publish-at">
                  Publish at
                </Label>
                <Input
                  id="notice-publish-at"
                  type="datetime-local"
                  value={toLocalInput(form.publishAt)}
                  data-testid="notice-publish-at"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    patch({ publishAt: fromLocalInput(event.target.value) })
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  Scheduled notices go live automatically at {formatDateTime(form.publishAt)}.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs" htmlFor="notice-expires-at">
                  Expires (optional)
                </Label>
                <Input
                  id="notice-expires-at"
                  type="datetime-local"
                  value={toLocalInput(form.expiresAt)}
                  data-testid="notice-expires-at"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    patch({ expiresAt: event.target.value ? fromLocalInput(event.target.value) : undefined })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label className="text-xs">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(value: string) => patch({ priority: value as NoticePriority })}
                >
                  <SelectTrigger data-testid="notice-priority-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {PRIORITIES.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value} className="text-xs">
                        {priority.label} — {priority.hint}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-surface-2 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground">Pin to top</p>
                  <p className="text-[11px] text-muted-foreground">Keeps this notice above the rest</p>
                </div>
                <Switch
                  checked={form.pinned}
                  onCheckedChange={(checked: boolean) => patch({ pinned: checked })}
                  aria-label="Pin notice to top"
                  data-testid="notice-pinned-switch"
                />
              </div>
            </div>
          </Panel>

          <Panel
            title="Audience"
            description={`${formatNumber(reach)} people will receive this`}
            testId="notice-editor-audience-panel"
          >
            <div className="space-y-3">
              <Popover open={audienceOpen} onOpenChange={setAudienceOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between gap-2"
                    data-testid="notice-audience-trigger"
                  >
                    <span className="truncate text-xs">
                      {form.audience.length === 0
                        ? "Choose an audience"
                        : `${form.audience.length} audience${form.audience.length === 1 ? "" : "s"} selected`}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[280px] bg-popover p-0">
                  <ScrollArea className="h-[280px]">
                    <div className="p-1.5">
                      {options.map((option) => {
                        const active = selectedKeys.has(targetKey(option));
                        return (
                          <button
                            key={targetKey(option)}
                            type="button"
                            data-testid={`notice-audience-option-${targetKey(option)}`}
                            onClick={() => toggleTarget(option)}
                            className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors focus-ring ${
                              active ? "bg-primary/[0.08] text-foreground" : "text-muted-foreground hover:bg-secondary"
                            }`}
                          >
                            <span className="min-w-0 truncate">{option.label}</span>
                            {active && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              <div className="flex flex-wrap gap-1.5" data-testid="notice-audience-chips">
                {form.audience.length === 0 && (
                  <p className="text-xs text-muted-foreground">No audience selected yet.</p>
                )}
                {form.audience.map((target) => (
                  <span
                    key={targetKey(target)}
                    className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-2 px-2 py-0.5 text-[11px] text-foreground"
                  >
                    {target.label}
                    <button
                      type="button"
                      aria-label={`Remove ${target.label}`}
                      data-testid={`notice-audience-remove-${targetKey(target)}`}
                      onClick={() => toggleTarget(target)}
                      className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-destructive focus-ring"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Visible to: {form.audience.length ? form.audience.map((t) => t.label).join(" · ") : "nobody yet"}
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
