import type { AttendanceState, Student } from "@/types";
import { db, latency, uid } from "@/lib/db";
import { createRng, intBetween } from "@/lib/rng";

// ---------------------------------------------------------------------------
// MOCKED CLASS-PHOTO ATTENDANCE SCAN
// ---------------------------------------------------------------------------
// There is no real computer vision here. The uploaded photo is hashed into a
// deterministic seed so the same photo + class + date always produces the same
// proposal, which makes the confirmation UX feel like a real recognition pass.
// When a real vision service is wired in later, only this file changes: the UI
// already treats the result as a *proposal that must be confirmed*.
// ---------------------------------------------------------------------------

export interface ScanDetection {
  student: Student;
  /** Was a matching face found in the frame? */
  matched: boolean;
  /** 0–1 model confidence for the proposal. */
  confidence: number;
  proposed: AttendanceState;
  reason: string;
}

export interface ScanResult {
  id: string;
  classId: string;
  className: string;
  date: string;
  imageUrl: string;
  scannedAt: string;
  /** Faces the "model" believes it isolated in the frame. */
  facesFound: number;
  /** Students on the register for this class. */
  rosterSize: number;
  detections: ScanDetection[];
  proposedPresent: ScanDetection[];
  proposedAbsent: ScanDetection[];
  /** Matches under the review threshold — surfaced for manual confirmation. */
  needsReview: ScanDetection[];
  averageConfidence: number;
  durationMs: number;
}

const REVIEW_THRESHOLD = 0.82;

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Cheap, stable fingerprint of a data URL without walking megabytes of base64. */
function fingerprint(imageUrl: string): string {
  const head = imageUrl.slice(0, 96);
  const tail = imageUrl.slice(-96);
  return `${imageUrl.length}:${head}:${tail}`;
}

export async function scanAttendancePhoto(
  classId: string,
  date: string,
  imageUrl: string,
): Promise<ScanResult> {
  const started = Date.now();
  // Simulated inference time — long enough for the progress UI to feel real.
  await latency(1600);

  const cls = db().classes.find((c) => c.id === classId);
  if (!cls) throw new Error("Class not found");

  const roster = db()
    .students.filter((s) => s.classId === classId && s.status === "active")
    .sort((a, b) => a.rollNo - b.rollNo);

  const rng = createRng(hashString(`${classId}|${date}|${fingerprint(imageUrl)}`) || 12345);

  // Between 6% and 18% of the roster reads as absent from the frame.
  const absentTarget = Math.max(1, Math.round(roster.length * (0.06 + rng() * 0.12)));
  const absentIndexes = new Set<number>();
  let guard = 0;
  while (absentIndexes.size < absentTarget && guard < 500) {
    absentIndexes.add(intBetween(rng, 0, Math.max(0, roster.length - 1)));
    guard += 1;
  }

  const detections: ScanDetection[] = roster.map((student, index) => {
    const isAbsent = absentIndexes.has(index);
    const roll = rng();
    if (isAbsent) {
      const confidence = 0.74 + roll * 0.24;
      return {
        student,
        matched: false,
        confidence: Number(confidence.toFixed(2)),
        proposed: "absent" as AttendanceState,
        reason: confidence < REVIEW_THRESHOLD ? "No confident match — please verify" : "No matching face in frame",
      };
    }
    // A small slice of present students land in the seat but partially occluded.
    const occluded = roll < 0.08;
    const confidence = occluded ? 0.66 + roll : 0.88 + roll * 0.11;
    return {
      student,
      matched: true,
      confidence: Number(Math.min(0.99, confidence).toFixed(2)),
      proposed: "present" as AttendanceState,
      reason: occluded ? "Partially occluded — please verify" : "Matched in frame",
    };
  });

  const proposedAbsent = detections.filter((d) => d.proposed === "absent");
  const proposedPresent = detections.filter((d) => d.proposed === "present");

  return {
    id: uid("scan"),
    classId,
    className: cls.name,
    date,
    imageUrl,
    scannedAt: new Date().toISOString(),
    facesFound: proposedPresent.length + (rng() < 0.4 ? 1 : 0),
    rosterSize: roster.length,
    detections,
    proposedPresent,
    proposedAbsent,
    needsReview: detections.filter((d) => d.confidence < REVIEW_THRESHOLD),
    averageConfidence: detections.length
      ? Number((detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length).toFixed(2))
      : 0,
    durationMs: Date.now() - started,
  };
}

export const SCAN_REVIEW_THRESHOLD = REVIEW_THRESHOLD;
