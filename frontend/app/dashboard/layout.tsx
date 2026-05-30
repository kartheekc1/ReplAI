import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Force this layout to render on every request so auth stays fresh,
// but keep the work minimal — every extra fetch here multiplies across all child routes.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const meta = data.user.user_metadata as { name?: string } | null;
  const name = meta?.name ?? data.user.email?.split("@")[0] ?? "Member";
  const initials = name
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={{ name: name.split(" ")[0], initials }} />
        <main className="flex-1 p-7">{children}</main>
      </div>
    </div>
  );
}
