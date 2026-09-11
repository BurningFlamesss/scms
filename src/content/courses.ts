import type {
  FeeBand,
  HostelOption,
  Level,
  QuizQuestion,
  Stream,
  Subject,
} from './types';

const s = (
  id: string,
  name: string,
  creditHours: number,
  theory: number,
  practical: number,
  outline: string[],
): Subject => ({ id, name, creditHours, theory, practical, outline });

/* ------------------------------------------------------------------ Basic */

const basicLower: Subject[] = [
  s('b-eng', 'English', 4, 100, 0, [
    'Phonics, reading fluency and comprehension',
    'Sentence building and guided writing',
    'Listening and spoken practice in every period',
  ]),
  s('b-nep', 'Nepali', 4, 100, 0, [
    'वर्णविन्यास and handwriting',
    'Reading aloud, recitation and story retelling',
    'Guided paragraph writing',
  ]),
  s('b-math', 'Mathematics', 4, 100, 0, [
    'Number sense to five digits',
    'The four operations and mental arithmetic',
    'Shape, measurement and simple data',
  ]),
  s('b-sci', 'Science and Technology', 3, 75, 25, [
    'Living things and their surroundings',
    'Matter, force and simple machines',
    'Weekly observation task with a written record',
  ]),
  s('b-soc', 'Social Studies', 3, 100, 0, [
    'Our family, school and ward',
    'Districts and provinces of Nepal',
    'Festivals, communities and civic sense',
  ]),
  s('b-hpe', 'Health and Physical Education', 2, 50, 50, [
    'Personal hygiene and nutrition',
    'Athletics, football and volleyball basics',
    'Two ground periods a week',
  ]),
  s('b-art', 'Creative Arts', 2, 25, 75, [
    'Drawing, colour and collage',
    'Songs and rhythm work',
    'One display piece each term',
  ]),
  s('b-comp', 'Computer', 2, 50, 50, [
    'Keyboard and mouse fluency',
    'Paint, word processing and safe searching',
    'One machine between two pupils',
  ]),
];

const basicUpper: Subject[] = [
  s('u-eng', 'English', 5, 100, 0, [
    'Reading comprehension and unseen passages',
    'Grammar in use, tense and voice',
    'Formal letter, report and narrative writing',
  ]),
  s('u-nep', 'Nepali', 5, 100, 0, [
    'पठन र बोध',
    'व्याकरण र रचना',
    'कविता र निबन्ध लेखन',
  ]),
  s('u-math', 'Mathematics', 5, 100, 0, [
    'Integers, fractions and ratio',
    'Algebraic expressions and equations',
    'Mensuration, geometry and statistics',
  ]),
  s('u-sci', 'Science and Technology', 5, 75, 25, [
    'Cell, tissue and classification',
    'Motion, energy, light and sound',
    'Fortnightly laboratory practical with a written report',
  ]),
  s('u-soc', 'Social Studies and Human Value', 4, 100, 0, [
    'Civics, governance and the constitution',
    'Geography and economy of Nepal',
    'Human values and community service record',
  ]),
  s('u-hpe', 'Health, Physical and Creative Arts', 3, 50, 50, [
    'Adolescent health and first aid',
    'Team games and athletics',
    'Music, drawing and drama options',
  ]),
  s('u-comp', 'Computer Science', 3, 50, 50, [
    'Spreadsheets, presentation and typing speed',
    'Introduction to block-based programming',
    'Internet safety and digital citizenship',
  ]),
  s('u-opt', 'Optional Mathematics (introduced)', 2, 50, 0, [
    'Sets, functions and sequences',
    'Coordinate geometry foundations',
    'Taken by students intending science at +2',
  ]),
];

const secondary: Subject[] = [
  s('se-eng', 'Compulsory English', 5, 100, 0, [
    'Reading, unseen passage and vocabulary',
    'Grammar, transformation and tenses',
    'Free writing, letters, essays and dialogue',
  ]),
  s('se-nep', 'Compulsory Nepali', 5, 100, 0, [
    'गद्य, पद्य र नाटक',
    'व्याकरण र अनुवाद',
    'रचनात्मक लेखन',
  ]),
  s('se-math', 'Compulsory Mathematics', 5, 100, 0, [
    'Algebra, indices, surds and equations',
    'Geometry, trigonometry and mensuration',
    'Statistics and probability',
  ]),
  s('se-sci', 'Science and Technology', 5, 75, 25, [
    'Physics: force, pressure, light, electricity',
    'Chemistry: classification, acids, metals, carbon',
    'Biology: life processes, heredity, environment',
  ]),
  s('se-soc', 'Social Studies', 4, 100, 0, [
    'Constitution, federalism and civic duty',
    'Physical and economic geography of Nepal',
    'History, heritage and international relations',
  ]),
  s('se-hpe', 'Health, Population and Environment', 4, 75, 25, [
    'Population dynamics and demography',
    'Environment, hazard and disaster preparedness',
    'Community health project',
  ]),
  s('se-optmath', 'Optional I · Optional Mathematics', 4, 100, 0, [
    'Algebra, functions and polynomials',
    'Trigonometry, vectors and transformation',
    'Statistics and continuity',
  ]),
  s('se-comp', 'Optional II · Computer Science', 4, 50, 50, [
    'Computer systems and number systems',
    'Programming in QBASIC and C',
    'Database and web page fundamentals',
  ]),
  s('se-acc', 'Optional II · Accountancy', 4, 75, 25, [
    'Book-keeping and journal entries',
    'Ledger, trial balance and final accounts',
    'Government accounting basics',
  ]),
];

/* --------------------------------------------------------------------- +2 */

const sharedPlusTwo: Subject[] = [
  s('p-eng', 'Compulsory English', 5, 100, 0, [
    'Prose, poetry and one-act plays',
    'Reading strategy and critical response',
    'Academic writing and presentation',
  ]),
  s('p-nep', 'Compulsory Nepali', 5, 100, 0, [
    'साहित्यिक पाठहरू',
    'भाषिक सिप र व्याकरण',
    'समालोचनात्मक लेखन',
  ]),
  s('p-social', 'Social Studies and Life Skills', 3, 100, 0, [
    'Society, culture and identity',
    'Civic participation and law',
    'Life skills, ethics and career planning',
  ]),
];

const science: Stream = {
  id: 'science',
  name: 'Science',
  subjects: [
    ...sharedPlusTwo,
    s('p-math', 'Mathematics', 5, 100, 0, [
      'Algebra, trigonometry and analytic geometry',
      'Calculus: limits, derivatives and integrals',
      'Vectors, statistics and probability',
    ]),
    s('p-phy', 'Physics', 5, 75, 25, [
      'Mechanics, heat and thermodynamics',
      'Waves, optics, electricity and magnetism',
      'Modern physics and twelve rated practicals',
    ]),
    s('p-chem', 'Chemistry', 5, 75, 25, [
      'Atomic structure, bonding and periodicity',
      'Physical, inorganic and organic chemistry',
      'Volumetric and qualitative analysis practicals',
    ]),
    s('p-bio', 'Biology', 5, 75, 25, [
      'Botany: plant diversity, physiology, ecology',
      'Zoology: animal diversity, human biology',
      'Dissection alternatives and field study',
    ]),
    s('p-csc', 'Computer Science', 5, 75, 25, [
      'Programming in C and problem solving',
      'Data representation and computer architecture',
      'Database and web technology practicals',
    ]),
  ],
  careers: [
    'MBBS and BDS',
    'Engineering · IOE',
    'B.Sc. and B.Tech',
    'Agriculture and forestry',
    'Nursing and allied health',
    'Pilot training',
  ],
};

const management: Stream = {
  id: 'management',
  name: 'Management',
  subjects: [
    ...sharedPlusTwo,
    s('p-math', 'Mathematics', 5, 100, 0, [
      'Algebra, trigonometry and analytic geometry',
      'Calculus: limits, derivatives and integrals',
      'Vectors, statistics and probability',
    ]),
    s('p-acc', 'Accountancy', 5, 75, 25, [
      'Double entry, journal and ledger',
      'Partnership and company accounts',
      'Cost accounting and financial statements',
    ]),
    s('p-eco', 'Economics', 5, 100, 0, [
      'Microeconomics: demand, supply, market forms',
      'Macroeconomics: national income and money',
      'Nepalese economy and development issues',
    ]),
    s('p-bs', 'Business Studies', 5, 100, 0, [
      'Business environment and forms of ownership',
      'Management functions and marketing',
      'Entrepreneurship and a small business plan',
    ]),
    s('p-csc', 'Computer Science', 5, 75, 25, [
      'Programming in C and problem solving',
      'Data representation and computer architecture',
      'Database and web technology practicals',
    ]),
  ],
  careers: [
    'BBA and BBS',
    'Chartered accountancy',
    'Banking and insurance',
    'Hotel management',
    'Economics and public policy',
    'Family business',
  ],
};

const humanities: Stream = {
  id: 'humanities',
  name: 'Humanities',
  subjects: [
    ...sharedPlusTwo,
    s('p-majeng', 'Major English', 5, 100, 0, [
      'Short story, poetry and drama',
      'Literary criticism and close reading',
      'Extended essay and research writing',
    ]),
    s('p-soc', 'Sociology', 5, 100, 0, [
      'Concepts, institutions and social change',
      'Caste, ethnicity and gender in Nepal',
      'Field observation and report',
    ]),
    s('p-psy', 'Psychology', 5, 75, 25, [
      'Perception, memory and learning',
      'Developmental and social psychology',
      'Simple experiment and case record',
    ]),
    s('p-rd', 'Rural Development', 5, 100, 0, [
      'Rural society, poverty and livelihood',
      'Development planning in Nepal',
      'Local government and community projects',
    ]),
    s('p-masscom', 'Mass Communication', 5, 75, 25, [
      'Media systems, ethics and law',
      'News writing, editing and layout',
      'Radio and digital production practicals',
    ]),
  ],
  careers: [
    'BA and social work',
    'Law · BALLB',
    'Journalism and media',
    'Teaching · B.Ed',
    'Public service · Lok Sewa',
    'Development sector',
  ],
};

export const levels: Level[] = [
  {
    id: 'basic-1-5',
    marker: 'LEVEL 01',
    name: 'Basic Level · Lower',
    grades: 'Grades 1 – 5',
    blurb:
      'Where a student starts. English medium from the first day, class strength capped at thirty-six, and a single class teacher who stays with the group all year.',
    streams: [{ id: 'general', name: 'General', subjects: basicLower, careers: [] }],
  },
  {
    id: 'basic-6-8',
    marker: 'LEVEL 02',
    name: 'Basic Level · Upper',
    grades: 'Grades 6 – 8',
    blurb:
      'Subject teachers replace the class teacher, the laboratory opens fortnightly, and optional mathematics is introduced for students who are thinking about science.',
    streams: [{ id: 'general', name: 'General', subjects: basicUpper, careers: [] }],
  },
  {
    id: 'secondary-9-10',
    marker: 'LEVEL 03',
    name: 'Secondary · SEE',
    grades: 'Grades 9 – 10',
    blurb:
      'Two years to the Secondary Education Examination. Two optional subjects are chosen in grade nine and carried through, which is the first decision that narrows what comes after.',
    streams: [{ id: 'general', name: 'General', subjects: secondary, careers: [] }],
  },
  {
    id: 'plus-two',
    marker: 'LEVEL 04',
    name: 'Higher Secondary · +2',
    grades: 'Grades 11 – 12',
    blurb:
      'Where a student arrives. Three streams under the National Examinations Board, each of four elective subjects on top of the compulsory core.',
    streams: [science, management, humanities],
  },
];

export const plusTwoStreams = [science, management, humanities];

/* ---------------------------------------------------------------- Fees */

export const hostelFees: Record<HostelOption, number> = {
  none: 0,
  day: 4200,
  residential: 11500,
};

export const hostelLabels: Record<HostelOption, string> = {
  none: 'No hostel',
  day: 'Day boarding',
  residential: 'Full residential',
};

export const hostelNotes: Record<HostelOption, string> = {
  none: '',
  day: 'Lunch, evening snack and a supervised study hall until 17:30',
  residential: 'Room, three meals, laundry and a resident warden',
};

export const transportLabels: Record<'none' | 'under3' | '3to6' | 'over6', string> = {
  none: 'No transport',
  under3: 'Under 3 km',
  '3to6': '3 to 6 km',
  over6: 'Over 6 km',
};

export const feeLevels = [
  { id: 'basic-1-5', label: 'Basic 1 – 5' },
  { id: 'basic-6-8', label: 'Basic 6 – 8' },
  { id: 'secondary-9-10', label: 'Secondary 9 – 10' },
  { id: 'plus-two', label: '+2 · Grades 11 – 12' },
];

/**
 * Authored fee bands. `plus-two / humanities` is deliberately absent so that the
 * estimator's no-data state is reachable from the interface without editing code.
 */
export const feeBands: FeeBand[] = [
  {
    levelId: 'basic-1-5',
    lines: [
      { id: 'adm', label: 'Admission fee', note: 'One time, on first enrolment only', amount: 12000, cadence: 'once' },
      { id: 'tui', label: 'Monthly tuition', note: 'Teaching, exercise books and class materials', amount: 3800, cadence: 'monthly' },
      { id: 'exm', label: 'Examination fee', note: 'Charged once in each of the three terms', amount: 1200, cadence: 'termly' },
      { id: 'oth', label: 'Other charges', note: 'Library, ICT and sports levy', amount: 600, cadence: 'monthly' },
    ],
  },
  {
    levelId: 'basic-6-8',
    lines: [
      { id: 'adm', label: 'Admission fee', note: 'One time, on first enrolment only', amount: 14000, cadence: 'once' },
      { id: 'tui', label: 'Monthly tuition', note: 'Teaching, laboratory access and class materials', amount: 4400, cadence: 'monthly' },
      { id: 'exm', label: 'Examination fee', note: 'Charged once in each of the three terms', amount: 1400, cadence: 'termly' },
      { id: 'oth', label: 'Other charges', note: 'Library, ICT and sports levy', amount: 700, cadence: 'monthly' },
    ],
  },
  {
    levelId: 'secondary-9-10',
    lines: [
      { id: 'adm', label: 'Admission fee', note: 'One time, on first enrolment only', amount: 17500, cadence: 'once' },
      { id: 'tui', label: 'Monthly tuition', note: 'Includes the SEE preparation classes from grade ten', amount: 5200, cadence: 'monthly' },
      { id: 'exm', label: 'Examination fee', note: 'Charged once in each of the three terms', amount: 1800, cadence: 'termly' },
      { id: 'oth', label: 'Other charges', note: 'Laboratory, library and ICT levy', amount: 900, cadence: 'monthly' },
    ],
  },
  {
    levelId: 'plus-two',
    streamId: 'science',
    lines: [
      { id: 'adm', label: 'Admission fee', note: 'One time, includes NEB registration', amount: 26000, cadence: 'once' },
      { id: 'tui', label: 'Monthly tuition', note: 'Includes twelve rated practical hours a month', amount: 7600, cadence: 'monthly' },
      { id: 'exm', label: 'Examination fee', note: 'Term papers and NEB practical examination', amount: 2600, cadence: 'termly' },
      { id: 'oth', label: 'Other charges', note: 'Laboratory consumables and ICT levy', amount: 1400, cadence: 'monthly' },
    ],
  },
  {
    levelId: 'plus-two',
    streamId: 'management',
    lines: [
      { id: 'adm', label: 'Admission fee', note: 'One time, includes NEB registration', amount: 21000, cadence: 'once' },
      { id: 'tui', label: 'Monthly tuition', note: 'Includes computer application hours', amount: 6100, cadence: 'monthly' },
      { id: 'exm', label: 'Examination fee', note: 'Term papers and NEB practical examination', amount: 2200, cadence: 'termly' },
      { id: 'oth', label: 'Other charges', note: 'Library, ICT and sports levy', amount: 1000, cadence: 'monthly' },
    ],
  },
];

export const eligibility = [
  {
    id: 'e-basic',
    level: 'Basic 1 – 5',
    requirement: 'Age five by 1 Baishakh; birth registration; transfer certificate if applicable',
    intake: '36 per section, 2 sections',
    admissionFee: 12000,
    monthly: 3800,
  },
  {
    id: 'e-upper',
    level: 'Basic 6 – 8',
    requirement: 'Marksheet of the last completed grade; entrance in English and mathematics',
    intake: '40 per section, 2 sections',
    admissionFee: 14000,
    monthly: 4400,
  },
  {
    id: 'e-secondary',
    level: 'Secondary 9 – 10',
    requirement: 'Grade 8 basic level certificate; entrance in English, mathematics and science',
    intake: '40 per section, 2 sections',
    admissionFee: 17500,
    monthly: 5200,
  },
  {
    id: 'e-sci',
    level: '+2 Science',
    requirement: 'SEE with GPA 2.4 and C+ in mathematics, science and English',
    intake: '40 per section, 2 sections',
    admissionFee: 26000,
    monthly: 7600,
  },
  {
    id: 'e-mgmt',
    level: '+2 Management',
    requirement: 'SEE with GPA 1.6 and D+ in mathematics and English',
    intake: '48 per section, 1 section',
    admissionFee: 21000,
    monthly: 6100,
  },
  {
    id: 'e-hum',
    level: '+2 Humanities',
    requirement: 'SEE with GPA 1.6 and D+ in English',
    intake: '48 per section, 1 section',
    admissionFee: 0,
    monthly: 0,
  },
];

/* -------------------------------------------------------- Stream chooser */

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    index: 1,
    prompt: 'Which class do you look forward to most?',
    options: [
      { id: 'q1a', label: 'Physics or biology practicals', weights: { science: 3, management: 0, humanities: 0 } },
      { id: 'q1b', label: 'Accounts and business studies', weights: { science: 0, management: 3, humanities: 0 } },
      { id: 'q1c', label: 'History, civics or literature', weights: { science: 0, management: 0, humanities: 3 } },
      { id: 'q1d', label: 'Mathematics, whatever it is applied to', weights: { science: 2, management: 2, humanities: 0 } },
    ],
  },
  {
    id: 'q2',
    index: 2,
    prompt: 'How do you prefer to work through a problem?',
    options: [
      { id: 'q2a', label: 'Measure it, then prove it', weights: { science: 3, management: 1, humanities: 0 } },
      { id: 'q2b', label: 'Weigh what it costs, then decide', weights: { science: 0, management: 3, humanities: 1 } },
      { id: 'q2c', label: 'Read around it and argue a position', weights: { science: 0, management: 1, humanities: 3 } },
      { id: 'q2d', label: 'Build something and see what breaks', weights: { science: 2, management: 2, humanities: 0 } },
    ],
  },
  {
    id: 'q3',
    index: 3,
    prompt: 'Ten years from now, which room are you working in?',
    options: [
      { id: 'q3a', label: 'A hospital or a laboratory', weights: { science: 3, management: 0, humanities: 0 } },
      { id: 'q3b', label: 'A bank, an office, or my own shop', weights: { science: 0, management: 3, humanities: 0 } },
      { id: 'q3c', label: 'A classroom, a courtroom or a newsroom', weights: { science: 0, management: 1, humanities: 3 } },
      { id: 'q3d', label: 'A site office or an engineering firm', weights: { science: 3, management: 1, humanities: 0 } },
    ],
  },
  {
    id: 'q4',
    index: 4,
    prompt: 'Which piece of homework would you finish first?',
    options: [
      { id: 'q4a', label: 'A lab report with readings and a graph', weights: { science: 3, management: 1, humanities: 0 } },
      { id: 'q4b', label: 'A month’s budget for a small shop', weights: { science: 0, management: 3, humanities: 0 } },
      { id: 'q4c', label: 'An essay about a district you have visited', weights: { science: 0, management: 0, humanities: 3 } },
      { id: 'q4d', label: 'A survey of your neighbours, with charts', weights: { science: 1, management: 2, humanities: 2 } },
    ],
  },
  {
    id: 'q5',
    index: 5,
    prompt: 'Pick the sentence that sounds most like you.',
    options: [
      { id: 'q5a', label: 'I want to know how a thing actually works', weights: { science: 3, management: 0, humanities: 1 } },
      { id: 'q5b', label: 'I notice what things cost and who pays', weights: { science: 0, management: 3, humanities: 1 } },
      { id: 'q5c', label: 'I notice who is being left out', weights: { science: 0, management: 1, humanities: 3 } },
      { id: 'q5d', label: 'I would rather organise people than data', weights: { science: 0, management: 2, humanities: 2 } },
    ],
  },
  {
    id: 'q6',
    index: 6,
    prompt: 'Which subject could you drop without regret?',
    options: [
      { id: 'q6a', label: 'Literature', weights: { science: 2, management: 1, humanities: 0 } },
      { id: 'q6b', label: 'Chemistry', weights: { science: 0, management: 2, humanities: 2 } },
      { id: 'q6c', label: 'Accountancy', weights: { science: 2, management: 0, humanities: 2 } },
      { id: 'q6d', label: 'None of them — I would keep all three', weights: { science: 1, management: 1, humanities: 1 } },
    ],
  },
];

export const coursesIntro = {
  eyebrow: '02 / WHAT WE TEACH',
  statement: ['FROM GRADE ONE', 'TO THE BOARD', 'EXAMINATION.'],
  support:
    'Four levels, one campus, and no gap where a student has to move schools in order to keep going. The subject lists, the marks split and the fee for each level are all below — nothing here is behind a form.',
};
