"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// DM quotas per plan (matches backend razorpay_client.PRICING_INR).
// `null` means unlimited.
const PLAN_LIMITS: Record<string, number | null> = {
  free: 1000,
  starter: null,
  pro: null,
  agency: null,
};

export type Usage = {
  plan: string;
  sent: number;
  limit: number | null;
  percent: number;
  unlimited: boolean;
  loading: boolean;
};

/**
 * Returns this month's DM usage for the signed-in user.
 * Reloads when called from any component on mount — TanStack Query callers can layer caching on top.
 */
export function useUsage(): Usage {
  const [state, setState] = useState<Usage>({
    plan: "free",
    sent: 0,
    limit: PLAN_LIMITS.free!,
    percent: 0,
    unlimited: false,
    loading: true,
  });

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    let alive = true;

    (async () => {
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user || !alive) return;

      // First day of the current month, in UTC
      const now = new Date();
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

      const [{ data: userRow }, { count }] = await Promise.all([
        sb.from("users").select("plan").eq("id", auth.user.id).maybeSingle(),
        sb
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("user_id", auth.user.id)
          .eq("status", "sent")
          .gte("sent_at", monthStart),
      ]);

      if (!alive) return;
      const plan = (userRow?.plan as string) ?? "free";
      const limit = PLAN_LIMITS[plan];
      const sent = count ?? 0;
      const unlimited = limit === null;
      const percent = unlimited || !limit ? 0 : Math.min(100, Math.round((sent / limit) * 100));

      setState({ plan, sent, limit, percent, unlimited, loading: false });
    })();

    return () => {
      alive = false;
    };
  }, []);

  return state;
}
