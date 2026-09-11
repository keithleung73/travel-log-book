"use client";

import { useState, useSyncExternalStore } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/journal/SiteHeader";
import { StaffGate } from "@/components/journal/StaffGate";
import { Button } from "@/components/ui/button";
import { parseRosterWorkbook } from "@/lib/excel";
import { publicUrl } from "@/lib/public-url";
import {
  classCodesFromRoster,
  defaultRoster,
  formLabel,
  getRosterSnapshot,
  hasCustomRoster,
  resetRoster,
  saveRoster,
  studentsInClass,
  subscribeRoster,
} from "@/lib/roster";

export default function AdminPage() {
  const roster = useSyncExternalStore(subscribeRoster, getRosterSnapshot, defaultRoster);
  const customRoster = useSyncExternalStore(subscribeRoster, hasCustomRoster, () => false);
  const [busy, setBusy] = useState(false);
  const [klass, setKlass] = useState("1A");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const parsed = await parseRosterWorkbook(file);
      saveRoster(parsed);
      setKlass(parsed.classes[0] || "1A");
      toast.success(`已匯入 ${parsed.students.length} 位學生`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "匯入失敗");
    } finally {
      setBusy(false);
    }
  }

  const classes = classCodesFromRoster(roster);
  const students = studentsInClass(roster, klass);

  return (
    <StaffGate>
    <div className="min-h-screen">
      <SiteHeader variant="admin" />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-[11px] tracking-[0.3em] text-gold">GENERAL OFFICE</p>
        <h1 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-navy">
          2026–2027 各班人名紙
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-navy/70">
          系統已內建 2026–2027 各班人名紙（2026.09.02）。如名單有更新，請再匯入最新 Excel。支援本校「S1–S6 各級工作表」格式（班別、班號、英文姓名、中文姓名），或以工作表分班（如 1A、中一A、中一甲），或單一工作表含「班別、學號、中文姓名、英文姓名」欄。
        </p>

        <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-gold/50 bg-card px-6 py-12 text-center">
          <Upload className="mb-3 size-8 text-gold" />
          <p className="font-medium text-navy">{busy ? "讀取中…" : "上載 Excel 人名紙"}</p>
          <p className="mt-1 text-xs text-navy/50">.xlsx / .xls</p>
          <input
            type="file"
            accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            disabled={busy}
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </label>
        <p className="mt-3 text-center text-xs text-navy/50">
          可先
          <a href={publicUrl("/templates/mkpc-class-list-sample.xlsx")} className="mx-1 text-gold underline">
            下載欄位範本
          </a>
          （範本僅含示例姓名，並非真實名單）。
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-navy/70">
          <span>
            來源：{roster.fileName || roster.note || "內建人名紙"}
          </span>
          <span>· {roster.students.length} 人</span>
          <span>· {roster.classes.length} 班</span>
          {customRoster && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                resetRoster();
                toast.message("已還原內建人名紙");
              }}
            >
              還原內建人名紙
            </Button>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {classes.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setKlass(code)}
              className={`rounded-full px-3 py-1 text-xs ${
                klass === code ? "bg-navy text-cream" : "bg-white text-navy/70"
              }`}
            >
              {formLabel(code)}
            </button>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-gold/25 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#f3ead6] text-left text-navy/60">
              <tr>
                <th className="px-4 py-2 font-medium">學號</th>
                <th className="px-4 py-2 font-medium">中文姓名</th>
                <th className="px-4 py-2 font-medium">英文姓名</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-t border-gold/20">
                  <td className="px-4 py-2">{String(student.classNo).padStart(2, "0")}</td>
                  <td className="px-4 py-2">{student.chineseName}</td>
                  <td className="px-4 py-2 text-navy/60">{student.englishName}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-navy/50" colSpan={3}>
                    此班暫無學生。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
    </StaffGate>
  );
}
