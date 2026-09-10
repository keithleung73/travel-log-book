import Link from "next/link";
import { SiteHeader } from "@/components/journal/SiteHeader";
import { buttonVariants } from "@/components/ui/button";

const WORKFLOW = `name: Deploy GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Locate app
        id: loc
        run: |
          if [ -f travel-log-book-source/package.json ]; then
            echo "dir=travel-log-book-source" >> "$GITHUB_OUTPUT"
          else
            echo "dir=." >> "$GITHUB_OUTPUT"
          fi
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: \${{ steps.loc.outputs.dir }}/package-lock.json
      - name: Install
        working-directory: \${{ steps.loc.outputs.dir }}
        run: npm ci
      - name: Build static site
        working-directory: \${{ steps.loc.outputs.dir }}
        env:
          NEXT_PUBLIC_BASE_PATH: /travel-log-book
        run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: \${{ steps.loc.outputs.dir }}/out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
`;

export default function GitHubPagesGuidePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-[11px] tracking-[0.3em] text-gold">GITHUB PAGES</p>
        <h1 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-navy">
          把日誌變成公開網頁
        </h1>
        <p className="mt-3 text-sm leading-7 text-navy/70">
          完成後，學生用呢條網址就可以填日誌，唔使裝程式：
        </p>
        <p className="mt-2 rounded-2xl bg-navy px-4 py-3 text-sm text-cream">
          https://keithleung73.github.io/travel-log-book/
        </p>

        <ol className="mt-10 list-decimal space-y-8 pl-5 text-sm leading-7 text-navy/80">
          <li>
            <p className="font-semibold text-navy">開啟 GitHub Pages</p>
            <p>
              去{" "}
              <a
                className="underline"
                href="https://github.com/keithleung73/travel-log-book/settings/pages"
                target="_blank"
                rel="noreferrer"
              >
                Settings → Pages
              </a>
              。Build and deployment → Source 揀 <strong>GitHub Actions</strong>，然後 Save。
            </p>
          </li>
          <li>
            <p className="font-semibold text-navy">新增自動發佈檔</p>
            <p>
              去{" "}
              <a
                className="underline"
                href="https://github.com/keithleung73/travel-log-book/new/main?filename=.github/workflows/pages.yml"
                target="_blank"
                rel="noreferrer"
              >
                新增檔案
              </a>
              。檔名必須係：
            </p>
            <p className="mt-2 rounded-xl bg-[#f3ead6] px-3 py-2 font-mono text-xs">
              .github/workflows/pages.yml
            </p>
            <p className="mt-2">
              把下面全部文字貼入內容區，撳 Commit changes。
            </p>
            <pre className="mt-3 max-h-72 overflow-auto rounded-2xl bg-navy p-4 text-left text-[11px] leading-5 text-cream">
              {WORKFLOW}
            </pre>
          </li>
          <li>
            <p className="font-semibold text-navy">更新程式檔（令網頁編得出來）</p>
            <p>下載呢個小壓縮包，解壓後把入面檔案上傳到 GitHub 的 travel-log-book-source 資料夾（覆蓋舊檔）：</p>
            <a
              href="/github-pages-source-update.zip"
              className={buttonVariants({
                className: "mt-3 rounded-full bg-navy text-cream",
              })}
            >
              下載要覆蓋的檔案
            </a>
            <p className="mt-3">
              然後喺 GitHub 刪除呢個舊檔（如果仲喺度）：
              <span className="block font-mono text-xs">travel-log-book-source/app/download/route.ts</span>
            </p>
          </li>
          <li>
            <p className="font-semibold text-navy">等 GitHub 發佈</p>
            <p>
              去{" "}
              <a
                className="underline"
                href="https://github.com/keithleung73/travel-log-book/actions"
                target="_blank"
                rel="noreferrer"
              >
                Actions
              </a>{" "}
              ，見到 Deploy GitHub Pages 變成綠色剔號之後，打開：
            </p>
            <p className="mt-2">
              <a
                className="font-medium text-navy underline"
                href="https://keithleung73.github.io/travel-log-book/"
                target="_blank"
                rel="noreferrer"
              >
                https://keithleung73.github.io/travel-log-book/
              </a>
            </p>
          </li>
        </ol>

        <Link href="/" className="mt-10 inline-block text-sm text-navy/60 underline">
          返回主頁
        </Link>
      </main>
    </div>
  );
}
