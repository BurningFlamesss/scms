import { createFileRoute } from "@tanstack/react-router";
import StaffPage from "#/pages/admin/staff/StaffPage";

export const Route = createFileRoute("/admin/staff")({
  component: StaffPage,
});
