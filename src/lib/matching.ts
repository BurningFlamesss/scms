import { scholarships } from "../content/scholarships";
import type { Scholarship } from "../types";

export type MatcherLevel =
  | "primary"
  | "lower"
  | "secondary"
  | "science"
  | "management";

export type GpaBand =
  | "below24"
  | "24to279"
  | "28to319"
  | "32to359"
  | "36plus";

export type IncomeBand =
  | "under350"
  | "350to400"
  | "400to500"
  | "500to700"
  | "over700";

export type CircumstanceFlag =
  | "community"
  | "disability"
  | "martyr"
  | "singleParent"
  | "female"
  | "butwal"
  | "sport"
  | "arts";

export interface MatcherAnswers {
  level: MatcherLevel | null;
  gpa: GpaBand | null;
  income: IncomeBand | null;
  flags: CircumstanceFlag[];
}

export const LEVEL_OPTIONS: Array<{ value: MatcherLevel; label: string }> = [
  { value: "primary", label: "Grade 1 to 5" },
  { value: "lower", label: "Grade 6 to 8" },
  { value: "secondary", label: "Grade 9 to 10" },
  { value: "science", label: "+2 Science" },
  { value: "management", label: "+2 Management" },
];

export const GPA_OPTIONS: Array<{ value: GpaBand; label: string }> = [
  { value: "36plus", label: "3.60 and above" },
  { value: "32to359", label: "3.20 to 3.59" },
  { value: "28to319", label: "2.80 to 3.19" },
  { value: "24to279", label: "2.40 to 2.79" },
  { value: "below24", label: "Below 2.40" },
];

export const INCOME_OPTIONS: Array<{ value: IncomeBand; label: string }> = [
  { value: "under350", label: "Below Rs 3.5 lakh" },
  { value: "350to400", label: "Rs 3.5 to 4 lakh" },
  { value: "400to500", label: "Rs 4 to 5 lakh" },
  { value: "500to700", label: "Rs 5 to 7 lakh" },
  { value: "over700", label: "Above Rs 7 lakh" },
];

export const FLAG_OPTIONS: Array<{ value: CircumstanceFlag; label: string }> = [
  { value: "female", label: "The student is a girl" },
  { value: "community", label: "Dalit or marginalised community" },
  { value: "disability", label: "Student with a disability" },
  { value: "martyr", label: "Child of a martyr or conflict victim" },
  { value: "singleParent", label: "Raised by a single parent or guardian" },
  { value: "butwal", label: "Resident of Butwal Sub-Metropolitan City" },
  { value: "sport", label: "Competes at district level or above" },
  { value: "arts", label: "Works seriously in music, drama or art" },
];

const PLUS_TWO: MatcherLevel[] = ["science", "management"];
const SIX_TO_TWELVE: MatcherLevel[] = [
  "lower",
  "secondary",
  "science",
  "management",
];
const NINE_TO_TWELVE: MatcherLevel[] = ["secondary", "science", "management"];

const GPA_RANK: Record<GpaBand, number> = {
  below24: 0,
  "24to279": 1,
  "28to319": 2,
  "32to359": 3,
  "36plus": 4,
};

const INCOME_RANK: Record<IncomeBand, number> = {
  under350: 0,
  "350to400": 1,
  "400to500": 2,
  "500to700": 3,
  over700: 4,
};

const label = <T extends string>(
  options: Array<{ value: T; label: string }>,
  value: T | null,
): string => options.find((o) => o.value === value)?.label ?? "Not answered";

interface Rule {
  id: string;
  evaluate: (a: MatcherAnswers) => string[] | null;
}

const RULES: Rule[] = [
  {
    id: "everest-merit",
    evaluate: (a) => {
      if (!a.level || !PLUS_TWO.includes(a.level)) return null;
      if (a.gpa !== "36plus") return null;
      return [
        "Your SEE grade point average is at or above the 3.60 threshold",
        "You are entering a +2 stream, which is what this scheme covers",
      ];
    },
  },
  {
    id: "see-distinction",
    evaluate: (a) => {
      if (!a.level || !PLUS_TWO.includes(a.level)) return null;
      if (a.gpa !== "32to359") return null;
      return [
        "Your grade point average falls in the 3.20 to 3.59 band this scheme is built for",
        "Places are allocated in descending order of GPA, so apply early",
      ];
    },
  },
  {
    id: "government-quota",
    evaluate: (a) => {
      const reasons: string[] = [];
      if (a.flags.includes("community"))
        reasons.push("You belong to a prescribed community category");
      if (a.flags.includes("disability"))
        reasons.push("Students with a disability are a prescribed category");
      if (a.flags.includes("martyr"))
        reasons.push("Children of martyrs and conflict victims are a prescribed category");
      if (a.income && INCOME_RANK[a.income] <= 1)
        reasons.push("Your declared household income is below the recognised threshold");
      if (reasons.length === 0) return null;
      return [
        ...reasons,
        "This quota is open at every level from Grade 1 to Grade 12",
      ];
    },
  },
  {
    id: "community-support",
    evaluate: (a) => {
      if (!a.flags.includes("community")) return null;
      if (!a.level || !SIX_TO_TWELVE.includes(a.level)) return null;
      if (!a.income || INCOME_RANK[a.income] > 0) return null;
      return [
        "You belong to a Dalit or marginalised community",
        "Your declared income is below Rs 3.5 lakh",
        "This award adds a monthly transport and lunch stipend on top of full tuition",
      ];
    },
  },
  {
    id: "girls-education",
    evaluate: (a) => {
      if (!a.flags.includes("female")) return null;
      if (!a.level || !NINE_TO_TWELVE.includes(a.level)) return null;
      if (!a.income || INCOME_RANK[a.income] > 2) return null;
      if (a.gpa && GPA_RANK[a.gpa] < 1) return null;
      return [
        "The grant is for girls entering or continuing Grade 9 to 12",
        "Your declared income is below the Rs 4 lakh guideline",
        "Holders are paired with a female faculty mentor for the award period",
      ];
    },
  },
  {
    id: "single-parent-support",
    evaluate: (a) => {
      if (!a.flags.includes("singleParent") && !a.flags.includes("martyr"))
        return null;
      if (a.income && INCOME_RANK[a.income] > 3) return null;
      return [
        a.flags.includes("martyr")
          ? "Children of martyrs and conflict victims are covered by this scheme"
          : "The student is raised by a single parent or guardian",
        "There is no academic threshold and no interview for the student",
      ];
    },
  },
  {
    id: "sports-excellence",
    evaluate: (a) => {
      if (!a.flags.includes("sport")) return null;
      if (!a.level || !NINE_TO_TWELVE.includes(a.level)) return null;
      return [
        "You compete at district level or above in a recognised sport",
        "The award includes a documented catch-up arrangement with every subject teacher",
      ];
    },
  },
  {
    id: "arts-grant",
    evaluate: (a) => {
      if (!a.flags.includes("arts")) return null;
      if (!a.level || !NINE_TO_TWELVE.includes(a.level)) return null;
      return [
        "You work seriously in music, dramatics or visual art",
        "Selection is on a portfolio or a live audition, not on academic ranking",
      ];
    },
  },
  {
    id: "municipality-talent",
    evaluate: (a) => {
      if (!a.flags.includes("butwal")) return null;
      if (!a.level || !SIX_TO_TWELVE.includes(a.level)) return null;
      if (!a.income || INCOME_RANK[a.income] > 3) return null;
      if (a.gpa && GPA_RANK[a.gpa] < 2) return null;
      return [
        "You are resident in Butwal Sub-Metropolitan City",
        "Your grade point average meets the 2.80 guideline",
        "Half of the award is funded by the municipality",
      ];
    },
  },
];

export interface MatchResult {
  scholarship: Scholarship;
  reasons: string[];
}

export function matchScholarships(answers: MatcherAnswers): MatchResult[] {
  const byId = new Map(scholarships.map((s) => [s.id, s]));
  const results: MatchResult[] = [];

  RULES.forEach((rule) => {
    const reasons = rule.evaluate(answers);
    const scholarship = byId.get(rule.id);
    if (reasons && scholarship) {
      results.push({ scholarship, reasons });
    }
  });

  return results.sort(
    (a, b) => b.scholarship.coverage - a.scholarship.coverage,
  );
}

/** True once enough has been answered for the result to mean anything. */
export function isAnswerComplete(answers: MatcherAnswers): boolean {
  return Boolean(answers.level && answers.gpa && answers.income);
}

export function answerSummary(
  answers: MatcherAnswers,
): Array<[string, string]> {
  return [
    ["Applying for", label(LEVEL_OPTIONS, answers.level)],
    ["Last grade point average", label(GPA_OPTIONS, answers.gpa)],
    ["Annual household income", label(INCOME_OPTIONS, answers.income)],
    [
      "Circumstances declared",
      answers.flags.length === 0
        ? "None declared"
        : answers.flags
            .map((f) => label(FLAG_OPTIONS, f))
            .join("; "),
    ],
  ];
}
