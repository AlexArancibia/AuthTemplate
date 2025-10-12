import { type NextRequest, NextResponse } from "next/server"
import { emailVerificationTemplate } from "@/lib/email-templates"
import crypto from "crypto"
import { sendEmailToClient } from "@/lib/nodemailer"

export async function POST(request: NextRequest) {
  try {
    console.log("🔥 [API-VERIFICATION] Endpoint llamado")

    const body = await request.json()
    console.log("📧 [API-VERIFICATION] Body recibido:", { email: body.email, hasToken: !!body.verificationToken })

    const { email, verificationToken, verificationUrl } = body as {
      email: string
      verificationToken?: string
      verificationUrl?: string
    }

    if (!email) {
      console.log("❌ [API-VERIFICATION] Email no proporcionado")
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    // Generar token si no se proporciona
    const token = verificationToken || crypto.randomBytes(32).toString("hex")
    console.log("🔑 [API-VERIFICATION] Token generado/usado:", token.substring(0, 10) + "...")

    // URL base para verificación
    const baseUrl = verificationUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

    const subject = "Verificación de Email - Confirma tu cuenta"
    const html = emailVerificationTemplate(token, verifyUrl)

    console.log("📤 [API-VERIFICATION] A punto de llamar sendEmailToClient")
    console.log("📤 [API-VERIFICATION] Email destino:", email)
    console.log("📤 [API-VERIFICATION] Subject:", subject)

    const result = await sendEmailToClient({
      to: email,
      subject,
      html,
    })

    console.log("✅ [API-VERIFICATION] Email enviado exitosamente:", result.messageId)

    return NextResponse.json({
      success: true,
      message: "Email de verificación enviado correctamente",
      messageId: result.messageId,
      verificationToken: token,
    })
  } catch (error) {
    console.error("💥 [API-VERIFICATION] ERROR en endpoint:")
    console.error("💥 [API-VERIFICATION] Tipo:", error instanceof Error ? "Error" : typeof error)
    console.error("💥 [API-VERIFICATION] Mensaje:", error instanceof Error ? error.message : JSON.stringify(error))
    console.error("💥 [API-VERIFICATION] Stack completo:", error instanceof Error ? error.stack : "N/A")
    console.error("💥 [API-VERIFICATION] Error completo:", error)
    
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
