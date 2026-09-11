/**
 * Verified image manifest.
 *
 * Every id below was HTTP-200 validated AND visually inspected on a contact
 * sheet before being committed, so the key names describe what the photograph
 * actually shows. Use `photo()` / `thumb()` so sizing stays consistent.
 */

const BASE = "https://images.unsplash.com";

const ID = {
  /* --- Classrooms and academic life --- */
  classroomTeens: "photo-1509062522246-3755977927d7",
  emptyClassroom: "photo-1580582932707-520aed937b7b",
  primaryClassroom: "photo-1577896851231-70ef18881754",
  youngLearners: "photo-1588072432836-e10032774350",
  earlyLearning: "photo-1503676260728-1c00da094a0b",
  lectureRoom: "photo-1524178232363-1fb2b075b655",
  equations: "photo-1509228468518-180dd4864904",
  writingHands: "photo-1503428593586-e225b39bddfe",

  /* --- Library and reading --- */
  libraryHall: "photo-1568667256549-094345857637",
  bookshelves: "photo-1481627834876-b7833e8f5570",
  libraryShelf: "photo-1521587760476-6c12a4b040da",
  booksStacked: "photo-1533669955142-6a73332af4db",
  booksSpines: "photo-1497633762265-9d179a990aa6",
  studentLibrary: "photo-1567168539593-59673ababaae",
  readingSupport: "photo-1583468982228-19f19164aee2",

  /* --- Science --- */
  laboratory: "photo-1579154204601-01588f351e67",
  labGlassware: "photo-1532094349884-543bc11b234d",
  colouredFlasks: "photo-1554475900-0a0350e3fc7b",
  microscope: "photo-1582719471384-894fbb16e074",
  dnaHelix: "photo-1628595351029-c2bf17511435",
  molecule: "photo-1594026112284-02bb6f3352fe",
  labCoat: "photo-1576091160399-112ba8d25d1d",

  /* --- Technology and collaboration --- */
  computerLab: "photo-1531482615713-2afd69097998",
  studyPair: "photo-1522202176988-66273c2fd55f",
  studentsTeamwork: "photo-1543269865-cbf427effbad",
  studentGroup: "photo-1517486808906-6ca8b3f04846",
  studentsWithBooks: "photo-1571260899304-425eee4c7efc",
  teacherPortrait: "photo-1580894732444-8ecded7900cd",

  /* --- Sport --- */
  athleticsTrack: "photo-1461896836934-ffe607ba8211",
  pitchLine: "photo-1459865264687-595d652de67e",
  basketball: "photo-1546519638-68e109498ffc",
  indoorGym: "photo-1571902943202-507ec2618e8f",

  /* --- Campus, residence and services --- */
  schoolBuilding: "photo-1562774053-701939374585",
  auditoriumAudience: "photo-1540575467063-178a50c2df87",
  auditoriumSeats: "photo-1519452575417-564c1401ecc0",
  assemblyCrowd: "photo-1517457373958-b7bdd4587205",
  hostelRoom: "photo-1555854877-bab0e564b8d5",
  diningHall: "photo-1567521464027-f127ff144326",
  nutritionBowl: "photo-1546069901-ba9599a7e63c",
  healthRoom: "photo-1519494026892-80bbd2d6fd0d",
  coachBus: "photo-1570125909232-eb263c188f7e",
  busFront: "photo-1557223562-6c77ef16210f",
  seedlings: "photo-1523348837708-15d4a09cfac2",
  gardening: "photo-1416879595882-3373a0480b5b",
  himalaya: "photo-1544735716-392fe2489ffa",

  /* --- Arts --- */
  musicStage: "photo-1514320291840-2e0a9bf2a9ae",
  performingArts: "photo-1493225457124-a3eb161ffa5f",
  craftSupplies: "photo-1452860606245-08befc0ff44b",
  paintBrushes: "photo-1460661419201-fd4cecdf8a8b",
  paintBrush: "photo-1513364776144-60967b0f800f",
  illustration: "photo-1596548438137-d51ea5c83ca5",
  abstractArt: "photo-1541961017774-22349e4a1262",
} as const;

export type MediaKey = keyof typeof ID;

/** Wide editorial image (feature panels, programme headers). */
export const photo = (key: MediaKey, width = 1600): string =>
  `${BASE}/${ID[key]}?auto=format&fit=crop&w=${width}&q=80`;

/** Square thumbnail (rails, gallery tiles). */
export const thumb = (key: MediaKey, size = 480): string =>
  `${BASE}/${ID[key]}?auto=format&fit=crop&w=${size}&h=${size}&q=75`;

export const media = ID;
