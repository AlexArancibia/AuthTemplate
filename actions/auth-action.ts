"use server"

import { signIn } from "@/auth"
import { db } from "@/lib/db"
import { type loginSchema, registerSchema } from "@/lib/zod"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import type { z } from "zod"
import { nanoid } from "nanoid"

export const loginAction = async (values: z.infer<typeof loginSchema>) => {
  try {
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      const msg =
        error.message ||
        (error.cause as { err?: { message?: string }; message?: string })?.err?.message ||
        (error.cause as { message?: string })?.message;
      return { error: msg || "Correo o contraseña incorrectos. Verifica tus datos." };
    }
    return { error: "Ha ocurrido un error. Intenta de nuevo." };
  }
}

export const registerAction = async (values: z.infer<typeof registerSchema>) => {
  try {
    const { data, success } = registerSchema.safeParse(values)
    if (!success) {
      return {
        error: "Datos inválidos. Verifica el formulario e intenta de nuevo.",
      }
    }

    // verificar si el usuario ya existe
    const user = await db.user.findUnique({
      where: {
        email: data.email,
      },
      include: {
        accounts: true, // Incluir las cuentas asociadas
      },
    })

    if (user) {
      // Verificar si tiene cuentas OAuth vinculadas
      const oauthAccounts = user.accounts.filter((account: any) => account.type === "oauth")
      if (oauthAccounts.length > 0) {
        return {
          error: "Esta cuenta ya existe con Google. Inicia sesión con Google para continuar.",
        }
      }
      return {
        error: "Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.",
      }
    }

    // hash de la contraseña
    const passwordHash = await bcrypt.hash(data.password, 10)

    // crear el usuario
    await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: passwordHash,
      },
    })

    // Eliminar token anterior si existe
    await db.verificationToken.deleteMany({
      where: { identifier: data.email },
    })
    // Crear token de verificación y enviar email
    const token = nanoid()
    await db.verificationToken.create({
      data: {
        identifier: data.email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    })
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          verificationToken: token,
          verificationUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
        })
      })
      const contentType = response.headers.get('content-type')
      let result
      if (contentType && contentType.includes('application/json')) {
        result = await response.json()
      } else {
        const text = await response.text()
        throw new Error(`Respuesta no es JSON: ${text}`)
      }
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error enviando email de verificación")
      }
    } catch (error) {
      // Log del error pero no fallar el proceso
      console.error("Error enviando email de verificación:", error)
    }

    // Avisar que la cuenta fue creada
    return { success: true, message: "Cuenta creada correctamente. Revisa tu correo para verificarla." }
  } catch (error) {
    if (error instanceof AuthError) {
      const msg =
        error.message ||
        (error.cause as { err?: { message?: string }; message?: string })?.err?.message ||
        (error.cause as { message?: string })?.message;
      return { error: msg || "Error de autenticación." };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Ha ocurrido un error. Intenta de nuevo." };
  }
}
