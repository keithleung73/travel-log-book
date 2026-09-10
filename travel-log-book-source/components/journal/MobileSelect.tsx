"use client";

import { useEffect, useRef } from "react";

export type MobileSelectOption = {
  value: string;
  label: string;
};

type MobileSelectProps = {
  id: string;
  name: string;
  value: string;
  placeholder: string;
  options: MobileSelectOption[];
  disabled?: boolean;
  onValueCommit: (value: string) => void;
};

export function MobileSelect({
  id,
  name,
  value,
  placeholder,
  options,
  disabled,
  onValueCommit,
}: MobileSelectProps) {
  const ref = useRef<HTMLSelectElement>(null);
  const commitRef = useRef(onValueCommit);
  commitRef.current = onValueCommit;
  const lastEmitted = useRef(value);

  function commitFromElement(el: HTMLSelectElement) {
    const next = el.value;
    if (next === lastEmitted.current) return;
    lastEmitted.current = next;
    commitRef.current(next);
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onNative = () => commitFromElement(el);
    el.addEventListener("change", onNative);
    el.addEventListener("input", onNative);
    return () => {
      el.removeEventListener("change", onNative);
      el.removeEventListener("input", onNative);
    };
  }, [id]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (value) {
      el.value = value;
    }
    lastEmitted.current = value;
  }, [value]);

  return (
    <select
      ref={ref}
      id={id}
      name={name}
      disabled={disabled}
      defaultValue={value || ""}
      className="h-14 w-full rounded-xl border-2 border-navy bg-white px-3 text-lg text-navy"
      style={{ fontSize: 16, WebkitAppearance: "menulist", appearance: "menulist" }}
      autoComplete="off"
      onChange={(event) => commitFromElement(event.currentTarget)}
      onInput={(event) => commitFromElement(event.currentTarget)}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
