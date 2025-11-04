"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { useState } from "react"

const getAthleteName = (filename: string): string => {
  const name = filename.replace(/\.(jpg|jpeg)$/i, '')
  return name.includes('WhatsApp Image') ? 'Deportista' : name
}

// Codificar paths con espacios para URLs
const encodePath = (path: string) => 
  path.split('/').map(p => p ? encodeURIComponent(p) : '').join('/')

// Pre-calcular datos de atletas con imágenes codificadas
const athletes = [
  { image: "/deportistas/Yenobi Tafur.JPG", name: "Yenobi Tafur" },
  { image: "/deportistas/Rodrigo Hidalgo.JPG", name: "Rodrigo Hidalgo" },
  { image: "/deportistas/7L4A1416.JPG", name: getAthleteName("7L4A1416.JPG") },
  { image: "/deportistas/DSC_7959.JPG", name: getAthleteName("DSC_7959.JPG") },
  { image: "/deportistas/DSC_0036.JPG", name: getAthleteName("DSC_0036.JPG") },
  { image: "/deportistas/DSC_0410.JPG", name: getAthleteName("DSC_0410.JPG") },
  { image: "/deportistas/ITP_3821.JPG", name: getAthleteName("ITP_3821.JPG") },
  { image: "/deportistas/7L4A8888.JPG", name: getAthleteName("7L4A8888.JPG") },
  { image: "/deportistas/7L4A8794.JPG", name: getAthleteName("7L4A8794.JPG") },
  { image: "/deportistas/7L4A1410.JPG", name: getAthleteName("7L4A1410.JPG") },
  { image: "/deportistas/7L4A1296.JPG", name: getAthleteName("7L4A1296.JPG") },
  { image: "/deportistas/WhatsApp Image 2025-10-14 at 13.51.18.jpeg", name: "Deportista" },
  { image: "/deportistas/WhatsApp Image 2025-10-14 at 13.53.55.jpeg", name: "Deportista" },
  { image: "/deportistas/WhatsApp Image 2025-10-14 at 13.55.11.jpeg", name: "Deportista" },
].map(athlete => ({
  ...athlete,
  encodedImage: encodePath(athlete.image)
}))

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
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
      <div className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 ${isActive ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}>
        <h3 className="text-white text-lg font-bold">{athlete.name}</h3>
      </div>
      <div className={`absolute top-4 left-4 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <span className="bg-white/90 text-black px-3 py-1 rounded-full text-sm font-medium">
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
