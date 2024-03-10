import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto mb-20 mt-12 flex max-h-screen max-w-[1920px] flex-col gap-2 p-4 md:gap-6 lg:p-8">
      <Skeleton className="h-[80vh] w-full" />
    </div>
  );
}
