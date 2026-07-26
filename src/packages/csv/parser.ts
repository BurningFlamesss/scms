import Papa from "papaparse";
import { CSVParseError } from "./errors";

export interface ParsedCSV {
	headers: Array<string>;
	rows: Array<Array<string>>;
}

export function parseCSV(csv: string): ParsedCSV {
	const { data, errors } = Papa.parse<Array<string>>(csv, {
		header: false,
		skipEmptyLines: true,
		transform: (val) => val,
	});

	const fatal = errors.filter((error) => error.type === "Quotes");

	if (fatal.length > 0) {
		throw new CSVParseError(
			`CSV parse error: ${fatal[0].message}`,
			fatal[0].row ?? undefined,
		);
	}

	const allRows: Array<Array<string>> = data;
	const headers = allRows.length > 0 ? allRows[0] : [];
	const rows = allRows.slice(1);

	return {
		rows,
		headers,
	};
}
