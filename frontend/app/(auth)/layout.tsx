import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

/**
 * Auth pages (login / register / forgot-password) are crawlable but low-priority.
 * We explicitly set noindex on the layout so search engines don't index half-empty
 * form pages — they'd outrank real marketing content if we let them.
 *
 * If you'd rather have /register indexed (it's a useful funnel landing page),
 * override `robots` in app/(auth)/register/page.tsx.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-field" />
      <div className="relative z-[1] min-h-screen">
        <header className="container-wide flex h-[var(--nav-h)] items-center">
          <Link href="/"><Logo /></Link>
        </header>
        <main className="container-wide flex min-h-[calc(100vh-var(--nav-h))] items-center justify-center py-10">
          {children}
        </main>
      </div>
    </>
  );
}
