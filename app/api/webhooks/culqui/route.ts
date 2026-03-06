import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSecretKey } from "@/lib/culqui-pk";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import apiClient from "@/lib/axiosConfig";
import { PaymentStatus, OrderFinancialStatus } from "@/types/common";

const SIGNATURE_HEADER = "x-culqi-signature";

const LEN_HMAC_SHA256_HEX = 64;

const verifySignature = (payload: string, signature: string | null, secret: string) => {
  if (!signature) return false;

  const computed = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const signatureBuffer = Buffer.from(signature, "utf8");
  const computedBuffer = Buffer.from(computed, "utf8");

  if (signatureBuffer.length !== LEN_HMAC_SHA256_HEX || computedBuffer.length !== LEN_HMAC_SHA256_HEX) {
    const a = Buffer.alloc(LEN_HMAC_SHA256_HEX);
    const b = Buffer.alloc(LEN_HMAC_SHA256_HEX);
    signatureBuffer.copy(a, 0, 0, Math.min(signatureBuffer.length, LEN_HMAC_SHA256_HEX));
    computedBuffer.copy(b, 0, 0, Math.min(computedBuffer.length, LEN_HMAC_SHA256_HEX));
    void crypto.timingSafeEqual(a, b);
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, computedBuffer);
};

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(`webhook:${ip}`, 100)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const secretKey = await getSecretKey();
    
    // Leer el body primero
    const rawBody = await req.text();
    
    // Intentar obtener la firma de diferentes formas posibles
    const signature = 
      req.headers.get("x-culqi-signature") ||
      req.headers.get("X-Culqi-Signature") ||
      req.headers.get("culqi-signature") ||
      req.headers.get("X-CULQI-SIGNATURE");
    
    logger.debug({ bodyLength: rawBody.length, hasSignature: !!signature }, "[Culqi webhook] Petición recibida");

    if (!verifySignature(rawBody, signature, secretKey)) {
      return NextResponse.json(
        { error: "Invalid Culqi signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.type || event.event_type;

    logger.debug(
      { eventType, eventId: event.id, eventData: event.data ? "presente" : "ausente" },
      "[Culqi webhook] Evento recibido"
    );

    switch (eventType) {
      case "charge.created":
      case "charge.captured":
        logger.debug("[Culqi webhook] Evento de charge ignorado (ya manejado en flujo normal)");
        break;

      case "charge.creation.failed":
        try {
          const failData = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          const body = failData?.body || failData;
          logger.warn(
            { param: body?.param, merchant_message: body?.merchant_message, type: body?.type },
            "[Culqi webhook] charge.creation.failed"
          );
        } catch {
          logger.warn({ eventData: event.data }, "[Culqi webhook] charge.creation.failed (event.data sin parsear)");
        }
        break;

      case "charge.refunded":
      case "refund.creation.succeeded":
        // Manejar devolución desde el panel de Culqi
        logger.debug("[Culqi webhook] Procesando reembolso...");
        await handleRefund(event);
        logger.debug("[Culqi webhook] Reembolso procesado exitosamente");
        break;

      default:
        // Evento no manejado, ignorar silenciosamente
        logger.debug({ eventType }, "[Culqi webhook] Evento no manejado");
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error({ err: error }, "[Culqi webhook] Error processing webhook");
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleRefund(event: any) {
  try {
    logger.debug(
      {
        eventType: event.type || event.event_type,
        hasData: !!event.data,
        hasRefund: !!event.refund,
        hasCharge: !!event.charge,
      },
      "[Culqi webhook] handleRefund iniciado"
    );

    const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID;
    if (!STORE_ID) {
      logger.error("[Culqi webhook] STORE_ID no está definido");
      return;
    }

    // Parsear event.data si viene como string
    let parsedData: any;
    if (typeof event.data === 'string') {
      try {
        parsedData = JSON.parse(event.data);
        logger.debug("[Culqi webhook] event.data parseado como JSON");
      } catch {
        parsedData = event.data;
        logger.debug("[Culqi webhook] event.data no es JSON válido, usando como está");
      }
    } else {
      parsedData = event.data;
      logger.debug("[Culqi webhook] event.data ya es objeto");
    }

    const refundData = parsedData || event.refund;
    const chargeData = parsedData?.charge || event.charge || parsedData;
    
    logger.debug(
      {
        hasRefundData: !!refundData,
        hasChargeData: !!chargeData,
        refundId: refundData?.id,
        chargeId: chargeData?.id || refundData?.charge_id || refundData?.chargeId,
      },
      "[Culqi webhook] Datos extraídos"
    );

    if (!refundData && !chargeData) {
      logger.error("[Culqi webhook] No se encontraron datos de refund ni charge");
      return;
    }

    // Extraer orderId de los metadata
    let orderId = 
      refundData?.metadata?.orderId ||
      refundData?.charge?.metadata?.orderId ||
      chargeData?.metadata?.orderId;

    logger.debug({ orderId }, "[Culqi webhook] orderId inicial");

    // Si no encontramos orderId, buscar el charge en Culqi
    if (!orderId) {
      const chargeId = refundData?.charge_id || refundData?.chargeId || chargeData?.id;
      logger.debug({ chargeId }, "[Culqi webhook] orderId no encontrado, buscando charge en Culqi");
      
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
            logger.debug({ orderId }, "[Culqi webhook] orderId encontrado en Culqi");
          } else {
            logger.error(
              { status: chargeResponse.status, statusText: chargeResponse.statusText },
              "[Culqi webhook] Error al obtener charge de Culqi"
            );
          }
        } catch (error) {
          logger.error({ err: error }, "[Culqi webhook] Error al buscar charge en Culqi");
        }
      }
    }

    if (!orderId) {
      logger.error(
        {
          refundId: refundData?.id,
          chargeId: refundData?.charge_id || refundData?.chargeId || chargeData?.id,
          refundMetadata: refundData?.metadata,
          chargeMetadata: chargeData?.metadata,
        },
        "[Culqi webhook] No se encontró orderId"
      );
      return;
    }

    logger.debug({ orderId }, "[Culqi webhook] orderId encontrado");

    // Buscar y actualizar la orden
    try {
      logger.debug({ orderId }, "[Culqi webhook] Buscando orden");
      const orderResponse = await apiClient.get(`/orders/${STORE_ID}/${orderId}`);
      const order = orderResponse.data?.data || orderResponse.data;
      
      if (!order?.id) {
        logger.error({ orderId, responseData: orderResponse.data }, "[Culqi webhook] Orden no encontrada");
        return;
      }

      logger.debug(
        { orderId: order.id, orderNumber: order.orderNumber },
        "[Culqi webhook] Orden encontrada, actualizando estado a reembolsado"
      );

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

      logger.debug({ updateData }, "[Culqi webhook] Datos de actualización");

      await apiClient.put(`/orders/${STORE_ID}/${order.id}`, updateData);

      logger.debug("[Culqi webhook] Orden actualizada exitosamente");
    } catch (error: any) {
      logger.error(
        {
          orderId,
          error: error.response?.data || error.message,
          errorStack: error.stack,
        },
        "[Culqi webhook] Error al procesar refund"
      );
      throw error;
    }
  } catch (error) {
    logger.error({ err: error }, "[Culqi webhook] Error en handleRefund");
    throw error;
  }
}
