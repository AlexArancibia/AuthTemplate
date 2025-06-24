import { type NextRequest, NextResponse } from "next/server"
import { sendEmailToAdmin, sendEmailToClient } from "@/lib/nodemailer"
import { contactFormTemplate, contactAutoReplyTemplate } from "@/lib/email-templates"
import type { ShopSettings } from "@/types/store"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message, shopSettings } = body as {
      name: string
      email: string
      phone?: string
      subject: string
      message: string
      shopSettings?: ShopSettings
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Todos los campos requeridos deben ser completados" }, { status: 400 })
    }

    const formData = { name, email, phone, subject, message }

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
    console.error("Error procesando formulario de contacto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
