"use client";

import type { ClipboardEvent, ComponentProps, DragEvent } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

type HonestTextareaProps = ComponentProps<typeof Textarea> & {
  locked?: boolean;
};

function blockPaste(event: ClipboardEvent | DragEvent) {
  event.preventDefault();
  toast.error("校規：嚴禁把 AI 產生的文字複製貼上。請用自己的文字逐句書寫。");
}

export function HonestTextarea({
  locked,
  onPaste,
  onDrop,
  onBeforeInput,
  ...props
}: HonestTextareaProps) {
  return (
    <Textarea
      {...props}
      readOnly={locked || props.readOnly}
      spellCheck
      autoComplete="off"
      autoCorrect="off"
      onPaste={(event) => {
        blockPaste(event);
        onPaste?.(event);
      }}
      onDrop={(event) => {
        blockPaste(event);
        onDrop?.(event);
      }}
      onBeforeInput={(event) => {
        const native = event.nativeEvent as InputEvent;
        if (
          native.inputType === "insertFromPaste" ||
          native.inputType === "insertFromDrop" ||
          native.inputType === "insertFromYank"
        ) {
          event.preventDefault();
          toast.error("校規：嚴禁把 AI 產生的文字複製貼上。請用自己的文字逐句書寫。");
        }
        onBeforeInput?.(event);
      }}
    />
  );
}
