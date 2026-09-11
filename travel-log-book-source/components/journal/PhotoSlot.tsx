"use client";

import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { fileToJournalPhoto } from "@/lib/photos";
import { cn } from "@/lib/utils";

type PhotoSlotProps = {
  label: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  locked?: boolean;
};

export function PhotoSlot({ label, value, onChange, locked }: PhotoSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (locked) return;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("請上載相片檔案");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await fileToJournalPhoto(file);
      onChange(dataUrl);
    } catch {
      toast.error("相片處理失敗，請再試一次");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs tracking-[0.18em] text-navy/55">{label}</p>
      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden rounded-2xl border border-dashed border-gold/40 bg-[#f3ead6]",
          value && "border-solid"
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-navy/55"
            disabled={busy || locked}
          >
            <Camera className="size-6" />
            <span className="text-xs">{busy ? "處理中…" : "上載相片"}</span>
          </button>
        )}
        {value && !locked && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 rounded-full bg-navy/80 p-1 text-cream"
            aria-label="移除相片"
          >
            <X className="size-3.5" />
          </button>
        )}
        {value && !locked && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 left-2 rounded-full bg-cream/90 px-2 py-1 text-[10px] tracking-wider text-navy"
          >
            更換
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
