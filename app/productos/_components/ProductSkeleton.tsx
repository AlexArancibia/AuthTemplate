import { Skeleton } from "@/components/ui/skeleton"

export default function ProductSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-8 lg:gap-12">
        <div className="space-y-8">
          {/* Product Info Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-32" />
          </div>

          {/* Product Images and Purchase Options Skeleton */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-md" />
                ))}
              </div>
            </div>

            {/* Purchase Options Skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>

          {/* Product Details Tabs Skeleton */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    </div>
  )
}

