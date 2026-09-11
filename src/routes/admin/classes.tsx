import { createFileRoute } from "@tanstack/react-router";
import ClassesPage from "#/pages/admin/classes/ClassesPage";

export const Route = createFileRoute("/admin/classes")({
  component: ClassesPage,
});
