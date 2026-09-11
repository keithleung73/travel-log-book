"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginStaff } from "@/lib/staff-auth";

export function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      loginStaff(username, password);
      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/") ? next : "/staff/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登入失敗");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-3xl border border-gold/25 bg-card p-6">
      <div className="space-y-2">
        <Label htmlFor="staff-username">帳號</Label>
        <Input
          id="staff-username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="教職員帳號"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="staff-password">密碼</Label>
        <Input
          id="staff-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-[#8a1f1f]">{error}</p> : null}
      <Button type="submit" className="h-11 w-full rounded-full bg-navy">
        登入
      </Button>
    </form>
  );
}
