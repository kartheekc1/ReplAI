// Lightweight shell - does NOT fetch on every navigation.
// Auth gating happens in middleware.ts before the request reaches this layout.
// Mobile users see a bottom tab bar; tablet/desktop users see the left sidebar.

import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { MobileNav } from "@/components/dashboard/mobile-nav";

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
