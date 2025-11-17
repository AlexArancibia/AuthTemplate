import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSecretKey } from "@/lib/culqui-pk";
import apiClient from "@/lib/axiosConfig";
import { PaymentStatus, OrderFinancialStatus } from "@/types/common";

const SIGNATURE_HEADER = "x-culqi-signature";

const verifySignature = (payload: string, signature: string | null, secret: string) => {
  if (!signature) return false;

  const computed = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  const signatureBuffer = Buffer.from(signature, "utf8");
  const computedBuffer = Buffer.from(computed, "utf8");

  if (signatureBuffer.length !== computedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, computedBuffer);
};

export async function POST(req: NextRequest) {
  try {
    const secretKey = await getSecretKey();
    const rawBody = await req.text();
    const signature = req.headers.get(SIGNATURE_HEADER);

    // Permitir continuar sin firma solo en desarrollo
    const isDevelopment = process.env.NODE_ENV === 'development';
    const skipSignatureCheck = isDevelopment && !signature;

    if (!verifySignature(rawBody, signature, secretKey)) {
      if (!skipSignatureCheck) {
        return NextResponse.json(
          { error: "Invalid Culqi signature" },
          { status: 400 }
        );
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.type || event.event_type;

    switch (eventType) {
      case "charge.created":
      case "charge.captured":
        // Estos eventos ya se manejan en el flujo de pago normal
        break;

      case "charge.refunded":
      case "refund.creation.succeeded":
        // Manejar devolución desde el panel de Culqi
        await handleRefund(event);
        break;

      default:
        // Evento no manejado, ignorar silenciosamente
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Culqi webhook] Error processing webhook", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleRefund(event: any) {
  try {
    const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;
    if (!STORE_ID) {
      console.error("[Culqi webhook] STORE_ID no está definido");
      return;
    }

    // Parsear event.data si viene como string
    let parsedData: any;
    if (typeof event.data === 'string') {
      try {
        parsedData = JSON.parse(event.data);
      } catch {
        parsedData = event.data;
      }
    } else {
      parsedData = event.data;
    }

    const refundData = parsedData || event.refund;
    const chargeData = parsedData?.charge || event.charge || parsedData;
    
    if (!refundData && !chargeData) {
      return;
    }

    // Extraer orderId de los metadata
    let orderId = 
      refundData?.metadata?.orderId ||
      refundData?.charge?.metadata?.orderId ||
      chargeData?.metadata?.orderId;

    // Si no encontramos orderId, buscar el charge en Culqi
    if (!orderId) {
      const chargeId = refundData?.charge_id || refundData?.chargeId || chargeData?.id;
      if (chargeId) {
        try {
          const secretKey = await getSecretKey();
          const chargeResponse = await fetch(`https://api.culqi.com/v2/charges/${chargeId}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${secretKey}`,
              "Content-Type": "application/json",
            },
          });

          if (chargeResponse.ok) {
            const chargeInfo = await chargeResponse.json();
            orderId = chargeInfo.metadata?.orderId;
          }
        } catch (error) {
          console.error("[Culqi webhook] Error al buscar charge en Culqi:", error);
        }
      }
    }

    if (!orderId) {
      console.error("[Culqi webhook] No se encontró orderId", {
        refundId: refundData?.id,
        chargeId: refundData?.charge_id || refundData?.chargeId || chargeData?.id,
      });
      return;
    }

    // Buscar y actualizar la orden
    try {
      const orderResponse = await apiClient.get(`/orders/${STORE_ID}/${orderId}`);
      const order = orderResponse.data?.data || orderResponse.data;
      
      if (!order?.id) {
        console.error("[Culqi webhook] Orden no encontrada", { orderId });
        return;
      }

      await apiClient.put(`/orders/${STORE_ID}/${order.id}`, {
        orderNumber: order.orderNumber,
        financialStatus: OrderFinancialStatus.VOIDED,
        paymentStatus: PaymentStatus.FAILED,
        paymentDetails: {
          ...(order.paymentDetails || {}),
          refunded: true,
          refundedAt: new Date().toISOString(),
          refundId: refundData?.id,
          refundAmount: refundData?.amount || chargeData?.amount_refunded,
          chargeId: chargeData?.id || refundData?.charge_id || refundData?.chargeId,
          refundEventType: event.type || event.event_type,
        },
      });
    } catch (error: any) {
      console.error("[Culqi webhook] Error al procesar refund", {
        orderId,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  } catch (error) {
    console.error("[Culqi webhook] Error en handleRefund", error);
    throw error;
  }
}

export function GET() {
  return NextResponse.json(
    { message: "Culqi webhook endpoint" },
    { status: 200 }
  );
}

