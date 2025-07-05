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
import { Check, Eye, EyeOff, Loader2, UserPlus } from "lucide-react"

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
    if (passwordValid === null) return "text-slate-500"
    return passwordValid ? "text-teal-600" : "text-rose-500"
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-rose-100/10 blur-3xl" />
          <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-teal-100/10 blur-3xl" />
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-sky-100/10 blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
            <CardHeader className="space-y-1 pb-2">
              <div className="mx-auto rounded-full bg-teal-50 p-3 w-16 h-16 flex items-center justify-center shadow-sm">
                <Check className="h-8 w-8 text-teal-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-center mt-4 text-slate-700">
                ¡Revisa tu bandeja de entrada!
              </CardTitle>
              <CardDescription className="text-center text-base text-slate-500">
                Hemos enviado un enlace de verificación a <span className="font-medium">{form.getValues("email")}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-slate-500">
                Por favor, revisa tu correo electrónico y haz clic en el enlace de verificación para completar tu
                registro. El enlace caducará en 24 horas.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 pb-8">
              <Button
                className="w-full h-11 border border-slate-200 hover:bg-slate-100 text-slate-700"
                variant="outline"
                onClick={() => router.push("/login")}
              >
                Volver al inicio de sesión
              </Button>
              <p className="text-sm text-slate-500 text-center">
                ¿No recibiste el correo?{" "}
                <Button variant="link" className="p-0 h-auto font-medium text-slate-600 hover:text-slate-800">
                  Reenviar correo de verificación
                </Button>
              </p>
            </CardFooter>
          </Card>

          <div className="mt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Clefast. Todos los derechos reservados.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 pt-16 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-rose-100/10 blur-3xl" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-teal-100/10 blur-3xl" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-sky-100/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo or brand element */}
 

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-slate-700">Crear una cuenta</CardTitle>
            <CardDescription className="text-center text-slate-500">
              Ingresa tus datos para crear tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-medium text-slate-700">Nombre completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Juan Pérez"
                          type="text"
                          className="h-11 bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 transition-all duration-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-medium text-slate-700">Correo electrónico</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="nombre@ejemplo.com"
                          type="email"
                          className="h-11 bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 transition-all duration-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-medium text-slate-700">Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            className="h-11 pr-10 bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 transition-all duration-200"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">
                              {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>

                      <p className={`text-xs mt-2 ${getPasswordRequirementsColor()}`}>
                        La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.
                      </p>

                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-slate-200 p-4 bg-white">
                  <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-slate-400">
                    <input
                      type="checkbox"
                      className="h-3 w-3 cursor-pointer"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      id="terms"
                    />
                  </div>
                  <div className="space-y-1 leading-none">
                    <label htmlFor="terms" className="text-sm text-slate-600 leading-none cursor-pointer">
                      Acepto los{" "}
                      <Link
                        href="/terms"
                        className="text-slate-700 hover:text-slate-900 hover:underline transition-colors"
                      >
                        Términos de Servicio
                      </Link>{" "}
                      y la{" "}
                      <Link
                        href="/privacy"
                        className="text-slate-700 hover:text-slate-900 hover:underline transition-colors"
                      >
                        Política de Privacidad
                      </Link>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 mt-2 bg-slate-700 hover:bg-slate-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  disabled={isPending}
                >
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

          <CardFooter className="flex justify-center pb-8 pt-2">
            <p className="text-sm text-slate-500">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="font-medium text-slate-600 hover:text-slate-800 hover:underline transition-colors"
              >
                Iniciar sesión
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Clefast. Todos los derechos reservados.
        </div>
      </div>
    </div>
  )
}

export default FormRegister
