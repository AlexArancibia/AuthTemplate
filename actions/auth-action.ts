"use server"

import { signIn } from "@/auth"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/send-verification"
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
      return { error: error.cause?.err?.message }
    }
    return { error: "error 500" }
  }
}

export const registerAction = async (values: z.infer<typeof registerSchema>) => {
  try {
    const { data, success } = registerSchema.safeParse(values)
    if (!success) {
      return {
        error: "Invalid data",
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
          error: "To confirm your identity, sign in with the same account you used originally.",
        }
      }
      return {
        error: "User already exists",
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
      const verificationUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
      const result = await sendVerificationEmail({
        email: data.email,
        verificationToken: token,
        verificationUrl,
      })
      if (!result.success) {
        throw new Error(result.error || "Error enviando email de verificación")
      }
    } catch (error) {
      console.error("Error enviando email de verificación:", error)
    }

    return { success: true, message: "Cuenta creada correctamente. Revisa tu correo para verificarla." }
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message }
    }
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Error desconocido" }
  }
}
