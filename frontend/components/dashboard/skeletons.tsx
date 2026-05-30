// Reusable skeleton primitives — rendered instantly during route transitions
// so the dashboard never looks "frozen" while Next.js compiles the next page in dev.

import { cn } from "@/lib/utils";

export function Skel({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-2", className)} />;
}

export function StatCardSkeleton() {
  return (
    <div className="card-rv p-5">
      <div className="flex items-center justify-between">
        <Skel className="h-10 w-10 rounded-[10px]" />
        <Skel className="h-4 w-12" />
      </div>
      <Skel className="mt-4 h-7 w-24" />
      <div className="mt-3 flex justify-between">
        <Skel className="h-3 w-20" />
        <Skel className="h-5 w-16" />
      </div>
    </div>
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card-rv space-y-3 p-5">
      <Skel className="h-5 w-40" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skel key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function StatsRowSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: n }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function GridSkeleton({ cards = 6, cols = 3 }: { cards?: number; cols?: number }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="card-rv space-y-3 p-5">
          <Skel className="h-10 w-10 rounded-[10px]" />
          <Skel className="h-5 w-3/4" />
          <Skel className="h-3 w-1/2" />
          <div className="space-y-2 pt-2">
            <Skel className="h-3 w-full" />
            <Skel className="h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
