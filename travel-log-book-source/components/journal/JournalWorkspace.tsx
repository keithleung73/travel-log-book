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
  Printer,
  Save,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { PhotoSlot } from "@/components/journal/PhotoSlot";
import { BookPages } from "@/components/journal/BookPages";
import { NativeSelect } from "@/components/journal/NativeSelect";
import { StudentPicker } from "@/components/journal/StudentPicker";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { countDays, formatLongDate, syncDayEntries } from "@/lib/dates";
import { createJournalId } from "@/lib/journal";
import {
  defaultRoster,
  getRosterSnapshot,
  studentsInClass,
  subscribeRoster,
} from "@/lib/roster";
import { listJournals, loadJournal, loadSessionJournal, saveJournal, saveSessionJournal } from "@/lib/storage";
import { TOUR_PRESETS, WEATHER_OPTIONS } from "@/lib/tours";
import type { Journal, Roster } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "student", label: "班別姓名", icon: UserRound },
  { id: "tour", label: "交流團", icon: Globe2 },
  { id: "days", label: "每日日誌", icon: CalendarDays },
  { id: "overall", label: "整體感受", icon: BookOpen },
  { id: "print", label: "印製成書", icon: Printer },
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
    updatedAt: "",
  };
}

export function JournalWorkspace() {
  const searchParams = useSearchParams();
  const bundledRoster = useSyncExternalStore(subscribeRoster, getRosterSnapshot, defaultRoster);
  const [fetchedRoster, setFetchedRoster] = useState<Roster | null>(null);
  const roster = fetchedRoster?.students.length ? fetchedRoster : bundledRoster;
  const [journal, setJournal] = useState<Journal>(emptyJournal);
  const [step, setStep] = useState<StepId>("student");
  const [dayIndex, setDayIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [drafts, setDrafts] = useState<Journal[]>([]);

  useEffect(() => {
    void fetch("/roster.json")
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

      setJournal((prev) => {
        const alreadyStarted = Boolean(prev.classCode || prev.chineseName || prev.tourName);
        if (alreadyStarted) return prev;
        if (session?.classCode || session?.chineseName || session?.tourName) return session;
        return prev;
      });

      if (requestedId) {
        const found = await loadJournal(requestedId);
        if (found && !cancelled) {
          setJournal((prev) => {
            const alreadyStarted = Boolean(prev.classCode || prev.chineseName || prev.tourName);
            if (alreadyStarted && prev.id !== found.id) return prev;
            return found;
          });
          saveSessionJournal(found);
        }
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
      void saveJournal({ ...journal, updatedAt: new Date().toISOString() });
    }, 800);
    return () => window.clearTimeout(handle);
  }, [journal, loaded]);

  const currentDay = journal.dayEntries[dayIndex];

  function patch(partial: Partial<Journal>) {
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
    saveSessionJournal(next);
    setJournal(next);
    setSaving(false);
    toast.success("已儲存於此裝置");
  }

  const stepIndex = STEPS.findIndex((item) => item.id === step);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <nav className="no-print flex gap-1 overflow-x-auto rounded-2xl border border-gold/25 bg-card/80 p-2">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          const active = item.id === step;
          const done = index < stepIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setStep(item.id)}
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
                選擇本校交流團或自行填寫。系統會按日期自動計算天數，並為每一天準備相片與感受欄。
              </p>
            </header>
            <div className="grid gap-3 md:grid-cols-2">
              {TOUR_PRESETS.map((tour) => (
                <button
                  key={tour.id}
                  type="button"
                  onClick={() => {
                    patch({
                      tourId: tour.id,
                      tourName: tour.id === "custom" ? journal.tourName : tour.name,
                      destination: tour.destination || journal.destination,
                    });
                    if (tour.startDate && tour.endDate) {
                      applyDates(tour.startDate, tour.endDate);
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
                    {tour.blurb}
                  </p>
                </button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>交流團名稱</Label>
                <Input
                  value={journal.tourName}
                  onChange={(e) => patch({ tourName: e.target.value })}
                  placeholder="例如：馬來西亞及新加坡英語學習文化交流團"
                />
              </div>
              <div className="space-y-2">
                <Label>目的地</Label>
                <Input
                  value={journal.destination}
                  onChange={(e) => patch({ destination: e.target.value })}
                  placeholder="國家 / 城市"
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
                />
              </div>
              <div className="space-y-2">
                <Label>結束日期</Label>
                <Input
                  type="date"
                  value={journal.endDate}
                  onChange={(e) => applyDates(journal.startDate || e.target.value, e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>出發前期望</Label>
                <Textarea
                  rows={5}
                  value={journal.expectation}
                  onChange={(e) => patch({ expectation: e.target.value })}
                  placeholder="這次交流，你最想看見、學會或挑戰甚麼？"
                />
              </div>
            </div>
          </div>
        )}

        {step === "days" && (
          <div className="space-y-6">
            <header>
              <h1 className="font-[family-name:var(--font-serif)] text-3xl text-navy">每日日誌</h1>
              <p className="mt-2 text-sm text-navy/65">
                每天請上載三張相片，並寫下行程與感受。可隨時回來補寫。
              </p>
            </header>
            {journal.dayEntries.length === 0 ? (
              <p className="rounded-2xl bg-[#f3ead6] p-4 text-sm text-navy/70">
                請先在「交流團」一頁填寫開始與結束日期，系統會按天數產生每日頁面。
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {journal.dayEntries.map((day, index) => {
                    const ready =
                      day.photos.every(Boolean) && day.feeling.trim().length > 0;
                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => setDayIndex(index)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs",
                          index === dayIndex
                            ? "border-navy bg-navy text-cream"
                            : ready
                              ? "border-gold bg-gold/15 text-navy"
                              : "border-gold/30 bg-white text-navy/70"
                        )}
                      >
                        第 {day.dayNumber} 天
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
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>當日主題 / 地點</Label>
                        <Input
                          value={currentDay.title}
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
                          onChange={(dataUrl) => {
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
                      <Label>今日行程</Label>
                      <Textarea
                        rows={4}
                        value={currentDay.itinerary}
                        onChange={(e) => {
                          const next = [...journal.dayEntries];
                          next[dayIndex] = { ...currentDay, itinerary: e.target.value };
                          patch({ dayEntries: next });
                        }}
                        placeholder="今天去了哪些地方？做了甚麼學習活動？"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>今日感受與反思</Label>
                      <Textarea
                        rows={7}
                        value={currentDay.feeling}
                        onChange={(e) => {
                          const next = [...journal.dayEntries];
                          next[dayIndex] = { ...currentDay, feeling: e.target.value };
                          patch({ dayEntries: next });
                        }}
                        placeholder="最觸動你的片刻是甚麼？你有甚麼新的看見或疑問？"
                      />
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
                回望整段旅程：感受、知識、能力與最想記住的人和事。
              </p>
            </header>
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
                <Textarea
                  rows={5}
                  value={journal[field.key]}
                  onChange={(e) => patch({ [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
        )}

        {step === "print" && (
          <div className="space-y-5">
            <header className="no-print">
              <h1 className="font-[family-name:var(--font-serif)] text-3xl text-navy">預覽並印製成書</h1>
              <p className="mt-2 text-sm leading-6 text-navy/65">
                以 A4 直向列印或「另存為 PDF」。建議開啟「背景圖形」，雙面列印後即可交校務處裝訂成冊。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/print?id=${journal.id}`}
                  target="_blank"
                  className={buttonVariants({ className: "rounded-full bg-navy" })}
                >
                  開啟印書頁並下載
                </Link>
                <Button variant="outline" className="rounded-full" onClick={() => void persistNow()}>
                  <Save className="size-4" />
                  {saving ? "儲存中…" : "立即儲存"}
                </Button>
              </div>
            </header>
            <div className="origin-top scale-[0.72] md:scale-[0.86]" style={{ transformOrigin: "top center" }}>
              <BookPages journal={journal} />
            </div>
          </div>
        )}

        <div className="no-print mt-8 flex items-center justify-between border-t border-gold/20 pt-5">
          <Button
            variant="outline"
            className="rounded-full"
            disabled={stepIndex === 0}
            onClick={() => setStep(STEPS[stepIndex - 1].id)}
          >
            <ChevronLeft className="size-4" />
            上一頁
          </Button>
          <Button
            className="rounded-full bg-navy"
            disabled={stepIndex === STEPS.length - 1}
            onClick={() => setStep(STEPS[stepIndex + 1].id)}
          >
            下一頁
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
