import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),

		APP_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(1),

		SUPER_ADMIN_EMAIL: z.string().min(1),
		SUPER_ADMIN_NAME: z.string().min(1),

		ORGANIZATION_NAME: z.string().min(1),
		ORGANIZATION_SLUG: z.string().min(1),

		DEFAULT_BRANCH_NAME: z.string().min(1),
		DEFAULT_BRANCH_SLUG: z.string().min(1),

		MAIL_APP_USER: z.string(),
		MAIL_APP_PASSWORD: z.string()
	},

	runtimeEnv: process.env,
	emptyStringAsUndefined: true,

	onValidationError(issues) {
		console.error("Invalid Environment Variable");
		issues.map((issue) =>
			console.error(`  ${issue.path?.join(".")}: ${issue.message}`),
		);
		process.exit(1);
	},
});
