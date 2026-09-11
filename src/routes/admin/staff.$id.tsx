import { createFileRoute } from "@tanstack/react-router";
import StaffProfilePage from "#/pages/admin/staff/StaffProfilePage";

export const Route = createFileRoute("/admin/staff/$id")({
  component: StaffProfilePage,
});
