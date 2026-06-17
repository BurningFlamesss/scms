import type { SchoolConfig, SchoolContent } from "#/types/school.ts";

const configs = import.meta.glob("../schools/*/config.json", {
	eager: true,
});

export function getSchoolConfig(identifier: string): SchoolConfig {
	const file = configs[`../schools/${identifier}/config.json`] as {
		default: SchoolConfig;
	};

	return file.default;
}

const contents = import.meta.glob("../schools/*/content.json", {
	eager: true,
});

export function getSchoolContent(identifier: string): SchoolContent {
	const file = contents[`../schools/${identifier}/content.json`] as {
		default: SchoolContent;
	};

	return file.default;
}
