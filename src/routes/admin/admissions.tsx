import { createFileRoute } from "@tanstack/react-router";
import AdmissionsPage from "#/pages/admin/admissions/AdmissionsPage";

export const Route = createFileRoute("/admin/admissions")({
  component: AdmissionsPage,
});
