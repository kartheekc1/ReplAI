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
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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
        <div className="mb-2 flex justify-between text-[12px]">
          <span className="text-muted">DMs this month</span>
          <span className="font-semibold">740 / 1k</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full w-[74%] bg-brand-gradient" />
        </div>
        <Link
          href="/dashboard/billing"
          className="mt-2.5 inline-block text-[12.5px] font-semibold text-brand"
        >
          Upgrade plan →
        </Link>
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
