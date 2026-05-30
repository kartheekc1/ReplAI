import { CardSkeleton, StatsRowSkeleton } from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <StatsRowSkeleton n={4} />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={3} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={4} />
      </div>
    </div>
  );
}
