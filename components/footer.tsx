"use client"

import type React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Heart,
  Shield,
  FileText,
  BookOpen,
  LogIn,
  User,
  Tag,
  History,
  HelpCircle,
  CreditCard,
  RotateCcw,
  Megaphone,
  Star,
  UserCog,
} from "lucide-react"
import { useMainStore } from "@/stores/mainStore"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
}

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const { shopSettings } = useMainStore()
  const pathname = usePathname()

  const onClickTestimonios: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (pathname === "/") {
      e.preventDefault()
      const el = document.getElementById("testimonios")
      if (el) {
        const headerHeight = 90 // h-18 from navbar (4.5rem = 72px) + extra spacing
        const elementPosition = el.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.scrollY - headerHeight

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        })
        // actualiza el hash sin navegar
        history.replaceState(null, "", "/#testimonios")
      }
    }
  }

  const shopInfo = shopSettings?.[0]

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubscribing(true)
    try {
      // Simular suscripción al newsletter
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("¡Suscripción exitosa!", {
        description: "Te has suscrito correctamente a nuestro newsletter.",
      })
      setEmail("")
    } catch (error) {
      toast.error("Error al suscribirse", {
        description: "Por favor, inténtalo de nuevo más tarde.",
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  const navigationLinks = [
    { name: "Login", href: "/login", icon: LogIn },
    { name: "Tu cuenta", href: "/login", icon: User },
    { name: "Ofertas", href: "/ofertas", icon: Tag },
    { name: "Hstorial de pedidos", href: "/historial", icon: History },
  ]

  const serviceClientLinks = [
    { name: "Preguntas Frecuentes", href: "/preguntas-frecuentes", icon: HelpCircle },
    { name: "Formas de Pago", href: "/formas-pago", icon: CreditCard },
    { name: "Cambios y Devoluciones", href: "/cambios-devoluciones", icon: RotateCcw },
  ]

  const legalLinksVisible = [
    { name: "Términos y Condiciones", href: "/terminos-y-condiciones", icon: FileText },
    { name: "Política de Privacidad", href: "/politica-de-privacidad", icon: Shield },
    { name: "Libro de Reclamaciones", href: "/libro-de-reclamaciones", icon: BookOpen },
  ]

  const aboutAJN = [
    { name: "Nosotros", href: "/nosotros", icon: FileText },
    { name: "Nuestros Productos", href: "/productos", icon: Star },
    { name: "Testimonios", href: "/#testimonios", icon: Megaphone },
    { name: "Noticias", href: "/nosotros", icon: BookOpen },
  ]

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: shopInfo?.facebookUrl || "#" },
    { name: "Instagram", icon: Instagram, href: shopInfo?.instagramUrl || "#" },
    { name: "Twitter", icon: Twitter, href: shopInfo?.twitterUrl || "#" },
    { name: "YouTube", icon: Youtube, href: shopInfo?.youtubeUrl || "#" },
  ]

  // Construir dirección desde shopSettings
  const getAddress = () => {
    if (!shopInfo) return "Dirección no disponible"

    const addressParts = [
      shopInfo.address1,
      shopInfo.address2,
      shopInfo.city,
      shopInfo.province,
      shopInfo.zip,
      shopInfo.country,
    ].filter(Boolean)

    return addressParts.length > 0 ? addressParts.join(", ") : "Dirección no disponible"
  }

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Información de la empresa */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold mb-4">Mi cuenta</h4>
              {/* <img src={shopSettings[0]?.logo3} className="h-32 w-32 object-contain" alt="Logo" /> */}
              {/* <p className="text-gray-300 text-sm leading-relaxed">
                {shopInfo?.description ||
                  "Comprometidos con la excelencia y la satisfacción de nuestros clientes. Ofrecemos productos y servicios de la más alta calidad."}
              </p> */}
              <ul className="space-y-2">
                {navigationLinks.map((link) => {
                  const IconComponent = link.icon
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm group"
                      >
                        {IconComponent && (
                          <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        )}
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Newsletter */}
           
          </motion.div>

          {/* Enlaces de servicio al cliente */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4">Servicio al Cliente</h4>
            <ul className="space-y-2">
              {serviceClientLinks.map((link) => {
                const IconComponent = link.icon
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm group"
                    >
                      {IconComponent && (
                        <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      )}
                      <span>{link.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Enlaces legales importantes */}
            <h4 className="text-lg font-semibold mb-4 mt-8">Legal</h4>
            <ul className="space-y-2">
              {legalLinksVisible.map((link) => {
                const IconComponent = link.icon
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm group"
                    >
                      {IconComponent && (
                        <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      )}
                      <span>{link.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </motion.div>

          {/* Enlaces legales */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4">Sobre ANJ</h4>
            <ul className="space-y-2">
              {aboutAJN.map((link) => {
                const IconComponent = link.icon
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm group"
                    >
                      {IconComponent && (
                        <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      )}
                      <span>{link.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </motion.div>

          {/* Información de contacto */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-3">
              {(shopInfo?.shopOwner || shopInfo?.city) && (
                <a
                  href="https://api.whatsapp.com/send/?phone=51986607951&text&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-3"
                >
                  <UserCog className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">{shopInfo?.shopOwner}</p>
                </a>
              )}

              {(shopInfo?.address1 || shopInfo?.city) && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">{getAddress()}</p>
                </div>
              )}

              {(shopInfo?.phone || shopInfo?.supportPhone) && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300 text-sm">{shopInfo?.phone || shopInfo?.supportPhone}</p>
                    {shopInfo?.supportPhone && shopInfo.supportPhone !== shopInfo.phone && (
                      <p className="text-gray-300 text-sm">{shopInfo.supportPhone}</p>
                    )}
                  </div>
                </div>
              )}

              {(shopInfo?.email || shopInfo?.supportEmail) && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300 text-sm">{shopInfo?.email || shopInfo?.supportEmail}</p>
                    {shopInfo?.supportEmail && shopInfo.supportEmail !== shopInfo.email && (
                      <p className="text-gray-300 text-sm">{shopInfo.supportEmail}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">Lun - Vie: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <Separator className="my-8 bg-gray-700" />

        {/* Copyright y Redes Sociales */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm flex items-center justify-center md:justify-start space-x-1">
              <span>© {new Date().getFullYear()}</span>
              <span>{shopInfo?.name || "Nuestra Empresa"}.</span>
              <span>Todos los derechos reservados.</span>
            </p>
            <p className="text-gray-400 text-sm flex items-center justify-center md:justify-start space-x-1 mt-1">
              <span>Desarrollado por Emet Studio</span>
            </p>
          </div>

          {/* Redes sociales */}
          <div className="flex space-x-4">
            {socialLinks.map((social) => {
              const IconComponent = social.icon
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
                  aria-label={social.name}
                >
                  <IconComponent className="w-5 h-5" />
                </a>
              )
            })}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}