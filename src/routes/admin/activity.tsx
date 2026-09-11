import { createFileRoute } from "@tanstack/react-router";
import ActivityPage from "#/pages/admin/activity/ActivityPage";

export const Route = createFileRoute("/admin/activity")({
  component: ActivityPage,
});
