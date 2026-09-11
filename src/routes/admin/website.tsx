import { createFileRoute } from "@tanstack/react-router";
import WebsiteContentPage from "#/pages/admin/website/WebsiteContentPage";

export const Route = createFileRoute("/admin/website")({
  component: WebsiteContentPage,
});
