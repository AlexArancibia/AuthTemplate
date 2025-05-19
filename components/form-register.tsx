"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import Link from "next/link"
import { toast } from "sonner"

import { registerSchema } from "@/lib/zod"
import { registerAction } from "@/actions/auth-action"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Eye, EyeOff, Loader2 } from "lucide-react"

const FormRegister = () => {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  })

  const watchPassword = form.watch("password")

  // Verificar si la contraseña cumple con los requisitos
  useEffect(() => {
    if (!watchPassword) {
      setPasswordValid(null)
      return
    }

    const isValid =
      watchPassword.length >= 8 &&
      /[A-Z]/.test(watchPassword) &&
      /[0-9]/.test(watchPassword) &&
      /[^A-Za-z0-9]/.test(watchPassword)

    setPasswordValid(isValid)
  }, [watchPassword])

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    if (!acceptedTerms) {
      toast.error("Términos no aceptados", {
        description: "Debes aceptar los Términos de Servicio y la Política de Privacidad para continuar.",
      })
      return
    }

    startTransition(async () => {
      const response = await registerAction(values)
      if (response.error) {
        toast.error("Error de registro", {
          description: response.error,
        })
      } else {
        setShowConfirmation(true)
      }
    })
  }

  // Obtener el color del texto de requisitos según el estado
  const getPasswordRequirementsColor = () => {
    if (passwordValid === null) return "text-gray-500"
    return passwordValid ? "text-green-600" : "text-red-500"
  }

  if (showConfirmation) {
    return (
      <>
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_40%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.2),transparent_40%)]" />
        </div>

        <Card className="w-full max-w-md mx-auto shadow-xl border-neutral-200/50 bg-white/80 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <div className="mx-auto rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-center mt-4">¡Revisa tu bandeja de entrada!</CardTitle>
            <CardDescription className="text-center text-base">
              Hemos enviado un enlace de verificación a <span className="font-medium">{form.getValues("email")}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Por favor, revisa tu correo electrónico y haz clic en el enlace de verificación para completar tu
              registro. El enlace caducará en 24 horas.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button className="w-full" variant="outline" onClick={() => router.push("/login")}>
              Volver al inicio de sesión
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              ¿No recibiste el correo?{" "}
              <Button variant="link" className="p-0 h-auto font-medium">
                Reenviar correo de verificación
              </Button>
            </p>
          </CardFooter>
        </Card>
      </>
    )
  }

  return (
    <>
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.2),transparent_40%)]" />
      </div>

      <Card className="w-full max-w-md mx-auto shadow-xl border-neutral-200/50 bg-white/80 backdrop-blur-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Crear una cuenta</CardTitle>
          <CardDescription className="text-center">Ingresa tus datos para crear tu cuenta</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" type="text" className="h-10 bg-white/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="nombre@ejemplo.com" type="email" className="h-10 bg-white/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          type={showPassword ? "text" : "password"}
                          className="h-10 pr-10 bg-white/50"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                        </Button>
                      </div>
                    </FormControl>

                    <p className={`text-xs mt-2 ${getPasswordRequirementsColor()}`}>
                      La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.
                    </p>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white/50">
                <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                  <input
                    type="checkbox"
                    className="h-3 w-3 cursor-pointer"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    id="terms"
                  />
                </div>
                <div className="space-y-1 leading-none">
                  <label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
                    Acepto los{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Términos de Servicio
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Política de Privacidad
                    </Link>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full h-10" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  )
}

export default FormRegister
