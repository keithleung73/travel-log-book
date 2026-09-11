import { Suspense } from "react";
import { StaffLoginForm } from "@/components/journal/StaffLoginForm";
import { SiteHeader } from "@/components/journal/SiteHeader";

export default function StaffLoginPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-16">
        <p className="text-[11px] tracking-[0.3em] text-gold">STAFF LOGIN</p>
        <h1 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-navy">教職員登入</h1>
        <p className="mt-3 text-sm leading-7 text-navy/70">
          行政專區（提交名單、列印、人名紙）必須登入後才可看見。學生請返回填寫日誌，無需登入。
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-navy/60">載入登入表單…</p>}>
          <StaffLoginForm />
        </Suspense>
      </main>
    </div>
  );
}
