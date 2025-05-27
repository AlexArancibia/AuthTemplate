"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import { useMainStore } from "@/stores/mainStore"
import type { Content } from "@/types/content"
import { Sidebar } from "./_components/Sidebar"
import { BlogContent } from "../_components/BlogContent"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

export default function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { contents, loading } = useMainStore()
  const [currentContent, setCurrentContent] = useState<Content | null>(null)

  useEffect(() => {
    const loadContent = async () => {
      if (contents) {
      const content = contents.find((c) => c.slug === resolvedParams.id)
      setCurrentContent(content || null)
      }
 
      
    }
    loadContent()
  }, [contents, resolvedParams.id])

  if (loading || !currentContent) {
    return <BlogPostSkeleton />
  }

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  }

  return (
    <main className="min-h-screen bg-white md:bg-muted/80 pb-16">
      <div className="container-section py-16 md:py-16 bg-[url('/fondoproduct.jpg')] bg-cover">
        <motion.div className="content-section text-left" {...fadeIn}>
          <h2 className="text-white text-3xl lg:text-5xl mb-2">{currentContent.title}</h2>
          {/* <p className="text-white/90 text-lg">
            {currentContent.author?.firstName} {currentContent.author?.lastName}
          </p> */}
        </motion.div>
      </div>

      <div className="container-section">
        <motion.div className="content-section" {...fadeIn}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-2 mt-16">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Hero Image */}
                <div className="relative h-[300px] md:h-[400px]">
                  <Image
                    src={currentContent.featuredImage || "/avatar.svg"}
                    alt={currentContent.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-1.5 md:p-8">
                  {/* Meta */}
                  <div className="flex items-center gap-4 mb-4 mt-4">
                    <Image
                      src={currentContent.metadata?.author?.avatar || "/avatar.svg"}
                      alt={currentContent.metadata?.author?.name || ""}
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-medium">{currentContent.metadata?.author?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {currentContent.metadata?.author?.role} •{" "}
                        {new Date(currentContent.publishedAt!).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
 

                  {/* Article Content */}
                  <BlogContent content={currentContent.body || ""} />
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1 mt-6 md:mt-16">
              <Sidebar />
            </aside>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

function BlogPostSkeleton() {
  return (
    <div className="min-h-screen bg-muted">
      <div className="container-section py-16 md:py-16 bg-[url('/fondoproduct.jpg')] bg-cover">
        <div className="content-section text-left">
          <Skeleton className="w-3/4 h-10 bg-white/20 mb-2" />
          <Skeleton className="w-1/2 h-6 bg-white/20" />
        </div>
      </div>
      <div className="container-section py-8">
        <div className="content-section">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="w-full h-[400px]" />
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-48 h-3" />
                  </div>
                </div>
                <Skeleton className="w-3/4 h-8" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-2/3 h-4" />
              </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <Skeleton className="w-full h-[200px]" />
              <Skeleton className="w-full h-[300px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

