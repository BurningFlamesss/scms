import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CloudUpload, Globe, Layers, Plus, Search, Undo2 } from "lucide-react";
import { toast } from "sonner";
import {
  addBlock,
  deleteBlock,
  duplicateBlock,
  getWebsitePage,
  listWebsitePages,
  moveBlock,
  publishPage,
  reorderBlocks,
  toggleBlockVisibility,
  unpublishPage,
  updateBlockFields,
  updatePageSeo,
} from "@/services/website";
import { listAlbums, listNotices, upcomingEvents } from "@/services/communications";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel } from "@/components/common/Panel";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PanelSkeleton } from "@/components/common/Skeletons";
import { SortableBlockCard } from "@/components/cms/SortableBlockCard";
import { BlockInspector } from "@/components/cms/BlockInspector";
import { BlockPreview } from "@/components/cms/BlockPreview";
import { AddBlockDialog } from "@/components/cms/AddBlockDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BlockType, ContentBlock, WebsitePage, WebsitePageKey } from "@/types";

const PAGE_KEYS: WebsitePageKey[] = ["homepage", "about", "contact", "other"];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

type Pane = "sections" | "editor" | "preview";

export default function WebsiteContentPage() {
  const { actor, can } = useAuth();
  const canManage = can("website.manage");
  const qc = useQueryClient();
  const navigate = useNavigate();
  const searchParams = (useSearch({ strict: false }) as Record<string, string | undefined>) || {};

  const rawKey = searchParams.page as WebsitePageKey | null;
  const pageKey: WebsitePageKey = rawKey && PAGE_KEYS.includes(rawKey) ? rawKey : "homepage";

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pane, setPane] = useState<Pane>("sections");
  const [addOpen, setAddOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [seoDraft, setSeoDraft] = useState({ title: "", description: "", keywords: "" });
  const [pendingDelete, setPendingDelete] = useState<ContentBlock | null>(null);

  const { data: pages = [] } = useQuery({
    queryKey: ["website-pages"],
    queryFn: async () => clone(await listWebsitePages()),
  });

  const { data: page, isLoading } = useQuery({
    queryKey: ["website-page", pageKey],
    queryFn: async () => {
      const found = await getWebsitePage(pageKey);
      return found ? clone(found) : null;
    },
  });

  const { data: previewNotices } = useQuery({
    queryKey: ["notices", { status: "published", pageSize: 6 }],
    queryFn: () => listNotices({ status: "published", pageSize: 6 }),
  });
  const { data: previewEvents = [] } = useQuery({
    queryKey: ["events", "upcoming", 6],
    queryFn: () => upcomingEvents(6),
  });
  const { data: previewAlbums = [] } = useQuery({
    queryKey: ["albums", ""],
    queryFn: () => listAlbums(""),
  });

  const blocks = useMemo(
    () => (page ? [...page.blocks].sort((a, b) => a.order - b.order) : []),
    [page],
  );

  useEffect(() => {
    setSelectedId(null);
  }, [pageKey]);

  useEffect(() => {
    if (!selectedId && blocks.length > 0) setSelectedId(blocks[0].id);
  }, [blocks, selectedId]);

  useEffect(() => {
    if (page) setSeoDraft(page.seo);
  }, [page]);

  const selected = blocks.find((block) => block.id === selectedId) ?? null;

  const applyPage = (next: WebsitePage) => {
    qc.setQueryData(["website-page", next.key], clone(next));
    void qc.invalidateQueries({ queryKey: ["website-pages"] });
    void qc.invalidateQueries({ queryKey: ["overview"] });
    void qc.invalidateQueries({ queryKey: ["activity"] });
  };

  const saveFields = useMutation({
    mutationFn: (vars: { blockId: string; fields: Record<string, unknown> }) =>
      updateBlockFields(pageKey, vars.blockId, vars.fields, actor),
    onSuccess: (next) => {
      applyPage(next);
      toast.success("Section updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const visibilityMutation = useMutation({
    mutationFn: (blockId: string) => toggleBlockVisibility(pageKey, blockId, actor),
    onSuccess: (next, blockId) => {
      applyPage(next);
      const block = next.blocks.find((item) => item.id === blockId);
      toast.success(block?.visible ? "Section is now visible" : "Section hidden from the website");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const moveMutation = useMutation({
    mutationFn: (vars: { blockId: string; direction: "up" | "down" }) =>
      moveBlock(pageKey, vars.blockId, vars.direction, actor),
    onSuccess: applyPage,
    onError: (error: Error) => toast.error(error.message),
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => reorderBlocks(pageKey, orderedIds, actor),
    onSuccess: (next) => {
      applyPage(next);
      toast.success("Section order saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const addMutation = useMutation({
    mutationFn: (type: BlockType) => addBlock(pageKey, type, actor),
    onSuccess: (next) => {
      applyPage(next);
      const last = [...next.blocks].sort((a, b) => a.order - b.order).at(-1);
      if (last) setSelectedId(last.id);
      setAddOpen(false);
      setPane("editor");
      toast.success(`${last?.label ?? "Section"} added to ${next.title}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: (blockId: string) => duplicateBlock(pageKey, blockId, actor),
    onSuccess: (next) => {
      applyPage(next);
      toast.success("Section duplicated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (blockId: string) => deleteBlock(pageKey, blockId, actor),
    onSuccess: (next) => {
      applyPage(next);
      setPendingDelete(null);
      setSelectedId(null);
      toast.success("Section removed");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const seoMutation = useMutation({
    mutationFn: () => updatePageSeo(pageKey, seoDraft, actor),
    onSuccess: (next) => {
      applyPage(next);
      setSeoOpen(false);
      toast.success("Search settings saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const publishMutation = useMutation({
    mutationFn: () => publishPage(pageKey, actor),
    onSuccess: (next) => {
      applyPage(next);
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(`${next.title} is live`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const unpublishMutation = useMutation({
    mutationFn: () => unpublishPage(pageKey, actor),
    onSuccess: (next) => {
      applyPage(next);
      toast.success(`${next.title} reverted to draft`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = blocks.map((block) => block.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    reorderMutation.mutate(arrayMove(ids, from, to));
  };

  const changePage = (value: string) => {
    navigate({
      search: (prev: Record<string, any>) => {
        const next = { ...prev };
        next.page = value;
        return next;
      },
      replace: true,
    });
  };

  const previewData = {
    notices: previewNotices?.rows ?? [],
    events: previewEvents,
    albums: previewAlbums,
  };

  const paneClass = (target: Pane) => cn(target === pane ? "block" : "hidden", "xl:block");

  return (
    <div data-testid="website-content-page">
      <PageHeader
        wash
        eyebrow="Website"
        title="Website Content"
        description="A block-based editor for the public website — drag sections into order, edit them inline and publish when ready."
        meta={
          page ? (
            <>
              <StatusBadge value={page.status} testId="cms-page-status" />
              {page.hasUnpublishedChanges && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent/14 px-2 py-0.5 text-accent"
                  data-testid="cms-unpublished-chip"
                >
                  Unpublished changes
                </span>
              )}
              <span className="font-mono text-[11px]" data-testid="cms-page-path">
                {page.path}
              </span>
              <span data-testid="cms-page-updated">
                Updated {relativeTime(page.updatedAt)} by {page.updatedBy}
              </span>
              <span data-testid="cms-page-published">
                {page.publishedAt ? `Published ${formatDateTime(page.publishedAt)}` : "Never published"}
              </span>
            </>
          ) : null
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              data-testid="cms-seo-open"
              onClick={() => setSeoOpen(true)}
            >
              <Search className="h-3.5 w-3.5" /> Search settings
            </Button>
            {canManage && (
              <Button size="sm" variant="outline" className="gap-1.5" data-testid="cms-add-block-button" onClick={() => setAddOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Add section
              </Button>
            )}
            {canManage && page?.status === "published" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={unpublishMutation.isPending}
                data-testid="cms-unpublish-button"
                onClick={() => unpublishMutation.mutate()}
              >
                <Undo2 className="h-3.5 w-3.5" /> Unpublish
              </Button>
            )}
            {canManage && (
              <Button
                size="sm"
                className="gap-1.5"
                disabled={publishMutation.isPending}
                data-testid="cms-publish-button"
                onClick={() => publishMutation.mutate()}
              >
                <CloudUpload className="h-3.5 w-3.5" />
                {publishMutation.isPending ? "Publishing…" : "Publish"}
              </Button>
            )}
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={pageKey} onValueChange={changePage}>
          <TabsList className="h-9" data-testid="cms-page-tabs">
            {PAGE_KEYS.map((key) => {
              const entry = pages.find((item) => item.key === key);
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="h-7 gap-1.5 px-3 text-xs"
                  data-testid={`cms-page-tab-${key}`}
                >
                  {entry?.title ?? key}
                  {entry?.hasUnpublishedChanges && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <Tabs value={pane} onValueChange={(value: string) => setPane(value as Pane)} className="xl:hidden">
          <TabsList className="h-9" data-testid="cms-pane-tabs">
            <TabsTrigger value="sections" className="h-7 px-3 text-xs" data-testid="cms-pane-sections">
              Sections
            </TabsTrigger>
            <TabsTrigger value="editor" className="h-7 px-3 text-xs" data-testid="cms-pane-editor">
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="h-7 px-3 text-xs" data-testid="cms-pane-preview">
              Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid gap-5 xl:grid-cols-3">
          <PanelSkeleton height="h-80" />
          <PanelSkeleton height="h-80" />
          <PanelSkeleton height="h-80" />
        </div>
      ) : !page ? (
        <div className="panel">
          <EmptyState
            icon={Globe}
            title="That page isn't set up yet"
            description="Choose Homepage, About, Contact or Other content from the tabs above."
            testId="cms-page-missing"
          />
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-12">
          {/* Pane 1 — page outline */}
          <div className={cn(paneClass("sections"), "xl:col-span-4")}>
            <Panel
              eyebrow="Page outline"
              title={`${blocks.length} section${blocks.length === 1 ? "" : "s"}`}
              description="Drag to reorder"
              testId="cms-outline"
              actions={
                canManage ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 px-2 text-xs"
                    data-testid="cms-outline-add"
                    onClick={() => setAddOpen(true)}
                  >
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                ) : null
              }
            >
              {blocks.length === 0 ? (
                <EmptyState
                  compact
                  icon={Layers}
                  title="This page has no sections"
                  description="Add a hero, an introduction or a dynamic feed to start building this page."
                  primaryLabel={canManage ? "Add a section" : undefined}
                  onPrimary={() => setAddOpen(true)}
                  testId="cms-outline-empty"
                />
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-2" data-testid="cms-block-list">
                      {blocks.map((block, index) => (
                        <SortableBlockCard
                          key={block.id}
                          block={block}
                          index={index}
                          total={blocks.length}
                          canManage={canManage}
                          selected={block.id === selectedId}
                          onSelect={() => {
                            setSelectedId(block.id);
                            setPane("editor");
                          }}
                          onToggleVisibility={() => visibilityMutation.mutate(block.id)}
                          onDuplicate={() => duplicateMutation.mutate(block.id)}
                          onDelete={() => setPendingDelete(block)}
                          onMove={(direction) => moveMutation.mutate({ blockId: block.id, direction })}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}
            </Panel>
          </div>

          {/* Pane 2 — inspector */}
          <div className={cn(paneClass("editor"), "xl:col-span-4")}>
            <BlockInspector
              block={selected}
              canManage={canManage}
              saving={saveFields.isPending}
              onSave={(fields) => selected && saveFields.mutate({ blockId: selected.id, fields })}
              onToggleVisibility={() => selected && visibilityMutation.mutate(selected.id)}
              onDuplicate={() => selected && duplicateMutation.mutate(selected.id)}
              onDelete={() => selected && setPendingDelete(selected)}
            />
          </div>

          {/* Pane 3 — live preview */}
          <div className={cn(paneClass("preview"), "xl:col-span-4")}>
            <Panel
              eyebrow="Live preview"
              title={page.title}
              description={page.path}
              testId="cms-preview"
              bodyClassName="p-0"
            >
              <div className="max-h-[70vh] overflow-y-auto">
                {blocks.length === 0 ? (
                  <EmptyState
                    compact
                    icon={Globe}
                    title="Nothing to preview"
                    description="Add sections to see how this page will look to visitors."
                    testId="cms-preview-empty"
                  />
                ) : (
                  blocks.map((block) => (
                    <BlockPreview
                      key={block.id}
                      block={block}
                      data={previewData}
                      active={block.id === selectedId}
                      onSelect={() => {
                        setSelectedId(block.id);
                        setPane("editor");
                      }}
                    />
                  ))
                )}
              </div>
            </Panel>
          </div>
        </div>
      )}

      <AddBlockDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        busy={addMutation.isPending}
        onAdd={(type) => addMutation.mutate(type)}
      />

      <Dialog open={seoOpen} onOpenChange={setSeoOpen}>
        <DialogContent className="bg-popover sm:max-w-lg" data-testid="cms-seo-dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Search settings</DialogTitle>
            <DialogDescription>
              How this page appears in search results and link previews.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="cms-seo-title">
                Meta title
              </Label>
              <Input
                id="cms-seo-title"
                value={seoDraft.title}
                disabled={!canManage}
                data-testid="cms-seo-title"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setSeoDraft({ ...seoDraft, title: event.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="cms-seo-description">
                Meta description
              </Label>
              <Textarea
                id="cms-seo-description"
                rows={3}
                value={seoDraft.description}
                disabled={!canManage}
                data-testid="cms-seo-description"
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setSeoDraft({ ...seoDraft, description: event.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="cms-seo-keywords">
                Keywords
              </Label>
              <Input
                id="cms-seo-keywords"
                value={seoDraft.keywords}
                disabled={!canManage}
                data-testid="cms-seo-keywords"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setSeoDraft({ ...seoDraft, keywords: event.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" data-testid="cms-seo-cancel" onClick={() => setSeoOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!canManage || seoMutation.isPending}
              data-testid="cms-seo-save"
              onClick={() => seoMutation.mutate()}
            >
              {seoMutation.isPending ? "Saving…" : "Save settings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open: boolean) => !open && setPendingDelete(null)}
        title="Remove this section?"
        description={`The ${pendingDelete?.label ?? ""} section and its content will be deleted from this page.`}
        confirmLabel="Remove section"
        destructive
        busy={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        testId="cms-delete-dialog"
      />
    </div>
  );
}
