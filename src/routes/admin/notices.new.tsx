import { createFileRoute } from "@tanstack/react-router";
import NoticeEditorPage from "#/pages/admin/notices/NoticeEditorPage";

export const Route = createFileRoute("/admin/notices/new")({
  component: NoticeEditorPage,
});
