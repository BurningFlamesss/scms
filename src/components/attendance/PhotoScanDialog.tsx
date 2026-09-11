import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  RotateCcw,
  ScanLine,
  ShieldAlert,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import type { AttendanceState } from "#/types";
import {
  SCAN_REVIEW_THRESHOLD,
  scanAttendancePhoto,
  type ScanDetection,
  type ScanResult,
} from "#/services/attendanceScan";
import { PersonCell } from "#/components/common/PersonCell";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Progress } from "#/components/ui/progress";
import { ScrollArea } from "#/components/ui/scroll-area";
import { fileToDataUrl, STOCK_LIBRARY } from "#/lib/image";
import { formatDate } from "#/lib/format";
import { cn } from "#/lib/utils";

interface PhotoScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  date: string;
  onApply: (states: Record<string, AttendanceState>, absentCount: number) => void;
}

/**
 * Photo-assisted register. The recognition pass is SIMULATED (see
 * `services/attendanceScan.ts`) and never writes attendance on its own — the
 * proposal always has to be confirmed by a human first.
 */
export function PhotoScanDialog({
  open,
  onOpenChange,
  classId,
  className,
  date,
  onApply,
}: PhotoScanDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | undefined>();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [reading, setReading] = useState(false);

  const scan = useMutation({
    mutationFn: (dataUrl: string) => scanAttendancePhoto(classId, date, dataUrl),
    onSuccess: (next) => {
      setProgress(100);
      setResult(next);
      setConfirmed(next.proposedAbsent.map((d) => d.student.id));
    },
    onError: (error: Error) => {
      setProgress(0);
      toast.error(error.message);
    },
  });

  // Drive the fake inference progress bar while the mock service resolves.
  useEffect(() => {
    if (!scan.isPending) return;
    setProgress(8);
    const timer = window.setInterval(() => {
      setProgress((value) => (value >= 92 ? 92 : value + 7));
    }, 120);
    return () => window.clearInterval(timer);
  }, [scan.isPending]);

  const reset = () => {
    setImage(undefined);
    setResult(null);
    setConfirmed([]);
    setProgress(0);
    scan.reset();
  };

  const pickFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPG or WebP).");
      return;
    }
    setReading(true);
    try {
      const dataUrl = await fileToDataUrl(file, 1400, 0.75);
      setImage(dataUrl);
      setResult(null);
      scan.mutate(dataUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read that photo");
    } finally {
      setReading(false);
    }
  };

  const applySample = (url: string) => {
    setImage(url);
    setResult(null);
    scan.mutate(url);
  };

  const toggle = (id: string) => {
    setConfirmed((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const apply = () => {
    if (!result) return;
    const states: Record<string, AttendanceState> = {};
    result.detections.forEach((detection) => {
      states[detection.student.id] = confirmed.includes(detection.student.id) ? "absent" : "present";
    });
    onApply(states, confirmed.length);
    onOpenChange(false);
    reset();
  };

  const scanning = scan.isPending || reading;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-hairline bg-popover sm:max-w-3xl"
        data-testid="attendance-scan-dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <ScanLine className="h-4 w-4 text-primary" /> Photo register — {className}
          </DialogTitle>
          <DialogDescription>
            Upload a class photo for {formatDate(date)}. We propose who looks absent; nothing is saved until you
            confirm and submit the register.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-accent/35 bg-accent/[0.07]" data-testid="attendance-scan-disclaimer">
          <ShieldAlert className="h-4 w-4 text-accent" />
          <AlertTitle className="text-sm">Simulated recognition (demo)</AlertTitle>
          <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
            No face data leaves this browser and no real model runs yet. The proposal below is generated
            deterministically from your photo so you can validate the review-and-confirm workflow that a real scan
            will use.
          </AlertDescription>
        </Alert>

        {!image && (
          <div className="space-y-3" data-testid="attendance-scan-upload-step">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void pickFile(event.dataTransfer.files);
              }}
              data-testid="attendance-scan-dropzone"
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline bg-surface-2 px-6 py-10 text-center transition-colors hover:border-primary/45 focus-ring"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-surface-1">
                <Camera className="h-5 w-5 text-muted-foreground" />
              </span>
              <span className="text-sm font-medium text-foreground">Drop a class photo or click to browse</span>
              <span className="text-xs text-muted-foreground">
                One wide shot of the room works best · PNG, JPG or WebP
              </span>
            </button>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Or try a sample photo</p>
              <div className="grid grid-cols-4 gap-2">
                {STOCK_LIBRARY.slice(0, 4).map((item) => (
                  <button
                    key={item.url}
                    type="button"
                    title={item.label}
                    data-testid="attendance-scan-sample"
                    onClick={() => applySample(item.url)}
                    className="overflow-hidden rounded-lg border border-hairline transition-transform duration-150 hover:scale-[1.02] focus-ring"
                  >
                    <img src={item.url} alt={item.label} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {image && (
          <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
            <div className="space-y-2">
              <div className="overflow-hidden rounded-xl border border-hairline">
                <img src={image} alt="Class photo being scanned" className="aspect-[4/3] w-full object-cover" />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                data-testid="attendance-scan-reset"
                onClick={reset}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Use a different photo
              </Button>
            </div>

            <div className="min-w-0">
              {scanning || !result ? (
                <div className="flex h-full flex-col justify-center gap-3 rounded-xl border border-hairline bg-surface-2 p-5" data-testid="attendance-scan-progress">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Scanning the frame…
                  </div>
                  <Progress value={progress} className="h-1.5" />
                  <p className="num text-xs text-muted-foreground">
                    {progress < 40
                      ? "Isolating faces"
                      : progress < 75
                        ? "Matching against the class roster"
                        : "Scoring confidence"}{" "}
                    · {progress}%
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5" data-testid="attendance-scan-review">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <ScanStat label="On roster" value={String(result.rosterSize)} testId="scan-stat-roster" />
                    <ScanStat label="Faces found" value={String(result.facesFound)} testId="scan-stat-faces" />
                    <ScanStat
                      label="Proposed absent"
                      value={String(result.proposedAbsent.length)}
                      tone="text-destructive"
                      testId="scan-stat-absent"
                    />
                    <ScanStat
                      label="Avg confidence"
                      value={`${Math.round(result.averageConfidence * 100)}%`}
                      testId="scan-stat-confidence"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="eyebrow-label">Confirm who was absent</p>
                      <button
                        type="button"
                        className="text-xs text-primary underline-offset-2 hover:underline"
                        data-testid="attendance-scan-toggle-all"
                        onClick={() =>
                          setConfirmed(
                            confirmed.length === result.proposedAbsent.length
                              ? []
                              : result.proposedAbsent.map((d) => d.student.id),
                          )
                        }
                      >
                        {confirmed.length === result.proposedAbsent.length ? "Clear all" : "Select all"}
                      </button>
                    </div>
                    <ScrollArea className="h-[220px] rounded-xl border border-hairline">
                      <ul className="divide-y divide-hairline">
                        {result.proposedAbsent.map((detection) => (
                          <li
                            key={detection.student.id}
                            className="flex items-center gap-3 px-3 py-2.5"
                            data-testid={`attendance-scan-candidate-${detection.student.id}`}
                          >
                            <Checkbox
                              checked={confirmed.includes(detection.student.id)}
                              onCheckedChange={() => toggle(detection.student.id)}
                              aria-label={`Mark ${detection.student.firstName} absent`}
                              data-testid={`attendance-scan-check-${detection.student.id}`}
                            />
                            <div className="min-w-0 flex-1">
                              <PersonCell
                                name={`${detection.student.firstName} ${detection.student.lastName}`}
                                subtitle={`Roll ${detection.student.rollNo} · ${detection.reason}`}
                                avatarUrl={detection.student.avatarUrl}
                                size="sm"
                              />
                            </div>
                            <ConfidencePill confidence={detection.confidence} />
                          </li>
                        ))}
                        {result.proposedAbsent.length === 0 && (
                          <li className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-success" /> Everyone on the roster was matched in
                            the frame.
                          </li>
                        )}
                      </ul>
                    </ScrollArea>
                  </div>

                  {result.needsReview.length > 0 && (
                    <div
                      className="rounded-xl border border-warning/35 bg-warning/[0.07] px-3 py-2.5"
                      data-testid="attendance-scan-needs-review"
                    >
                      <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <UserX className="h-3.5 w-3.5 text-warning" />
                        {result.needsReview.length} match{result.needsReview.length === 1 ? "" : "es"} scored below{" "}
                        {Math.round(SCAN_REVIEW_THRESHOLD * 100)}% — double-check these faces
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {result.needsReview
                          .slice(0, 6)
                          .map((d) => `${d.student.firstName} ${d.student.lastName}`)
                          .join(" · ")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
            data-testid="attendance-scan-cancel"
          >
            Cancel
          </Button>
          <Button
            className="gap-1.5"
            disabled={!result || scanning}
            data-testid="attendance-scan-apply"
            onClick={apply}
          >
            <ImagePlus className="h-3.5 w-3.5" />
            {result
              ? `Apply to register (${confirmed.length} absent)`
              : "Apply to register"}
          </Button>
        </DialogFooter>
      </DialogContent>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        data-testid="attendance-scan-file-input"
        onChange={(event) => void pickFile(event.target.files)}
      />
    </Dialog>
  );
}

function ScanStat({
  label,
  value,
  tone,
  testId,
}: {
  label: string;
  value: string;
  tone?: string;
  testId: string;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-1 px-2.5 py-2" data-testid={testId}>
      <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("num mt-0.5 font-display text-base font-semibold leading-none", tone ?? "text-foreground")}>
        {value}
      </p>
    </div>
  );
}

function ConfidencePill({ confidence }: { confidence: ScanDetection["confidence"] }) {
  const low = confidence < SCAN_REVIEW_THRESHOLD;
  return (
    <span
      className={cn(
        "num shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        low ? "bg-warning/18 text-warning" : "bg-muted text-muted-foreground",
      )}
    >
      {Math.round(confidence * 100)}%
    </span>
  );
}
