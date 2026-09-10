import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source =
  process.argv[2] ||
  "/home/ubuntu/.cursor/projects/workspace/uploads/_2026-2027_______2026.09.02__ec12.xlsx";

const FORM = { 一: "1", 二: "2", 三: "3", 四: "4", 五: "5", 六: "6" };
const LETTER = { 甲: "A", 乙: "B", 丙: "C", 丁: "D", 戊: "E" };

function classCode(value) {
  const compact = String(value ?? "")
    .replace(/\s+/g, "")
    .toUpperCase()
    .replace(/^\*+/, "");
  const match = compact.match(/^(?:中)?([1-6一二三四五六])([A-E甲乙丙丁戊])班?$/);
  if (!match) return null;
  const form = FORM[match[1]] || match[1];
  const letter = LETTER[match[2]] || match[2];
  return `${form}${letter}`;
}

function isHeader(cells) {
  const joined = cells.join("").toLowerCase();
  return joined.includes("班別") && (joined.includes("name") || joined.includes("姓名"));
}

function isChinese(value) {
  return /[\u4e00-\u9fff]/.test(value) && value.length <= 12 && !classCode(value);
}

function isEnglish(value) {
  return /^[A-Za-z][A-Za-z\s.',\-]*[A-Za-z.]$/.test(value) && value.replace(/\s/g, "").length >= 3;
}

const workbook = XLSX.read(readFileSync(source));
const students = [];
const seen = new Set();
const usedIds = new Set();

for (const sheetName of workbook.SheetNames) {
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: "",
    raw: false,
  });
  let currentClass = classCode(sheetName.replace(/^S/, ""));
  for (const row of rows) {
    const cells = (row ?? []).map((cell) => String(cell ?? "").trim());
    if (!cells.some(Boolean)) continue;
    if (isHeader(cells)) continue;

    const title = cells.filter(Boolean);
    if (title.length === 1 && classCode(title[0])) {
      currentClass = classCode(title[0]);
      continue;
    }
    if (/DSE|IAL|預備班/.test(cells.join(" ")) && !/^\d{1,2}$/.test(cells[1] || "")) continue;

    const code = classCode(cells[0]) || currentClass;
    if (!code) continue;
    currentClass = code;

    const classNo = /^\d{1,2}$/.test(cells[1] || "") ? Number(cells[1]) : students.filter((s) => s.classCode === code).length + 1;
    const englishName = isEnglish(cells[2]) ? cells[2].toUpperCase() : cells.find(isEnglish)?.toUpperCase() || "";
    const chineseName = isChinese(cells[3]) ? cells[3] : cells.find(isChinese) || englishName;
    if (!chineseName) continue;

    const key = `${code}:${classNo}:${chineseName}:${englishName}`;
    if (seen.has(key)) continue;
    seen.add(key);

    let id = `MK${code}${String(classNo).padStart(2, "0")}`;
    if (usedIds.has(id)) id = `${id}-${usedIds.size}`;
    usedIds.add(id);

    students.push({ id, classCode: code, classNo, chineseName, englishName });
  }
}

students.sort((a, b) => a.classCode.localeCompare(b.classCode) || a.classNo - b.classNo);
const classes = [...new Set(students.map((s) => s.classCode))].sort(
  (a, b) => Number(a[0]) - Number(b[0]) || a.localeCompare(b)
);

const roster = {
  year: "2026-2027",
  source: "imported",
  fileName: "(2026-2027)各班人名紙(2026.09.02).xlsx",
  importedAt: "2026-09-02T00:00:00.000Z",
  note: "2026–2027 各班人名紙（2026.09.02）",
  classes,
  students,
};

writeFileSync(join(root, "data/roster.json"), JSON.stringify(roster, null, 2));
writeFileSync(join(root, "public/roster.json"), JSON.stringify(roster));
copyFileSync(source, join(root, "public/templates/2026-2027-class-list.xlsx"));

const counts = Object.fromEntries(classes.map((c) => [c, students.filter((s) => s.classCode === c).length]));
console.log(JSON.stringify({ total: students.length, classes: classes.length, counts }, null, 2));
