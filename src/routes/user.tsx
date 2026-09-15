import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { PageShell } from "#/templates/modern/components/layout/PageShell";

export const Route = createFileRoute("/user")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageShell>
      <Outlet />
    </PageShell>
  );
}