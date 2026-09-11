"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookPages } from "@/components/journal/BookPages";
import { loadJournal, loadSubmission } from "@/lib/storage";
import type { Journal } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function PrintBook() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [journal, setJournal] = useState<Journal | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      if (!id) {
        setError("列印只供行政使用。請由行政專區的提交名單開啟。");
        return;
      }
      const found = (await loadJournal(id)) ?? (await loadSubmission(id));
      if (!found) {
        setError("找不到這份已提交日誌。請先在行政專區匯入提交檔。");
        return;
      }
      setJournal(found);
    })();
  }, [id]);

  if (error) {
    return (
      <p className="px-6 py-16 text-center text-navy/70">
        {error}{" "}
        <Link href="/staff/submissions" className="underline">
          返回提交名單
        </Link>
      </p>
    );
  }
  if (!journal) {
    return <p className="px-6 py-16 text-center text-navy/70">正在準備印書頁…</p>;
  }

  return (
    <div className="bg-[#e8dcc4] py-6 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4">
        <div>
          <p className="font-[family-name:var(--font-serif)] text-xl text-navy">行政 · 列印成書</p>
          <p className="text-xs text-navy/60">
            {journal.chineseName} · {journal.classCode} · {journal.tourName || "交流團"}
            。列印設定：A4、直向、開啟背景圖形。
          </p>
          <Link href="/staff/submissions" className="mt-1 inline-block text-xs text-navy/60 underline">
            返回提交名單
          </Link>
        </div>
        <Button className="rounded-full bg-navy" onClick={() => window.print()}>
          列印 / 儲存 PDF
        </Button>
      </div>
      <BookPages journal={journal} />
    </div>
  );
}
