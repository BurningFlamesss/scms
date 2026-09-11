import { createFileRoute } from "@tanstack/react-router";
import ApplicationDetailPage from "#/pages/admin/admissions/ApplicationDetailPage";

export const Route = createFileRoute("/admin/admissions/$id")({
  component: ApplicationDetailPage,
});
