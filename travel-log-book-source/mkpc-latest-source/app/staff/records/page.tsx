"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/journal/SiteHeader";
import { StaffGate } from "@/components/journal/StaffGate";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/journal/NativeSelect";
import {
  classCodesFromRoster,
  defaultRoster,
  formLabel,
  getRosterSnapshot,
  studentsInClass,
  subscribeRoster,
} from "@/lib/roster";
import { listJournals } from "@/lib/storage";
import {
  listEnrollments,
  listTeachers,
  listTours,
  setEnrollmentFlags,
  studentRecordsCsv,
  studentTourRecords,
  subscribeEnrollments,
  subscribeTeachers,
  subscribeTours,
  teacherRecordsCsv,
  teacherTourRecords,
  tourSubsidyCsv,
} from "@/lib/tour-catalog";
import { downloadBlob } from "@/lib/zip-store";
import type { Journal } from "@/lib/types";

type Tab = "students" | "teachers" | "subsidy";

export default function StaffRecordsPage() {
  const roster = useSyncExternalStore(subscribeRoster, getRosterSnapshot, defaultRoster);
  const tours = useSyncExternalStore(subscribeTours, listTours, listTours);
  const teachers = useSyncExternalStore(subscribeTeachers, listTeachers, listTeachers);
  const enrollments = useSyncExternalStore(subscribeEnrollments, listEnrollments, listEnrollments);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [tab, setTab] = useState<Tab>("students");
  const [klass, setKlass] = useState(classCodesFromRoster(roster)[0] || "1A");
  const selectableTours = tours.filter((tour) => tour.id !== "custom");
  const [tourId, setTourId] = useState(selectableTours[0]?.id || "");

  useEffect(() => {
    void listJournals().then(setJournals);
  }, [enrollments]);

  const studentRows = useMemo(
    () => studentTourRecords(roster, journals).filter((row) => row.student.classCode === klass),
    [roster, journals, klass]
  );
  const teacherRows = useMemo(() => teacherTourRecords(), [teachers, tours]);
  const currentTour = selectableTours.find((tour) => tour.id === tourId) ?? selectableTours[0];
  const classStudents = currentTour ? studentsInClass(roster, klass) : [];

  function download(filename: string, csv: string) {
    downloadBlob(filename, new Blob([`\uFEFF${csv}\n`], { type: "text/csv;charset=utf-8" }));
    toast.success("已下載 CSV");
  }

  return (
    <StaffGate>
      <div className="min-h-screen">
        <SiteHeader variant="admin" />
        <main className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-[11px] tracking-[0.3em] text-gold">ADMIN · RECORDS</p>
          <h1 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-navy">出團總記錄與資助</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-navy/70">
            輸出每班學生出團總記錄、每位帶隊老師出團總記錄；亦可按團勾選同學是否出團、是否曾申請資助。
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {(
              [
                ["students", "每班學生出團總記錄"],
                ["teachers", "老師出團總記錄"],
                ["subsidy", "每團資助紀錄"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-full px-4 py-1.5 text-sm ${tab === id ? "bg-navy text-cream" : "bg-white text-navy/70"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "students" && (
            <section className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <NativeSelect value={klass} onChange={(event) => setKlass(event.target.value)}>
                  {classCodesFromRoster(roster).map((code) => (
                    <option key={code} value={code}>
                      {formLabel(code)}
                    </option>
                  ))}
                </NativeSelect>
                <Button
                  className="rounded-full bg-navy"
                  onClick={() =>
                    download(
                      `MKPC-${klass}-student-tours.csv`,
                      studentRecordsCsv(studentRows)
                    )
                  }
                >
                  下載此班 CSV
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() =>
                    download("MKPC-all-students-tours.csv", studentRecordsCsv(studentTourRecords(roster, journals)))
                  }
                >
                  下載全校 CSV
                </Button>
              </div>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-gold/25 bg-white">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-[#f3ead6] text-left text-navy/60">
                    <tr>
                      <th className="px-4 py-2 font-medium">學號</th>
                      <th className="px-4 py-2 font-medium">姓名</th>
                      <th className="px-4 py-2 font-medium">出團次數</th>
                      <th className="px-4 py-2 font-medium">交流團</th>
                      <th className="px-4 py-2 font-medium">曾申請資助</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentRows.map((row) => (
                      <tr key={row.student.id} className="border-t border-gold/20">
                        <td className="px-4 py-3">{String(row.student.classNo).padStart(2, "0")}</td>
                        <td className="px-4 py-3">
                          {row.student.chineseName}
                          <span className="ml-2 text-xs text-navy/50">{row.student.englishName}</span>
                        </td>
                        <td className="px-4 py-3">{row.tourCount}</td>
                        <td className="px-4 py-3 text-navy/70">{row.tourNames.join("、") || "—"}</td>
                        <td className="px-4 py-3">{row.subsidyCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "teachers" && (
            <section className="mt-6">
              <Button
                className="rounded-full bg-navy"
                onClick={() => download("MKPC-teacher-tours.csv", teacherRecordsCsv(teacherRows))}
              >
                下載老師出團 CSV
              </Button>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-gold/25 bg-white">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="bg-[#f3ead6] text-left text-navy/60">
                    <tr>
                      <th className="px-4 py-2 font-medium">帶隊老師</th>
                      <th className="px-4 py-2 font-medium">出團次數</th>
                      <th className="px-4 py-2 font-medium">交流團</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherRows.map((row) => (
                      <tr key={row.teacher.id} className="border-t border-gold/20">
                        <td className="px-4 py-3">{row.teacher.name}</td>
                        <td className="px-4 py-3">{row.tourCount}</td>
                        <td className="px-4 py-3 text-navy/70">
                          {row.tours.map((tour) => tour.name).join("、") || "—"}
                        </td>
                      </tr>
                    ))}
                    {teacherRows.length === 0 && (
                      <tr>
                        <td className="px-4 py-8 text-navy/50" colSpan={3}>
                          尚未加入帶隊老師。請先到「交流團與帶隊老師」頁新增。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "subsidy" && currentTour && (
            <section className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <NativeSelect value={currentTour.id} onChange={(event) => setTourId(event.target.value)}>
                  {selectableTours.map((tour) => (
                    <option key={tour.id} value={tour.id}>
                      {tour.category ? `${tour.category} · ` : ""}
                      {tour.name}
                    </option>
                  ))}
                </NativeSelect>
                <NativeSelect value={klass} onChange={(event) => setKlass(event.target.value)}>
                  {classCodesFromRoster(roster).map((code) => (
                    <option key={code} value={code}>
                      {formLabel(code)}
                    </option>
                  ))}
                </NativeSelect>
                <Button
                  className="rounded-full bg-navy"
                  onClick={() =>
                    download(
                      `MKPC-${currentTour.id}-${klass}-subsidy.csv`,
                      tourSubsidyCsv(currentTour, roster, klass)
                    )
                  }
                >
                  下載此團此班 CSV
                </Button>
              </div>
              <p className="mt-3 text-sm text-navy/65">
                在「{currentTour.name}」勾選此班誰出團，以及該生是否曾申請資助。
              </p>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-gold/25 bg-white">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-[#f3ead6] text-left text-navy/60">
                    <tr>
                      <th className="px-4 py-2 font-medium">學號</th>
                      <th className="px-4 py-2 font-medium">姓名</th>
                      <th className="px-4 py-2 font-medium">出團</th>
                      <th className="px-4 py-2 font-medium">曾申請資助</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((student) => {
                      const row = enrollments.find(
                        (item) => item.tourId === currentTour.id && item.studentId === student.id
                      );
                      return (
                        <tr key={student.id} className="border-t border-gold/20">
                          <td className="px-4 py-3">{String(student.classNo).padStart(2, "0")}</td>
                          <td className="px-4 py-3">
                            {student.chineseName}
                            <span className="ml-2 text-xs text-navy/50">{student.englishName}</span>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              className="size-4 accent-[#102445]"
                              checked={Boolean(row?.going)}
                              onChange={(event) =>
                                setEnrollmentFlags(currentTour.id, student, {
                                  going: event.target.checked,
                                  subsidyApplied: event.target.checked ? row?.subsidyApplied : false,
                                })
                              }
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              className="size-4 accent-[#102445]"
                              checked={Boolean(row?.subsidyApplied)}
                              onChange={(event) =>
                                setEnrollmentFlags(currentTour.id, student, {
                                  going: event.target.checked ? true : row?.going,
                                  subsidyApplied: event.target.checked,
                                })
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>
    </StaffGate>
  );
}
