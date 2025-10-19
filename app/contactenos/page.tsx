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
  const { shopSettings } = useMainStore()

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

  const handleWhatsApp = () => {
    if (!shopSettings[0]?.phone) return
    const phoneNumber = shopSettings[0]?.phone.replace(/[^\w\s]/gi, "").replace(/ /g, "")
    const message = encodeURIComponent("Hola, me gustaría obtener más información.")
    // Usar wa.me en móvil y web.whatsapp.com en escritorio
    const whatsappUrl = isMobile 
      ? `https://wa.me/${phoneNumber}?text=${message}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  const handleEmail = () => {
    if (!shopSettings[0]?.email) return
    window.location.href = `mailto:${shopSettings[0]?.email}`
  }

  return (
    <main className=" ">

      {/* <ContactForm /> */}

      {/* <motion.section className="py-16 " variants={containerVariants} initial="hidden" animate="visible">
        <div className="container-section">
          <div className="content-section">
            <motion.h2 variants={itemVariants} className="text-3xl font-bold text-center mb-8">
              Preguntas Frecuentes
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div variants={itemVariants}>
                <h3 className="text-xl font-semibold mb-2">¿Cuáles son los tiempos de entrega?</h3>
                <p className="text-gray-600">
                  Nuestros tiempos de entrega varían según la ubicación y el producto. Generalmente, entregamos en Lima
                  Metropolitana en 24-48 horas y a nivel nacional en 3-5 días hábiles.
                </p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <h3 className="text-xl font-semibold mb-2">¿Ofrecen muestras de productos?</h3>
                <p className="text-gray-600">
                  Sí, ofrecemos muestras de nuestros productos para clientes potenciales. Contáctanos para solicitar
                  muestras y discutir tus necesidades específicas.
                </p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <h3 className="text-xl font-semibold mb-2">¿Tienen un programa de fidelización?</h3>
                <p className="text-gray-600">
                  Sí, contamos con un programa de fidelización para nuestros clientes frecuentes. Pregunta por nuestros
                  descuentos y beneficios especiales.
                </p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <h3 className="text-xl font-semibold mb-2">¿Ofrecen capacitación sobre el uso de sus productos?</h3>
                <p className="text-gray-600">
                  Absolutamente. Ofrecemos sesiones de capacitación gratuitas para asegurar que nuestros clientes
                  utilicen nuestros productos de manera efectiva y segura.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section> */}

      <main className="container-section py-12 md:py-16">
        <div className="content-section">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Contáctanos</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Estamos aquí para ayudarte. No dudes en contactarnos a través de cualquiera de nuestros canales de comunicación.
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Email Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleEmail}>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-pink-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-pink-600" />
                </div>
                <CardTitle className="text-lg">Correo Electrónico</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Envíanos un correo</p>
                <p className="font-medium text-pink-600 break-all">
                  {shopSettings[0]?.email || "Cargando..."}
                </p>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-pink-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8 text-pink-600" />
                </div>
                <CardTitle className="text-lg">Teléfono</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Llámanos directamente</p>
                <p className="font-medium text-pink-600">
                  {shopSettings[0]?.phone || "Cargando..."}
                </p>
              </CardContent>
            </Card>

            {/* WhatsApp Card */}
            <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">Chatea con nosotros</p>
                <Button 
                  onClick={handleWhatsApp} 
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Abrir WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Business Hours */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-pink-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-pink-600" />
                  </div>
                  <CardTitle>Horario de Atención</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Lunes - Viernes:</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sábados:</span>
                  <span className="font-medium">9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Domingos:</span>
                  <span className="font-medium">Cerrado</span>
                </div>
              </CardContent>
            </Card>

            {/* Location or Additional Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-pink-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-pink-600" />
                  </div>
                  <CardTitle>Información Adicional</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  En <span className="font-semibold text-foreground">{shopSettings[0]?.name || "Sportt Peru"}</span>, 
                  estamos comprometidos a brindarte la mejor atención y servicio.
                </p>
                {shopSettings[0]?.address1 && (
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Dirección:</p>
                    <p className="text-muted-foreground">
                      {shopSettings[0]?.address1}
                      {shopSettings[0]?.address2 && <>, {shopSettings[0]?.address2}</>}
                      {shopSettings[0]?.city && <><br />{shopSettings[0]?.city}</>}
                      {shopSettings[0]?.province && `, ${shopSettings[0]?.province}`}
                      {shopSettings[0]?.zip && ` ${shopSettings[0]?.zip}`}
                      {shopSettings[0]?.country && <><br />{shopSettings[0]?.country}</>}
                    </p>
                  </div>
                )}
                <p className="text-muted-foreground">
                  Respondemos todos los mensajes en un plazo máximo de 24 horas hábiles.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </main>
  )
}

