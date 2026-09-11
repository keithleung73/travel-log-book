"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStaffSession } from "@/lib/staff-auth";

export function StaffGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (getStaffSession()) {
      setReady(true);
      return;
    }
    const next = pathname && pathname !== "/staff/login" ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/staff/login/${next}`);
  }, [pathname, router]);

  if (!ready) {
    return <p className="px-6 py-16 text-center text-navy/60">正在確認教職員登入…</p>;
  }

  return <>{children}</>;
}
