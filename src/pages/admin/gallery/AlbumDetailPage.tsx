import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
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
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  ArrowLeft,
  ImagePlus,
  Images,
  Loader2,
  Pencil,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Album, GalleryImage } from "#/types";
import {
  addAlbumImages,
  deleteAlbum,
  deleteAlbumImage,
  getAlbum,
  listEvents,
  reorderAlbumImages,
  setAlbumCover,
  updateAlbum,
  updateAlbumImage,
} from "#/services/communications";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { EmptyState } from "#/components/common/EmptyState";
import { ErrorState } from "#/components/common/ErrorState";
import { DetailSkeleton } from "#/components/common/Skeletons";
import { StatusBadge } from "#/components/common/StatusBadge";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { AlbumFormDialog } from "#/components/gallery/AlbumFormDialog";
import { Lightbox } from "#/components/gallery/Lightbox";
import { SortableImageTile } from "#/components/gallery/SortableImageTile";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { fileToDataUrl, STOCK_LIBRARY } from "#/lib/image";
import { formatDateTime, relativeTime } from "#/lib/format";

interface StagedImage {
  id: string;
  url: string;
  caption: string;
}

export default function AlbumDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { actor, can } = useAuth();
  const canManage = can("gallery.manage");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [staged, setStaged] = useState<StagedImage[]>([]);
  const [reading, setReading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [captionTarget, setCaptionTarget] = useState<GalleryImage | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
  const [albumDeleteOpen, setAlbumDeleteOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: album, isLoading, isError, refetch } = useQuery({
    queryKey: ["album", id],
    queryFn: () => getAlbum(id),
    enabled: Boolean(id),
  });
  const { data: events = [] } = useQuery({ queryKey: ["events", "all"], queryFn: () => listEvents() });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const invalidate = (saved?: Album) => {
    qc.invalidateQueries({ queryKey: ["album", id] });
    qc.invalidateQueries({ queryKey: ["albums"] });
    if (saved) qc.setQueryData(["album", id], saved);
  };

  const uploadMutation = useMutation({
    mutationFn: () => addAlbumImages(id, staged.map(({ url, caption }) => ({ url, caption })), actor),
    onSuccess: (saved) => {
      toast.success(`${staged.length} image${staged.length === 1 ? "" : "s"} added to “${saved.title}”`);
      setStaged([]);
      setUploadOpen(false);
      invalidate(saved);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const captionMutation = useMutation({
    mutationFn: () => updateAlbumImage(id, captionTarget!.id, { caption: captionDraft }),
    onSuccess: (saved) => {
      toast.success("Caption updated");
      setCaptionTarget(null);
      invalidate(saved);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const coverMutation = useMutation({
    mutationFn: (imageId: string) => setAlbumCover(id, imageId),
    onSuccess: (saved) => {
      toast.success("Album cover updated");
      invalidate(saved);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => deleteAlbumImage(id, imageId),
    onSuccess: (saved) => {
      toast.success("Image removed");
      setImageToDelete(null);
      invalidate(saved);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => reorderAlbumImages(id, orderedIds),
    onSuccess: (saved) => invalidate(saved),
    onError: (error: Error) => toast.error(error.message),
  });

  const visibilityMutation = useMutation({
    mutationFn: (visibility: Album["visibility"]) => updateAlbum(id, { visibility }, actor),
    onSuccess: (saved) => {
      toast.success(`Album is now ${saved.visibility}`);
      invalidate(saved);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteAlbumMutation = useMutation({
    mutationFn: () => deleteAlbum(id, actor),
    onSuccess: () => {
      toast.success("Album deleted");
      qc.invalidateQueries({ queryKey: ["albums"] });
      navigate("/gallery");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const images = useMemo(() => album?.images ?? [], [album]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = images.map((image) => image.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    reorderMutation.mutate(arrayMove(ids, from, to));
  };

  const stageFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setReading(true);
    try {
      const next: StagedImage[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        // eslint-disable-next-line no-await-in-loop
        const url = await fileToDataUrl(file, 1400, 0.72);
        next.push({ id: `${file.name}-${next.length}-${Date.now()}`, url, caption: file.name.replace(/\.[^.]+$/, "") });
      }
      if (!next.length) toast.error("Those files were not readable images.");
      setStaged((prev) => [...prev, ...next]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setReading(false);
    }
  };

  if (isLoading) return <DetailSkeleton />;
  if (isError) {
    return (
      <div className="panel">
        <ErrorState onRetry={() => refetch()} testId="album-detail-error" />
      </div>
    );
  }
  if (!album) {
    return (
      <div className="panel">
        <EmptyState
          icon={Images}
          title="Album not found"
          description="This album may have been deleted. Head back to the gallery to pick another one."
          primaryLabel="Back to gallery"
          onPrimary={() => navigate("/gallery")}
          testId="album-detail-missing"
        />
      </div>
    );
  }

  const linkedEvent = events.find((event) => event.id === album.eventId);

  return (
    <div data-testid="album-detail-page">
      <PageHeader
        eyebrow="Gallery"
        title={album.title}
        description={album.description || "No description yet."}
        meta={
          <>
            <span data-testid="album-image-count">{album.images.length} images</span>
            <span>Updated {relativeTime(album.updatedAt)}</span>
            <StatusBadge value={album.visibility} testId="album-visibility-badge" />
            {linkedEvent && (
              <Link to={`/events/${linkedEvent.id}`} className="text-primary hover:underline" data-testid="album-event-link">
                {linkedEvent.title}
              </Link>
            )}
          </>
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/gallery" data-testid="album-back">
                <ArrowLeft className="h-3.5 w-3.5" /> All albums
              </Link>
            </Button>
            {canManage && (
              <>
                <Select
                  value={album.visibility}
                  onValueChange={(value: string) => visibilityMutation.mutate(value as Album["visibility"])}
                >
                  <SelectTrigger className="h-9 w-[140px] border-hairline bg-surface-1 text-xs" data-testid="album-visibility-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="public" className="text-xs">
                      Public
                    </SelectItem>
                    <SelectItem value="internal" className="text-xs">
                      Internal
                    </SelectItem>
                    <SelectItem value="private" className="text-xs">
                      Private
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="gap-1.5" data-testid="album-edit" onClick={() => setEditOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive"
                  data-testid="album-delete"
                  onClick={() => setAlbumDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
                <Button size="sm" className="gap-1.5" data-testid="album-upload-open" onClick={() => setUploadOpen(true)}>
                  <UploadCloud className="h-3.5 w-3.5" /> Upload images
                </Button>
              </>
            )}
          </>
        }
      />

      <Panel
        eyebrow="Photos"
        title="Album contents"
        description={canManage ? "Drag the handle to reorder · hover a photo for actions" : "Hover a photo to open it"}
        bodyClassName="p-4"
        testId="album-images-panel"
      >
        {images.length === 0 ? (
          <EmptyState
            icon={ImagePlus}
            title="No photos in this album"
            description="Upload photos from your device or pick a few from the sample library to get started."
            primaryLabel={canManage ? "Upload images" : undefined}
            onPrimary={() => setUploadOpen(true)}
            testId="album-images-empty"
          />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={images.map((image) => image.id)} strategy={rectSortingStrategy}>
              <div
                className="grid auto-rows-[130px] grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"
                data-testid="album-masonry"
              >
                {images.map((image, index) => (
                  <SortableImageTile
                    key={image.id}
                    image={image}
                    index={index}
                    canManage={canManage}
                    isCover={album.coverImageId === image.id}
                    spanClass={index % 7 === 0 || index % 7 === 4 ? "row-span-3" : "row-span-2"}
                    onOpen={() => setLightboxIndex(index)}
                    onEditCaption={() => {
                      setCaptionTarget(image);
                      setCaptionDraft(image.caption);
                    }}
                    onSetCover={() => coverMutation.mutate(image.id)}
                    onDelete={() => setImageToDelete(image)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Panel>

      {/* Upload ----------------------------------------------------------- */}
      <Dialog
        open={uploadOpen}
        onOpenChange={(open) => {
          setUploadOpen(open);
          if (!open) setStaged([]);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-hairline bg-popover sm:max-w-2xl" data-testid="album-upload-dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Upload to “{album.title}”</DialogTitle>
            <DialogDescription>
              Images are resized in the browser and stored with this demo dataset — nothing is sent to a server.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void stageFiles(event.dataTransfer.files);
              }}
              data-testid="album-upload-dropzone"
              className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-hairline bg-surface-2 px-6 py-8 text-center transition-colors hover:border-primary/45 focus-ring"
            >
              {reading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">Drop photos or click to browse</span>
              <span className="text-xs text-muted-foreground">Multiple files supported · PNG, JPG or WebP</span>
            </button>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Or add from the sample library</p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {STOCK_LIBRARY.map((item) => (
                  <button
                    key={item.url}
                    type="button"
                    title={item.label}
                    data-testid="album-upload-library-item"
                    onClick={() =>
                      setStaged((prev) => [
                        ...prev,
                        { id: `${item.url}-${prev.length}`, url: item.url, caption: item.label },
                      ])
                    }
                    className="overflow-hidden rounded-md border border-hairline transition-transform duration-150 hover:scale-[1.03] focus-ring"
                  >
                    <img src={item.url} alt={item.label} className="aspect-square w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>

            {staged.length > 0 && (
              <div className="rounded-xl border border-hairline" data-testid="album-upload-staged">
                <div className="flex items-center justify-between border-b border-hairline px-3 py-2">
                  <p className="text-xs font-medium text-foreground">
                    {staged.length} ready to upload — captions are editable
                  </p>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                    data-testid="album-upload-clear"
                    onClick={() => setStaged([])}
                  >
                    Clear
                  </button>
                </div>
                <ul className="max-h-[240px] divide-y divide-hairline overflow-y-auto">
                  {staged.map((item, index) => (
                    <li key={item.id} className="flex items-center gap-3 px-3 py-2">
                      <img src={item.url} alt="" className="h-10 w-14 shrink-0 rounded border border-hairline object-cover" />
                      <Input
                        value={item.caption}
                        className="h-8 flex-1 border-hairline bg-surface-1 text-xs"
                        data-testid={`album-upload-caption-${index}`}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setStaged((prev) =>
                            prev.map((row) => (row.id === item.id ? { ...row, caption: event.target.value } : row)),
                          )
                        }
                      />
                      <button
                        type="button"
                        aria-label="Remove from upload"
                        className="rounded p-1 text-muted-foreground hover:text-destructive focus-ring"
                        data-testid={`album-upload-remove-${index}`}
                        onClick={() => setStaged((prev) => prev.filter((row) => row.id !== item.id))}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadOpen(false);
                setStaged([]);
              }}
              data-testid="album-upload-cancel"
            >
              Cancel
            </Button>
            <Button
              disabled={staged.length === 0 || uploadMutation.isPending}
              data-testid="album-upload-submit"
              onClick={() => uploadMutation.mutate()}
            >
              {uploadMutation.isPending ? "Uploading…" : `Upload ${staged.length || ""} image${staged.length === 1 ? "" : "s"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        data-testid="album-upload-file-input"
        onChange={(event) => void stageFiles(event.target.files)}
      />

      {/* Caption ---------------------------------------------------------- */}
      <Dialog open={Boolean(captionTarget)} onOpenChange={(open) => !open && setCaptionTarget(null)}>
        <DialogContent className="border-hairline bg-popover sm:max-w-md" data-testid="album-caption-dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Edit caption</DialogTitle>
            <DialogDescription>
              Captions appear under the photo in the gallery and on the public website.
            </DialogDescription>
          </DialogHeader>
          {captionTarget && (
            <div className="space-y-3">
              <img
                src={captionTarget.url}
                alt=""
                className="aspect-[16/9] w-full rounded-lg border border-hairline object-cover"
              />
              <div className="space-y-1.5">
                <Label htmlFor="caption-input" className="text-xs">
                  Caption
                </Label>
                <Input
                  id="caption-input"
                  value={captionDraft}
                  data-testid="album-caption-input"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCaptionDraft(event.target.value)}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Uploaded {formatDateTime(captionTarget.uploadedAt)}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCaptionTarget(null)} data-testid="album-caption-cancel">
              Cancel
            </Button>
            <Button
              disabled={captionMutation.isPending}
              data-testid="album-caption-save"
              onClick={() => captionMutation.mutate()}
            >
              {captionMutation.isPending ? "Saving…" : "Save caption"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlbumFormDialog open={editOpen} album={album} events={events} onOpenChange={setEditOpen} />

      <Lightbox
        images={images}
        index={lightboxIndex}
        albumTitle={album.title}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />

      <ConfirmDialog
        open={Boolean(imageToDelete)}
        onOpenChange={(open) => !open && setImageToDelete(null)}
        title="Remove this image?"
        description="The photo will be removed from this album. If it was the cover, the next image becomes the cover."
        confirmLabel="Remove image"
        destructive
        busy={deleteImageMutation.isPending}
        onConfirm={() => imageToDelete && deleteImageMutation.mutate(imageToDelete.id)}
        testId="album-image-delete-confirm"
      />

      <ConfirmDialog
        open={albumDeleteOpen}
        onOpenChange={setAlbumDeleteOpen}
        title="Delete this album?"
        description={`“${album.title}” and its ${album.images.length} images will be removed. This cannot be undone.`}
        confirmLabel="Delete album"
        destructive
        busy={deleteAlbumMutation.isPending}
        onConfirm={() => deleteAlbumMutation.mutate()}
        testId="album-delete-confirm"
      />
    </div>
  );
}
