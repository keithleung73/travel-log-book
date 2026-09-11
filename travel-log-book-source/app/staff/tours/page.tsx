"use client";

import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/journal/SiteHeader";
import { StaffGate } from "@/components/journal/StaffGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/journal/NativeSelect";
import {
  addTeacher,
  addTour,
  deleteTeacher,
  deleteTour,
  groupTeachers,
  listTeachers,
  listTours,
  resetTeachersToSchoolList,
  saveTour,
  subscribeTeachers,
  subscribeTours,
  teacherLabel,
  teacherNamesOf,
  tourSummary,
} from "@/lib/tour-catalog";
import { TOUR_CATEGORIES, type TourCategory, type TourPreset } from "@/lib/types";
import { cn } from "@/lib/utils";

function emptyForm(): TourPreset {
  return {
    id: "",
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    blurb: "",
    category: "遊學團",
    teacherIds: [],
  };
}

export default function StaffToursPage() {
  const tours = useSyncExternalStore(subscribeTours, listTours, listTours);
  const teachers = useSyncExternalStore(subscribeTeachers, listTeachers, listTeachers);
  const [form, setForm] = useState<TourPreset>(emptyForm());
  const [teacherName, setTeacherName] = useState("");
  const [teacherQuery, setTeacherQuery] = useState("");
  const editing = Boolean(form.id);

  const upcoming = useMemo(
    () => tours.filter((tour) => tour.id !== "custom"),
    [tours]
  );
  const filteredTeachers = useMemo(() => {
    const query = teacherQuery.trim().toLowerCase();
    if (!query) return teachers;
    return teachers.filter((teacher) => {
      const haystack = `${teacher.name} ${teacher.classCode ?? ""} ${teacherLabel(teacher)}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [teachers, teacherQuery]);
  const teacherGroups = useMemo(() => groupTeachers(filteredTeachers), [filteredTeachers]);
  const extraTeachers = teachers.filter((teacher) => teacher.id.startsWith("tea-"));

  function patchForm(partial: Partial<TourPreset>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function onSave(event: FormEvent) {
    event.preventDefault();
    try {
      if (editing) {
        saveTour({ ...form, blurb: tourSummary(form) });
        toast.success("已更新交流團");
      } else {
        addTour({
          name: form.name,
          destination: form.destination,
          startDate: form.startDate,
          endDate: form.endDate,
          category: form.category,
          teacherIds: form.teacherIds,
          blurb: tourSummary(form),
        });
        toast.success("已加入交流團，學生頁即時可選");
      }
      setForm(emptyForm());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "儲存失敗");
    }
  }

  function onAddTeacher(event: FormEvent) {
    event.preventDefault();
    try {
      const teacher = addTeacher(teacherName);
      setTeacherName("");
      patchForm({ teacherIds: Array.from(new Set([...(form.teacherIds ?? []), teacher.id])) });
      toast.success(`已加入帶隊老師：${teacher.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "新增失敗");
    }
  }

  return (
    <StaffGate>
      <div className="min-h-screen">
        <SiteHeader variant="admin" />
        <main className="mx-auto max-w-4xl px-4 py-10">
          <p className="text-[11px] tracking-[0.3em] text-gold">ADMIN · TOURS</p>
          <h1 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-navy">交流團與帶隊老師</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-navy/70">
            隨時加入即將出發的交流團，並預先選擇帶隊老師。學生填日誌時會按「遊學團／參加比賽／學科交流／展覽」分類顯示。
          </p>

          <form onSubmit={onAddTeacher} className="mt-8 rounded-3xl border border-gold/25 bg-card p-5">
            <p className="font-medium text-navy">帶隊老師名單</p>
            <p className="mt-2 text-sm leading-6 text-navy/65">
              已載入 G.O.(007-26-27) 教職員文件傳閱（修訂版 31-8-2026）老師名單，共 {teachers.length}{" "}
              位，可直接在下方交流團表單勾選。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Input
                value={teacherName}
                onChange={(event) => setTeacherName(event.target.value)}
                placeholder="若名單沒有，可加其他老師"
                className="max-w-xs"
              />
              <Button type="submit" className="rounded-full bg-navy">
                加入老師
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  if (!window.confirm("還原為學校傳閱名單？自行加入的老師會被清除。")) return;
                  resetTeachersToSchoolList();
                  const schoolIds = new Set(
                    teachers.filter((item) => item.id.startsWith("go007-")).map((item) => item.id)
                  );
                  patchForm({
                    teacherIds: (form.teacherIds ?? []).filter((id) => schoolIds.has(id)),
                  });
                  toast.success("已還原學校老師名單");
                }}
              >
                還原傳閱名單
              </Button>
            </div>
            {extraTeachers.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {extraTeachers.map((teacher) => (
                  <span
                    key={teacher.id}
                    className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white px-3 py-1 text-sm text-navy"
                  >
                    {teacher.name}
                    <button
                      type="button"
                      className="text-[#8a1f1f]"
                      onClick={() => {
                        if (!window.confirm(`刪除 ${teacher.name}？已選此老師的交流團會一併移除。`)) return;
                        deleteTeacher(teacher.id);
                        patchForm({
                          teacherIds: (form.teacherIds ?? []).filter((id) => id !== teacher.id),
                        });
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </form>

          <form onSubmit={onSave} className="mt-6 space-y-4 rounded-3xl border border-gold/25 bg-card p-5">
            <p className="font-medium text-navy">{editing ? "修改交流團" : "加入即將出發交流團"}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="tour-name">交流團名稱</Label>
                <Input
                  id="tour-name"
                  value={form.name}
                  onChange={(event) => patchForm({ name: event.target.value })}
                  placeholder="例如：深圳銀樂隊少青團"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tour-cat">類別</Label>
                <NativeSelect
                  id="tour-cat"
                  value={form.category || "遊學團"}
                  onChange={(event) => patchForm({ category: event.target.value as TourCategory })}
                >
                  {TOUR_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-1">
                <Label htmlFor="tour-dest">目的地</Label>
                <Input
                  id="tour-dest"
                  value={form.destination}
                  onChange={(event) => patchForm({ destination: event.target.value })}
                  placeholder="城市 / 國家"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tour-start">開始日期</Label>
                <Input
                  id="tour-start"
                  type="date"
                  value={form.startDate || ""}
                  onChange={(event) => patchForm({ startDate: event.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tour-end">結束日期</Label>
                <Input
                  id="tour-end"
                  type="date"
                  value={form.endDate || ""}
                  onChange={(event) => patchForm({ endDate: event.target.value })}
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm text-navy/70">預先選擇帶隊老師（可多選）</p>
              <Input
                value={teacherQuery}
                onChange={(event) => setTeacherQuery(event.target.value)}
                placeholder="搜尋老師姓名或班別，例如：1A、黃轉鳳、KAUR"
                className="mb-3 max-w-md"
              />
              {form.teacherIds && form.teacherIds.length > 0 && (
                <p className="mb-3 text-sm text-navy/70">
                  已選 {form.teacherIds.length} 位：
                  {teacherNamesOf({ ...form, teacherIds: form.teacherIds }, teachers) || "—"}
                </p>
              )}
              <div className="max-h-[28rem] space-y-4 overflow-y-auto rounded-2xl border border-gold/20 bg-white p-3">
                {teacherGroups.map((group) => (
                  <div key={group.key}>
                    <p className="mb-2 text-[11px] tracking-[0.2em] text-gold">{group.heading}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.teachers.map((teacher) => {
                        const selected = (form.teacherIds ?? []).includes(teacher.id);
                        return (
                          <button
                            key={teacher.id}
                            type="button"
                            onClick={() => {
                              const current = form.teacherIds ?? [];
                              patchForm({
                                teacherIds: selected
                                  ? current.filter((id) => id !== teacher.id)
                                  : [...current, teacher.id],
                              });
                            }}
                            className={cn(
                              "rounded-full px-3 py-1.5 text-sm",
                              selected ? "bg-navy text-cream" : "bg-white text-navy/70 ring-1 ring-gold/30"
                            )}
                          >
                            {teacherLabel(teacher)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {filteredTeachers.length === 0 && (
                  <p className="text-sm text-navy/50">沒有符合「{teacherQuery}」的老師。</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" className="rounded-full bg-navy">
                {editing ? "儲存修改" : "加入交流團"}
              </Button>
              {editing && (
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setForm(emptyForm())}>
                  取消
                </Button>
              )}
            </div>
          </form>

          <div className="mt-8 space-y-3">
            {upcoming.map((tour) => (
              <article key={tour.id} className="rounded-2xl border border-gold/25 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] tracking-[0.2em] text-gold">{tour.category || "未分類"}</p>
                    <h2 className="font-[family-name:var(--font-serif)] text-xl text-navy">{tour.name}</h2>
                    <p className="mt-1 text-sm text-navy/60">{tourSummary(tour)}</p>
                    <p className="mt-1 text-sm text-navy/70">
                      帶隊老師：{teacherNamesOf(tour, teachers) || "尚未選擇"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setForm({ ...tour, teacherIds: tour.teacherIds ?? [] })}
                    >
                      修改
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full text-[#8a1f1f]"
                      onClick={() => {
                        if (!window.confirm(`刪除「${tour.name}」？學生頁將不再顯示此團。`)) return;
                        try {
                          deleteTour(tour.id);
                          if (form.id === tour.id) setForm(emptyForm());
                          toast.message("已刪除");
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "刪除失敗");
                        }
                      }}
                    >
                      刪除
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </StaffGate>
  );
}
