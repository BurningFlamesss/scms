import { createFileRoute } from "@tanstack/react-router";
import TransportationPage from "#/pages/admin/transportation/TransportationPage";

export const Route = createFileRoute("/admin/transportation")({
  component: TransportationPage,
});
