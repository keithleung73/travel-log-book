import { SiteHeader } from "@/components/journal/SiteHeader";
import { StaffGate } from "@/components/journal/StaffGate";
import { buttonVariants } from "@/components/ui/button";

export default function SyncGitHubPage() {
  return (
    <StaffGate>
    <div className="min-h-screen">
      <SiteHeader variant="admin" />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-[11px] tracking-[0.3em] text-gold">AUTO SYNC</p>
        <h1 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-navy">
          每次改完自動更新網頁
        </h1>
        <p className="mt-3 text-sm leading-7 text-navy/70">
          GitHub 已經設定好：只要程式推到 <code>main</code>，Actions 就會自動發佈到
        </p>
        <p className="mt-2 rounded-2xl bg-navy px-4 py-3 text-sm text-cream">
          https://keithleung73.github.io/travel-log-book/
        </p>
        <p className="mt-4 text-sm leading-7 text-navy/70">
          而家仲要人手上傳，係因為呢次 Agent 開咗一個未連 GitHub 的專案，所以推唔到你的倉庫。改用下面方法之後，就唔使再傳 zip。
        </p>

        <h2 className="mt-10 font-[family-name:var(--font-serif)] text-2xl text-navy">
          推薦：用 Cursor 直接開 GitHub 倉庫
        </h2>
        <ol className="mt-4 list-decimal space-y-4 pl-5 text-sm leading-7 text-navy/80">
          <li>
            用瀏覽器開啟倉庫：
            <a
              className="ml-1 underline"
              href="https://github.com/keithleung73/travel-log-book"
              target="_blank"
              rel="noreferrer"
            >
              github.com/keithleung73/travel-log-book
            </a>
          </li>
          <li>
            喺 Cursor 選 <strong>Open project</strong> / Clone，貼上上面網址。登入 GitHub（Cursor
            Settings → Account，授權 GitHub）。
          </li>
          <li>
            之後每次叫 Agent 改封面、校規、名單等，並說：「commit 並 push 去 GitHub
            main」。
          </li>
          <li>
            Agent 一 push，GitHub Actions 會自動跑
            <strong> Deploy GitHub Pages</strong>。約 1–3
            分鐘轉綠，網站就更新。你只需 Ctrl+Shift+R 重新整理。
          </li>
        </ol>
        <p className="mt-4 text-sm leading-7 text-navy/70">
          用 Cursor Cloud Agent 時，都要由呢個 GitHub 倉庫啟動（唔好再開「New
          Project」），Agent 先有權限自動 push。
        </p>

        <h2 className="mt-10 font-[family-name:var(--font-serif)] text-2xl text-navy">
          後備：仍然要人手上傳
        </h2>
        <p className="mt-3 text-sm leading-7 text-navy/70">
          若今次仍未連到 GitHub，可先下載壓縮包上傳一次。連好倉庫之後就唔使再用呢步。
        </p>
        <a
          href="/mkpc-latest-source.zip"
          className={buttonVariants({
            className: "mt-4 rounded-full border border-navy/20 bg-white px-6 text-navy",
          })}
        >
          下載最新程式壓縮包
        </a>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-7 text-navy/80">
          <li>
            上傳 zip 到
            <a
              className="ml-1 underline"
              href="https://github.com/keithleung73/travel-log-book/upload/main/travel-log-book-source"
              target="_blank"
              rel="noreferrer"
            >
              travel-log-book-source
            </a>
          </li>
          <li>
            等
            <a
              className="ml-1 underline"
              href="https://github.com/keithleung73/travel-log-book/actions"
              target="_blank"
              rel="noreferrer"
            >
              Actions
            </a>
            轉綠，再開公開網址。
          </li>
        </ol>
      </main>
    </div>
    </StaffGate>
  );
}
