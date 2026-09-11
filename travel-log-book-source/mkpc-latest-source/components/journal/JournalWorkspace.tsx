"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Save,
  Send,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { PhotoSlot } from "@/components/journal/PhotoSlot";
import { HonestTextarea } from "@/components/journal/HonestTextarea";
import { IntegrityBanner } from "@/components/journal/IntegrityBanner";
import { NativeSelect } from "@/components/journal/NativeSelect";
import { StudentPicker } from "@/components/journal/StudentPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  canSubmit,
  firstIncompleteDayIndex,
  isDayComplete,
  isDaysComplete,
  isOverallComplete,
  isStudentComplete,
  isTourComplete,
  MIN_EXPECTATION,
  MIN_FEELING,
  MIN_ITINERARY,
  MIN_OVERALL,
  missingRequirements,
} from "@/lib/completeness";
import { countDays, formatLongDate, syncDayEntries } from "@/lib/dates";
import { createJournalId } from "@/lib/journal";
import {
  defaultRoster,
  getRosterSnapshot,
  studentsInClass,
  subscribeRoster,
} from "@/lib/roster";
import { publicUrl } from "@/lib/public-url";
import {
  listJournals,
  loadJournal,
  loadSessionJournal,
  loadSubmission,
  saveJournal,
  saveSessionJournal,
  saveSubmission,
  deleteSubmission,
} from "@/lib/storage";
import { isStaffLoggedIn } from "@/lib/staff-auth";
import {
  assertReadyToSubmit,
  buildSubmissionFile,
  downloadJsonFile,
  submissionFilename,
} from "@/lib/submission";
import { WEATHER_OPTIONS } from "@/lib/tours";
import {
  listTours,
  setEnrollmentFlags,
  subscribeTours,
  teacherNamesOf,
  tourSummary,
} from "@/lib/tour-catalog";
import { TOUR_CATEGORIES, type Journal, type Roster, type TourCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "student", label: "班別姓名", icon: UserRound },
  { id: "tour", label: "交流團", icon: Globe2 },
  { id: "days", label: "每日日誌", icon: CalendarDays },
  { id: "overall", label: "整體感受", icon: BookOpen },
  { id: "submit", label: "提交", icon: Send },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function emptyJournal(): Journal {
  return {
    id: "draft",
    classCode: "",
    studentId: "",
    chineseName: "",
    englishName: "",
    tourId: "",
    tourName: "",
    destination: "",
    startDate: "",
    endDate: "",
    days: 0,
    expectation: "",
    dayEntries: [],
    overallFeeling: "",
    knowledgeLearned: "",
    skillsLearned: "",
    mostMemorable: "",
    gratitude: "",
    honorPledge: false,
    updatedAt: "",
  };
}

function canEnterStep(journal: Journal, id: StepId): boolean {
  if (id === "student") return true;
  if (id === "tour") return isStudentComplete(journal);
  if (id === "days") return isTourComplete(journal);
  if (id === "overall") return isDaysComplete(journal);
  return isOverallComplete(journal);
}

export function JournalWorkspace() {
  const searchParams = useSearchParams();
  const bundledRoster = useSyncExternalStore(subscribeRoster, getRosterSnapshot, defaultRoster);
  const tours = useSyncExternalStore(subscribeTours, listTours, listTours);
  const [fetchedRoster, setFetchedRoster] = useState<Roster | null>(null);
  const roster = fetchedRoster?.students.length ? fetchedRoster : bundledRoster;
  const [journal, setJournal] = useState<Journal>(emptyJournal);
  const [step, setStep] = useState<StepId>("student");
  const [dayIndex, setDayIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [drafts, setDrafts] = useState<Journal[]>([]);
  const [staffMode, setStaffMode] = useState(false);
  const [tourFilter, setTourFilter] = useState<TourCategory | "全部">("全部");

  useEffect(() => {
    setStaffMode(isStaffLoggedIn());
  }, []);

  useEffect(() => {
    void fetch(publicUrl("/roster.json"))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.students?.length) {
          setFetchedRoster(data);
        }
      })
      .catch(() => undefined);
  }, []);

  const requestedId = searchParams.get("id");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const all = await listJournals();
      if (cancelled) return;
      setDrafts(all);
      const session = loadSessionJournal();
      if (cancelled) return;

      if (requestedId) {
        const found = (await loadJournal(requestedId)) || (await loadSubmission(requestedId));
        if (found && !cancelled) {
          setJournal({ ...emptyJournal(), ...found, honorPledge: Boolean(found.honorPledge) });
          saveSessionJournal(found);
        }
      } else {
        setJournal((prev) => {
          const alreadyStarted = Boolean(prev.classCode || prev.chineseName || prev.tourName);
          if (alreadyStarted) return prev;
          if (session?.classCode || session?.chineseName || session?.tourName) {
            return { ...emptyJournal(), ...session, honorPledge: Boolean(session.honorPledge) };
          }
          return prev;
        });
      }

      if (!cancelled) setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [requestedId]);

  useEffect(() => {
    if (!loaded) return;
    saveSessionJournal(journal);
    if (!journal.chineseName && !journal.tourName) return;
    const handle = window.setTimeout(() => {
      const next = { ...journal, updatedAt: new Date().toISOString() };
      void saveJournal(next).then(() => {
        if (staffMode && next.submittedAt) return saveSubmission(next);
      });
    }, 800);
    return () => window.clearTimeout(handle);
  }, [journal, loaded, staffMode]);

  const currentDay = journal.dayEntries[dayIndex];
  const locked = Boolean(journal.submittedAt) && !staffMode;
  const maxOpenDay = Math.max(0, Math.min(firstIncompleteDayIndex(journal), Math.max(journal.dayEntries.length - 1, 0)));

  function patch(partial: Partial<Journal>) {
    if (locked && !("submittedAt" in partial)) {
      toast.message("這本日誌已提交。請用教職員帳號登入後，即可修改內容。");
      return;
    }
    setJournal((prev) => {
      const next = {
        ...prev,
        ...partial,
        id: prev.id === "draft" ? createJournalId() : prev.id,
        updatedAt: new Date().toISOString(),
      };
      saveSessionJournal(next);
      return next;
    });
  }

  function applyDates(startDate: string, endDate: string) {
    const days = countDays(startDate, endDate);
    patch({
      startDate,
      endDate,
      days,
      dayEntries: syncDayEntries(startDate, endDate, journal.dayEntries),
    });
    setDayIndex(0);
  }

  async function persistNow() {
    setSaving(true);
    const next = { ...journal, updatedAt: new Date().toISOString() };
    await saveJournal(next);
    if (staffMode && next.submittedAt) await saveSubmission(next);
    saveSessionJournal(next);
    setJournal(next);
    setSaving(false);
    toast.success(staffMode ? "已儲存老師修改" : "已儲存於此裝置");
  }

  function requestStep(id: StepId) {
    if (id === step) return;
    if (staffMode || canEnterStep(journal, id)) {
      setStep(id);
      if (id === "days") {
        setDayIndex(maxOpenDay);
      }
      return;
    }
    toast.error("請按順序完成每一頁。每日內容完成後，才可以進入下一頁。");
  }

  function goNext() {
    if (step === "student") {
      if (!isStudentComplete(journal)) {
        toast.error("請先選擇班別與姓名。");
        return;
      }
      setStep("tour");
      return;
    }
    if (step === "tour") {
      if (!isTourComplete(journal)) {
        if (!journal.honorPledge) {
          toast.error("請先確認沒有使用 AI 代寫後複製貼上。");
          return;
        }
        toast.error(`請先完成交流團資料。出發前期望至少 ${MIN_EXPECTATION} 字。`);
        return;
      }
      setDayIndex(0);
      setStep("days");
      return;
    }
    if (step === "days") {
      if (!isDayComplete(currentDay)) {
        toast.error("請先完成今天的主題、天氣、行程、三張相片與感受，才可以去下一天。");
        return;
      }
      if (dayIndex < journal.dayEntries.length - 1) {
        setDayIndex(dayIndex + 1);
        return;
      }
      setStep("overall");
      return;
    }
    if (step === "overall") {
      if (!isOverallComplete(journal)) {
        toast.error(`請先完成整體感受五欄，每欄至少 ${MIN_OVERALL} 字，才可以提交。`);
        return;
      }
      setStep("submit");
    }
  }

  function goPrev() {
    if (step === "days" && dayIndex > 0) {
      setDayIndex(dayIndex - 1);
      return;
    }
    const stepIndex = STEPS.findIndex((item) => item.id === step);
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].id);
  }

  async function submitToSchool() {
    if (journal.submittedAt) {
      downloadJsonFile(submissionFilename(journal), buildSubmissionFile(journal));
      toast.success("已再次下載提交檔。請交老師匯入「學校收集」。");
      return;
    }
    try {
      assertReadyToSubmit(journal);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "尚未完成，未能提交");
      return;
    }
    setSubmitting(true);
    try {
      const submittedAt = new Date().toISOString();
      const next: Journal = {
        ...journal,
        submittedAt,
        honorPledge: true,
        updatedAt: submittedAt,
      };
      const file = buildSubmissionFile(next);
      await saveJournal(next);
      await saveSubmission(next);
      saveSessionJournal(next);
      setJournal(next);
      downloadJsonFile(submissionFilename(next), file);
      toast.success("已提交。請把下載的檔案交老師，方便全團收集。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "提交失敗");
    } finally {
      setSubmitting(false);
    }
  }

  async function returnToStudent() {
    if (!window.confirm("退回後此份會從提交名單移除，學生要再提交一次。確定？")) return;
    const next: Journal = { ...journal, submittedAt: undefined, updatedAt: new Date().toISOString() };
    await saveJournal(next);
    await deleteSubmission(next.id);
    saveSessionJournal(next);
    setJournal(next);
    toast.success("已退回。學生可以繼續修改後再提交。");
  }

  const stepIndex = STEPS.findIndex((item) => item.id === step);
  const nextLabel =
    step === "days" && dayIndex < journal.dayEntries.length - 1 ? "下一天" : step === "overall" ? "去提交" : "下一頁";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      {staffMode && (
        <aside className="rounded-2xl border border-navy/20 bg-navy px-4 py-3 text-sm leading-6 text-cream">
          <p className="font-semibold">老師修改模式</p>
          <p className="mt-1 text-cream/80">
            已登入教職員。可以改同學日誌內容（包括已提交），儲存後列印會用最新版本。
            {journal.chineseName ? ` 現正修改：${journal.classCode} ${journal.chineseName}` : ""}
          </p>
          <Link href="/staff/submissions" className="mt-2 inline-block text-gold-soft underline">
            返回提交名單
          </Link>
        </aside>
      )}
      <nav className="no-print flex gap-1 overflow-x-auto rounded-2xl border border-gold/25 bg-card/80 p-2">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          const active = item.id === step;
          const done = index < stepIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => requestStep(item.id)}
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-sm",
                active ? "bg-navy text-cream" : "text-navy/70"
              )}
            >
              {done ? <Check className="size-4 text-gold" /> : <Icon className="size-4" />}
              {item.label}
            </button>
          );
        })}
      </nav>

      <section className="rounded-3xl border border-gold/25 bg-card/90 p-5 shadow-sm md:p-8">
        {step === "student" && (
          <div className="space-y-6">
            <header>
              <h1 className="font-[family-name:var(--font-serif)] text-3xl text-navy">選擇班別與姓名</h1>
            </header>
            <IntegrityBanner />
            {drafts.length > 0 && !searchParams.get("id") && (
              <div className="rounded-2xl border border-gold/30 bg-[#f3ead6] p-4">
                <p className="text-sm font-medium text-navy">繼續未完成的日誌</p>
                <div className="mt-2 space-y-2">
                  {drafts.slice(0, 4).map((draft) => (
                    <Link
                      key={draft.id}
                      href={`/journal?id=${draft.id}`}
                      className="block rounded-xl bg-white/70 px-3 py-2 text-sm hover:bg-white"
                    >
                      {draft.chineseName || "未填姓名"} · {draft.tourName || "未填交流團"} ·{" "}
                      {draft.days || 0} 天
                      {draft.submittedAt ? " · 已提交" : ""}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <StudentPicker
              roster={roster}
              classCode={journal.classCode}
              studentId={journal.studentId}
              chineseName={journal.chineseName}
              englishName={journal.englishName}
              onClassChange={(code) => {
                patch({
                  classCode: code,
                  studentId: "",
                  chineseName: "",
                  englishName: "",
                });
              }}
              onStudentChange={(student, typedName) => {
                if (student) {
                  patch({
                    studentId: student.id,
                    chineseName: student.chineseName || student.englishName,
                    englishName: student.englishName,
                  });
                  return;
                }
                const text = typedName ?? "";
                if (!text.trim()) {
                  patch({ studentId: "", chineseName: "", englishName: "" });
                  return;
                }
                const match = studentsInClass(roster, journal.classCode).find(
                  (item) =>
                    item.chineseName === text ||
                    item.englishName.toLowerCase() === text.toLowerCase()
                );
                if (match) {
                  patch({
                    studentId: match.id,
                    chineseName: match.chineseName,
                    englishName: match.englishName,
                  });
                  return;
                }
                patch({ studentId: "", chineseName: text, englishName: "" });
              }}
            />
          </div>
        )}

        {step === "tour" && (
          <div className="space-y-6">
            <header>
              <h1 className="font-[family-name:var(--font-serif)] text-3xl text-navy">交流團資料</h1>
              <p className="mt-2 text-sm text-navy/65">
                請先揀類別：遊學團、參加比賽、或學科交流／展覽，再選擇本校交流團。系統會按日期自動計算天數。
              </p>
            </header>
            <IntegrityBanner />
            <label className="flex items-start gap-3 rounded-2xl border border-navy/15 bg-white px-4 py-3 text-sm leading-6 text-navy">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-[#102445]"
                checked={journal.honorPledge}
                disabled={locked}
                onChange={(event) => patch({ honorPledge: event.target.checked })}
              />
              <span>
                本人確認這本日誌由自己書寫，<strong>沒有使用 AI 代寫後複製貼上</strong>。
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {(["全部", ...TOUR_CATEGORIES] as const).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setTourFilter(category)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm",
                    tourFilter === category ? "bg-navy text-cream" : "bg-white text-navy/70 ring-1 ring-gold/30"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="space-y-6">
              {(tourFilter === "全部" ? TOUR_CATEGORIES : [tourFilter]).map((category) => {
                const group = tours.filter(
                  (tour) => tour.id !== "custom" && (tour.category || "遊學團") === category
                );
                if (group.length === 0) return null;
                return (
                  <div key={category}>
                    <p className="mb-2 text-[11px] tracking-[0.28em] text-gold">{category}</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {group.map((tour) => {
                        const teachers = teacherNamesOf(tour);
                        return (
                          <button
                            key={tour.id}
                            type="button"
                            onClick={() => {
                              patch({
                                tourId: tour.id,
                                tourName: tour.name,
                                tourCategory: tour.category,
                                leadingTeachers: teachers,
                                destination: tour.destination || journal.destination,
                              });
                              if (tour.startDate && tour.endDate) {
                                applyDates(tour.startDate, tour.endDate);
                              }
                              if (journal.studentId && journal.chineseName) {
                                setEnrollmentFlags(
                                  tour.id,
                                  {
                                    id: journal.studentId,
                                    classCode: journal.classCode,
                                    classNo: 0,
                                    chineseName: journal.chineseName,
                                    englishName: journal.englishName,
                                  },
                                  { going: true }
                                );
                              }
                            }}
                            className={cn(
                              "rounded-2xl border p-4 text-left",
                              journal.tourId === tour.id
                                ? "border-navy bg-navy text-cream"
                                : "border-gold/30 bg-white hover:border-gold"
                            )}
                          >
                            <p className="font-[family-name:var(--font-serif)] text-lg">{tour.name}</p>
                            <p className={cn("mt-1 text-xs leading-5", journal.tourId === tour.id ? "text-cream/70" : "text-navy/55")}>
                              {tourSummary(tour) || tour.blurb}
                            </p>
                            {teachers ? (
                              <p className={cn("mt-1 text-xs", journal.tourId === tour.id ? "text-gold-soft" : "text-navy/50")}>
                                帶隊老師：{teachers}
                              </p>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div>
                <p className="mb-2 text-[11px] tracking-[0.28em] text-gold">其他</p>
                {tours
                  .filter((tour) => tour.id === "custom")
                  .map((tour) => (
                    <button
                      key={tour.id}
                      type="button"
                      onClick={() => {
                        patch({
                          tourId: tour.id,
                          tourName: journal.tourName,
                          destination: journal.destination,
                        });
                      }}
                      className={cn(
                        "rounded-2xl border p-4 text-left",
                        journal.tourId === tour.id
                          ? "border-navy bg-navy text-cream"
                          : "border-gold/30 bg-white hover:border-gold"
                      )}
                    >
                      <p className="font-[family-name:var(--font-serif)] text-lg">{tour.name}</p>
                      <p className={cn("mt-1 text-xs leading-5", journal.tourId === tour.id ? "text-cream/70" : "text-navy/55")}>
                        {tour.blurb}
                      </p>
                    </button>
                  ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>交流團名稱</Label>
                <Input
                  value={journal.tourName}
                  onChange={(e) => patch({ tourName: e.target.value })}
                  placeholder="例如：深圳銀樂隊少青團"
                  readOnly={locked}
                />
              </div>
              <div className="space-y-2">
                <Label>類別</Label>
                <NativeSelect
                  value={journal.tourCategory || ""}
                  disabled={locked}
                  onChange={(event) => patch({ tourCategory: (event.target.value || undefined) as TourCategory | undefined })}
                >
                  <option value="">選擇類別</option>
                  {TOUR_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label>帶隊老師</Label>
                <Input value={journal.leadingTeachers || "由學校安排"} readOnly />
              </div>
              <div className="space-y-2">
                <Label>目的地</Label>
                <Input
                  value={journal.destination}
                  onChange={(e) => patch({ destination: e.target.value })}
                  placeholder="國家 / 城市"
                  readOnly={locked}
                />
              </div>
              <div className="space-y-2">
                <Label>天數</Label>
                <Input value={journal.days ? `${journal.days} 天` : "請先選擇日期"} readOnly />
              </div>
              <div className="space-y-2">
                <Label>開始日期</Label>
                <Input
                  type="date"
                  value={journal.startDate}
                  onChange={(e) => applyDates(e.target.value, journal.endDate || e.target.value)}
                  readOnly={locked}
                />
              </div>
              <div className="space-y-2">
                <Label>結束日期</Label>
                <Input
                  type="date"
                  value={journal.endDate}
                  onChange={(e) => applyDates(journal.startDate || e.target.value, e.target.value)}
                  readOnly={locked}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>出發前期望（至少 {MIN_EXPECTATION} 字，不可貼上）</Label>
                <HonestTextarea
                  rows={5}
                  locked={locked}
                  allowPaste={staffMode}
                  value={journal.expectation}
                  onChange={(e) => patch({ expectation: e.target.value })}
                  placeholder="這次交流，你最想看見、學會或挑戰甚麼？"
                />
                <p className="text-xs text-navy/50">{journal.expectation.trim().length} / {MIN_EXPECTATION} 字</p>
              </div>
            </div>
          </div>
        )}

        {step === "days" && (
          <div className="space-y-6">
            <header>
              <h1 className="font-[family-name:var(--font-serif)] text-3xl text-navy">每日日誌</h1>
              <p className="mt-2 text-sm text-navy/65">
                必須完成當天主題、天氣、行程、三張相片與感受，才可以進入下一天。可返回修改已完成的日子。
              </p>
            </header>
            <IntegrityBanner />
            {journal.dayEntries.length === 0 ? (
              <p className="rounded-2xl bg-[#f3ead6] p-4 text-sm text-navy/70">
                請先在「交流團」一頁填寫開始與結束日期，系統會按天數產生每日頁面。
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {journal.dayEntries.map((day, index) => {
                    const ready = isDayComplete(day);
                    const open = staffMode || index <= maxOpenDay;
                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => {
                          if (!open) {
                            toast.error("請先完成今天的內容，才可以去下一天。");
                            return;
                          }
                          setDayIndex(index);
                        }}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs",
                          index === dayIndex
                            ? "border-navy bg-navy text-cream"
                            : ready
                              ? "border-gold bg-gold/15 text-navy"
                              : open
                                ? "border-gold/30 bg-white text-navy/70"
                                : "border-navy/10 bg-navy/5 text-navy/35"
                        )}
                      >
                        第 {day.dayNumber} 天{ready ? " ✓" : open ? "" : " 鎖"}
                      </button>
                    );
                  })}
                </div>
                {currentDay && (
                  <div className="space-y-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[11px] tracking-[0.3em] text-gold">DAY {currentDay.dayNumber}</p>
                        <p className="text-sm text-navy/60">{formatLongDate(currentDay.date)}</p>
                      </div>
                      <p className="text-xs text-navy/50">
                        {isDayComplete(currentDay) ? "今天已完成" : "今天尚未完成"}
                      </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>當日主題 / 地點</Label>
                        <Input
                          value={currentDay.title}
                          readOnly={locked}
                          onChange={(e) => {
                            const next = [...journal.dayEntries];
                            next[dayIndex] = { ...currentDay, title: e.target.value };
                            patch({ dayEntries: next });
                          }}
                          placeholder="例如：馬六甲世界文化遺產"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weather-select">天氣</Label>
                        <NativeSelect
                          id="weather-select"
                          value={currentDay.weather}
                          disabled={locked}
                          onChange={(event) => {
                            const next = [...journal.dayEntries];
                            next[dayIndex] = { ...currentDay, weather: event.target.value };
                            patch({ dayEntries: next });
                          }}
                        >
                          <option value="">選擇天氣</option>
                          {WEATHER_OPTIONS.map((weather) => (
                            <option key={weather} value={weather}>
                              {weather}
                            </option>
                          ))}
                        </NativeSelect>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {([0, 1, 2] as const).map((slot) => (
                        <PhotoSlot
                          key={`${currentDay.date}-${slot}`}
                          label={`相片 ${slot + 1}`}
                          value={currentDay.photos[slot]}
                          locked={locked}
                          onChange={(dataUrl) => {
                            if (locked) return;
                            const photosNext = [...currentDay.photos] as Journal["dayEntries"][number]["photos"];
                            photosNext[slot] = dataUrl;
                            const next = [...journal.dayEntries];
                            next[dayIndex] = { ...currentDay, photos: photosNext };
                            patch({ dayEntries: next });
                          }}
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>今日行程（至少 {MIN_ITINERARY} 字，不可貼上）</Label>
                      <HonestTextarea
                        rows={4}
                        locked={locked}
                        allowPaste={staffMode}
                        value={currentDay.itinerary}
                        onChange={(e) => {
                          const next = [...journal.dayEntries];
                          next[dayIndex] = { ...currentDay, itinerary: e.target.value };
                          patch({ dayEntries: next });
                        }}
                        placeholder="今天去了哪些地方？做了甚麼學習活動？"
                      />
                      <p className="text-xs text-navy/50">
                        {currentDay.itinerary.trim().length} / {MIN_ITINERARY} 字
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>今日感受與反思（至少 {MIN_FEELING} 字，不可貼上）</Label>
                      <HonestTextarea
                        rows={7}
                        locked={locked}
                        allowPaste={staffMode}
                        value={currentDay.feeling}
                        onChange={(e) => {
                          const next = [...journal.dayEntries];
                          next[dayIndex] = { ...currentDay, feeling: e.target.value };
                          patch({ dayEntries: next });
                        }}
                        placeholder="最觸動你的片刻是甚麼？你有甚麼新的看見或疑問？"
                      />
                      <p className="text-xs text-navy/50">
                        {currentDay.feeling.trim().length} / {MIN_FEELING} 字
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {step === "overall" && (
          <div className="space-y-5">
            <header>
              <h1 className="font-[family-name:var(--font-serif)] text-3xl text-navy">整體感受與所學</h1>
              <p className="mt-2 text-sm text-navy/65">
                五欄都寫滿（每欄至少 {MIN_OVERALL} 字）才可以提交給學校。
              </p>
            </header>
            <IntegrityBanner />
            {[
              {
                key: "overallFeeling" as const,
                label: "這次交流團的整體感受",
                placeholder: "這段旅程帶給你最大的改變或觸動是甚麼？",
              },
              {
                key: "knowledgeLearned" as const,
                label: "我學到的相關知識",
                placeholder: "文化、歷史、科技、語言、城市規劃、大學教育……你學到了甚麼？",
              },
              {
                key: "skillsLearned" as const,
                label: "我培養的能力與價值觀",
                placeholder: "溝通、協作、獨立、同理心、國民身份認同、國際視野……",
              },
              {
                key: "mostMemorable" as const,
                label: "最難忘的一件事",
                placeholder: "用一個具體畫面，寫下你最想永遠記住的片刻。",
              },
              {
                key: "gratitude" as const,
                label: "想對老師、同學或自己說的話",
                placeholder: "感謝、祝福，或給未來自己的一句話。",
              },
            ].map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <HonestTextarea
                  rows={5}
                  locked={locked}
                  allowPaste={staffMode}
                  value={journal[field.key]}
                  onChange={(e) => patch({ [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                />
                <p className="text-xs text-navy/50">
                  {journal[field.key].trim().length} / {MIN_OVERALL} 字
                </p>
              </div>
            ))}
          </div>
        )}

        {step === "submit" && (
          <div className="space-y-5">
            <header>
              <h1 className="font-[family-name:var(--font-serif)] text-3xl text-navy">提交給學校</h1>
              <p className="mt-2 text-sm leading-6 text-navy/65">
                完成全部內容後按「提交給學校」。列印成書由老師在行政專區處理，學生版沒有列印按鈕。
              </p>
              {journal.submittedAt ? (
                <p className="mt-3 rounded-2xl bg-gold/20 px-4 py-3 text-sm text-navy">
                  已提交（{journal.submittedAt.slice(0, 16).replace("T", " ")}）。
                  {staffMode
                    ? "老師可直接改內容並儲存；列印會用最新版本。"
                    : "請把下載的檔案交老師。如需再交一次，可再次下載。"}
                </p>
              ) : (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-navy/70">
                  {missingRequirements(journal).length === 0 ? (
                    <li>內容已齊，可以提交。</li>
                  ) : (
                    missingRequirements(journal).map((item) => <li key={item}>{item}</li>)
                  )}
                </ul>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  className="rounded-full bg-navy"
                  disabled={submitting || (!journal.submittedAt && !canSubmit(journal))}
                  onClick={() => void submitToSchool()}
                >
                  <Send className="size-4" />
                  {submitting ? "提交中…" : journal.submittedAt ? "再次下載提交檔" : "提交給學校"}
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => void persistNow()}>
                  <Save className="size-4" />
                  {saving ? "儲存中…" : staffMode ? "儲存老師修改" : "儲存草稿"}
                </Button>
                {staffMode && journal.submittedAt ? (
                  <Button variant="outline" className="rounded-full" onClick={() => void returnToStudent()}>
                    退回學生修改
                  </Button>
                ) : null}
              </div>
            </header>
          </div>
        )}

        <div className="no-print mt-8 flex items-center justify-between border-t border-gold/20 pt-5">
          <Button
            variant="outline"
            className="rounded-full"
            disabled={stepIndex === 0 && dayIndex === 0}
            onClick={goPrev}
          >
            <ChevronLeft className="size-4" />
            {step === "days" && dayIndex > 0 ? "上一天" : "上一頁"}
          </Button>
          <Button
            className="rounded-full bg-navy"
            disabled={stepIndex === STEPS.length - 1}
            onClick={goNext}
          >
            {nextLabel}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
