import Link from "next/link";
import { Compass, Globe2, Medal, Presentation } from "lucide-react";
import { SiteHeader } from "@/components/journal/SiteHeader";
import { CompassMark } from "@/components/journal/CompassMark";
import { buttonVariants } from "@/components/ui/button";
import { publicUrl } from "@/lib/public-url";

const kinds = [
  {
    icon: Globe2,
    title: "遊學團",
    text: "姊妹學校交流、考察與海外遊學。揀自己參加的團，按日書寫日誌。",
  },
  {
    icon: Medal,
    title: "參加比賽",
    text: "代表學校出外比賽。完成每天行程、相片與感受後才可進入下一天。",
  },
  {
    icon: Presentation,
    title: "學科交流/展覽",
    text: "Maker Faire、學科培訓、會議與展覽。完成後提交給學校印製成書。",
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
                出課室，走進世界。同學親自書寫日誌（不可把 AI 文字貼上），完成每天內容後才可進入下一天；全部完成後提交給學校。列印由老師在行政專區處理。
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
                  href="/staff"
                  className={buttonVariants({
                    size: "lg",
                    variant: "outline",
                    className:
                      "h-11 rounded-full border-gold/50 bg-transparent px-6 text-cream hover:bg-white/10 hover:text-cream",
                  })}
                >
                  教職員入口
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={publicUrl("/mkpc-crest.png")}
                    alt="萬鈞伯裘書院"
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
            <p className="text-xs tracking-[0.3em] text-gold">選擇你的出行類別</p>
            <h2 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-navy">
              遊學團 · 參加比賽 · 學科交流／展覽
            </h2>
            <p className="mt-3 text-sm leading-7 text-navy/70">
              同學按自己參加的活動類別填寫日誌。老師可在行政專區隨時加入新團、選擇帶隊老師，並列印出團與資助紀錄。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {kinds.map((kind, index) => (
              <article
                key={kind.title}
                className="rounded-3xl border border-gold/25 bg-card/80 p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <kind.icon className="size-5 text-gold" />
                  <span className="font-[family-name:var(--font-display)] text-2xl text-navy/20">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-[family-name:var(--font-serif)] text-xl text-navy">
                  {kind.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-navy/70">{kind.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-gold/20 px-4 py-8 text-center text-xs text-navy/50">
        萬鈞伯裘書院 Man Kwan Pak Kau College · 天水圍天華路 51 號 · 2026–2027 年度
        <span className="mx-2">·</span>
        <Link href="/staff" className="underline">
          教職員
        </Link>
      </footer>
    </div>
  );
}
