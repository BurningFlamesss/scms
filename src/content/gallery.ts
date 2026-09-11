import { photos } from './images';
import type { Album } from './types';

export const galleryIntro = {
  eyebrow: '04 / THE YEAR',
  statement: ['ONE YEAR,', 'GATHERED.'],
  support:
    'Photographs from the 2082 and 2083 BS sessions, filed by event. Captions are written by the class that took them, which is why some of them are better than others.',
};

export const albums: Album[] = [
  {
    id: 'a-sports',
    event: 'Annual Sports Meet',
    year: '2083 BS',
    category: 'Sports',
    date: '3 Mangsir 2083',
    photos: [
      photos.sportsTrack,
      photos.sportsField,
      photos.medals,
      photos.sportsCourt,
      photos.sportsTeam,
      photos.sportsCycling,
      photos.sportsSwim,
      photos.assemblyAerial,
    ],
  },
  {
    id: 'a-science',
    event: 'Science Exhibition',
    year: '2083 BS',
    category: 'Academic',
    date: '10 Ashwin 2083',
    photos: [
      photos.labGlass,
      photos.labPour,
      photos.labWork,
      photos.whiteboard,
      photos.groupProject,
      photos.computerLab,
    ],
  },
  {
    id: 'a-saraswati',
    event: 'Saraswati Puja',
    year: '2083 BS',
    category: 'Festival',
    date: '14 Magh 2083',
    photos: [photos.stage, photos.celebration, photos.groupOutdoors, photos.booksStack, photos.pencils],
  },
  {
    id: 'a-farewell',
    event: 'Grade Twelve Farewell',
    year: '2082 BS',
    category: 'Ceremony',
    date: '25 Chaitra 2082',
    photos: [photos.graduation, photos.celebration, photos.groupOutdoors, photos.auditorium, photos.assemblyHall],
  },
  {
    id: 'a-excursion',
    event: 'Sarangkot Excursion',
    year: '2082 BS',
    category: 'Excursion',
    date: '18 Falgun 2082',
    photos: [
      photos.mountainsDawn,
      photos.mountainsValley,
      photos.mountainsRidge,
      photos.sunflowers,
      photos.mountainsNight,
      photos.road,
    ],
  },
  {
    id: 'a-library',
    event: 'Library Week',
    year: '2082 BS',
    category: 'Academic',
    date: '6 Bhadra 2082',
    photos: [
      photos.library,
      photos.libraryAisle,
      photos.libraryReading,
      photos.libraryStacks,
      photos.libraryGroup,
      photos.booksApple,
    ],
  },
  {
    id: 'a-quiz',
    event: 'Inter-house Quiz',
    year: '2083 BS',
    category: 'Academic',
    date: '5 Shrawan 2083',
    photos: [photos.assemblyHall, photos.auditorium, photos.groupStudy, photos.groupProject, photos.whiteboardPlan],
  },
  {
    id: 'a-classroom',
    event: 'A Week in Class',
    year: '2083 BS',
    category: 'Everyday',
    date: 'Bhadra 2083',
    photos: [
      photos.classroomLesson,
      photos.classroomStudents,
      photos.classroomWriting,
      photos.classroomPrimary,
      photos.writingChild,
      photos.writing,
      photos.notebook,
      photos.loveToLearn,
    ],
  },
  {
    id: 'a-parents',
    event: 'Parents’ Day',
    year: '2083 BS',
    category: 'Ceremony',
    date: '9 Poush 2083',
    photos: [photos.meeting, photos.assemblyHall, photos.groupStudy, photos.campusMorning],
  },
];

export const galleryCategories = Array.from(new Set(albums.map((a) => a.category))).sort();
export const galleryYears = Array.from(new Set(albums.map((a) => a.year))).sort().reverse();
export const totalPhotos = albums.reduce((n, a) => n + a.photos.length, 0);
