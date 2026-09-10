import { readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import * as XLSX from "xlsx";
import { parseRosterFromSheets } from "../lib/parse-roster.ts";

const input = resolve(process.argv[2] ?? "");
if (!input) {
  console.error("Usage: node --experimental-strip-types scripts/import-roster.ts <xlsx-path>");
  process.exit(1);
}

const fileName = process.argv[3] || basename(input);
const buffer = readFileSync(input);
const workbook = XLSX.read(buffer, { type: "buffer" });
const sheets = workbook.SheetNames.map((name) => {
  const sheet = workbook.Sheets[name];
  const rows = sheet
    ? XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false })
    : [];
  return { name, rows };
});

const roster = parseRosterFromSheets(sheets, fileName, "2026-09-02T00:00:00.000Z");
roster.note = "2026–2027 各班人名紙（2026.09.02）";
roster.generatedAt = "2026-09-09";

const counts = new Map();
for (const student of roster.students) {
  counts.set(student.classCode, (counts.get(student.classCode) ?? 0) + 1);
}

writeFileSync(new URL("../data/roster.json", import.meta.url), `${JSON.stringify(roster, null, 2)}\n`);

console.log(`Wrote ${roster.students.length} students in ${roster.classes.length} classes`);
for (const classCode of roster.classes) {
  console.log(`  ${classCode}\t${counts.get(classCode)}`);
}
