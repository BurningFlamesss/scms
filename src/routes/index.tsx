import { createFileRoute } from "@tanstack/react-router";
import { useSchoolConfig } from "#/packages/school/hook.tsx";
import Sidebar from "#/templates/modern/Sidebar.tsx";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const config = useSchoolConfig();

	return (
		<main>
			<Sidebar />
		</main>
	);
}
