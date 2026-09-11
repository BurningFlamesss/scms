import { createFileRoute } from "@tanstack/react-router";
import CourseDetailPage from "#/pages/admin/courses/CourseDetailPage";

export const Route = createFileRoute("/admin/courses/$id")({
  component: CourseDetailPage,
});
