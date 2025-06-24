"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { UserWithRelations } from "@/stores/userStore"

// Esquema para cambiar contraseña (cuando ya tiene una)
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
      .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Por favor confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

// Esquema para establecer contraseña (cuando no tiene una)
const passwordSetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
      .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Por favor confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type PasswordChangeValues = z.infer<typeof passwordChangeSchema>
type PasswordSetValues = z.infer<typeof passwordSetSchema>

interface UserPasswordFormProps {
  user: UserWithRelations
}

export function UserPasswordForm({ user }: UserPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasPassword, setHasPassword] = useState(!!user.password)

  // Formulario para cambiar contraseña
  const changeForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Formulario para establecer contraseña
  const setForm = useForm<PasswordSetValues>({
    resolver: zodResolver(passwordSetSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmitChange(data: PasswordChangeValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/users/${user.id}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al cambiar la contraseña")
      }

      toast.success("Contraseña actualizada correctamente")
      changeForm.reset()
    } catch (error: any) {
      console.error("Error changing password:", error)
      toast.error(error.message || "Error al cambiar la contraseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onSubmitSet(data: PasswordSetValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/users/${user.id}/set-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: data.newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al establecer la contraseña")
      }

      toast.success("Contraseña establecida correctamente")
      setForm.reset()
      setHasPassword(true)
    } catch (error: any) {
      console.error("Error setting password:", error)
      toast.error(error.message || "Error al establecer la contraseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!hasPassword) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No tienes contraseña configurada</AlertTitle>
          <AlertDescription>
            Actualmente estás iniciando sesión a través de un proveedor externo. Puedes establecer una contraseña para
            iniciar sesión directamente con tu email.
          </AlertDescription>
        </Alert>

        <Form {...setForm}>
          <form onSubmit={setForm.handleSubmit(onSubmitSet)} className="space-y-6">
            <FormField
              control={setForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormDescription>
                    La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={setForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Establecer contraseña
            </Button>
          </form>
        </Form>
      </div>
    )
  }

  return (
    <Form {...changeForm}>
      <form onSubmit={changeForm.handleSubmit(onSubmitChange)} className="space-y-6">
        <FormField
          control={changeForm.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña actual</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={changeForm.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormDescription>
                La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={changeForm.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar nueva contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Cambiar contraseña
        </Button>
      </form>
    </Form>
  )
}