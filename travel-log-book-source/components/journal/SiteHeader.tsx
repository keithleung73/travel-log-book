import Link from "next/link";
import Image from "next/image";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-gold/25 bg-[#f6efe2]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/mkpc-logo.png"
            alt="萬鈞伯裘書院"
            width={160}
            height={60}
            className="h-10 w-auto"
            priority
          />
          <div className="hidden leading-tight sm:block">
            <p className="font-[family-name:var(--font-display)] text-lg tracking-wide text-navy">
              Global Exploration Journal
            </p>
            <p className="text-[11px] tracking-[0.22em] text-navy/60">
              2026–2027 環球探索日誌
            </p>
          </div>
        </Link>
        {!compact && (
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/journal"
              className="rounded-full px-3 py-1.5 text-navy/80 hover:bg-gold/15 hover:text-navy"
            >
              填寫日誌
            </Link>
            <Link
              href="/admin"
              className="rounded-full px-3 py-1.5 text-navy/80 hover:bg-gold/15 hover:text-navy"
            >
              人名紙
            </Link>
            <Link
              href="/get-source"
              className="rounded-full px-3 py-1.5 text-navy/80 hover:bg-gold/15 hover:text-navy"
            >
              下載程式
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
