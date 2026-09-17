import type { Dept, Notice, Stat } from './types';

/** Institutional identity. Every rendering of the school's name reads from here. */
export const school = {
  nameEn: 'Everest English Boarding Secondary School',
  nameNe: 'श्री एभरेस्ट इङ्लिश बोर्डिङ माध्यमिक विद्यालय',
  shortEn: 'Everest EBSS',
  wordmark: ['EVEREST', 'ENGLISH BOARDING'],
  /** Editable CMS field. Left as a clear placeholder — no motto has been adopted. */
  tagline: {
    value: '',
    placeholder: 'TAGLINE — SET IN CMS',
    help: 'One short line, 4 to 7 words. Shown in the sidebar under the crest.',
  },
  establishedBs: 2042,
  establishedAd: 1985,
  registrationNo: 'Reg. 116/052/053, Kaski District Education Office',
  address: {
    line1: 'Butwal-8, Sukkhanagar',
    line2: 'Butwal Sub-Metropolitan City',
    district: 'Rupandehi, Lumbini Province',
    country: 'Nepal',
    postal: '32907',
    addressNe: 'बुटवल उपमहानगरपालिका वडा नं ८, रुपन्देही',
  },
  geo: { lat: 28.2096, lng: 83.9856 },
  phones: [
    { label: 'NTC', value: '+977-61-460218', href: 'tel:+97761460218' },
    { label: 'Ncell', value: '+977-9806512340', href: 'tel:+9779806512340' },
  ],
  email: 'info@everestebss.edu.np',
  admissionsEmail: 'admissions@everestebss.edu.np',
  /** Sunday to Friday. Saturday is the weekly holiday. */
  hours: [
    { weekday: 0, name: 'Sunday', open: '07:00', close: '16:30' },
    { weekday: 1, name: 'Monday', open: '07:00', close: '16:30' },
    { weekday: 2, name: 'Tuesday', open: '07:00', close: '16:30' },
    { weekday: 3, name: 'Wednesday', open: '07:00', close: '16:30' },
    { weekday: 4, name: 'Thursday', open: '07:00', close: '16:30' },
    { weekday: 5, name: 'Friday', open: '07:00', close: '14:00' },
    { weekday: 6, name: 'Saturday', open: null, close: null },
  ] as Array<{ weekday: number; name: string; open: string | null; close: string | null }>,
  admissions: {
    windowLabel: 'Admissions 2026 — 2083 BS intake',
    openBs: '2083-11-01',
    closeBs: '2083-12-20',
    documentsRequired: 6,
    documents: [
      'Birth registration certificate',
      'Character certificate from the previous school',
      'Transfer certificate',
      'Marksheet of the last completed grade',
      'Two passport photographs of the applicant',
      'A copy of one guardian’s citizenship certificate',
    ],
  },
} as const;

export const notices: Notice[] = [
  {
    id: 'n-see-routine',
    title: 'SEE 2083 examination routine published by the National Examinations Board',
    publishedAt: '2026-01-12',
    href: '/calendar',
    pinned: true,
  },
  {
    id: 'n-admission-open',
    title: 'Admissions for the 2083 BS session open from 15 Falgun for all levels',
    publishedAt: '2026-01-08',
    href: '/courses',
    pinned: true,
  },
  {
    id: 'n-first-term',
    title: 'First terminal examination begins 18 Bhadra for grades one to ten',
    publishedAt: '2025-12-28',
    href: '/calendar',
    pinned: false,
  },
  {
    id: 'n-dashain',
    title: 'School closed for Dashain from 24 Ashwin, reopening 6 Kartik',
    publishedAt: '2025-12-20',
    href: '/calendar',
    pinned: false,
  },
  {
    id: 'n-results',
    title: 'Grade twelve NEB results published — collect transcripts from the office',
    publishedAt: '2025-12-11',
    href: '/about',
    pinned: false,
  },
  {
    id: 'n-bus-hemja',
    title: 'A second morning bus has been added on the Hemja route from 1 Magh',
    publishedAt: '2025-12-02',
    href: '/facilities',
    pinned: false,
  },
  {
    id: 'n-parents-day',
    title: 'Parents’ day for the basic level falls on 9 Poush, 10:00 to 13:00',
    publishedAt: '2025-11-25',
    href: '/calendar',
    pinned: false,
  },
  {
    id: 'n-fee-notice',
    title: 'Third instalment of tuition is due by the last working day of Poush',
    publishedAt: '2025-11-18',
    href: '/courses',
    pinned: false,
  },
];

export const stats: Stat[] = [
  { id: 's-years', label: 'Years in operation', value: 31 },
  { id: 's-students', label: 'Students enrolled', value: 1284 },
  { id: 's-staff', label: 'Teaching staff', value: 78 },
  { id: 's-pass', label: 'Board pass rate', value: 98, suffix: '%' },
];

export const departments: Dept[] = [
  {
    id: 'd-admissions',
    name: 'Admissions',
    contact: 'Sarita Gurung, Admissions Officer',
    phones: ['+977-61-460218', '+977-9806512340'],
    email: 'admissions@everestebss.edu.np',
    hours: 'Sunday to Friday, 08:00 – 16:00',
  },
  {
    id: 'd-accounts',
    name: 'Accounts',
    contact: 'Bishnu Prasad Adhikari, Accountant',
    phones: ['+977-61-460218'],
    email: 'accounts@everestebss.edu.np',
    hours: 'Sunday to Friday, 09:00 – 15:30',
  },
  {
    id: 'd-principal',
    name: 'Principal’s Office',
    contact: 'Dr Rajendra Bahadur Thapa, Principal',
    phones: ['+977-61-460219'],
    email: 'principal@everestebss.edu.np',
    hours: 'Sunday to Thursday, 10:00 – 13:00, by appointment',
  },
  {
    id: 'd-transport',
    name: 'Transport',
    contact: 'Kamal Bahadur Pariyar, Transport In-charge',
    phones: ['+977-9846021178'],
    email: 'transport@everestebss.edu.np',
    hours: 'Sunday to Friday, 06:00 – 17:00',
  },
  {
    id: 'd-hostel',
    name: 'Hostel and Welfare',
    contact: 'Muna Sharma, Warden',
    phones: ['+977-9856034421'],
    email: 'hostel@everestebss.edu.np',
    hours: 'All week, 06:00 – 21:00',
  },
  {
    id: 'd-general',
    name: 'General Enquiry',
    contact: 'Front Office',
    phones: ['+977-61-460218'],
    email: 'info@everestebss.edu.np',
    hours: 'Sunday to Friday, 07:30 – 16:30',
  },
];

/** The one number the fee estimator hands a parent when a combination is unpriced. */
export const ACCOUNTS_TEL = departments.find((d) => d.id === 'd-accounts')!.phones[0];

/** Where a bus-stop request goes, since there is no enquiry endpoint. */
export const TRANSPORT_EMAIL = departments.find((d) => d.id === 'd-transport')!.email;

export const campuses = [
  {
    id: 'everest',
    name: 'Everest Building',
    role: 'Primary & Secondary Academic Block',
    address: 'Ward No. 8, Sriman Marga, Pokhara',
    image: '/schools/everest/building.jpg',
  },
  {
    id: 'canon',
    name: 'Canon Building',
    role: '+2 Science & Management Block',
    address: 'Ward No. 8, Sriman Marga, Pokhara',
    image: '/schools/everest/canon-building.jpg',
  },
] as const;

export const organizationNote = 'Two purpose-built campuses, one shared culture of excellence — each designed for the age and stage of the students it serves.';
