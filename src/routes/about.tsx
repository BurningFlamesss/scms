import { createFileRoute } from "@tanstack/react-router";
import About from "#/templates/modern/About.tsx";

export const Route = createFileRoute("/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return <About />;
}
