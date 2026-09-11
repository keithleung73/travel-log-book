import { formatRange } from "@/lib/dates";
import { formLabel } from "@/lib/roster";
import { publicUrl } from "@/lib/public-url";
import type { Journal } from "@/lib/types";

export function CoverPage({ journal }: { journal: Journal }) {
  const tripPhotos = journal.dayEntries
    .flatMap((day) => day.photos)
    .filter((photo): photo is string => Boolean(photo))
    .slice(0, 3);
  const classText = journal.classCode ? formLabel(journal.classCode) : "";

  return (
    <article className="cover-page book-page relative mb-6 overflow-hidden rounded-sm bg-[#071526] text-[#f6efe2] shadow-lg print:mb-0 print:rounded-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={publicUrl("/cover-exchange-students.png")}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_22%]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#071526]/45 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#071526] via-[#071526]/85 to-transparent" style={{ top: "52%" }} />

      <div className="pointer-events-none absolute inset-[7mm] border border-[#c4a35a]/55" />
      <div className="pointer-events-none absolute inset-[9mm] border border-[#c4a35a]/25" />

      <div className="relative z-10 flex min-h-[277mm] flex-col justify-between px-[16mm] py-[14mm]">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicUrl("/mkpc-crest.png")}
              alt="萬鈞伯裘書院"
              className="h-[92px] w-auto drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
            />
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-[0.32em] text-[#c4a35a]">ACADEMIC YEAR</p>
            <p className="mt-1 font-[family-name:var(--font-serif)] text-2xl text-[#e8d7a5]">
              2026–2027
            </p>
            <p className="mt-3 rotate-[-8deg] rounded-full border-2 border-[#c4a35a]/80 px-3 py-2 text-[9px] leading-4 tracking-[0.18em] text-[#e8d7a5]">
              EXCHANGE
              <br />
              JOURNAL
            </p>
          </div>
        </header>

        <footer>
          <p className="text-[11px] tracking-[0.42em] text-[#c4a35a]">
            GLOBAL EXPLORATION JOURNAL
          </p>
          <p className="mt-2 text-[13px] tracking-[0.18em] text-[#f6efe2]/70">環球探索日誌</p>
          <h1 className="mt-3 font-[family-name:var(--font-serif)] text-[28px] leading-snug font-black text-[#f8f1df]">
            {journal.tourName || "交流團名稱"}
          </h1>
          {journal.destination ? (
            <p className="mt-2 text-sm tracking-wide text-[#e8d7a5]">{journal.destination}</p>
          ) : null}

          {tripPhotos.length > 0 ? (
            <div className="mt-5 flex gap-3">
              {tripPhotos.map((photo, index) => (
                <figure
                  key={`${photo.slice(0, 24)}-${index}`}
                  className="w-[31%] bg-[#f6efe2] p-1.5 shadow-lg"
                  style={{ transform: `rotate(${[-4, 2, 3][index] || 0}deg)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="" className="aspect-[4/3] w-full object-cover" />
                  <figcaption className="py-1 text-center text-[9px] tracking-wide text-[#102445]/70">
                    交流足跡 {index + 1}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-xs tracking-[0.16em] text-[#f6efe2]/50">
              與同學一起走入世界，把所見所感寫成書。
            </p>
          )}

          <div className="mt-7 border-t border-[#c4a35a]/45 pt-5">
            <p className="font-[family-name:var(--font-serif)] text-3xl text-[#f8f1df]">
              {journal.chineseName || "同學姓名"}
            </p>
            {journal.englishName ? (
              <p className="mt-1 text-sm tracking-[0.12em] text-[#f6efe2]/75">{journal.englishName}</p>
            ) : null}
            <p className="mt-2 text-sm text-[#e8d7a5]">
              {[classText, "萬鈞伯裘書院"].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-1 text-xs text-[#f6efe2]/60">
              {formatRange(journal.startDate, journal.endDate)}
              {journal.days ? ` · 共 ${journal.days} 天` : ""}
              {" · "}
              2026–2027 年度
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}
