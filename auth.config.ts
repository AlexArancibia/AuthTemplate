// Lazy imports para que el middleware (Edge) no cargue módulos Node-only (db, bcrypt, nodemailer).
// Solo se cargan cuando authorize() se ejecuta en el API route.
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

// En desarrollo local: si NEXTAUTH_URL apunta a producción, usar localhost
if (process.env.NODE_ENV === "development" && process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")) {
  const port = process.env.PORT || 3000;
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL_DEV || `http://localhost:${port}`;
  process.env.AUTH_URL = process.env.NEXTAUTH_URL;
}

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      authorize: async (credentials) => {
        const { loginSchema } = await import("@/lib/zod");
        const { db } = await import("@/lib/db");
        const bcrypt = (await import("bcryptjs")).default;
        const { nanoid } = await import("nanoid");
        const { sendVerificationEmail } = await import("@/lib/send-verification");

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
            console.log("[auth] Email de verificación enviado", { messageId: result.messageId })
          } catch (error) {
            // Log del error pero no fallar el proceso
            console.error("[auth] Error enviando email de verificación", error)
            throw new Error("Por favor verifica tu email para continuar")
          }

          throw new Error("Por favor verifica tu email para continuar")
        }

        return user
      },
    }),
  ],
  trustHost: true,
  // L-03: Explícito SameSite=Lax en cookies de sesión (protección CSRF)
  cookies: {
    sessionToken: {
      options: {
        sameSite: "lax",
      },
    },
  },
} satisfies NextAuthConfig