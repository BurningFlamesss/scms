import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { findDuplicateStudents, importStudents, type StudentImportRow } from "#/services/students";
import { db } from "#/lib/db";
import { useAuth } from "#/providers/AuthProvider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "#/components/ui/dialog";
import { Button } from "#/components/ui/button";
import { Progress } from "#/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { downloadTextFile, toCsv } from "#/lib/format";
import { cn } from "#/lib/utils";

type StepKey = "upload" | "inspect" | "map" | "validate" | "preview" | "results";

const STEPS: { key: StepKey; label: string; hint: string }[] = [
  { key: "upload", label: "Upload", hint: "Choose a CSV file" },
  { key: "inspect", label: "Inspect", hint: "Check what we detected" },
  { key: "map", label: "Map fields", hint: "Match columns to fields" },
  { key: "validate", label: "Validate", hint: "Resolve problems" },
  { key: "preview", label: "Preview", hint: "Confirm the final rows" },
  { key: "results", label: "Results", hint: "Import summary" },
];

interface FieldDef {
  key: keyof StudentImportRow;
  label: string;
  required: boolean;
  aliases: string[];
}

const FIELDS: FieldDef[] = [
  { key: "firstName", label: "First name", required: true, aliases: ["first name", "firstname", "given name", "first"] },
  { key: "lastName", label: "Last name", required: true, aliases: ["last name", "lastname", "surname", "family name"] },
  { key: "grade", label: "Grade", required: true, aliases: ["grade", "class", "year", "standard"] },
  { key: "section", label: "Section", required: true, aliases: ["section", "division", "stream"] },
  { key: "guardianName", label: "Guardian name", required: true, aliases: ["guardian", "guardian name", "parent", "parent name"] },
  { key: "guardianPhone", label: "Guardian phone", required: true, aliases: ["guardian phone", "phone", "contact", "mobile"] },
  { key: "guardianEmail", label: "Guardian email", required: false, aliases: ["guardian email", "email", "parent email"] },
  { key: "gender", label: "Gender", required: false, aliases: ["gender", "sex"] },
  { key: "dateOfBirth", label: "Date of birth", required: false, aliases: ["date of birth", "dob", "birth date"] },
];

const SAMPLE_CSV = `First Name,Last Name,Grade,Section,Gender,Date of Birth,Guardian Name,Guardian Phone,Guardian Email
Noor,Hassan,Grade 7,A,female,2013-04-11,Samir Hassan,+1 (555) 233-9100,samir.hassan@familymail.com
Elias,Duarte,Grade 9,B,male,2011-09-02,Maria Duarte,+1 (555) 233-9111,maria.duarte@familymail.com
Ivy,Kimura,Grade 6,C,female,2014-01-23,Ken Kimura,+1 (555) 233-9122,ken.kimura@familymail.com`;

interface CsvImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: () => void;
}

export function CsvImportWizard({ open, onOpenChange, onImported }: CsvImportWizardProps) {
  const { actor } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<StepKey>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);

  const reset = () => {
    setStep("upload");
    setFileName("");
    setHeaders([]);
    setRawRows([]);
    setMapping({});
    setProgress(0);
    setResult(null);
  };

  const autoMap = (columns: string[]) => {
    const next: Record<string, string> = {};
    FIELDS.forEach((field) => {
      const match = columns.find((column) => {
        const normalised = column.trim().toLowerCase();
        return normalised === field.key.toLowerCase() || field.aliases.includes(normalised);
      });
      if (match) next[field.key] = match;
    });
    return next;
  };

  const parseFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please choose a .csv file");
      return;
    }
    setParsing(true);
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (output) => {
        const columns = (output.meta.fields ?? []).filter(Boolean);
        setHeaders(columns);
        setRawRows(output.data.filter((row) => Object.values(row).some((v) => String(v ?? "").trim())));
        setMapping(autoMap(columns));
        setParsing(false);
        setStep("inspect");
      },
      error: () => {
        setParsing(false);
        toast.error("That file could not be parsed");
      },
    });
  };

  const mappedRows = useMemo<StudentImportRow[]>(
    () =>
      rawRows.map((row) => {
        const output: Record<string, string> = {};
        FIELDS.forEach((field) => {
          const column = mapping[field.key];
          output[field.key] = column ? String(row[column] ?? "").trim() : "";
        });
        return output as unknown as StudentImportRow;
      }),
    [rawRows, mapping],
  );

  const knownGrades = useMemo(() => Array.from(new Set(db().classes.map((c) => c.grade))), []);
  const knownSections = useMemo(() => Array.from(new Set(db().classes.map((c) => c.section))), []);

  const validation = useMemo(() => {
    const duplicates = findDuplicateStudents(mappedRows);
    const issues = mappedRows.map((row, index) => {
      const problems: string[] = [];
      FIELDS.filter((f) => f.required).forEach((field) => {
        if (!String(row[field.key] ?? "").trim()) problems.push(`${field.label} is missing`);
      });
      if (row.grade && !knownGrades.includes(row.grade)) problems.push(`Unknown grade “${row.grade}”`);
      if (row.section && !knownSections.includes(row.section)) problems.push(`Unknown section “${row.section}”`);
      const duplicate = duplicates.has(index);
      return { index, row, problems, duplicate };
    });
    return {
      issues,
      invalid: issues.filter((i) => i.problems.length > 0),
      duplicates: issues.filter((i) => i.duplicate && i.problems.length === 0),
      valid: issues.filter((i) => i.problems.length === 0 && !i.duplicate),
    };
  }, [mappedRows, knownGrades, knownSections]);

  const missingRequired = FIELDS.filter((f) => f.required && !mapping[f.key]);

  const importMutation = useMutation({
    mutationFn: async () => {
      setProgress(15);
      const rows = validation.valid.map((entry) => entry.row);
      const timer = window.setInterval(() => setProgress((p) => Math.min(92, p + 12)), 120);
      try {
        return await importStudents(rows, actor);
      } finally {
        window.clearInterval(timer);
        setProgress(100);
      }
    },
    onSuccess: (outcome) => {
      setResult(outcome);
      setStep("results");
      onImported?.();
      toast.success(`${outcome.created} students imported`);
    },
    onError: () => toast.error("The import could not be completed"),
  });

  const downloadErrorReport = () => {
    const rows = [
      ...validation.invalid.map((entry) => ({
        row: entry.index + 2,
        firstName: entry.row.firstName,
        lastName: entry.row.lastName,
        grade: entry.row.grade,
        section: entry.row.section,
        issue: entry.problems.join("; "),
      })),
      ...validation.duplicates.map((entry) => ({
        row: entry.index + 2,
        firstName: entry.row.firstName,
        lastName: entry.row.lastName,
        grade: entry.row.grade,
        section: entry.row.section,
        issue: "Possible duplicate of an existing student",
      })),
    ];
    if (!rows.length) {
      toast.info("There are no failed rows to report");
      return;
    }
    downloadTextFile("student-import-errors.csv", toCsv(rows));
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const canContinue =
    (step === "inspect" && rawRows.length > 0) ||
    (step === "map" && missingRequired.length === 0) ||
    step === "validate" ||
    step === "preview";

  const goNext = () => {
    if (step === "inspect") setStep("map");
    else if (step === "map") setStep("validate");
    else if (step === "validate") setStep("preview");
    else if (step === "preview") importMutation.mutate();
  };

  const goBack = () => {
    const order: StepKey[] = ["upload", "inspect", "map", "validate", "preview"];
    const index = order.indexOf(step);
    if (index > 0) setStep(order[index - 1]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent
        className="max-h-[92vh] max-w-4xl overflow-hidden bg-popover p-0"
        data-testid="csv-import-wizard"
      >
        <div className="grid max-h-[92vh] grid-cols-1 sm:grid-cols-[220px_1fr]">
          <aside className="hidden border-r border-hairline bg-surface-2 p-5 sm:block">
            <DialogTitle className="font-display text-sm font-semibold">Import students</DialogTitle>
            <DialogDescription className="mt-1 text-xs">
              Bulk onboarding from a spreadsheet export.
            </DialogDescription>
            <ol className="mt-5 space-y-3">
              {STEPS.map((item, index) => {
                const active = item.key === step;
                const done = index < stepIndex;
                return (
                  <li key={item.key} className="flex gap-2.5">
                    <span
                      className={cn(
                        "num mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-semibold",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : done
                            ? "border-success bg-success/15 text-success"
                            : "border-hairline bg-surface-1 text-muted-foreground",
                      )}
                    >
                      {done ? "✓" : index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block text-xs font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                        {item.label}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">{item.hint}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </aside>

          <div className="flex max-h-[92vh] min-w-0 flex-col">
            <header className="border-b border-hairline px-5 py-3.5">
              <p className="eyebrow-label">
                Step {stepIndex + 1} of {STEPS.length}
              </p>
              <h3 className="font-display text-sm font-semibold text-foreground">{STEPS[stepIndex].label}</h3>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {step === "upload" && (
                <div>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) parseFile(file);
                    }}
                    data-testid="csv-dropzone"
                    className={cn(
                      "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center transition-colors focus-ring",
                      dragging ? "border-primary bg-primary/5" : "border-hairline bg-surface-2 hover:border-primary/40",
                    )}
                  >
                    {parsing ? (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                      <UploadCloud className="h-6 w-6 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-foreground">Drop your CSV here, or click to browse</span>
                    <span className="text-xs text-muted-foreground">
                      One student per row · first row must contain column headers
                    </span>
                  </button>

                  <div className="mt-4 rounded-lg border border-hairline bg-surface-2 p-3">
                    <p className="text-xs font-medium text-foreground">Not sure about the format?</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Download the sample file, fill it in, then upload it here. Required columns: first name, last
                      name, grade, section, guardian name and guardian phone.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2.5 gap-1.5 text-xs"
                      data-testid="csv-download-sample"
                      onClick={() => downloadTextFile("northfield-student-import-sample.csv", SAMPLE_CSV)}
                    >
                      <Download className="h-3.5 w-3.5" /> Download sample CSV
                    </Button>
                  </div>
                </div>
              )}

              {step === "inspect" && (
                <div>
                  <div className="mb-3 flex items-center gap-3 rounded-lg border border-hairline bg-surface-2 p-3">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
                      <p className="num text-xs text-muted-foreground" data-testid="csv-detected-summary">
                        {rawRows.length} data rows · {headers.length} columns detected
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-hairline">
                    <table className="w-full text-xs">
                      <thead className="bg-surface-2">
                        <tr>
                          {headers.map((header) => (
                            <th key={header} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-muted-foreground">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline">
                        {rawRows.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            {headers.map((header) => (
                              <td key={header} className="whitespace-nowrap px-3 py-1.5 text-foreground">
                                {row[header]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">Showing the first 5 rows of the file.</p>
                </div>
              )}

              {step === "map" && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    We matched what we could automatically. Confirm each field below — required fields are marked.
                  </p>
                  {FIELDS.map((field) => (
                    <div
                      key={field.key}
                      className="flex flex-col gap-2 rounded-lg border border-hairline bg-surface-1 p-2.5 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">
                          {field.label}
                          {field.required && <span className="ml-1 text-destructive">*</span>}
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground">{field.key}</p>
                      </div>
                      <Select
                        value={mapping[field.key] ?? "__none"}
                        onValueChange={(value: string) =>
                          setMapping((prev) => {
                            const next = { ...prev };
                            if (value === "__none") delete next[field.key];
                            else next[field.key] = value;
                            return next;
                          })
                        }
                      >
                        <SelectTrigger className="w-full sm:w-[240px]" data-testid={`csv-map-${field.key}`}>
                          <SelectValue placeholder="Not mapped" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="__none">Not mapped</SelectItem>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  {missingRequired.length > 0 && (
                    <p className="flex items-center gap-1.5 text-xs text-destructive" data-testid="csv-map-warning">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Map {missingRequired.map((f) => f.label).join(", ")} to continue.
                    </p>
                  )}
                </div>
              )}

              {step === "validate" && (
                <div>
                  <div className="grid grid-cols-3 gap-2">
                    <SummaryTile label="Ready to import" value={validation.valid.length} tone="success" testId="csv-valid-count" />
                    <SummaryTile label="Possible duplicates" value={validation.duplicates.length} tone="accent" testId="csv-duplicate-count" />
                    <SummaryTile label="Rows with errors" value={validation.invalid.length} tone="danger" testId="csv-invalid-count" />
                  </div>

                  {validation.invalid.length === 0 && validation.duplicates.length === 0 ? (
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/8 p-3 text-xs text-success">
                      <CheckCircle2 className="h-4 w-4" /> Every row passed validation.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-1.5">
                      {[...validation.invalid, ...validation.duplicates].slice(0, 12).map((entry) => (
                        <div
                          key={entry.index}
                          className="flex items-start gap-2.5 rounded-lg border border-hairline bg-surface-1 p-2.5"
                          data-testid="csv-validation-issue"
                        >
                          {entry.problems.length ? (
                            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                          ) : (
                            <Copy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground">
                              Row {entry.index + 2} · {entry.row.firstName || "—"} {entry.row.lastName || ""}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {entry.problems.length
                                ? entry.problems.join(" · ")
                                : "Looks like an existing student — it will be skipped"}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-1 gap-1.5 text-xs"
                        data-testid="csv-download-errors"
                        onClick={downloadErrorReport}
                      >
                        <Download className="h-3.5 w-3.5" /> Download error report
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {step === "preview" && (
                <div>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {validation.valid.length} students will be created. Duplicate and invalid rows are excluded.
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-hairline">
                    <table className="w-full text-xs">
                      <thead className="bg-surface-2">
                        <tr>
                          {["Name", "Grade", "Section", "Guardian", "Phone"].map((header) => (
                            <th key={header} className="px-3 py-2 text-left font-semibold text-muted-foreground">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline">
                        {validation.valid.slice(0, 20).map((entry) => (
                          <tr key={entry.index} data-testid="csv-preview-row">
                            <td className="px-3 py-1.5 text-foreground">
                              {entry.row.firstName} {entry.row.lastName}
                            </td>
                            <td className="px-3 py-1.5 text-muted-foreground">{entry.row.grade}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">{entry.row.section}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">{entry.row.guardianName}</td>
                            <td className="num px-3 py-1.5 text-muted-foreground">{entry.row.guardianPhone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importMutation.isPending && (
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Importing students…</span>
                        <span className="num">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  )}
                </div>
              )}

              {step === "results" && result && (
                <div data-testid="csv-results">
                  <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/8 p-4">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Import complete</p>
                      <p className="num text-xs text-muted-foreground">
                        {result.created} students created · {validation.invalid.length + validation.duplicates.length}{" "}
                        rows skipped
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <SummaryTile label="Created" value={result.created} tone="success" testId="csv-result-created" />
                    <SummaryTile label="Duplicates skipped" value={validation.duplicates.length} tone="accent" />
                    <SummaryTile label="Errors" value={validation.invalid.length} tone="danger" />
                  </div>
                  {(validation.invalid.length > 0 || validation.duplicates.length > 0) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-1.5 text-xs"
                      data-testid="csv-results-download-errors"
                      onClick={downloadErrorReport}
                    >
                      <Download className="h-3.5 w-3.5" /> Download error report
                    </Button>
                  )}
                </div>
              )}
            </div>

            <footer className="flex items-center justify-between gap-2 border-t border-hairline px-5 py-3">
              {step === "results" ? (
                <>
                  <Button variant="outline" size="sm" onClick={reset} data-testid="csv-import-another">
                    Import another file
                  </Button>
                  <Button size="sm" onClick={() => onOpenChange(false)} data-testid="csv-import-done">
                    Done
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    disabled={step === "upload"}
                    onClick={goBack}
                    data-testid="csv-back"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    disabled={!canContinue || importMutation.isPending || (step === "preview" && validation.valid.length === 0)}
                    onClick={goNext}
                    data-testid="csv-next"
                  >
                    {importMutation.isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Importing…
                      </>
                    ) : step === "preview" ? (
                      <>Import {validation.valid.length} students</>
                    ) : (
                      <>
                        Continue <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </footer>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          data-testid="csv-file-input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) parseFile(file);
            e.target.value = "";
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function SummaryTile({
  label,
  value,
  tone,
  testId,
}: {
  label: string;
  value: number;
  tone: "success" | "accent" | "danger";
  testId?: string;
}) {
  const toneClass = {
    success: "text-success",
    accent: "text-accent",
    danger: "text-destructive",
  }[tone];
  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("num mt-0.5 text-lg font-semibold", toneClass)} data-testid={testId}>
        {value}
      </p>
    </div>
  );
}
