import { useEffect, useRef } from "react";
import { useSchoolStore } from "#/store/school-store";
import type { SchoolConfig, SchoolContent } from "#/types/school";

interface SchoolProviderProps {
	config: SchoolConfig;
	content: SchoolContent;

	children: React.ReactNode;
}

export function SchoolProvider({
	config,
	content,
	children,
}: SchoolProviderProps) {
	const initialized = useRef(false);

	useEffect(() => {
		if (initialized.current) return;

		useSchoolStore.getState().setSchool(config, content);

		initialized.current = true;
	}, [config, content]);

	return <>{children}</>;
}
