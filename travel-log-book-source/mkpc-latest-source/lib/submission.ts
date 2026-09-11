import type { Journal, JournalSubmissionFile } from "@/lib/types";
import { canSubmit } from "@/lib/completeness";

export function submissionFilename(journal: Journal): string {
  const klass = (journal.classCode || "class").replace(/[/\\?%*:|"<>]/g, "");
  const name = (journal.chineseName || journal.englishName || "student").replace(
    /[/\\?%*:|"<>]/g,
    ""
  );
  return `MKPC-${klass}-${name}.json`;
}

export function buildSubmissionFile(journal: Journal): JournalSubmissionFile {
  const submittedAt = journal.submittedAt || new Date().toISOString();
  return {
    kind: "mkpc-journal-submission",
    version: 1,
    submittedAt,
    honorPledge: true,
    journal: { ...journal, submittedAt, honorPledge: true },
  };
}

export function parseSubmissionFile(raw: unknown): Journal {
  if (!raw || typeof raw !== "object") {
    throw new Error("檔案格式不正確");
  }
  const data = raw as Partial<JournalSubmissionFile> & Partial<Journal>;
  if (data.kind === "mkpc-journal-submission" && data.journal) {
    return {
      ...data.journal,
      submittedAt: data.submittedAt || data.journal.submittedAt,
      honorPledge: true,
    };
  }
  if (typeof data.id === "string" && typeof data.chineseName === "string") {
    return data as Journal;
  }
  throw new Error("這不是本校日誌提交檔");
}

export function assertReadyToSubmit(journal: Journal) {
  if (!canSubmit(journal)) {
    throw new Error("請先完成全部日誌內容，才可以提交給學校。");
  }
  if (!journal.honorPledge) {
    throw new Error("請先確認文字由自己書寫，沒有使用 AI 代寫後複製貼上。");
  }
}

export function downloadJsonFile(filename: string, payload: unknown) {
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function submissionsToCsv(journals: Journal[]): string {
  const header = [
    "班別",
    "中文姓名",
    "英文姓名",
    "交流團",
    "目的地",
    "開始日期",
    "結束日期",
    "天數",
    "提交時間",
  ];
  const rows = journals.map((journal) =>
    [
      journal.classCode,
      journal.chineseName,
      journal.englishName,
      journal.tourName,
      journal.destination,
      journal.startDate,
      journal.endDate,
      String(journal.days),
      journal.submittedAt || "",
    ]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(",")
  );
  return [header.join(","), ...rows].join("\n");
}
