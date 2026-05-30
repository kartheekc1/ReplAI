import { CardSkeleton, GridSkeleton } from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <div className="space-y-5">
      <CardSkeleton rows={1} />
      <GridSkeleton cards={4} cols={4} />
      <CardSkeleton rows={4} />
    </div>
  );
}
