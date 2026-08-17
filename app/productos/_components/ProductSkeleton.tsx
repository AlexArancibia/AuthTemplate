import { Skeleton } from "@/components/ui/skeleton"

export default function ProductSkeleton() {
  return (
    <div className="container-section py-10 md:py-16">
      <div className="content-section grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Image gallery skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-[3/4] w-full rounded-none" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-20 rounded-none" />
            ))}
          </div>
        </div>

        {/* Purchase / info skeleton */}
        <div className="space-y-6 lg:pt-6">
          <Skeleton className="h-3 w-24 rounded-none" />
          <Skeleton className="h-9 w-3/4 rounded-none" />
          <Skeleton className="h-5 w-32 rounded-none" />
          <div className="space-y-2.5 pt-2">
            <Skeleton className="h-4 w-full rounded-none" />
            <Skeleton className="h-4 w-5/6 rounded-none" />
            <Skeleton className="h-4 w-2/3 rounded-none" />
          </div>

          {/* Size swatches */}
          <div className="flex gap-3 pt-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-11 w-20 rounded-none" />
            ))}
          </div>

          <Skeleton className="h-12 w-full rounded-none" />

          {/* Details */}
          <div className="space-y-3 border-t border-border pt-6">
            <Skeleton className="h-4 w-40 rounded-none" />
            <Skeleton className="h-32 w-full rounded-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
