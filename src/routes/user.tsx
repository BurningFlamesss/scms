import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import Sidebar from "#/templates/modern/Sidebar.tsx";

export const Route = createFileRoute("/user")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Sidebar />
      <Outlet />
    </>
  );
}
