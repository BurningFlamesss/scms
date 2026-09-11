import { createFileRoute } from "@tanstack/react-router";
import AlbumDetailPage from "#/pages/admin/gallery/AlbumDetailPage";

export const Route = createFileRoute("/admin/gallery/$id")({
  component: AlbumDetailPage,
});
