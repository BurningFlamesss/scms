import type { FieldMapping, NormalizedRow } from "./types";

export function normalizeRows(
	headers: Array<string>,
	rows: Array<Array<string>>,
	mapping: FieldMapping,
): Array<NormalizedRow> {
	const reverseMap = new Map<string, string>();

	for (const [internalKey, csvColumn] of Object.entries(mapping)) {
		reverseMap.set(csvColumn, internalKey);
	}

	return rows.map((row, index) => {
		const object: NormalizedRow = { __rowIndex: index } as NormalizedRow;

		headers.forEach((header, col) => {
			const internalKey = reverseMap.get(header);

			if (internalKey) {
				let value: string | null = (row[col] ?? "").trim();

				if (value === "") {
					value = null;
				} else {
					value = value.replace(/[\u200B-\u200D\uFEFF]/g, "");

					if (internalKey === "email") {
						value = value.toLowerCase();
					}
				}
				object[internalKey] = value;
			}
		});

		return object;
	});
}
