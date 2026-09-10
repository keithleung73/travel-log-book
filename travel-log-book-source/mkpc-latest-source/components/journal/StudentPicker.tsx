"use client";

import { useEffect, useMemo, useState } from "react";
import { MobileSelect } from "@/components/journal/MobileSelect";
import { CLASS_CODES, classGroups, formLabel, studentsInClass } from "@/lib/roster";
import type { Roster, Student } from "@/lib/types";

type StudentPickerProps = {
  roster: Roster;
  classCode: string;
  studentId: string;
  chineseName: string;
  englishName: string;
  onClassChange: (classCode: string) => void;
  onStudentChange: (student: Student | null, typedName?: string) => void;
};

export function StudentPicker({
  roster,
  classCode,
  studentId,
  chineseName,
  englishName,
  onClassChange,
  onStudentChange,
}: StudentPickerProps) {
  const [query, setQuery] = useState("");
  const students = classCode ? studentsInClass(roster, classCode) : [];

  useEffect(() => {
    setQuery("");
  }, [classCode]);

  useEffect(() => {
    setQuery("");
  }, [classCode]);
  const selected = students.find((student) => student.id === studentId) ?? null;
  const groups = useMemo(() => classGroups(CLASS_CODES), []);

  const nameOptions = students.map((student) => ({
    value: student.id,
    label: `${String(student.classNo).padStart(2, "0")} ${student.chineseName || student.englishName}  ${student.englishName}`,
  }));

  const visibleStudents = query.trim()
    ? students.filter((student) => {
        const q = query.trim().toLowerCase();
        return (
          student.chineseName.includes(query.trim()) ||
          student.englishName.toLowerCase().includes(q) ||
          String(student.classNo).padStart(2, "0").includes(q)
        );
      })
    : students;

  function pickStudentById(id: string) {
    if (!id) {
      onStudentChange(null, "");
      return;
    }
    const student = students.find((item) => item.id === id) ?? null;
    onStudentChange(student);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-navy/70">
        已載入 {roster.students.length} 人。先揀班別，再在第二個選單揀自己的姓名。
      </p>

      <div className="space-y-3">
        <p className="text-sm font-medium">1. 班別</p>
        <MobileSelect
          id="class-select"
          name="classCode"
          value={classCode}
          placeholder="請選擇班別"
          options={CLASS_CODES.map((code) => ({
            value: code,
            label: `${formLabel(code)} ${code}`,
          }))}
          onValueCommit={onClassChange}
        />
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.form}>
              <p className="mb-1 text-xs text-navy/50">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.codes.map((code) => {
                  const active = classCode === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      className={`min-h-11 min-w-14 rounded-full border px-3 text-sm font-semibold ${
                        active ? "border-navy bg-navy text-cream" : "border-navy/30 bg-white text-navy"
                      }`}
                      onClick={() => onClassChange(code)}
                    >
                      {code}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">
          2. 姓名
          {classCode ? `（${formLabel(classCode)} ${students.length} 人）` : "（請先揀班別）"}
        </p>

        {classCode ? (
          <MobileSelect
            key={classCode}
            id="name-select"
            name="studentId"
            value={studentId}
            placeholder={`請選擇姓名（${students.length} 人）`}
            options={nameOptions}
            onValueCommit={pickStudentById}
          />
        ) : (
          <select
            id="name-select"
            name="studentId"
            disabled
            className="h-14 w-full rounded-xl border-2 border-navy/20 bg-[#f3ead6] px-3 text-lg text-navy/40"
            style={{ fontSize: 16 }}
          >
            <option>請先選擇班別</option>
          </select>
        )}

        {classCode && students.length === 0 && (
          <p className="text-sm text-red-700">此班名單未能載入，請在下面自行輸入姓名。</p>
        )}

        {(selected || chineseName || englishName) && (
          <p className="rounded-2xl bg-navy px-4 py-4 text-base text-cream">
            已選擇：{classCode ? `${formLabel(classCode)} ` : ""}
            {chineseName || englishName}
            {chineseName && englishName ? `（${englishName}）` : ""}
          </p>
        )}

        {students.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="name-search">
              搜尋姓名後點選，或直接在上面第二個選單揀
            </label>
            <input
              id="name-search"
              className="h-12 w-full rounded-xl border-2 border-navy/30 bg-white px-3 text-base text-navy"
              style={{ fontSize: 16 }}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="輸入中文姓名、英文名或班號"
            />
            <div className="divide-y divide-gold/30 overflow-hidden rounded-2xl border-2 border-navy/20 bg-white">
              {visibleStudents.length === 0 ? (
                <p className="px-4 py-4 text-sm text-navy/60">沒有符合「{query}」的同學，請改用下面自行輸入。</p>
              ) : (
                visibleStudents.map((student) => {
                  const isSelected = studentId === student.id;
                  return (
                    <label
                      key={student.id}
                      className={`flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 py-3 ${
                        isSelected ? "bg-navy text-cream" : "bg-white text-navy"
                      }`}
                    >
                      <input
                        type="radio"
                        name="student-radio"
                        value={student.id}
                        checked={isSelected}
                        onChange={() => onStudentChange(student)}
                        className="size-5 shrink-0 accent-[#c4a35a]"
                      />
                      <span className="flex-1 text-left text-base">
                        {String(student.classNo).padStart(2, "0")}　
                        {student.chineseName || student.englishName}
                      </span>
                      <span className={`text-xs ${isSelected ? "text-cream/70" : "text-navy/50"}`}>
                        {student.englishName}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="name-input">
          名單沒有自己的名字？請自行輸入
        </label>
        <input
          id="name-input"
          name="chineseName"
          className="h-14 w-full rounded-xl border-2 border-navy/40 bg-white px-3 text-lg text-navy"
          style={{ fontSize: 16 }}
          value={chineseName}
          onChange={(event) => onStudentChange(null, event.target.value)}
          placeholder="例如：陳俊言"
        />
      </div>
    </div>
  );
}
