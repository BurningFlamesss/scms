import { photos } from './images';
import type { CrestPart, Milestone, Person } from './types';

export const aboutIntro = {
  eyebrow: '01 / PURPOSE',
  statement: ['THIRTY-ONE YEARS', 'ON ONE CAMPUS.'],
  support:
    'Everest was opened in 2042 BS and has established itself as one of the leading Secondary Schools in Nepal. It is best known for its progressive teaching and learning approach in a student-friendly environment. At its core, the goal is to produce disciplined, amicable, self-confident, and dynamic citizens.',
};

export const milestones: Milestone[] = [
  {
    index: 1,
    marker: 'FOUNDATION',
    title: 'Six teachers, two rented rooms',
    blurb: '2052 BS · 1995 AD',
    body: [
      'The school opened in Shrawan 2052 with fifty-four pupils across grades one to three, in two rented rooms behind the old Nadipur patan. Fees were collected monthly in cash and recorded in a single ledger that the accounts office still keeps.',
      'The founding intent was narrow and has not changed: teach in English properly, keep class sizes under forty, and publish everything a parent needs in order to decide.',
    ],
    image: photos.classroomEmpty,
  },
  {
    index: 2,
    marker: 'THE CAMPUS',
    title: 'The move to Sriman Marga',
    blurb: '2057 BS · 2000 AD',
    body: [
      'Land in ward eight was bought with a loan against the founders’ own property. The first block — eight rooms and an office — was finished before the monsoon and the school moved in over a single weekend.',
      'The assembly ground was levelled by parents and pupils together during the Dashain holiday of that year. It has not been re-laid since.',
    ],
    image: photos.campusMorning,
  },
  {
    index: 3,
    marker: 'SECONDARY',
    title: 'Permission up to grade ten',
    blurb: '2062 BS · 2005 AD',
    body: [
      'The District Education Office granted permission to run grades nine and ten in 2062. The first SEE cohort of twenty-nine sat the board examination three years later and twenty-eight passed.',
      'The science laboratory was built the same year, funded by a levy the parents’ association voted for at an open meeting.',
    ],
    image: photos.labWork,
  },
  {
    index: 4,
    marker: 'HIGHER SECONDARY',
    title: '+2 in three streams',
    blurb: '2069 BS · 2012 AD',
    body: [
      'Affiliation for grades eleven and twelve came in 2069, initially in science and management. Humanities was added two sessions later after enough grade ten students asked for it.',
      'The second laboratory and the computer laboratory were both completed in this period, along with the library reading room on the ground floor.',
    ],
    image: photos.computerLab,
  },
  {
    index: 5,
    marker: 'THE HOSTEL',
    title: 'Residential places for eighty',
    blurb: '2074 BS · 2017 AD',
    body: [
      'A residential hostel was opened for students from Myagdi, Baglung and Parbat whose families wanted them in Pokhara for the +2 years. Eighty places, a resident warden, and a study hall supervised until nine each evening.',
      'A medical room with a resident health assistant was added at the same time and is open through the whole school day.',
    ],
    image: photos.hostelRoom,
  },
  {
    index: 6,
    marker: 'NOW',
    title: 'Twelve hundred students, eight buses',
    blurb: '2083 BS · 2026 AD',
    body: [
      'The school now teaches one thousand two hundred and eighty-four students from grade one to grade twelve, with seventy-eight teaching staff and eight buses covering the valley from Hemja to Birauta.',
      'The routine, the calendar, the fee structure and the bus timings are all published on this site and updated from the school office rather than reprinted once a year.',
    ],
    image: photos.assemblyAerial,
  },
];

/**
 * The crest, taken apart. Each element travels along its own vector and draws a
 * hairline leader out to a mono label. Coordinates are in the crest's own
 * 0 0 400 400 viewBox.
 */
export const crestParts: CrestPart[] = [
  {
    id: 'peak',
    label: 'THE PEAK',
    meaning:
      'Machhapuchhre, visible from the assembly ground on a clear morning. It stands for the standard the school sets rather than the one it has reached.',
    dx: 0,
    dy: -132,
    lx: 200,
    ly: -150,
    side: 'right',
  },
  {
    id: 'book',
    label: 'THE OPEN BOOK',
    meaning:
      'Learning kept in the open. The two pages carry the founding year in Bikram Sambat and in the Gregorian calendar, as everything on this site does.',
    dx: -150,
    dy: 48,
    lx: -200,
    ly: 60,
    side: 'left',
  },
  {
    id: 'star',
    label: 'THE STAR',
    meaning:
      'Five points for the five founding subjects taught in that first rented room: English, Nepali, mathematics, science and social studies.',
    dx: 150,
    dy: 40,
    lx: 210,
    ly: 52,
    side: 'right',
  },
  {
    id: 'ring',
    label: 'THE RING',
    meaning:
      'The school’s name in Devanagari, unbroken, because the institution is older than any one person working inside it.',
    dx: 0,
    dy: 152,
    lx: -190,
    ly: 178,
    side: 'left',
  },
  {
    id: 'year',
    label: 'THE YEAR',
    meaning:
      '2052 BS. The ribbon is deliberately plain: the date is a fact about the school, not a claim on its behalf.',
    dx: -136,
    dy: -84,
    lx: -212,
    ly: -96,
    side: 'left',
  },
];

export const leadership: Person[] = [
  {
    id: 'l-principal',
    name: 'Dr Rajendra Bahadur Thapa',
    role: 'Principal · since 2066 BS',
    quote: 'A school is judged on the child it was least sure about.',
    photo: photos.portraitPrincipal,
  },
  {
    id: 'l-vice',
    name: 'Sabitri Baral',
    role: 'Vice Principal · Academics',
    quote: 'We publish the routine because a family plans its week around it.',
    photo: photos.portraitVice,
  },
  {
    id: 'l-coordinator',
    name: 'Nabin Shrestha',
    role: 'Academic Coordinator · Secondary',
    quote: 'Grade ten is not a wall. It is a corridor with three doors.',
    photo: photos.portraitCoordinator,
  },
  {
    id: 'l-science',
    name: 'Dr Pratima Sharma',
    role: 'Head of Department · Science',
    quote: 'Nobody learns chemistry by copying a practical notebook.',
    photo: photos.portraitScience,
  },
  {
    id: 'l-primary',
    name: 'Kamala Gurung',
    role: 'Head of Basic Level · Grades 1 to 5',
    quote: 'At six years old the only thing that matters is wanting to come back tomorrow.',
    photo: photos.portraitPrimary,
  },
];

export const triptych = [
  {
    id: 't-mission',
    numeral: '01',
    title: 'Mission',
    body: 'To teach in English to a standard that lets a student from Pokhara sit any national board examination, or any entrance examination, without needing a second school to prepare them for it.',
  },
  {
    id: 't-vision',
    numeral: '02',
    title: 'Vision',
    body: 'A school where the timetable, the calendar, the fees and the results are all public, so that a family choosing between three schools can compare them honestly rather than on a prospectus.',
  },
  {
    id: 't-values',
    numeral: '03',
    title: 'Values',
    body: 'Attendance before achievement, evidence before opinion, and a class small enough that a teacher can name every difficulty in it by the end of Bhadra.',
  },
];
