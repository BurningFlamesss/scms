import { createFileRoute } from "@tanstack/react-router";
import Contact from "#/templates/modern/Contact.tsx";

export const Route = createFileRoute("/contact")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Contact />;
}
