import { FormSkeleton } from "@/components/skeletons/skeletons";

export default function Loading() {
  return (
    <div className="flex justify-center py-8">
      <FormSkeleton />
    </div>
  );
}
