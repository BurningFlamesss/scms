import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ImagePlus, Images, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Album } from "#/types";
import { deleteAlbum, listAlbums, listEvents } from "#/services/communications";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { FilterBar } from "#/components/common/FilterBar";
import { EmptyState } from "#/components/common/EmptyState";
import { ErrorState } from "#/components/common/ErrorState";
import { StatusBadge } from "#/components/common/StatusBadge";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { AlbumFormDialog } from "#/components/gallery/AlbumFormDialog";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Skeleton } from "#/components/ui/skeleton";
import { formatDate, pluralize, relativeTime } from "#/lib/format";
import { cn } from "#/lib/utils";

export default function GalleryPage() {
  const { can } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { actor } = useAuth();

  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Album | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Album | null>(null);

  const canManage = can("gallery.manage");

  const { data: albums = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["albums", search],
    queryFn: () => listAlbums(search),
  });
  const { data: events = [] } = useQuery({ queryKey: ["events", "all"], queryFn: () => listEvents() });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteAlbum(id, actor),
    onSuccess: () => {
      toast.success("Album deleted");
      setPendingDelete(null);
      qc.invalidateQueries({ queryKey: ["albums"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = useMemo(
    () => albums.filter((album) => visibility === "all" || album.visibility === visibility),
    [albums, visibility],
  );

  const totals = useMemo(() => {
    const images = albums.reduce((sum, album) => sum + album.images.length, 0);
    return {
      albums: albums.length,
      images,
      publicAlbums: albums.filter((album) => album.visibility === "public").length,
      linked: albums.filter((album) => album.eventId).length,
    };
  }, [albums]);

  const eventName = (id?: string) => events.find((event) => event.id === id)?.title;

  return (
    <div data-testid="gallery-page">
      <PageHeader
        eyebrow="Communications"
        title="Gallery"
        description="Photo albums for events, campus life and achievements — ready to publish to the school website."
        meta={
          <>
            <span data-testid="gallery-album-count">{pluralize(totals.albums, "album")}</span>
            <span data-testid="gallery-image-count">{pluralize(totals.images, "image")}</span>
            <span>{totals.publicAlbums} public</span>
            <span>{totals.linked} linked to events</span>
          </>
        }
        actions={
          canManage ? (
            <Button
              size="sm"
              className="gap-1.5"
              data-testid="gallery-new-album"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <ImagePlus className="h-3.5 w-3.5" /> New album
            </Button>
          ) : null
        }
      />

      <FilterBar
        testId="gallery-filters"
        search={search}
        onSearchChange={setSearch}
        placeholder="Search albums by title or description…"
        filters={[
          {
            key: "visibility",
            label: "Visibility",
            value: visibility,
            options: [
              { value: "all", label: "Any visibility" },
              { value: "public", label: "Public" },
              { value: "internal", label: "Internal" },
              { value: "private", label: "Private" },
            ],
            onChange: setVisibility,
            width: "w-[160px]",
          },
        ]}
        onReset={() => {
          setSearch("");
          setVisibility("all");
        }}
      />

      {isError ? (
        <div className="panel">
          <ErrorState onRetry={() => refetch()} testId="gallery-error" />
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="gallery-loading">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="panel overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Images}
            title={search || visibility !== "all" ? "No albums match these filters" : "No albums yet"}
            description={
              search || visibility !== "all"
                ? "Try another search term or clear the visibility filter."
                : "Create your first album, then upload photos from an event or around the campus."
            }
            primaryLabel={canManage && !search && visibility === "all" ? "Create album" : undefined}
            onPrimary={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            secondaryLabel={search || visibility !== "all" ? "Clear filters" : undefined}
            onSecondary={() => {
              setSearch("");
              setVisibility("all");
            }}
            testId="gallery-empty"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="gallery-album-grid">
          {rows.map((album) => {
            const cover = album.images.find((image) => image.id === album.coverImageId) ?? album.images[0];
            return (
              <article
                key={album.id}
                className="panel group flex flex-col overflow-hidden transition-colors duration-150 hover:border-primary/35"
                data-testid={`gallery-album-card-${album.id}`}
              >
                <button
                  type="button"
                  onClick={() => navigate(`/admin/gallery/${album.id}`)}
                  aria-label={`Open ${album.title}`}
                  data-testid={`gallery-album-open-${album.id}`}
                  className="relative block aspect-[4/3] w-full overflow-hidden bg-surface-2 focus-ring"
                >
                  {cover ? (
                    <img
                      src={cover.url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center">
                      <Images className="h-6 w-6 text-muted-foreground" />
                    </span>
                  )}
                </button>

                <div className="flex min-w-0 flex-1 flex-col p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/admin/gallery/${album.id}`}
                      className="min-w-0 flex-1 rounded focus-ring"
                      data-testid={`gallery-album-link-${album.id}`}
                    >
                      <h3 className="truncate font-display text-sm font-semibold text-foreground">{album.title}</h3>
                    </Link>
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label="Album actions"
                            data-testid={`gallery-album-actions-${album.id}`}
                            className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-popover">
                          <DropdownMenuLabel className="truncate text-xs">{album.title}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/admin/gallery/${album.id}`)}>
                            Open album
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            data-testid={`gallery-album-edit-${album.id}`}
                            onClick={() => {
                              setEditing(album);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            data-testid={`gallery-album-delete-${album.id}`}
                            onClick={() => setPendingDelete(album)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete album
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {album.description || "No description yet."}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span
                      className="num inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
                      data-testid={`gallery-album-photos-${album.id}`}
                    >
                      <Images className="h-3 w-3" /> {album.images.length}
                    </span>
                    <StatusBadge value={album.visibility} testId={`gallery-album-visibility-${album.id}`} />
                    {album.eventId && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border border-hairline px-2 py-0.5 text-[11px] text-muted-foreground",
                        )}
                      >
                        <CalendarDays className="h-3 w-3" />
                        <span className="max-w-[110px] truncate">{eventName(album.eventId) ?? "Event"}</span>
                      </span>
                    )}
                  </div>

                  <p className="mt-2.5 border-t border-hairline pt-2 text-[11px] text-muted-foreground">
                    Updated {relativeTime(album.updatedAt)} · created {formatDate(album.createdAt)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AlbumFormDialog
        open={formOpen}
        album={editing}
        events={events}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        onSaved={(album) => {
          if (!editing) navigate(`/admin/gallery/${album.id}`);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this album?"
        description={`“${pendingDelete?.title}” and its ${pendingDelete?.images.length ?? 0} images will be removed from the gallery and the website. This cannot be undone.`}
        confirmLabel="Delete album"
        destructive
        busy={removeMutation.isPending}
        onConfirm={() => pendingDelete && removeMutation.mutate(pendingDelete.id)}
        testId="gallery-delete-confirm"
      />
    </div>
  );
}
