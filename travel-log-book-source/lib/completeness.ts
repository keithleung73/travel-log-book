import type { DayEntry, Journal } from "@/lib/types";

export const MIN_ITINERARY = 20;
export const MIN_FEELING = 40;
export const MIN_OVERALL = 30;
export const MIN_EXPECTATION = 20;

function filled(value: string | null | undefined, min = 1): boolean {
  return Boolean(value && value.trim().length >= min);
}

export function isStudentComplete(journal: Journal): boolean {
  return filled(journal.classCode) && filled(journal.chineseName);
}

export function isTourComplete(journal: Journal): boolean {
  return (
    filled(journal.tourName) &&
    filled(journal.destination) &&
    filled(journal.startDate) &&
    filled(journal.endDate) &&
    journal.days > 0 &&
    journal.dayEntries.length > 0 &&
    filled(journal.expectation, MIN_EXPECTATION) &&
    journal.honorPledge
  );
}

export function isDayComplete(day: DayEntry | undefined): boolean {
  if (!day) return false;
  return (
    filled(day.title) &&
    filled(day.weather) &&
    filled(day.itinerary, MIN_ITINERARY) &&
    filled(day.feeling, MIN_FEELING) &&
    Boolean(day.photos[0] && day.photos[1] && day.photos[2])
  );
}

export function firstIncompleteDayIndex(journal: Journal): number {
  const index = journal.dayEntries.findIndex((day) => !isDayComplete(day));
  return index === -1 ? journal.dayEntries.length : index;
}

export function canOpenDay(journal: Journal, index: number): boolean {
  if (index < 0 || index >= journal.dayEntries.length) return false;
  return journal.dayEntries.slice(0, index).every(isDayComplete);
}

export function isDaysComplete(journal: Journal): boolean {
  return journal.dayEntries.length > 0 && journal.dayEntries.every(isDayComplete);
}

export function isOverallComplete(journal: Journal): boolean {
  return (
    filled(journal.overallFeeling, MIN_OVERALL) &&
    filled(journal.knowledgeLearned, MIN_OVERALL) &&
    filled(journal.skillsLearned, MIN_OVERALL) &&
    filled(journal.mostMemorable, MIN_OVERALL) &&
    filled(journal.gratitude, MIN_OVERALL)
  );
}

export function canSubmit(journal: Journal): boolean {
  return (
    isStudentComplete(journal) &&
    isTourComplete(journal) &&
    isDaysComplete(journal) &&
    isOverallComplete(journal) &&
    journal.honorPledge
  );
}

export function missingRequirements(journal: Journal): string[] {
  const missing: string[] = [];
  if (!filled(journal.classCode) || !filled(journal.chineseName)) {
    missing.push("班別與姓名");
  }
  if (!journal.honorPledge) {
    missing.push("確認沒有使用 AI 代寫後複製貼上");
  }
  if (!filled(journal.tourName) || !filled(journal.destination) || journal.days <= 0) {
    missing.push("交流團名稱、目的地與日期");
  }
  if (!filled(journal.expectation, MIN_EXPECTATION)) {
    missing.push(`出發前期望（至少 ${MIN_EXPECTATION} 字）`);
  }
  journal.dayEntries.forEach((day) => {
    if (!isDayComplete(day)) {
      missing.push(`第 ${day.dayNumber} 天：主題、天氣、行程、三張相片與感受`);
    }
  });
  if (journal.dayEntries.length === 0) {
    missing.push("每日日誌");
  }
  if (!isOverallComplete(journal)) {
    missing.push(`整體感受五欄（每欄至少 ${MIN_OVERALL} 字）`);
  }
  return missing;
}

export function dayProgressLabel(day: DayEntry): string {
  const parts = [
    filled(day.title) ? 1 : 0,
    filled(day.weather) ? 1 : 0,
    filled(day.itinerary, MIN_ITINERARY) ? 1 : 0,
    filled(day.feeling, MIN_FEELING) ? 1 : 0,
    day.photos.filter(Boolean).length === 3 ? 1 : 0,
  ];
  const done = parts.reduce((sum, item) => sum + item, 0);
  return `${done}/5`;
}
