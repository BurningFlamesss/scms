import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Album, SchoolEvent } from "#/types";
import { createAlbum, updateAlbum, type AlbumInput } from "#/services/communications";
import { useAuth } from "#/providers/AuthProvider";
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
import { Textarea } from "#/components/ui/textarea";

interface AlbumFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  album?: Album | null;
  events: SchoolEvent[];
  onSaved?: (album: Album) => void;
}

const EMPTY: AlbumInput = { title: "", description: "", visibility: "internal", eventId: undefined };

export function AlbumFormDialog({ open, onOpenChange, album, events, onSaved }: AlbumFormDialogProps) {
  const { actor } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState<AlbumInput>(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      album
        ? {
            title: album.title,
            description: album.description,
            visibility: album.visibility,
            eventId: album.eventId,
          }
        : EMPTY,
    );
  }, [open, album]);

  const mutation = useMutation({
    mutationFn: () => (album ? updateAlbum(album.id, form, actor) : createAlbum(form, actor)),
    onSuccess: (saved) => {
      toast.success(album ? "Album updated" : `Album “${saved.title}” created`);
      qc.invalidateQueries({ queryKey: ["albums"] });
      qc.invalidateQueries({ queryKey: ["album", saved.id] });
      onOpenChange(false);
      onSaved?.(saved);
    },
    onError: (err: Error) => setError(err.message),
  });

  const submit = () => {
    if (!form.title.trim()) {
      setError("Give the album a title so staff can find it later.");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-hairline bg-popover sm:max-w-lg" data-testid="album-form-dialog">
        <DialogHeader>
          <DialogTitle className="font-display">{album ? "Edit album" : "New album"}</DialogTitle>
          <DialogDescription>
            Albums group photos for events, campus life and achievements. Public albums can be surfaced on the website
            gallery block.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="album-title" className="text-xs">
              Title
            </Label>
            <Input
              id="album-title"
              value={form.title}
              placeholder="Annual Sports Day 2026"
              data-testid="album-form-title"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="album-description" className="text-xs">
              Description
            </Label>
            <Textarea
              id="album-description"
              value={form.description}
              rows={3}
              placeholder="Track finals, house relays and the closing ceremony."
              data-testid="album-form-description"
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Visibility</Label>
              <Select
                value={form.visibility}
                onValueChange={(value: string) =>
                  setForm((prev) => ({ ...prev, visibility: value as Album["visibility"] }))
                }
              >
                <SelectTrigger data-testid="album-form-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="public" data-testid="album-form-visibility-public">
                    Public — shown on the website
                  </SelectItem>
                  <SelectItem value="internal" data-testid="album-form-visibility-internal">
                    Internal — staff and guardians
                  </SelectItem>
                  <SelectItem value="private" data-testid="album-form-visibility-private">
                    Private — admin only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Linked event</Label>
              <Select
                value={form.eventId ?? "none"}
                onValueChange={(value: string) =>
                  setForm((prev) => ({ ...prev, eventId: value === "none" ? undefined : value }))
                }
              >
                <SelectTrigger data-testid="album-form-event">
                  <SelectValue placeholder="Not linked" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="none">Not linked</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive" data-testid="album-form-error">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="album-form-cancel">
            Cancel
          </Button>
          <Button disabled={mutation.isPending} onClick={submit} data-testid="album-form-submit">
            {mutation.isPending ? "Saving…" : album ? "Save album" : "Create album"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
