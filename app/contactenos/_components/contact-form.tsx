"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { MapPin, Phone, Mail, Clock, Loader2 } from "lucide-react"
import { useEmailStore } from "@/stores/emailStore"
import { useMainStore } from "@/stores/mainStore"
import type { CardSection, CardSectionMetadata } from "@/types/card"
import Image from "next/image"

interface ContactFormProps {
  id?: string
  metadata?: Partial<CardSectionMetadata>
}

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().regex(/^\+?[0-9]{6,14}$/, "Número de teléfono inválido"),
  company: z.string().optional(),
  subject: z.string().min(1, "Por favor seleccione un asunto"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
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
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
}

// Función para verificar coincidencia de metadata
function matchesMetadata(
  sectionMetadata: CardSectionMetadata | null | undefined,
  searchMetadata: Partial<CardSectionMetadata>,
): boolean {
  if (!sectionMetadata || !searchMetadata) return false

  if (searchMetadata.tags && searchMetadata.tags.length > 0) {
    if (!sectionMetadata.tags || sectionMetadata.tags.length === 0) return false
    const hasMatchingTag = searchMetadata.tags.some((tag) => sectionMetadata.tags?.includes(tag))
    if (!hasMatchingTag) return false
  }

  if (searchMetadata.seoTitle) {
    if (!sectionMetadata.seoTitle || sectionMetadata.seoTitle !== searchMetadata.seoTitle) return false
  }

  if (searchMetadata.seoDescription) {
    if (!sectionMetadata.seoDescription || sectionMetadata.seoDescription !== searchMetadata.seoDescription)
      return false
  }

  return true
}

export function ContactForm({ id = "cs_4cc2f669-73d1", metadata }: ContactFormProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { shopSettings, cardSections, loading, error } = useMainStore()
  const { sendContactForm } = useEmailStore()

  console.log("[ContactForm] Store state:", {
    cardSectionsCount: cardSections?.length || 0,
    loading,
    error,
    targetId: id,
  })

  // Filtrar secciones
  const getFilteredSections = (): CardSection[] => {
    if (!id && !metadata) {
      console.log("[ContactForm] No id or metadata provided")
      return []
    }

    let filteredSections: CardSection[] = []

    if (id) {
      const sectionById = cardSections.find((section) => section.id === id)
      console.log("[ContactForm] Looking for section with id:", id)
      console.log(
        "[ContactForm] Found section:",
        sectionById
          ? {
              id: sectionById.id,
              title: sectionById.title,
              isActive: sectionById.isActive,
            }
          : "NOT FOUND",
      )

      if (sectionById && sectionById.isActive) {
        filteredSections = [sectionById]
      }
    } else if (metadata) {
      filteredSections = cardSections.filter(
        (section) => section.isActive && matchesMetadata(section.metadata, metadata),
      )
    }

    console.log("[ContactForm] Filtered sections:", filteredSections.length)
    return filteredSections.sort((a, b) => a.position - b.position)
  }

  const activeSections = getFilteredSections()
  const contactSection = activeSections[0]

  const shopInfo = shopSettings?.[0]

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      acceptTerms: false,
    },
  })

  const acceptTerms = watch("acceptTerms")

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      // Excluir acceptTerms del envío ya que es solo para validación
      const { acceptTerms, ...formData } = data
      await sendContactForm(formData)
      toast.success("Formulario enviado", {
        description: "Gracias por contactarnos. Te responderemos pronto.",
      })
      reset()
    } catch (error) {
      console.error("Error al enviar el formulario:", error)
      toast.error("Error al enviar el formulario", {
        description: "Por favor, inténtalo de nuevo más tarde.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubjectChange = (value: string) => {
    setValue("subject", value, { shouldValidate: true })
  }

  const handleTermsChange = (checked: boolean) => {
    setValue("acceptTerms", checked, { shouldValidate: true })
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
      phone: shopInfo?.phone || shopInfo?.supportPhone || "Teléfono no disponible",
      email: shopInfo?.email || shopInfo?.supportEmail || "Email no disponible",
      businessHours: "Lunes - Viernes: 9:00 AM - 6:00 PM",
    }
  }

  const contactInfo = getContactInfo()

  // Estados de carga y error
  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-red-500">Error al cargar la sección de contacto</div>
          </div>
        </div>
      </section>
    )
  }

  if (!contactSection) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center pb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Contáctanos</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Estamos aquí para responder a tus preguntas y ayudarte con tus necesidades.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const activeCards = (contactSection.cards || [])
    .filter((card) => card.isActive)
    .sort((a, b) => a.position - b.position)

  const contactInfoCard = activeCards.find((card) => card.title === "Información de Contacto")
  const messageCard = activeCards.find((card) => card.title === "Envíanos un mensaje")

  console.log("[ContactForm] Active cards:", {
    total: activeCards.length,
    contactInfoCard: contactInfoCard?.id,
    messageCard: messageCard?.id,
  })

  return (
    <section className="py-8 md:py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center pb-8 md:pb-12">
          <motion.h2
            variants={itemVariants}
            className="text-2xl md:text-4xl font-bold text-gray-900 mb-4"
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3 }}
          >
            {contactSection.title}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto"
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {contactSection.description ||
              "Estamos aquí para responder a tus preguntas y ayudarte con tus necesidades. No dudes en ponerte en contacto con nosotros."}
          </motion.p>
        </div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-[1200px] mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Información de contacto con imagen de fondo */}
              <motion.div
                variants={itemVariants}
                className="relative text-primary-foreground p-6 md:p-8 min-h-[400px] md:min-h-[500px] lg:min-h-[450px]"
              >
                {/* Imagen de fondo */}
                {contactInfoCard?.imageUrl && (
                  <Image
                    src={contactInfoCard.imageUrl || "/placeholder.svg"}
                    alt={contactInfoCard.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}

                {/* Overlay oscuro más intenso */}
                <div className="absolute inset-0 bg-black/60"></div>

                {/* Contenido sobre la imagen */}
                <div className="relative z-10 h-full flex flex-col">
                  <motion.h2 variants={itemVariants} className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">
                    {contactInfoCard?.title || "Información de Contacto"}
                  </motion.h2>
                  <motion.p variants={itemVariants} className="mb-4 md:mb-6 text-white/90 text-sm md:text-base">
                    {contactInfoCard?.description ||
                      (shopInfo?.name
                        ? `Contacta con ${shopInfo.name} para cualquier consulta.`
                        : "Estamos aquí para ayudarte con cualquier consulta que tengas.")}
                  </motion.p>

                  <motion.div variants={containerVariants} className="space-y-3 md:space-y-4 flex-1">
                    <motion.div variants={itemVariants} className="flex items-start">
                      <MapPin className="w-5 h-5 md:w-6 md:h-6 mr-3 flex-shrink-0 text-white" />
                      <div>
                        <p className="text-xs md:text-sm font-medium mb-1 text-white">Dirección</p>
                        <p className="text-white/90 text-xs md:text-sm">{contactInfo.address}</p>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-start">
                      <Phone className="w-5 h-5 md:w-6 md:h-6 mr-3 flex-shrink-0 text-white" />
                      <div>
                        <p className="text-xs md:text-sm font-medium mb-1 text-white">Teléfono</p>
                        <p className="text-white/90 text-xs md:text-sm">{contactInfo.phone}</p>
                        {shopInfo?.supportPhone && shopInfo.supportPhone !== shopInfo.phone && (
                          <p className="text-white/90 text-xs md:text-sm">{shopInfo.supportPhone}</p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-start">
                      <Mail className="w-5 h-5 md:w-6 md:h-6 mr-3 flex-shrink-0 text-white" />
                      <div>
                        <p className="text-xs md:text-sm font-medium mb-1 text-white">Email</p>
                        <p className="text-white/90 text-xs md:text-sm">{contactInfo.email}</p>
                        {shopInfo?.supportEmail && shopInfo.supportEmail !== shopInfo.email && (
                          <p className="text-white/90 text-xs md:text-sm">{shopInfo.supportEmail}</p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-start">
                      <Clock className="w-5 h-5 md:w-6 md:h-6 mr-3 flex-shrink-0 text-white" />
                      <div>
                        <p className="text-xs md:text-sm font-medium mb-1 text-white">Horarios</p>
                        <p className="text-white/90 text-xs md:text-sm">{contactInfo.businessHours}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Formulario */}
              <motion.div variants={itemVariants} className="p-6 md:p-8">
                <motion.h2 variants={itemVariants} className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                  {messageCard?.title || "Envíanos un mensaje"}
                </motion.h2>

                <motion.form
                  variants={containerVariants}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-3 md:space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <motion.div variants={itemVariants}>
                      <Label htmlFor="name" className="text-sm">
                        Nombre completo
                      </Label>
                      <Input id="name" {...register("name")} className="text-sm" />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <Label htmlFor="email" className="text-sm">
                        Correo electrónico
                      </Label>
                      <Input id="email" type="email" {...register("email")} className="text-sm" />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <motion.div variants={itemVariants}>
                      <Label htmlFor="phone" className="text-sm">
                        Teléfono
                      </Label>
                      <Input id="phone" {...register("phone")} className="text-sm" />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <Label htmlFor="company" className="text-sm">
                        Empresa (opcional)
                      </Label>
                      <Input id="company" {...register("company")} className="text-sm" />
                    </motion.div>
                  </div>

                  <motion.div variants={itemVariants}>
                    <Label htmlFor="subject" className="text-sm">
                      Asunto
                    </Label>
                    <Select onValueChange={handleSubjectChange} defaultValue="">
                      <SelectTrigger id="subject" className="text-sm">
                        <SelectValue placeholder="Selecciona un asunto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consulta">Consulta general</SelectItem>
                        <SelectItem value="producto">Información de producto</SelectItem>
                        <SelectItem value="presupuesto">Pedido o Cotización</SelectItem>
                        <SelectItem value="soporte">Soporte técnico</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Label htmlFor="message" className="text-sm">
                      Mensaje
                    </Label>
                    <Textarea id="message" rows={3} {...register("message")} className="text-sm" />
                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                  </motion.div>

                  {/* Checkbox de términos y condiciones */}
                  <motion.div variants={itemVariants} className="flex items-start space-x-3 py-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={acceptTerms}
                      onCheckedChange={handleTermsChange}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="acceptTerms" className="text-xs md:text-sm leading-relaxed cursor-pointer">
                        Acepto los{" "}
                        <a
                          href="/terminos-y-condiciones"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                          style={{ color: shopInfo?.primaryColor || undefined }}
                        >
                          términos y condiciones
                        </a>{" "}
                        y la{" "}
                        <a
                          href="/politica-de-privacidad"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                          style={{ color: shopInfo?.primaryColor || undefined }}
                        >
                          política de privacidad
                        </a>
                        .
                      </Label>
                      {errors.acceptTerms && <p className="text-xs text-red-500 mt-1">{errors.acceptTerms.message}</p>}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} transition={{ delay: 0.1 }}>
                    <Button
                      type="submit"
                      className="w-full text-sm md:text-base"
                      disabled={isSubmitting || !acceptTerms}
                      style={{
                        backgroundColor: shopInfo?.primaryColor || undefined,
                      }}
                    >
                      {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                    </Button>
                  </motion.div>
                </motion.form>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
