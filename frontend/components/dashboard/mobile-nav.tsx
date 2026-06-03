"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bolt,
  CreditCard,
  Grid3x3,
  Instagram,
  LogOut,
  Menu,
  Plus,
  Settings,
  Users,
  X,
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

/**
 * Hamburger button + slide-in drawer that mirrors the desktop sidebar.
 * Shown only below md (≤767px). The desktop sidebar handles ≥md.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const usage = useUsage();

  // Auto-close drawer whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  async function signOut() {
    const sb = createSupabaseBrowserClient();
    await sb.auth.signOut();
    router.push("/");
  }

  return (
    <>
      {/* Hamburger trigger — only visible below md */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line bg-surface text-ink shadow-sm transition-colors hover:bg-surface-2 md:hidden"
      >
        <Menu size={20} strokeWidth={2.2} />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[80vw] flex-col border-r border-line bg-section-bg px-4 py-5 shadow-lg transition-transform md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-4 flex items-center justify-between px-2">
          <Link href="/" onClick={() => setOpen(false)}>
            <Logo size={24} />
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-md hover:bg-surface-2"
          >
            <X size={18} />
          </button>
        </div>

        <Button variant="primary" className="mb-4" asChild>
          <Link href="/dashboard/automations">
            <Plus size={16} /> New automation
          </Link>
        </Button>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const on = pathname === id || (id !== "/dashboard" && pathname.startsWith(id));
            return (
              <Link
                key={id}
                href={id}
                className={cn(
                  "flex items-center gap-3 rounded-md border-l-2 px-3 py-3 text-sm font-medium",
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
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-2.5 rounded-md px-3 py-3 text-sm text-subtle hover:bg-surface-2 hover:text-ink"
        >
          <LogOut size={17} /> Sign out
        </button>
      </aside>
    </>
  );
}
