"use client"

import { motion } from "framer-motion"
import type { HeroSection as HeroSectionType } from "@/types/heroSection"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface HeroSlideProps {
  heroSection: HeroSectionType
  animationDelay?: number
  slideIndex?: number
}

export function HeroSlide({ heroSection, animationDelay = 0, slideIndex = 0 }: HeroSlideProps) {
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [hasVideoError, setHasVideoError] = useState(false)

  // Determinar qué logo mostrar según el índice del slide
  const getLogoPath = () => {
    if (slideIndex === 0) {
      return "/logosHeroSection/xiom-1-768x179.png 13.png"
    } else if (slideIndex === 1) {
      return "/logosHeroSection/Butterfly_brand_logo.svg 4.png"
    }
    return null
  }

  const logoPath = getLogoPath()

  // Extraer propiedades principales
  const {
    title,
    subtitle,
    backgroundImage,
    mobileBackgroundImage,
    backgroundVideo,
    mobileBackgroundVideo,
    buttonText,
    buttonLink,
    styles = {},
  } = heroSection

  // Determinar imagen de fondo a usar
  const bgImage = mobileBackgroundImage || backgroundImage

  // Obtener estilo de overlay (solo colores)
  const getOverlayStyle = () => {
    if (styles.overlayType === "none") return {}

    if (styles.overlayType === "gradient" && styles.overlayGradient) {
      const { colorStart, colorEnd, angle } = styles.overlayGradient
      return { background: `linear-gradient(${angle}deg, ${colorStart}, ${colorEnd})` }
    }

    return { backgroundColor: styles.overlayColor || "rgba(0,0,0,0.3)" }
  }

  // Extraer ID de YouTube si es necesario
  const getYouTubeId = (url: string) => {
    if (!url) return null

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    return match && match[2].length === 11 ? match[2] : null
  }

  const youtubeId = backgroundVideo ? getYouTubeId(backgroundVideo) : null
  const mobileYoutubeId = mobileBackgroundVideo ? getYouTubeId(mobileBackgroundVideo) : null
  const hasVideo = Boolean(youtubeId)

  // Clases para el contenedor principal
  const containerClasses = `
    relative w-full h-full
    ${styles.height?.mobile || ""} 
    md:${styles.height?.tablet || ""} 
    lg:${styles.height?.desktop || ""}
  `;

  // Clases para la imagen de fondo
  const backgroundImageClasses = `object-cover ${styles.backgroundSize || ""} object-center`

  // Clases para el iframe de video
  const videoClasses = `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] min-h-full min-w-full transition-opacity duration-300 ${
    isVideoReady ? "opacity-100" : "opacity-0"
  }`

  // Clases para el contenedor de contenido
  const contentContainerClasses = `absolute container-section inset-0 flex w-full h-full ${styles.verticalAlign || "items-center"}`

  // Clases para la alineación del contenido
  const contentAlignClasses = `w-full flex h-full ${
    styles.textAlign === "text-center"
      ? "justify-center"
      : styles.textAlign === "text-right"
        ? "justify-end"
        : "justify-start"
  } ${styles.verticalAlign || "items-center"}`

  // Clases para el div de contenido
  const contentDivClasses = ` space-y-4 md:space-y-6 ${styles.textAlign || ""} ${styles.contentWidth?.mobile || ""} md:${
    styles.contentWidth?.tablet || ""
  } lg:${styles.contentWidth?.desktop || ""} w-full  lg:w-1/2 `

  // Clases para el título
  const titleClasses = `${styles.titleColor || ""} ${styles.titleSize?.mobile || ""} md:${
    styles.titleSize?.tablet || ""
  } lg:${styles.titleSize?.desktop || ""} font-bold leading-tight`

  // Clases para el subtítulo
  const subtitleClasses = `${styles.subtitleColor || ""} ${styles.subtitleSize?.mobile || ""} md:${
    styles.subtitleSize?.tablet || ""
  } lg:${styles.subtitleSize?.desktop || "text-xl"} max-w-prose`

  // Clases para el contenedor del botón
  const buttonContainerClasses = `${
    styles.textAlign === "text-center"
      ? "flex justify-center"
      : styles.textAlign === "text-right"
        ? "flex justify-end"
        : ""
  }`

  return (
    <div className={containerClasses}>
      {/* Fondo: Video o Imagen */}
      {hasVideo ? (
        <div className="absolute inset-0 overflow-hidden">
          {/* Fallback image mientras carga el video */}
          {bgImage && !isVideoReady && (
            <>
            <div className="absolute inset-0 block lg:hidden">
              <Image
                src={mobileBackgroundImage || "/placeholder.png"}
                  alt={title || "Background"}
                  fill
                  className={backgroundImageClasses}
                  priority
                  sizes="100vw"
                  quality={100}
                />
              </div>

              <div className="absolute inset-0 hidden lg:block">
                <Image
                  src={backgroundImage || "/placeholder.png"}
                  alt={title || "Background"}
                  fill
                  className={backgroundImageClasses}
                  priority
                  sizes="100vw"
                  quality={100}
                />
              </div>
            </>
          )}

          {/* Video de fondo */}
          <div className="absolute inset-0 w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(
                window.location.origin,
              )}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className={`${videoClasses} hidden lg:block`}
              onLoad={() => setIsVideoReady(true)}
              onError={() => setHasVideoError(true)}
              frameBorder="0"
            />
            <iframe
              src={`https://www.youtube.com/embed/${mobileYoutubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${mobileYoutubeId}&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(
                window.location.origin,
              )}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className={`${videoClasses} block lg:hidden`}
              onLoad={() => setIsVideoReady(true)}
              onError={() => setHasVideoError(true)}
              frameBorder="0"
            />
          </div>

          {/* Overlay - Solo el estilo de color es inline */}
          <div className="absolute inset-0 pointer-events-none" style={getOverlayStyle()} />
        </div>
      ) : bgImage ? (
        <div className="absolute inset-0">
          <>
            <div className="absolute inset-0 block lg:hidden">
              <Image
                src={mobileBackgroundImage || "/placeholder.png"}
                alt={title || "Background"}
                fill
                className="object-cover object-center"
                priority
                sizes="100vw"
                quality={100}
              />
            </div>

            <div className="absolute inset-0 hidden lg:block">
              <Image
                src={backgroundImage || "/placeholder.png"}
                alt={title || "Background"}
                fill
                className="object-cover object-center"
                priority
                sizes="100vw"
                quality={100}
              />
            </div>
          </>
          <div className="absolute inset-0" style={getOverlayStyle()} />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800" />
      )}

      {/* Contenido */}
      <div className={contentContainerClasses}>
        <div className="content-section mx-auto h-full flex pt-20 md:pt-32 lg:pt-0">
          <div className={`${contentAlignClasses} items-start lg:items-center `}>
            <motion.div
              className={contentDivClasses}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: animationDelay }}
            >
              {/* Logo - Solo en desktop, más grande y destacado */}
              {logoPath && (
                <motion.div
                  className="hidden lg:block mb-6 md:mb-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: animationDelay - 0.1 }}
                >
                  <div className={`relative ${
                    slideIndex === 1 
                      ? 'w-[200px] h-[65px] md:w-[250px] md:h-[80px]' 
                      : 'w-[180px] h-[60px] md:w-[220px] md:h-[70px]'
                  }`}>
                    <Image
                      src={logoPath}
                      alt={slideIndex === 0 ? "Xiom" : "Butterfly"}
                      fill
                      className="object-contain object-left drop-shadow-lg"
                      quality={100}
                    />
                  </div>
                </motion.div>
              )}

              <div className="w-full flex justify-start mt-4">
                <div className="inline-block px-3 py-1 sm:px-5 sm:py-1 mb-3 sm:mb-4 lg:mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white text-sm sm:text-base md:text-lg font-druk font-extrabold uppercase tracking-wide shadow-lg">
                  DESDE 2010
                </div>
              </div>
              {title && (
                <motion.h1
                  className={`font-druk font-extrabold uppercase text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] mt-4 sm:mt-6 lg:mt-0 md:pr-12 lg:pr-24 ${styles.titleColor || ""} `}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: animationDelay }}
                >
                  {title}
                </motion.h1>
              )}

              {subtitle && (
                <motion.div
                  className={cn(
                    "font-adi-regular text-sm md:text-lg",
                    styles?.subtitleChildrenSize ?? "[&_*]:text-sm md:[&_*]:text-lg",
                    "[&_*]:[font-family:inherit] [&_*]:text-[inherit]",
                    styles?.subtitleColor ?? ""
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + animationDelay }}
                  dangerouslySetInnerHTML={{ __html: subtitle }}
                />
              )}

              {buttonText && buttonLink && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + animationDelay }}
                  className={buttonContainerClasses}
                >
                  <Button
                    variant={(styles.buttonVariant || "outline") as any}
                    size={(styles.buttonSize || "default") as any}
                    className="px-4 py-3 sm:px-7 sm:py-5 rounded-xl border-1 border-white text-white text-xs font-light uppercase tracking-[0.2em] shadow-[0_0_10px_rgba(0,0,0,0.05)] hover:bg-white hover:text-neutral-800 hover:shadow-[0_0_12px_rgba(0,0,0,0.08)] transition-all duration-200"
                  >
                    <Link href={buttonLink}>{buttonText}</Link>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
