import { writeFileSync } from "node:fs";
import * as XLSX from "xlsx";

const wb = XLSX.utils.book_new();

const master = [
  ["欄位範本（非真實學生名單）", "", "", ""],
  ["班別", "學號", "中文姓名", "英文姓名"],
  ["1A", 1, "陳大文", "CHAN TAI MAN"],
  ["1A", 2, "李小美", "LEE SIU MEI"],
  ["2A", 1, "黃子軒", "WONG TSZ HIN"],
];
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(master), "全校");

const classSheet = [
  ["1A"],
  ["CLASS\n班別", "NO.\n班號", "NAME\n姓  名", "", "SEX\n性別"],
  ["1A", 1, "CHAN TAI MAN", "陳大文", "M"],
  ["1A", 2, "LEE SIU MEI", "李小美", "F"],
];
const ws = XLSX.utils.aoa_to_sheet(classSheet);
ws["!merges"] = [
  { s: { c: 0, r: 0 }, e: { c: 4, r: 0 } },
  { s: { c: 2, r: 1 }, e: { c: 3, r: 1 } },
];
XLSX.utils.book_append_sheet(wb, ws, "1A");

const out = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
writeFileSync(new URL("../public/templates/mkpc-class-list-sample.xlsx", import.meta.url), out);
console.log("Wrote column template Excel (sample names only)");
