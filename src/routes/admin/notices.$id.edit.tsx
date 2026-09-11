import { createFileRoute } from "@tanstack/react-router";
import NoticeEditorPage from "#/pages/admin/notices/NoticeEditorPage";

export const Route = createFileRoute("/admin/notices/$id/edit")({
  component: NoticeEditorPage,
});
