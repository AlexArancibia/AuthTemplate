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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  BookOpen,
  FileText,
  User,
  AlertTriangle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Info,
  Shield,
  Clock,
  Building,
} from "lucide-react"
import { useEmailStore } from "@/stores/emailStore"
import Link from "next/link"
import { useMainStore } from "@/stores/mainStore"

const formSchema = z
  .object({
    // Datos del consumidor
    tipoDocumento: z.string().min(1, "Seleccione el tipo de documento"),
    numeroDocumento: z.string().min(8, "Número de documento inválido"),
    nombres: z.string().min(2, "Los nombres son requeridos"),
    apellidos: z.string().min(2, "Los apellidos son requeridos"),
    telefono: z.string().regex(/^\+?[0-9]{6,14}$/, "Número de teléfono inválido"),
    email: z.string().email("Correo electrónico inválido"),
    direccion: z.string().min(10, "La dirección debe tener al menos 10 caracteres"),

    // Datos del padre/madre (si es menor de edad)
    esMenorEdad: z.boolean(),
    nombresPadre: z.string().optional(),
    apellidosPadre: z.string().optional(),
    documentoPadre: z.string().optional(),

    // Identificación del bien contratado
    tipoOperacion: z.enum(["producto", "servicio"], {
      required_error: "Seleccione el tipo de operación",
    }),
    montoReclamado: z.string().min(1, "El monto es requerido"),
    descripcionBien: z.string().min(10, "Describa el producto o servicio"),

    // Detalle de la reclamación
    tipoReclamo: z.enum(["reclamo", "queja"], {
      required_error: "Seleccione el tipo de reclamo",
    }),
    detalleReclamo: z.string().min(20, "Describa detalladamente su reclamo (mínimo 20 caracteres)"),
    pedidoConsumidor: z.string().min(10, "Describa lo que solicita"),

    // Observaciones y acciones adoptadas
    observaciones: z.string().optional(),

    // Aceptación
    aceptaTerminos: z.boolean().refine((val) => val === true, {
      message: "Debe aceptar los términos y condiciones",
    }),
  })
  .refine(
    (data) => {
      // Si es menor de edad, validar que se proporcionen los datos del padre/madre
      if (data.esMenorEdad) {
        return data.nombresPadre && data.apellidosPadre && data.documentoPadre
      }
      return true
    },
    {
      message: "Los datos del padre/madre son requeridos para menores de edad",
      path: ["nombresPadre"],
    },
  )

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

export default function LibroReclamacionesPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [numeroReclamo, setNumeroReclamo] = useState("")
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
      tipoDocumento: "",
      numeroDocumento: "",
      nombres: "",
      apellidos: "",
      telefono: "",
      email: "",
      direccion: "",
      esMenorEdad: false,
      nombresPadre: "",
      apellidosPadre: "",
      documentoPadre: "",
      montoReclamado: "",
      descripcionBien: "",
      detalleReclamo: "",
      pedidoConsumidor: "",
      observaciones: "",
      aceptaTerminos: false,
    },
  })

  const esMenorEdad = watch("esMenorEdad")
  const tipoReclamo = watch("tipoReclamo")
  const aceptaTerminos = watch("aceptaTerminos")

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      // Generar número de reclamo
      const numeroReclamoGenerado = `REC-${Date.now().toString().slice(-8)}`
      setNumeroReclamo(numeroReclamoGenerado)

      // Preparar datos para envío por email
      const emailData = {
        name: `${data.nombres} ${data.apellidos}`,
        email: data.email,
        phone: data.telefono,
        subject: `Libro de Reclamaciones - ${data.tipoReclamo.toUpperCase()} #${numeroReclamoGenerado}`,
        message: `
LIBRO DE RECLAMACIONES
Número de Reclamo: ${numeroReclamoGenerado}
Fecha: ${new Date().toLocaleDateString("es-PE")}

=== DATOS DEL CONSUMIDOR ===
Tipo de Documento: ${data.tipoDocumento.toUpperCase()}
Número de Documento: ${data.numeroDocumento}
Nombres: ${data.nombres}
Apellidos: ${data.apellidos}
Teléfono: ${data.telefono}
Email: ${data.email}
Dirección: ${data.direccion}

${
  data.esMenorEdad
    ? `
=== DATOS DEL PADRE/MADRE (MENOR DE EDAD) ===
Nombres: ${data.nombresPadre || "No especificado"}
Apellidos: ${data.apellidosPadre || "No especificado"}
Documento: ${data.documentoPadre || "No especificado"}
`
    : ""
}

=== IDENTIFICACIÓN DEL BIEN CONTRATADO ===
Tipo de Operación: ${data.tipoOperacion === "producto" ? "Producto" : "Servicio"}
Monto Reclamado: S/ ${data.montoReclamado}
Descripción: ${data.descripcionBien}

=== DETALLE DE LA RECLAMACIÓN ===
Tipo: ${data.tipoReclamo === "reclamo" ? "RECLAMO" : "QUEJA"}
${
  data.tipoReclamo === "reclamo"
    ? "RECLAMO: Disconformidad relacionada a los productos o servicios."
    : "QUEJA: Disconformidad no relacionada a los productos o servicios; o, malestar o descontento respecto a la atención al público."
}

Detalle: ${data.detalleReclamo}

Pedido del Consumidor: ${data.pedidoConsumidor}

${data.observaciones ? `Observaciones: ${data.observaciones}` : ""}

=== INFORMACIÓN LEGAL ===
- La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.
- El proveedor deberá dar respuesta al reclamo en un plazo no mayor a treinta (30) días calendario.
- En caso de no obtener respuesta satisfactoria, puede acudir al INDECOPI o a los órganos correspondientes.

Fecha de Presentación: ${new Date().toLocaleDateString("es-PE")}
Hora: ${new Date().toLocaleTimeString("es-PE")}
        `,
      }

      await sendContactForm(emailData)

      setIsSubmitted(true)
      toast.success("Reclamo registrado exitosamente", {
        description: `Su reclamo ha sido registrado con el número ${numeroReclamoGenerado}`,
      })

      reset()
    } catch (error) {
      console.error("Error al enviar el reclamo:", error)
      toast.error("Error al registrar el reclamo", {
        description: "Por favor, inténtelo de nuevo más tarde.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMenorEdadChange = (checked: boolean) => {
    setValue("esMenorEdad", checked, { shouldValidate: true })
  }

  const handleTipoReclamoChange = (value: string) => {
    setValue("tipoReclamo", value as "reclamo" | "queja", { shouldValidate: true })
  }

  const handleTipoOperacionChange = (value: string) => {
    setValue("tipoOperacion", value as "producto" | "servicio", { shouldValidate: true })
  }

  const handleTipoDocumentoChange = (value: string) => {
    setValue("tipoDocumento", value, { shouldValidate: true })
  }

  const handleTerminosChange = (checked: boolean) => {
    setValue("aceptaTerminos", checked, { shouldValidate: true })
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

  if (isSubmitted) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-lg p-8 text-center"
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Reclamo Registrado Exitosamente!</h2>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">Número de Reclamo:</p>
                <p className="text-2xl font-bold text-green-900">{numeroReclamo}</p>
              </div>

              <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Información importante:</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <Clock className="w-4 h-4 mt-0.5 mr-2 text-blue-500 flex-shrink-0" />
                    Recibirá respuesta en un plazo máximo de 30 días calendario.
                  </li>
                  <li className="flex items-start">
                    <Mail className="w-4 h-4 mt-0.5 mr-2 text-blue-500 flex-shrink-0" />
                    Se ha enviado una copia de su reclamo a su correo electrónico.
                  </li>
                  <li className="flex items-start">
                    <Shield className="w-4 h-4 mt-0.5 mr-2 text-blue-500 flex-shrink-0" />
                    Puede acudir a INDECOPI si no obtiene respuesta satisfactoria.
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setIsSubmitted(false)
                    setNumeroReclamo("")
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Registrar otro reclamo
                </Button>
                <Button asChild className="w-full">
                  <Link href="/">Volver al inicio</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center mb-6"
          >
            <BookOpen className="w-12 h-12 text-primary mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Libro de Reclamaciones</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-6"
          >
            {shopInfo?.name || "Nuestra empresa"} - Registro oficial de reclamos y quejas según normativa peruana
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center text-sm text-gray-500"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Fecha:{" "}
            {new Date().toLocaleDateString("es-PE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </motion.div>
        </div>

        {/* Información Legal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Info className="w-5 h-5 mr-2" />
                Información Legal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-2">RECLAMO:</p>
                  <p>Disconformidad relacionada a los productos o servicios.</p>
                </div>
                <div>
                  <p className="font-medium mb-2">QUEJA:</p>
                  <p>Disconformidad no relacionada a los productos o servicios; o, malestar respecto a la atención.</p>
                </div>
              </div>
              <div className="bg-blue-100 rounded-lg p-3 mt-4">
                <p className="font-medium mb-2">Importante:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>La formulación del reclamo no impide acudir a otras vías de solución de controversias.</li>
                  <li>No es requisito previo para interponer una denuncia ante el INDECOPI.</li>
                  <li>El proveedor deberá dar respuesta en un plazo no mayor a treinta (30) días calendario.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Formulario Principal */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-[1200px] mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="grid lg:grid-cols-5">
              {/* Información de la empresa */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8"
                style={{
                  background: shopInfo?.primaryColor
                    ? `linear-gradient(135deg, ${shopInfo.primaryColor}, ${shopInfo.primaryColor}CC)`
                    : undefined,
                }}
              >
                <div className="relative z-10">
                  <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6">
                    Información de la Empresa
                  </motion.h2>
                  <motion.p variants={itemVariants} className="mb-6 text-primary-foreground/90">
                    {shopInfo?.name
                      ? `Registre su reclamo o queja contra ${shopInfo.name}.`
                      : "Complete el formulario para registrar su reclamo o queja."}
                  </motion.p>

                  <motion.div variants={containerVariants} className="space-y-4">
                    {shopInfo?.name && (
                      <motion.div variants={itemVariants} className="flex items-start">
                        <Building className="w-6 h-6 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium mb-1">Empresa</p>
                          <p className="text-primary-foreground/90">{shopInfo.name}</p>
                        </div>
                      </motion.div>
                    )}

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
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-start">
                      <Mail className="w-6 h-6 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium mb-1">Email</p>
                        <p className="text-primary-foreground/90">{contactInfo.email}</p>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-start">
                      <Clock className="w-6 h-6 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium mb-1">Horarios de Atención</p>
                        <p className="text-primary-foreground/90">{contactInfo.businessHours}</p>
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-primary-foreground/20">
                    <div className="bg-primary-foreground/10 rounded-lg p-4">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Sus Derechos
                      </h3>
                      <ul className="text-xs space-y-1 text-primary-foreground/90">
                        <li>• Respuesta en máximo 30 días calendario</li>
                        <li>• Derecho a acudir a INDECOPI</li>
                        <li>• Protección del consumidor</li>
                        <li>• Confidencialidad de sus datos</li>
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Formulario */}
              <motion.div variants={itemVariants} className="lg:col-span-3 p-8">
                <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6">
                  Formulario de Reclamo/Queja
                </motion.h2>

                <motion.form variants={containerVariants} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Datos del Consumidor */}
                  <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary" />
                      1. Datos del Consumidor
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
                          <Select onValueChange={handleTipoDocumentoChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dni">DNI</SelectItem>
                              <SelectItem value="ce">Carné de Extranjería</SelectItem>
                              <SelectItem value="pasaporte">Pasaporte</SelectItem>
                              <SelectItem value="ruc">RUC</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.tipoDocumento && (
                            <p className="text-sm text-red-500 mt-1">{errors.tipoDocumento.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="numeroDocumento">Número de Documento</Label>
                          <Input id="numeroDocumento" {...register("numeroDocumento")} />
                          {errors.numeroDocumento && (
                            <p className="text-sm text-red-500 mt-1">{errors.numeroDocumento.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nombres">Nombres</Label>
                          <Input id="nombres" {...register("nombres")} />
                          {errors.nombres && <p className="text-sm text-red-500 mt-1">{errors.nombres.message}</p>}
                        </div>

                        <div>
                          <Label htmlFor="apellidos">Apellidos</Label>
                          <Input id="apellidos" {...register("apellidos")} />
                          {errors.apellidos && <p className="text-sm text-red-500 mt-1">{errors.apellidos.message}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="telefono">Teléfono</Label>
                          <Input id="telefono" {...register("telefono")} />
                          {errors.telefono && <p className="text-sm text-red-500 mt-1">{errors.telefono.message}</p>}
                        </div>

                        <div>
                          <Label htmlFor="email">Correo Electrónico</Label>
                          <Input id="email" type="email" {...register("email")} />
                          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="direccion">Dirección</Label>
                        <Input id="direccion" {...register("direccion")} />
                        {errors.direccion && <p className="text-sm text-red-500 mt-1">{errors.direccion.message}</p>}
                      </div>

                      {/* Menor de edad */}
                      <div className="flex items-center space-x-2">
                        <Checkbox id="esMenorEdad" checked={esMenorEdad} onCheckedChange={handleMenorEdadChange} />
                        <Label htmlFor="esMenorEdad" className="text-sm">
                          El consumidor es menor de edad
                        </Label>
                      </div>

                      {esMenorEdad && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-4">
                          <h4 className="font-medium text-yellow-800">Datos del Padre/Madre o Tutor</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="nombresPadre">Nombres del Padre/Madre</Label>
                              <Input id="nombresPadre" {...register("nombresPadre")} />
                            </div>
                            <div>
                              <Label htmlFor="apellidosPadre">Apellidos del Padre/Madre</Label>
                              <Input id="apellidosPadre" {...register("apellidosPadre")} />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="documentoPadre">Documento del Padre/Madre</Label>
                            <Input id="documentoPadre" {...register("documentoPadre")} />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Identificación del Bien */}
                  <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-primary" />
                      2. Bien Contratado
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Tipo de Operación</Label>
                        <RadioGroup onValueChange={handleTipoOperacionChange} className="mt-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="producto" id="producto" />
                            <Label htmlFor="producto">Producto</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="servicio" id="servicio" />
                            <Label htmlFor="servicio">Servicio</Label>
                          </div>
                        </RadioGroup>
                        {errors.tipoOperacion && (
                          <p className="text-sm text-red-500 mt-1">{errors.tipoOperacion.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="montoReclamado">Monto Reclamado (S/)</Label>
                          <Input id="montoReclamado" type="number" step="0.01" {...register("montoReclamado")} />
                          {errors.montoReclamado && (
                            <p className="text-sm text-red-500 mt-1">{errors.montoReclamado.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="descripcionBien">Descripción del Producto o Servicio</Label>
                        <Textarea
                          id="descripcionBien"
                          rows={3}
                          {...register("descripcionBien")}
                          placeholder="Describa detalladamente el producto o servicio"
                        />
                        {errors.descripcionBien && (
                          <p className="text-sm text-red-500 mt-1">{errors.descripcionBien.message}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Detalle de la Reclamación */}
                  <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
                      3. Detalle del Reclamo/Queja
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Tipo de Reclamo</Label>
                        <RadioGroup onValueChange={handleTipoReclamoChange} className="mt-2">
                          <div className="flex items-start space-x-2">
                            <RadioGroupItem value="reclamo" id="reclamo" className="mt-1" />
                            <div>
                              <Label htmlFor="reclamo" className="font-medium">
                                Reclamo
                              </Label>
                              <p className="text-sm text-gray-600">Disconformidad con productos o servicios</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <RadioGroupItem value="queja" id="queja" className="mt-1" />
                            <div>
                              <Label htmlFor="queja" className="font-medium">
                                Queja
                              </Label>
                              <p className="text-sm text-gray-600">Malestar respecto a la atención recibida</p>
                            </div>
                          </div>
                        </RadioGroup>
                        {errors.tipoReclamo && (
                          <p className="text-sm text-red-500 mt-1">{errors.tipoReclamo.message}</p>
                        )}
                      </div>

                      {tipoReclamo && (
                        <div className="bg-gray-50 border rounded-lg p-3">
                          <Badge variant={tipoReclamo === "reclamo" ? "destructive" : "secondary"}>
                            {tipoReclamo === "reclamo" ? "RECLAMO" : "QUEJA"}
                          </Badge>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="detalleReclamo">Detalle del Reclamo/Queja</Label>
                        <Textarea
                          id="detalleReclamo"
                          rows={4}
                          {...register("detalleReclamo")}
                          placeholder="Describa detalladamente los hechos que motivan su reclamo o queja"
                        />
                        {errors.detalleReclamo && (
                          <p className="text-sm text-red-500 mt-1">{errors.detalleReclamo.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="pedidoConsumidor">Pedido del Consumidor</Label>
                        <Textarea
                          id="pedidoConsumidor"
                          rows={3}
                          {...register("pedidoConsumidor")}
                          placeholder="Indique qué solicita como solución"
                        />
                        {errors.pedidoConsumidor && (
                          <p className="text-sm text-red-500 mt-1">{errors.pedidoConsumidor.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
                        <Textarea
                          id="observaciones"
                          rows={2}
                          {...register("observaciones")}
                          placeholder="Observaciones adicionales"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Términos y Condiciones */}
                  <motion.div variants={itemVariants} className="flex items-start space-x-3 py-2">
                    <Checkbox
                      id="aceptaTerminos"
                      checked={aceptaTerminos}
                      onCheckedChange={handleTerminosChange}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="aceptaTerminos" className="text-sm leading-relaxed cursor-pointer">
                        Declaro que la información proporcionada es veraz y acepto que el presente reclamo sea procesado
                        conforme a la normativa vigente. Entiendo que la empresa tiene un plazo de 30 días calendario
                        para dar respuesta.
                      </Label>
                      {errors.aceptaTerminos && (
                        <p className="text-sm text-red-500 mt-1">{errors.aceptaTerminos.message}</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} transition={{ delay: 0.1 }}>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting || !aceptaTerminos}
                      style={{
                        backgroundColor: shopInfo?.primaryColor || undefined,
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Registrando reclamo...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-5 w-5" />
                          Registrar Reclamo
                        </>
                      )}
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
