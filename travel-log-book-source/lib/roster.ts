import builtInRoster from "@/data/roster.json";
import type { Roster, Student } from "@/lib/types";

const ROSTER_KEY = "mkpc-gej-roster-2026";
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined = undefined;
let cachedRoster: Roster | null = null;

export const CLASS_CODES: string[] = [
  "1A",
  "1B",
  "1C",
  "1D",
  "1E",
  "2A",
  "2B",
  "2C",
  "2D",
  "2E",
  "3A",
  "3B",
  "3C",
  "3D",
  "3E",
  "4A",
  "4B",
  "4C",
  "4D",
  "4E",
  "5A",
  "5B",
  "5C",
  "5D",
  "5E",
  "6A",
  "6B",
  "6C",
  "6D",
  "6E",
];

export function formLabel(classCode: string): string {
  const form = classCode.slice(0, 1);
  const letter = classCode.slice(1);
  return `中${["", "一", "二", "三", "四", "五", "六"][Number(form)]}${letter}`;
}

export function classGroups(codes: string[]): { form: string; label: string; codes: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const code of codes) {
    const form = code.replace(/\D/g, "") || code;
    const list = groups.get(form) ?? [];
    list.push(code);
    groups.set(form, list);
  }
  return Array.from(groups.entries()).map(([form, groupCodes]) => ({
    form,
    label: `中${["", "一", "二", "三", "四", "五", "六"][Number(form)] || form}`,
    codes: groupCodes,
  }));
}

export function defaultRoster(): Roster {
  return builtInRoster as Roster;
}

export function hasCustomRoster(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(ROSTER_KEY));
}

function emitRoster() {
  cachedRaw = undefined;
  cachedRoster = null;
  listeners.forEach((listener) => listener());
}

export function subscribeRoster(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStoreChange);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStoreChange);
    }
  };
}

export function getRosterSnapshot(): Roster {
  const builtin = defaultRoster();
  try {
    const raw = localStorage.getItem(ROSTER_KEY);
    if (raw === cachedRaw && cachedRoster) return cachedRoster;
    cachedRaw = raw;
    if (!raw) {
      cachedRoster = builtin;
      return builtin;
    }
    const parsed = JSON.parse(raw) as Roster;
    const importedCount = parsed.students?.length ?? 0;
    if (
      parsed.source === "demo" ||
      importedCount < builtin.students.length
    ) {
      localStorage.removeItem(ROSTER_KEY);
      cachedRaw = null;
      cachedRoster = builtin;
      return builtin;
    }
    cachedRoster = parsed;
    return parsed;
  } catch {
    cachedRoster = builtin;
    return builtin;
  }
}

export function loadRoster(): Roster {
  if (typeof window === "undefined") return defaultRoster();
  return getRosterSnapshot();
}

export function saveRoster(roster: Roster) {
  localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
  emitRoster();
}

export function resetRoster() {
  localStorage.removeItem(ROSTER_KEY);
  emitRoster();
}

export function normalizeClassCode(code: string): string {
  const compact = String(code ?? "").replace(/\s+/g, "").toUpperCase();
  const direct = compact.match(/(?:中)?([1-6])([A-E])/);
  if (direct) return `${direct[1]}${direct[2]}`;
  const formMap: Record<string, string> = {
    一: "1",
    二: "2",
    三: "3",
    四: "4",
    五: "5",
    六: "6",
  };
  const letterMap: Record<string, string> = {
    甲: "A",
    乙: "B",
    丙: "C",
    丁: "D",
    戊: "E",
  };
  const chinese = compact.match(/中([一二三四五六])([A-E甲乙丙丁戊])/);
  if (chinese) {
    const letter = /[A-E]/.test(chinese[2]) ? chinese[2] : letterMap[chinese[2]];
    return `${formMap[chinese[1]]}${letter}`;
  }
  return compact;
}

export function studentsInClass(roster: Roster, classCode: string): Student[] {
  const want = normalizeClassCode(classCode);
  if (!want) return [];
  return roster.students
    .filter((s) => normalizeClassCode(s.classCode) === want)
    .sort((a, b) => a.classNo - b.classNo || a.chineseName.localeCompare(b.chineseName, "zh-HK"));
}

export function classCodesFromRoster(roster: Roster): string[] {
  const set = new Set<string>([
    ...CLASS_CODES,
    ...roster.classes,
    ...roster.students.map((s) => s.classCode),
  ]);
  return Array.from(set).sort((a, b) => {
    const fa = Number(a.replace(/\D/g, "")) || 0;
    const fb = Number(b.replace(/\D/g, "")) || 0;
    if (fa !== fb) return fa - fb;
    return a.localeCompare(b);
  });
}
