import { Skeleton } from "@/ui/Skeleton";

export default function ProductRowSkeleton() {
  return (
    <div className="w-full flex flex-col md:flex-row gap-8 items-start">
      <div className="shrink-0 md:w-55 flex flex-col gap-3 pt-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 min-w-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="w-full h-64 rounded-xl" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>)}