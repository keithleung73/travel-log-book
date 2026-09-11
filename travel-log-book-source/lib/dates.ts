import { eachDayOfInterval, format, parseISO } from "date-fns";
import { zhHK } from "date-fns/locale/zh-HK";
import type { DayEntry } from "@/lib/types";

export function countDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }
  return eachDayOfInterval({ start, end }).length;
}

export function dateList(startDate: string, endDate: string): string[] {
  if (!startDate || !endDate) return [];
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return [];
  }
  return eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));
}

export function formatLongDate(iso: string): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "yyyy年M月d日（EEEE）", { locale: zhHK });
  } catch {
    return iso;
  }
}

export function formatRange(start: string, end: string): string {
  if (!start || !end) return "—";
  return `${formatLongDate(start)} 至 ${formatLongDate(end)}`;
}

export function formatShortRange(start?: string, end?: string): string {
  if (!start || !end) return "";
  try {
    const s = parseISO(start);
    const e = parseISO(end);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";
    if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
      return `${format(s, "M月d日", { locale: zhHK })}至${format(e, "d日", { locale: zhHK })}`;
    }
    if (s.getFullYear() === e.getFullYear()) {
      return `${format(s, "M月d日", { locale: zhHK })}至${format(e, "M月d日", { locale: zhHK })}`;
    }
    return `${format(s, "yyyy年M月d日", { locale: zhHK })}至${format(e, "yyyy年M月d日", { locale: zhHK })}`;
  } catch {
    return "";
  }
}

export function emptyDay(dayNumber: number, date: string): DayEntry {
  return {
    dayNumber,
    date,
    title: "",
    weather: "",
    itinerary: "",
    feeling: "",
    photos: [null, null, null],
  };
}

export function syncDayEntries(
  startDate: string,
  endDate: string,
  existing: DayEntry[]
): DayEntry[] {
  return dateList(startDate, endDate).map((date, index) => {
    const found = existing.find((entry) => entry.date === date);
    if (found) {
      return { ...found, dayNumber: index + 1, date };
    }
    return emptyDay(index + 1, date);
  });
}
