import { type NextRequest, NextResponse } from "next/server"
import { sendEmailToClient } from "@/lib/nodemailer"
import { orderConfirmationClientTemplate } from "@/lib/email-templates"
import type { Order } from "@/types/order"
import type { ShopSettings } from "@/types/store"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order, shopSettings } = body as { order: Order; shopSettings?: ShopSettings }

    if (!order || !order.customerInfo) {
      return NextResponse.json({ error: "Datos de pedido requeridos" }, { status: 400 })
    }

    const customerInfo = order.customerInfo as any
    const customerEmail = customerInfo.email

    if (!customerEmail) {
      return NextResponse.json({ error: "Email del cliente requerido" }, { status: 400 })
    }

    const subject = `Confirmación de Pedido #${order.orderNumber}`
    const html = orderConfirmationClientTemplate(order, shopSettings)

    const result = await sendEmailToClient({
      to: customerEmail,
      subject,
      html,
    })

    return NextResponse.json({
      success: true,
      message: "Confirmación de pedido enviada al cliente",
      messageId: result.messageId,
    })
  } catch (error) {
    console.error("Error enviando confirmación de pedido:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
