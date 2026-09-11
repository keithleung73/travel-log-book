import Link from "next/link";
import { SiteHeader } from "@/components/journal/SiteHeader";
import { StaffGate } from "@/components/journal/StaffGate";

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
      - name: Prepare static export
        working-directory: \${{ steps.loc.outputs.dir }}
        run: |
          if [ -f mkpc-latest-source.zip ]; then
            mkdir -p /tmp/mkpc-zip
            unzip -oq mkpc-latest-source.zip -d /tmp/mkpc-zip
            if [ -d /tmp/mkpc-zip/mkpc-latest-source ]; then
              cp -a /tmp/mkpc-zip/mkpc-latest-source/. .
            else
              cp -a /tmp/mkpc-zip/. .
            fi
            rm -f mkpc-latest-source.zip
            rm -rf /tmp/mkpc-zip
          fi
          if [ -d mkpc-latest-source ]; then
            cp -a mkpc-latest-source/. .
            rm -rf mkpc-latest-source
          fi
          rm -f app/download/route.ts
          mkdir -p lib public
          python3 << 'PY'
          import json
          import re
          from pathlib import Path

          p = Path("tsconfig.json")
          if p.exists():
              data = json.loads(p.read_text())
              excl = list(data.get("exclude") or [])
              for item in ["node_modules", "mkpc-latest-source"]:
                  if item not in excl:
                      excl.append(item)
              data["exclude"] = excl
              p.write_text(json.dumps(data, indent=2) + "\\n")

          import_line = 'import { publicUrl } from "@/lib/public-url";\\n'
          replacements = [
              (r'src="/mkpc-crest\\.png"', 'src={publicUrl("/mkpc-crest.png")}'),
              (r'src="/mkpc-logo\\.png"', 'src={publicUrl("/mkpc-logo.png")}'),
              (r'src="/cover-exchange-students\\.png"', 'src={publicUrl("/cover-exchange-students.png")}'),
              (r'src="/cover-mkpc-uniform\\.png"', 'src={publicUrl("/cover-mkpc-uniform.png")}'),
          ]
          for path in Path(".").rglob("*.tsx"):
              if "node_modules" in path.parts:
                  continue
              text = path.read_text()
              new = text
              for pattern, repl in replacements:
                  new = re.sub(pattern, repl, new)
              if new == text:
                  continue
              if 'from "@/lib/public-url"' not in new:
                  lines = new.splitlines(True)
                  insert_at = 0
                  for i, line in enumerate(lines):
                      if line.startswith("import "):
                          insert_at = i + 1
                  lines.insert(insert_at, import_line)
                  new = "".join(lines)
              path.write_text(new)
          PY
          cat > lib/public-url.ts << 'EOF'
          export function publicUrl(path: string): string {
            const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
            const normalized = path.startsWith("/") ? path : \`/\${path}\`;
            return \`\${base}\${normalized}\`;
          }
          EOF
          touch public/.nojekyll
          cat > next.config.ts << 'EOF'
          import type { NextConfig } from "next";

          const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

          const nextConfig: NextConfig = {
            output: "export",
            images: { unoptimized: true },
            trailingSlash: true,
            basePath,
            assetPrefix: basePath || undefined,
          };

          export default nextConfig;
          EOF
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
    <StaffGate>
    <div className="min-h-screen">
      <SiteHeader variant="admin" />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-[11px] tracking-[0.3em] text-gold">GITHUB PAGES</p>
        <h1 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-navy">
          把日誌變成公開網頁
        </h1>
        <p className="mt-3 text-sm leading-7 text-navy/70">
          公開網址已經上線。若 Actions 出現紅色交叉，多數係上傳時多咗一層
          <code className="mx-1">mkpc-latest-source</code>
          資料夾。用下面最新工作流程覆蓋
          <code className="mx-1">pages.yml</code>
          就可以自動攤平再發佈。
        </p>
        <p className="mt-2 rounded-2xl bg-navy px-4 py-3 text-sm text-cream">
          https://keithleung73.github.io/travel-log-book/
        </p>

        <ol className="mt-10 list-decimal space-y-8 pl-5 text-sm leading-7 text-navy/80">
          <li>
            <p className="font-semibold text-navy">確認 GitHub Pages 來源</p>
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
              。Build and deployment → Source 揀 <strong>GitHub Actions</strong>。
            </p>
          </li>
          <li>
            <p className="font-semibold text-navy">覆蓋自動發佈檔</p>
            <p>
              檔案已經存在，請{" "}
              <a
                className="underline"
                href="https://github.com/keithleung73/travel-log-book/edit/main/.github/workflows/pages.yml"
                target="_blank"
                rel="noreferrer"
              >
                編輯 pages.yml
              </a>
              ，刪走舊內容，貼上下面全部文字，然後 Commit changes。
            </p>
            <p className="mt-2 rounded-xl bg-[#f3ead6] px-3 py-2 font-mono text-xs">
              .github/workflows/pages.yml
            </p>
            <pre className="mt-3 max-h-72 overflow-auto rounded-2xl bg-navy p-4 text-left text-[11px] leading-5 text-cream">
              {WORKFLOW}
            </pre>
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
              ，見到最新一條 Deploy GitHub Pages 變成綠色剔號之後，強制重新整理：
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
    </StaffGate>
  );
}
