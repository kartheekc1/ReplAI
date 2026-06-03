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
  MoreHorizontal,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn, formatNumber } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUsage } from "@/hooks/use-usage";

/**
 * Mobile-only navigation system:
 *  - Bottom tab bar (fixed) with the 5 most-used sections + a "More" button
 *  - "More" opens an overflow drawer with Analytics, Billing, Settings, Sign out
 *
 * Hidden entirely above the `md` breakpoint — the desktop sidebar takes over.
 */

const PRIMARY_TABS = [
  { id: "/dashboard", label: "Home", icon: Grid3x3 },
  { id: "/dashboard/automations", label: "Flows", icon: Bolt },
  { id: "/dashboard/accounts", label: "IG", icon: Instagram },
  { id: "/dashboard/leads", label: "Leads", icon: Users },
];

const MORE_LINKS = [
  { id: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { id: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { id: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const usage = useUsage();

  const isMoreActive = MORE_LINKS.some((l) => pathname.startsWith(l.id));

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawerOpen]);

  async function signOut() {
    const sb = createSupabaseBrowserClient();
    await sb.auth.signOut();
    router.push("/");
  }

  return (
    <>
      {/* Bottom tab bar - always visible on mobile */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white shadow-[0_-4px_16px_-8px_rgba(17,24,39,0.12)] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {PRIMARY_TABS.map(({ id, label, icon: Icon }) => {
          const active = id === "/dashboard" ? pathname === id : pathname.startsWith(id);
          return (
            <Link
              key={id}
              href={id}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-brand" : "text-muted"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-b bg-brand-gradient" />
              )}
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="More menu"
          className={cn(
            "relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium",
            isMoreActive || drawerOpen ? "text-brand" : "text-muted"
          )}
        >
          {isMoreActive && (
            <span className="absolute top-0 left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-b bg-brand-gradient" />
          )}
          <MoreHorizontal size={22} strokeWidth={isMoreActive ? 2.2 : 1.8} />
          <span>More</span>
        </button>
      </nav>

      {/* More drawer - slides up from bottom */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-ink/50 transition-opacity md:hidden",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-2xl border-t border-line bg-white p-5 shadow-2xl transition-transform md:hidden",
          drawerOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <Logo size={22} />
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-md text-muted hover:bg-surface-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* DM usage card */}
        <div className="mb-4 rounded-xl border border-line bg-section-bg p-4">
          <div className="mb-2 flex items-center justify-between text-[13px]">
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
          <div className="h-2 overflow-hidden rounded-full bg-surface-3">
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
          <div className="mt-2 text-[11.5px] uppercase tracking-wider text-subtle">
            Plan · {usage.plan}
          </div>
        </div>

        {/* More nav items */}
        <div className="grid grid-cols-3 gap-2">
          {MORE_LINKS.map(({ id, label, icon: Icon }) => {
            const active = pathname.startsWith(id);
            return (
              <Link
                key={id}
                href={id}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-[13px] font-medium",
                  active
                    ? "border-brand/40 bg-brand/10 text-brand"
                    : "border-line bg-section-bg text-ink"
                )}
              >
                <Icon size={22} />
                {label}
              </Link>
            );
          })}
        </div>

        <button
          onClick={signOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-section-bg p-4 text-[14px] font-semibold text-danger"
        >
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </>
  );
}
