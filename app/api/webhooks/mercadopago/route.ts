// Helper backend para actualizar una orden
import type { Order } from "@/types/order"

// app/api/webhooks/mercadopago/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getAccessToken } from "@/lib/mercadopago-ac";
import apiClient from "@/lib/axiosConfig"

const accessToken = await getAccessToken()
const mpClient = new MercadoPagoConfig({ accessToken });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const type = body.type || body.action || body.topic || null;
    if (String(type).toLowerCase() === "payment") {
      const paymentId = body?.data?.id;
      if (!paymentId) {
        return NextResponse.json({ error: "No paymentId in data" }, { status: 400 });
      }
      const payment = await new Payment(mpClient).get({ id: paymentId });
      // Extraer status y external_reference del objeto principal
      const status = payment?.status;
      const temporalOrderId = payment?.external_reference;

      // Validar que el paymentId recibido es igual a collection_id o payment_id si lo necesitas (ya lo es por el flujo)
      if (String(status).toLowerCase() === "approved" && temporalOrderId) {
        return NextResponse.json({ allOk: true }, { status: 200 });
      }
    }
    // Siempre responde 200 para confirmar recepción
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[MP Webhook] Error procesando notificación:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
