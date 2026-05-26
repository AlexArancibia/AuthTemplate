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
}

export function HeroSlide({ heroSection, animationDelay = 0 }: HeroSlideProps) {
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [hasVideoError, setHasVideoError] = useState(false)

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

    return { backgroundColor: styles.overlayColor || "rgba(0,0,0,0.2)" }
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
  const desktopVideoId = youtubeId || mobileYoutubeId
  const mobileVideoId = mobileYoutubeId || youtubeId
  const hasVideo = Boolean(desktopVideoId || mobileVideoId)
  const getVideoSrc = (videoId: string) =>
    `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&showinfo=0&rel=0&modestbranding=1&playsinline=1`

  // Clases para el contenedor principal
  const containerClasses = "relative w-full h-full overflow-hidden bg-black"

  // Clases para la imagen de fondo
  const backgroundImageClasses = cn(
    "object-cover object-center",
    styles.backgroundPosition?.replace("bg-", "object-"),
    styles.backgroundSize?.replace("bg-", "object-"),
  )

  // Clases para el iframe de video
  const videoClasses = `absolute top-1/2 left-1/2 h-[120%] w-[220%] -translate-x-1/2 -translate-y-1/2 sm:w-[180%] lg:w-[120%] transition-opacity duration-300 ${
    isVideoReady ? "opacity-100" : "opacity-0"
  }`

  // Clases para el contenedor de contenido
  const contentContainerClasses = `absolute inset-0 flex w-full h-full items-center px-6 sm:px-10 md:px-14`

  // Clases para la alineación del contenido
  const contentAlignClasses = `w-full flex h-full ${
    styles.textAlign === "text-center"
      ? "justify-center"
      : styles.textAlign === "text-right"
        ? "justify-end"
        : "justify-start"
  } items-center`

  // Clases para el div de contenido
  const contentDivClasses = `${styles.textAlign || "text-center"} content-section`

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
  const buttonClassName =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground shadow h-9 px-4 py-2 mt-4 bg-pink-500 hover:bg-pink-600 transition-all duration-700"

  const renderBackgroundImages = (className = backgroundImageClasses, quality?: number) => (
    <>
      <div className="absolute inset-0 block lg:hidden">
        <Image
          src={mobileBackgroundImage || backgroundImage || "/placeholder.png"}
          alt={title || "Background"}
          fill
          className={className}
          priority
          sizes="100vw"
          quality={quality}
        />
      </div>

      <div className="absolute inset-0 hidden lg:block">
        <Image
          src={backgroundImage || mobileBackgroundImage || "/placeholder.png"}
          alt={title || "Background"}
          fill
          className={className}
          priority
          sizes="100vw"
          quality={quality}
        />
      </div>
    </>
  )

  return (
    <div className={containerClasses}>
      {/* Fondo: Video o Imagen */}
      {hasVideo && !hasVideoError ? (
        <div className="absolute inset-0 overflow-hidden">
          {/* Fallback image mientras carga el video */}
          {bgImage && !isVideoReady && renderBackgroundImages()}

          {/* Video de fondo */}
          <div className="absolute inset-0 w-full h-full">
            {desktopVideoId && (
              <iframe
                title={`${title || "Hero"} video de fondo escritorio`}
                src={getVideoSrc(desktopVideoId)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className={`${videoClasses} hidden lg:block`}
                onLoad={() => setIsVideoReady(true)}
                onError={() => setHasVideoError(true)}
                frameBorder="0"
              />
            )}
            {mobileVideoId && (
              <iframe
                title={`${title || "Hero"} video de fondo mobile`}
                src={getVideoSrc(mobileVideoId)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className={`${videoClasses} block lg:hidden`}
                onLoad={() => setIsVideoReady(true)}
                onError={() => setHasVideoError(true)}
                frameBorder="0"
              />
            )}
          </div>

          {/* Overlay - Solo el estilo de color es inline */}
          <div className="absolute inset-0 pointer-events-none" style={getOverlayStyle()} />
        </div>
      ) : bgImage ? (
        <div className="absolute inset-0">
          {renderBackgroundImages("w-full h-full object-cover object-center", 100)}
          <div className="absolute inset-0" style={getOverlayStyle()} />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800" />
      )}

      {/* Contenido */}
      <div className={contentContainerClasses}>
        <div className="container mx-auto px-2 md:px-4 h-full flex items-center justify-center -translate-y-36 sm:-translate-y-32 md:translate-y-0">
          <div className={contentAlignClasses}>
            <motion.div
              className={contentDivClasses}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: animationDelay }}
            >
              {subtitle && (
                <motion.h2
                  className={cn(
                    "text-3xl md:text-4xl font-normal mb-2",
                    styles?.subtitleColor ?? "text-white"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 + animationDelay }}
                  dangerouslySetInnerHTML={{ __html: subtitle }}
                />
              )}

              {title && (
                <motion.h1
                  className={cn(
                    "text-4xl md:text-5xl lg:text-6xl font-normal uppercase mb-4",
                    styles?.titleColor ?? "text-white"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.5 + animationDelay }}
                >
                  {title}
                </motion.h1>
              )}

              {buttonText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.7 + animationDelay }}
                  className={buttonContainerClasses}
                >
                  {buttonLink ? (
                    <Link href={buttonLink}>
                      <Button
                        variant={(styles.buttonVariant || "default") as any}
                        size={(styles.buttonSize || "default") as any}
                        className={buttonClassName}
                      >
                        {buttonText}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant={(styles.buttonVariant || "default") as any}
                      size={(styles.buttonSize || "default") as any}
                      className={buttonClassName}
                    >
                      {buttonText}
                    </Button>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
