"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { usePageBuilderHeroSlides } from "@/hooks/usePageBuilderHeroSlides"
import { HeroCarouselBase } from "./HeroCaruselBase"

export function HeroSectionPageBuilder() {
  const { data, loading, error } = usePageBuilderHeroSlides()

  if (loading) {
    return (
      <div className="w-full h-[92vh] bg-gray-100/30">
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  if (error) {
    return null
  }

  if (!data || data.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-black overflow-hidden -mt-[60px] md:-mt-[80px] sm:-mt-[100px] lg:mt-0">
      <HeroCarouselBase heroSections={data} autoplayInterval={10000} containerHeight="100vh" />
    </div>
  )
}
