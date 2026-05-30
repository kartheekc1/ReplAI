"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bolt, DollarSign, MessageCircle, Send, Sparkles, Target } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart } from "@/components/shared/charts";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils";

type Activity = { id: string; username: string; action: string; created_at: string };
type Counts = {
  comments: number;
  dms: number;
  leads: number;
  active_automations: number;
};

export default function OverviewPage() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [recent, setRecent] = useState<Activity[] | null>(null);
  const [series, setSeries] = useState<number[]>([]);

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    (async () => {
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) return;
      const uid = auth.user.id;

      const [{ count: c }, { count: d }, { count: l }, { count: a }] = await Promise.all([
        sb.from("comments").select("*", { count: "exact", head: true }).eq("user_id", uid),
        sb.from("messages").select("*", { count: "exact", head: true }).eq("user_id", uid).eq("status", "sent"),
        sb.from("leads").select("*", { count: "exact", head: true }).eq("user_id", uid),
        sb.from("automations").select("*", { count: "exact", head: true }).eq("user_id", uid).eq("status", "active"),
      ]);
      setCounts({ comments: c ?? 0, dms: d ?? 0, leads: l ?? 0, active_automations: a ?? 0 });

      // Recent activity — last 8 sent messages
      const { data: msgs } = await sb
        .from("messages")
        .select("id, recipient, sent_at, automation_id")
        .eq("user_id", uid)
        .order("sent_at", { ascending: false })
        .limit(8);
      setRecent(
        (msgs ?? []).map((m) => ({
          id: m.id as string,
          username: m.recipient as string,
          action: "DM sent",
          created_at: m.sent_at as string,
        }))
      );

      // 14-day series for the area chart
      const since = new Date(Date.now() - 14 * 86_400_000).toISOString();
      const { data: dailyMsgs } = await sb
        .from("messages")
        .select("sent_at")
        .eq("user_id", uid)
        .gte("sent_at", since);
      const buckets = new Array(14).fill(0);
      for (const m of dailyMsgs ?? []) {
        const day = 13 - Math.floor((Date.now() - new Date(m.sent_at as string).getTime()) / 86_400_000);
        if (day >= 0 && day < 14) buckets[day]++;
      }
      setSeries(buckets);
    })();
  }, []);

  const noData = counts && counts.comments + counts.dms + counts.leads === 0;

  return (
    <div className="animate-screenIn space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={MessageCircle} label="Comments tracked" value={(counts?.comments ?? "—").toLocaleString?.() ?? counts?.comments ?? "—"} />
        <StatCard icon={Send}           label="DMs sent"          value={(counts?.dms ?? "—").toLocaleString?.() ?? counts?.dms ?? "—"} />
        <StatCard icon={Target}         label="Leads generated"   value={(counts?.leads ?? "—").toLocaleString?.() ?? counts?.leads ?? "—"} />
        <StatCard icon={Bolt}           label="Active automations" value={counts?.active_automations ?? "—"} />
      </div>

      {noData ? (
        <EmptyState
          icon={Sparkles}
          title="No activity yet"
          body="Connect an Instagram account and create your first automation — this dashboard will fill up with comments, DMs, and leads in real time."
          action={
            <div className="flex gap-2">
              <Button variant="primary" asChild>
                <Link href="/dashboard/accounts">Connect Instagram</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard/automations">View automations</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[15px] font-semibold">DMs sent — last 14 days</span>
              <Badge tone="gray">Live</Badge>
            </div>
            {series.length > 0 ? (
              <AreaChart data={series} height={210} />
            ) : (
              <div className="h-[210px] animate-pulse rounded-md bg-surface-2" />
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-3 text-[15px] font-semibold">Recent automation activity</div>
            <div className="flex flex-col">
              {(recent ?? []).map((a, i, arr) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 py-3 ${i < arr.length - 1 ? "border-b border-line" : ""}`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-gradient text-[12px] font-bold text-white">
                    {a.username.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold">@{a.username}</div>
                    <div className="text-[12.5px] text-muted">{a.action}</div>
                  </div>
                  <span className="whitespace-nowrap text-[12px] text-subtle">
                    {formatRelativeTime(a.created_at)}
                  </span>
                </div>
              ))}
              {recent && recent.length === 0 && (
                <p className="py-4 text-center text-sm text-muted">No DMs sent yet.</p>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
