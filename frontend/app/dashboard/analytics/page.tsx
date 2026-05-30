"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bolt, DollarSign, MessageCircle, Send, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AreaChart, BarChart, Donut } from "@/components/shared/charts";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Stats = { comments: number; dms: number; leads: number; revenue: number };

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [series, setSeries] = useState<number[]>([]);
  const [keywords, setKeywords] = useState<{ label: string; value: number }[]>([]);
  const [topPosts, setTopPosts] = useState<{ post: string; leads: number }[]>([]);

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    (async () => {
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) return;
      const uid = auth.user.id;

      const [{ count: c }, { count: d }, { count: l }, { data: revRows }] = await Promise.all([
        sb.from("comments").select("*", { count: "exact", head: true }).eq("user_id", uid),
        sb.from("messages").select("*", { count: "exact", head: true }).eq("user_id", uid).eq("status", "sent"),
        sb.from("leads").select("*", { count: "exact", head: true }).eq("user_id", uid),
        sb.from("payments").select("amount").eq("user_id", uid).eq("status", "captured"),
      ]);
      const revenue = (revRows ?? []).reduce((sum, r) => sum + ((r.amount as number) ?? 0), 0) / 100;
      setStats({ comments: c ?? 0, dms: d ?? 0, leads: l ?? 0, revenue });

      // 30-day DMs series
      const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
      const { data: dailyMsgs } = await sb.from("messages").select("sent_at").eq("user_id", uid).gte("sent_at", since30);
      const buckets = new Array(30).fill(0);
      for (const m of dailyMsgs ?? []) {
        const day = 29 - Math.floor((Date.now() - new Date(m.sent_at as string).getTime()) / 86_400_000);
        if (day >= 0 && day < 30) buckets[day]++;
      }
      setSeries(buckets);

      // Best keywords
      const { data: kwRows } = await sb.from("leads").select("keyword").eq("user_id", uid).not("keyword", "is", null);
      const kwCounts: Record<string, number> = {};
      for (const r of kwRows ?? []) {
        const k = r.keyword as string;
        kwCounts[k] = (kwCounts[k] ?? 0) + 1;
      }
      setKeywords(
        Object.entries(kwCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value }))
      );

      // Best posts (by lead count)
      const { data: ppRows } = await sb.from("leads").select("source_post_id").eq("user_id", uid).not("source_post_id", "is", null);
      const ppCounts: Record<string, number> = {};
      for (const r of ppRows ?? []) {
        const p = r.source_post_id as string;
        ppCounts[p] = (ppCounts[p] ?? 0) + 1;
      }
      setTopPosts(
        Object.entries(ppCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([post, leads]) => ({ post, leads }))
      );
    })();
  }, []);

  const conversion = stats && stats.comments ? Math.round((stats.leads / stats.comments) * 100) : 0;
  const noData = stats && stats.comments + stats.dms + stats.leads === 0;

  if (noData) {
    return (
      <EmptyState
        icon={Bolt}
        title="No analytics data yet"
        body="Once your automations start triggering and capturing leads, the charts here will show real-time performance — DMs sent, conversion rate, best keywords, and top posts."
        action={
          <Button variant="primary" asChild>
            <Link href="/dashboard/automations">Create an automation</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="animate-screenIn space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={MessageCircle} label="Comments tracked" value={stats?.comments.toLocaleString() ?? "—"} />
        <StatCard icon={Send}           label="DMs sent"          value={stats?.dms.toLocaleString() ?? "—"} />
        <StatCard icon={Target}         label="Leads generated"   value={stats?.leads.toLocaleString() ?? "—"} />
        <StatCard icon={DollarSign}     label="Revenue (₹)"       value={stats ? `₹${stats.revenue.toLocaleString("en-IN")}` : "—"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[15px] font-semibold">Daily DMs</span>
            <Badge tone="gray">Last 30 days</Badge>
          </div>
          <AreaChart data={series} height={220} />
        </Card>
        <Card className="p-5">
          <div className="mb-4 text-[15px] font-semibold">Conversion rate</div>
          <div className="flex justify-center">
            <Donut value={conversion} label="comment → lead" />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 text-[15px] font-semibold">Best keywords</div>
          {keywords.length > 0 ? (
            <BarChart data={keywords} height={220} />
          ) : (
            <p className="py-10 text-center text-sm text-muted">No keyword data yet.</p>
          )}
        </Card>
        <Card className="p-5">
          <div className="mb-4 text-[15px] font-semibold">Top performing posts</div>
          {topPosts.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wider text-subtle">
                  <th className="pb-3 font-semibold">Post</th>
                  <th className="pb-3 text-right font-semibold">Leads</th>
                </tr>
              </thead>
              <tbody>
                {topPosts.map((p) => (
                  <tr key={p.post} className="border-t border-line">
                    <td className="py-3 font-mono text-[12.5px]">{p.post.slice(0, 22)}…</td>
                    <td className="py-3 text-right">{p.leads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-10 text-center text-sm text-muted">No post data yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
