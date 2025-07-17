"use client"

import type React from "react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useEmailStore } from "@/stores/emailStore"
import { useMainStore } from "@/stores/mainStore"

interface WashingTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WashingTestDialog({ open, onOpenChange }: WashingTestDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { sendContactForm } = useEmailStore()
  const { cardSections } = useMainStore()

  // Buscar la sección específica para el formulario de prueba de lavado
  const washingTestSection = cardSections.find((section) => section.id === "cs_e6632e85-f35e")
  const washingTestCard = washingTestSection?.cards?.[0]

  // Textos dinámicos desde la card section
  const formTitle = washingTestSection?.title || "Solicitar prueba de lavado"
  const formSubtitle = washingTestSection?.subtitle || "Complete el formulario para solicitar su prueba gratuita"
  const imageQuoteTitle = washingTestCard?.title || "Solicite una demostración de lavado 100% gratuita"
  const imageQuoteDescription =
    washingTestCard?.description ||
    "Programe una cita a su lavandería, hotel o centro de lavado. Estaremos gustosos de comprobar la calidad de nuestros productos."
  const imageUrl =
    washingTestCard?.imageUrl ||
    "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

  // Debug logging
  useEffect(() => {
    console.log("[WashingTestDialog] Card section found:", {
      sectionId: washingTestSection?.id,
      title: formTitle,
      subtitle: formSubtitle,
      cardTitle: imageQuoteTitle,
      cardDescription: imageQuoteDescription,
      imageUrl: imageUrl,
    })
  }, [washingTestSection, formTitle, formSubtitle, imageQuoteTitle, imageQuoteDescription, imageUrl])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formElement = e.target as HTMLFormElement
      const formData = new FormData(formElement)

      // Preparar los datos para el emailStore
      const formValues = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        message: formData.get("message") as string,
        subject: formTitle, // Usar el título dinámico como subject
      }

      console.log("[WashingTestDialog] Enviando formulario:", formValues)

      await sendContactForm(formValues)

      toast.success("Solicitud enviada correctamente", {
        description: "Nos pondremos en contacto contigo pronto para coordinar la prueba gratuita.",
      })

      // Limpiar el formulario
      formElement.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("[WashingTestDialog] Error al enviar el formulario:", error)
      toast.error("Error al enviar el formulario", {
        description: "Por favor, inténtelo de nuevo más tarde.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] sm:max-w-[900px] z-[456] rounded-xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">{formTitle}</DialogTitle>
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Form Section */}
          <div className="p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6">
              <div className="flex flex-col space-y-2 text-left">
                <h2 className="text-2xl font-semibold tracking-tight">{formTitle}</h2>
                <p className="text-sm text-muted-foreground">{formSubtitle}</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nombre"
                    required
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="E-mail"
                    type="email"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+51 999 000 000"
                    type="tel"
                    required
                    disabled={isLoading}
                    autoComplete="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <textarea
                    id="message"
                    name="message"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describa brevemente su necesidad de lavado industrial..."
                    disabled={isLoading}
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Solicitar prueba gratuita"}
                </Button>
              </form>
            </div>
          </div>

          {/* Image Section */}
          <div className="relative hidden lg:block">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt="Laboratorio de pruebas"
              className="object-cover"
              fill
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 p-8 flex flex-col justify-end">
              <blockquote className="space-y-2">
                <p className="text-lg text-white">{imageQuoteTitle}</p>
                <footer className="text-sm text-white/80">{imageQuoteDescription}</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
