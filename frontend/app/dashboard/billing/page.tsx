"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { apiClient, ApiError } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const PLANS = [
  { id: "free",    name: "Free",    price: 0,    feats: ["1,000 DMs / month", "1 Instagram account", "Basic analytics"] },
  { id: "starter", name: "Starter", price: 349,  feats: ["Unlimited DMs", "1 Instagram account", "Advanced analytics"] },
  { id: "pro",     name: "Pro",     price: 499,  feats: ["Unlimited DMs", "Up to 4 IG accounts", "AI smart replies"], popular: true },
  { id: "agency",  name: "Agency",  price: 1299, feats: ["Unlimited DMs", "10+ IG accounts", "Team management", "White-label"] },
];

type Invoice = { id: string; razorpay_payment_id: string | null; amount: number; currency: string; status: string; created_at: string; plan: string };

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (resp: Record<string, unknown>) => void) => void;
    };
  }
}

export default function BillingPage() {
  const [current, setCurrent] = useState<string>("free");
  const [loading, setLoading] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);

  useEffect(() => {
    // Load current plan from public.users
    const supabase = createSupabaseBrowserClient();
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase.from("users").select("plan").eq("id", auth.user.id).maybeSingle();
      if (data?.plan) setCurrent(data.plan);
      const { data: pays } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });
      setInvoices((pays as Invoice[] | null) ?? []);
    })();
  }, []);

  async function upgrade(planId: string) {
    if (planId === "free" || planId === current) return;
    setLoading(planId);
    try {
      const order = await apiClient.post<{ id: string; amount: number; currency: string; key_id: string }>(
        "/billing/create-order",
        { plan: planId, currency: "INR" }
      );
      await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      const rzp = new window.Razorpay!({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "ReplAI",
        description: `Upgrade to ${planId.toUpperCase()} plan`,
        order_id: order.id,
        prefill: {},
        handler: async (resp: Record<string, string>) => {
          // Razorpay returned a successful payment — verify the signature server-side
          // before trusting it. The backend recomputes HMAC-SHA256(order_id|payment_id, KEY_SECRET).
          try {
            await apiClient.post("/billing/verify-payment", resp);
            toast.success(`Upgraded to ${planId.toUpperCase()}!`);
            setCurrent(planId);
          } catch {
            toast.error("Payment received but verification failed — please contact support.");
          } finally {
            setLoading(null);
          }
        },
        modal: {
          // User dismissed the modal without paying
          ondismiss: () => {
            setLoading(null);
            toast.info("Checkout cancelled.");
          },
        },
        theme: { color: "#5B5FF8" },
      });

      // Explicit failure event — declined cards, bank rejections, network issues
      rzp.on("payment.failed", (resp: Record<string, unknown>) => {
        const err = resp.error as { description?: string; reason?: string } | undefined;
        toast.error(err?.description ?? err?.reason ?? "Payment failed. Please try again.");
        setLoading(null);
      });

      rzp.open();
    } catch (e) {
      // Surface the real failure — without this every error looked the same
      console.error("[billing.upgrade] failed:", e);
      if (e instanceof ApiError) {
        if (e.status === 503) toast.error("Razorpay isn't configured. Add RAZORPAY_KEY_ID / KEY_SECRET to backend/.env and restart.");
        else if (e.status === 401) toast.error("Backend rejected your session token. Check SUPABASE_JWT_SECRET in backend/.env.");
        else if (e.status === 400) toast.error(`Bad request: ${e.message}`);
        else toast.error(`Backend error ${e.status}: ${e.message.slice(0, 200)}`);
      } else if (e instanceof TypeError) {
        toast.error("Could not reach the backend at " + (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000") + " — is it running?");
      } else {
        toast.error("Checkout failed: " + (e instanceof Error ? e.message : String(e)));
      }
      setLoading(null);
    }
  }

  return (
    <div className="animate-screenIn">
      <Card className="mb-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[12.5px] uppercase tracking-wider text-subtle">Current plan</div>
            <h2 className="mt-1 text-2xl font-bold capitalize">{current}</h2>
            <p className="mt-1 text-sm text-muted">
              {current === "free"
                ? "You're on the free plan. Upgrade anytime to unlock unlimited DMs."
                : "Auto-renews monthly. Cancel anytime."}
            </p>
          </div>
          {current !== "free" && (
            <div className="flex gap-2">
              <Button variant="ghost">Manage payment method</Button>
              <Button variant="danger">Cancel plan</Button>
            </div>
          )}
        </div>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => {
          const active = p.id === current;
          return (
            <div
              key={p.id}
              className={cn(
                "card-rv flex flex-col p-5",
                p.popular && "border-secondary/50 shadow-glow"
              )}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-base font-bold">{p.name}</span>
                {active && <Badge tone="success">Current</Badge>}
              </div>
              <div className="mb-4 mt-2 flex items-baseline gap-1">
                <span className="display text-3xl">₹{p.price.toLocaleString("en-IN")}</span>
                <span className="text-sm text-subtle">/mo</span>
              </div>
              <ul className="mb-5 flex flex-col gap-2 text-[13px] text-muted">
                {p.feats.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-brand" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={p.popular ? "primary" : "ghost"}
                className="w-full"
                disabled={active || loading === p.id || p.id === "free"}
                onClick={() => upgrade(p.id)}
              >
                {loading === p.id ? (
                  <><Loader2 className="animate-spin" size={14} /> Processing…</>
                ) : active ? (
                  "Current plan"
                ) : p.id === "free" ? (
                  "—"
                ) : (
                  "Upgrade"
                )}
              </Button>
            </div>
          );
        })}
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[15px] font-semibold">Payment history</span>
          {invoices && invoices.length > 0 && (
            <Button variant="ghost" size="sm">
              <CreditCard size={14} /> Update card
            </Button>
          )}
        </div>
        {invoices === null ? (
          <div className="space-y-2 p-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-surface-2" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted">No payments yet — your invoices will appear here after your first upgrade.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[12.5px] uppercase tracking-wider text-subtle">
                <th className="pb-3 font-semibold">Reference</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Plan</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-t border-line">
                  <td className="py-3.5 font-mono text-[12.5px]">{i.razorpay_payment_id ?? "—"}</td>
                  <td className="py-3.5 text-muted">{new Date(i.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="py-3.5 capitalize">{i.plan}</td>
                  <td className="py-3.5">₹{(i.amount / 100).toLocaleString("en-IN")}</td>
                  <td className="py-3.5">
                    <Badge tone={i.status === "captured" ? "success" : "warning"}>{i.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.body.appendChild(s);
  });
}
