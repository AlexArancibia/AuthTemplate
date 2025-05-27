"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { MapPin, Phone, Mail } from "lucide-react"
import { useEmailStore } from "@/stores/emailStore"
import { useMainStore } from "@/stores/mainStore"
import { usePathname } from "next/navigation"

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().regex(/^\+?[0-9]{6,14}$/, "Número de teléfono inválido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
})

type FormValues = z.infer<typeof formSchema>

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

export function PreFooterContact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { shopSettings } = useMainStore()
  const { sendContactForm } = useEmailStore()
  const pathname = usePathname()
  const isContactPage = pathname === "/contactenos"

  const shopInfo = shopSettings?.[0]

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      await sendContactForm({ ...data, subject: "Consulta desde pre-footer" })
      toast.success("Mensaje enviado", {
        description: "Gracias por contactarnos. Te responderemos pronto.",
      })
      reset()
    } catch (error) {
      console.error("Error al enviar el formulario:", error)
      toast.error("Error al enviar el mensaje", {
        description: "Por favor, inténtalo de nuevo más tarde.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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

  // Obtener información de contacto desde shopSettings
  const getContactInfo = () => {
    return {
      address: getAddress(),
      phone: {
        mobile: shopInfo?.phone || "Teléfono no disponible",
        landline: shopInfo?.supportPhone || null,
      },
      email: shopInfo?.email || shopInfo?.supportEmail || "Email no disponible",
    }
  }

  const contactInfo = getContactInfo()

  return (
    <>
    {!isContactPage && (
      <motion.section
      className="bg-gray-100 bg-center bg-cover py-12 relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="container-section relative z-10">
        <div className="content-section flex flex-col md:flex-row gap-8 items-center">
          {/* Left column with company info */}
          <motion.div className="w-full md:w-1/2" variants={itemVariants}>
            <h2 className="text-secondary mb-4">Contáctanos</h2>
            <p className="text-muted-foreground mb-6">
              {shopInfo?.description ||
                "Estamos aquí para ayudarte. Contáctanos para obtener más información sobre nuestros productos y servicios de limpieza industrial."}
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center text-muted-foreground">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                <span>{contactInfo.address}</span>
              </li>
              <li className="flex items-center text-muted-foreground">
                <Phone className="w-5 h-5 mr-2 text-primary" />
                <div>
                  <span className="block">{contactInfo.phone.mobile}</span>
                  {contactInfo.phone.landline && <span className="block">{contactInfo.phone.landline}</span>}
                </div>
              </li>
              <li className="flex items-center text-muted-foreground">
                <Mail className="w-5 h-5 mr-2 text-primary" />
                <span>{contactInfo.email}</span>
              </li>
            </ul>
          </motion.div>

          {/* Right column with form */}
          <motion.div className="w-full md:w-1/2" variants={itemVariants}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-secondary mb-4">Envíanos un mensaje</h3>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Input type="text" placeholder="Nombre" {...register("name")} disabled={isSubmitting} />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div className="flex-1">
                  <Input type="email" placeholder="Email" {...register("email")} disabled={isSubmitting} />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <Input type="tel" placeholder="Teléfono" {...register("phone")} disabled={isSubmitting} />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <Textarea placeholder="Mensaje" rows={4} {...register("message")} disabled={isSubmitting} />
                {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "ENVIAR MENSAJE"}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.section>
    )}
  </>
    
  )
}
