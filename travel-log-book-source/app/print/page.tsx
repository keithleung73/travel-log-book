import { Suspense } from "react";
import { PrintBook } from "@/components/journal/PrintBook";

export default function PrintPage() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-center">載入中…</p>}>
      <PrintBook />
    </Suspense>
  );
}
