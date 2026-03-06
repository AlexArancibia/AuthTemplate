/**
 * Lógica compartida para enviar email de verificación.
 * Usado por la ruta API (con auth y rate limit por IP) y por llamadas directas (auth-action, auth.config).
 * M-05: evita llamadas HTTP internas (SSRF-like).
 */

import crypto from "crypto"
import { emailVerificationTemplate } from "@/lib/email-templates"
import { sendEmailToClient } from "@/lib/nodemailer"
import { checkRateLimit } from "@/lib/rate-limit"

export interface SendVerificationParams {
  email: string
  verificationToken?: string
  verificationUrl?: string
}

export interface SendVerificationResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendVerificationEmail(params: SendVerificationParams): Promise<SendVerificationResult> {
  const { email, verificationToken, verificationUrl } = params

  if (!email || typeof email !== "string") {
    return { success: false, error: "Email requerido" }
  }

  if (!checkRateLimit(`send-verification:email:${email.toLowerCase()}`, 5)) {
    return { success: false, error: "Demasiados intentos para este email" }
  }

  const token = verificationToken || crypto.randomBytes(32).toString("hex")
  const baseUrl = verificationUrl || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
  const verifyUrl = `${baseUrl.replace(/\/$/, "")}/api/auth/verify-email?token=${token}`

  const subject = "Verificación de Email - Confirma tu cuenta"
  const html = emailVerificationTemplate(token, verifyUrl)

  const result = await sendEmailToClient({
    to: email,
    subject,
    html,
  })

  return { success: true, messageId: result.messageId }
}
