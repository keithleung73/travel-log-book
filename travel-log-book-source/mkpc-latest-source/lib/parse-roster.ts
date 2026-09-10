import type { Roster, Student } from "./types";

const FORM_MAP: Record<string, string> = {
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  一: "1",
  二: "2",
  三: "3",
  四: "4",
  五: "5",
  六: "6",
};

const LETTER_MAP: Record<string, string> = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  甲: "A",
  乙: "B",
  丙: "C",
  丁: "D",
  戊: "E",
};

const HEADER_SKIP = new Set([
  "姓名",
  "中文姓名",
  "英文姓名",
  "學生姓名",
  "班別",
  "班號",
  "學號",
  "性別",
  "name",
  "class",
  "sex",
]);

export type SheetRows = {
  name: string;
  rows: unknown[][];
};

export function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .replace(/[\r\n]+/g, "")
    .replace(/\s+/g, "")
    .replace(/[()（）]/g, "")
    .toLowerCase();
}

/** Map 1A / 中一A / 中一甲 / *5E to a canonical class code. */
export function looksLikeClass(value: string): string | null {
  const compact = value.replace(/\s+/g, "").toUpperCase().replace(/^\*+/, "");
  const match = compact.match(/^(?:中)?([1-6一二三四五六])([A-E甲乙丙丁戊])班?$/);
  if (!match) return null;
  const form = FORM_MAP[match[1]];
  const letter = LETTER_MAP[match[2]];
  if (!form || !letter) return null;
  return `${form}${letter}`;
}

function pickColumn(headers: string[], candidates: string[]): number {
  for (const candidate of candidates) {
    const index = headers.findIndex((h) => h.includes(candidate));
    if (index >= 0) return index;
  }
  return -1;
}

export function isHeaderRow(cells: unknown[]): boolean {
  const joined = cells.map(normalizeHeader).join("|");
  const tokens = ["姓名", "name", "學號", "班號", "班別", "class", "sex", "性別"];
  const hits = tokens.filter((token) => joined.includes(token)).length;
  return hits >= 2;
}

function isNoteRow(cells: string[]): boolean {
  const joined = cells.join(" ");
  return /DSE|IAL|預備班|人名紙|注意|備註|範本|非真實/.test(joined) && !/^\d{1,2}$/.test(cells[1] ?? "");
}

function resolveColumns(headers: string[]): {
  classCol: number;
  noCol: number;
  zhCol: number;
  enCol: number;
} {
  let classCol = pickColumn(headers, ["班別", "classname", "class"]);
  if (
    classCol >= 0 &&
    /班號|classno|classnumber/.test(headers[classCol] ?? "") &&
    !headers[classCol].includes("班別")
  ) {
    classCol = -1;
  }
  const noCol = pickColumn(headers, ["學號", "班號", "編號", "classno", "no.", "number"]);
  let zhCol = pickColumn(headers, ["中文姓名", "中文名", "學生姓名"]);
  let enCol = pickColumn(headers, ["英文姓名", "英文名", "englishname", "english"]);
  const nameCol = pickColumn(headers, ["姓名", "name"]);

  if (zhCol < 0 && enCol < 0 && nameCol >= 0) {
    const nextHeader = headers[nameCol + 1] ?? "";
    if (!nextHeader) {
      enCol = nameCol;
      zhCol = nameCol + 1;
    } else {
      zhCol = nameCol;
    }
  }

  return { classCol, noCol, zhCol, enCol };
}

function isLatinName(value: string): boolean {
  return /^[A-Za-z][A-Za-z\s.,'’\-]*[A-Za-z.]$/.test(value) && value.replace(/\s/g, "").length >= 3;
}

function isChineseName(value: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(value) && value.length <= 12 && !looksLikeClass(value);
}

function isSexToken(value: string): boolean {
  return /^(M|F|男|女|MALE|FEMALE)$/i.test(value);
}

function parseClassNo(value: string): number | null {
  if (!/^\d{1,2}$/.test(value)) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 60) return null;
  return parsed;
}

function sortClassCodes(codes: string[]): string[] {
  return [...codes].sort((a, b) => {
    const fa = Number(a.replace(/\D/g, "")) || 0;
    const fb = Number(b.replace(/\D/g, "")) || 0;
    if (fa !== fb) return fa - fb;
    return a.localeCompare(b);
  });
}

export function parseRosterFromSheets(
  sheets: SheetRows[],
  fileName: string,
  importedAt = new Date().toISOString()
): Roster {
  const students: Student[] = [];
  const classes = new Set<string>();
  const seen = new Set<string>();
  const usedIds = new Set<string>();

  for (const sheet of sheets) {
    const rows = sheet.rows;
    if (!rows.length) continue;

    const sheetClass = looksLikeClass(sheet.name);
    let currentClass = sheetClass;
    let columns = { classCol: 0, noCol: 1, zhCol: 3, enCol: 2 };
    const nextNoByClass = new Map<string, number>();

    for (const row of rows) {
      const cells = (row ?? []).map((cell) => String(cell ?? "").trim());
      if (cells.every((cell) => !cell)) continue;
      if (isHeaderRow(cells)) {
        columns = resolveColumns(cells.map(normalizeHeader));
        continue;
      }
      if (isNoteRow(cells)) continue;

      const nonempty = cells.filter(Boolean);
      const titleClass = nonempty.length === 1 ? looksLikeClass(nonempty[0]) : null;
      if (titleClass) {
        currentClass = titleClass;
        continue;
      }

      const fromRow =
        (columns.classCol >= 0 ? looksLikeClass(cells[columns.classCol] ?? "") : null) ||
        cells.map((cell) => looksLikeClass(cell)).find((code): code is string => Boolean(code)) ||
        null;
      const classCode = fromRow || currentClass;
      if (!classCode) continue;

      const noRaw = columns.noCol >= 0 ? cells[columns.noCol] : "";
      const parsedNo = parseClassNo(noRaw);

      let chineseName = columns.zhCol >= 0 ? cells[columns.zhCol] ?? "" : "";
      let englishName = columns.enCol >= 0 ? cells[columns.enCol] ?? "" : "";

      if (isSexToken(chineseName) || HEADER_SKIP.has(normalizeHeader(chineseName))) chineseName = "";
      if (isSexToken(englishName) || HEADER_SKIP.has(normalizeHeader(englishName))) englishName = "";

      if (!isChineseName(chineseName)) {
        chineseName = cells.find((cell) => isChineseName(cell)) || "";
      }
      if (!isLatinName(englishName)) {
        englishName = cells.find((cell) => isLatinName(cell) && !looksLikeClass(cell) && !isSexToken(cell)) || "";
      }

      if (!chineseName && englishName) chineseName = englishName;
      if (!chineseName) continue;
      if (HEADER_SKIP.has(normalizeHeader(chineseName))) continue;
      if (chineseName.length > 40) continue;
      if (/預備班|人名紙|班別|性別|範本|非真實/.test(chineseName)) continue;

      const classNo =
        parsedNo ??
        nextNoByClass.get(classCode) ??
        1;

      const key = `${classCode}:${classNo}:${chineseName}:${englishName}`;
      if (seen.has(key)) continue;
      seen.add(key);

      let id = `MK${classCode}${String(classNo).padStart(2, "0")}`;
      if (usedIds.has(id)) id = `${id}-${usedIds.size}`;
      usedIds.add(id);

      students.push({
        id,
        classCode,
        classNo,
        chineseName,
        englishName: englishName.toUpperCase(),
      });
      classes.add(classCode);
      nextNoByClass.set(classCode, classNo + 1);
      currentClass = classCode;
    }
  }

  if (students.length === 0) {
    throw new Error("未能在試算表中讀取學生姓名。請確認檔案為各班人名紙，並包含班別與姓名欄。");
  }

  const sortedClasses = sortClassCodes(Array.from(classes));
  students.sort((a, b) => {
    const classCmp = sortedClasses.indexOf(a.classCode) - sortedClasses.indexOf(b.classCode);
    if (classCmp !== 0) return classCmp;
    return a.classNo - b.classNo || a.chineseName.localeCompare(b.chineseName, "zh-HK");
  });

  return {
    year: "2026-2027",
    source: "imported",
    fileName,
    importedAt,
    note: `已匯入 ${fileName}`,
    classes: sortedClasses,
    students,
  };
}
