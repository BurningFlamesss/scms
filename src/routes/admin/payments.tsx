import { createFileRoute } from "@tanstack/react-router";
import PaymentsPage from "#/pages/admin/payments/PaymentsPage";

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsPage,
});
