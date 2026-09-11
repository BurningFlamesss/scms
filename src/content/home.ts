import { photos } from './images';
import type { Frame, Person, Pillar } from './types';

/** Act 1 — five frames of one day, advanced by the visitor's own scroll. */
export const heroFrames: Frame[] = [
  {
    src: photos.campusMorning.src,
    alt: 'The main academic block across the front lawn in early morning light',
    caption: 'Sriman Marga, 06:40',
    width: 1600,
    height: 1067,
  },
  {
    src: photos.assemblyAerial.src,
    alt: 'Students lined up in house rows on the assembly ground, seen from above',
    caption: 'Assembly, 07:15',
    width: 1600,
    height: 1067,
  },
  {
    src: photos.classroomLesson.src,
    alt: 'A teacher working at the board with a full class of secondary students',
    caption: 'Grade nine, third period',
    width: 1600,
    height: 1067,
  },
  {
    src: photos.labGlass.src,
    alt: 'Glassware set out on a laboratory bench before a chemistry practical',
    caption: 'Chemistry practical, 13:20',
    width: 1600,
    height: 1067,
  },
  {
    src: photos.sportsField.src,
    alt: 'Students running on the ground at the close of the school day',
    caption: 'The ground, 16:05',
    width: 1600,
    height: 1067,
  },
];

export const landing = {
  eyebrow: 'EST. 2052 BS · 1995 AD — POKHARA, NEPAL',
  statement: ['A SCHOOL THAT', 'KEEPS ITS', 'PROMISES TO', 'PARENTS.'],
  support:
    'Thirty-one years on one campus in Pokhara ward eight, teaching in English from grade one through the +2 sciences. Everything a family needs in order to decide is published here — the routine, the calendar, the fees, and the bus that stops nearest their house.',
  /** Anchors to the footer contact block — there is no separate contact page. */
  primaryCta: { label: 'Admissions 2026', href: '#contact' },
  secondaryCta: { label: 'Take a tour', to: '/facilities' },
};

export const pillars: Pillar[] = [
  {
    id: 'p-about',
    label: '01 / THE SCHOOL',
    title: 'About\nEverest',
    blurb:
      'Founded in 2052 BS by six teachers who wanted a school their own children could attend. Thirty-one years, one campus, and a governing board that still meets in the library.',
    href: '/about',
    image: photos.campusBlock,
  },
  {
    id: 'p-courses',
    label: '02 / WHAT WE TEACH',
    title: 'Courses\nand streams',
    blurb:
      'Basic level one to eight, secondary nine and ten through the SEE, then +2 in science, management and humanities under the National Examinations Board.',
    href: '/courses',
    image: photos.groupStudy,
  },
  {
    id: 'p-facilities',
    label: '03 / THE CAMPUS',
    title: 'Facilities\nand transport',
    blurb:
      'Two laboratories, a library of eleven thousand titles, a residential hostel, a medical room with a resident health assistant, and eight buses across the valley.',
    href: '/facilities',
    image: photos.library,
  },
  {
    id: 'p-gallery',
    label: '04 / THE YEAR',
    title: 'Gallery\nand events',
    blurb:
      'Sports meet, science exhibition, Saraswati Puja, the grade twelve farewell, and the Sarangkot excursion — gathered by event and by academic year.',
    href: '/gallery',
    image: photos.celebration,
  },
];

/** Act 4 — proof, as numbered index rows rather than a testimonial carousel. */
export const voices: Person[] = [
  {
    id: 'v-1',
    name: 'Anjali Poudel',
    role: 'Grade 12, Science · Student',
    quote:
      'The physics lab is open until five, and somebody is always there to unlock it. That is the whole reason I chose science here.',
    photo: photos.portraitStudent,
  },
  {
    id: 'v-2',
    name: 'Ramesh K.C.',
    role: 'Parent of two · Bagar',
    quote:
      'I can see the bus timing, the exam routine and the fee for the year without telephoning the office once. That is rare.',
    photo: photos.portraitParent,
  },
  {
    id: 'v-3',
    name: 'Sujata Gurung',
    role: 'Alumna, 2072 BS · Now at IOE Pulchowk',
    quote:
      'Our chemistry teacher made us write our own practical notes rather than copy hers. I still work that way in engineering.',
    photo: photos.portraitAlumnus,
  },
  {
    id: 'v-4',
    name: 'Bimala Thapa Magar',
    role: 'Parent · Hemja route',
    quote:
      'We live forty minutes out. The morning bus has never once been late enough for my daughter to miss assembly.',
    photo: photos.portraitPrimary,
  },
];

export const admissionsBand = {
  headline: ['ADMISSIONS FOR', '2083 BS ARE', 'OPEN.'],
  note: 'Applications are accepted at the front office from 08:00, or by enquiry through this site. Places in grade eleven science are limited to two sections of forty.',
};
