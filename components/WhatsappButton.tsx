"use client"

import { useMainStore } from "@/stores/mainStore"
import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"

export function WhatsAppButton() {
  const { shopSettings } = useMainStore()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [whatsappMessage, setWhatsappMessage] = useState("")

  useEffect(() => {
    if (shopSettings && shopSettings.length > 0) {
      const settings = shopSettings[0]

      // Extraer número de teléfono
      if (settings.phone) {
        // Limpiamos el número de espacios y caracteres no numéricos, pero mantenemos el +
        const cleanedNumber = settings.phone.replace(/\s+/g, "").replace(/[^\d+]/g, "")
        setPhoneNumber(cleanedNumber)
      }

      // Configurar mensaje predeterminado usando información de la tienda
      const defaultMessage = `Hola! Me interesa conocer más sobre los productos de ${settings.name || "su empresa"}. ¿Podrían brindarme más información?`
      setWhatsappMessage(encodeURIComponent(defaultMessage))
    }
  }, [shopSettings])

  // Si no tenemos número de teléfono, no mostramos el botón
  if (!phoneNumber) {
    return null
  }

  // Construir URL de WhatsApp con mensaje personalizado
  const whatsappUrl = `https://wa.me/${phoneNumber}${whatsappMessage ? `?text=${whatsappMessage}` : ""}`

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors duration-300"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-label={`Contáctanos por WhatsApp - ${shopSettings?.[0]?.name || "Nuestra empresa"}`}
    >
      <Image
        src="/wsp.png"
        alt="Logo WhatsApp"
        width={40}
        height={40}
        className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12"
        priority
      />

      <span className="sr-only">Contáctanos por WhatsApp - {shopSettings?.[0]?.name || "Nuestra empresa"}</span>

      {/* Efecto de pulso animado */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[#25D366] opacity-30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      {/* Tooltip opcional */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        Chatea con nosotros
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
    </motion.a>
  )
}
