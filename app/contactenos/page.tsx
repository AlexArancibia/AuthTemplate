"use client"

import { motion } from "framer-motion"
import { ContactForm } from "./_components/contact-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Mail, Phone, MessageSquare, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMainStore } from "@/stores/mainStore"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
}

export default function ContactPage() {
  const { shopSettings, loading } = useMainStore()

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Verificar al montar el componente
    checkIfMobile()
    
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', checkIfMobile)
    
    // Limpiar el event listener al desmontar
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const phoneNumber = shopSettings[0]?.phone
  const email = shopSettings[0]?.email
  const hasPhone = phoneNumber && phoneNumber.trim() !== ""
  const hasEmail = email && email.trim() !== ""
  const isLoading = loading || shopSettings.length === 0

  const handleWhatsApp = () => {
    if (!hasPhone) return
    const cleanedPhone = phoneNumber.replace(/[^\d+]/g, "").replace(/ /g, "")
    const message = encodeURIComponent("Hola, me gustaría obtener más información.")
    // Usar wa.me en móvil y web.whatsapp.com en escritorio
    const whatsappUrl = isMobile 
      ? `https://wa.me/${cleanedPhone}?text=${message}`
      : `https://web.whatsapp.com/send?phone=${cleanedPhone}&text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  const handleEmail = () => {
    if (!shopSettings[0]?.email) return
    window.location.href = `mailto:${shopSettings[0]?.email}`
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container-section py-8 md:py-12">
        <div className="content-section">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
              Contáctanos
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Estamos aquí para ayudarte. No dudes en contactarnos a través de cualquiera de nuestros canales de comunicación.
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
            {/* Email Card */}
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border hover:border-pink-200">
              <CardHeader className="text-center pb-2 pt-5 px-4">
                <div className="mx-auto bg-pink-50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-3">
                  <Mail className="h-7 w-7 text-pink-600" />
                </div>
                <CardTitle className="text-lg font-semibold mb-1">Correo Electrónico</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-5 px-4">
                <p className="text-xs text-muted-foreground mb-2">Envíanos un correo</p>
                <p className="font-semibold text-pink-600 break-all text-sm">
                  {isLoading ? "Cargando..." : hasEmail ? email : "No disponible"}
                </p>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border hover:border-pink-200">
              <CardHeader className="text-center pb-2 pt-5 px-4">
                <div className="mx-auto bg-pink-50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-3">
                  <Phone className="h-7 w-7 text-pink-600" />
                </div>
                <CardTitle className="text-lg font-semibold mb-1">Teléfono</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-5 px-4">
                <p className="text-xs text-muted-foreground mb-2">Llámanos directamente</p>
                <p className="font-semibold text-pink-600 text-sm">
                  {isLoading ? "Cargando..." : hasPhone ? phoneNumber : "No disponible"}
                </p>
              </CardContent>
            </Card>

            {/* WhatsApp Card */}
            <Card className="hover:shadow-lg transition-all duration-300 md:col-span-2 lg:col-span-1 border hover:border-green-200">
              <CardHeader className="text-center pb-2 pt-5 px-4">
                <div className="mx-auto bg-green-50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-3">
                  <MessageSquare className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="text-lg font-semibold mb-1">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-5 px-4">
                <p className="text-xs text-muted-foreground mb-3">Chatea con nosotros</p>
                <Button 
                  onClick={handleWhatsApp} 
                  className="w-full bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed h-9 text-sm font-medium"
                  disabled={!hasPhone || isLoading}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {isLoading ? "Cargando..." : hasPhone ? "Abrir WhatsApp" : "No disponible"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* Business Hours */}
            <Card className="border hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="bg-pink-50 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-pink-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Horario de Atención</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-5">
                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Lunes - Viernes:</span>
                  <span className="font-semibold text-foreground text-sm">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Sábados:</span>
                  <span className="font-semibold text-foreground text-sm">9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-muted-foreground text-sm">Domingos:</span>
                  <span className="font-semibold text-foreground text-sm">Cerrado</span>
                </div>
              </CardContent>
            </Card>

            {/* Location or Additional Info */}
            <Card className="border hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="bg-pink-50 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-pink-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Información Adicional</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-5">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  En <span className="font-semibold text-foreground">{shopSettings[0]?.name || "Sportt Peru"}</span>, 
                  estamos comprometidos a brindarte la mejor atención y servicio.
                </p>
                {shopSettings[0]?.address1 && (
                  <div className="space-y-1.5">
                    <p className="font-semibold text-foreground text-sm">Dirección:</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {shopSettings[0]?.address1}
                      {shopSettings[0]?.address2 && <>, {shopSettings[0]?.address2}</>}
                      {shopSettings[0]?.city && <><br />{shopSettings[0]?.city}</>}
                      {shopSettings[0]?.province && `, ${shopSettings[0]?.province}`}
                      {shopSettings[0]?.zip && ` ${shopSettings[0]?.zip}`}
                      {shopSettings[0]?.country && <><br />{shopSettings[0]?.country}</>}
                    </p>
                  </div>
                )}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Respondemos todos los mensajes en un plazo máximo de 24 horas hábiles.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

