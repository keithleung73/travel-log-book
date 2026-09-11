"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SchoolRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/staff/submissions/");
  }, [router]);
  return <p className="px-6 py-16 text-center text-navy/70">正在前往行政專區…</p>;
}
