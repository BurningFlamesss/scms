import { createFileRoute } from "@tanstack/react-router";
import ClassDetailPage from "#/pages/admin/classes/ClassDetailPage";

export const Route = createFileRoute("/admin/classes/$id")({
  component: ClassDetailPage,
});
