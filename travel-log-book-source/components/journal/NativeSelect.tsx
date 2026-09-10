import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function NativeSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-12 w-full appearance-auto rounded-xl border border-gold/40 bg-white px-3 text-base text-navy",
        "outline-none focus:border-navy focus:ring-2 focus:ring-gold/40",
        "disabled:cursor-not-allowed disabled:bg-[#f3ead6] disabled:text-navy/40",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
