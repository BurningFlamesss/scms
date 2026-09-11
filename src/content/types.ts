/**
 * Content contracts — Section 8 of the brief, extended by Addendum B8.
 * Every component on this site reads one of these shapes. Swapping the
 * placeholder modules in this directory for a live CMS response is a
 * one-file change per shape; no component knows where the data came from.
 */

export type Img = { src: string; alt: string; width: number; height: number };

/* ---------------------------------------------------------------- Section 8 */

export type Notice = {
  id: string;
  title: string;
  publishedAt: string;
  href?: string;
  pinned: boolean;
};

export type Stat = { id: string; label: string; value: number; suffix?: string };

export type Pillar = {
  id: string;
  label: string;
  title: string;
  blurb: string;
  href: string;
  image: Img;
};

export type Frame = { src: string; alt: string; caption?: string; width: number; height: number };

export type Milestone = {
  index: number;
  marker: string;
  title: string;
  blurb: string;
  body: string[];
  image?: Img;
};

export type Person = { id: string; name: string; role: string; quote?: string; photo: Img };

export type Subject = {
  id: string;
  name: string;
  creditHours: number;
  theory: number;
  practical: number;
  outline: string[];
};

export type StreamId = 'science' | 'management' | 'humanities' | 'general';

export type Stream = {
  id: StreamId;
  name: string;
  subjects: Subject[];
  careers: string[];
};

export type Level = {
  id: string;
  marker: string;
  name: string;
  grades: string;
  blurb: string;
  streams: Stream[];
};

export type PlanBlock = { id: string; d: string; cx: number; cy: number };

export type Facility = {
  id: string;
  name: string;
  room: string;
  note: string;
  specs: string[];
  capacity: string;
  hours: string;
  images: Img[];
  block: PlanBlock;
};

export type Album = {
  id: string;
  event: string;
  year: string;
  category: string;
  date: string;
  photos: Img[];
};

export type Dept = {
  id: string;
  name: string;
  contact: string;
  phones: string[];
  email: string;
  hours: string;
};

/* ------------------------------------------------------------- Addendum B8 */

export type NepaliDate = { bs: string; ad: string };

export type Cadence = 'once' | 'monthly' | 'termly';

export type FeeLine = {
  id: string;
  label: string;
  note: string;
  amount: number;
  cadence: Cadence;
  /** Set when the amount was read from another CMS record, e.g. a bus route. */
  sourceRouteId?: string;
};

export type TransportBand = 'none' | 'under3' | '3to6' | 'over6';
export type HostelOption = 'none' | 'day' | 'residential';

export type FeeBand = {
  levelId: string;
  streamId?: StreamId;
  transport?: TransportBand;
  hostel?: HostelOption;
  lines: FeeLine[];
};

export type EventKind = 'exam' | 'holiday' | 'festival' | 'event' | 'admission';

export type CalEvent = {
  id: string;
  kind: EventKind;
  title: string;
  titleNe?: string;
  date: NepaliDate;
  endDate?: NepaliDate;
  detail?: string;
  allDay: boolean;
};

export type Term = { id: string; name: string; start: NepaliDate; end: NepaliDate };

export type Stop = {
  id: string;
  name: string;
  nameNe?: string;
  landmark: string;
  pickup: string;
  drop: string;
  order: number;
};

export type BusRoute = {
  id: string;
  name: string;
  busNo: string;
  monthlyFare: number;
  band: Exclude<TransportBand, 'none'>;
  stops: Stop[];
  path: string;
};

export type AreaAlias = { areaId: string; ward?: number; aliases: string[] };

export type QuizStreamId = Exclude<StreamId, 'general'>;
export type QuizOption = { id: string; label: string; weights: Record<QuizStreamId, number> };
export type QuizQuestion = { id: string; index: number; prompt: string; options: QuizOption[] };

/* -------------------------------------------------- Addendum B6 utilities */

export type Period = { id: string; label: string; start: string; end: string; kind: 'class' | 'break' };

export type RoutineClass = {
  id: string;
  grade: string;
  section: string;
  /** Index 0 = Sunday … 5 = Friday. Each row holds one entry per teaching period. */
  week: string[][];
};

export type ResultYear = {
  year: string;
  yearBs: string;
  appeared: number;
  passed: number;
  distinction: number;
  firstDivision: number;
  secondDivision: number;
};

export type Download = {
  id: string;
  title: string;
  category: string;
  format: string;
  sizeKb: number;
  updated: NepaliDate;
};

export type ThenNow = {
  id: string;
  title: string;
  thenLabel: string;
  nowLabel: string;
  then: Img;
  now: Img;
  note: string;
};

export type CrestPart = {
  id: string;
  label: string;
  meaning: string;
  /** Direction the element travels when the crest comes apart. */
  dx: number;
  dy: number;
  /** Where the hairline leader line terminates, in crest viewBox units. */
  lx: number;
  ly: number;
  side: 'left' | 'right';
};
