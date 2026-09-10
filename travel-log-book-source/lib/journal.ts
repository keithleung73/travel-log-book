import { countDays } from "@/lib/dates";
import type { Journal } from "@/lib/types";

function filled(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function journalCompleteness(journal: Journal): number {
  const checks: boolean[] = [
    filled(journal.classCode),
    filled(journal.chineseName),
    filled(journal.tourName),
    filled(journal.startDate),
    filled(journal.endDate),
    filled(journal.expectation),
    filled(journal.overallFeeling),
    filled(journal.knowledgeLearned),
    filled(journal.skillsLearned),
    filled(journal.mostMemorable),
    filled(journal.gratitude),
  ];

  for (const day of journal.dayEntries) {
    checks.push(filled(day.title), filled(day.itinerary), filled(day.feeling));
    checks.push(Boolean(day.photos[0]), Boolean(day.photos[1]), Boolean(day.photos[2]));
  }

  if (checks.length === 0) return 0;
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export function createJournalId(): string {
  return `j-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function photoCount(journal: Journal): { done: number; total: number } {
  const total = Math.max(journal.days, journal.dayEntries.length) * 3;
  const done = journal.dayEntries.reduce(
    (sum, day) => sum + day.photos.filter(Boolean).length,
    0
  );
  return { done, total: total || countDays(journal.startDate, journal.endDate) * 3 };
}
