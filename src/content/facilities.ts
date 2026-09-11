import { photos } from './images';
import type { AreaAlias, BusRoute, Facility } from './types';

export const facilitiesIntro = {
  eyebrow: '03 / THE CAMPUS',
  statement: ['NINE ROOMS', 'AND A GROUND.'],
  support:
    'Everything below is on one plot in ward eight. The plan is drawn to the actual arrangement of the buildings, so a parent walking in at the gate can find the office, the laboratory or the hostel without asking.',
};

/** Campus plan, drawn in a 0 0 960 600 viewBox. Blocks only — no illustration detail. */
export const facilities: Facility[] = [
  {
    id: 'f-classrooms',
    name: 'Smart classrooms',
    room: 'BLOCK A · GROUND AND FIRST',
    note: 'Twenty-eight rooms, each with a projector and a whiteboard',
    specs: ['28 rooms across two floors', 'Maximum 40 desks per room', 'Projector, whiteboard and fan in every room'],
    capacity: '1,120 seats',
    hours: 'Sunday to Friday, 07:00 – 16:30',
    images: [photos.classroomLesson, photos.classroomEmpty, photos.classroomStudents],
    block: { id: 'f-classrooms', d: 'M60 60 H320 V190 H60 Z', cx: 190, cy: 125 },
  },
  {
    id: 'f-science',
    name: 'Science laboratories',
    room: 'BLOCK B · FIRST FLOOR',
    note: 'Separate physics, chemistry and biology benches',
    specs: ['3 laboratories, 24 stations each', 'Fume cupboard and eyewash in chemistry', 'Open until 17:00 for +2 practicals'],
    capacity: '72 stations',
    hours: 'Sunday to Friday, 07:30 – 17:00',
    images: [photos.labGlass, photos.labWork, photos.labPour],
    block: { id: 'f-science', d: 'M350 60 H570 V190 H350 Z', cx: 460, cy: 125 },
  },
  {
    id: 'f-computer',
    name: 'Computer laboratory',
    room: 'BLOCK B · GROUND FLOOR',
    note: 'Forty-two machines, one between two pupils at basic level',
    specs: ['42 desktop machines', 'Fibre line, 100 Mbps, filtered', 'Timetabled for every grade from three upward'],
    capacity: '42 machines',
    hours: 'Sunday to Friday, 07:30 – 16:30',
    images: [photos.computerLab, photos.computerDesks, photos.laptopWork],
    block: { id: 'f-computer', d: 'M600 60 H780 V190 H600 Z', cx: 690, cy: 125 },
  },
  {
    id: 'f-hostel',
    name: 'Residential hostel',
    room: 'BLOCK D · EAST WING',
    note: 'Eighty places with a resident warden and a supervised study hall',
    specs: ['80 places, 2 to 4 per room', 'Supervised study 18:30 – 21:00', 'Resident warden and night security'],
    capacity: '80 residents',
    hours: 'All week, 24 hours',
    images: [photos.hostelRoom, photos.hostelWash, photos.libraryGroup],
    block: { id: 'f-hostel', d: 'M810 60 H920 V300 H810 Z', cx: 865, cy: 180 },
  },
  {
    id: 'f-library',
    name: 'Library and reading room',
    room: 'BLOCK A · GROUND FLOOR',
    note: 'Eleven thousand titles and sixty reading seats',
    specs: ['11,240 catalogued titles', '60 reading seats, silent after 15:00', 'Reference section for SEE and NEB past papers'],
    capacity: '60 seats',
    hours: 'Sunday to Friday, 07:00 – 17:00',
    images: [photos.library, photos.libraryAisle, photos.libraryReading, photos.libraryStacks],
    block: { id: 'f-library', d: 'M60 230 H300 V380 H60 Z', cx: 180, cy: 305 },
  },
  {
    id: 'f-canteen',
    name: 'Canteen',
    room: 'BLOCK C · GROUND FLOOR',
    note: 'Two services a day, menu posted weekly at the counter',
    specs: ['220 covers per service', 'Snack at 10:20, lunch at 12:40', 'No packaged drinks sold on site'],
    capacity: '220 covers',
    hours: 'Sunday to Friday, 09:30 – 14:30',
    images: [photos.canteenInterior, photos.canteenCounter, photos.canteenMeal],
    block: { id: 'f-canteen', d: 'M330 230 H490 V330 H330 Z', cx: 410, cy: 280 },
  },
  {
    id: 'f-medical',
    name: 'Medical room',
    room: 'BLOCK C · GROUND FLOOR',
    note: 'A resident health assistant is on site through the school day',
    specs: ['2 observation beds', 'Resident health assistant, 07:00 – 16:30', 'Referral arrangement with Manipal Hospital'],
    capacity: '2 beds',
    hours: 'Sunday to Friday, 07:00 – 16:30',
    images: [photos.medicalRoom, photos.medicalNurse],
    block: { id: 'f-medical', d: 'M520 230 H650 V330 H520 Z', cx: 585, cy: 280 },
  },
  {
    id: 'f-sports',
    name: 'Sports ground',
    room: 'OPEN GROUND · SOUTH',
    note: 'Football pitch, a two hundred metre track and a covered court',
    specs: ['200 m track, six lanes', 'Football, volleyball and basketball', 'Covered court used through the monsoon'],
    capacity: 'Whole school assembly',
    hours: 'Sunday to Friday, 06:30 – 18:00',
    images: [photos.sportsTrack, photos.sportsField, photos.sportsCourt, photos.sportsTeam],
    block: { id: 'f-sports', d: 'M330 370 H780 V550 H330 Z', cx: 555, cy: 460 },
  },
  {
    id: 'f-transport',
    name: 'Transport bay',
    room: 'GATE · WEST',
    note: 'Eight buses on three routes across the valley',
    specs: ['8 buses, 3 routes', 'Morning pickup from 06:15', 'Attendant on every bus'],
    capacity: '340 seats daily',
    hours: 'Sunday to Friday, 06:00 – 17:00',
    images: [photos.road, photos.campusFacade],
    block: { id: 'f-transport', d: 'M60 420 H300 V550 H60 Z', cx: 180, cy: 485 },
  },
];

/**
 * Bus routes. This is the ONLY place a transport fare is authored anywhere on
 * the site — the fee estimator reads `monthlyFare` from this same record, which
 * is why the two widgets cannot disagree.
 */
export const busRoutes: BusRoute[] = [
  {
    id: 'route-lakeside',
    name: 'Lakeside – Bagar Loop',
    busNo: 'GA 2 KHA 4821',
    monthlyFare: 1650,
    band: 'under3',
    path: 'M 30 120 L 140 104 L 250 112 L 360 92 L 470 100 L 580 78 L 690 84',
    stops: [
      { id: 'st-prithvi', name: 'Prithvi Chowk', nameNe: 'पृथ्वी चोक', landmark: 'Pokhara Bus Park', pickup: '06:52', drop: '16:18', order: 1 },
      { id: 'st-nadipur', name: 'Nadipur', nameNe: 'नदीपुर', landmark: 'Nadipur Patan', pickup: '06:57', drop: '16:13', order: 2 },
      { id: 'st-chipledhunga', name: 'Chipledhunga', nameNe: 'चिप्लेढुङ्गा', landmark: 'Mahendrapul', pickup: '07:03', drop: '16:07', order: 3 },
      { id: 'st-bagar', name: 'Bagar', nameNe: 'बागर', landmark: 'Bagar Chautari', pickup: '07:09', drop: '16:01', order: 4 },
      { id: 'st-baidam', name: 'Baidam', nameNe: 'बैदाम', landmark: 'Barahi Chowk', pickup: '07:15', drop: '15:55', order: 5 },
      { id: 'st-lakeside', name: 'Lakeside', nameNe: 'लेकसाईड', landmark: 'Hallan Chowk', pickup: '07:21', drop: '15:49', order: 6 },
    ],
  },
  {
    id: 'route-amarsingh',
    name: 'Amarsingh – Birauta Line',
    busNo: 'GA 1 KHA 2290',
    monthlyFare: 2400,
    band: '3to6',
    path: 'M 30 60 L 140 78 L 250 66 L 360 88 L 470 74 L 580 96 L 690 82',
    stops: [
      { id: 'st-amarsingh', name: 'Amarsingh Chowk', nameNe: 'अमरसिंह चोक', landmark: 'Amarsingh Gate', pickup: '06:40', drop: '16:30', order: 1 },
      { id: 'st-simalchaur', name: 'Simalchaur', nameNe: 'सिमलचौर', landmark: 'Simalchaur Ground', pickup: '06:46', drop: '16:24', order: 2 },
      { id: 'st-ranipauwa', name: 'Ranipauwa', nameNe: 'रानीपौवा', landmark: 'Ranipauwa Gate', pickup: '06:52', drop: '16:18', order: 3 },
      { id: 'st-bijayapur', name: 'Bijayapur', nameNe: 'बिजयपुर', landmark: 'Bijayapur Bridge', pickup: '06:59', drop: '16:11', order: 4 },
      { id: 'st-deep', name: 'Deep', nameNe: 'दीप', landmark: 'Deep Chowk', pickup: '07:06', drop: '16:04', order: 5 },
      { id: 'st-birauta', name: 'Birauta', nameNe: 'बिरौटा', landmark: 'Birauta Chowk', pickup: '07:13', drop: '15:57', order: 6 },
    ],
  },
  {
    id: 'route-hemja',
    name: 'Hemja – Batulechaur Line',
    busNo: 'GA 2 KHA 5514',
    monthlyFare: 3100,
    band: 'over6',
    path: 'M 30 170 L 140 150 L 250 162 L 360 140 L 470 152 L 580 132 L 690 142',
    stops: [
      { id: 'st-hemja', name: 'Hemja', nameNe: 'हेम्जा', landmark: 'Hemja Bazaar', pickup: '06:15', drop: '16:52', order: 1 },
      { id: 'st-dhungesanghu', name: 'Dhungesanghu', nameNe: 'ढुङ्गेसाँघु', landmark: 'Dhungesanghu Bridge', pickup: '06:22', drop: '16:45', order: 2 },
      { id: 'st-milanchowk', name: 'Milanchowk', nameNe: 'मिलनचोक', landmark: 'Milanchowk Gate', pickup: '06:31', drop: '16:36', order: 3 },
      { id: 'st-batulechaur', name: 'Batulechaur', nameNe: 'बटुलेचौर', landmark: 'Batulechaur Temple', pickup: '06:40', drop: '16:27', order: 4 },
      { id: 'st-vindhyabasini', name: 'Vindhyabasini', nameNe: 'बिन्ध्यबासिनी', landmark: 'Temple Steps', pickup: '06:49', drop: '16:18', order: 5 },
      { id: 'st-miruwa', name: 'Miruwa', nameNe: 'मिरुवा', landmark: 'Miruwa Tole', pickup: '06:58', drop: '16:09', order: 6 },
    ],
  },
];

/** Which stop belongs to which searchable area. */
export const stopArea: Record<string, string> = {
  'st-prithvi': 'prithvi',
  'st-nadipur': 'nadipur',
  'st-chipledhunga': 'chipledhunga',
  'st-bagar': 'bagar',
  'st-baidam': 'lakeside',
  'st-lakeside': 'lakeside',
  'st-amarsingh': 'amarsingh',
  'st-simalchaur': 'simalchaur',
  'st-ranipauwa': 'ranipauwa',
  'st-bijayapur': 'bijayapur',
  'st-deep': 'deep',
  'st-birauta': 'birauta',
  'st-hemja': 'hemja',
  'st-dhungesanghu': 'dhungesanghu',
  'st-milanchowk': 'milanchowk',
  'st-batulechaur': 'batulechaur',
  'st-vindhyabasini': 'vindhyabasini',
  'st-miruwa': 'miruwa',
};

export const areaAliases: AreaAlias[] = [
  { areaId: 'prithvi', ward: 8, aliases: ['Prithvi Chowk', 'पृथ्वी चोक', 'Bus Park', 'Prithbi Chowk'] },
  { areaId: 'nadipur', ward: 3, aliases: ['Nadipur', 'नदीपुर', 'Nadipur Patan'] },
  { areaId: 'chipledhunga', ward: 8, aliases: ['Chipledhunga', 'चिप्लेढुङ्गा', 'Mahendrapul', 'New Road'] },
  { areaId: 'bagar', ward: 1, aliases: ['Bagar', 'बागर', 'Bagar Chautari'] },
  { areaId: 'lakeside', ward: 6, aliases: ['Lakeside', 'लेकसाईड', 'Baidam', 'बैदाम', 'Hallan Chowk', 'Barahi Chowk'] },
  { areaId: 'amarsingh', ward: 11, aliases: ['Amarsingh Chowk', 'अमरसिंह चोक', 'Amarsingh'] },
  { areaId: 'simalchaur', ward: 12, aliases: ['Simalchaur', 'सिमलचौर', 'Simalchaur Ground'] },
  { areaId: 'ranipauwa', ward: 16, aliases: ['Ranipauwa', 'रानीपौवा'] },
  { areaId: 'bijayapur', ward: 15, aliases: ['Bijayapur', 'बिजयपुर', 'Bijayapur Bridge'] },
  { areaId: 'deep', ward: 17, aliases: ['Deep', 'दीप', 'Deep Chowk'] },
  { areaId: 'birauta', ward: 17, aliases: ['Birauta', 'बिरौटा', 'Birauta Chowk'] },
  { areaId: 'hemja', ward: 25, aliases: ['Hemja', 'हेम्जा', 'Hemja Bazaar'] },
  { areaId: 'dhungesanghu', ward: 24, aliases: ['Dhungesanghu', 'ढुङ्गेसाँघु'] },
  { areaId: 'milanchowk', ward: 22, aliases: ['Milanchowk', 'मिलनचोक', 'Milan Chowk'] },
  { areaId: 'batulechaur', ward: 2, aliases: ['Batulechaur', 'बटुलेचौर'] },
  { areaId: 'vindhyabasini', ward: 3, aliases: ['Vindhyabasini', 'बिन्ध्यबासिनी', 'Bindhyabasini', 'Temple Steps'] },
  { areaId: 'miruwa', ward: 26, aliases: ['Miruwa', 'मिरुवा', 'Miruwa Tole'] },
];

/** Shown as chips beneath the search field so the finder is usable without typing. */
export const popularAreas = ['Lakeside', 'Bagar', 'Amarsingh Chowk', 'Bijayapur', 'Hemja', 'Batulechaur'];
