"use client"

import Image from "next/image"
import { Check, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useMainStore } from "@/stores/mainStore"

interface AboutSectionProps {
  contentId?: string
}

export function AboutSection({ contentId = "cnt_363018db-f61b" }: AboutSectionProps) {
  const { contents } = useMainStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<{
    title: string
    introduction: string
    sections: Array<{
      title: string
      content: string
      htmlContent: string
    }>
    featuredImage?: string
  }>({
    title: "",
    introduction: "",
    sections: [],
    featuredImage: "",
  })

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true)
        const contentData = contents.find((c) => c.id === contentId)

        if (!contentData) {
          setError("Contenido no encontrado")
          return
        }

        const htmlBody = contentData?.body || ""
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = htmlBody

        // Extraer elementos manteniendo HTML interno para estilos
        const titleElement = tempDiv.querySelector("h2")
        const title = titleElement ? titleElement.innerHTML : "¿QUIÉNES SOMOS?"

        const introElement = tempDiv.querySelector("p")
        const introduction = introElement ? introElement.innerHTML : ""

        const sections: Array<{ title: string; content: string; htmlContent: string }> = []
        const sectionTitles = tempDiv.querySelectorAll("h3")

        sectionTitles.forEach((sectionTitle) => {
          const titleText = sectionTitle.innerHTML
          const contentElement = sectionTitle.nextElementSibling
          const contentText = contentElement && contentElement.tagName === "P" ? contentElement.innerHTML : ""

          sections.push({
            title: titleText,
            content: contentText,
            htmlContent: contentText
          })
        })

        setContent({
          title,
          introduction,
          sections,
          featuredImage: contentData.featuredImage || undefined,
        })

        setError(null)
      } catch (err) {
        console.error("Error al cargar el contenido:", err)
        setError("No se pudo cargar el contenido")
      } finally {
        setIsLoading(false)
      }
    }

    loadContent()
  }, [contents, contentId])

  if (isLoading) {
    return (
      <div className="container-section py-8 lg:py-16 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-section py-8 lg:py-16 flex justify-center items-center min-h-[400px]">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section className="container-section py-16 lg:py-16 bg-white">
      <div className="content-section bg-white">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-0">
          {/* Image Collage - 40% width on desktop */}
          <div className="w-full lg:w-[40%] relative mx-auto max-w-[400px] lg:max-w-none flex justify-center lg:justify-start lg:pr-4">
            <div className="relative">
              <Image
                src={content.featuredImage || "/about1.png"}
                alt="Imagen principal"
                width={400}
                height={500}
                className="rounded-3xl object-cover w-[300px] md:w-[450px] h-[400px] md:h-[500px]"
                priority
              />
            </div>
            <div className="absolute top-6 md:top-12 left-1 md:-left-8">
              <Image
                src="/about2.png"
                alt="Profesional con mascarilla"
                width={200}
                height={300}
                className="rounded-2xl object-cover h-[150px] w-[120px] md:h-[200px] md:w-[160px] border-8 border-white shadow-lg"
                priority
              />
            </div>
            <div className="absolute -bottom-4 md:-bottom-8 left-[230px] md:left-[300px] lg:left-[340px]">
              <Image
                src="/about3.png"
                alt="Equipo de profesionales"
                width={200}
                height={300}
                className="rounded-2xl object-cover h-[150px] w-[120px] md:h-[200px] md:w-[160px] border-8 border-white shadow-lg"
                priority
              />
            </div>
          </div>

          {/* Content - 50% width on desktop */}
          <motion.div
            className="w-full lg:w-[50%] space-y-8 mb-8 lg:mb-0"
            variants={containerAnimation}
            initial="visible"
            animate="visible"
          >
            {/* Título - Mantenemos estructura pero con estilos del HTML */}
            <motion.div 
              className="[&>h2]:mb-0" // Elimina margen inferior del h2 para mantener espacio con space-y-8
              variants={itemAnimation}
              dangerouslySetInnerHTML={{ __html: content.title }}
            />
            
            {/* Introducción - Mantenemos estructura pero con estilos del HTML */}
            <motion.div 
              className="[&>p]:mb-0" // Elimina margen inferior del p para mantener espacio con space-y-8
              variants={itemAnimation}
              dangerouslySetInnerHTML={{ __html: content.introduction }}
            />

            {/* Secciones */}
            {content.sections.map((section, index) => (
              <motion.div key={index} className="space-y-2" variants={itemAnimation}>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 p-1 rounded-full bg-blue-100 text-blue-600 flex-shrink-0" />
                  {/* Título de sección con estilos del HTML */}
                  <div 
                    className="[&>h3]:mb-0 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-gray-900"
                    dangerouslySetInnerHTML={{ __html: section.title }}
                  />
                </div>
                {/* Contenido de sección con estilos del HTML */}
                <div 
                  className="pl-7 [&>p]:mb-0"
                  dangerouslySetInnerHTML={{ __html: section.htmlContent }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}