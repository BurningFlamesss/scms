import { createFileRoute } from "@tanstack/react-router";
import InvoiceDetailPage from "#/pages/admin/payments/InvoiceDetailPage";

export const Route = createFileRoute("/admin/payments/$id")({
  component: InvoiceDetailPage,
});
