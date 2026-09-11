import { createFileRoute } from "@tanstack/react-router";
import SettingsPage from "#/pages/admin/settings/SettingsPage";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});
