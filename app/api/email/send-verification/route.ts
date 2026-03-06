import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { sendVerificationEmail } from "@/lib/send-verification"
import { logger } from "@/lib/logger"

const INTERNAL_SECRET_HEADER = "x-send-verification-internal-secret"

export async function POST(request: NextRequest) {
  try {
    const internalSecret = process.env.SEND_VERIFICATION_INTERNAL_KEY
    const provided = request.headers.get(INTERNAL_SECRET_HEADER)
    if (!internalSecret || provided !== internalSecret) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"
    if (!checkRateLimit(`send-verification:ip:${ip}`, 15)) {
      return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 })
    }

    const body = await request.json()
    const { email, verificationToken, verificationUrl } = body as {
      email: string
      verificationToken?: string
      verificationUrl?: string
    }

    const result = await sendVerificationEmail({ email, verificationToken, verificationUrl })

    if (!result.success) {
      const status = result.error === "Demasiados intentos para este email" ? 429 : 400
      return NextResponse.json({ error: result.error || "Error enviando verificación" }, { status })
    }

    return NextResponse.json({
      success: true,
      message: "Email de verificación enviado correctamente",
      messageId: result.messageId,
    })
  } catch (error) {
    logger.error({ err: error }, "[send-verification] Error")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    )
  }
}

// Manejar otros métodos HTTP
export async function GET() {
  return NextResponse.json({ error: "Método no permitido. Use POST." }, { status: 405 })
}
