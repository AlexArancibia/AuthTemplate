import { type NextRequest, NextResponse } from "next/server"
import { sendEmailToAdmin, sendEmailToClient } from "@/lib/nodemailer"
import { contactFormTemplate, contactAutoReplyTemplate } from "@/lib/email-templates"
import type { ShopSettings } from "@/types/store"

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    let body: any = {}
    try {
      body = rawBody ? JSON.parse(rawBody) : {}
    } catch (parseErr) {
      console.error("[API contact-form] Error al parsear JSON:", parseErr)
      return NextResponse.json({ error: "El cuerpo de la solicitud no es JSON válido" }, { status: 400 })
    }
    const { name, email, phone, subject, message, shopSettings } = body as {
      name: string
      email: string
      phone?: string
      subject: string
      message: string
      shopSettings?: ShopSettings
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Faltan campos requeridos: nombre, email, asunto y mensaje" }, { status: 400 })
    }

    const formData = { name, email, phone, subject, message }

    const smtpSummary = {
      host: process.env.SMTP_HOST || "(no definido)",
      port: process.env.SMTP_PORT || "(no definido)",
      secure: process.env.SMTP_SECURE || "(no definido)",
      hasUser: Boolean(process.env.SMTP_USER),
      hasPass: Boolean(process.env.SMTP_PASS),
      fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "(no definido)",
      adminEmail: process.env.ADMIN_EMAIL || process.env.SMTP_USER || "(no definido)",
    }

    // Enviar email al administrador
    const adminEmailResult = await sendEmailToAdmin({
      subject: `📧 Nuevo Mensaje de Contacto - ${subject}`,
      html: contactFormTemplate(formData, shopSettings),
    })

    // Enviar respuesta automática al cliente
    const clientEmailResult = await sendEmailToClient({
      to: email,
      subject: "Confirmación de Mensaje Recibido",
      html: contactAutoReplyTemplate(formData, shopSettings),
    })

    return NextResponse.json({
      success: true,
      message: "Formulario enviado correctamente",
      adminMessageId: adminEmailResult.messageId,
      clientMessageId: clientEmailResult.messageId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: `Fallo en el envío de correos: ${message}` }, { status: 500 })
  }
}
