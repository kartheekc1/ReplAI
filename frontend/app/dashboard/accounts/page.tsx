"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Instagram, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectModal } from "@/components/dashboard/connect-modal";
import { EmptyState } from "@/components/dashboard/empty-state";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Account = {
  id: string;
  username: string;
  followers: number;
  status: "connected" | "expired" | "revoked";
  connected_at: string;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    (async () => {
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) return setAccounts([]);
      const { data } = await sb
        .from("instagram_accounts")
        .select("id, username, followers, status, connected_at")
        .eq("user_id", auth.user.id)
        .neq("status", "revoked")
        .order("connected_at", { ascending: false });
      setAccounts((data as Account[] | null) ?? []);
    })();
  }, []);

  return (
    <div className="animate-screenIn">
      <div className="mb-5 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h2 className="text-[19px] font-semibold">Connected accounts</h2>
          <p className="mt-1 text-sm text-muted">
            Manage every Instagram account and automate at the post level.
          </p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)} className="shrink-0 sm:w-auto">
          <Plus size={16} /> Connect account
        </Button>
      </div>

      {accounts && accounts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No accounts yet"
          body="Connect your first Instagram Business or Creator account to start automating comments and DMs."
          action={
            <Button variant="primary" onClick={() => setOpen(true)}>
              <Plus size={16} /> Connect Instagram
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(accounts ?? []).map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/accounts/${a.id}`}
              className="card-rv card-rv-hover flex flex-col gap-4 p-5"
            >
              <div className="flex items-center gap-3.5">
                <span
                  className="grid h-12 w-12 place-items-center rounded-full text-white shadow-md"
                  style={{ background: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF, #515BD4)" }}
                >
                  <Instagram size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-semibold">@{a.username}</div>
                  <div className="text-[12.5px] text-muted">
                    Connected {new Date(a.connected_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge tone={a.status === "connected" ? "success" : "warning"}>
                  {a.status === "connected" ? "Connected" : "Expired"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-line pt-4">
                <div>
                  <div className="font-display text-xl">{a.followers.toLocaleString()}</div>
                  <div className="text-[11.5px] text-subtle">Followers</div>
                </div>
                <div>
                  <div className="font-display text-xl">—</div>
                  <div className="text-[11.5px] text-subtle">Posts</div>
                </div>
              </div>
              <div className="text-[13px] font-semibold text-brand">View posts →</div>
            </Link>
          ))}
          {accounts && accounts.length > 0 && (
            <button
              onClick={() => setOpen(true)}
              className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line-2 text-muted hover:bg-surface-2"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-section-bg text-brand">
                <Plus size={22} />
              </span>
              <span className="text-sm font-semibold">Connect another account</span>
              <span className="text-[12.5px]">Add a Business or Creator profile</span>
            </button>
          )}
        </div>
      )}

      <ConnectModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
