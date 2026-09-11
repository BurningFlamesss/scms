/* ------------------------------------------------------------------ *
 * Domain types for the Everest English Boarding Secondary School site.
 * Everything here is frontend-only; content lives in src/content/*.ts
 * ------------------------------------------------------------------ */

/* ---------------------------- Academics --------------------------- */

export type LevelId =
  | "basic"
  | "lower-secondary"
  | "secondary"
  | "plus2-science"
  | "plus2-management";

export interface Level {
  id: LevelId;
  label: string;
  short: string;
  grades: string;
  board: string;
  tagline: string;
  description: string;
  image: string;
}

export type SubjectKind = "Compulsory" | "Optional" | "Elective" | "Co-curricular";

export interface Subject {
  code: string;
  name: string;
  credit: number;
  kind: SubjectKind;
}

export type FeeFrequency = "Annual" | "Monthly" | "One-time" | "Per term";

export interface FeeLine {
  label: string;
  amount: number;
  frequency: FeeFrequency;
  note?: string;
}

export interface Program {
  id: string;
  level: LevelId;
  code: string;
  title: string;
  stream?: string;
  duration: string;
  seats: number;
  medium: string;
  eligibility: string;
  summary: string;
  description: string;
  highlights: string[];
  outcomes: string[];
  careers: string[];
  subjects: Subject[];
  fees: FeeLine[];
  image: string;
  routineKey: RoutineKey;
  spotlight?: boolean;
}

/* ---------------------------- Routines ---------------------------- */

export type Weekday =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday";

export type RoutineKey =
  | "grade-1-5"
  | "grade-6-8"
  | "grade-9-10"
  | "grade-11-12-science"
  | "grade-11-12-management";

export interface RoutinePeriod {
  label: string;
  start: string;
  end: string;
  isBreak?: boolean;
}

export interface RoutineRow {
  day: Weekday;
  slots: string[];
}

export interface Routine {
  key: RoutineKey;
  label: string;
  shift: string;
  room: string;
  effectiveFrom: string;
  periods: RoutinePeriod[];
  rows: RoutineRow[];
}

/* --------------------------- Facilities --------------------------- */

export type FacilityCategory =
  | "Academic"
  | "Laboratory"
  | "Technology"
  | "Sports"
  | "Residential"
  | "Wellbeing"
  | "Arts"
  | "Campus";

export interface FacilityStat {
  label: string;
  value: string;
}

export interface Facility {
  id: string;
  name: string;
  category: FacilityCategory;
  block: string;
  blurb: string;
  description: string;
  image: string;
  gallery: string[];
  stats: FacilityStat[];
  hours: string;
  inCharge: string;
  studentsLove: string;
  since: string;
}

/* ----------------------------- People ----------------------------- */

export type Department =
  | "Administration"
  | "Science"
  | "Management"
  | "English"
  | "Mathematics"
  | "Nepali"
  | "Social Studies"
  | "Computer Science"
  | "Physical Education";

export interface Person {
  id: string;
  name: string;
  role: string;
  department: Department;
  qualification: string;
  experience: string;
  subjects: string[];
  email: string;
  extension: string;
  officeHours: string;
  bio: string;
  joined: string;
  leadership?: boolean;
  rank?: number;
}

/* ----------------------------- Notices ---------------------------- */

export type NoticeCategory =
  | "Examination"
  | "Admission"
  | "Result"
  | "Holiday"
  | "Event"
  | "Scholarship"
  | "Sports"
  | "General";

export interface Attachment {
  name: string;
  kind: "PDF" | "XLSX" | "DOCX";
  size: string;
}

export interface NoticeTable {
  caption: string;
  columns: string[];
  rows: string[][];
}

export interface Notice {
  id: string;
  ref: string;
  title: string;
  category: NoticeCategory;
  dateAd: string;
  dateBs: string;
  audience: string;
  issuedBy: string;
  summary: string;
  body: string[];
  bullets?: string[];
  table?: NoticeTable;
  attachments: Attachment[];
  pinned?: boolean;
}

/* --------------------------- Scholarships ------------------------- */

export type ScholarshipCategory =
  | "Merit"
  | "Need-based"
  | "Government"
  | "Sports"
  | "Arts"
  | "Community";

export interface EligibilityCriterion {
  id: string;
  label: string;
  detail: string;
}

export interface Scholarship {
  id: string;
  ref: string;
  name: string;
  nepaliName: string;
  category: ScholarshipCategory;
  coverage: number;
  award: string;
  amountNpr: number;
  seats: number;
  deadlineAd: string;
  deadlineBs: string;
  appliesTo: string;
  summary: string;
  description: string;
  eligibility: EligibilityCriterion[];
  benefits: string[];
  documents: string[];
  process: string[];
  renewal: string;
  contact: string;
  spotlight?: boolean;
}

/* ----------------------------- Shared ----------------------------- */

export interface DownloadMeta {
  label: string;
  kind: "PDF";
  approxSize: string;
}
