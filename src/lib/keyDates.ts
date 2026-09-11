export type KeyDateKind =
  | "Examination"
  | "Holiday"
  | "Admission"
  | "Scholarship"
  | "Event"
  | "Term";

export interface KeyDate {
  id: string;
  label: string;
  detail: string;
  dateAd: string;
  dateBs: string;
  kind: KeyDateKind;
}

/** Term calendar for session 2083 BS, drawn from the published notices. */
export const keyDates: KeyDate[] = [
  {
    id: "session-open",
    label: "Session 2083 opens",
    detail: "Level-wise orientation in the auditorium; classes begin Ashadh 12.",
    dateAd: "2026-06-24",
    dateBs: "Ashadh 10, 2083",
    kind: "Term",
  },
  {
    id: "routine-revision",
    label: "Revised +2 routine takes effect",
    detail:
      "Science 06:30 to 11:20 and Management 06:45 to 11:35, practicals in the final slot.",
    dateAd: "2026-07-28",
    dateBs: "Shrawan 12, 2083",
    kind: "Term",
  },
  {
    id: "athletics-meet",
    label: "Inter-house athletics meet",
    detail:
      "Two days on the south ground; four houses compete for the overall shield.",
    dateAd: "2026-08-30",
    dateBs: "Bhadra 14, 2083",
    kind: "Event",
  },
  {
    id: "terminal-1-start",
    label: "First Terminal Examination begins",
    detail:
      "Grade 6 to 12. Admit card and identity card are compulsory for hall entry.",
    dateAd: "2026-09-18",
    dateBs: "Ashwin 2, 2083",
    kind: "Examination",
  },
  {
    id: "exhibition-proposals",
    label: "Science exhibition proposals close",
    detail: "One-page proposal to the Physics department; teams of up to three.",
    dateAd: "2026-09-21",
    dateBs: "Ashwin 5, 2083",
    kind: "Event",
  },
  {
    id: "admission-phase2",
    label: "+2 second-phase applications close",
    detail:
      "Interview on Ashwin 11. Scholarship intent must be declared on the form.",
    dateAd: "2026-09-24",
    dateBs: "Ashwin 8, 2083",
    kind: "Admission",
  },
  {
    id: "terminal-1-end",
    label: "First Terminal Examination ends",
    detail:
      "Answer scripts are reviewable with subject teachers during office hours.",
    dateAd: "2026-09-28",
    dateBs: "Ashwin 12, 2083",
    kind: "Examination",
  },
  {
    id: "merit-deadline",
    label: "Merit Chhatrabritti deadline",
    detail:
      "Twelve full-tuition places. Written test Ashwin 24, interview Ashwin 26.",
    dateAd: "2026-10-05",
    dateBs: "Ashwin 19, 2083",
    kind: "Scholarship",
  },
  {
    id: "dashain-start",
    label: "Dashain and Tihar vacation begins",
    detail:
      "Hostel closes Ashwin 23 at noon; transport suspended for the full period.",
    dateAd: "2026-10-10",
    dateBs: "Ashwin 24, 2083",
    kind: "Holiday",
  },
  {
    id: "classes-resume",
    label: "Classes resume after vacation",
    detail: "Hostel reopens Kartik 12 at 14:00. Holiday assignments due this day.",
    dateAd: "2026-10-29",
    dateBs: "Kartik 13, 2083",
    kind: "Term",
  },
  {
    id: "quota-deadline",
    label: "Government free studentship deadline",
    detail:
      "Thirty-three places. Ward-office attestation required on all declarations.",
    dateAd: "2026-11-10",
    dateBs: "Kartik 24, 2083",
    kind: "Scholarship",
  },
  {
    id: "science-exhibition",
    label: "Everest Science Exhibition",
    detail:
      "Fourteenth edition, auditorium and courtyard. Top three entries go to district.",
    dateAd: "2026-11-24",
    dateBs: "Mangsir 8, 2083",
    kind: "Event",
  },
  {
    id: "terminal-2-start",
    label: "Second Terminal Examination begins",
    detail:
      "All levels. The routine is published on the notice board four weeks in advance.",
    dateAd: "2027-01-04",
    dateBs: "Poush 20, 2083",
    kind: "Examination",
  },
  {
    id: "annual-programme",
    label: "Annual programme and prize day",
    detail:
      "Music, dramatics and the academic shield presentation in the auditorium.",
    dateAd: "2027-02-18",
    dateBs: "Falgun 7, 2083",
    kind: "Event",
  },
  {
    id: "grade12-preboard",
    label: "Grade 12 pre-board examination",
    detail:
      "Full NEB pattern under examination conditions, marked externally.",
    dateAd: "2027-02-26",
    dateBs: "Falgun 15, 2083",
    kind: "Examination",
  },
  {
    id: "see-begins",
    label: "SEE 2084 begins",
    detail:
      "Grade 10 candidates sit at the allocated district examination centre.",
    dateAd: "2027-03-18",
    dateBs: "Chaitra 5, 2083",
    kind: "Examination",
  },
];
