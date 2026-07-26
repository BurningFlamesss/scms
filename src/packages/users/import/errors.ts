export class ImportPipelineError extends Error {
	constructor(
		message: string,
		public readonly code: string,
	) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class CSVParseError extends ImportPipelineError {
	constructor(message: string, line?: number) {
		super(message, "CSV_PARSE");
		this.line = line;
	}
	public readonly line?: number;
}
