import { CheckCircle2, Clock3, FileCheck2, XCircle, type LucideIcon } from "lucide-react";
import type { AttendanceState } from "@/types";

export interface AttendanceStateMeta {
  value: AttendanceState;
  label: string;
  short: string;
  icon: LucideIcon;
  /** Chip styling when this state is the active choice. */
  active: string;
  dot: string;
  text: string;
  soft: string;
}

export const ATTENDANCE_STATES: AttendanceStateMeta[] = [
  {
    value: "present",
    label: "Present",
    short: "P",
    icon: CheckCircle2,
    active: "bg-success text-success-foreground",
    dot: "bg-success",
    text: "text-success",
    soft: "bg-success/12 text-success",
  },
  {
    value: "absent",
    label: "Absent",
    short: "A",
    icon: XCircle,
    active: "bg-destructive text-destructive-foreground",
    dot: "bg-destructive",
    text: "text-destructive",
    soft: "bg-destructive/12 text-destructive",
  },
  {
    value: "late",
    label: "Late",
    short: "L",
    icon: Clock3,
    active: "bg-accent text-accent-foreground",
    dot: "bg-accent",
    text: "text-accent",
    soft: "bg-accent/14 text-accent",
  },
  {
    value: "excused",
    label: "Excused",
    short: "E",
    icon: FileCheck2,
    active: "bg-info text-info-foreground",
    dot: "bg-info",
    text: "text-info",
    soft: "bg-info/12 text-info",
  },
];

export const STATE_META = ATTENDANCE_STATES.reduce(
  (acc, meta) => ({ ...acc, [meta.value]: meta }),
  {} as Record<AttendanceState, AttendanceStateMeta>,
);

export function rateTone(rate: number): string {
  if (rate >= 92) return "text-success";
  if (rate >= 82) return "text-warning";
  return "text-destructive";
}

export function rateBar(rate: number): string {
  if (rate >= 92) return "bg-success";
  if (rate >= 82) return "bg-warning";
  return "bg-destructive";
}
