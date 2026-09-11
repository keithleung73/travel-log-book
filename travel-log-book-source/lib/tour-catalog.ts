import { formatShortRange } from "@/lib/dates";
import { defaultLeadingTeachers, sortTeachers, teacherLabel } from "@/lib/staff-teachers";
import { TOUR_PRESETS } from "@/lib/tours";
import type {
  Journal,
  LeadingTeacher,
  Roster,
  Student,
  TourCategory,
  TourEnrollment,
  TourPreset,
} from "@/lib/types";
import { TOUR_CATEGORIES } from "@/lib/types";

export { groupTeachers, teacherLabel } from "@/lib/staff-teachers";

export { TOUR_CATEGORIES };
export type { TourCategory };

const TOURS_KEY = "mkpc-tour-catalog-2026";
const TEACHERS_KEY = "mkpc-leading-teachers-go007";
const ENROLL_KEY = "mkpc-tour-enrollments-2026";

const tourListeners = new Set<() => void>();
const teacherListeners = new Set<() => void>();
const enrollListeners = new Set<() => void>();

let cachedTours: TourPreset[] | null = null;
let cachedTeachers: LeadingTeacher[] | null = null;
let cachedEnrollments: TourEnrollment[] | null = null;

type TourCatalogStore = {
  overrides: Record<string, TourPreset>;
  extra: TourPreset[];
  hiddenIds: string[];
};

function emit(listeners: Set<() => void>) {
  cachedTours = null;
  cachedTeachers = null;
  cachedEnrollments = null;
  listeners.forEach((listener) => listener());
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function emptyCatalog(): TourCatalogStore {
  return { overrides: {}, extra: [], hiddenIds: [] };
}

export function subscribeTours(onStoreChange: () => void) {
  tourListeners.add(onStoreChange);
  if (typeof window !== "undefined") window.addEventListener("storage", onStoreChange);
  return () => {
    tourListeners.delete(onStoreChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStoreChange);
  };
}

export function subscribeTeachers(onStoreChange: () => void) {
  teacherListeners.add(onStoreChange);
  if (typeof window !== "undefined") window.addEventListener("storage", onStoreChange);
  return () => {
    teacherListeners.delete(onStoreChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStoreChange);
  };
}

export function subscribeEnrollments(onStoreChange: () => void) {
  enrollListeners.add(onStoreChange);
  if (typeof window !== "undefined") window.addEventListener("storage", onStoreChange);
  return () => {
    enrollListeners.delete(onStoreChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStoreChange);
  };
}

export function defaultTours(): TourPreset[] {
  return TOUR_PRESETS.map((tour) => ({ ...tour }));
}

export function listTours(): TourPreset[] {
  if (cachedTours) return cachedTours;
  const store = readJson<TourCatalogStore>(TOURS_KEY, emptyCatalog());
  const hidden = new Set(store.hiddenIds);
  const builtins = TOUR_PRESETS.filter((tour) => !hidden.has(tour.id)).map((tour) => ({
    ...tour,
    ...(store.overrides[tour.id] ?? {}),
    id: tour.id,
  }));
  const extra = store.extra.filter((tour) => !hidden.has(tour.id) && tour.id !== "custom");
  const custom = builtins.find((tour) => tour.id === "custom");
  const rest = [...builtins.filter((tour) => tour.id !== "custom"), ...extra].sort((a, b) =>
    (a.startDate || "9999").localeCompare(b.startDate || "9999")
  );
  cachedTours = custom ? [...rest, custom] : rest;
  return cachedTours;
}

export function getTour(id: string): TourPreset | undefined {
  return listTours().find((tour) => tour.id === id);
}

export function saveTour(input: TourPreset) {
  const store = readJson<TourCatalogStore>(TOURS_KEY, emptyCatalog());
  const builtin = TOUR_PRESETS.some((tour) => tour.id === input.id);
  const tour: TourPreset = {
    ...input,
    name: input.name.trim(),
    destination: input.destination.trim(),
    blurb: input.blurb.trim() || tourSummary(input),
    teacherIds: (input.teacherIds ?? []).filter(Boolean),
  };
  if (!tour.name) throw new Error("請填交流團名稱");
  if (tour.id === "custom") throw new Error("自訂交流團不可在此修改");
  store.hiddenIds = store.hiddenIds.filter((id) => id !== tour.id);
  if (builtin) {
    store.overrides[tour.id] = tour;
  } else {
    const index = store.extra.findIndex((item) => item.id === tour.id);
    if (index >= 0) store.extra[index] = tour;
    else store.extra.push(tour);
  }
  writeJson(TOURS_KEY, store);
  emit(tourListeners);
}

export function addTour(partial: Omit<TourPreset, "id" | "blurb"> & { blurb?: string }): TourPreset {
  const tour: TourPreset = {
    ...partial,
    id: newId("tour"),
    blurb: partial.blurb || "",
  };
  saveTour(tour);
  return getTour(tour.id) ?? tour;
}

export function deleteTour(id: string) {
  if (id === "custom") throw new Error("自訂交流團不可刪除");
  const store = readJson<TourCatalogStore>(TOURS_KEY, emptyCatalog());
  const builtin = TOUR_PRESETS.some((tour) => tour.id === id);
  if (builtin) {
    store.hiddenIds = Array.from(new Set([...store.hiddenIds, id]));
    delete store.overrides[id];
  } else {
    store.extra = store.extra.filter((tour) => tour.id !== id);
  }
  writeJson(TOURS_KEY, store);
  emit(tourListeners);
}

export function tourSummary(tour: Pick<TourPreset, "destination" | "startDate" | "endDate" | "blurb">): string {
  const range = formatShortRange(tour.startDate, tour.endDate);
  const parts = [tour.destination, range].filter(Boolean);
  return parts.join(" · ") || tour.blurb || "";
}

export function teacherNamesOf(tour: TourPreset, teachers = listTeachers()): string {
  return (tour.teacherIds ?? [])
    .map((id) => {
      const teacher = teachers.find((item) => item.id === id);
      return teacher ? teacherLabel(teacher) : "";
    })
    .filter(Boolean)
    .join("、");
}

function loadTeachers(): LeadingTeacher[] {
  const stored = readJson<LeadingTeacher[] | null>(TEACHERS_KEY, null);
  const source = stored && stored.length > 0 ? stored : defaultLeadingTeachers();
  return source.filter((item) => item.id && item.name.trim());
}

export function listTeachers(): LeadingTeacher[] {
  if (cachedTeachers) return cachedTeachers;
  cachedTeachers = sortTeachers(loadTeachers());
  return cachedTeachers;
}

export function addTeacher(name: string): LeadingTeacher {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("請填老師姓名");
  const teachers = listTeachers();
  const existing = teachers.find((item) => item.name === trimmed);
  if (existing) return existing;
  const teacher = { id: newId("tea"), name: trimmed };
  writeJson(TEACHERS_KEY, [...teachers, teacher]);
  emit(teacherListeners);
  return teacher;
}

export function resetTeachersToSchoolList() {
  const school = defaultLeadingTeachers();
  const keep = new Set(school.map((teacher) => teacher.id));
  writeJson(TEACHERS_KEY, school);
  const store = readJson<TourCatalogStore>(TOURS_KEY, emptyCatalog());
  const strip = (tour: TourPreset): TourPreset => ({
    ...tour,
    teacherIds: (tour.teacherIds ?? []).filter((teacherId) => keep.has(teacherId)),
  });
  store.extra = store.extra.map(strip);
  store.overrides = Object.fromEntries(
    Object.entries(store.overrides).map(([key, tour]) => [key, strip(tour)])
  );
  writeJson(TOURS_KEY, store);
  emit(teacherListeners);
  emit(tourListeners);
}

export function deleteTeacher(id: string) {
  writeJson(
    TEACHERS_KEY,
    listTeachers().filter((item) => item.id !== id)
  );
  const store = readJson<TourCatalogStore>(TOURS_KEY, emptyCatalog());
  const strip = (tour: TourPreset): TourPreset => ({
    ...tour,
    teacherIds: (tour.teacherIds ?? []).filter((teacherId) => teacherId !== id),
  });
  store.extra = store.extra.map(strip);
  store.overrides = Object.fromEntries(
    Object.entries(store.overrides).map(([key, tour]) => [key, strip(tour)])
  );
  writeJson(TOURS_KEY, store);
  emit(teacherListeners);
  emit(tourListeners);
}

export function emptyEnrollments(): TourEnrollment[] {
  return [];
}

export function listEnrollments(): TourEnrollment[] {
  if (cachedEnrollments) return cachedEnrollments;
  cachedEnrollments = readJson<TourEnrollment[]>(ENROLL_KEY, emptyEnrollments());
  return cachedEnrollments;
}

function enrollmentKey(row: Pick<TourEnrollment, "tourId" | "studentId">) {
  return `${row.tourId}::${row.studentId}`;
}

export function saveEnrollment(row: TourEnrollment) {
  const next = listEnrollments().filter((item) => enrollmentKey(item) !== enrollmentKey(row));
  next.push({
    ...row,
    chineseName: row.chineseName.trim(),
    englishName: row.englishName.trim(),
  });
  writeJson(ENROLL_KEY, next);
  emit(enrollListeners);
}

export function setEnrollmentFlags(
  tourId: string,
  student: Student,
  flags: { going?: boolean; subsidyApplied?: boolean }
) {
  const current = listEnrollments().find(
    (item) => item.tourId === tourId && item.studentId === student.id
  );
  const going = flags.going ?? current?.going ?? true;
  const subsidyApplied = flags.subsidyApplied ?? current?.subsidyApplied ?? false;
  if (!going && !subsidyApplied) {
    writeJson(
      ENROLL_KEY,
      listEnrollments().filter((item) => !(item.tourId === tourId && item.studentId === student.id))
    );
    emit(enrollListeners);
    return;
  }
  saveEnrollment({
    tourId,
    studentId: student.id,
    classCode: student.classCode,
    chineseName: student.chineseName,
    englishName: student.englishName,
    going,
    subsidyApplied,
  });
}

export function csvEscape(cells: Array<string | number | boolean>): string {
  return cells.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",");
}

export function studentMatchesJournal(journal: Journal, student: Student): boolean {
  if (journal.studentId && journal.studentId === student.id) return true;
  return (
    journal.classCode === student.classCode &&
    (journal.chineseName === student.chineseName || journal.englishName === student.englishName)
  );
}

export function studentTourRecords(roster: Roster, journals: Journal[]) {
  const tours = listTours().filter((tour) => tour.id !== "custom");
  const enrollments = listEnrollments();
  return roster.students
    .slice()
    .sort(
      (a, b) =>
        a.classCode.localeCompare(b.classCode) ||
        a.classNo - b.classNo ||
        a.chineseName.localeCompare(b.chineseName, "zh-HK")
    )
    .map((student) => {
      const fromEnroll = enrollments.filter((row) => row.studentId === student.id && row.going);
      const fromJournals = journals.filter((journal) => studentMatchesJournal(journal, student) && journal.tourName);
      const tourNames = new Set<string>();
      for (const row of fromEnroll) {
        const tour = tours.find((item) => item.id === row.tourId);
        if (tour) tourNames.add(tour.name);
      }
      for (const journal of fromJournals) tourNames.add(journal.tourName);
      const subsidyCount = fromEnroll.filter((row) => row.subsidyApplied).length;
      return {
        student,
        tourCount: tourNames.size,
        tourNames: Array.from(tourNames),
        subsidyCount,
      };
    });
}

export function teacherTourRecords() {
  const teachers = listTeachers();
  const tours = listTours().filter((tour) => tour.id !== "custom" && !tour.archived);
  return teachers.map((teacher) => {
    const led = tours.filter((tour) => (tour.teacherIds ?? []).includes(teacher.id));
    return {
      teacher,
      tourCount: led.length,
      tours: led,
    };
  });
}

export function studentRecordsCsv(rows: ReturnType<typeof studentTourRecords>): string {
  const header = csvEscape(["班別", "學號", "中文姓名", "英文姓名", "出團次數", "交流團", "曾申請資助次數"]);
  const body = rows.map((row) =>
    csvEscape([
      row.student.classCode,
      String(row.student.classNo).padStart(2, "0"),
      row.student.chineseName,
      row.student.englishName,
      row.tourCount,
      row.tourNames.join("；"),
      row.subsidyCount,
    ])
  );
  return [header, ...body].join("\n");
}

export function teacherRecordsCsv(rows: ReturnType<typeof teacherTourRecords>): string {
  const header = csvEscape(["帶隊老師", "班別", "出團次數", "交流團"]);
  const body = rows.map((row) =>
    csvEscape([
      row.teacher.name,
      row.teacher.classCode || "",
      row.tourCount,
      row.tours.map((tour) => tour.name).join("；"),
    ])
  );
  return [header, ...body].join("\n");
}

export function tourSubsidyCsv(
  tour: TourPreset,
  roster: Roster,
  classCode?: string
): string {
  const header = csvEscape(["交流團", "類別", "班別", "學號", "中文姓名", "英文姓名", "出團", "曾申請資助"]);
  const students = (classCode ? roster.students.filter((item) => item.classCode === classCode) : roster.students)
    .slice()
    .sort(
      (a, b) =>
        a.classCode.localeCompare(b.classCode) ||
        a.classNo - b.classNo ||
        a.chineseName.localeCompare(b.chineseName, "zh-HK")
    );
  const enrollments = listEnrollments().filter((row) => row.tourId === tour.id);
  const body = students.map((student) => {
    const row = enrollments.find((item) => item.studentId === student.id);
    return csvEscape([
      tour.name,
      tour.category || "",
      student.classCode,
      String(student.classNo).padStart(2, "0"),
      student.chineseName,
      student.englishName,
      row?.going ? "是" : "否",
      row?.subsidyApplied ? "是" : "否",
    ]);
  });
  return [header, ...body].join("\n");
}
