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
          href="/download"
          className={buttonVariants({
            size: "lg",
            className: "mt-8 h-14 rounded-full bg-navy px-8 text-base text-cream",
          })}
        >
          <Download className="size-5" />
          下載 travel-log-book-source.zip
        </a>
        <p className="mt-8 text-sm leading-6 text-navy/65">
          下載後請解壓，再開
          <a
            className="mx-1 underline"
            href="https://github.com/keithleung73/travel-log-book"
            target="_blank"
            rel="noreferrer"
          >
            GitHub 倉庫
          </a>
          ，用 uploading an existing file，把解壓後的檔案拖上去（不要再上傳 zip）。
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-navy/60 underline">
          返回主頁
        </Link>
      </main>
    </div>
  );
}
