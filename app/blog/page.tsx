"use client"

import { useEffect, useRef } from "react"
import { useMainStore } from "@/stores/mainStore"
import { Skeleton } from "@/components/ui/skeleton"
import { PostCard } from "./_components/PostCard"
import { FeaturedContent } from "./_components/FeaturedPost"

export default function BlogPage() {
  // Optimización: Usar selectores específicos para evitar re-renders innecesarios
  const contents = useMainStore(state => state.contents)
  const fetchContents = useMainStore(state => state.fetchContents)
  const loading = useMainStore(state => state.loading)
  const fetchAttempted = useRef(false)

  // Fetch de los contenidos del blog
  useEffect(() => {
    // Si ya hay contenidos cargados, no hacer fetch
    if (Array.isArray(contents) && contents.length > 0) {
      return
    }

    // Evitar múltiples intentos de fetch
    if (fetchAttempted.current) return

    const loadContents = async () => {
      try {
        fetchAttempted.current = true
        await fetchContents()
      } catch (err) {
        // Error silencioso, ya que el estado de loading del store manejará el error
      }
    }

    loadContents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contents])

  // Ensure contents is an array before filtering
  const contentsArray = Array.isArray(contents) ? contents : []
  const filteredContents = contentsArray
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
          {/* H1 principal para la página */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">Blog y Noticias</h1>
          
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
