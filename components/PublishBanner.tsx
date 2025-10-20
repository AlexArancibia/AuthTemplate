"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useMainStore } from "@/stores/mainStore"

export function PublishBanner() {
  const [whatsappNumber, setWhatsappNumber] = useState<string>("")
  const { fetchShopSettings, shopSettings } = useMainStore()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  useEffect(() => {
    // Obtener el número de WhatsApp desde la configuración de la tienda
    const getShopSettings = async () => {
      try {
        await fetchShopSettings()
      } catch (error) {
        console.error('Error fetching shop settings:', error)
        // Número por defecto si no se puede obtener de la configuración
        setWhatsappNumber("+51986607951")
      }
    }

    getShopSettings()
  }, [fetchShopSettings])

  useEffect(() => {
    // Actualizar el número cuando se obtengan los datos de la tienda
    if (shopSettings && shopSettings.length > 0) {
      const settings = shopSettings[0]
      // Usar supportPhone o phone como fallback
      setWhatsappNumber(settings.supportPhone || settings.phone || "+51986607951")
    }
  }, [shopSettings])

  const handleWhatsAppClick = () => {
    if (whatsappNumber) {
      // Limpiar el número manteniendo solo dígitos y el signo +
      const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '')
      const whatsappUrl = `https://wa.me/${cleanNumber}`
      window.open(whatsappUrl, "_blank")
    }
  }

  return (
    <motion.section 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <img 
        src="/cta.jpg" 
        alt="Call to action" 
        className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleWhatsAppClick}
      />
    </motion.section>
  )
}
