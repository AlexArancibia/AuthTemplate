import { type NextRequest, NextResponse } from "next/server"
import { emailVerificationTemplate } from "@/lib/email-templates"
import crypto from "crypto"
import { sendEmailToClient } from "@/lib/nodemailer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { email, verificationToken, verificationUrl } = body as {
      email: string
      verificationToken?: string
      verificationUrl?: string
    }

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    // Generar token si no se proporciona
    const token = verificationToken || crypto.randomBytes(32).toString("hex")

    // URL base para verificación
    const baseUrl = verificationUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

    const subject = "Verificación de Email - Confirma tu cuenta"
    const html = emailVerificationTemplate(token, verifyUrl)

    const result = await sendEmailToClient({
      to: email,
      subject,
      html,
    })

    return NextResponse.json({
      success: true,
      message: "Email de verificación enviado correctamente",
      messageId: result.messageId,
      verificationToken: token,
    })
  } catch (error) {
    console.error("💥 Error en endpoint send-verification:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// Manejar otros métodos HTTP
export async function GET() {
  return NextResponse.json({ error: "Método no permitido. Use POST." }, { status: 405 })
}
