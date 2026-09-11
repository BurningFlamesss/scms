import type { ApplicationStatus } from "@/types";

export interface PipelineStage {
  status: ApplicationStatus;
  label: string;
  hint: string;
  /** Left accent rail for the column header. */
  rail: string;
  tint: string;
}

/**
 * The admissions pipeline, left to right. `converted` is terminal and can only
 * be reached through the convert-to-student flow (it needs a class placement),
 * so dropping a card there opens that dialog instead of setting the status.
 */
export const PIPELINE: PipelineStage[] = [
  {
    status: "pending",
    label: "Applied",
    hint: "Awaiting review",
    rail: "bg-muted-foreground",
    tint: "bg-muted-foreground/12",
  },
  {
    status: "waitlisted",
    label: "Waitlisted",
    hint: "Held for a seat",
    rail: "bg-accent",
    tint: "bg-accent/12",
  },
  {
    status: "accepted",
    label: "Offer made",
    hint: "Seat offered",
    rail: "bg-success",
    tint: "bg-success/12",
  },
  {
    status: "converted",
    label: "Enrolled",
    hint: "Now a student",
    rail: "bg-primary",
    tint: "bg-primary/12",
  },
  {
    status: "rejected",
    label: "Declined",
    hint: "Not proceeding",
    rail: "bg-destructive",
    tint: "bg-destructive/12",
  },
];

export const SOURCE_LABEL: Record<string, string> = {
  website: "Website",
  walk_in: "Walk-in",
  referral: "Referral",
  agent: "Agent",
};

export function scoreTone(score?: number): string {
  if (score === undefined) return "text-muted-foreground";
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}
