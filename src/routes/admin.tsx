import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "#/components/layout/AdminShell";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminShell,
  beforeLoad: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
  },
});