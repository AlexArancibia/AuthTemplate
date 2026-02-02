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
    
    // Leer el body primero
    const rawBody = await req.text();
    
    // Intentar obtener la firma de diferentes formas posibles
    const signature = 
      req.headers.get("x-culqi-signature") ||
      req.headers.get("X-Culqi-Signature") ||
      req.headers.get("culqi-signature") ||
      req.headers.get("X-CULQI-SIGNATURE");
    
    // Logging para debug - ver todos los headers disponibles
    const allHeaders: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      allHeaders[key] = value;
    });
    
    console.log("[Culqi webhook] Headers recibidos:", {
      allHeaders,
      signatureHeader: signature,
      bodyLength: rawBody.length,
      bodyPreview: rawBody.substring(0, 200), // Primeros 200 caracteres del body
    });

    // Culqi no documenta envío de firma en webhooks; muchos entornos no reciben x-culqi-signature.
    // Permitir sin firma: en desarrollo, o si ALLOW_CULQI_WEBHOOK_WITHOUT_SIGNATURE=true (producción).
    const isDevelopment = process.env.NODE_ENV === "development";
    const allowWithoutSignature = process.env.ALLOW_CULQI_WEBHOOK_WITHOUT_SIGNATURE === "true";
    const skipSignatureCheck = !signature && (isDevelopment || allowWithoutSignature);

    if (!verifySignature(rawBody, signature, secretKey)) {
      if (!skipSignatureCheck) {
        console.error("[Culqi webhook] Firma inválida", {
          hasSignature: !!signature,
          signatureLength: signature?.length,
          signatureValue: signature,
          bodyLength: rawBody.length,
          bodyPreview: rawBody.substring(0, 200),
          secretKeyLength: secretKey?.length,
        });
        return NextResponse.json(
          { error: "Invalid Culqi signature" },
          { status: 400 }
        );
      }
      console.warn("[Culqi webhook] Request sin firma aceptada (NODE_ENV=development o ALLOW_CULQI_WEBHOOK_WITHOUT_SIGNATURE=true)");
    } else {
      console.log("[Culqi webhook] Firma verificada correctamente");
    }

    const event = JSON.parse(rawBody);
    const eventType = event.type || event.event_type;

    console.log("[Culqi webhook] Evento recibido:", {
      eventType,
      eventId: event.id,
      eventData: event.data ? "presente" : "ausente",
    });

    switch (eventType) {
      case "charge.created":
      case "charge.captured":
        console.log("[Culqi webhook] Evento de charge ignorado (ya manejado en flujo normal)");
        break;

      case "charge.creation.failed":
        try {
          const failData = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          const body = failData?.body || failData;
          console.warn("[Culqi webhook] charge.creation.failed:", {
            param: body?.param,
            merchant_message: body?.merchant_message,
            type: body?.type,
          });
        } catch {
          console.warn("[Culqi webhook] charge.creation.failed (event.data sin parsear):", event.data);
        }
        break;

      case "charge.refunded":
      case "refund.creation.succeeded":
        // Manejar devolución desde el panel de Culqi
        console.log("[Culqi webhook] Procesando reembolso...");
        await handleRefund(event);
        console.log("[Culqi webhook] Reembolso procesado exitosamente");
        break;

      default:
        // Evento no manejado, ignorar silenciosamente
        console.log("[Culqi webhook] Evento no manejado:", eventType);
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
    console.log("[Culqi webhook] handleRefund iniciado", {
      eventType: event.type || event.event_type,
      hasData: !!event.data,
      hasRefund: !!event.refund,
      hasCharge: !!event.charge,
    });

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
        console.log("[Culqi webhook] event.data parseado como JSON");
      } catch {
        parsedData = event.data;
        console.log("[Culqi webhook] event.data no es JSON válido, usando como está");
      }
    } else {
      parsedData = event.data;
      console.log("[Culqi webhook] event.data ya es objeto");
    }

    const refundData = parsedData || event.refund;
    const chargeData = parsedData?.charge || event.charge || parsedData;
    
    console.log("[Culqi webhook] Datos extraídos:", {
      hasRefundData: !!refundData,
      hasChargeData: !!chargeData,
      refundId: refundData?.id,
      chargeId: chargeData?.id || refundData?.charge_id || refundData?.chargeId,
    });
    
    if (!refundData && !chargeData) {
      console.error("[Culqi webhook] No se encontraron datos de refund ni charge");
      return;
    }

    // Extraer orderId de los metadata
    let orderId = 
      refundData?.metadata?.orderId ||
      refundData?.charge?.metadata?.orderId ||
      chargeData?.metadata?.orderId;

    console.log("[Culqi webhook] orderId inicial:", orderId);

    // Si no encontramos orderId, buscar el charge en Culqi
    if (!orderId) {
      const chargeId = refundData?.charge_id || refundData?.chargeId || chargeData?.id;
      console.log("[Culqi webhook] orderId no encontrado, buscando charge en Culqi:", chargeId);
      
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
            console.log("[Culqi webhook] orderId encontrado en Culqi:", orderId);
          } else {
            console.error("[Culqi webhook] Error al obtener charge de Culqi:", chargeResponse.status, chargeResponse.statusText);
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
        refundMetadata: refundData?.metadata,
        chargeMetadata: chargeData?.metadata,
      });
      return;
    }

    console.log("[Culqi webhook] orderId encontrado:", orderId);

    // Buscar y actualizar la orden
    try {
      console.log("[Culqi webhook] Buscando orden:", orderId);
      const orderResponse = await apiClient.get(`/orders/${STORE_ID}/${orderId}`);
      const order = orderResponse.data?.data || orderResponse.data;
      
      if (!order?.id) {
        console.error("[Culqi webhook] Orden no encontrada", { orderId, responseData: orderResponse.data });
        return;
      }

      console.log("[Culqi webhook] Orden encontrada, actualizando estado a reembolsado", {
        orderId: order.id,
        orderNumber: order.orderNumber,
      });

      const updateData = {
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
      };

      console.log("[Culqi webhook] Datos de actualización:", updateData);

      await apiClient.put(`/orders/${STORE_ID}/${order.id}`, updateData);
      
      console.log("[Culqi webhook] Orden actualizada exitosamente");
    } catch (error: any) {
      console.error("[Culqi webhook] Error al procesar refund", {
        orderId,
        error: error.response?.data || error.message,
        errorStack: error.stack,
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

