"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useMainStore } from "@/stores/mainStore"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const { fetchContents, fetchCategories, contents, categories, loading } = useMainStore()

  useEffect(() => {
    fetchContents()
    fetchCategories()
  }, [fetchContents, fetchCategories])

  if (loading) {
    return <SidebarSkeleton />
  }

  const getExcerpt = (body: string | undefined, maxLength = 100) => {
    if (!body) return ""
    // Convertir HTML a texto plano
    const text = body.replace(/<[^>]*>/g, "")
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
  }

  // Filtrar los contenidos para excluir los de tipo "PAGE"
  const filteredContents = contents.filter(post => post.type !== "PAGE")

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 lg:p-8 space-y-8 sticky top-0 z-[10]">
      <h2 className="text-xl font-semibold mb-4">Artículos Recientes</h2>

      {/* Recent Posts */}
      <div className="space-y-6 ">
        {filteredContents.slice(0, 5).map((post, index) => {
          const badgeColors = [
            "bg-orange-100 text-orange-800",
            "bg-purple-100 text-purple-800",
            "bg-blue-100 text-blue-800",
            "bg-green-100 text-green-800",
          ]
          const badgeColor = badgeColors[index % badgeColors.length]

          return (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <article className="flex flex-col sm:flex-row sm:space-x-4">
                <Image
                  src={post.featuredImage || "/placeholder.svg"}
                  alt={post.title}
                  width={100}
                  height={100}
                  className="rounded-lg object-cover w-full sm:w-[100px] h-[100px] mb-2 sm:mb-0"
                />
                <div className="flex-1 space-y-2">
                  <Badge variant="secondary" className={cn("font-normal", badgeColor)}>
                    {post.type}
                  </Badge>
                  <h4 className="font-medium text-base leading-snug group-hover:text-primary transition-colors">{post.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{getExcerpt(post.body)}</p>
                </div>
              </article>
            </Link>
          )
        })}
      </div>

      {filteredContents.length > 0 && (
        <Link href="/blog" className="inline-flex items-center text-sm text-primary hover:underline transition-colors">
          Ver más
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8 space-y-8">
      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:space-x-4">
            <div className="w-full sm:w-[100px] h-[100px] bg-gray-200 rounded-lg animate-pulse mb-2 sm:mb-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
    </div>
  )
}