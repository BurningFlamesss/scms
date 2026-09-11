// ---------------------------------------------------------------------------
// ScMS domain model
// ---------------------------------------------------------------------------
// These types mirror the shape a real API/database would return. The mock
// repository layer in `src/services/*` is the only thing that knows the data
// is currently local — swapping it for axios calls requires no type changes.
// ---------------------------------------------------------------------------

export type Role = "super_admin" | "admin" | "staff" | "student" | "guardian";

export interface Paginated<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isMain: boolean;
  studentCount: number;
}

export interface AcademicYear {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: "planning" | "active" | "closed";
}

// --------------------------------------------------------------------- people

export type StudentStatus = "active" | "inactive" | "graduated" | "transferred" | "suspended";

export interface Guardian {
  id: string;
  name: string;
  relation: "Father" | "Mother" | "Guardian";
  phone: string;
  email: string;
  occupation?: string;
  invited?: boolean;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: "pdf" | "image" | "doc";
  sizeKb: number;
  uploadedAt: string;
  url: string;
  verified: boolean;
}

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  gender: "male" | "female";
  dateOfBirth: string;
  grade: string;
  section: string;
  classId: string;
  rollNo: number;
  branchId: string;
  admissionYear: number;
  admissionDate: string;
  status: StudentStatus;
  email: string;
  phone: string;
  address: string;
  city: string;
  bloodGroup: string;
  nationality: string;
  guardian: Guardian;
  emergencyContact: string;
  transportRouteId?: string;
  houseName: string;
  attendanceRate: number;
  feeBalance: number;
  documents: DocumentFile[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type EmploymentStatus = "active" | "probation" | "on_leave" | "retired" | "terminated";

export interface StaffMember {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  gender: "male" | "female";
  email: string;
  phone: string;
  department: string;
  designation: string;
  employmentStatus: EmploymentStatus;
  employmentType: "full_time" | "part_time" | "contract";
  joiningDate: string;
  branchId: string;
  role: Role;
  qualification: string;
  experienceYears: number;
  address: string;
  dateOfBirth: string;
  assignedClassIds: string[];
  assignedCourseIds: string[];
  attendanceRate: number;
  isClassTeacher: boolean;
  documents: DocumentFile[];
  createdAt: string;
  updatedAt: string;
}

export type AccountStatus = "active" | "invited" | "suspended" | "deactivated";
export type InvitationStatus = "none" | "pending" | "activated" | "expired" | "revoked";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
  profileType: "staff" | "student" | "guardian" | "none";
  profileId?: string;
  profileLabel?: string;
  accountStatus: AccountStatus;
  invitationStatus: InvitationStatus;
  invitedAt?: string;
  invitationExpiresAt?: string;
  emailVerified: boolean;
  lastActiveAt?: string;
  branchId: string;
  createdAt: string;
}

export interface RoleDefinition {
  key: Role;
  label: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
}

export interface SessionRecord {
  id: string;
  userId: string;
  userName: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActiveAt: string;
  current: boolean;
}

// ------------------------------------------------------------------ academics

export interface SchedulePeriod {
  id: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  start: string;
  end: string;
  courseId: string;
  courseName: string;
  staffId: string;
  staffName: string;
  room: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  grade: string;
  section: string;
  classTeacherId: string;
  roomNo: string;
  capacity: number;
  studentCount: number;
  courseIds: string[];
  academicYearId: string;
  branchId: string;
  schedule: SchedulePeriod[];
  attendanceRate: number;
}

export interface SyllabusUnit {
  unit: number;
  title: string;
  hours: number;
  topics: string[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  description: string;
  credits: number;
  weeklyHours: number;
  teacherIds: string[];
  classIds: string[];
  syllabus: SyllabusUnit[];
  isElective: boolean;
  createdAt: string;
}

export type AttendanceState = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  id: string;
  date: string; // yyyy-mm-dd
  personType: "student" | "staff";
  personId: string;
  classId?: string;
  state: AttendanceState;
  note?: string;
  markedBy: string;
  markedAt: string;
}

export interface AttendanceDayPoint {
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number;
}

export interface EnrollmentPoint {
  period: string;
  students: number;
  capacity: number;
  admissions: number;
}

// ------------------------------------------------------------- communications

export type NoticeStatus = "draft" | "scheduled" | "published" | "archived";
export type NoticePriority = "low" | "normal" | "high" | "urgent";

export type AudienceKind = "everyone" | "students" | "guardians" | "staff" | "grade" | "class";

export interface AudienceTarget {
  kind: AudienceKind;
  value?: string;
  label: string;
}

export interface Notice {
  id: string;
  title: string;
  summary: string;
  content: string; // HTML
  featuredImage?: string;
  attachments: DocumentFile[];
  audience: AudienceTarget[];
  status: NoticeStatus;
  priority: NoticePriority;
  publishAt: string;
  expiresAt?: string;
  pinned: boolean;
  authorId: string;
  authorName: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export type EventCategory =
  | "exam"
  | "sports"
  | "cultural"
  | "trip"
  | "competition"
  | "meeting"
  | "holiday"
  | "program";

export type EventStatus = "draft" | "scheduled" | "ongoing" | "completed" | "cancelled";

export interface EventParticipantGroup {
  label: string;
  count: number;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  startDate: string;
  endDate: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  location: string;
  coverImage?: string;
  organizerId: string;
  organizerName: string;
  participants: EventParticipantGroup[];
  registrationRequired: boolean;
  registrationCount: number;
  capacity?: number;
  albumId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  order: number;
  featured: boolean;
  uploadedAt: string;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  visibility: "public" | "internal" | "private";
  eventId?: string;
  coverImageId?: string;
  images: GalleryImage[];
  createdAt: string;
  updatedAt: string;
}

export type NotificationKind =
  | "admission"
  | "user"
  | "attendance"
  | "event"
  | "notice"
  | "invitation"
  | "payment"
  | "system";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  severity: "info" | "success" | "warning" | "critical";
  read: boolean;
  actorName?: string;
  href?: string;
  createdAt: string;
}

// ------------------------------------------------------------------ operations

export type ApplicationStatus = "pending" | "accepted" | "rejected" | "waitlisted" | "converted";

export interface ApplicationNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface TimelineEntry {
  id: string;
  label: string;
  description: string;
  actor: string;
  at: string;
  tone: "neutral" | "positive" | "negative" | "accent";
}

export interface Application {
  id: string;
  applicationNo: string;
  applicantName: string;
  avatarUrl: string;
  gradeApplied: string;
  status: ApplicationStatus;
  submittedAt: string;
  dateOfBirth: string;
  gender: "male" | "female";
  email: string;
  phone: string;
  address: string;
  guardian: Guardian;
  previousSchool: string;
  previousGrade: string;
  entranceScore?: number;
  branchId: string;
  source: "website" | "walk_in" | "referral" | "agent";
  documents: DocumentFile[];
  notes: ApplicationNote[];
  timeline: TimelineEntry[];
  convertedStudentId?: string;
}

export interface Driver {
  id: string;
  name: string;
  avatarUrl: string;
  phone: string;
  licenseNo: string;
  experienceYears: number;
  status: "active" | "on_leave" | "inactive";
}

export interface RouteStop {
  id: string;
  name: string;
  landmark: string;
  pickupTime: string;
  dropTime: string;
  order: number;
  studentCount: number;
  lat: number;
  lng: number;
}

export interface TransportRoute {
  id: string;
  name: string;
  code: string;
  vehicleId: string;
  distanceKm: number;
  morningStart: string;
  eveningStart: string;
  stops: RouteStop[];
  assignedStudentIds: string[];
  status: "active" | "suspended";
}

export interface Vehicle {
  id: string;
  code: string;
  type: "bus" | "van" | "minibus";
  regNo: string;
  model: string;
  year: number;
  capacity: number;
  driverId: string;
  routeId?: string;
  status: "active" | "maintenance" | "inactive";
  lastServiceDate: string;
  insuranceExpiry: string;
  gpsEnabled: boolean;
}

export interface FeeComponent {
  label: string;
  amount: number;
}

export interface FeeStructure {
  id: string;
  name: string;
  grade: string;
  frequency: "annual" | "term" | "monthly";
  amount: number;
  components: FeeComponent[];
  academicYearId: string;
  active: boolean;
}

export type InvoiceStatus = "paid" | "partial" | "unpaid" | "overdue" | "void";

export interface Invoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  grade: string;
  feeStructureId: string;
  term: string;
  amount: number;
  amountPaid: number;
  issuedDate: string;
  dueDate: string;
  status: InvoiceStatus;
}

export type PaymentMethod = "card" | "bank_transfer" | "cash" | "cheque" | "wallet";

export interface PaymentTransaction {
  id: string;
  receiptNo: string;
  invoiceId: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  status: "succeeded" | "pending" | "failed" | "refunded";
  paidAt: string;
  recordedBy: string;
}

// --------------------------------------------------------------------- website

export type BlockType =
  | "hero"
  | "headline"
  | "intro"
  | "stats"
  | "cta"
  | "featured_events"
  | "featured_notices"
  | "rich_text"
  | "history"
  | "mission_vision"
  | "principal_message"
  | "facilities"
  | "achievements"
  | "contact_details"
  | "office_hours"
  | "social_links"
  | "map"
  | "announcements"
  | "gallery_grid"
  | "faculty"
  | "academics"
  | "admissions_info";

export interface ContentBlock {
  id: string;
  type: BlockType;
  label: string;
  visible: boolean;
  order: number;
  fields: Record<string, unknown>;
  updatedAt: string;
}

export type WebsitePageKey = "homepage" | "about" | "contact" | "other";

export type WebsitePageStatus = "draft" | "published";

export interface WebsitePage {
  id: string;
  key: WebsitePageKey;
  title: string;
  path: string;
  status: WebsitePageStatus;
  hasUnpublishedChanges: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  blocks: ContentBlock[];
  updatedAt: string;
  publishedAt: string | null;
  updatedBy: string;
  createdAt: string;
}

// -------------------------------------------------------------------- settings

export interface SchoolSettings {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  website: string;
  officeHours: string;
  established: number;
  branding: { primaryHue: string; accentHue: string; logoMark: string };
  socials: { facebook: string; instagram: string; x: string; youtube: string; linkedin: string };
  seo: { metaTitle: string; metaDescription: string; keywords: string; indexable: boolean };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    digestFrequency: "off" | "daily" | "weekly";
    rules: { id: string; label: string; description: string; email: boolean; sms: boolean; inApp: boolean }[];
  };
  security: {
    passwordMinLength: number;
    requireMfaForAdmins: boolean;
    sessionTimeoutMins: number;
    allowGuardianSelfSignup: boolean;
  };
  publicSite: { enabled: boolean; maintenanceMode: boolean; showAdmissions: boolean; showGallery: boolean };
}

// ----------------------------------------------------------------------- audit

export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "published"
  | "archived"
  | "invited"
  | "status_changed"
  | "imported"
  | "signed_in"
  | "exported"
  | "marked_attendance"
  | "recorded_payment";

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  resourceLabel: string;
  summary: string;
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
  title?: string;
}

export interface Actor {
  id: string;
  name: string;
  role: Role;
}

// ---------------------------------------------------------------- search index

export interface SearchResult {
  id: string;
  type: "student" | "staff" | "notice" | "event" | "class" | "course" | "page" | "application";
  title: string;
  subtitle: string;
  href: string;
  avatarUrl?: string;
}

// Re-export website types
export type {
  LevelId,
  Level,
  Subject,
  SubjectKind,
  FeeLine,
  FeeFrequency,
  Program,
  Weekday,
  RoutineKey,
  RoutinePeriod,
  RoutineRow,
  Routine,
  FacilityCategory,
  FacilityStat,
  Facility,
  Department,
  Person,
  NoticeCategory,
  Attachment,
  NoticeTable,
  Notice,
  ScholarshipCategory,
  EligibilityCriterion,
  Scholarship,
  DownloadMeta,
} from "./website";

// Re-export content types
export type {
  Img,
  Notice as ContentNotice,
  Stat,
  Pillar,
  Frame,
  Milestone,
  Person as ContentPerson,
  Subject as ContentSubject,
  StreamId,
  Stream,
  Level as ContentLevel,
  PlanBlock,
  Facility as ContentFacility,
  Album,
  Dept,
  NepaliDate,
  Cadence,
  FeeLine as ContentFeeLine,
  TransportBand,
  HostelOption,
  FeeBand,
  EventKind,
  CalEvent,
  Term,
  Stop,
  BusRoute,
  AreaAlias,
  QuizStreamId,
  QuizOption,
  QuizQuestion,
  Period,
  RoutineClass,
  ResultYear,
  Download,
  ThenNow,
  CrestPart,
} from "../content/types";
