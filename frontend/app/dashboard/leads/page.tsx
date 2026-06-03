"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Filter, Search, Tag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Lead = {
  id: string;
  name: string | null;
  username: string;
  email: string | null;
  phone: string | null;
  source_post_id: string | null;
  keyword: string | null;
  tags: string[];
  created_at: string;
};

function toCsv(rows: Lead[]) {
  const header = ["Name", "Username", "Email", "Phone", "Source", "Keyword", "Tags", "Created"];
  const body = rows.map((r) =>
    [r.name ?? "", r.username, r.email ?? "", r.phone ?? "", r.source_post_id ?? "", r.keyword ?? "", r.tags.join("|"), r.created_at].map((v) =>
      `"${String(v).replace(/"/g, '""')}"`
    ).join(",")
  );
  return [header.join(","), ...body].join("\n");
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    (async () => {
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) return setLeads([]);
      const { data } = await sb
        .from("leads")
        .select("id, name, username, email, phone, source_post_id, keyword, tags, created_at")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });
      setLeads((data as Lead[] | null) ?? []);
    })();
  }, []);

  const filtered = useMemo(
    () =>
      (leads ?? []).filter((l) =>
        !q || [l.username, l.name, l.email, l.keyword].filter(Boolean).some((s) => s!.toLowerCase().includes(q.toLowerCase()))
      ),
    [leads, q]
  );

  function exportCsv() {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `replai-leads-${Date.now()}.csv`;
    a.click();
  }

  if (leads && leads.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No leads yet"
        body="When followers comment your trigger keywords, the leads ReplAI captures will appear here. Search, tag, and export them to your CRM."
        action={
          <Button variant="primary" asChild>
            <Link href="/dashboard/automations">Create an automation</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="animate-screenIn">
      <div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full max-w-md items-center gap-2 rounded-md border border-line bg-surface px-3 py-2">
          <Search size={16} className="text-subtle shrink-0" />
          <input
            placeholder="Search leads…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-subtle"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1 sm:flex-none">
            <Filter size={15} /> Filter
          </Button>
          <Button variant="ghost" onClick={exportCsv} className="flex-1 sm:flex-none">
            <Download size={15} /> Export
          </Button>
        </div>
      </div>

      {/* Desktop / tablet: real table */}
      <div className="card-rv hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-section-bg text-[12.5px] uppercase tracking-wider text-subtle">
                <th className="px-5 py-3 font-semibold">Lead</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">Keyword</th>
                <th className="px-5 py-3 font-semibold">Tags</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-line transition-colors hover:bg-surface-2">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-gradient text-[12px] font-bold text-white">
                        {(l.name ?? l.username).slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <div className="font-semibold">{l.name ?? `@${l.username}`}</div>
                        <div className="text-[12px] text-muted">@{l.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{l.email ?? "—"}</td>
                  <td className="px-5 py-3.5 text-muted">{l.phone ?? "—"}</td>
                  <td className="px-5 py-3.5">{l.keyword ? <span className="chip-mono">{l.keyword}</span> : "—"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {l.tags.length === 0 && <span className="text-muted">—</span>}
                      {l.tags.map((t) => (
                        <Badge key={t} tone="brand"><Tag size={10} /> {t}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{new Date(l.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-muted">No leads match your search.</div>
        )}
      </div>

      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.length === 0 && (
          <div className="card-rv p-8 text-center text-sm text-muted">
            No leads match your search.
          </div>
        )}
        {filtered.map((l) => (
          <div key={l.id} className="card-rv space-y-3 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-gradient text-[12px] font-bold text-white">
                {(l.name ?? l.username).slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{l.name ?? `@${l.username}`}</div>
                <div className="truncate text-[12px] text-muted">@{l.username}</div>
              </div>
              {l.keyword && <span className="chip-mono shrink-0">{l.keyword}</span>}
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-[13px]">
              {l.email && (
                <div className="flex justify-between gap-2">
                  <span className="text-subtle">Email</span>
                  <span className="truncate">{l.email}</span>
                </div>
              )}
              {l.phone && (
                <div className="flex justify-between gap-2">
                  <span className="text-subtle">Phone</span>
                  <span>{l.phone}</span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span className="text-subtle">Date</span>
                <span className="text-muted">{new Date(l.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            {l.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-line pt-3">
                {l.tags.map((t) => (
                  <Badge key={t} tone="brand">
                    <Tag size={10} /> {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
