import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { AdminShell } from "#/components/layout/AdminShell";

export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminShell,
  beforeLoad: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
  },
});