import { createFileRoute } from "@tanstack/react-router";
import EventsPage from "#/pages/admin/events/EventsPage";

export const Route = createFileRoute("/admin/events")({
  component: EventsPage,
});
