"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

export function BrandsCarousel() {
  const brands = [
    { name: "Dr. Neubauer", logo: "/dr-neubauer-logo.png" },
    { name: "VICTAS", logo: "/victas-logo.png" },
    { name: "SANWEI", logo: "/sanwei-logo.png" },
    { name: "Butterfly", logo: "/butterfly-logo.png" },
    { name: "XIOM", logo: "/xiom-logo.png" },
  ]

  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Duplicar los logos para efecto loop
  const logosLoop = [...brands, ...brands]

  // Auto-scroll infinito
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    let animationId: number
    let scrollSpeed = 1
    let singleListWidth = 0

    const calcSingleListWidth = () => {
      if (carousel.children.length > 0) {
        let width = 0
        for (let i = 0; i < brands.length; i++) {
          width += (carousel.children[i] as HTMLElement).offsetWidth + 32 // gap-8 = 32px
        }
        return width
      }
      return 0
    }

    const autoScroll = () => {
      if (!singleListWidth) singleListWidth = calcSingleListWidth()
      if (carousel.scrollLeft >= singleListWidth) {
        carousel.scrollLeft = 0 // reset sin salto
      } else {
        carousel.scrollLeft += scrollSpeed
      }
      animationId = requestAnimationFrame(autoScroll)
    }

    const startAutoScroll = () => {
      if (!isDragging) {
        animationId = requestAnimationFrame(autoScroll)
      }
    }

    const stopAutoScroll = () => cancelAnimationFrame(animationId)

    startAutoScroll()
    carousel.addEventListener("mouseenter", stopAutoScroll)
    carousel.addEventListener("mouseleave", startAutoScroll)

    return () => {
      cancelAnimationFrame(animationId)
      carousel.removeEventListener("mouseenter", stopAutoScroll)
      carousel.removeEventListener("mouseleave", startAutoScroll)
    }
  }, [isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0))
    setScrollLeft(carouselRef.current?.scrollLeft || 0)
  }

  const handleMouseLeave = () => setIsDragging(false)
  const handleMouseUp = () => setIsDragging(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 2
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeft - walk
    }
  }

  return (
    <section className="w-full flex flex-col items-center justify-center py-0 bg-transparent">
      <div className="container-section">
        <div className="content-section">
            <div className="w-full max-w-[100rem] mx-auto bg-white rounded-xl p-8">
            <div
              ref={carouselRef}
              className="flex gap-8 overflow-x-auto scrollbar-hide select-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              {logosLoop.map((brand, index) => (
                <div
                  key={`${brand.name}-${index}`}
                  className="flex-shrink-0 flex items-center justify-center min-w-[300px] cursor-grab active:cursor-grabbing"
                  style={{ userSelect: "none" }}
                >
                  <div className="text-center">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 mx-auto mb-4 flex items-center justify-center">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={500}
                        height={500}
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `<span class='font-bold text-lg'>${brand.name}</span>`
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>
      </div>
    </section>
  )
}
