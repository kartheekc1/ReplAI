"use client";

/**
 * Lazy wrappers around Recharts.
 *
 * Recharts is ~100KB minified — loading it on every dashboard page bloats the
 * critical path and slows time-to-interactive. These wrappers code-split the
 * chart library into a separate chunk that only downloads when a page needs
 * a chart, and only renders client-side (Recharts doesn't SSR cleanly anyway).
 */

import dynamic from "next/dynamic";
import { Skel } from "@/components/dashboard/skeletons";

const ChartLoading = ({ height = 200 }: { height?: number }) => (
  <Skel className="w-full rounded-md" style={{ height }} />
);

export const AreaChart = dynamic(
  () => import("./charts").then((m) => m.AreaChart),
  { ssr: false, loading: () => <ChartLoading height={210} /> }
);

export const BarChart = dynamic(
  () => import("./charts").then((m) => m.BarChart),
  { ssr: false, loading: () => <ChartLoading height={180} /> }
);

export const Donut = dynamic(
  () => import("./charts").then((m) => m.Donut),
  { ssr: false, loading: () => <ChartLoading height={170} /> }
);

// Sparkline is tiny pure SVG with no recharts dependency — re-export directly
// so it stays in the main bundle (used by stat cards, can't tolerate a hydration delay).
export { Sparkline } from "./charts";
