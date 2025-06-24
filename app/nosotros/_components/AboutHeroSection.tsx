"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useMainStore } from "@/stores/mainStore"
import { Loader2, BookOpen } from "lucide-react"

export function QuienesSomosHero() {
  const { heroSections, fetchHeroSections, loading, error: storeError } = useMainStore()
  const [error, setError] = useState<string | null>(null)
  const fetchAttempted = useRef(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [hasVideoError, setHasVideoError] = useState(false)

  useEffect(() => {
    // Evitar múltiples intentos de fetch
    if (fetchAttempted.current) return

    const loadHeroSections = async () => {
      try {
        console.log("[HeroSection] Cargando hero sections...")
        fetchAttempted.current = true
        await fetchHeroSections()
        console.log("[HeroSection] Hero sections cargadas correctamente:", heroSections?.length || 0)
        setError(null)
      } catch (err) {
        console.error("[HeroSection] Error al cargar las secciones de héroe:", err)
        setError("No se pudieron cargar las secciones de héroe. Por favor, intenta de nuevo más tarde.")
      }
    }

    loadHeroSections()
  }, [fetchHeroSections])

  // Buscar la sección específica
  const heroSection = heroSections?.find((section) => section.isActive && section.metadata?.section === "quienes-somos")

  // Debug: Log para verificar qué está pasando
  useEffect(() => {
    console.log("Hero Sections:", heroSections)
    console.log("Found Hero Section:", heroSection)
  }, [heroSections, heroSection])

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!heroSection) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <p>No se encontró la sección "Quiénes Somos"</p>
          <p className="text-sm">Secciones disponibles: {heroSections?.length || 0}</p>
        </div>
      </div>
    )
  }

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

  // Mejorar extracción de ID de YouTube para manejar URLs sin protocolo
  const getYouTubeId = (url: string) => {
    if (!url) return null

    // Agregar protocolo si no lo tiene
    let cleanUrl = url
    if (!url.startsWith("http")) {
      cleanUrl = `https://${url}`
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = cleanUrl.match(regExp)

    return match && match[2].length === 11 ? match[2] : null
  }

  const youtubeId = backgroundVideo ? getYouTubeId(backgroundVideo) : null
  const mobileYoutubeId = mobileBackgroundVideo ? getYouTubeId(mobileBackgroundVideo) : null
  const hasVideo = Boolean(youtubeId)

  console.log("Background Video:", backgroundVideo)
  console.log("YouTube ID:", youtubeId)
  console.log("Has Video:", hasVideo)

  // Determinar imagen de fondo a usar
  const bgImage = mobileBackgroundImage || backgroundImage

  return (
    <section className="relative w-full h-[92vh] overflow-hidden">
      {/* Fondo: Video o Imagen */}
      {hasVideo ? (
        <div className="absolute inset-0 overflow-hidden">
          {/* Fallback image mientras carga el video o fondo por defecto */}
          {!isVideoReady && (
            <div className="absolute inset-0">
              {bgImage ? (
                <>
                  <div className="absolute inset-0 block lg:hidden">
                    <img
                      src={mobileBackgroundImage || "/placeholder.svg"}
                      alt={title || "Background"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 hidden lg:block">
                    <img
                      src={backgroundImage || "/placeholder.svg"}
                      alt={title || "Background"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-black/20" />
              )}
            </div>
          )}

          {/* Video de fondo - Desktop */}
          <div className="absolute inset-0 w-full h-full hidden lg:block">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.origin : "",
              )}&vq=hd1080&quality=hd1080`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[177.77vh] h-[56.25vw] min-w-full min-h-full transition-opacity duration-300 ${
                isVideoReady ? "opacity-100" : "opacity-0"
              }`}
              style={{
                minWidth: "100vw",
                minHeight: "100vh",
                width: "177.77vh", // 16:9 aspect ratio
                height: "56.25vw", // 16:9 aspect ratio
              }}
              onLoad={() => {
                console.log("Video loaded successfully")
                setIsVideoReady(true)
              }}
              onError={() => {
                console.log("Video failed to load")
                setHasVideoError(true)
              }}
              frameBorder="0"
            />
          </div>

          {/* Video de fondo - Mobile */}
          {mobileYoutubeId && (
            <div className="absolute inset-0 w-full h-full block lg:hidden">
              <iframe
                src={`https://www.youtube.com/embed/${mobileYoutubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${mobileYoutubeId}&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.origin : "",
                )}&vq=hd720&quality=hd720`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[177.77vh] h-[56.25vw] min-w-full min-h-full transition-opacity duration-300 ${
                  isVideoReady ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  minWidth: "100vw",
                  minHeight: "100vh",
                  width: "177.77vh",
                  height: "56.25vw",
                }}
                onLoad={() => setIsVideoReady(true)}
                onError={() => setHasVideoError(true)}
                frameBorder="0"
              />
            </div>
          )}

          {/* Overlay con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-black/20 z-10" />
        </div>
      ) : bgImage ? (
        <div className="absolute inset-0">
          <div className="absolute inset-0 block lg:hidden">
            <img
              src={mobileBackgroundImage || "/placeholder.svg"}
              alt={title || "Background"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 hidden lg:block">
            <img
              src={backgroundImage || "/placeholder.svg"}
              alt={title || "Background"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-black/20 z-10" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-black/20" />
      )}

      {/* Contenido del Hero */}
      <div className="relative z-20 flex items-center justify-start w-full h-full px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="content-section text-white"
        >
          {/* Icono superior */}
          <div className="mb-6 flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <BookOpen />
            </div>
          </div>

          {/* Título y subtítulo */}
          <h1 className="text-4xl md:text-[80px] mb-10 font-bold">{title || "Quiénes somos"}</h1>
          <p className="text-lg md:text-2xl font-semibold mt-2">{"Facilitamos los procesos de lavado industrial"}</p>

          {/* Descripción */}
          <p className="text-base md:text-lg mt-4 leading-relaxed w-full md:w-1/2">
            {subtitle ||
              "Conocemos de cerca los desafíos del lavado industrial. Día a día asesoramos a empresas que buscan marcar la diferencia en su servicio de lavandería. Escuchar nos ha llevado a innovar. Nuestros productos son usados en numerosos hoteles y lavanderías del Perú, han desafiado las convenciones con un enfoque ecológico y han ayudado a muchas lavanderías a estar más cerca de su éxito comercial al optimizar sus procesos de lavado."}
          </p>

          {/* Botón si existe */}
          {buttonText && buttonLink && (
            <div className="mt-8">
              <Button asChild>
                <Link href={buttonLink}>{buttonText}</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
