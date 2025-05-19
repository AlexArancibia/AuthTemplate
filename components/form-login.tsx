"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { FaGithub, FaGoogle } from "react-icons/fa6"
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

interface FormLoginProps {
  isVerified?: boolean
  OAuthAccountNotLinked?: boolean
}

const FormLogin = ({ isVerified, OAuthAccountNotLinked }: FormLoginProps) => {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

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
          description: "Redirigiendo al panel de control...",
        })
        router.push("/dashboard")
      }
    })
  }

  // Mostrar notificaciones para estados especiales
  useState(() => {
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
  })

  return (
    <>
       <div className=" flex items-center bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 w-full h-[100vh] pt-16 ">

      <Card className="w-full max-w-md mx-auto shadow-xl border-neutral-200/50 bg-white/80 backdrop-blur-md ">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Bienvenido de nuevo</CardTitle>
          <CardDescription className="text-center">Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Contraseña</FormLabel>
                      <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-10" disabled={isPending}>
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
              <span className="bg-white/80 backdrop-blur-sm px-2 text-muted-foreground">O continuar con</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ButtonSocial provider="github" >
              <FaGithub className="mr-2 h-4 w-4" />
              <span>GitHub</span>
            </ButtonSocial>

            <ButtonSocial
              provider="google"
            >
              <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
              <span>Google</span>
            </ButtonSocial>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </Card>
      </div>
    </>
  )
}

export default FormLogin
