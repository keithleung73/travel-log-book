import Link from "next/link";
import { BarChart3, ClipboardList, KeyRound, MapPinned, Printer, Users } from "lucide-react";
import { SiteHeader } from "@/components/journal/SiteHeader";
import { StaffGate } from "@/components/journal/StaffGate";
import { buttonVariants } from "@/components/ui/button";

export default function StaffHomePage() {
  return (
    <StaffGate>
      <div className="min-h-screen">
        <SiteHeader variant="admin" />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <p className="text-[11px] tracking-[0.3em] text-gold">STAFF</p>
          <h1 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-navy">行政專區</h1>
          <p className="mt-3 text-sm leading-7 text-navy/70">
            此區給老師與校務處使用。可隨時加入交流團與帶隊老師、查看提交、修改內容、輸出出團與資助紀錄，並列印成書。
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link
              href="/staff/submissions"
              className="rounded-3xl border border-gold/25 bg-card p-6 shadow-sm hover:border-gold"
            >
              <ClipboardList className="size-6 text-gold" />
              <h2 className="mt-3 font-[family-name:var(--font-serif)] text-xl text-navy">提交名單</h2>
              <p className="mt-2 text-sm leading-6 text-navy/70">
                查看已提交／未提交同學，修改日誌內容，匯入提交檔，並列印個別日誌。
              </p>
            </Link>
            <Link
              href="/staff/tours"
              className="rounded-3xl border border-gold/25 bg-card p-6 shadow-sm hover:border-gold"
            >
              <MapPinned className="size-6 text-gold" />
              <h2 className="mt-3 font-[family-name:var(--font-serif)] text-xl text-navy">交流團與帶隊老師</h2>
              <p className="mt-2 text-sm leading-6 text-navy/70">
                隨時加入即將出發的團名，並預先選擇帶隊老師。學生頁即時可揀。
              </p>
            </Link>
            <Link
              href="/staff/records"
              className="rounded-3xl border border-gold/25 bg-card p-6 shadow-sm hover:border-gold"
            >
              <BarChart3 className="size-6 text-gold" />
              <h2 className="mt-3 font-[family-name:var(--font-serif)] text-xl text-navy">出團與資助紀錄</h2>
              <p className="mt-2 text-sm leading-6 text-navy/70">
                輸出每班學生出團總記錄、每位老師出團總記錄，並輸入每團是否曾申請資助。
              </p>
            </Link>
            <Link href="/admin" className="rounded-3xl border border-gold/25 bg-card p-6 shadow-sm hover:border-gold">
              <Users className="size-6 text-gold" />
              <h2 className="mt-3 font-[family-name:var(--font-serif)] text-xl text-navy">人名紙</h2>
              <p className="mt-2 text-sm leading-6 text-navy/70">核對或更新 2026–2027 各班名單。</p>
            </Link>
            <Link
              href="/staff/accounts"
              className="rounded-3xl border border-gold/25 bg-card p-6 shadow-sm hover:border-gold"
            >
              <KeyRound className="size-6 text-gold" />
              <h2 className="mt-3 font-[family-name:var(--font-serif)] text-xl text-navy">老師登入帳號</h2>
              <p className="mt-2 text-sm leading-6 text-navy/70">
                新增老師帳號、改密碼，或匯出帳號檔到其他電腦。
              </p>
            </Link>
          </div>
          <p className="mt-8 flex items-center gap-2 text-sm text-navy/60">
            <Printer className="size-4" />
            列印只在行政專區提供。
          </p>
          <Link href="/" className={buttonVariants({ variant: "outline", className: "mt-6 rounded-full" })}>
            返回學生版
          </Link>
        </main>
      </div>
    </StaffGate>
  );
}
