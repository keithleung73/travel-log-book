import { Suspense } from "react";
import { SiteHeader } from "@/components/journal/SiteHeader";
import { JournalWorkspace } from "@/components/journal/JournalWorkspace";

export default function JournalPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Suspense
        fallback={
          <div className="mx-auto max-w-3xl px-4 py-16 text-center text-navy/60">日誌載入中…</div>
        }
      >
        <JournalWorkspace />
      </Suspense>
    </div>
  );
}
