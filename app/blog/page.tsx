"use client"

import { useEffect, useState } from "react"
import { useMainStore } from "@/stores/mainStore"
import { Skeleton } from "@/components/ui/skeleton"
import { PostCard } from "./_components/PostCard"
import { FeaturedContent } from "./_components/FeaturedPost"
import { Button } from "@/components/ui/button"

export default function BlogPage() {
  const { contents, fetchContents, loading, paginationMeta } = useMainStore()
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchContents({ 
      page: currentPage, 
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }, [currentPage, fetchContents])

  const filteredContents = contents.filter(content => content.type !== "PAGE")
  const featuredPost = filteredContents[0]

  if (loading) {
    return <BlogSkeleton />
  }

  return (
    <main className="bg-gray-50">
      <div className="container-section py-8">
        <div className="content-section">
          {/* Featured Post */}
          {featuredPost && <FeaturedContent content={featuredPost} />}

          {/* Regular Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {filteredContents.map((content, index) => (
              <PostCard key={content.id} content={content} index={index} />
            ))}
          </div>

          {/* Paginación */}
          {paginationMeta.contents && paginationMeta.contents.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={!paginationMeta.contents.hasPrev || loading}
              >
                Anterior
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Página {paginationMeta.contents.page} de {paginationMeta.contents.totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!paginationMeta.contents.hasNext || loading}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function BlogSkeleton() {
  return (
    <div className="container-section py-8">
      <div className="content-section">
        <Skeleton className="w-full h-[400px] mb-16" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="w-full h-[200px]" />
              <Skeleton className="w-3/4 h-6" />
              <Skeleton className="w-1/2 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
