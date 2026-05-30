"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  ["Features", "#features"],
  ["How it works", "#how"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex h-[var(--nav-h)] items-center transition-all",
        scrolled
          ? "border-b border-line bg-white/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="container-wide flex items-center justify-between">
        <Link href="/" aria-label="ReplyVerse">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-[14.5px] font-medium text-muted transition-colors hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-[14px] font-semibold text-muted hover:text-ink md:inline">
            Sign in
          </Link>
          <Button variant="primary" asChild>
            <Link href="/register">Start free trial</Link>
          </Button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-md border border-line bg-surface-2 md:hidden"
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="absolute inset-x-4 top-[calc(var(--nav-h)-6px)] flex flex-col gap-1 rounded-lg border border-line bg-white p-3 shadow-md md:hidden">
          {LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-surface-2"
            >
              {label}
            </a>
          ))}
          <Link href="/login" className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-surface-2">
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}
