import Image from "next/image";
import Link from "next/link";
import { Compass, Globe2, PenLine, Printer } from "lucide-react";
import { SiteHeader } from "@/components/journal/SiteHeader";
import { CompassMark } from "@/components/journal/CompassMark";
import { buttonVariants } from "@/components/ui/button";

const steps = [
  {
    icon: PenLine,
    title: "選擇班別與姓名",
    text: "按校務處人名紙揀選自己的班別，再揀姓名開始填寫。",
  },
  {
    icon: Globe2,
    title: "填寫交流團與每日日誌",
    text: "輸入團名、日期與天數。每天上載三張相片，並寫下行程與感受。",
  },
  {
    icon: Printer,
    title: "下載印製成書",
    text: "完成後可預覽整本日誌，以 A4 下載 PDF，交校務處印刷成冊。",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-navy-deep">
            <div className="absolute inset-0 opacity-40 mix-blend-screen [background-image:radial-gradient(circle_at_20%_20%,#c4a35a,transparent_28%),radial-gradient(circle_at_80%_10%,#245a7a,transparent_32%),radial-gradient(circle_at_70%_80%,#c4a35a22,transparent_40%)]" />
            <div className="absolute inset-0 opacity-20 [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22%3E%3Cpath d=%22M0 40h80M40 0v80%22 stroke=%22%23c4a35a%22 stroke-width=%22.4%22 opacity=%22.35%22/%3E%3C/svg%3E')]" />
          </div>
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.1fr_.9fr] md:py-24">
            <div className="text-cream">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 px-3 py-1 text-[11px] tracking-[0.28em] text-gold-soft">
                <Compass className="size-3.5" />
                MAN KWAN PAK KAU COLLEGE
              </p>
              <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.35em] text-gold">
                2026 — 2027
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-serif)] text-4xl leading-tight font-black md:text-6xl">
                Global Exploration
                <span className="mt-2 block text-gold">Journal</span>
              </h1>
              <p className="mt-3 font-[family-name:var(--font-serif)] text-2xl text-cream/90">
                環球探索日誌
              </p>
              <p className="mt-6 max-w-xl text-sm leading-7 text-cream/75 md:text-base">
                出課室，走進世界。同學每次參加交流團，都可在網上記錄行程、上載相片與感受；完成後下載成精美書冊，交學校印刷收藏。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/journal"
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "h-11 rounded-full bg-gold px-6 text-navy hover:bg-gold-soft",
                  })}
                >
                  開始填寫我的日誌
                </Link>
                <Link
                  href="/admin"
                  className={buttonVariants({
                    size: "lg",
                    variant: "outline",
                    className:
                      "h-11 rounded-full border-gold/50 bg-transparent px-6 text-cream hover:bg-white/10 hover:text-cream",
                  })}
                >
                  匯入各班人名紙
                </Link>
              </div>
              <p className="mt-6 text-xs tracking-wide text-cream/50">
                萬鈞伯裘書院 · 校訓「真 · 善 · 美」· ACTIVE Education
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-6 rounded-[2rem] bg-gold/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.6rem] border border-gold/35 bg-[#102445]/70 p-8 shadow-[0_30px_80px_rgba(0,0,0,.45)]">
                <CompassMark className="mx-auto h-44 w-44 opacity-90" />
                <div className="gold-line my-6" />
                <div className="text-center">
                  <Image
                    src="/mkpc-crest.png"
                    alt="萬鈞伯裘書院"
                    width={220}
                    height={190}
                    className="mx-auto h-28 w-auto"
                  />
                  <p className="mt-4 font-[family-name:var(--font-display)] text-xl text-gold-soft">
                    Explore · Reflect · Grow
                  </p>
                  <p className="mt-1 text-xs tracking-[0.25em] text-cream/60">
                    探索 · 反思 · 成長
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs tracking-[0.3em] text-gold">HOW IT WORKS</p>
            <h2 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-navy">
              每次交流團，一本屬於自己的書
            </h2>
            <p className="mt-3 text-sm leading-7 text-navy/70">
              日誌按交流天天數自動生成每日頁面；每天需上載三張相片並書寫感受，最後寫下整體得著與所學知識，方便教師批閱及印刷成書。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-3xl border border-gold/25 bg-card/80 p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <step.icon className="size-5 text-gold" />
                  <span className="font-[family-name:var(--font-display)] text-2xl text-navy/20">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-[family-name:var(--font-serif)] text-xl text-navy">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-navy/70">{step.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-gold/20 px-4 py-8 text-center text-xs text-navy/50">
        萬鈞伯裘書院 Man Kwan Pak Kau College · 天水圍天華路 51 號 · 2026–2027 年度
      </footer>
    </div>
  );
}
