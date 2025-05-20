"use client"

import { useMainStore } from "@/stores/mainStore"
import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"

export function WhatsAppButton() {
  const { shopSettings } = useMainStore()
  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    // Extraemos el número directamente de la propiedad phone
    if (shopSettings && shopSettings.length > 0 && shopSettings[0].phone) {
      // Limpiamos el número de espacios y caracteres no numéricos
      const cleanedNumber = shopSettings[0].phone.replace(/\s+/g, "").replace(/\D/g, "")
      setPhoneNumber(cleanedNumber)
    }
  }, [shopSettings])

  // Si no tenemos número de teléfono, no mostramos el botón
  if (!phoneNumber) {
    return null
  }

  return (
    <motion.a
      href={`https://wa.me/${phoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors duration-300"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Image
        src="/wsp.png"
        alt="Logo Whatsapp"
        width={40}
        height={40}
        className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12"
      />

      <span className="sr-only">Contáctanos por WhatsApp</span>
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
    </motion.a>
  )
}
