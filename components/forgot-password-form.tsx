"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Mail, Loader2 } from "lucide-react"

import { forgotPassword } from "@/actions/forgot-password-action"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo válido." }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = (values: ForgotPasswordFormValues) => {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await forgotPassword(values.email)
      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      }
      if (result?.success) {
        setSuccess(result.success)
        toast.success(result.success)
        form.reset()
      }
    })
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Background Blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-pink-100/10 blur-3xl" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-sky-100/10 blur-3xl" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-100/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-lg">
            <Mail className="h-6 w-6 text-white" />
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-slate-700">
              ¿Olvidaste tu contraseña?
            </CardTitle>
            <CardDescription className="text-center text-slate-500">
              Ingresa tu correo y te enviaremos un enlace para restablecerla.
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
                          type="email"
                          placeholder="nombre@ejemplo.com"
                          className="h-11 bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 transition-all duration-200"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded-md">
                    {success}
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
                      Enviando enlace...
                    </>
                  ) : (
                    "Enviar enlace de reseteo"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-center pb-8 pt-2 text-xs text-slate-500">
            ¿Recuerdas tu contraseña?{" "}
            <a href="/login" className="ml-1 font-medium text-slate-600 hover:text-slate-800 hover:underline transition-colors">
              Inicia sesión
            </a>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Clefast. Todos los derechos reservados.
        </div>
      </div>
    </div>
  )
}
