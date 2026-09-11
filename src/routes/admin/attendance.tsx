import { createFileRoute } from "@tanstack/react-router";
import AttendancePage from "#/pages/admin/attendance/AttendancePage";

export const Route = createFileRoute("/admin/attendance")({
  component: AttendancePage,
});
