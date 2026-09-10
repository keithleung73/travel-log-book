import Link from "next/link";
import { Download } from "lucide-react";
import { SiteHeader } from "@/components/journal/SiteHeader";
import { buttonVariants } from "@/components/ui/button";

export default function GetSourcePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl text-navy">
          下載程式壓縮包
        </h1>
        <p className="mt-3 text-sm leading-6 text-navy/70">
          撳下面按鈕，檔案會儲去你電腦的 Downloads 資料夾，檔名是
          travel-log-book-source.zip（約 415 KB）。
        </p>
        <a
          href="https://github.com/keithleung73/travel-log-book/raw/main/travel-log-book-source.zip"
          className={buttonVariants({
            size: "lg",
            className: "mt-8 h-14 rounded-full bg-navy px-8 text-base text-cream",
          })}
        >
          <Download className="size-5" />
          下載 travel-log-book-source.zip
        </a>
        <p className="mt-8 text-sm leading-6 text-navy/65">
          原始碼亦在
          <a
            className="mx-1 underline"
            href="https://github.com/keithleung73/travel-log-book"
            target="_blank"
            rel="noreferrer"
          >
            GitHub 倉庫
          </a>
          。網上日誌網址：
          <a
            className="mx-1 underline"
            href="https://keithleung73.github.io/travel-log-book/"
            target="_blank"
            rel="noreferrer"
          >
            keithleung73.github.io/travel-log-book
          </a>
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-navy/60 underline">
          返回主頁
        </Link>
      </main>
    </div>
  );
}
