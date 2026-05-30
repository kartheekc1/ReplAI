import { GridSkeleton } from "@/components/dashboard/skeletons";

export default function Loading() {
  return <GridSkeleton cards={3} cols={3} />;
}
