import { createFileRoute } from "@tanstack/react-router";
import Contact from "#/templates/modern/Contact.tsx";
import Sidebar from "#/templates/modern/Sidebar.tsx";

export const Route = createFileRoute("/contact")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Sidebar />
			<Contact />
		</>
	);
}
