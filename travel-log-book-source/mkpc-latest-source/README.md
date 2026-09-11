# 萬鈞伯裘書院環球探索日誌 2026–2027

萬鈞伯裘書院（Man Kwan Pak Kau College）電子版 **Global Exploration Journal**。學生每次參加交流團，可在網上選擇班別與姓名、填寫交流團資料、按天數每日上載三張相片並書寫感受，完成後下載 A4 PDF，交學校印製成書。

本專案依本校 Global Exploration 交流團學習日誌而設。系統已內建 2026–2027 各班人名紙（2026.09.02），學生可直接揀選班別與姓名。校務處如有更新，可於「人名紙」頁再匯入最新 Excel。

## 功能

- 選擇班別、姓名（內建全校人名紙，亦可再匯入 Excel）
- 交流團名稱、日期、自動計算天數
- 按天數產生每日頁：三張相片、行程、感受
- 整體感受、所學知識、能力與價值、最難忘與感謝
- 精美封面與內頁，支援列印／另存 PDF 成書
- 草稿自動儲存在本機（同一部裝置可繼續填寫）

## 網上日誌網頁

公開網址（GitHub Pages）：

**https://keithleung73.github.io/travel-log-book/**

學生用手機或電腦開啟上述網址即可填寫，無需安裝程式。資料只存在該部裝置的瀏覽器。

第一次上線請在 GitHub 倉庫 **Settings → Pages → Source** 選擇 **GitHub Actions**。之後每次更新 `main` 都會自動重新發佈網頁。

若 Actions 出現紅色交叉，常見原因是上傳時多了一層 `mkpc-latest-source` 資料夾。用最新 `.github/workflows/pages.yml`（會自動攤平該資料夾）覆蓋後再等綠色剔號即可。

## 日後如何自動同步到 GitHub 與網站

GitHub Pages 已用 GitHub Actions：每次有人把程式 push 到 `main`，就會自動重新發佈

**https://keithleung73.github.io/travel-log-book/**

要令 Cursor / Agent **每次改完都自動更新網頁**，請用 GitHub 倉庫本身來開發，不要再開一個未連 GitHub 的新專案：

1. 用 Cursor 開啟（Clone）https://github.com/keithleung73/travel-log-book
2. 登入 GitHub（Cursor Settings → Account，授權 GitHub）
3. 之後叫 Agent 改內容，並說「commit 並 push 去 GitHub」
4. Push 到 `main` 後，Actions 約 1–3 分鐘轉綠，公開網頁即更新

若 Agent 沒有 GitHub 登入權，它只能改本機預覽，你仍需自行上傳 `travel-log-book-source/` 入面的檔案。

程式在 GitHub 倉庫裡主要放在 `travel-log-book-source/`（本機開發則在專案根目錄）。

## 本機運行

需要 Node.js 18 或以上。

```bash
npm install
npm run dev
```

瀏覽器開啟 [http://127.0.0.1:45261](http://127.0.0.1:45261)

正式靜態網頁：

```bash
npm run build
```

輸出在 `out/` 資料夾，可放上任何靜態網站託管。

## 匯入人名紙

內建名單來自校務處《(2026-2027)各班人名紙(2026.09.02)》。如需更新：

1. 開啟「人名紙」頁
2. 上載最新 `.xlsx`
3. 支援：
   - 本校現行格式：工作表 `S1`–`S6`（中一至中六），每級內連續列出 1A–1E 等班；欄位為 CLASS/班別、NO./班號、NAME（英文姓名與中文姓名分兩欄）、SEX/性別
   - 每個工作表一個班（工作表名稱如 `1A`、`中一A`、`中一甲`）
   - 或單一工作表，欄位包含「班別、學號、中文姓名、英文姓名」

匯入後資料只存在該瀏覽器，不會上傳到外間伺服器。欄位範本（非真實名單）見 `public/templates/mkpc-class-list-sample.xlsx`。

## 印製成書

1. 學生完成日誌後開啟「印製成書」
2. 按「列印 / 儲存 PDF」
3. 列印設定：A4、直向、開啟「背景圖形」
4. 建議雙面列印後由校務處裝訂

相片與文字保存在學生使用的裝置。如需全校集中收集，請學生下載 PDF 後交回老師。

## 技術

Next.js、TypeScript、Tailwind CSS、shadcn/ui。日誌以 IndexedDB 儲於瀏覽器，無需登入或資料庫。
