import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export function FinalCTA() {
  return (
    <section className="section">
      <div className="container-wide">
        <div className="card-rv relative overflow-hidden bg-gradient-to-br from-brand to-secondary p-6 text-center text-white sm:p-10 lg:p-12">
          <div className="absolute inset-0 opacity-30" style={{ background: "var(--grad)" }} />
          <div className="relative">
            <h2 className="display mb-4 text-white" style={{ fontSize: "clamp(26px, 4vw, 52px)" }}>
              Ready to automate your <br className="hidden md:block" />
              Instagram growth?
            </h2>
            <p className="mx-auto mb-8 max-w-[520px] text-white/85">
              Join 10,000+ creators turning every comment into a conversation. Free 14-day trial, no card.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-white text-brand hover:bg-white/95"
                asChild
              >
                <Link href="/register">
                  Start free trial <ArrowRight size={17} />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                asChild
              >
                <Link href="#demo">Book demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FOOTER_COLS = [
  {
    title: "Product",
    links: [
      ["Features", "#features"],
      ["Pricing", "#pricing"],
      ["Changelog", "#"],
      ["Roadmap", "#"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Blog", "#"],
      ["API docs", "#"],
      ["Help center", "#"],
      ["Status", "#"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "#"],
      ["Careers", "#"],
      ["Contact", "#"],
      ["Press", "#"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy policy", "/privacy"],
      ["Terms & conditions", "/terms"],
      ["Contact", "mailto:support@getreplai.in"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-section-bg pb-10 pt-16">
      <div className="container-wide">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-[280px] text-[13.5px] text-muted">
              The fastest way to turn Instagram comments into customers. Built for creators, agencies, and
              brands. Powered by AI.
            </p>
          </div>
          {FOOTER_COLS.map((c) => (
            <div key={c.title}>
              <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-wider text-subtle">
                {c.title}
              </div>
              <ul className="flex flex-col gap-2.5">
                {c.links.map(([l, h]) => (
                  <li key={l}>
                    <Link
                      href={h}
                      className="text-sm text-muted transition-colors hover:text-ink"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 sm:flex-row">
          <p className="text-[12.5px] text-subtle">
            © {new Date().getFullYear()} ReplAI Inc. All rights reserved.
          </p>
          <p className="text-[12.5px] text-subtle">
            Built with ♥ for creators · Made in Bangalore & Berlin
          </p>
        </div>
      </div>
    </footer>
  );
}
