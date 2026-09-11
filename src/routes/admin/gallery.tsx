import { createFileRoute } from "@tanstack/react-router";
import GalleryPage from "#/pages/admin/gallery/GalleryPage";

export const Route = createFileRoute("/admin/gallery")({
  component: GalleryPage,
});
