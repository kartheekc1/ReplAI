"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bolt, Edit, Pause, Play, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Auto = {
  id: string;
  name: string;
  keywords: string[];
  post_id: string | null;
  message: string;
  dms_sent: number;
  leads_captured: number;
  status: "active" | "paused" | "draft";
};

export default function AutomationsPage() {
  const [list, setList] = useState<Auto[] | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    (async () => {
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) return setList([]);
      const { data } = await sb
        .from("automations")
        .select("id, name, keywords, post_id, message, dms_sent, leads_captured, status")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });
      setList((data as Auto[] | null) ?? []);
    })();
  }, []);

  async function toggle(a: Auto) {
    const next = a.status === "active" ? "paused" : "active";
    const sb = createSupabaseBrowserClient();
    const { error } = await sb.from("automations").update({ status: next }).eq("id", a.id);
    if (error) return toast.error(error.message);
    setList((l) => (l ?? []).map((x) => (x.id === a.id ? { ...x, status: next } : x)));
  }

  const filtered = (list ?? []).filter((x) => filter === "all" || x.status === filter);

  if (list && list.length === 0) {
    return (
      <EmptyState
        icon={Bolt}
        title="No automations yet"
        body="Pick a post or reel from a connected Instagram account, set the keywords that trigger your DM, and ReplAI will handle the rest."
        action={
          <Button variant="primary" asChild>
            <Link href="/dashboard/accounts">
              <Plus size={16} /> Create your first automation
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="animate-screenIn">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {(["all", "active", "paused"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "rounded-md border border-line px-3.5 py-1.5 text-[13px] font-semibold capitalize",
                filter === t ? "bg-surface-3 text-ink" : "bg-surface text-muted"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <Button variant="primary" asChild>
          <Link href="/dashboard/accounts"><Plus size={16} /> New automation</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <div key={a.id} className="card-rv card-rv-hover p-5">
            <div className="mb-3.5 flex items-start justify-between">
              <span className="grid h-[42px] w-[42px] place-items-center rounded-[11px] border border-secondary/22 bg-brand/10 text-brand">
                <Bolt size={20} />
              </span>
              <Badge tone={a.status === "active" ? "success" : "warning"}>
                {a.status === "active" ? (
                  <><span className="live-dot" /> Active</>
                ) : (
                  "Paused"
                )}
              </Badge>
            </div>
            <h3 className="mb-1 text-base font-semibold">{a.name}</h3>
            <div className="mb-3.5 text-[12.5px] text-subtle truncate">
              {a.post_id ? `Post · ${a.post_id.slice(0, 14)}…` : "Any post"}
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
              {a.keywords.slice(0, 4).map((k) => (
                <span key={k} className="chip-mono">{k}</span>
              ))}
            </div>
            <div className="mb-3.5 flex gap-4 border-t border-line py-3">
              <div>
                <div className="font-display text-xl">{a.dms_sent.toLocaleString()}</div>
                <div className="text-[11.5px] text-subtle">DMs sent</div>
              </div>
              <div>
                <div className="font-display text-xl">{a.leads_captured.toLocaleString()}</div>
                <div className="text-[11.5px] text-subtle">Leads</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1 text-[13px]" onClick={() => toggle(a)}>
                {a.status === "active" ? (<><Pause size={14} /> Pause</>) : (<><Play size={13} /> Resume</>)}
              </Button>
              <Button variant="ghost" size="icon"><Edit size={15} /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
