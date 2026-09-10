import type { Roster } from "@/lib/types";
import { parseRosterFromSheets } from "@/lib/parse-roster";

export { looksLikeClass, parseRosterFromSheets } from "@/lib/parse-roster";

export async function parseRosterWorkbook(file: File): Promise<Roster> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheets = workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const rows = sheet
      ? XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
          header: 1,
          defval: "",
          raw: false,
        })
      : [];
    return { name, rows };
  });
  return parseRosterFromSheets(sheets, file.name);
}
