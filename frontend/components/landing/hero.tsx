"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bolt,
  Check,
  MessageCircle,
  Play,
  Send,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/shared/charts";

const FEED = [
  { u: "maya.styles", t: 'what\'s the link?? 😍', k: "link" },
  { u: "the.fitnerd", t: "price please!", k: "price" },
  { u: "cafe.lumen", t: "send details 🙌", k: "details" },
  { u: "joel.makes", t: "drop the link 🔥", k: "link" },
];

function FloatCard({
  className,
  tone,
  icon,
  title,
  sub,
  style,
}: {
  className?: string;
  tone: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`hidden md:flex absolute z-[3] items-center gap-3 rounded-2xl border border-line-2 bg-white/72 px-4 py-2.5 shadow-md backdrop-blur-xl animate-floaty ${className ?? ""}`}
      style={style}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white"
        style={{ background: tone, boxShadow: `0 6px 16px -6px ${tone}` }}
      >
        {icon}
      </span>
      <div>
        <div className="text-[13px] font-bold leading-tight">{title}</div>
        <div className="text-[11.5px] text-muted">{sub}</div>
      </div>
    </div>
  );
}

function HeroMockup() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((x) => x + 1), 2600);
    return () => clearInterval(t);
  }, []);
  const visible = [0, 1, 2].map((i) => FEED[(n + i) % FEED.length]);
  const stats = [
    { label: "Comments received", value: "48,210", icon: MessageCircle, spark: [12, 18, 15, 22, 28, 25, 34, 38], up: "+18%" },
    { label: "DMs sent", value: "46,884", icon: Send, spark: [10, 14, 20, 19, 26, 30, 33, 40], up: "+22%" },
    { label: "Leads generated", value: "9,317", icon: Target, spark: [4, 6, 5, 9, 11, 14, 13, 18], up: "+31%" },
    { label: "Conversion rate", value: "19.8%", icon: TrendingUp, spark: [8, 9, 11, 10, 13, 15, 17, 19], up: "+4.2pt" },
  ];

  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <span className="font-mono text-[12.5px] text-subtle">app.replai.io</span>
        <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
          <span className="live-dot" /> Live
        </span>
      </div>
      <div className="mb-3.5 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[13px] border border-line bg-section-bg p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
                <s.icon size={15} className="text-brand" />
                {s.label}
              </span>
            </div>
            <div className="flex items-end justify-between gap-2">
              <span className="font-display text-[27px] leading-none">{s.value}</span>
              <div className="text-right">
                <Sparkline data={s.spark} width={64} height={24} />
                <span className="text-[11px] font-semibold text-success">{s.up}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-[13px] border border-line bg-white p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[12.5px] font-semibold text-muted">Live automation feed</span>
          <span className="chip-mono">keyword triggers</span>
        </div>
        <div className="flex flex-col gap-2">
          {visible.map((f, i) => (
            <motion.div
              key={`${n}-${i}`}
              initial={i === 0 ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1 - i * 0.18, y: 0 }}
              className={`flex items-center gap-2.5 rounded-[10px] border px-2.5 py-2 ${
                i === 0
                  ? "border-brand/30 bg-brand/10"
                  : "border-line bg-section-bg"
              }`}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-gradient text-[11px] font-bold text-white">
                {f.u.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold">
                  @{f.u} <span className="font-normal text-muted">commented &quot;{f.t}&quot;</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-success">
                  <Check size={12} /> DM sent · matched <span className="chip-mono">{f.k}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="pt-[calc(var(--nav-h)+70px)] pb-20">
      <div className="container-wide grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <span className="eyebrow">
            <span className="dot" /> Instagram DM automation
          </span>
          <h1
            className="display mb-5 mt-5"
            style={{ fontSize: "clamp(40px, 5vw, 66px)" }}
          >
            Turn Instagram comments into customers <em>automatically</em>
          </h1>
          <p className="lead max-w-[520px]">
            Automatically send DMs when followers comment keywords like{" "}
            <span className="chip-mono">link</span>,{" "}
            <span className="chip-mono">price</span>, or{" "}
            <span className="chip-mono">details</span> on your posts and reels.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" size="lg" asChild>
              <Link href="/register">
                Start free trial <ArrowRight size={17} />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="#demo">
                <Play size={15} /> Watch demo
              </Link>
            </Button>
          </div>
          <div className="mt-7 flex items-center gap-5 text-[13px] text-subtle">
            <span className="inline-flex items-center gap-1.5">
              <Check size={15} /> No credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={15} /> Free 14-day trial
            </span>
          </div>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <HeroMockup />
          <FloatCard
            tone="#5B5FF8"
            icon={<MessageCircle size={16} />}
            title="New comment"
            sub='Matched "link"'
            style={{ top: -22, left: -38, animationDelay: "0s" }}
          />
          <FloatCard
            tone="#7C3AED"
            icon={<Bolt size={16} />}
            title="Automation triggered"
            sub="Flow · Link in comments"
            style={{ top: "42%", right: -46, animationDelay: "1.1s" }}
          />
          <FloatCard
            tone="#00C2A8"
            icon={<Check size={16} />}
            title="DM sent successfully"
            sub="Delivered · just now"
            style={{ bottom: 14, left: -34, animationDelay: "2.1s" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
