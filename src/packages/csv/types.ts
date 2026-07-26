import type { PrismaClient } from "@prisma/client/extension";
import type { z } from "zod";

export interface ImportError {
	row?: number;
	field?: string;
	code: string;
	message: string;
}

export interface ImportWarning {
	row?: number;
	field?: string;
	code: string;
	message: string;
}

export interface PreviewRow<T = Record<string, unknown>> {
	rowNumber: number;
	raw: Record<string, string>;
	normalized: Record<string, unknown>;
	status: "READY" | "ERROR" | "WARNING";
	errors: Array<ImportError>;
	warnings: Array<ImportWarning>;
	validated?: T;
}

export interface ImportPreview<T = Record<string, unknown>> {
	summary: {
		totalRows: number;
		readyRows: number;
		errorRows: number;
		warningRows: number;
	};
	rows: Array<PreviewRow<T>>;
}

export type FieldMapping = Record<string, string>;

export interface ImportConfig<T = any> {
	name: string;
	schema: z.ZodType<T>;
	fieldSuggestions: Record<string, Array<string>>;
	requiredFields: Array<string>;
	optionalFields: Array<string>;
	businessRules?: (
		rows: Array<NormalizedRow>,
		prisma: PrismaClient,
		context: ImportContext,
	) => Promise<Array<ImportError>>;
	warningRules?: (rows: Array<NormalizedRow>) => Array<ImportWarning>;
}

export type NormalizedRow = Record<string, string | null> & {
	__rowIndex: number;
};

export interface ImportContext {
	orgId: string;
	branchId: string;
}
