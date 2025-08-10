"use client"

import { Button } from "@/components/ui/button"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"

const brands = [
  { name: "Dr. Neubauer", logo: "/dr-neubauer-logo.png" },
  { name: "VICTAS", logo: "/victas-logo.png" },
  { name: "SANWEI", logo: "/sanwei-logo.png" },
  { name: "Butterfly", logo: "/butterfly-logo.png" },
  { name: "XIOM", logo: "/xiom-logo.png" },
]

export function PublishBrands() {
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

    // Calcular el ancho de una sola pasada de logos
    const calcSingleListWidth = () => {
      if (carousel.children.length > 0) {
        let width = 0
        for (let i = 0; i < brands.length; i++) {
          width += (carousel.children[i] as HTMLElement).offsetWidth + 32 // gap-8 = 2rem = 32px
        }
        return width
      }
      return 0
    }

    const autoScroll = () => {
      if (!singleListWidth) singleListWidth = calcSingleListWidth()
      if (carousel.scrollLeft >= singleListWidth) {
        // Resetear scroll al inicio (sin salto visual)
        carousel.scrollLeft = 0
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

    const stopAutoScroll = () => {
      cancelAnimationFrame(animationId)
    }

    startAutoScroll()
    carousel.addEventListener('mouseenter', stopAutoScroll)
    carousel.addEventListener('mouseleave', startAutoScroll)

    return () => {
      cancelAnimationFrame(animationId)
      carousel.removeEventListener('mouseenter', stopAutoScroll)
      carousel.removeEventListener('mouseleave', startAutoScroll)
    }
  }, [isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0))
    setScrollLeft(carouselRef.current?.scrollLeft || 0)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 2
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeft - walk
    }
  }

  const handleWhatsAppClick = () => {
    const whatsappUrl = "https://api.whatsapp.com/send/?phone=%2B51986607951&text&type=phone_number&app_absent=0"
    window.open(whatsappUrl, '_blank')
  }

  return (
    <section className="w-full flex flex-col items-center justify-center py-16 bg-transparent">
      {/* Container Section */}
      <div className="container-section">
        {/* Content Section */}
        <div className="content-section">  
          {/* Banner informativo con fondo y gradiente */}
          <div
            className="relative w-full max-w-6xl mx-auto rounded-2xl overflow-hidden mb-16"
            style={{ minHeight: '500px' }}
          >
            <Image
              src="/publishBrands.webp"
              alt="Background marcas"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-purple-900/60 to-blue-900/80" />
            <div className="relative z-10 p-10 md:p-16 flex flex-col justify-center h-full w-1/2">
              <h2
                className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-wider"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                DESCUBRE EL EQUIPO PERFECTO PARA TI
              </h2>
              <p
                className="text-lg md:text-xl text-gray-200 mb-8 max-w-md font-normal"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                ¿No sabes qué elegir? Contáctanos para recibir recomendaciones personalizadas. ¡Estamos aquí para ayudarte!
              </p>
              <Button
                onClick={handleWhatsAppClick}
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 w-fit"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                CONTACTA UN ASESOR ➚
              </Button>
            </div>
          </div>

          {/* Carrusel de marcas */}
          <div className="w-full max-w-6xl mx-auto bg-white rounded-xl p-8">
            <div
              ref={carouselRef}
              className="flex gap-8 overflow-x-auto scrollbar-hide select-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              {logosLoop.map((brand, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 flex items-center justify-center min-w-[200px] cursor-grab active:cursor-grabbing"
                  style={{ userSelect: 'none' }}
                >
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={80}
                        height={80}
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
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
    </section>
  )
} 