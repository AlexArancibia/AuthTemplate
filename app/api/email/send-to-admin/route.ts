import { type NextRequest, NextResponse } from "next/server"
import { sendEmailToAdmin } from "@/lib/nodemailer"
import { orderNotificationAdminTemplate } from "@/lib/email-templates"
import type { Order } from "@/types/order"
import type { ShopSettings } from "@/types/store"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order, shopSettings } = body as { order: Order; shopSettings?: ShopSettings }

    if (!order) {
      return NextResponse.json({ error: "Datos de pedido requeridos" }, { status: 400 })
    }

    const subject = `🎉 Nuevo Pedido #${order.orderNumber} - ${new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: order.currency.code,
    }).format(order.totalPrice)}`

    const html = orderNotificationAdminTemplate(order, shopSettings)

    const result = await sendEmailToAdmin({
      subject,
      html,
    })

    return NextResponse.json({
      success: true,
      message: "Notificación de pedido enviada al administrador",
      messageId: result.messageId,
    })
  } catch (error) {
    console.error("Error enviando notificación al administrador:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
