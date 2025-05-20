"use client"

import type React from "react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"
import { useMainStore } from "@/stores/mainStore"

interface WashingTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WashingTestDialog({ open, onOpenChange }: WashingTestDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { submitFormEmail } = useMainStore()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formElement = e.target as HTMLFormElement
      const formData = new FormData(formElement)

      // Convertir FormData a un objeto para pasarlo a submitFormEmail
      const formValues = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        message: formData.get("message") as string,
        type: "Prueba de Lavado ", // Identificador del tipo de formulario
      }

      await submitFormEmail(formValues)

      toast.success("Solicitud enviada correctamente")
      onOpenChange(false)
    } catch (error) {
      console.error("Error al enviar el formulario:", error)
      toast.error("Error al enviar el formulario. Por favor, inténtelo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] sm:max-w-[900px] z-[456] rounded-xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Solicitar prueba de lavado</DialogTitle>
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Form Section */}
          <div className="p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6">
              <div className="flex flex-col space-y-2 text-left">
                <h2 className="text-2xl font-semibold tracking-tight">Solicitar prueba de lavado</h2>
                <p className="text-sm text-muted-foreground">
                  Complete el formulario para solicitar su prueba gratuita
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name"  name="name" placeholder="Juan Pérez" required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="juan@ejemplo.com"
                    type="email"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+34 600 000 000"
                    type="tel"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <textarea
                    id="message"
                    name="message"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describa brevemente su necesidad..."
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
              src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Laboratorio de pruebas"
              className="object-cover"
              fill
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 p-8 flex flex-col justify-end">
              <blockquote className="space-y-2">
                <p className="text-lg text-white">Solicite una demostración de lavado 100% gratuita</p>
                <footer className="text-sm text-white/80">
                  Programe una cita a su lavandería, hotel o centro de lavado. Estaremos gustosos de comprobar la
                  calidad de nuestros productos.
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

