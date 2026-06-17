import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const clientEnv = createEnv({
	clientPrefix: "VITE_",

	client: {
		VITE_APP_TITLE: z.string().min(1).optional(),
		VITE_APP_URL: z.string()
	},

	runtimeEnv: import.meta.env,
	emptyStringAsUndefined: true,

	onValidationError(issues) {
		console.error("Invalid Environment Variable");
		issues.map((issue) =>
			console.error(`  ${issue.path?.join(".")}: ${issue.message}`),
		);
		process.exit(1);
	},
});
