export function IntegrityBanner() {
  return (
    <aside className="rounded-2xl border border-[#b23b3b]/30 bg-[#f8ece8] px-4 py-3 text-sm leading-6 text-navy">
      <p className="font-semibold text-[#8a1f1f]">校規：嚴禁使用 AI 代寫後複製貼上</p>
      <p className="mt-1 text-navy/75">
        日誌必須由同學親自書寫。系統已停用貼上。每日行程、三張相片與感受都完成後，才可以進入下一天；全部完成後才可以提交給學校。
      </p>
    </aside>
  );
}
