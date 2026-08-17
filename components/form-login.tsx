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
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Image from "next/image"
import { useUserStore } from "@/stores/userStore"

interface FormLoginProps {
  isVerified?: boolean;
  bottomMessage?: string | null;
  messageType?: "success" | "error";
}

const FormLogin = ({
  isVerified,
  bottomMessage,
  messageType = "success",
}: FormLoginProps) => {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const fetchUserByEmail = useUserStore((state) => state.fetchUserByEmail)

  // Si viene del checkout, marcar para que al redirigir arranque en CUSTOMER_INFO (no en CART_REVIEW)
  useEffect(() => {
    if (typeof window !== "undefined" && redirectTo && redirectTo.startsWith("/checkout")) {
      sessionStorage.setItem("checkout_from_login", "1")
    }
  }, [redirectTo])

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setFormError(null);
    startTransition(async () => {
      toast.loading("Verificando credenciales...", { id: "login" })
      try {
        const response = await loginAction(values)
        if (response.error) {
          setFormError(response.error);
          toast.error("Error de inicio de sesión", {
            id: "login",
            description: response.error,
          })
        } else {
          await fetchUserByEmail(values.email)
          toast.success("¡Inicio de sesión exitoso!", {
            id: "login",
            description: "Redirigiendo...",
          })
          if (redirectTo && redirectTo !== "/") {
            router.push(redirectTo.startsWith("/checkout") ? `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}auth=success` : redirectTo)
          } else {
            router.push("/?auth=success")
          }
        }
      } catch {
        const errMsg = "Ocurrió un error inesperado. Intenta de nuevo.";
        setFormError(errMsg);
        toast.error("Error de inicio de sesión", {
          id: "login",
          description: errMsg,
        })
      }
    })
  }

  // Toast para email verificado
  useEffect(() => {
    if (isVerified) {
      toast.success("Email verificado", {
        description: "Tu correo electrónico ha sido verificado correctamente. Ya puedes iniciar sesión.",
      })
    }
  }, [isVerified])

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Image src="/logos/logo.png" alt="Scentra" width={120} height={20} className="h-5 w-auto" priority />
      </div>

      <Card className="border border-border rounded-none shadow-none bg-background">
        <CardHeader className="space-y-2 pb-6 text-center">
          <CardTitle className="font-display text-3xl font-normal text-foreground">Bienvenido de nuevo</CardTitle>
          <CardDescription className="text-muted-foreground">
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
                    <FormLabel className="text-sm font-medium text-foreground">Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="nombre@ejemplo.com"
                        type="email"
                        className="h-11 rounded-none border-border bg-background"
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
                        <FormLabel className="text-sm font-medium text-foreground">Contraseña</FormLabel>
                        <Link
                          href={`/forgot-password${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                          className="text-xs text-brand hover:text-brand-dark transition-colors"
                        >
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            className="h-11 pr-10 rounded-none border-border bg-background"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
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

                {/* Mostrar mensaje de error/éxito (URL params o error de credenciales) */}
                {(bottomMessage || formError) && (
                  <div className={`p-3 text-sm ${
                    formError || messageType === "error"
                      ? "text-red-700 bg-red-50 border border-red-200"
                      : "text-green-700 bg-green-50 border border-green-200"
                  }`}>
                    {formError || bottomMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 mt-2 rounded-none"
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
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-background px-3 text-muted-foreground">O continuar con</span>
              </div>
            </div>

            <div>
              <ButtonSocial
                provider="google"
                callbackUrl={redirectTo}
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
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link
                href={`/register${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                className="font-medium text-brand hover:text-brand-dark transition-colors"
              >
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </Card>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Scentra. Todos los derechos reservados.
      </div>
    </div>
  )
}

export default FormLogin