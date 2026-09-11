"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/journal/SiteHeader";
import { StaffGate } from "@/components/journal/StaffGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addStaffAccount,
  deleteStaffAccount,
  importStaffAccounts,
  listStaffAccounts,
  updateStaffAccount,
  type StaffAccount,
} from "@/lib/staff-auth";
import { downloadJsonFile } from "@/lib/submission";


export default function StaffAccountsPage() {
  const [accounts, setAccounts] = useState<StaffAccount[]>([]);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");

  function refresh() {
    setAccounts(listStaffAccounts());
  }

  useEffect(() => {
    refresh();
  }, []);

  function onAdd(event: FormEvent) {
    event.preventDefault();
    try {
      addStaffAccount({ username, displayName, password });
      setUsername("");
      setDisplayName("");
      setPassword("");
      refresh();
      toast.success("已新增教職員帳號");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "新增失敗");
    }
  }

  return (
    <StaffGate>
      <div className="min-h-screen">
        <SiteHeader variant="admin" />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <p className="text-[11px] tracking-[0.3em] text-gold">STAFF ACCOUNTS</p>
          <h1 className="mt-2 font-[family-name:var(--font-serif)] text-3xl text-navy">設定老師登入帳號</h1>
          <p className="mt-3 text-sm leading-7 text-navy/70">
            第一次可用預設帳號登入，然後在此新增老師帳號或改密碼。帳號存在呢部電腦的瀏覽器；換電腦請匯出再匯入。
          </p>

          <form onSubmit={onAdd} className="mt-8 space-y-3 rounded-3xl border border-gold/25 bg-card p-5">
            <p className="font-medium text-navy">新增帳號</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="new-user">登入帳號</Label>
                <Input id="new-user" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="例如 leung" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-name">顯示名稱</Label>
                <Input id="new-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="例如 梁老師" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-pass">密碼（至少 6 個字）</Label>
              <Input id="new-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="rounded-full bg-navy">
              新增老師帳號
            </Button>
          </form>

          <div className="mt-8 space-y-3">
            {accounts.map((account) => (
              <article key={account.username} className="rounded-2xl border border-gold/25 bg-white p-4">
                <p className="font-medium text-navy">{account.displayName}</p>
                <p className="text-xs text-navy/50">帳號：{account.username}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      const next = window.prompt(`為「${account.username}」設定新密碼`, "");
                      if (!next) return;
                      try {
                        updateStaffAccount(account.username, { password: next });
                        refresh();
                        toast.success("已更新密碼");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "更新失敗");
                      }
                    }}
                  >
                    改密碼
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full text-[#8a1f1f]"
                    onClick={() => {
                      if (!window.confirm(`刪除帳號 ${account.username}？`)) return;
                      try {
                        deleteStaffAccount(account.username);
                        refresh();
                        toast.message("已刪除");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "刪除失敗");
                      }
                    }}
                  >
                    刪除
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() =>
                downloadJsonFile("MKPC-staff-accounts.json", {
                  kind: "mkpc-staff-accounts",
                  version: 1,
                  accounts: listStaffAccounts(),
                })
              }
            >
              匯出帳號檔
            </Button>
            <label className="inline-flex cursor-pointer items-center rounded-full border border-navy/15 px-4 py-2 text-sm text-navy">
              匯入帳號檔
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  void file.text().then((text) => {
                    try {
                      importStaffAccounts(JSON.parse(text) as unknown);
                      refresh();
                      toast.success("已匯入帳號");
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "匯入失敗");
                    }
                  });
                }}
              />
            </label>
          </div>
        </main>
      </div>
    </StaffGate>
  );
}
