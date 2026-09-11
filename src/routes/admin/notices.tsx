import { createFileRoute } from "@tanstack/react-router";
import NoticesPage from "#/pages/admin/notices/NoticesPage";

export const Route = createFileRoute("/admin/notices")({
  component: NoticesPage,
});
