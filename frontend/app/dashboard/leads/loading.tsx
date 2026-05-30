import { CardSkeleton, Skel } from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skel className="h-10 w-80" />
        <Skel className="h-10 w-32" />
      </div>
      <CardSkeleton rows={8} />
    </div>
  );
}
