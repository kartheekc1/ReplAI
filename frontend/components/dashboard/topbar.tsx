"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronDown, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/automations": "Automations",
  "/dashboard/accounts": "Instagram accounts",
  "/dashboard/leads": "Lead management",
  "/dashboard/analytics": "Analytics",
  "/dashboard/billing": "Billing & plans",
  "/dashboard/settings": "Settings",
};

function deriveTitle(pathname: string): string {
  const matched = Object.keys(TITLES)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname.startsWith(k)) ?? "/dashboard";
  return TITLES[matched];
}

export function Topbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; initials: string } | null>(null);

  // Fetch user info client-side. This is async + non-blocking, so the topbar
  // skeleton renders instantly and the name/initials fill in once auth resolves.
  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const meta = data.user.user_metadata as { name?: string } | null;
      const fullName = meta?.name ?? data.user.email?.split("@")[0] ?? "Member";
      const firstName = fullName.split(" ")[0];
      const initials = fullName
        .split(" ")
        .map((w) => w[0]?.toUpperCase())
        .join("")
        .slice(0, 2);
      setUser({ name: firstName, initials });
    });
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/85 px-7 backdrop-blur-xl">
      <h1 className="text-[19px] font-semibold">{deriveTitle(pathname)}</h1>
      <div className="flex items-center gap-3.5">
        <div className="hidden items-center gap-2 rounded-md border border-line bg-surface-2 px-3 py-2 md:flex md:w-[220px]">
          <Search size={16} className="text-subtle" />
          <input
            placeholder="Search…"
            className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-subtle"
          />
        </div>
        <button className="relative grid h-10 w-10 place-items-center rounded-md border border-line bg-surface-2 text-muted">
          <Bell size={17} />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-brand ring-2 ring-section-bg" />
        </button>
        <div className="flex cursor-pointer items-center gap-2.5 rounded-full border border-line bg-surface-2 py-1.5 pl-1.5 pr-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-gradient text-[12px] font-bold text-white">
            {user?.initials ?? <span className="h-3 w-4 animate-pulse rounded bg-white/30" />}
          </span>
          <span className="text-[13.5px] font-semibold">
            {user?.name ?? <span className="inline-block h-3 w-12 animate-pulse rounded bg-surface-3" />}
          </span>
          <ChevronDown size={15} className="text-subtle" />
        </div>
      </div>
    </header>
  );
}
