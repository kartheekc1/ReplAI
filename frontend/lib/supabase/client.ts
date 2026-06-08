"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Returns a Supabase client bound to the browser.
 *
 * Safe to call during SSR / prerender even if env vars are missing — we return
 * a placeholder client wired to a non-functional URL so Next.js can finish the
 * static HTML pass. The real env vars get inlined at build time when present,
 * and when the user hydrates client-side, the real client takes over.
 *
 * This matches Next.js's expectation that `process.env.NEXT_PUBLIC_*` is
 * defined at build time, but degrades gracefully if not (e.g. during a CI
 * preview before secrets are wired).
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  return createBrowserClient<Database>(url, key);
}
