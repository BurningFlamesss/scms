import type { Routine } from "../types";

export const routines: Routine[] = [
  {
    key: "grade-11-12-science",
    label: "Grade 11 – 12 · Science",
    shift: "Morning shift",
    room: "Science Block · Rooms 201–206",
    effectiveFrom: "Shrawan 12, 2083 BS",
    periods: [
      { label: "I", start: "06:30", end: "07:15" },
      { label: "II", start: "07:15", end: "08:00" },
      { label: "III", start: "08:00", end: "08:45" },
      { label: "Break", start: "08:45", end: "09:05", isBreak: true },
      { label: "IV", start: "09:05", end: "09:50" },
      { label: "V", start: "09:50", end: "10:35" },
      { label: "VI", start: "10:35", end: "11:20" },
    ],
    rows: [
      {
        day: "Sunday",
        slots: ["Physics", "Chemistry", "Mathematics", "Tiffin", "Computer Science", "English", "Physics Practical"],
      },
      {
        day: "Monday",
        slots: ["Chemistry", "Mathematics", "Physics", "Tiffin", "Biology", "Nepali", "Chemistry Practical"],
      },
      {
        day: "Tuesday",
        slots: ["Mathematics", "Physics", "English", "Tiffin", "Chemistry", "Computer Science", "Doubt Clinic"],
      },
      {
        day: "Wednesday",
        slots: ["Physics", "Biology", "Chemistry", "Tiffin", "Mathematics", "English", "Biology Practical"],
      },
      {
        day: "Thursday",
        slots: ["Chemistry", "Mathematics", "Computer Science", "Tiffin", "Physics", "Nepali", "Project Studio"],
      },
      {
        day: "Friday",
        slots: ["Mathematics", "Physics", "Chemistry", "Tiffin", "English", "Club Activity", "Assembly & Review"],
      },
    ],
  },
  {
    key: "grade-11-12-management",
    label: "Grade 11 – 12 · Management",
    shift: "Morning shift",
    room: "Commerce Block · Rooms 301–305",
    effectiveFrom: "Shrawan 12, 2083 BS",
    periods: [
      { label: "I", start: "06:45", end: "07:30" },
      { label: "II", start: "07:30", end: "08:15" },
      { label: "III", start: "08:15", end: "09:00" },
      { label: "Break", start: "09:00", end: "09:20", isBreak: true },
      { label: "IV", start: "09:20", end: "10:05" },
      { label: "V", start: "10:05", end: "10:50" },
      { label: "VI", start: "10:50", end: "11:35" },
    ],
    rows: [
      {
        day: "Sunday",
        slots: ["Accountancy", "Business Studies", "Economics", "Tiffin", "English", "Business Mathematics", "Computer Laboratory"],
      },
      {
        day: "Monday",
        slots: ["Business Studies", "Accountancy", "Business Mathematics", "Tiffin", "Economics", "Nepali", "Case Study"],
      },
      {
        day: "Tuesday",
        slots: ["Economics", "Accountancy", "English", "Tiffin", "Business Studies", "Computer Science", "Doubt Clinic"],
      },
      {
        day: "Wednesday",
        slots: ["Accountancy", "Business Mathematics", "Business Studies", "Tiffin", "Nepali", "English", "Ledger Practicum"],
      },
      {
        day: "Thursday",
        slots: ["Business Mathematics", "Economics", "Accountancy", "Tiffin", "Computer Science", "English", "Business Simulation"],
      },
      {
        day: "Friday",
        slots: ["Accountancy", "Business Studies", "Economics", "Tiffin", "Club Activity", "Career Guidance", "Assembly & Review"],
      },
    ],
  },
  {
    key: "grade-9-10",
    label: "Grade 9 – 10 · Secondary",
    shift: "Day shift",
    room: "Main Block · Rooms 101–108",
    effectiveFrom: "Shrawan 12, 2083 BS",
    periods: [
      { label: "I", start: "10:00", end: "10:45" },
      { label: "II", start: "10:45", end: "11:30" },
      { label: "III", start: "11:30", end: "12:15" },
      { label: "Lunch", start: "12:15", end: "12:50", isBreak: true },
      { label: "IV", start: "12:50", end: "13:35" },
      { label: "V", start: "13:35", end: "14:20" },
      { label: "VI", start: "14:20", end: "15:05" },
      { label: "VII", start: "15:05", end: "15:50" },
    ],
    rows: [
      {
        day: "Sunday",
        slots: ["English", "Mathematics", "Science", "Lunch", "Nepali", "Social Studies", "Computer Science", "Games"],
      },
      {
        day: "Monday",
        slots: ["Mathematics", "Science", "English", "Lunch", "Optional Mathematics", "Nepali", "Health & Physical Ed.", "Library"],
      },
      {
        day: "Tuesday",
        slots: ["Science", "English", "Mathematics", "Lunch", "Social Studies", "Computer Science", "Nepali", "Science Practical"],
      },
      {
        day: "Wednesday",
        slots: ["Nepali", "Mathematics", "Science", "Lunch", "English", "Optional Mathematics", "Social Studies", "Art & Craft"],
      },
      {
        day: "Thursday",
        slots: ["English", "Science", "Computer Science", "Lunch", "Mathematics", "Nepali", "Social Studies", "Games"],
      },
      {
        day: "Friday",
        slots: ["Mathematics", "English", "Science", "Lunch", "Club Activity", "Career & Counselling", "House Meeting", "Assembly & Review"],
      },
    ],
  },
  {
    key: "grade-6-8",
    label: "Grade 6 – 8 · Lower Secondary",
    shift: "Day shift",
    room: "Main Block · Rooms 011–018",
    effectiveFrom: "Shrawan 12, 2083 BS",
    periods: [
      { label: "I", start: "10:00", end: "10:40" },
      { label: "II", start: "10:40", end: "11:20" },
      { label: "III", start: "11:20", end: "12:00" },
      { label: "Lunch", start: "12:00", end: "12:35", isBreak: true },
      { label: "IV", start: "12:35", end: "13:15" },
      { label: "V", start: "13:15", end: "13:55" },
      { label: "VI", start: "13:55", end: "14:35" },
      { label: "VII", start: "14:35", end: "15:15" },
    ],
    rows: [
      {
        day: "Sunday",
        slots: ["English", "Mathematics", "Science & Technology", "Lunch", "Nepali", "Social Studies", "Computer Science", "Games"],
      },
      {
        day: "Monday",
        slots: ["Mathematics", "Nepali", "English", "Lunch", "Science & Technology", "Moral Education", "Exploratory Track", "Library"],
      },
      {
        day: "Tuesday",
        slots: ["Science & Technology", "English", "Mathematics", "Lunch", "Social Studies", "Computer Science", "Nepali", "Junior Laboratory"],
      },
      {
        day: "Wednesday",
        slots: ["Nepali", "Mathematics", "Science & Technology", "Lunch", "English", "Exploratory Track", "Social Studies", "Art & Craft"],
      },
      {
        day: "Thursday",
        slots: ["English", "Science & Technology", "Computer Science", "Lunch", "Mathematics", "Nepali", "Health & Physical Ed.", "Games"],
      },
      {
        day: "Friday",
        slots: ["Mathematics", "English", "Social Studies", "Lunch", "Club Activity", "House Meeting", "Reading Hour", "Assembly & Review"],
      },
    ],
  },
  {
    key: "grade-1-5",
    label: "Grade 1 – 5 · Primary",
    shift: "Day shift",
    room: "Early Years Wing · Rooms A1–A8",
    effectiveFrom: "Shrawan 12, 2083 BS",
    periods: [
      { label: "I", start: "10:00", end: "10:40" },
      { label: "II", start: "10:40", end: "11:20" },
      { label: "Snack", start: "11:20", end: "11:40", isBreak: true },
      { label: "III", start: "11:40", end: "12:20" },
      { label: "IV", start: "12:20", end: "13:00" },
      { label: "Lunch", start: "13:00", end: "13:35", isBreak: true },
      { label: "V", start: "13:35", end: "14:15" },
      { label: "VI", start: "14:15", end: "14:55" },
    ],
    rows: [
      {
        day: "Sunday",
        slots: ["English", "Mathematics", "Snack", "Our Environment", "Nepali", "Lunch", "Reading Corner", "Music & Movement"],
      },
      {
        day: "Monday",
        slots: ["Mathematics", "English", "Snack", "Nepali", "Computer Basics", "Lunch", "Reading Intervention", "Games"],
      },
      {
        day: "Tuesday",
        slots: ["English", "Our Environment", "Snack", "Mathematics", "Nepali", "Lunch", "Library", "Art & Craft"],
      },
      {
        day: "Wednesday",
        slots: ["Nepali", "Mathematics", "Snack", "English", "Our Environment", "Lunch", "Reading Intervention", "Music & Movement"],
      },
      {
        day: "Thursday",
        slots: ["Mathematics", "English", "Snack", "Computer Basics", "Nepali", "Lunch", "Story Hour", "Games"],
      },
      {
        day: "Friday",
        slots: ["English", "Mathematics", "Snack", "Our Environment", "House Activity", "Lunch", "Show & Tell", "Assembly & Review"],
      },
    ],
  },
];

export const routineByKey = (key: string): Routine | undefined =>
  routines.find((r) => r.key === key);
