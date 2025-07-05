"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import Link from "next/link"
import { toast } from "sonner"

import { loginSchema } from "@/lib/zod"
import { loginAction } from "@/actions/auth-action"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ButtonSocial from "./button-social"
import { Eye, EyeOff, Loader2, Github, Mail } from "lucide-react"

interface FormLoginProps {
  isVerified?: boolean;
  OAuthAccountNotLinked?: boolean;
  bottomMessage?: string | null;
  messageType?: "success" | "error";
}

const FormLogin = ({
  isVerified,
  OAuthAccountNotLinked,
  bottomMessage,
  messageType = "success",
}: FormLoginProps) => {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    startTransition(async () => {
      const response = await loginAction(values)
      if (response.error) {
        toast.error("Error de inicio de sesión", {
          description: response.error,
        })
      } else {
        toast.success("Inicio de sesión exitoso", {
          description: `Redirigiendo a ${redirectTo}...`,
        })
        router.push(redirectTo)
      }
    })
  }

  // Show notifications for special states
  useEffect(() => {
    if (isVerified) {
      toast.success("Email verificado", {
        description: "Tu correo electrónico ha sido verificado correctamente. Ya puedes iniciar sesión.",
      })
    }

    if (OAuthAccountNotLinked) {
      toast.error("Cuenta no vinculada", {
        description: "Para confirmar tu identidad, inicia sesión con la misma cuenta que usaste originalmente.",
      })
    }
  }, [isVerified, OAuthAccountNotLinked])

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Decorative elements with more subtle colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-rose-100/10 blur-3xl" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-teal-100/10 blur-3xl" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-sky-100/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo with more subtle gradient */}
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-lg">
            <Mail className="h-6 w-6 text-white" />
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-slate-700">Bienvenido de nuevo</CardTitle>
            <CardDescription className="text-center text-slate-500">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium text-slate-700">Contraseña</FormLabel>
                        <Link
                          href={`/forgot-password${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                          className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
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
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Mostrar mensaje de error/éxito de reseteo de contraseña */}
                {bottomMessage && (
                  <div className={`p-3 text-sm rounded-md ${
                    messageType === "error"
                      ? "text-red-700 bg-red-100 border border-red-300"
                      : "text-green-700 bg-green-100 border border-green-300"
                  }`}>
                    {bottomMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 mt-2 bg-slate-700 hover:bg-slate-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400">O continuar con</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ButtonSocial
                provider="github"
              >
                <Github className="mr-2 h-4 w-4" />
                <span>GitHub</span>
              </ButtonSocial>

              <ButtonSocial
                provider="google"
              >
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
              ¿No tienes una cuenta?{" "}
              <Link
                href={`/register${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                className="font-medium text-slate-600 hover:text-slate-800 hover:underline transition-colors"
              >
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.
        </div>
      </div>
    </div>
  )
}

export default FormLogin