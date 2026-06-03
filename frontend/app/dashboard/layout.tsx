// Lightweight shell — does NOT fetch on every navigation.
//
// Auth gating happens in middleware.ts before the request even reaches this layout.
// User info (name/initials for the topbar) is fetched client-side, which means
// the shell HTML renders instantly and the topbar fills in async.

import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
