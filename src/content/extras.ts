import { photos } from './images';
import { bsToAd } from '../lib/nepaliDate';
import type { Download, NepaliDate, Period, ResultYear, RoutineClass, ThenNow } from './types';

function d(bs: string): NepaliDate {
  return { bs, ad: bsToAd(bs) ?? '' };
}

/* ------------------------------------------------------- Class routine */

export const periods: Period[] = [
  { id: 'p1', label: 'Period 1', start: '07:00', end: '07:45', kind: 'class' },
  { id: 'p2', label: 'Period 2', start: '07:50', end: '08:35', kind: 'class' },
  { id: 'p3', label: 'Period 3', start: '08:40', end: '09:25', kind: 'class' },
  { id: 'br1', label: 'Break', start: '09:25', end: '09:45', kind: 'break' },
  { id: 'p4', label: 'Period 4', start: '09:45', end: '10:30', kind: 'class' },
  { id: 'p5', label: 'Period 5', start: '10:35', end: '11:20', kind: 'class' },
  { id: 'br2', label: 'Lunch', start: '11:20', end: '12:00', kind: 'break' },
  { id: 'p6', label: 'Period 6', start: '12:00', end: '12:45', kind: 'class' },
  { id: 'p7', label: 'Period 7', start: '12:50', end: '13:35', kind: 'class' },
  { id: 'p8', label: 'Period 8', start: '13:40', end: '14:25', kind: 'class' },
];

export const teachingPeriods = periods.filter((p) => p.kind === 'class');

/** Six teaching days, Sunday to Friday. Eight teaching periods each. */
export const routines: RoutineClass[] = [
  {
    id: 'r-5a',
    grade: 'Grade 5',
    section: 'A',
    week: [
      ['English', 'Mathematics', 'Nepali', 'Science', 'Social Studies', 'Computer', 'Creative Arts', 'Games'],
      ['Mathematics', 'English', 'Science', 'Nepali', 'Health and P.E.', 'Social Studies', 'Library', 'English'],
      ['Nepali', 'Science', 'Mathematics', 'English', 'Computer', 'Creative Arts', 'Social Studies', 'Games'],
      ['Science', 'Nepali', 'English', 'Mathematics', 'Social Studies', 'Health and P.E.', 'Computer', 'Library'],
      ['English', 'Mathematics', 'Social Studies', 'Science', 'Nepali', 'Creative Arts', 'Games', 'Class Teacher'],
      ['Mathematics', 'English', 'Nepali', 'Library', 'Health and P.E.', 'Assembly Practice', 'Games', 'Class Teacher'],
    ],
  },
  {
    id: 'r-8a',
    grade: 'Grade 8',
    section: 'A',
    week: [
      ['Mathematics', 'English', 'Science', 'Nepali', 'Social Studies', 'Computer Science', 'Opt. Mathematics', 'Games'],
      ['English', 'Science', 'Mathematics', 'Social Studies', 'Nepali', 'Health and P.E.', 'Computer Science', 'Library'],
      ['Science Practical', 'Science Practical', 'Mathematics', 'English', 'Nepali', 'Social Studies', 'Creative Arts', 'Games'],
      ['Nepali', 'Mathematics', 'English', 'Science', 'Computer Science', 'Social Studies', 'Opt. Mathematics', 'Library'],
      ['Mathematics', 'Social Studies', 'English', 'Nepali', 'Science', 'Health and P.E.', 'Games', 'Class Teacher'],
      ['English', 'Mathematics', 'Science', 'Nepali', 'Opt. Mathematics', 'Assembly Practice', 'Games', 'Class Teacher'],
    ],
  },
  {
    id: 'r-8b',
    grade: 'Grade 8',
    section: 'B',
    week: [
      ['English', 'Mathematics', 'Nepali', 'Science', 'Computer Science', 'Social Studies', 'Games', 'Opt. Mathematics'],
      ['Science', 'English', 'Social Studies', 'Mathematics', 'Nepali', 'Computer Science', 'Library', 'Health and P.E.'],
      ['Mathematics', 'Nepali', 'Science Practical', 'Science Practical', 'English', 'Creative Arts', 'Social Studies', 'Games'],
      ['English', 'Science', 'Mathematics', 'Nepali', 'Social Studies', 'Opt. Mathematics', 'Computer Science', 'Library'],
      ['Nepali', 'Mathematics', 'English', 'Social Studies', 'Science', 'Games', 'Health and P.E.', 'Class Teacher'],
      ['Mathematics', 'English', 'Nepali', 'Science', 'Assembly Practice', 'Opt. Mathematics', 'Games', 'Class Teacher'],
    ],
  },
  {
    id: 'r-10a',
    grade: 'Grade 10',
    section: 'A',
    week: [
      ['Comp. Mathematics', 'Science', 'Comp. English', 'Comp. Nepali', 'Social Studies', 'Opt. Mathematics', 'H.P.E.', 'SEE Practice'],
      ['Science Practical', 'Science Practical', 'Comp. Mathematics', 'Comp. English', 'Opt. Mathematics', 'Comp. Nepali', 'Social Studies', 'SEE Practice'],
      ['Comp. English', 'Comp. Mathematics', 'Science', 'Social Studies', 'Comp. Nepali', 'Computer Science', 'H.P.E.', 'SEE Practice'],
      ['Comp. Nepali', 'Opt. Mathematics', 'Comp. English', 'Science', 'Comp. Mathematics', 'Social Studies', 'Computer Science', 'Library'],
      ['Comp. Mathematics', 'Comp. English', 'Science', 'Opt. Mathematics', 'Comp. Nepali', 'H.P.E.', 'Social Studies', 'SEE Practice'],
      ['Science', 'Comp. Mathematics', 'Comp. English', 'Comp. Nepali', 'Opt. Mathematics', 'Assembly Practice', 'Games', 'Class Teacher'],
    ],
  },
  {
    id: 'r-10b',
    grade: 'Grade 10',
    section: 'B',
    week: [
      ['Comp. English', 'Comp. Mathematics', 'Science', 'Social Studies', 'Comp. Nepali', 'Accountancy', 'H.P.E.', 'SEE Practice'],
      ['Comp. Mathematics', 'Science', 'Comp. English', 'Accountancy', 'Comp. Nepali', 'Social Studies', 'Library', 'SEE Practice'],
      ['Science Practical', 'Science Practical', 'Comp. English', 'Comp. Mathematics', 'Social Studies', 'Comp. Nepali', 'Accountancy', 'Games'],
      ['Comp. Nepali', 'Comp. English', 'Comp. Mathematics', 'Science', 'Accountancy', 'Social Studies', 'H.P.E.', 'SEE Practice'],
      ['Social Studies', 'Comp. Mathematics', 'Comp. English', 'Comp. Nepali', 'Science', 'Accountancy', 'Games', 'SEE Practice'],
      ['Comp. English', 'Science', 'Comp. Mathematics', 'Comp. Nepali', 'Accountancy', 'Assembly Practice', 'Games', 'Class Teacher'],
    ],
  },
  {
    id: 'r-12sci',
    grade: 'Grade 12',
    section: 'Science A',
    week: [
      ['Physics', 'Chemistry', 'Mathematics', 'Comp. English', 'Biology', 'Comp. Nepali', 'Physics Practical', 'Physics Practical'],
      ['Chemistry', 'Mathematics', 'Physics', 'Biology', 'Comp. English', 'Computer Science', 'Chem. Practical', 'Chem. Practical'],
      ['Mathematics', 'Physics', 'Chemistry', 'Comp. Nepali', 'Biology', 'Comp. English', 'Bio. Practical', 'Bio. Practical'],
      ['Biology', 'Comp. English', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Self Study', 'Self Study'],
      ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Comp. Nepali', 'Comp. English', 'Doubt Class', 'Doubt Class'],
      ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Assembly Practice', 'Self Study', 'Self Study'],
    ],
  },
];

/* -------------------------------------------------------- Board results */

export const seeResults: ResultYear[] = [
  { year: '2079 BS', yearBs: '2079', appeared: 96, passed: 92, distinction: 21, firstDivision: 44, secondDivision: 27 },
  { year: '2080 BS', yearBs: '2080', appeared: 104, passed: 101, distinction: 28, firstDivision: 49, secondDivision: 24 },
  { year: '2081 BS', yearBs: '2081', appeared: 112, passed: 109, distinction: 34, firstDivision: 52, secondDivision: 23 },
  { year: '2082 BS', yearBs: '2082', appeared: 118, passed: 116, distinction: 41, firstDivision: 55, secondDivision: 20 },
  { year: '2083 BS', yearBs: '2083', appeared: 124, passed: 122, distinction: 47, firstDivision: 57, secondDivision: 18 },
];

export const nebResults: ResultYear[] = [
  { year: '2079 BS', yearBs: '2079', appeared: 141, passed: 128, distinction: 18, firstDivision: 63, secondDivision: 47 },
  { year: '2080 BS', yearBs: '2080', appeared: 152, passed: 141, distinction: 24, firstDivision: 71, secondDivision: 46 },
  { year: '2081 BS', yearBs: '2081', appeared: 158, passed: 149, distinction: 29, firstDivision: 78, secondDivision: 42 },
  { year: '2082 BS', yearBs: '2082', appeared: 166, passed: 159, distinction: 36, firstDivision: 84, secondDivision: 39 },
  { year: '2083 BS', yearBs: '2083', appeared: 171, passed: 166, distinction: 42, firstDivision: 88, secondDivision: 36 },
];

/* ----------------------------------------------------- Downloads centre */

export const downloads: Download[] = [
  { id: 'dl-1', title: 'Admission form · 2084 BS session', category: 'Forms', format: 'PDF', sizeKb: 186, updated: d('2083-10-20') },
  { id: 'dl-2', title: 'Transfer certificate request form', category: 'Forms', format: 'PDF', sizeKb: 94, updated: d('2083-06-02') },
  { id: 'dl-3', title: 'Hostel application and undertaking', category: 'Forms', format: 'PDF', sizeKb: 142, updated: d('2083-10-20') },
  { id: 'dl-4', title: 'Bus route and fare schedule 2083 BS', category: 'Forms', format: 'PDF', sizeKb: 231, updated: d('2083-09-01') },
  { id: 'dl-5', title: 'Basic level syllabus · grades 1 to 5', category: 'Syllabus', format: 'PDF', sizeKb: 1120, updated: d('2083-01-02') },
  { id: 'dl-6', title: 'Basic level syllabus · grades 6 to 8', category: 'Syllabus', format: 'PDF', sizeKb: 1340, updated: d('2083-01-02') },
  { id: 'dl-7', title: 'Secondary syllabus · grades 9 and 10', category: 'Syllabus', format: 'PDF', sizeKb: 1580, updated: d('2083-01-02') },
  { id: 'dl-8', title: '+2 Science syllabus · NEB grade 11 and 12', category: 'Syllabus', format: 'PDF', sizeKb: 2210, updated: d('2083-01-05') },
  { id: 'dl-9', title: 'SEE past papers · 2078 to 2082 BS', category: 'Past papers', format: 'ZIP', sizeKb: 8640, updated: d('2083-11-02') },
  { id: 'dl-10', title: 'NEB grade 12 past papers · Science', category: 'Past papers', format: 'ZIP', sizeKb: 7420, updated: d('2083-11-02') },
  { id: 'dl-11', title: 'First terminal question bank · grade 10', category: 'Past papers', format: 'PDF', sizeKb: 640, updated: d('2083-05-28') },
  { id: 'dl-12', title: 'Academic calendar 2083 BS', category: 'Calendar', format: 'PDF', sizeKb: 320, updated: d('2083-01-01') },
  { id: 'dl-13', title: 'Fee structure 2083 BS · all levels', category: 'Calendar', format: 'PDF', sizeKb: 208, updated: d('2083-01-01') },
  { id: 'dl-14', title: 'Class routine 2083 BS · grades 1 to 12', category: 'Calendar', format: 'XLSX', sizeKb: 96, updated: d('2083-09-01') },
];

export const downloadCategories = Array.from(new Set(downloads.map((x) => x.category)));

/* -------------------------------------------------- Then and now slider */

export const thenNow: ThenNow[] = [
  {
    id: 'tn-front',
    title: 'The front block',
    thenLabel: '2057 BS',
    nowLabel: '2083 BS',
    then: photos.campusFacade,
    now: photos.campusMorning,
    note: 'Eight rooms and an office when the school moved to Sriman Marga. Twenty-eight rooms now, on the same footprint plus one floor.',
  },
  {
    id: 'tn-ground',
    title: 'The assembly ground',
    thenLabel: '2060 BS',
    nowLabel: '2083 BS',
    then: photos.sportsCourt,
    now: photos.assemblyAerial,
    note: 'Levelled by parents and pupils over one Dashain holiday. It has never been re-laid, only marked out again each Baishakh.',
  },
];
