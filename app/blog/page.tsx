"use client"

import { useEffect } from "react"
import { useMainStore } from "@/stores/mainStore"
import { Skeleton } from "@/components/ui/skeleton"
import { PostCard } from "./_components/PostCard"
import { FeaturedContent } from "./_components/FeaturedPost"

export default function BlogPage() {
  const { contents, fetchContents, loading } = useMainStore()

 

  const filteredContents = contents
    .filter(content => content.type !== "PAGE")
    .reverse() // Invierte el orden de los posts

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
