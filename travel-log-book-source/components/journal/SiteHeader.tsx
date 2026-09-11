"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { publicUrl } from "@/lib/public-url";
import { getStaffSession, logoutStaff } from "@/lib/staff-auth";

type HeaderVariant = "student" | "admin";

export function SiteHeader({
  compact = false,
  variant = "student",
}: {
  compact?: boolean;
  variant?: HeaderVariant;
}) {
  const router = useRouter();
  const [staffName, setStaffName] = useState("");

  useEffect(() => {
    setStaffName(getStaffSession()?.displayName ?? "");
  }, []);

  function onLogout() {
    logoutStaff();
    router.replace("/staff/login/");
  }

  return (
    <header className="no-print sticky top-0 z-30 border-b border-gold/25 bg-[#f6efe2]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href={variant === "admin" ? "/staff" : "/"} className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={publicUrl("/mkpc-crest.png")}
            alt="萬鈞伯裘書院"
            className="h-12 w-auto"
          />
          <div className="hidden leading-tight sm:block">
            <p className="font-[family-name:var(--font-display)] text-lg tracking-wide text-navy">
              {variant === "admin" ? "行政 · 環球探索日誌" : "Global Exploration Journal"}
            </p>
            <p className="text-[11px] tracking-[0.22em] text-navy/60">
              {variant === "admin" ? "老師收集、核對與列印" : "2026–2027 環球探索日誌"}
            </p>
          </div>
        </Link>
        {!compact && variant === "student" && (
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/journal"
              className="rounded-full px-3 py-1.5 text-navy/80 hover:bg-gold/15 hover:text-navy"
            >
              填寫日誌
            </Link>
          </nav>
        )}
        {!compact && variant === "admin" && (
          <nav className="flex flex-wrap items-center justify-end gap-1 text-sm">
            <Link
              href="/staff/tours"
              className="rounded-full px-3 py-1.5 text-navy/80 hover:bg-gold/15 hover:text-navy"
            >
              交流團
            </Link>
            <Link
              href="/staff/records"
              className="rounded-full px-3 py-1.5 text-navy/80 hover:bg-gold/15 hover:text-navy"
            >
              出團紀錄
            </Link>
            <Link
              href="/staff/submissions"
              className="rounded-full px-3 py-1.5 text-navy/80 hover:bg-gold/15 hover:text-navy"
            >
              提交名單
            </Link>
            <Link
              href="/admin"
              className="rounded-full px-3 py-1.5 text-navy/80 hover:bg-gold/15 hover:text-navy"
            >
              人名紙
            </Link>
            <Link
              href="/staff/accounts"
              className="rounded-full px-3 py-1.5 text-navy/80 hover:bg-gold/15 hover:text-navy"
            >
              帳號
            </Link>
            {staffName ? (
              <span className="hidden px-2 text-xs text-navy/50 sm:inline">{staffName}</span>
            ) : null}
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full px-3 py-1.5 text-navy/80 hover:bg-gold/15 hover:text-navy"
            >
              登出
            </button>
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 text-navy/80 hover:bg-gold/15 hover:text-navy"
            >
              學生版
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
