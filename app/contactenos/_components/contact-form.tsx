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
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { useEmailStore } from "@/stores/emailStore"
import { useMainStore } from "@/stores/mainStore"

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

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { shopSettings } = useMainStore()
  const { sendContactForm } = useEmailStore()

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

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center pb-12">
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-gray-900 mb-4"
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3 }}
          >
            Contáctanos
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto"
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {shopInfo?.description ||
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
            <div className="grid md:grid-cols-2">
              {/* Información de contacto */}
              <motion.div
                variants={itemVariants}
                className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8"
                style={{
                  background: shopInfo?.primaryColor
                    ? `linear-gradient(135deg, ${shopInfo.primaryColor}, ${shopInfo.primaryColor}CC)`
                    : undefined,
                }}
              >
                <div className="relative z-10">
                  <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6">
                    Información de Contacto
                  </motion.h2>
                  <motion.p variants={itemVariants} className="mb-6 text-primary-foreground/90">
                    {shopInfo?.name
                      ? `Contacta con ${shopInfo.name} para cualquier consulta.`
                      : "Estamos aquí para ayudarte con cualquier consulta que tengas."}
                  </motion.p>

                  <motion.div variants={containerVariants} className="space-y-4">
                    <motion.div variants={itemVariants} className="flex items-start">
                      <MapPin className="w-6 h-6 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium mb-1">Dirección</p>
                        <p className="text-primary-foreground/90">{contactInfo.address}</p>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-start">
                      <Phone className="w-6 h-6 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium mb-1">Teléfono</p>
                        <p className="text-primary-foreground/90">{contactInfo.phone}</p>
                        {shopInfo?.supportPhone && shopInfo.supportPhone !== shopInfo.phone && (
                          <p className="text-primary-foreground/90">{shopInfo.supportPhone}</p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-start">
                      <Mail className="w-6 h-6 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium mb-1">Email</p>
                        <p className="text-primary-foreground/90">{contactInfo.email}</p>
                        {shopInfo?.supportEmail && shopInfo.supportEmail !== shopInfo.email && (
                          <p className="text-primary-foreground/90">{shopInfo.supportEmail}</p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-start">
                      <Clock className="w-6 h-6 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium mb-1">Horarios</p>
                        <p className="text-primary-foreground/90">{contactInfo.businessHours}</p>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Información adicional de la tienda */}
                  {shopInfo?.domain && (
                    <motion.div variants={itemVariants} className="mt-6 pt-6 border-t border-primary-foreground/20">
                      <p className="text-sm font-medium mb-2">Sitio web</p>
                      <a
                        href={shopInfo.domain}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-foreground/90 hover:text-white transition-colors"
                      >
                        {shopInfo.domain}
                      </a>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Formulario */}
              <motion.div variants={itemVariants} className="p-8">
                <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6">
                  Envíanos un mensaje
                </motion.h2>

                <motion.form variants={containerVariants} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div variants={itemVariants}>
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input id="name" {...register("name")} />
                      {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input id="email" type="email" {...register("email")} />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div variants={itemVariants}>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" {...register("phone")} />
                      {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <Label htmlFor="company">Empresa (opcional)</Label>
                      <Input id="company" {...register("company")} />
                    </motion.div>
                  </div>

                  <motion.div variants={itemVariants}>
                    <Label htmlFor="subject">Asunto</Label>
                    <Select onValueChange={handleSubjectChange} defaultValue="">
                      <SelectTrigger id="subject">
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
                    {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea id="message" rows={4} {...register("message")} />
                    {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>}
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
                      <Label htmlFor="acceptTerms" className="text-sm leading-relaxed cursor-pointer">
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
                      {errors.acceptTerms && <p className="text-sm text-red-500 mt-1">{errors.acceptTerms.message}</p>}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} transition={{ delay: 0.1 }}>
                    <Button
                      type="submit"
                      className="w-full"
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
