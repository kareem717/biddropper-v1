import { Skeleton } from "@/components/shadcn/ui/skeleton";

const FormShellSkeleton = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 py-8 sm:px-12 sm:py-10">
      <Skeleton className=" items flex h-full max-h-[1000px] w-full max-w-screen-md flex-col justify-between rounded-[var(--radius)] bg-muted/60 p-[3%]" />
    </div>
  );
};

export default FormShellSkeleton;
