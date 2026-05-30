import Link from "next/link";
import { Logo } from "@/components/shared/logo";

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
