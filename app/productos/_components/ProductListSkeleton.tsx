import { Skeleton } from "@/components/ui/skeleton"

export default function ProductListSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <Skeleton className="h-[600px] w-full" />
      </aside>

      {/* Products skeleton */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

