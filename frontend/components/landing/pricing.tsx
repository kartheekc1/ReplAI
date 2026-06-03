"use client";

import { useState } from "react";
import Link from "next/link";
import { Bolt, Check, Sparkles, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "free",
    name: "Free",
    icon: Bolt,
    m: 0,
    y: 0,
    tag: "For trying it out",
    feats: ["1,000 DMs / month", "1 Instagram account", "1 keyword automation", "Basic analytics"],
    cta: "Start free",
  },
  {
    id: "starter",
    name: "Starter",
    icon: TrendingUp,
    m: 349,
    y: 314, // 10% yearly discount → 349 * 0.9
    tag: "For growing creators",
    feats: ["Unlimited DMs", "1 Instagram account", "Unlimited keywords", "Advanced analytics", "Lead collection forms"],
    cta: "Choose Starter",
  },
  {
    id: "pro",
    name: "Pro",
    icon: Sparkles,
    m: 499,
    y: 449, // 10% yearly discount → 499 * 0.9
    tag: "For serious growth",
    popular: true,
    feats: ["Unlimited DMs", "Up to 4 Instagram accounts", "AI smart replies", "Story automation", "Priority support"],
    cta: "Choose Pro",
  },
  {
    id: "agency",
    name: "Agency",
    icon: Users,
    m: 1299,
    y: 1169, // 10% yearly discount → 1299 * 0.9
    tag: "For teams & agencies",
    feats: ["Unlimited DMs", "10+ Instagram accounts", "Team management", "White-label reports", "Dedicated manager"],
    cta: "Choose Agency",
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section className="section" id="pricing">
      <div className="container-wide">
        <div className="section-head">
          <span className="eyebrow">
            <span className="dot" /> Pricing
          </span>
          <h2 className="display">Simple pricing that scales with you</h2>
          <p className="lead">Indian Rupees · no hidden fees · cancel anytime.</p>
        </div>
        <div className="mb-11 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-line bg-section-bg p-1">
            {["Monthly", "Yearly"].map((l, i) => {
              const on = (i === 1) === yearly;
              return (
                <button
                  key={l}
                  onClick={() => setYearly(i === 1)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-semibold transition-all",
                    on ? "bg-brand-gradient text-white" : "text-muted"
                  )}
                >
                  {l}
                  {i === 1 && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-px text-[11px]",
                        on ? "bg-white/20 text-white" : "bg-brand/10 text-brand"
                      )}
                    >
                      −10%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={cn(
                "card-rv card-rv-hover relative flex flex-col p-6",
                p.popular &&
                  "border-secondary/50 bg-gradient-to-b from-brand/10 to-white shadow-glow"
              )}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-gradient px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                  Most Popular
                </span>
              )}
              <div className="mb-1.5 flex items-center gap-2.5">
                <p.icon size={19} className="text-brand" />
                <span className="text-[17px] font-bold">{p.name}</span>
              </div>
              <div className="mb-5 text-[12.5px] text-subtle">{p.tag}</div>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="display text-[46px]">₹{(yearly ? p.y : p.m).toLocaleString("en-IN")}</span>
                <span className="text-sm text-subtle">/mo</span>
              </div>
              <Button
                variant={p.popular ? "primary" : "ghost"}
                className="mb-6 w-full"
                asChild
              >
                <Link href={p.id === "free" ? "/register" : `/register?plan=${p.id}`}>{p.cta}</Link>
              </Button>
              <ul className="flex flex-col gap-3">
                {p.feats.map((f) => (
                  <li key={f} className="flex gap-2.5 text-[13.5px] text-muted">
                    <Check size={15} className="mt-0.5 shrink-0 text-brand" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
