import { CardSkeleton, GridSkeleton, Skel } from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <div className="space-y-5">
      <Skel className="h-4 w-24" />
      <div className="card-rv flex items-center gap-5 p-6">
        <Skel className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skel className="h-7 w-48" />
          <Skel className="h-3 w-64" />
          <Skel className="h-3 w-80" />
        </div>
      </div>
      <CardSkeleton rows={1} />
      <GridSkeleton cards={6} cols={3} />
    </div>
  );
}
