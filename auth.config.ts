import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/send-verification";
import { loginSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
export const runtime = 'nodejs'
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { validateQuickLoginToken } from "@/lib/quick-login-utils"

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    Google,
    GitHub,
    Credentials({
      authorize: async (credentials) => {
        // Verificar si es un quick login ANTES de validar el schema
        const password = credentials.password as string;
        if (password && password.startsWith('__QUICK_LOGIN_TOKEN__:')) {
          const token = password.replace('__QUICK_LOGIN_TOKEN__:', '');
          const email = credentials.email as string;
          const quickLoginData = validateQuickLoginToken(token);
          
          if (!quickLoginData || quickLoginData.email !== email) {
            throw new Error("Quick login token invalid")
          }

          // Buscar el usuario
          const user = await db.user.findUnique({
            where: {
              email: email,
            },
          })

          if (!user || !user.emailVerified) {
            throw new Error("User not found or not verified")
          }

          return user;
        }

        // Login normal: validar con schema
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

          try {
            const verificationUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
            const result = await sendVerificationEmail({
              email: user.email,
              verificationToken: token,
              verificationUrl,
            })
            if (!result.success) {
              throw new Error(result.error || "Error enviando email de verificación")
            }
          } catch (error) {
            console.error("Error enviando email de verificación:", error)
            throw new Error("Por favor verifica tu email para continuar")
          }

          throw new Error("Por favor verifica tu email para continuar")
        }

        return user
      },
    }),
  ],
  trustHost: true,
  cookies: {
    sessionToken: {
      options: {
        sameSite: "lax",
      },
    },
  },
} satisfies NextAuthConfig
