import { CardSkeleton } from "@/components/skeletons/skeletons";

export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
