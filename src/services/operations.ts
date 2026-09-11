import type {
  Actor,
  Application,
  ApplicationStatus,
  Driver,
  FeeStructure,
  Guardian,
  Invoice,
  Paginated,
  PaymentMethod,
  PaymentTransaction,
  Student,
  TransportRoute,
  Vehicle,
} from "@/types";
import { db, latency, matches, nowIso, paginate, persist, uid } from "@/lib/db";
import { recordAudit } from "@/services/audit";
import { pushNotification } from "@/services/notifications";
import { avatarFor, todayKey } from "@/lib/format";
import { CAMPUS, offsetKm } from "@/lib/geo";

// ----------------------------------------------------------------- admissions

export interface ApplicationQuery {
  search?: string;
  status?: string;
  grade?: string;
  source?: string;
  page?: number;
  pageSize?: number;
}

export async function listApplications(query: ApplicationQuery = {}): Promise<Paginated<Application>> {
  await latency(240);
  const { search = "", status = "all", grade = "all", source = "all", page = 1, pageSize = 10 } = query;
  const filtered = db()
    .applications.filter((a) => {
      if (!matches(search, a.applicantName, a.applicationNo, a.guardian.name)) return false;
      if (status !== "all" && a.status !== status) return false;
      if (grade !== "all" && a.gradeApplied !== grade) return false;
      if (source !== "all" && a.source !== source) return false;
      return true;
    })
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  return paginate(filtered, page, pageSize);
}

export async function getApplication(id: string): Promise<Application | null> {
  await latency(200);
  return db().applications.find((a) => a.id === id) ?? null;
}

export function admissionsSummary() {
  const apps = db().applications;
  return {
    total: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    accepted: apps.filter((a) => a.status === "accepted").length,
    waitlisted: apps.filter((a) => a.status === "waitlisted").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
    converted: apps.filter((a) => a.status === "converted").length,
  };
}

const STATUS_TONE: Record<ApplicationStatus, "neutral" | "positive" | "negative" | "accent"> = {
  pending: "neutral",
  accepted: "positive",
  converted: "positive",
  rejected: "negative",
  waitlisted: "accent",
};

export async function setApplicationStatus(
  id: string,
  status: ApplicationStatus,
  actor: Actor,
  reason?: string,
): Promise<Application> {
  await latency(380);
  const app = db().applications.find((a) => a.id === id);
  if (!app) throw new Error("Application not found");
  app.status = status;
  app.timeline.push({
    id: uid("tl"),
    label: `Application ${status}`,
    description: reason || `Status changed to ${status} by ${actor.name}.`,
    actor: actor.name,
    at: nowIso(),
    tone: STATUS_TONE[status],
  });
  persist();
  recordAudit({
    actor,
    action: "status_changed",
    resourceType: "application",
    resourceId: app.id,
    resourceLabel: app.applicantName,
    summary: `Marked ${app.applicantName}’s application as ${status}`,
  });
  pushNotification({
    kind: "admission",
    title: `Application ${status}`,
    body: `${app.applicantName} · ${app.gradeApplied}`,
    severity: status === "rejected" ? "warning" : "success",
    href: `/admissions/${app.id}`,
    actorName: actor.name,
  });
  return app;
}

export async function addApplicationNote(id: string, text: string, actor: Actor): Promise<Application> {
  await latency(280);
  const app = db().applications.find((a) => a.id === id);
  if (!app) throw new Error("Application not found");
  app.notes.unshift({ id: uid("apn"), author: actor.name, text, createdAt: nowIso() });
  persist();
  return app;
}

export async function requestApplicationInfo(id: string, message: string, actor: Actor): Promise<Application> {
  await latency(360);
  const app = db().applications.find((a) => a.id === id);
  if (!app) throw new Error("Application not found");
  app.timeline.push({
    id: uid("tl"),
    label: "Information requested",
    description: message,
    actor: actor.name,
    at: nowIso(),
    tone: "accent",
  });
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "application",
    resourceId: app.id,
    resourceLabel: app.applicantName,
    summary: `Requested additional information from ${app.guardian.name}`,
  });
  return app;
}

export async function convertApplicant(
  id: string,
  classId: string,
  actor: Actor,
): Promise<{ application: Application; student: Student }> {
  await latency(620);
  const app = db().applications.find((a) => a.id === id);
  const cls = db().classes.find((c) => c.id === classId);
  if (!app || !cls) throw new Error("Application or class not found");
  const [firstName, ...rest] = app.applicantName.split(" ");
  const lastName = rest.join(" ") || "—";
  const year = new Date().getFullYear();
  const student: Student = {
    id: uid("stu"),
    admissionNo: `NFA-${year}-${String(1000 + db().students.length + 1).slice(-4)}`,
    firstName,
    lastName,
    avatarUrl: app.avatarUrl || avatarFor(app.applicantName),
    gender: app.gender,
    dateOfBirth: app.dateOfBirth,
    grade: cls.grade,
    section: cls.section,
    classId: cls.id,
    rollNo: db().students.filter((s) => s.classId === cls.id).length + 1,
    branchId: app.branchId,
    admissionYear: year,
    admissionDate: todayKey(),
    status: "active",
    email: app.email,
    phone: app.phone,
    address: app.address,
    city: "Northfield",
    bloodGroup: "O+",
    nationality: "American",
    guardian: app.guardian,
    emergencyContact: app.guardian.phone,
    houseName: ["Aurora", "Meridian", "Summit", "Vanguard"][db().students.length % 4],
    attendanceRate: 100,
    feeBalance: 0,
    documents: app.documents,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  db().students.unshift(student);
  app.status = "converted";
  app.convertedStudentId = student.id;
  app.timeline.push({
    id: uid("tl"),
    label: "Converted to student",
    description: `Enrolled into ${cls.name} with admission number ${student.admissionNo}.`,
    actor: actor.name,
    at: nowIso(),
    tone: "positive",
  });
  db().classes.forEach((c) => {
    c.studentCount = db().students.filter((s) => s.classId === c.id && s.status === "active").length;
  });
  persist();
  recordAudit({
    actor,
    action: "created",
    resourceType: "student",
    resourceId: student.id,
    resourceLabel: app.applicantName,
    summary: `Converted applicant ${app.applicantName} into a student in ${cls.name}`,
  });
  pushNotification({
    kind: "admission",
    title: "Applicant enrolled",
    body: `${app.applicantName} is now a student in ${cls.name}.`,
    severity: "success",
    href: `/students/${student.id}`,
    actorName: actor.name,
  });
  return { application: app, student };
}

// -------------------------------------------------------------- transportation

export async function listRoutes(search = ""): Promise<TransportRoute[]> {
  await latency(220);
  return db().routes.filter((r) => matches(search, r.name, r.code));
}

export async function listVehicles(search = ""): Promise<Vehicle[]> {
  await latency(220);
  return db().vehicles.filter((v) => matches(search, v.code, v.regNo, v.model));
}

export async function listDrivers(search = ""): Promise<Driver[]> {
  await latency(200);
  return db().drivers.filter((d) => matches(search, d.name, d.licenseNo));
}

export async function getRouteDetail(id: string) {
  await latency(220);
  const route = db().routes.find((r) => r.id === id);
  if (!route) return null;
  return {
    route,
    vehicle: db().vehicles.find((v) => v.id === route.vehicleId) ?? null,
    driver: db().drivers.find((d) => d.id === db().vehicles.find((v) => v.id === route.vehicleId)?.driverId) ?? null,
    students: db().students.filter((s) => route.assignedStudentIds.includes(s.id)),
  };
}

export function transportSummary() {
  const routes = db().routes;
  const vehicles = db().vehicles;
  return {
    routes: routes.length,
    activeRoutes: routes.filter((r) => r.status === "active").length,
    vehicles: vehicles.length,
    inService: vehicles.filter((v) => v.status === "active").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
    students: new Set(routes.flatMap((r) => r.assignedStudentIds)).size,
    drivers: db().drivers.length,
    stops: routes.reduce((sum, r) => sum + r.stops.length, 0),
  };
}

export interface RouteInput {
  name: string;
  code: string;
  vehicleId: string;
  distanceKm: number;
  morningStart: string;
  eveningStart: string;
}

export async function createRoute(input: RouteInput, actor: Actor): Promise<TransportRoute> {
  await latency(400);
  const route: TransportRoute = {
    id: uid("rte"),
    ...input,
    stops: [],
    assignedStudentIds: [],
    status: "active",
  };
  db().routes.push(route);
  persist();
  recordAudit({
    actor,
    action: "created",
    resourceType: "route",
    resourceId: route.id,
    resourceLabel: route.name,
    summary: `Created transport route ${route.code} · ${route.name}`,
  });
  return route;
}

/** Place a brand-new stop just beyond the current end of the line. */
function nextStopCoordinate(route: TransportRoute): { lat: number; lng: number } {
  const last = route.stops[route.stops.length - 1];
  if (!last) {
    const bearing = (route.code.charCodeAt(route.code.length - 1) % 12) * (Math.PI / 6);
    return offsetKm(CAMPUS, 2, bearing);
  }
  const bearing = Math.atan2(last.lng - CAMPUS.lng, last.lat - CAMPUS.lat);
  return offsetKm({ lat: last.lat, lng: last.lng }, 1.8, bearing);
}

export async function addRouteStop(
  routeId: string,
  stop: { name: string; landmark: string; pickupTime: string; dropTime: string; studentCount?: number },
  actor: Actor,
): Promise<TransportRoute> {
  await latency(320);
  const route = db().routes.find((r) => r.id === routeId);
  if (!route) throw new Error("Route not found");
  route.stops.push({
    id: uid("stp"),
    name: stop.name,
    landmark: stop.landmark,
    pickupTime: stop.pickupTime,
    dropTime: stop.dropTime,
    order: route.stops.length,
    studentCount: stop.studentCount ?? 0,
    ...nextStopCoordinate(route),
  });
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "route",
    resourceId: route.id,
    resourceLabel: route.name,
    summary: `Added stop “${stop.name}” to ${route.code}`,
  });
  return route;
}

export async function setRouteStatus(id: string, status: TransportRoute["status"], actor: Actor) {
  await latency(280);
  const route = db().routes.find((r) => r.id === id);
  if (!route) throw new Error("Route not found");
  route.status = status;
  persist();
  recordAudit({
    actor,
    action: "status_changed",
    resourceType: "route",
    resourceId: route.id,
    resourceLabel: route.name,
    summary: `Set route ${route.code} to ${status}`,
  });
  return route;
}

export async function setVehicleStatus(id: string, status: Vehicle["status"], actor: Actor) {
  await latency(280);
  const vehicle = db().vehicles.find((v) => v.id === id);
  if (!vehicle) throw new Error("Vehicle not found");
  vehicle.status = status;
  persist();
  recordAudit({
    actor,
    action: "status_changed",
    resourceType: "vehicle",
    resourceId: vehicle.id,
    resourceLabel: vehicle.code,
    summary: `Set vehicle ${vehicle.code} to ${status.replace(/_/g, " ")}`,
  });
  return vehicle;
}

// ------------------------------------------------------------------- payments

export interface InvoiceQuery {
  search?: string;
  status?: string;
  grade?: string;
  page?: number;
  pageSize?: number;
}

export async function listInvoices(query: InvoiceQuery = {}): Promise<Paginated<Invoice>> {
  await latency(240);
  const { search = "", status = "all", grade = "all", page = 1, pageSize = 10 } = query;
  const filtered = db()
    .invoices.filter((i) => {
      if (!matches(search, i.studentName, i.invoiceNo)) return false;
      if (status !== "all" && i.status !== status) return false;
      if (grade !== "all" && i.grade !== grade) return false;
      return true;
    })
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  return paginate(filtered, page, pageSize);
}

export interface PaymentQuery {
  search?: string;
  method?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export async function listPayments(query: PaymentQuery = {}): Promise<Paginated<PaymentTransaction>> {
  await latency(240);
  const { search = "", method = "all", status = "all", page = 1, pageSize = 10 } = query;
  const filtered = db()
    .payments.filter((p) => {
      if (!matches(search, p.studentName, p.receiptNo, p.reference, p.invoiceNo)) return false;
      if (method !== "all" && p.method !== method) return false;
      if (status !== "all" && p.status !== status) return false;
      return true;
    })
    .sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1));
  return paginate(filtered, page, pageSize);
}

export async function listFeeStructures(): Promise<FeeStructure[]> {
  await latency(200);
  return db().feeStructures;
}

export function paymentsSummary() {
  const invoices = db().invoices;
  const billed = invoices.reduce((sum, i) => sum + i.amount, 0);
  const collected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const overdue = invoices.filter((i) => i.status === "overdue");
  return {
    billed,
    collected,
    outstanding: billed - collected,
    collectionRate: billed ? Math.round((collected / billed) * 100) : 0,
    overdueCount: overdue.length,
    overdueAmount: overdue.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0),
    paidCount: invoices.filter((i) => i.status === "paid").length,
    partialCount: invoices.filter((i) => i.status === "partial").length,
    unpaidCount: invoices.filter((i) => i.status === "unpaid" || i.status === "overdue").length,
  };
}

export async function studentBalances(limit = 8) {
  await latency(220);
  return db()
    .students.filter((s) => s.feeBalance > 0)
    .sort((a, b) => b.feeBalance - a.feeBalance)
    .slice(0, limit);
}

export async function recordPayment(
  invoiceId: string,
  amount: number,
  method: PaymentMethod,
  reference: string,
  actor: Actor,
): Promise<PaymentTransaction> {
  await latency(480);
  const invoice = db().invoices.find((i) => i.id === invoiceId);
  if (!invoice) throw new Error("Invoice not found");
  invoice.amountPaid = Math.min(invoice.amount, invoice.amountPaid + amount);
  invoice.status = invoice.amountPaid >= invoice.amount ? "paid" : "partial";
  const student = db().students.find((s) => s.id === invoice.studentId);
  if (student) student.feeBalance = invoice.amount - invoice.amountPaid;

  const payment: PaymentTransaction = {
    id: uid("pay"),
    receiptNo: `RCP-${new Date().getFullYear()}-${String(5000 + db().payments.length)}`,
    invoiceId: invoice.id,
    invoiceNo: invoice.invoiceNo,
    studentId: invoice.studentId,
    studentName: invoice.studentName,
    amount,
    method,
    reference: reference || `MANUAL-${Date.now().toString().slice(-6)}`,
    status: "succeeded",
    paidAt: nowIso(),
    recordedBy: actor.name,
  };
  db().payments.unshift(payment);
  persist();
  recordAudit({
    actor,
    action: "recorded_payment",
    resourceType: "invoice",
    resourceId: invoice.id,
    resourceLabel: invoice.invoiceNo,
    summary: `Recorded a payment of ${amount} for ${invoice.studentName} (${invoice.invoiceNo})`,
  });
  pushNotification({
    kind: "payment",
    title: "Payment recorded",
    body: `${invoice.studentName} · ${invoice.invoiceNo}`,
    severity: "success",
    href: "/payments",
    actorName: actor.name,
  });
  return payment;
}

// ------------------------------------------------- admissions: create / delete

export interface ApplicationInput {
  applicantName: string;
  gradeApplied: string;
  gender: "male" | "female";
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  guardianName: string;
  guardianRelation: Guardian["relation"];
  guardianPhone: string;
  guardianEmail: string;
  previousSchool: string;
  previousGrade: string;
  entranceScore?: number;
  source: Application["source"];
  branchId: string;
}

export async function createApplication(input: ApplicationInput, actor: Actor): Promise<Application> {
  await latency(460);
  const year = new Date().getFullYear();
  const application: Application = {
    id: uid("app"),
    applicationNo: `ADM-${year}-${String(100 + db().applications.length)}`,
    applicantName: input.applicantName,
    avatarUrl: avatarFor(input.applicantName),
    gradeApplied: input.gradeApplied,
    status: "pending",
    submittedAt: nowIso(),
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    email: input.email,
    phone: input.phone,
    address: input.address,
    guardian: {
      id: uid("gdn"),
      name: input.guardianName,
      relation: input.guardianRelation,
      phone: input.guardianPhone,
      email: input.guardianEmail,
    },
    previousSchool: input.previousSchool,
    previousGrade: input.previousGrade,
    entranceScore: input.entranceScore,
    branchId: input.branchId,
    source: input.source,
    documents: [],
    notes: [],
    timeline: [
      {
        id: uid("tl"),
        label: "Application created",
        description: `Recorded by ${actor.name} (${input.source.replace(/_/g, " ")}).`,
        actor: actor.name,
        at: nowIso(),
        tone: "neutral",
      },
    ],
  };
  db().applications.unshift(application);
  persist();
  recordAudit({
    actor,
    action: "created",
    resourceType: "application",
    resourceId: application.id,
    resourceLabel: application.applicantName,
    summary: `Created application ${application.applicationNo} for ${application.gradeApplied}`,
  });
  pushNotification({
    kind: "admission",
    title: "New application",
    body: `${application.applicantName} · ${application.gradeApplied}`,
    severity: "info",
    href: `/admissions/${application.id}`,
    actorName: actor.name,
  });
  return application;
}

export async function updateApplication(
  id: string,
  patch: Partial<Application>,
  actor: Actor,
): Promise<Application> {
  await latency(340);
  const app = db().applications.find((a) => a.id === id);
  if (!app) throw new Error("Application not found");
  Object.assign(app, patch);
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "application",
    resourceId: app.id,
    resourceLabel: app.applicantName,
    summary: `Updated application ${app.applicationNo}`,
  });
  return app;
}

export async function deleteApplication(id: string, actor: Actor): Promise<void> {
  await latency(340);
  const app = db().applications.find((a) => a.id === id);
  if (!app) throw new Error("Application not found");
  db().applications = db().applications.filter((a) => a.id !== id);
  persist();
  recordAudit({
    actor,
    action: "deleted",
    resourceType: "application",
    resourceId: id,
    resourceLabel: app.applicantName,
    summary: `Deleted application ${app.applicationNo}`,
  });
}

export function applicationFilterOptions() {
  const apps = db().applications;
  return {
    grades: Array.from(new Set(apps.map((a) => a.gradeApplied))).sort(),
    sources: Array.from(new Set(apps.map((a) => a.source))).sort(),
  };
}

// --------------------------------------------- transportation: extended CRUD

export async function updateRoute(
  id: string,
  patch: Partial<Pick<TransportRoute, "name" | "code" | "vehicleId" | "distanceKm" | "morningStart" | "eveningStart">>,
  actor: Actor,
): Promise<TransportRoute> {
  await latency(340);
  const route = db().routes.find((r) => r.id === id);
  if (!route) throw new Error("Route not found");
  Object.assign(route, patch);
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "route",
    resourceId: route.id,
    resourceLabel: route.name,
    summary: `Updated route ${route.code} · ${route.name}`,
  });
  return route;
}

export async function deleteRoute(id: string, actor: Actor): Promise<void> {
  await latency(340);
  const route = db().routes.find((r) => r.id === id);
  if (!route) throw new Error("Route not found");
  db().routes = db().routes.filter((r) => r.id !== id);
  db().vehicles.forEach((v) => {
    if (v.routeId === id) v.routeId = undefined;
  });
  db().students.forEach((s) => {
    if (s.transportRouteId === id) s.transportRouteId = undefined;
  });
  persist();
  recordAudit({
    actor,
    action: "deleted",
    resourceType: "route",
    resourceId: id,
    resourceLabel: route.name,
    summary: `Deleted transport route ${route.code}`,
  });
}

export async function updateRouteStop(
  routeId: string,
  stopId: string,
  patch: { name?: string; landmark?: string; pickupTime?: string; dropTime?: string; studentCount?: number },
  actor: Actor,
): Promise<TransportRoute> {
  await latency(300);
  const route = db().routes.find((r) => r.id === routeId);
  const stop = route?.stops.find((s) => s.id === stopId);
  if (!route || !stop) throw new Error("Stop not found");
  Object.assign(stop, patch);
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "route",
    resourceId: route.id,
    resourceLabel: route.name,
    summary: `Updated stop “${stop.name}” on ${route.code}`,
  });
  return route;
}

export async function deleteRouteStop(routeId: string, stopId: string, actor: Actor): Promise<TransportRoute> {
  await latency(300);
  const route = db().routes.find((r) => r.id === routeId);
  if (!route) throw new Error("Route not found");
  const stop = route.stops.find((s) => s.id === stopId);
  route.stops = route.stops.filter((s) => s.id !== stopId).map((s, index) => ({ ...s, order: index }));
  persist();
  recordAudit({
    actor,
    action: "deleted",
    resourceType: "route",
    resourceId: route.id,
    resourceLabel: route.name,
    summary: `Removed stop “${stop?.name ?? stopId}” from ${route.code}`,
  });
  return route;
}

export async function moveRouteStop(
  routeId: string,
  stopId: string,
  direction: "up" | "down",
  actor: Actor,
): Promise<TransportRoute> {
  await latency(220);
  const route = db().routes.find((r) => r.id === routeId);
  if (!route) throw new Error("Route not found");
  const index = route.stops.findIndex((s) => s.id === stopId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= route.stops.length) return route;
  const next = [...route.stops];
  [next[index], next[target]] = [next[target], next[index]];
  route.stops = next.map((s, i) => ({ ...s, order: i }));
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "route",
    resourceId: route.id,
    resourceLabel: route.name,
    summary: `Reordered stops on ${route.code}`,
  });
  return route;
}

export async function setRouteRiders(
  routeId: string,
  studentIds: string[],
  actor: Actor,
): Promise<TransportRoute> {
  await latency(420);
  const route = db().routes.find((r) => r.id === routeId);
  if (!route) throw new Error("Route not found");
  const removed = route.assignedStudentIds.filter((id) => !studentIds.includes(id));
  route.assignedStudentIds = studentIds;
  db().students.forEach((s) => {
    if (studentIds.includes(s.id)) s.transportRouteId = route.id;
    else if (removed.includes(s.id)) s.transportRouteId = undefined;
  });
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "route",
    resourceId: route.id,
    resourceLabel: route.name,
    summary: `${studentIds.length} riders assigned to ${route.code}`,
  });
  return route;
}

export interface VehicleInput {
  code: string;
  type: Vehicle["type"];
  regNo: string;
  model: string;
  year: number;
  capacity: number;
  driverId: string;
  routeId?: string;
  gpsEnabled: boolean;
  lastServiceDate: string;
  insuranceExpiry: string;
}

export async function createVehicle(input: VehicleInput, actor: Actor): Promise<Vehicle> {
  await latency(420);
  const vehicle: Vehicle = { id: uid("veh"), ...input, status: "active" };
  db().vehicles.push(vehicle);
  persist();
  recordAudit({
    actor,
    action: "created",
    resourceType: "vehicle",
    resourceId: vehicle.id,
    resourceLabel: vehicle.code,
    summary: `Added vehicle ${vehicle.code} (${vehicle.regNo})`,
  });
  return vehicle;
}

export async function updateVehicle(id: string, patch: Partial<Vehicle>, actor: Actor): Promise<Vehicle> {
  await latency(340);
  const vehicle = db().vehicles.find((v) => v.id === id);
  if (!vehicle) throw new Error("Vehicle not found");
  Object.assign(vehicle, patch);
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "vehicle",
    resourceId: vehicle.id,
    resourceLabel: vehicle.code,
    summary: `Updated vehicle ${vehicle.code}`,
  });
  return vehicle;
}

export async function deleteVehicle(id: string, actor: Actor): Promise<void> {
  await latency(320);
  const vehicle = db().vehicles.find((v) => v.id === id);
  if (!vehicle) throw new Error("Vehicle not found");
  db().vehicles = db().vehicles.filter((v) => v.id !== id);
  persist();
  recordAudit({
    actor,
    action: "deleted",
    resourceType: "vehicle",
    resourceId: id,
    resourceLabel: vehicle.code,
    summary: `Removed vehicle ${vehicle.code} from the fleet`,
  });
}

export interface DriverInput {
  name: string;
  phone: string;
  licenseNo: string;
  experienceYears: number;
}

export async function createDriver(input: DriverInput, actor: Actor): Promise<Driver> {
  await latency(400);
  const driver: Driver = {
    id: uid("drv"),
    ...input,
    avatarUrl: avatarFor(input.name),
    status: "active",
  };
  db().drivers.push(driver);
  persist();
  recordAudit({
    actor,
    action: "created",
    resourceType: "driver",
    resourceId: driver.id,
    resourceLabel: driver.name,
    summary: `Added driver ${driver.name} (${driver.licenseNo})`,
  });
  return driver;
}

export async function updateDriver(id: string, patch: Partial<Driver>, actor: Actor): Promise<Driver> {
  await latency(320);
  const driver = db().drivers.find((d) => d.id === id);
  if (!driver) throw new Error("Driver not found");
  Object.assign(driver, patch);
  if (patch.name) driver.avatarUrl = avatarFor(patch.name);
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "driver",
    resourceId: driver.id,
    resourceLabel: driver.name,
    summary: `Updated driver ${driver.name}`,
  });
  return driver;
}

export async function deleteDriver(id: string, actor: Actor): Promise<void> {
  await latency(300);
  const driver = db().drivers.find((d) => d.id === id);
  if (!driver) throw new Error("Driver not found");
  db().drivers = db().drivers.filter((d) => d.id !== id);
  persist();
  recordAudit({
    actor,
    action: "deleted",
    resourceType: "driver",
    resourceId: id,
    resourceLabel: driver.name,
    summary: `Removed driver ${driver.name}`,
  });
}

// ----------------------------------------------------- payments: extended CRUD

export interface FeeStructureInput {
  name: string;
  grade: string;
  frequency: FeeStructure["frequency"];
  components: { label: string; amount: number }[];
  academicYearId: string;
}

export async function createFeeStructure(input: FeeStructureInput, actor: Actor): Promise<FeeStructure> {
  await latency(420);
  const structure: FeeStructure = {
    id: uid("fee"),
    ...input,
    amount: input.components.reduce((sum, c) => sum + c.amount, 0),
    active: true,
  };
  db().feeStructures.push(structure);
  persist();
  recordAudit({
    actor,
    action: "created",
    resourceType: "fee_structure",
    resourceId: structure.id,
    resourceLabel: structure.name,
    summary: `Created fee structure ${structure.name}`,
  });
  return structure;
}

export async function updateFeeStructure(
  id: string,
  patch: Partial<FeeStructure>,
  actor: Actor,
): Promise<FeeStructure> {
  await latency(360);
  const structure = db().feeStructures.find((f) => f.id === id);
  if (!structure) throw new Error("Fee structure not found");
  Object.assign(structure, patch);
  if (patch.components) structure.amount = patch.components.reduce((sum, c) => sum + c.amount, 0);
  persist();
  recordAudit({
    actor,
    action: "updated",
    resourceType: "fee_structure",
    resourceId: structure.id,
    resourceLabel: structure.name,
    summary: `Updated fee structure ${structure.name}`,
  });
  return structure;
}

export async function deleteFeeStructure(id: string, actor: Actor): Promise<void> {
  await latency(320);
  const structure = db().feeStructures.find((f) => f.id === id);
  if (!structure) throw new Error("Fee structure not found");
  db().feeStructures = db().feeStructures.filter((f) => f.id !== id);
  persist();
  recordAudit({
    actor,
    action: "deleted",
    resourceType: "fee_structure",
    resourceId: id,
    resourceLabel: structure.name,
    summary: `Deleted fee structure ${structure.name}`,
  });
}

export interface InvoiceInput {
  studentId: string;
  feeStructureId: string;
  term: string;
  amount: number;
  dueDate: string;
}

export async function createInvoice(input: InvoiceInput, actor: Actor): Promise<Invoice> {
  await latency(460);
  const student = db().students.find((s) => s.id === input.studentId);
  if (!student) throw new Error("Student not found");
  const invoice: Invoice = {
    id: uid("inv"),
    invoiceNo: `INV-${new Date().getFullYear()}-${String(2000 + db().invoices.length)}`,
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName}`,
    studentAvatar: student.avatarUrl,
    grade: student.grade,
    feeStructureId: input.feeStructureId,
    term: input.term,
    amount: input.amount,
    amountPaid: 0,
    issuedDate: todayKey(),
    dueDate: input.dueDate,
    status: "unpaid",
  };
  db().invoices.unshift(invoice);
  student.feeBalance += input.amount;
  persist();
  recordAudit({
    actor,
    action: "created",
    resourceType: "invoice",
    resourceId: invoice.id,
    resourceLabel: invoice.invoiceNo,
    summary: `Issued ${invoice.invoiceNo} to ${invoice.studentName}`,
  });
  return invoice;
}

export async function voidInvoice(id: string, actor: Actor): Promise<Invoice> {
  await latency(360);
  const invoice = db().invoices.find((i) => i.id === id);
  if (!invoice) throw new Error("Invoice not found");
  invoice.status = "void";
  const student = db().students.find((s) => s.id === invoice.studentId);
  if (student) student.feeBalance = Math.max(0, student.feeBalance - (invoice.amount - invoice.amountPaid));
  persist();
  recordAudit({
    actor,
    action: "status_changed",
    resourceType: "invoice",
    resourceId: invoice.id,
    resourceLabel: invoice.invoiceNo,
    summary: `Voided ${invoice.invoiceNo}`,
  });
  return invoice;
}

export async function deleteInvoice(id: string, actor: Actor): Promise<void> {
  await latency(320);
  const invoice = db().invoices.find((i) => i.id === id);
  if (!invoice) throw new Error("Invoice not found");
  db().invoices = db().invoices.filter((i) => i.id !== id);
  db().payments = db().payments.filter((p) => p.invoiceId !== id);
  persist();
  recordAudit({
    actor,
    action: "deleted",
    resourceType: "invoice",
    resourceId: id,
    resourceLabel: invoice.invoiceNo,
    summary: `Deleted ${invoice.invoiceNo}`,
  });
}

export async function refundPayment(id: string, actor: Actor): Promise<PaymentTransaction> {
  await latency(420);
  const payment = db().payments.find((p) => p.id === id);
  if (!payment) throw new Error("Receipt not found");
  payment.status = "refunded";
  const invoice = db().invoices.find((i) => i.id === payment.invoiceId);
  if (invoice) {
    invoice.amountPaid = Math.max(0, invoice.amountPaid - payment.amount);
    invoice.status = invoice.amountPaid <= 0 ? "unpaid" : "partial";
    const student = db().students.find((s) => s.id === invoice.studentId);
    if (student) student.feeBalance = invoice.amount - invoice.amountPaid;
  }
  persist();
  recordAudit({
    actor,
    action: "status_changed",
    resourceType: "payment",
    resourceId: payment.id,
    resourceLabel: payment.receiptNo,
    summary: `Refunded ${payment.receiptNo} for ${payment.studentName}`,
  });
  return payment;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface PaymentsAnalytics {
  collections: { month: string; collected: number; billed: number }[];
  byGrade: { grade: string; billed: number; collected: number; rate: number }[];
  ageing: { bucket: string; count: number; amount: number }[];
  methods: { method: string; label: string; count: number; amount: number }[];
}

export async function getPaymentsAnalytics(): Promise<PaymentsAnalytics> {
  await latency(300);
  const invoices = db().invoices;
  const payments = db().payments;

  const months: { key: string; month: string }[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      month: MONTH_LABELS[date.getMonth()],
    });
  }

  const collections = months.map(({ key, month }) => ({
    month,
    collected: payments
      .filter((p) => p.status === "succeeded" && p.paidAt.slice(0, 7) === key)
      .reduce((sum, p) => sum + p.amount, 0),
    billed: invoices
      .filter((i) => i.issuedDate.slice(0, 7) === key)
      .reduce((sum, i) => sum + i.amount, 0),
  }));

  const grades = Array.from(new Set(invoices.map((i) => i.grade))).sort();
  const byGrade = grades.map((grade) => {
    const own = invoices.filter((i) => i.grade === grade);
    const billed = own.reduce((sum, i) => sum + i.amount, 0);
    const collected = own.reduce((sum, i) => sum + i.amountPaid, 0);
    return { grade, billed, collected, rate: billed ? Math.round((collected / billed) * 100) : 0 };
  });

  const today = new Date();
  const buckets: { bucket: string; min: number; max: number }[] = [
    { bucket: "Due soon", min: -9999, max: 0 },
    { bucket: "1–15 days", min: 1, max: 15 },
    { bucket: "16–30 days", min: 16, max: 30 },
    { bucket: "31+ days", min: 31, max: 9999 },
  ];
  const ageing = buckets.map(({ bucket, min, max }) => {
    const rows = invoices.filter((i) => {
      if (i.status === "paid" || i.status === "void") return false;
      const days = Math.round((today.getTime() - new Date(i.dueDate).getTime()) / 86400000);
      return days >= min && days <= max;
    });
    return {
      bucket,
      count: rows.length,
      amount: rows.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0),
    };
  });

  const methodLabels: Record<string, string> = {
    card: "Card",
    bank_transfer: "Bank transfer",
    cash: "Cash",
    cheque: "Cheque",
    wallet: "Wallet",
  };
  const methods = Object.keys(methodLabels).map((method) => {
    const rows = payments.filter((p) => p.method === method && p.status !== "refunded");
    return {
      method,
      label: methodLabels[method],
      count: rows.length,
      amount: rows.reduce((sum, p) => sum + p.amount, 0),
    };
  });

  return { collections, byGrade, ageing, methods };
}

export function invoiceFilterOptions() {
  return {
    grades: Array.from(new Set(db().invoices.map((i) => i.grade))).sort(),
    terms: Array.from(new Set(db().invoices.map((i) => i.term))).sort(),
  };
}

/** Everything the invoice detail + checkout screens need in one read. */
export async function getInvoiceDetail(id: string) {
  await latency(220);
  const invoice = db().invoices.find((i) => i.id === id);
  if (!invoice) return null;
  return {
    invoice,
    student: db().students.find((s) => s.id === invoice.studentId) ?? null,
    structure: db().feeStructures.find((f) => f.id === invoice.feeStructureId) ?? null,
    payments: db()
      .payments.filter((p) => p.invoiceId === invoice.id)
      .sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1)),
  };
}

