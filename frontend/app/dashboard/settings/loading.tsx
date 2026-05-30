import { CardSkeleton, Skel } from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skel className="h-10 w-80" />
      <CardSkeleton rows={4} />
    </div>
  );
}
