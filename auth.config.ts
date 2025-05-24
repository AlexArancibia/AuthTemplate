import { db } from "@/lib/db";
import { loginSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    Google,
    GitHub,
    Credentials({
      authorize: async (credentials) => {
        const { data, success } = loginSchema.safeParse(credentials)

        if (!success) {
          throw new Error("Invalid credentials")
        }

        // verificar si existe el usuario en la base de datos
        const user = await db.user.findUnique({
          where: {
            email: data.email,
          },
        })

        if (!user || !user.password) {
          throw new Error("No user found")
        }

        // verificar si la contraseña es correcta
        const isValid = await bcrypt.compare(data.password, user.password)

        if (!isValid) {
          throw new Error("Incorrect password")
        }

        // verificación de email
        if (!user.emailVerified) {
          const verifyTokenExits = await db.verificationToken.findFirst({
            where: {
              identifier: user.email,
            },
          })

          // si existe un token, lo eliminamos
          if (verifyTokenExits?.identifier) {
            await db.verificationToken.delete({
              where: {
                identifier: user.email,
              },
            })
          }

          const token = nanoid()

          await db.verificationToken.create({
            data: {
              identifier: user.email,
              token,
              expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
          })

          // enviar email de verificación usando el API endpoint
          try {
            const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email/send-verification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                verificationToken: token,
                verificationUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
              })
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
              throw new Error(result.error || "Error enviando email de verificación")
            }

            console.log("Email de verificación enviado:", result.messageId)
          } catch (error) {
            // Log del error pero no fallar el proceso
            console.error("Error enviando email de verificación:", error)
            throw new Error("Por favor verifica tu email para continuar")
          }

          throw new Error("Por favor verifica tu email para continuar")
        }

        return user
      },
    }),
  ],
} satisfies NextAuthConfig