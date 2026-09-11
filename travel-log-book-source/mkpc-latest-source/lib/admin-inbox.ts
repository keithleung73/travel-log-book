import type { Journal } from "@/lib/types";
import { listJournals, listSubmissions } from "@/lib/storage";

export async function loadAdminInbox(): Promise<Journal[]> {
  const [submissions, journals] = await Promise.all([listSubmissions(), listJournals()]);
  const map = new Map<string, Journal>();
  for (const journal of journals) {
    if (journal.submittedAt) map.set(journal.id, journal);
  }
  for (const journal of submissions) {
    map.set(journal.id, journal);
  }
  return Array.from(map.values()).sort((a, b) =>
    (b.submittedAt || b.updatedAt).localeCompare(a.submittedAt || a.updatedAt)
  );
}

export function matchesStudent(journal: Journal, studentId: string, classCode: string, chineseName: string) {
  if (studentId && journal.studentId === studentId) return true;
  return journal.classCode === classCode && journal.chineseName === chineseName;
}
