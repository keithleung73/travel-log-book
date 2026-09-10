import Image from "next/image";
import { formatLongDate, formatRange } from "@/lib/dates";
import { journalCompleteness, photoCount } from "@/lib/journal";
import { formLabel } from "@/lib/roster";
import type { Journal } from "@/lib/types";
import { CompassMark } from "@/components/journal/CompassMark";
import { CoverPage } from "@/components/journal/CoverPage";

function Field({
  label,
  children,
  minLines = 4,
}: {
  label: string;
  children: string;
  minLines?: number;
}) {
  return (
    <section className="mt-4">
      <h3 className="border-b border-gold/40 pb-1 font-[family-name:var(--font-serif)] text-base text-navy">
        {label}
      </h3>
      <p
        className="mt-2 whitespace-pre-wrap text-[13.5px] leading-7 text-[#3b3426]"
        style={{ minHeight: `${minLines * 1.75}rem` }}
      >
        {children?.trim() || "　"}
      </p>
    </section>
  );
}

function PageChrome({
  journal,
  page,
  children,
  cover,
}: {
  journal: Journal;
  page: string;
  children: React.ReactNode;
  cover?: boolean;
}) {
  if (cover) return <>{children}</>;
  return (
    <article className="book-page relative mb-6 overflow-hidden rounded-sm border border-gold/20 p-[14mm] shadow-sm print:mb-0 print:rounded-none">
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-gold/30 pb-3">
        <div className="flex items-center gap-3">
          <Image src="/mkpc-crest.png" alt="" width={72} height={62} className="h-10 w-auto" />
          <div className="leading-tight">
            <p className="font-[family-name:var(--font-display)] text-sm tracking-wide text-navy">
              Global Exploration Journal 2026–2027
            </p>
            <p className="text-[10px] tracking-[0.2em] text-navy/55">萬鈞伯裘書院 · 環球探索日誌</p>
          </div>
        </div>
        <p className="text-[10px] tracking-[0.16em] text-navy/45">{page}</p>
      </div>
      {children}
      <div className="mt-8 flex items-end justify-between border-t border-gold/25 pt-3 text-[10px] text-navy/50">
        <span>
          {formLabel(journal.classCode)} {journal.chineseName}
          {journal.englishName ? ` / ${journal.englishName}` : ""}
        </span>
        <span>{journal.tourName || "交流團日誌"}</span>
      </div>
    </article>
  );
}

export function BookPages({ journal }: { journal: Journal }) {
  const photos = photoCount(journal);
  const complete = journalCompleteness(journal);

  return (
    <div className="print-root mx-auto max-w-[210mm] space-y-0">
      <CoverPage journal={journal} />

      <PageChrome journal={journal} page="學生與交流團">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl text-navy">學生與交流團資料</h2>
        <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <p>
            <span className="text-navy/50">班別</span>
            <br />
            {journal.classCode ? formLabel(journal.classCode) : "—"}
          </p>
          <p>
            <span className="text-navy/50">姓名</span>
            <br />
            {journal.chineseName || "—"}
            {journal.englishName ? `（${journal.englishName}）` : ""}
          </p>
          <p className="col-span-2">
            <span className="text-navy/50">交流團名稱</span>
            <br />
            {journal.tourName || "—"}
          </p>
          <p>
            <span className="text-navy/50">目的地</span>
            <br />
            {journal.destination || "—"}
          </p>
          <p>
            <span className="text-navy/50">天數</span>
            <br />
            {journal.days ? `${journal.days} 天` : "—"}
          </p>
          <p className="col-span-2">
            <span className="text-navy/50">日期</span>
            <br />
            {formatRange(journal.startDate, journal.endDate)}
          </p>
        </div>
        <Field label="出發前期望" minLines={8}>
          {journal.expectation}
        </Field>
        <p className="mt-6 text-[11px] text-navy/40">
          完成度 {complete}%　相片 {photos.done}/{photos.total}
        </p>
      </PageChrome>

      {journal.dayEntries.map((day) => (
        <PageChrome key={day.date} journal={journal} page={`第 ${day.dayNumber} 天`}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.28em] text-gold">DAY {day.dayNumber}</p>
              <h2 className="font-[family-name:var(--font-serif)] text-2xl text-navy">
                {day.title || `第 ${day.dayNumber} 天行程`}
              </h2>
              <p className="text-sm text-navy/60">
                {formatLongDate(day.date)}
                {day.weather ? ` · ${day.weather}` : ""}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {day.photos.map((photo, index) => (
              <div key={index} className="aspect-[4/3] overflow-hidden rounded-md bg-[#efe4cc]">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={`第${day.dayNumber}天相片${index + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] tracking-widest text-navy/30">
                    相片 {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
          <Field label="今日行程" minLines={5}>
            {day.itinerary}
          </Field>
          <Field label="今日感受與反思" minLines={8}>
            {day.feeling}
          </Field>
        </PageChrome>
      ))}

      <PageChrome journal={journal} page="整體感受">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl text-navy">整體感受與所學</h2>
        <Field label="這次交流團的整體感受">{journal.overallFeeling}</Field>
        <Field label="我學到的相關知識（文化、歷史、科技、語言、城市等）">
          {journal.knowledgeLearned}
        </Field>
      </PageChrome>

      <PageChrome journal={journal} page="成長與感謝">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl text-navy">成長、難忘與感謝</h2>
        <Field label="我培養的能力與價值觀">{journal.skillsLearned}</Field>
        <Field label="最難忘的一件事">{journal.mostMemorable}</Field>
        <Field label="想對老師、同學或自己說的話">{journal.gratitude}</Field>
      </PageChrome>

      <article className="book-page relative mb-6 flex min-h-[277mm] flex-col items-center justify-center overflow-hidden rounded-sm bg-[#071526] px-12 py-16 text-center text-[#f6efe2] shadow-lg print:mb-0 print:rounded-none">
        <CompassMark className="mb-8 h-24 w-24" />
        <p className="font-[family-name:var(--font-display)] text-3xl tracking-[0.4em] text-gold">
          真 · 善 · 美
        </p>
        <p className="mt-6 max-w-sm font-[family-name:var(--font-serif)] text-xl leading-9">
          出課室，走進世界。
          <br />
          把所見、所學、所感，化成繼續前行的力量。
        </p>
        <div className="gold-line my-10 w-48" />
        <p className="text-xs tracking-[0.25em] text-[#f6efe2]/55">
          萬鈞伯裘書院 · 天水圍天華路 51 號
        </p>
        <p className="mt-2 text-[11px] text-[#f6efe2]/40">Come in as Students. Leave as Family.</p>
      </article>
    </div>
  );
}
