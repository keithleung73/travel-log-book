import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "travel-log-book-source.zip");
  const data = await readFile(filePath);

  return new Response(data, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="travel-log-book-source.zip"',
      "Content-Length": String(data.byteLength),
      "Cache-Control": "no-store",
    },
  });
}
