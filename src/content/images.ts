import type { Img } from './types';

const U = 'https://images.unsplash.com/';

/** Every photograph on the site is declared here once, with final-quality alt text. */
export function img(id: string, alt: string, width = 1600, height = 1067): Img {
  return { src: U + id, alt, width, height };
}

export const photos = {
  campusMorning: img(
    'photo-1562774053-701939374585',
    'The main academic block seen across the front lawn in early morning light',
  ),
  campusModern: img(
    'photo-1600585154340-be6161a56a0c',
    'The newer science and computing wing at the eastern edge of the campus',
  ),
  campusBlock: img(
    'photo-1576495199011-eb94736d05d6',
    'The three-storey secondary block with its open corridor walkways',
  ),
  campusFacade: img(
    'photo-1613896527026-f195d5c818ed',
    'The painted facade of the primary block facing the assembly ground',
  ),
  assemblyAerial: img(
    'photo-1541888946425-d81bb19240f5',
    'Students lined up in house rows on the assembly ground, seen from above',
  ),
  assemblyHall: img(
    'photo-1524178232363-1fb2b075b655',
    'The multipurpose hall filled for a morning assembly',
  ),
  auditorium: img('photo-1519452635265-7b1fbfd1e4e0', 'Rows of seating in the school auditorium'),
  classroomLesson: img(
    'photo-1577896851231-70ef18881754',
    'A teacher working at the board with a full class of secondary students',
  ),
  classroomEmpty: img(
    'photo-1580582932707-520aed937b7b',
    'A smart classroom set up with paired desks before the first period',
  ),
  classroomWriting: img(
    'photo-1517048676732-d65bc937f952',
    'Students writing at their desks during a terminal examination',
  ),
  classroomPrimary: img(
    'photo-1588072432836-e10032774350',
    'Basic level pupils working on a drawing task at a shared table',
  ),
  classroomStudents: img(
    'photo-1509062522246-3755977927d7',
    'A grade nine class in session, seen from the back of the room',
  ),
  labGlass: img(
    'photo-1532094349884-543bc11b234d',
    'Glassware set out on a laboratory bench before a chemistry practical',
  ),
  labPour: img(
    'photo-1554475901-4538ddfbccc2',
    'A student measuring a solution into a conical flask during a titration',
  ),
  labWork: img(
    'photo-1581091226825-a6a2a5aee158',
    'Two students recording readings from an experiment in the physics laboratory',
  ),
  computerLab: img(
    'photo-1531482615713-2afd69097998',
    'Students working at desktop machines in the computer laboratory',
  ),
  computerDesks: img(
    'photo-1519389950473-47ba0277781c',
    'Workstations laid out along the length of the computer laboratory',
  ),
  library: img(
    'photo-1524995997946-a1c2e315a42f',
    'The curved shelving of the main reading room in the school library',
  ),
  libraryAisle: img(
    'photo-1481627834876-b7833e8f5570',
    'A quiet aisle between the reference shelves in the library',
  ),
  libraryReading: img(
    'photo-1567168544813-cc03465b4fa8',
    'A senior student reading at the library window',
  ),
  libraryStacks: img(
    'photo-1427504494785-3a9ca7044f45',
    'A student choosing a title from the fiction stacks',
  ),
  libraryGroup: img(
    'photo-1523240795612-9a054b0db644',
    'Students working together at a reading table in the library',
  ),
  hostelRoom: img(
    'photo-1590490360182-c33d57733427',
    'A residential hostel room with two beds and study desks',
  ),
  hostelWash: img(
    'photo-1584622650111-993a426fbf0a',
    'The washroom block serving the residential hostel',
  ),
  canteenInterior: img(
    'photo-1555396273-367ea4eb4db5',
    'The canteen seating area between the morning and lunch services',
  ),
  canteenCounter: img(
    'photo-1552566626-52f8b828add9',
    'The serving counter at the school canteen',
  ),
  canteenMeal: img(
    'photo-1546069901-ba9599a7e63c',
    'A prepared lunch tray of rice, lentils and seasonal vegetables',
  ),
  road: img(
    'photo-1602081957921-9137a5d6eaee',
    'The valley road at first light on the Hemja pickup route',
  ),
  sportsTrack: img(
    'photo-1461896836934-ffe607ba8211',
    'A runner in the blocks at the start of the hundred metres',
  ),
  sportsField: img(
    'photo-1607962837359-5e7e89f86776',
    'Students running on the ground at the close of the school day',
  ),
  sportsCourt: img(
    'photo-1544919982-b61976f0ba43',
    'The covered basketball court after evening practice',
  ),
  sportsCycling: img('photo-1541625602330-2277a4c46182', 'The inter-house cycling event on the ring road'),
  sportsSwim: img('photo-1530549387789-4c1017266635', 'A swimmer at the district-level meet'),
  sportsTeam: img('photo-1533560904424-a0c61dc306fc', 'The senior football team during a warm-up drill'),
  medicalRoom: img(
    'photo-1538108149393-fbbd81895907',
    'The school medical room with two observation beds',
  ),
  medicalNurse: img(
    'photo-1631217868264-e5b90bb7e133',
    'The resident health assistant checking a pupil in the medical room',
  ),
  graduation: img(
    'photo-1541339907198-e08756dedf3f',
    'Caps thrown at the close of the grade twelve farewell',
  ),
  celebration: img(
    'photo-1541532713592-79a0317b6b77',
    'Students celebrating together after the annual results were published',
  ),
  medals: img(
    'photo-1571008592377-e362723e8998',
    'Junior athletes with their medals after the annual sports meet',
  ),
  groupOutdoors: img(
    'photo-1517486808906-6ca8b3f04846',
    'A group of senior students together on the front steps',
  ),
  groupStudy: img(
    'photo-1522202176988-66273c2fd55f',
    'Three students working through a problem set together',
  ),
  groupProject: img(
    'photo-1571260899304-425eee4c7efc',
    'A project group presenting their work to classmates',
  ),
  whiteboard: img(
    'photo-1596495577886-d920f1fb7238',
    'A physics derivation worked through on the whiteboard',
  ),
  whiteboardPlan: img(
    'photo-1596496181871-9681eacf9764',
    'A teacher mapping out the term plan on the staff room board',
  ),
  stage: img('photo-1516450360452-9312f5e86fc7', 'The cultural programme stage during the annual day'),
  sunflowers: img(
    'photo-1591035897819-f4bdf739f446',
    'Students on the annual excursion in the fields above the valley',
  ),
  mountainsDawn: img(
    'photo-1506905925346-21bda4d32df4',
    'The Annapurna range at dawn, seen from the Sarangkot excursion',
  ),
  mountainsValley: img(
    'photo-1464822759023-fed622ff2c3b',
    'The valley below Sarangkot on the morning of the school excursion',
  ),
  mountainsRidge: img(
    'photo-1470071459604-3b5ec3a7fe05',
    'The ridge walk taken by the senior excursion group',
  ),
  mountainsNight: img(
    'photo-1519681393784-d120267933ba',
    'The night sky above the valley during the astronomy club field trip',
  ),
  booksStack: img('photo-1497633762265-9d179a990aa6', 'A stack of set texts issued at the start of term'),
  booksApple: img(
    'photo-1503676260728-1c00da094a0b',
    'Reading blocks and picture books from the basic level resource shelf',
  ),
  pencils: img('photo-1513542789411-b6a5d4f31634', 'Coloured pencils laid out for the art period'),
  writing: img('photo-1434030216411-0b793f4b4173', 'A pupil writing up notes at the end of a lesson'),
  writingChild: img(
    'photo-1560785496-3c9d27877182',
    'A basic level pupil practising handwriting in an exercise book',
  ),
  notebook: img('photo-1517971129774-8a2b38fa128e', 'Revision notes open beside a set of past papers'),
  laptopWork: img('photo-1516321318423-f06f85e504b3', 'A student working through a coding exercise'),
  meeting: img('photo-1454165804606-c3d57bc86b40', 'The parent teacher meeting in the staff room'),
  courtEmpty: img(
    'photo-1544919982-b61976f0ba43',
    'The assembly ground before the school gates opened, 2055 BS',
  ),
  loveToLearn: img('photo-1546410531-bb4caa6b424d', 'A hand-painted sign in the primary corridor'),

  /* Portraits */
  portraitPrincipal: img(
    'photo-1522075469751-3a6694fb2f61',
    'Portrait of the principal in the school office',
    900,
    1200,
  ),
  portraitVice: img(
    'photo-1580894732444-8ecded7900cd',
    'Portrait of the vice principal outside the staff room',
    900,
    1200,
  ),
  portraitCoordinator: img(
    'photo-1596495578065-6e0763fa1178',
    'Portrait of the academic coordinator',
    900,
    1200,
  ),
  portraitScience: img(
    'photo-1584697964358-3e14ca57658b',
    'Portrait of the head of the science department in the library',
    900,
    1200,
  ),
  portraitPrimary: img(
    'photo-1544717305-2782549b5136',
    'Portrait of the head of the basic level',
    900,
    1200,
  ),
  portraitAlumnus: img(
    'photo-1509098681029-b45e9c845022',
    'Portrait of an alumnus of the 2072 BS batch',
    900,
    1200,
  ),
  portraitParent: img(
    'photo-1543269664-7eef42226a21',
    'Portrait of a parent of two pupils at the school',
    900,
    1200,
  ),
  portraitStudent: img(
    'photo-1567168544813-cc03465b4fa8',
    'Portrait of a grade twelve science student in the library',
    900,
    1200,
  ),
} as const;

export type PhotoKey = keyof typeof photos;
