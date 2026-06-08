// Lightweight shell - does NOT fetch on every navigation.
// Auth gating happens in middleware.ts before the request reaches this layout.
// Mobile users see a bottom tab bar; tablet/desktop users see the left sidebar.

import type { Metadata } from "next";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { MobileNav } from "@/components/dashboard/mobile-nav";

/**
 * Block search engines from indexing any /dashboard/* route.
 * These pages are auth-gated, user-specific, and have zero SEO value -
 * crawlers would just hit the middleware redirect to /login and waste
 * crawl budget. Sitemap also lists them as low priority and robots.txt
 * disallows them, but per-page `noindex` is the strongest signal.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        {/* pb-24 on mobile leaves room for the fixed bottom tab bar */}
        <main className="flex-1 p-4 pb-24 sm:p-6 md:pb-6 lg:p-7">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
