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
import { Separator } from "@/components/ui/separator"
import ButtonSocial from "./button-social"
import { Check, Eye, EyeOff, Loader2 } from "lucide-react"

const FormRegister = () => {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
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

    setFormError(null)
    startTransition(async () => {
      toast.loading("Creando tu cuenta...", { id: "register" })
      try {
        const response = await registerAction(values)
        if (response.error) {
          setFormError(response.error)
          toast.error("Error de registro", {
            id: "register",
            description: response.error,
          })
        } else {
          toast.success("¡Cuenta creada!", {
            id: "register",
            description: "Revisa tu correo para verificar tu cuenta.",
          })
          setShowConfirmation(true)
        }
      } catch {
        const errMsg = "Ocurrió un error inesperado. Intenta de nuevo."
        setFormError(errMsg)
        toast.error("Error de registro", {
          id: "register",
          description: errMsg,
        })
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
            © {new Date().getFullYear()} ANJ. Todos los derechos reservados.
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

                {formError && (
                  <div className="p-3 text-sm rounded-md text-red-700 bg-red-100 border border-red-300">
                    {formError}
                  </div>
                )}

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

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400">O continuar con</span>
              </div>
            </div>

            <div className="mt-4">
              <ButtonSocial provider="google" callbackUrl="/">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Google</span>
              </ButtonSocial>
            </div>
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
          © {new Date().getFullYear()} ANJ. Todos los derechos reservados.
        </div>
      </div>
    </div>
  )
}

export default FormRegister
