import { CardSkeleton, StatsRowSkeleton } from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <StatsRowSkeleton n={4} />
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <CardSkeleton rows={5} />
        <CardSkeleton rows={4} />
      </div>
      <CardSkeleton rows={6} />
    </div>
  );
}
