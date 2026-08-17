"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
    <div className="w-full max-w-md">
      <div className="flex justify-center mb-8">
        <Image src="/logos/logo.png" alt="Scentra" width={120} height={20} className="h-5 w-auto" priority />
      </div>

      <Card className="border border-border rounded-none shadow-none bg-background">
        <CardHeader className="space-y-2 pb-6 text-center">
          <CardTitle className="font-display text-3xl font-normal text-foreground">
            ¿Olvidaste tu contraseña?
          </CardTitle>
          <CardDescription className="text-muted-foreground">
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
                    <FormLabel className="text-sm font-medium text-foreground">Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="nombre@ejemplo.com"
                        className="h-11 rounded-none border-border bg-background"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200">
                  {success}
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
                    Enviando enlace...
                  </>
                ) : (
                  "Enviar enlace de reseteo"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center pb-8 pt-2 text-sm text-muted-foreground">
          ¿Recuerdas tu contraseña?{" "}
          <Link href="/login" className="ml-1 font-medium text-brand hover:text-brand-dark transition-colors">
            Inicia sesión
          </Link>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Scentra. Todos los derechos reservados.
      </div>
    </div>
  )
}
