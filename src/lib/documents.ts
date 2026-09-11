import { school } from "../content/school";
import { formatAd, formatNpr } from "./dates";
import type { DocBlock, OfficialDocument } from "./pdf";
import type {
  Facility,
  Level,
  Notice,
  Person,
  Program,
  Routine,
  Scholarship,
} from "../types";

const issuedLine = (): string => `Issued ${formatAd(new Date().toISOString().slice(0, 10))}`;

const slug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

/* ----------------------------- Programmes ---------------------------- */

export function programProspectusDoc(
  program: Program,
  level: Level,
): OfficialDocument {
  const blocks: DocBlock[] = [
    {
      type: "keyvalues",
      items: [
        ["Programme code", program.code],
        ["Level", `${level.label} · ${level.grades}`],
        ["Board", level.board],
        ["Duration", program.duration],
        ["Seats", `${program.seats}`],
        ["Medium of instruction", program.medium],
        ["Eligibility", program.eligibility],
      ],
    },
    { type: "heading", text: "About this programme" },
    { type: "paragraph", text: program.description },
    { type: "heading", text: "What makes it distinctive" },
    { type: "bullets", items: program.highlights },
    { type: "heading", text: "Subjects and credit hours" },
    {
      type: "table",
      columns: ["Code", "Subject", "Credit", "Type"],
      rows: program.subjects.map((s) => [s.code, s.name, `${s.credit}`, s.kind]),
      caption: `Total credit hours: ${program.subjects.reduce((n, s) => n + s.credit, 0)}`,
    },
    { type: "heading", text: "Fee structure (NPR)" },
    {
      type: "table",
      columns: ["Particular", "Amount", "Frequency", "Note"],
      rows: program.fees.map((f) => [
        f.label,
        formatNpr(f.amount),
        f.frequency,
        f.note ?? "—",
      ]),
      caption:
        "Fees are indicative for session 2083 BS and are reduced by any approved scholarship before invoicing.",
    },
    { type: "heading", text: "Learning outcomes" },
    { type: "bullets", items: program.outcomes },
  ];

  if (program.careers.length > 0) {
    blocks.push({ type: "heading", text: "Onward pathways" });
    blocks.push({ type: "bullets", items: program.careers });
  }

  blocks.push({ type: "rule" });
  blocks.push({
    type: "paragraph",
    text: `${school.affiliation}. Registration number ${school.regNo}. For admission enquiries contact the admissions desk at ${school.phone} or ${school.email}.`,
  });
  blocks.push({
    type: "signature",
    name: school.principal,
    role: "Principal",
  });

  return {
    fileName: `Prospectus-${slug(program.title)}-2083`,
    eyebrow: "Programme prospectus · Session 2083 BS",
    title: program.title,
    refNo: program.code,
    dateLine: issuedLine(),
    stamp: "Official",
    blocks,
    footNote: `${school.name} · ${school.address} · ${school.motto}`,
  };
}

export function academicProspectusDoc(
  levels: Level[],
  programs: Program[],
): OfficialDocument {
  const blocks: DocBlock[] = [
    {
      type: "paragraph",
      text: `This prospectus summarises every academic programme offered by ${school.name} for the session 2083 BS, from the Early Years Foundation through to the Grade 12 Science and Management streams of the National Examinations Board.`,
    },
    {
      type: "keyvalues",
      items: [
        ["Institution", school.name],
        ["Address", school.fullAddress],
        ["Established", school.established],
        ["Levels offered", school.levels],
        ["+2 streams", school.streams.join(" and ")],
        ["Registration", school.regNo],
      ],
    },
    { type: "heading", text: "Programme index" },
    {
      type: "table",
      columns: ["Code", "Programme", "Level", "Duration", "Seats"],
      rows: programs.map((p) => [
        p.code,
        p.title,
        levels.find((l) => l.id === p.level)?.short ?? p.level,
        p.duration,
        `${p.seats}`,
      ]),
      caption: `${programs.length} programmes across ${levels.length} levels.`,
    },
  ];

  levels.forEach((level) => {
    blocks.push({ type: "heading", text: `${level.label} · ${level.grades}` });
    blocks.push({ type: "paragraph", text: level.description });
    blocks.push({
      type: "bullets",
      items: programs
        .filter((p) => p.level === level.id)
        .map((p) => `${p.title} (${p.code}) — ${p.summary}`),
    });
  });

  blocks.push({ type: "rule" });
  blocks.push({ type: "signature", name: school.principal, role: "Principal" });

  return {
    fileName: "Everest-Academic-Prospectus-2083",
    eyebrow: "Academic prospectus · Session 2083 BS",
    title: "Academic Programmes and Streams",
    refNo: "EEBSS/2083/PRO/001",
    dateLine: issuedLine(),
    stamp: "Official",
    blocks,
    footNote: `${school.name} · ${school.affiliation}`,
  };
}

/* ------------------------------ Routine ------------------------------ */

export function routineDoc(routine: Routine): OfficialDocument {
  const columns = [
    "Day",
    ...routine.periods.map((p) => `${p.label}\n${p.start}-${p.end}`),
  ];
  const rows = routine.rows.map((row) => [row.day, ...row.slots]);

  return {
    fileName: `Class-Routine-${slug(routine.label)}-2083`,
    eyebrow: "Weekly class routine · Session 2083 BS",
    title: `${routine.label} — Weekly Routine`,
    refNo: `EEBSS/2083/RTN/${routine.key.toUpperCase()}`,
    dateLine: `Effective from ${routine.effectiveFrom}`,
    stamp: "Official",
    blocks: [
      {
        type: "keyvalues",
        items: [
          ["Shift", routine.shift],
          ["Rooms", routine.room],
          ["Working days", `${routine.rows.length} (Sunday to Friday)`],
          ["Periods per day", `${routine.periods.length}`],
          ["Effective from", routine.effectiveFrom],
        ],
      },
      { type: "table", columns, rows, caption: "Saturday is the weekly holiday." },
      { type: "heading", text: "Notes" },
      {
        type: "bullets",
        items: [
          "Students must be seated before the first bell of their shift.",
          "Practical and studio periods are held in the final slot of the day and run without interruption.",
          "Any change to this routine is notified on the Notices board before it takes effect.",
        ],
      },
      { type: "signature", name: "Sarita Gurung", role: "Vice Principal (Academics)" },
    ],
    footNote: `${school.name} · ${school.address}`,
  };
}

/* ------------------------------ Notices ------------------------------ */

export function noticeDoc(notice: Notice): OfficialDocument {
  const blocks: DocBlock[] = [
    {
      type: "keyvalues",
      items: [
        ["Category", notice.category],
        ["Audience", notice.audience],
        ["Date", `${notice.dateBs} BS  /  ${formatAd(notice.dateAd)}`],
        ["Issued by", notice.issuedBy],
      ],
    },
    { type: "rule" },
    ...notice.body.map(
      (paragraph): DocBlock => ({ type: "paragraph", text: paragraph }),
    ),
  ];

  if (notice.bullets && notice.bullets.length > 0) {
    blocks.push({ type: "heading", text: "Points to note" });
    blocks.push({ type: "bullets", items: notice.bullets });
  }

  if (notice.table) {
    blocks.push({ type: "heading", text: "Schedule" });
    blocks.push({
      type: "table",
      columns: notice.table.columns,
      rows: notice.table.rows,
      caption: notice.table.caption,
    });
  }

  blocks.push({ type: "rule" });
  blocks.push({
    type: "paragraph",
    text: "This is a true copy of the notice published on the official school notice board. Queries may be addressed to the issuing office during published office hours.",
  });
  blocks.push({
    type: "signature",
    name: notice.issuedBy.split(",")[0],
    role: notice.issuedBy.split(",").slice(1).join(",").trim() || "Issuing office",
  });

  return {
    fileName: `Notice-${notice.ref.replace(/\//g, "-")}`,
    eyebrow: `${notice.category} notice`,
    title: notice.title,
    refNo: notice.ref,
    dateLine: `${notice.dateBs} BS  /  ${formatAd(notice.dateAd)}`,
    stamp: notice.pinned ? "Pinned" : "Official",
    blocks,
    footNote: `${school.name} · ${school.address} · ${school.phone}`,
  };
}

/* --------------------------- Scholarships ---------------------------- */

export function scholarshipFormDoc(item: Scholarship): OfficialDocument {
  return {
    fileName: `Scholarship-Application-${slug(item.name)}-2083`,
    eyebrow: "Scholarship application form · Session 2083 BS",
    title: item.name,
    refNo: item.ref,
    dateLine: `Applications close ${item.deadlineBs} BS  /  ${formatAd(item.deadlineAd)}`,
    stamp: "Application form",
    blocks: [
      {
        type: "keyvalues",
        items: [
          ["Scheme", `${item.name} (${item.nepaliName})`],
          ["Category", item.category],
          ["Coverage", `${item.coverage}% — ${item.award}`],
          ["Indicative value", `${formatNpr(item.amountNpr)} over the award period`],
          ["Places available", `${item.seats}`],
          ["Applies to", item.appliesTo],
          ["Deadline", `${item.deadlineBs} BS / ${formatAd(item.deadlineAd)}`],
        ],
      },
      { type: "heading", text: "Section A · Applicant particulars" },
      {
        type: "keyvalues",
        items: [
          ["Full name of student", ""],
          ["Date of birth (BS / AD)", ""],
          ["Grade applied for", ""],
          ["Stream or concentration", ""],
          ["Previous school", ""],
          ["Last GPA or percentage", ""],
        ],
      },
      { type: "heading", text: "Section B · Guardian particulars" },
      {
        type: "keyvalues",
        items: [
          ["Name of guardian", ""],
          ["Relationship to student", ""],
          ["Occupation", ""],
          ["Annual household income (NPR)", ""],
          ["Ward, municipality and district", ""],
          ["Contact number", ""],
        ],
      },
      { type: "heading", text: "Section C · Eligibility conditions" },
      {
        type: "table",
        columns: ["Condition", "Detail", "Met (Y/N)"],
        rows: item.eligibility.map((c) => [c.label, c.detail, ""]),
      },
      { type: "heading", text: "Section D · Documents enclosed" },
      { type: "checklist", items: item.documents },
      { type: "heading", text: "Declaration" },
      {
        type: "paragraph",
        text: "I declare that the particulars given above are true to the best of my knowledge, and I understand that any false declaration will result in the withdrawal of the award and of admission. I consent to verification of the declared information, including a home visit where the committee considers it necessary.",
      },
      { type: "spacer", size: 18 },
      {
        type: "keyvalues",
        items: [
          ["Signature of student", ""],
          ["Signature of guardian", ""],
          ["Date of submission", ""],
        ],
      },
      { type: "rule" },
      { type: "paragraph", text: `For office use only — received by: ______________  Receipt no: ______________  Enquiries: ${item.contact}` },
    ],
    footNote: `${school.name} · Scholarship Selection Committee · ${school.address}`,
  };
}

export function scholarshipChecklistDoc(item: Scholarship): OfficialDocument {
  return {
    fileName: `Scholarship-Checklist-${slug(item.name)}`,
    eyebrow: "Applicant document checklist",
    title: `${item.name} — What to bring`,
    refNo: item.ref,
    dateLine: `Deadline ${item.deadlineBs} BS  /  ${formatAd(item.deadlineAd)}`,
    stamp: "Checklist",
    blocks: [
      { type: "paragraph", text: item.summary },
      { type: "heading", text: "Documents to enclose" },
      { type: "checklist", items: item.documents },
      { type: "heading", text: "Conditions you must meet" },
      { type: "checklist", items: item.eligibility.map((c) => c.label) },
      { type: "heading", text: "How the process runs" },
      { type: "bullets", items: item.process },
      { type: "heading", text: "Renewal" },
      { type: "paragraph", text: item.renewal },
      { type: "rule" },
      { type: "paragraph", text: `Questions: ${item.contact}` },
    ],
    footNote: `${school.name} · Bring this checklist with you to the admissions desk`,
  };
}

export function scholarshipIndexDoc(items: Scholarship[]): OfficialDocument {
  return {
    fileName: "Scholarship-Schemes-Index-2083",
    eyebrow: "Scholarship index · Session 2083 BS",
    title: "Chhatrabritti Schemes and Deadlines",
    refNo: "EEBSS/2083/SCH/000",
    dateLine: issuedLine(),
    stamp: "Official",
    blocks: [
      {
        type: "paragraph",
        text: `${items.length} schemes are open for the session 2083 BS, covering ${items.reduce((n, s) => n + s.seats, 0)} places in total. Each scheme carries its own deadline, criteria and document list.`,
      },
      {
        type: "table",
        columns: ["Ref", "Scheme", "Category", "Coverage", "Places", "Deadline (BS)"],
        rows: items.map((s) => [
          s.ref,
          s.name,
          s.category,
          `${s.coverage}%`,
          `${s.seats}`,
          s.deadlineBs,
        ]),
      },
      { type: "heading", text: "General conditions" },
      {
        type: "bullets",
        items: [
          "Incomplete files are returned rather than held; check the document list before submitting.",
          "A scholarship claim cannot be added after the admission interview has taken place.",
          "Full-tuition awards cannot be combined with the Government Free Studentship quota.",
          "Renewal is never automatic — a renewal declaration is required each session.",
        ],
      },
      { type: "signature", name: school.principal, role: "Chair, Scholarship Selection Committee" },
    ],
    footNote: `${school.name} · ${school.address}`,
  };
}

/* ------------------------------ People ------------------------------- */

export function facultyDirectoryDoc(list: Person[]): OfficialDocument {
  return {
    fileName: "Everest-Faculty-Directory-2083",
    eyebrow: "Administration and faculty directory",
    title: "Staff Contact Directory 2083",
    refNo: "EEBSS/2083/DIR/001",
    dateLine: issuedLine(),
    stamp: "Official",
    blocks: [
      {
        type: "paragraph",
        text: `Contact directory for the ${list.length} members of the administration and teaching faculty. Extension numbers connect through the main line ${school.phone}.`,
      },
      {
        type: "table",
        columns: ["Name", "Role", "Department", "Extension", "Email"],
        rows: list.map((p) => [p.name, p.role, p.department, p.extension, p.email]),
      },
      { type: "heading", text: "Office hours" },
      {
        type: "table",
        columns: ["Name", "Office hours"],
        rows: list.map((p) => [p.name, p.officeHours]),
      },
      { type: "signature", name: "Ramesh Kumar Thapa", role: "Vice Principal (Administration)" },
    ],
    footNote: `${school.name} · ${school.address} · ${school.phone}`,
  };
}

export function personProfileDoc(person: Person): OfficialDocument {
  return {
    fileName: `Profile-${slug(person.name)}`,
    eyebrow: `${person.department} department`,
    title: person.name,
    refNo: `EXT-${person.extension}`,
    dateLine: issuedLine(),
    stamp: "Staff profile",
    blocks: [
      {
        type: "keyvalues",
        items: [
          ["Role", person.role],
          ["Department", person.department],
          ["Qualification", person.qualification],
          ["Experience", person.experience],
          ["Teaches", person.subjects.join(", ")],
          ["Office hours", person.officeHours],
          ["Email", person.email],
          ["Extension", person.extension],
          ["Joined", person.joined],
        ],
      },
      { type: "heading", text: "Profile" },
      { type: "paragraph", text: person.bio },
      { type: "rule" },
      {
        type: "paragraph",
        text: `Appointments outside published office hours may be requested through the school office on ${school.phone}.`,
      },
    ],
    footNote: `${school.name} · ${school.address}`,
  };
}

/* ---------------------------- Facilities ----------------------------- */

export function facilityBriefDoc(facility: Facility): OfficialDocument {
  return {
    fileName: `Facility-Brief-${slug(facility.name)}`,
    eyebrow: `${facility.category} facility`,
    title: facility.name,
    refNo: `EEBSS/2083/FAC/${slug(facility.id).toUpperCase()}`,
    dateLine: issuedLine(),
    stamp: "Facility brief",
    blocks: [
      {
        type: "keyvalues",
        items: [
          ["Location", facility.block],
          ["Open hours", facility.hours],
          ["In charge", facility.inCharge],
          ["In service since", facility.since],
        ],
      },
      { type: "heading", text: "Description" },
      { type: "paragraph", text: facility.description },
      { type: "heading", text: "At a glance" },
      {
        type: "table",
        columns: ["Measure", "Value"],
        rows: facility.stats.map((s) => [s.label, s.value]),
      },
      { type: "heading", text: "What students say" },
      { type: "paragraph", text: facility.studentsLove },
      { type: "signature", name: "Ramesh Kumar Thapa", role: "Vice Principal (Administration)" },
    ],
    footNote: `${school.name} · ${school.address}`,
  };
}

export function facilityIndexDoc(list: Facility[]): OfficialDocument {
  return {
    fileName: "Everest-Campus-Facilities-Index",
    eyebrow: "Campus facilities index",
    title: "Facilities and Infrastructure 2083",
    refNo: "EEBSS/2083/FAC/000",
    dateLine: issuedLine(),
    stamp: "Official",
    blocks: [
      {
        type: "paragraph",
        text: `${list.length} facilities are maintained across the Butwal-8 campus, from laboratories and the central library to residential, sporting and wellbeing provision.`,
      },
      {
        type: "table",
        columns: ["Facility", "Category", "Location", "Open hours"],
        rows: list.map((f) => [f.name, f.category, f.block, f.hours]),
      },
      { type: "signature", name: school.principal, role: "Principal" },
    ],
    footNote: `${school.name} · ${school.fullAddress}`,
  };
}
