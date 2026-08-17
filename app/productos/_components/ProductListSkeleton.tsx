import { Skeleton } from "@/components/ui/skeleton"

export default function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:gap-10 xl:gap-12">
      {/* Sidebar skeleton */}
      <aside className="hidden space-y-8 lg:block">
        {[...Array(4)].map((_, section) => (
          <div key={section} className="space-y-3">
            <Skeleton className="h-3 w-28 rounded-none" />
            <div className="space-y-2.5">
              {[...Array(4)].map((_, row) => (
                <Skeleton key={row} className="h-3.5 w-full rounded-none" />
              ))}
            </div>
          </div>
        ))}
      </aside>

      {/* Products skeleton */}
      <div className="min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border pb-5">
          <Skeleton className="h-4 w-32 rounded-none" />
          <Skeleton className="h-9 w-44 rounded-none" />
        </div>

        {/* Grid: 2 / 3 / 4 cols, 3:4 cards */}
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="space-y-3.5">
              <Skeleton className="aspect-[3/4] w-full rounded-none" />
              <Skeleton className="h-2.5 w-1/3 rounded-none" />
              <Skeleton className="h-3.5 w-3/4 rounded-none" />
              <Skeleton className="h-3.5 w-1/4 rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
