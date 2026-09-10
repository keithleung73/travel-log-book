"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookPages } from "@/components/journal/BookPages";
import { loadJournal, loadSessionJournal } from "@/lib/storage";
import type { Journal } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function PrintBook() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [journal, setJournal] = useState<Journal | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const found = id ? await loadJournal(id) : null;
      const session = loadSessionJournal();
      const journalToPrint = found ?? session;
      if (!journalToPrint) {
        setError("找不到日誌。請返回填寫頁再開啟印書功能。");
        return;
      }
      setJournal(journalToPrint);
    })();
  }, [id]);

  if (error) {
    return <p className="px-6 py-16 text-center text-navy/70">{error}</p>;
  }
  if (!journal) {
    return <p className="px-6 py-16 text-center text-navy/70">正在準備印書頁…</p>;
  }

  return (
    <div className="bg-[#e8dcc4] py-6 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4">
        <div>
          <p className="font-[family-name:var(--font-serif)] text-xl text-navy">下載印製成書</p>
          <p className="text-xs text-navy/60">
            列印設定：A4、直向、開啟背景圖形。可選擇「另存為 PDF」交校務處印刷。
          </p>
        </div>
        <Button className="rounded-full bg-navy" onClick={() => window.print()}>
          列印 / 儲存 PDF
        </Button>
      </div>
      <BookPages journal={journal} />
    </div>
  );
}
