import type { KeyDate } from "../content/keyDates";
import { school } from "../content/school";
import type { Level, Notice, Program, Scholarship } from "../types";
import { formatAd, formatNpr } from "./dates";
import type { DocBlock, OfficialDocument } from "./pdf";

const issuedLine = (): string =>
  `Issued ${formatAd(new Date().toISOString().slice(0, 10))}`;

const slug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

/* --------------------------- Fee estimate ---------------------------- */

export interface FeeEstimate {
  oneTime: number;
  annualCharges: number;
  monthlyTuition: number;
  tuitionYear: number;
  grossYearOne: number;
  relief: number;
  payable: number;
  perMonth: number;
  perInstalment: number;
  coverage: number;
}

/**
 * Year-one cost model. A scholarship percentage is applied to tuition only,
 * which is how the accounts desk actually calculates relief.
 */
export function computeFeeEstimate(
  program: Program,
  coverage: number,
): FeeEstimate {
  const sumBy = (frequency: string): number =>
    program.fees
      .filter((f) => f.frequency === frequency)
      .reduce((total, f) => total + f.amount, 0);

  const oneTime = sumBy("One-time");
  const annualCharges = sumBy("Annual") + sumBy("Per term") * 3;
  const monthlyTuition = sumBy("Monthly");
  const tuitionYear = monthlyTuition * 12;
  const grossYearOne = oneTime + annualCharges + tuitionYear;
  const relief = Math.round((tuitionYear * coverage) / 100);
  const payable = grossYearOne - relief;
  const recurring = Math.max(payable - oneTime, 0);

  return {
    oneTime,
    annualCharges,
    monthlyTuition,
    tuitionYear,
    grossYearOne,
    relief,
    payable,
    perMonth: Math.round(recurring / 12),
    perInstalment: Math.round(recurring / 2),
    coverage,
  };
}

export function feeEstimateDoc(
  program: Program,
  level: Level,
  estimate: FeeEstimate,
  plan: "monthly" | "instalments",
): OfficialDocument {
  const planLine =
    plan === "monthly"
      ? `Twelve monthly instalments of approximately ${formatNpr(estimate.perMonth)}, plus ${formatNpr(estimate.oneTime)} once at admission.`
      : `Two instalments of approximately ${formatNpr(estimate.perInstalment)}, plus ${formatNpr(estimate.oneTime)} once at admission.`;

  return {
    fileName: `Fee-Estimate-${slug(program.title)}-2083`,
    eyebrow: "Indicative fee estimate · Session 2083 BS",
    title: `${program.title} — Year One Cost`,
    refNo: `EST/${program.code}/${estimate.coverage}`,
    dateLine: issuedLine(),
    stamp: "Estimate only",
    blocks: [
      {
        type: "paragraph",
        text: "This is a working estimate prepared from the published fee schedule. It is not an invoice and it does not confirm a scholarship award. The accounts desk issues the binding figure once admission and any scholarship decision are confirmed.",
      },
      {
        type: "keyvalues",
        items: [
          ["Programme", `${program.title} (${program.code})`],
          ["Level", `${level.label} · ${level.grades}`],
          ["Scholarship applied", `${estimate.coverage}% of tuition`],
          ["Payment plan", plan === "monthly" ? "Monthly" : "Two instalments"],
        ],
      },
      { type: "heading", text: "Year one breakdown" },
      {
        type: "table",
        columns: ["Particular", "Basis", "Amount"],
        rows: [
          [
            "Admission and registration",
            "Once, at admission",
            formatNpr(estimate.oneTime),
          ],
          [
            "Annual charges",
            "Books, laboratory and board fees",
            formatNpr(estimate.annualCharges),
          ],
          [
            "Tuition",
            `${formatNpr(estimate.monthlyTuition)} for 12 months`,
            formatNpr(estimate.tuitionYear),
          ],
          [
            "Gross year one",
            "Before any scholarship",
            formatNpr(estimate.grossYearOne),
          ],
          [
            `Scholarship relief at ${estimate.coverage}%`,
            "Applied to tuition before invoicing",
            `less ${formatNpr(estimate.relief)}`,
          ],
          ["Payable in year one", "After relief", formatNpr(estimate.payable)],
        ],
        caption: planLine,
      },
      { type: "heading", text: "Full published fee schedule" },
      {
        type: "table",
        columns: ["Particular", "Amount", "Frequency", "Note"],
        rows: program.fees.map((f) => [
          f.label,
          formatNpr(f.amount),
          f.frequency,
          f.note ?? "None",
        ]),
      },
      { type: "heading", text: "Points to note" },
      {
        type: "bullets",
        items: [
          "Scholarship relief is applied to tuition only unless the scheme states otherwise.",
          "Full-tuition schemes additionally waive examination and laboratory charges.",
          "Fee adjustments for approved holders are made at the accounts desk before the term invoice is raised.",
          "Figures are indicative for session 2083 BS and may be revised for the following session.",
        ],
      },
      { type: "rule" },
      {
        type: "paragraph",
        text: `Prepared for discussion at the accounts desk. Contact ${school.phone} or accounts@everestbutwal.edu.np.`,
      },
    ],
    footNote: `${school.name} · Indicative estimate, not an invoice`,
  };
}

/* ------------------------ Saved notices digest ----------------------- */

export function savedNoticesDigestDoc(list: Notice[]): OfficialDocument {
  const blocks: DocBlock[] = [
    {
      type: "paragraph",
      text: `A consolidated copy of the ${list.length} notice${list.length === 1 ? "" : "s"} you saved from the school notice board, in the order they were published. Each entry is reproduced in full.`,
    },
    {
      type: "table",
      columns: ["Ref", "Notice", "Category", "Date (BS)"],
      rows: list.map((n) => [n.ref, n.title, n.category, n.dateBs]),
      caption: "Contents",
    },
  ];

  list.forEach((notice) => {
    blocks.push({ type: "rule" });
    blocks.push({ type: "heading", text: notice.title });
    blocks.push({
      type: "keyvalues",
      items: [
        ["Reference", notice.ref],
        ["Category", notice.category],
        ["Date", `${notice.dateBs} BS  /  ${formatAd(notice.dateAd)}`],
        ["Audience", notice.audience],
        ["Issued by", notice.issuedBy],
      ],
    });
    notice.body.forEach((paragraph) =>
      blocks.push({ type: "paragraph", text: paragraph }),
    );
    if (notice.bullets && notice.bullets.length > 0) {
      blocks.push({ type: "bullets", items: notice.bullets });
    }
    if (notice.table) {
      blocks.push({
        type: "table",
        columns: notice.table.columns,
        rows: notice.table.rows,
        caption: notice.table.caption,
      });
    }
    if (notice.attachments.length > 0) {
      blocks.push({
        type: "bullets",
        items: notice.attachments.map(
          (a) => `Attachment: ${a.name} (${a.kind}, ${a.size})`,
        ),
      });
    }
  });

  return {
    fileName: "My-Saved-Notices-2083",
    eyebrow: "Personal notice digest · Session 2083 BS",
    title: "Saved Notices",
    refNo: "EEBSS/2083/DIG/PERSONAL",
    dateLine: issuedLine(),
    stamp: "Personal copy",
    blocks,
    footNote: `${school.name} · Compiled from the notices saved in your browser`,
  };
}

/* --------------------------- Term calendar --------------------------- */

export function termCalendarDoc(dates: KeyDate[]): OfficialDocument {
  return {
    fileName: "Everest-Term-Calendar-2083",
    eyebrow: "Term calendar · Session 2083 BS",
    title: "Key Dates for the Academic Year",
    refNo: "EEBSS/2083/CAL/001",
    dateLine: issuedLine(),
    stamp: "Official",
    blocks: [
      {
        type: "paragraph",
        text: "Every dated commitment published for the session, in chronological order. Dates are given in both Bikram Sambat and the Gregorian calendar. Any change is notified on the notice board before it takes effect.",
      },
      {
        type: "table",
        columns: ["Date (BS)", "Date (AD)", "Event", "Category"],
        rows: [...dates]
          .sort((a, b) => a.dateAd.localeCompare(b.dateAd))
          .map((d) => [d.dateBs, formatAd(d.dateAd), d.label, d.kind]),
        caption: `${dates.length} dated commitments for session 2083 BS.`,
      },
      { type: "heading", text: "Notes" },
      {
        type: "bullets",
        items: [
          "Saturday is the weekly holiday throughout the session.",
          "Examination routines are published on the notice board four weeks before the first paper.",
          "Scholarship deadlines are final; incomplete files are returned rather than held.",
          "Transport timings change during the monsoon and are notified before the change.",
        ],
      },
      {
        type: "signature",
        name: "Sarita Gurung",
        role: "Vice Principal (Academics)",
      },
    ],
    footNote: `${school.name} · ${school.address} · ${school.motto}`,
  };
}

/* ----------------------- Scholarship shortlist ----------------------- */

export interface ShortlistEntry {
  scholarship: Scholarship;
  reasons: string[];
}

export function scholarshipShortlistDoc(
  entries: ShortlistEntry[],
  answerSummary: Array<[string, string]>,
): OfficialDocument {
  const blocks: DocBlock[] = [
    {
      type: "paragraph",
      text: "This shortlist was generated from the answers you gave on the Scholarships page. It is an orientation aid, not a decision: the selection committee assesses every application on the submitted file and verifies each declaration.",
    },
    { type: "heading", text: "What you told us" },
    { type: "keyvalues", items: answerSummary },
    { type: "heading", text: "Schemes worth applying for" },
    {
      type: "table",
      columns: ["Ref", "Scheme", "Coverage", "Places", "Deadline (BS)"],
      rows: entries.map((e) => [
        e.scholarship.ref,
        e.scholarship.name,
        `${e.scholarship.coverage}%`,
        `${e.scholarship.seats}`,
        e.scholarship.deadlineBs,
      ]),
    },
  ];

  entries.forEach((entry) => {
    blocks.push({ type: "rule" });
    blocks.push({ type: "heading", text: entry.scholarship.name });
    blocks.push({
      type: "keyvalues",
      items: [
        ["Reference", entry.scholarship.ref],
        [
          "Coverage",
          `${entry.scholarship.coverage}% — ${entry.scholarship.award}`,
        ],
        [
          "Deadline",
          `${entry.scholarship.deadlineBs} BS  /  ${formatAd(entry.scholarship.deadlineAd)}`,
        ],
        ["Contact", entry.scholarship.contact],
      ],
    });
    blocks.push({
      type: "paragraph",
      text: `Why it matched: ${entry.reasons.join("; ")}.`,
    });
    blocks.push({ type: "paragraph", text: "Documents to gather:" });
    blocks.push({ type: "checklist", items: entry.scholarship.documents });
  });

  blocks.push({ type: "rule" });
  blocks.push({
    type: "bullets",
    items: [
      "Full-tuition awards cannot be combined with the Government Free Studentship quota.",
      "A scholarship claim cannot be added after the admission interview has taken place.",
      "Bring this shortlist to the admissions desk — it will make the conversation much faster.",
    ],
  });

  return {
    fileName: "My-Scholarship-Shortlist-2083",
    eyebrow: "Personal scholarship shortlist",
    title: "Schemes Matched to Your Answers",
    refNo: "EEBSS/2083/SCH/SHORTLIST",
    dateLine: issuedLine(),
    stamp: "Guidance only",
    blocks,
    footNote: `${school.name} · Orientation aid, not a decision of the committee`,
  };
}
