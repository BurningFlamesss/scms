import { createFileRoute } from "@tanstack/react-router";
import { useSchoolConfig } from "#/packages/school/hook.tsx";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const config = useSchoolConfig();
	return <div>{config?.organization.name}ff</div>;
}
