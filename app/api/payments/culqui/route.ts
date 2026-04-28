import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { getSecretKey } from "@/lib/culqui-pk";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { formatCulqiDescription } from "@/lib/culqi-description";

const sanitizePhone = (value?: string) => (value ?? "").replace(/\D/g, "");
const CORS_ORIGIN = (process.env.CORS_ORIGIN || process.env.NEXTAUTH_URL || "https://anj.com").replace(/\/$/, "");

interface CulqiError {
  merchant_message?: string;
  user_message?: string;
  code?: string;
  decline_code?: string;
  object?: string;
}

interface CulqiResponse {
  id?: string;
  amount?: number;
  currency_code?: string;
  outcome?: any;
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_number: "El número de tarjeta no es válido",
  invalid_cvc: "El código de seguridad (CVC) no es válido",
  expired_card: "La tarjeta ha expirado",
  incorrect_cvc: "El código de seguridad (CVC) es incorrecto",
  card_declined: "La tarjeta fue rechazada. Contacta con tu banco para más información",
  insufficient_funds: "Fondos insuficientes",
  generic_decline: "La tarjeta fue rechazada. Verifica los datos o contacta con tu banco",
  do_not_honor: "La transacción fue rechazada por el banco",
  invalid_account: "Cuenta inválida",
  lost_card: "Tarjeta reportada como perdida",
  stolen_card: "Tarjeta reportada como robada",
};

function getUserFriendlyMessage(error: CulqiError): string {
  if (error.user_message) return error.user_message;
  if (error.merchant_message) return error.merchant_message;
  if (error.code && ERROR_MESSAGES[error.code]) return ERROR_MESSAGES[error.code];
  if (error.decline_code && ERROR_MESSAGES[error.decline_code]) return ERROR_MESSAGES[error.decline_code];
  return "Error en el pago";
}

function parseCulqiError(data: any): CulqiError {
  if (!data) return {};
  return data.object === "error" ? {
    merchant_message: data.merchant_message,
    user_message: data.user_message,
    code: data.code,
    decline_code: data.decline_code,
  } : data;
}

function createErrorResponse(error: string, status: number, requestId: string) {
  return NextResponse.json(
    { error, requestId },
    { status, headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
  );
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": CORS_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  const requestId = `req-${crypto.randomUUID()}`;
  const requestStartedAt = Date.now();

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(`payment:${ip}`, 15)) {
      return createErrorResponse("Demasiadas solicitudes. Intenta de nuevo en unos minutos.", 429, requestId);
    }

    logger.info({ requestId, at: new Date().toISOString() }, "[Culqi Payment] Inicio petición");

    // 1. Parsear y validar body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      logger.warn({ requestId }, "[Culqi Payment] Body inválido (no JSON)");
      return createErrorResponse("Formato de solicitud inválido", 400, requestId);
    }

    const { token, amount: reqAmount, currency, description, email, firstName, lastName, phone, address, city, countryCode, orderId } = requestBody;

    logger.debug(
      {
        requestId,
        orderId,
        amount: reqAmount,
        currency,
        hasToken: !!token,
        hasAntifraud: !!(firstName || lastName || phone || address || city),
      },
      "[Culqi Payment] Body recibido"
    );

    // 2. Validar campos requeridos
    const missingFields = [token ? null : "token", reqAmount ? null : "amount", currency ? null : "currency", email ? null : "email", orderId ? null : "orderId"].filter(Boolean) as string[];
    if (missingFields.length > 0) {
      logger.warn({ requestId, missingFields }, "[Culqi Payment] Faltan campos");
      return createErrorResponse(`Faltan campos requeridos: ${missingFields.join(", ")}`, 400, requestId);
    }

    // 3. Obtener secret key (vía endpoint solo-servidor con X-Server-Secret)
    let secretKey: string;
    try {
      secretKey = await getSecretKey();
    } catch {
      return createErrorResponse("Error de configuración del sistema de pagos", 500, requestId);
    }

    // 4. Validaciones
    const sanitizedPhone = sanitizePhone(phone);
    if (phone && (sanitizedPhone.length < 6 || sanitizedPhone.length > 14)) {
      logger.warn({ requestId, orderId, phoneLen: sanitizedPhone.length }, "[Culqi Payment] Teléfono inválido");
      return createErrorResponse("Número de teléfono inválido. Debe tener entre 6 y 14 dígitos.", 400, requestId);
    }

    if (!z.string().email().safeParse(email).success) {
      logger.warn({ requestId, orderId }, "[Culqi Payment] Email inválido");
      return createErrorResponse("El formato del email no es válido", 400, requestId);
    }

    const numericAmount = Number(reqAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      logger.warn({ requestId, orderId, reqAmount }, "[Culqi Payment] Monto inválido");
      return createErrorResponse("El monto debe ser un número positivo", 400, requestId);
    }

    const chargeDescription = formatCulqiDescription({
      orderId: typeof orderId === "string" ? orderId : undefined,
      itemsPreview: typeof description === "string" ? description : undefined,
    });
    const antifraudPayload = {
      first_name: firstName,
      last_name: lastName,
      phone_number: sanitizedPhone,
      address,
      address_city: city,
      country_code: countryCode || "PE",
    };

    logger.debug(
      {
        requestId,
        orderId,
        amount: numericAmount,
        currency_code: currency,
        descriptionLength: chargeDescription.length,
        antifraudKeys: Object.keys(antifraudPayload),
        elapsedMs: Date.now() - requestStartedAt,
      },
      "[Culqi Payment] Payload a Culqi (sin token completo)"
    );

    // 5. Realizar petición a Culqi
    let response: Response;
    let responseText: string;

    logger.debug({ requestId }, "[Culqi Payment] Llamando API Culqi /v2/charges");
    try {
      response = await fetch("https://api.culqi.com/v2/charges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secretKey}`,
        },
        body: JSON.stringify({
          amount: numericAmount,
          currency_code: currency,
          email,
          source_id: token,
          description: chargeDescription,
          metadata: { firstName, lastName, phone: sanitizedPhone, orderId, requestId },
          antifraud_details: antifraudPayload,
        }),
      });
      responseText = await response.text();
      logger.debug(
        {
          requestId,
          status: response.status,
          statusOk: response.ok,
          bodyLength: responseText?.length,
          elapsedMs: Date.now() - requestStartedAt,
        },
        "[Culqi Payment] Respuesta Culqi recibida"
      );
    } catch (err) {
      logger.error({ requestId, err }, "[Culqi Payment] Error de red al llamar Culqi");
      return createErrorResponse("Error de conexión con el procesador de pagos. Intenta nuevamente.", 503, requestId);
    }

    // 6. Parsear respuesta
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      return createErrorResponse("Respuesta inválida del procesador de pagos", 502, requestId);
    }

    // 7. Manejar errores de Culqi
    if (!response.ok) {
      const culqiError = parseCulqiError(data);
      logger.warn(
        {
          requestId,
          orderId,
          status: response.status,
          type: data?.type,
          param: data?.param,
          merchant_message: data?.merchant_message,
          code: data?.code,
          decline_code: data?.decline_code,
          elapsedMs: Date.now() - requestStartedAt,
        },
        "[Culqi Payment] Culqi rechazó el cargo"
      );
      if (response.status === 422 || data?.type === "parameter_error") {
        logger.error({ requestId, body: responseText?.slice(0, 500) }, "[Culqi Payment] parameter_error (detalle)");
      }
      let statusCode = 400;
      if (response.status >= 500) statusCode = 502;
      else if (response.status === 401 || response.status === 403) statusCode = 500;

      return NextResponse.json(
        {
          error: getUserFriendlyMessage(culqiError),
          requestId,
          ...(process.env.NODE_ENV !== "production" && {
            debug: { culqiCode: culqiError.code, declineCode: culqiError.decline_code },
          }),
        },
        { status: statusCode, headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
      );
    }

    // 8. Validar y retornar respuesta exitosa
    const chargeData = data as CulqiResponse;
    if (!chargeData.id) {
      logger.error(
        { requestId, orderId, dataKeys: data ? Object.keys(data) : [] },
        "[Culqi Payment] Respuesta sin charge id"
      );
      return createErrorResponse("Respuesta incompleta del procesador de pagos", 502, requestId);
    }

    logger.info(
      {
        requestId,
        orderId,
        chargeId: chargeData.id,
        amount: chargeData.amount,
        outcomeType: chargeData.outcome?.type,
        elapsedMs: Date.now() - requestStartedAt,
      },
      "[Culqi Payment] Pago exitoso"
    );

    // Mark order as PAID in backend (server-only secret; client cannot set PAID)
    const storeId = process.env.NEXT_PUBLIC_STORE_ID;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    const orderUpdateSecret = process.env.ORDER_UPDATE_SECRET;
    if (storeId && backendUrl && orderId && orderUpdateSecret) {
      try {
        const putRes = await fetch(`${backendUrl}/orders/${storeId}/${orderId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Order-Update-Secret": orderUpdateSecret,
          },
          body: JSON.stringify({
            financialStatus: "PAID",
            paymentStatus: "COMPLETED",
            paymentDetails: {
              provider: "Culqi",
              chargeId: chargeData.id,
              amount: chargeData.amount,
              currency_code: chargeData.currency_code,
              source_id: (chargeData as any).source_id,
              outcome: chargeData.outcome,
              completedAt: new Date().toISOString(),
              raw: chargeData,
            },
          }),
        });
        if (!putRes.ok) {
          logger.error(
            { requestId, orderId, status: putRes.status, body: await putRes.text().catch(() => "") },
            "[Culqi Payment] Backend PUT order PAID failed"
          );
        }
      } catch (putErr) {
        logger.error({ requestId, orderId, err: putErr }, "[Culqi Payment] Backend PUT order PAID error");
      }
    } else {
      if (!orderUpdateSecret) {
        logger.warn({ requestId, orderId }, "[Culqi Payment] ORDER_UPDATE_SECRET not set; order will not be marked PAID in backend");
      }
    }

    return NextResponse.json(
      { success: true, data: chargeData, requestId },
      { headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
    );
  } catch (error) {
    logger.error({ requestId, err: error }, "[Culqi Payment] Unexpected error");
    return createErrorResponse("Error interno al procesar el pago. Contacta con soporte si el problema persiste.", 500, requestId);
  }
}