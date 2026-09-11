import { createFileRoute } from "@tanstack/react-router";
import UsersPage from "#/pages/admin/users/UsersPage";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});
