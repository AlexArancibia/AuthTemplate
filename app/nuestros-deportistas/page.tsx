"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { useState } from "react"

// Codificar paths con espacios para URLs
const encodePath = (path: string) => 
  path.split('/').map(p => p ? encodeURIComponent(p) : '').join('/')

// Función para obtener el nombre del deportista desde el nombre del archivo
const getDisplayName = (filename: string): string => {
  const knownNames: Record<string, string> = {
    "Yenobi Tafur": "Yenobi Tafur",
    "Rodrigo Hidalgo": "Rodrigo Hidalgo"
  }
  
  for (const [key, value] of Object.entries(knownNames)) {
    if (filename.includes(key)) return value
  }
  
  // Archivos genéricos
  if (filename.includes("WhatsApp Image") || /^\d/.test(filename) || filename.includes("ASD") || filename === "image.png") {
    return "Deportista"
  }
  
  // Extraer nombre legible del archivo
  return filename.replace(/\.(jpg|jpeg|png)$/i, '').replace(/[_-]/g, ' ')
}

// Pre-calcular datos de atletas con imágenes codificadas
const athleteImages = [
  "Yenobi Tafur.JPG",
  "Rodrigo Hidalgo.JPG",
  "7L4A1416.JPG",
  "DSC_7959.JPG",
  "DSC_0036.JPG",
  "ITP_3821.JPG",
  "7L4A8888.JPG",
  "7L4A8794.JPG",
  "7L4A1410.JPG",
  "7L4A1296.JPG",
  "WhatsApp Image 2025-10-14 at 13.53.55.jpeg",
  "123qwe123.png",
  "ASD123.png",
  "image.png",
]

const athletes = athleteImages.map(filename => {
  const image = `/deportistas/${filename}`
  return {
    image,
    name: getDisplayName(filename),
    encodedImage: encodePath(image)
  }
})

interface AthleteCardProps {
  athlete: typeof athletes[0]
  index: number
}

const TOUCH_DELAY = 300

function AthleteCard({ athlete, index }: AthleteCardProps) {
  const [isActive, setIsActive] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleInactive = () => {
    setTimeout(() => setIsActive(false), TOUCH_DELAY)
  }

  const isVisible = isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
  const translateY = isActive ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative aspect-[3/4] overflow-hidden rounded-lg cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onTouchStart={() => setIsActive(true)}
      onTouchEnd={handleInactive}
    >
      {!imageError ? (
        <Image
          src={athlete.encodedImage}
          alt={athlete.name}
          fill
          className={`object-cover transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Imagen no disponible</span>
        </div>
      )}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${isVisible}`} />
      <div className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 ${translateY}`}>
        <h3 className="text-white text-lg font-bold line-clamp-2 break-words">{athlete.name}</h3>
      </div>
      <div className={`absolute top-4 left-4 right-4 transition-opacity duration-300 ${isVisible}`}>
        <span className="bg-white/90 text-black px-3 py-1 rounded-lg text-sm font-medium line-clamp-2 break-words inline-block w-fit max-w-full">
          {athlete.name}
        </span>
      </div>
    </motion.div>
  )
}

export default function NuestrosDeportistasPage() {
  return (
    <>
      <div className="bg-[url('/FONDO-TEXTURA.jpg')] bg-cover py-12 pt-24 container-section">
        <div className="content-section mx-auto py-6">
          <h2 className="text-white text-center">NUESTROS DEPORTISTAS</h2>
        </div>
      </div>

      <div className="container-section py-12 md:py-16">
        <div className="content-section">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {athletes.map((athlete, index) => (
              <AthleteCard key={athlete.image} athlete={athlete} index={index} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
