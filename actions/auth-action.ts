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
    console.log("🎫 [REGISTER] Token generado:", token.substring(0, 10) + "...")
    await db.verificationToken.create({
      data: {
        identifier: data.email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    })
    console.log("✅ [REGISTER] Token guardado en BD para:", data.email)
    
    try {
      const emailApiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email/send-verification`
      console.log("📤 [REGISTER] Intentando enviar email a:", emailApiUrl)
      console.log("📤 [REGISTER] Email destino:", data.email)
      
      const response = await fetch(emailApiUrl, {
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
      
      console.log("📬 [REGISTER] Respuesta del servidor:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
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
        console.error("❌ [REGISTER] Error en respuesta:", result)
        throw new Error(result.error || "Error enviando email de verificación")
      }
      
      console.log("✅ [REGISTER] Email enviado exitosamente")
    } catch (error) {
      // Log del error pero no fallar el proceso
      console.error("💥 [REGISTER] ERROR CRÍTICO enviando email de verificación:")
      console.error("💥 [REGISTER] Tipo de error:", error instanceof Error ? "Error" : typeof error)
      console.error("💥 [REGISTER] Mensaje:", error instanceof Error ? error.message : JSON.stringify(error))
      console.error("💥 [REGISTER] Stack:", error instanceof Error ? error.stack : "N/A")
    }

    // Avisar que la cuenta fue creada
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
