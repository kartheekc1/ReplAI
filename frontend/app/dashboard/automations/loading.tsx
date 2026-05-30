import { GridSkeleton } from "@/components/dashboard/skeletons";

export default function Loading() {
  return <GridSkeleton cards={6} cols={3} />;
}
