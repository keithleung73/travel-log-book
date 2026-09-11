"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Download, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/journal/SiteHeader";
import { StaffGate } from "@/components/journal/StaffGate";
import { Button } from "@/components/ui/button";
import { loadAdminInbox, matchesStudent } from "@/lib/admin-inbox";
import {
  classCodesFromRoster,
  defaultRoster,
  formLabel,
  getRosterSnapshot,
  studentsInClass,
  subscribeRoster,
} from "@/lib/roster";
import {
  deleteSubmission,
  saveJournal,
  saveSubmission,
} from "@/lib/storage";
import {
  downloadJsonFile,
  parseSubmissionFile,
  submissionFilename,
  submissionsToCsv,
} from "@/lib/submission";
import { downloadBlob, zipStore } from "@/lib/zip-store";
import type { Journal } from "@/lib/types";

export default function StaffSubmissionsPage() {
  const roster = useSyncExternalStore(subscribeRoster, getRosterSnapshot, defaultRoster);
  const [items, setItems] = useState<Journal[]>([]);
  const [tour, setTour] = useState("all");
  const [klass, setKlass] = useState("all");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setItems(await loadAdminInbox());
  }

  useEffect(() => {
    void refresh();
  }, []);

  const tours = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.tourName).filter(Boolean))).sort();
  }, [items]);

  const classes = classCodesFromRoster(roster);

  const submitted = useMemo(() => {
    return items.filter((item) => {
      if (tour !== "all" && item.tourName !== tour) return false;
      if (klass !== "all" && item.classCode !== klass) return false;
      return true;
    });
  }, [items, tour, klass]);

  const rosterRows = useMemo(() => {
    if (klass === "all") return [];
    return studentsInClass(roster, klass).map((student) => {
      const journal = items.find(
        (item) =>
          (tour === "all" || item.tourName === tour) &&
          matchesStudent(item, student.id, student.classCode, student.chineseName)
      );
      return { student, journal };
    });
  }, [items, klass, roster, tour]);

  async function importFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    let ok = 0;
    try {
      for (const file of Array.from(files)) {
        const journal = parseSubmissionFile(JSON.parse(await file.text()) as unknown);
        if (!journal.submittedAt) journal.submittedAt = new Date().toISOString();
        journal.honorPledge = true;
        await saveSubmission(journal);
        await saveJournal(journal);
        ok += 1;
      }
      await refresh();
      toast.success(`已匯入 ${ok} 份日誌`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "匯入失敗");
    } finally {
      setBusy(false);
    }
  }

  function downloadAllZip() {
    if (submitted.length === 0) {
      toast.error("尚未有提交檔");
      return;
    }
    const zip = zipStore(
      submitted.map((journal) => ({
        name: submissionFilename(journal),
        content: `${JSON.stringify(
          {
            kind: "mkpc-journal-submission",
            version: 1,
            submittedAt: journal.submittedAt,
            honorPledge: true,
            journal,
          },
          null,
          2
        )}\n`,
      }))
    );
    downloadBlob("MKPC-journals.zip", zip);
  }

  return (
    <StaffGate>
    <div className="min-h-screen">
      <SiteHeader variant="admin" />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-[11px] tracking-[0.3em] text-gold">ADMIN GROUP</p>
        <h1 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-navy">誰已提交 · 列印成書</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-navy/70">
          同學在學生版完成後按「提交給學校」。同一部電腦會即時出現在此名單。老師可按「修改內容」改正日誌，儲存後再列印。若同學用自己的手機填寫，請把下載的
          JSON 檔在此匯入，即可核對、修改並列印。
        </p>
        <p className="mt-2 text-sm text-navy">
          已收到 <strong>{submitted.length}</strong> 份
          {klass !== "all" ? ` · ${formLabel(klass)} 已交 ${rosterRows.filter((row) => row.journal).length} / ${rosterRows.length}` : ""}
        </p>

        <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-gold/50 bg-card px-6 py-10 text-center">
          <Upload className="mb-3 size-8 text-gold" />
          <p className="font-medium text-navy">{busy ? "匯入中…" : "匯入同學提交檔（可一次多個）"}</p>
          <input
            type="file"
            accept="application/json,.json"
            multiple
            className="hidden"
            disabled={busy}
            onChange={(event) => {
              void importFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTour("all")}
            className={`rounded-full px-3 py-1.5 text-xs ${tour === "all" ? "bg-navy text-cream" : "bg-white text-navy/70"}`}
          >
            全部交流團
          </button>
          {tours.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setTour(name)}
              className={`rounded-full px-3 py-1.5 text-xs ${tour === name ? "bg-navy text-cream" : "bg-white text-navy/70"}`}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setKlass("all")}
            className={`rounded-full px-3 py-1.5 text-xs ${klass === "all" ? "bg-navy text-cream" : "bg-white text-navy/70"}`}
          >
            全部班別
          </button>
          {classes.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setKlass(code)}
              className={`rounded-full px-3 py-1.5 text-xs ${klass === code ? "bg-navy text-cream" : "bg-white text-navy/70"}`}
            >
              {formLabel(code)}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="rounded-full bg-navy" onClick={downloadAllZip}>
            <Download className="size-4" />
            下載已提交 JSON
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              if (submitted.length === 0) {
                toast.error("尚未有提交檔");
                return;
              }
              downloadBlob(
                "MKPC-journal-submissions.csv",
                new Blob([`\uFEFF${submissionsToCsv(submitted)}\n`], { type: "text/csv;charset=utf-8" })
              );
            }}
          >
            下載名單 CSV
          </Button>
        </div>

        {klass !== "all" ? (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-gold/25 bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-[#f3ead6] text-left text-navy/60">
                <tr>
                  <th className="px-4 py-2 font-medium">學號</th>
                  <th className="px-4 py-2 font-medium">姓名</th>
                  <th className="px-4 py-2 font-medium">狀態</th>
                  <th className="px-4 py-2 font-medium">交流團</th>
                  <th className="px-4 py-2 font-medium">修改 / 列印</th>
                </tr>
              </thead>
              <tbody>
                {rosterRows.map(({ student, journal }) => (
                  <tr key={student.id} className="border-t border-gold/20">
                    <td className="px-4 py-3">{String(student.classNo).padStart(2, "0")}</td>
                    <td className="px-4 py-3">
                      {student.chineseName}
                      <span className="ml-2 text-xs text-navy/50">{student.englishName}</span>
                    </td>
                    <td className="px-4 py-3">
                      {journal ? (
                        <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs text-navy">已提交</span>
                      ) : (
                        <span className="rounded-full bg-navy/10 px-2 py-0.5 text-xs text-navy/50">未提交</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-navy/70">{journal?.tourName || "—"}</td>
                    <td className="px-4 py-3">
                      {journal ? (
                        <div className="flex flex-wrap gap-3">
                          <Link href={`/journal?id=${journal.id}`} className="text-navy underline">
                            修改內容
                          </Link>
                          <Link href={`/print?id=${journal.id}`} className="text-navy underline" target="_blank">
                            列印成書
                          </Link>
                        </div>
                      ) : (
                        <span className="text-navy/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-gold/25 bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-[#f3ead6] text-left text-navy/60">
                <tr>
                  <th className="px-4 py-2 font-medium">班別</th>
                  <th className="px-4 py-2 font-medium">姓名</th>
                  <th className="px-4 py-2 font-medium">交流團</th>
                  <th className="px-4 py-2 font-medium">提交時間</th>
                  <th className="px-4 py-2 font-medium">修改 / 列印</th>
                </tr>
              </thead>
              <tbody>
                {submitted.map((journal) => (
                  <tr key={journal.id} className="border-t border-gold/20">
                    <td className="px-4 py-3">{formLabel(journal.classCode)}</td>
                    <td className="px-4 py-3">
                      {journal.chineseName}
                      <span className="ml-2 text-xs text-navy/50">{journal.englishName}</span>
                    </td>
                    <td className="px-4 py-3">{journal.tourName || "—"}</td>
                    <td className="px-4 py-3 text-navy/70">
                      {(journal.submittedAt || journal.updatedAt).slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-3">
                        <Link href={`/journal?id=${journal.id}`} className="text-navy underline">
                          修改內容
                        </Link>
                        <Link href={`/print?id=${journal.id}`} className="text-navy underline" target="_blank">
                          列印成書
                        </Link>
                        <button
                          type="button"
                          className="text-navy/70 underline"
                          onClick={() =>
                            downloadJsonFile(submissionFilename(journal), {
                              kind: "mkpc-journal-submission",
                              version: 1,
                              submittedAt: journal.submittedAt,
                              honorPledge: true,
                              journal,
                            })
                          }
                        >
                          下載
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-[#8a1f1f]"
                          onClick={() => {
                            void deleteSubmission(journal.id).then(() => {
                              toast.message("已移除");
                              void refresh();
                            });
                          }}
                        >
                          <Trash2 className="size-3" />
                          移除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {submitted.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-navy/50" colSpan={5}>
                      尚未有提交。請同學在學生版完成後提交，或在此匯入 JSON 檔。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
    </StaffGate>
  );
}
