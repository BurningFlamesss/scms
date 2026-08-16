import { createFileRoute } from "@tanstack/react-router";
import { useSchoolConfig } from "#/packages/school/hook.tsx";
import Header from "#/templates/modern/Header.tsx";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const config = useSchoolConfig();

	return (
		<main>
			<Header />
		</main>
	);
}
