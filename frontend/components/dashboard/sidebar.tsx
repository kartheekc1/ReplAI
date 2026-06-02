"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bolt,
  CreditCard,
  Grid3x3,
  Instagram,
  LogOut,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUsage } from "@/hooks/use-usage";

const NAV = [
  { id: "/dashboard", label: "Overview", icon: Grid3x3 },
  { id: "/dashboard/automations", label: "Automations", icon: Bolt },
  { id: "/dashboard/accounts", label: "Accounts", icon: Instagram },
  { id: "/dashboard/leads", label: "Leads", icon: Users },
  { id: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { id: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { id: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const usage = useUsage();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 border-r border-line bg-section-bg px-4 py-5 md:flex md:flex-col">
      <Link href="/" className="px-2 pb-5 pt-1">
        <Logo size={24} />
      </Link>
      <Button variant="primary" className="mb-4" asChild>
        <Link href="/dashboard/automations">
          <Plus size={16} /> New automation
        </Link>
      </Button>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const on = pathname === id || (id !== "/dashboard" && pathname.startsWith(id));
          return (
            <Link
              key={id}
              href={id}
              className={cn(
                "flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition-all",
                on
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-transparent text-muted hover:bg-surface-2 hover:text-ink"
              )}
            >
              <Icon size={18} className={on ? "text-brand" : "text-subtle"} /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="card-rv mb-2.5 bg-surface-2 p-3.5">
        <div className="mb-2 flex items-center justify-between text-[12px]">
          <span className="text-muted">DMs this month</span>
          {usage.loading ? (
            <span className="h-3 w-12 animate-pulse rounded bg-surface-3" />
          ) : usage.unlimited ? (
            <span className="font-semibold text-success">{formatNumber(usage.sent)} / ∞</span>
          ) : (
            <span className={cn("font-semibold", usage.percent >= 90 && "text-danger")}>
              {formatNumber(usage.sent)} / {formatNumber(usage.limit!)}
            </span>
          )}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div
            className={cn(
              "h-full transition-all",
              usage.unlimited
                ? "w-full bg-success/60"
                : usage.percent >= 90
                  ? "bg-danger"
                  : "bg-brand-gradient"
            )}
            style={!usage.unlimited ? { width: `${Math.max(usage.percent, 2)}%` } : undefined}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-subtle">
            Plan · {usage.plan}
          </span>
          {!usage.unlimited && (
            <Link
              href="/dashboard/billing"
              className="text-[12px] font-semibold text-brand hover:underline"
            >
              Upgrade →
            </Link>
          )}
        </div>
      </div>
      <button
        onClick={signOut}
        className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[13.5px] text-subtle hover:bg-surface-2 hover:text-ink"
      >
        <LogOut size={17} /> Sign out
      </button>
    </aside>
  );
}
