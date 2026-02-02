import { NextRequest, NextResponse } from "next/server";
import { getSecretKey } from "@/lib/culqui-pk";

const sanitizePhone = (value?: string) => (value ?? "").replace(/\D/g, "");
const CORS_ORIGIN = "https://anj.com/";

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
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const requestStartedAt = Date.now();

  try {
    console.log("[Culqi Payment] Inicio petición", { requestId, at: new Date().toISOString() });

    // 1. Parsear y validar body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      console.warn("[Culqi Payment] Body inválido (no JSON)", { requestId });
      return createErrorResponse("Formato de solicitud inválido", 400, requestId);
    }

    const { token, amount: reqAmount, currency, description, email, firstName, lastName, phone, address, city, countryCode, orderId } = requestBody;

    console.log("[Culqi Payment] Body recibido", {
      requestId,
      orderId,
      amount: reqAmount,
      currency,
      emailPrefix: email ? `${email.slice(0, 3)}***` : "",
      descriptionLength: typeof description === "string" ? description.length : 0,
      tokenPrefix: token ? `${String(token).slice(0, 12)}...` : "(vacío)",
      tokenLength: token ? String(token).length : 0,
      hasAntifraud: !!(firstName || lastName || phone || address || city),
      serverTime: new Date().toISOString(),
    });

    // 2. Validar campos requeridos
    const missingFields = [token ? null : "token", reqAmount ? null : "amount", currency ? null : "currency", email ? null : "email", orderId ? null : "orderId"].filter(Boolean) as string[];
    if (missingFields.length > 0) {
      console.warn("[Culqi Payment] Faltan campos", { requestId, missingFields });
      return createErrorResponse(`Faltan campos requeridos: ${missingFields.join(", ")}`, 400, requestId);
    }

    // 3. Obtener secret key
    let secretKey: string;
    try {
      secretKey = await getSecretKey();
    } catch {
      return createErrorResponse("Error de configuración del sistema de pagos", 500, requestId);
    }

    // 4. Validaciones
    const sanitizedPhone = sanitizePhone(phone);
    if (phone && (sanitizedPhone.length < 6 || sanitizedPhone.length > 14)) {
      console.warn("[Culqi Payment] Teléfono inválido", { requestId, orderId, phoneLen: sanitizedPhone.length });
      return createErrorResponse("Número de teléfono inválido. Debe tener entre 6 y 14 dígitos.", 400, requestId);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn("[Culqi Payment] Email inválido", { requestId, orderId, emailPrefix: email?.slice(0, 5) });
      return createErrorResponse("El formato del email no es válido", 400, requestId);
    }

    const numericAmount = Number(reqAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.warn("[Culqi Payment] Monto inválido", { requestId, orderId, reqAmount });
      return createErrorResponse("El monto debe ser un número positivo", 400, requestId);
    }
    // Culqi: amount en céntimos, entero, rango 100–999900 (1–9999 PEN)
    const amountCents = Math.round(numericAmount);
    const clampedAmount = Math.min(999900, Math.max(100, amountCents));
    if (clampedAmount !== amountCents) {
      console.warn("[Culqi Payment] Monto fuera de rango", { requestId, orderId, amountCents, clampedAmount });
      return createErrorResponse("El monto está fuera del rango permitido (1–9999 soles)", 400, requestId);
    }

    // description: Culqi exige 5–80 caracteres
    const rawDescription = description || `Orden ${orderId}`;
    const chargeDescription =
      rawDescription.length > 80 ? rawDescription.slice(0, 77) + "..." : rawDescription;
    const finalDescription = chargeDescription.length >= 5 ? chargeDescription : `Orden ${orderId}`.slice(0, 80);

    // antifraud_details: solo enviar campos con valor (evitar parameter_error por strings vacíos)
    const antifraudDetails: Record<string, string> = {};
    if (firstName?.trim()) antifraudDetails.first_name = firstName.trim();
    if (lastName?.trim()) antifraudDetails.last_name = lastName.trim();
    if (sanitizedPhone && sanitizedPhone.length >= 5 && sanitizedPhone.length <= 15) antifraudDetails.phone_number = sanitizedPhone;
    if (address?.trim() && address.length >= 5) antifraudDetails.address = address.trim().slice(0, 100);
    if (city?.trim() && city.length >= 2) antifraudDetails.address_city = city.trim().slice(0, 30);
    const code = (countryCode || "PE").toUpperCase().slice(0, 2);
    antifraudDetails.country_code = code === "PE" || code === "US" ? code : "PE";

    const payloadForCulqi = {
      amount: clampedAmount,
      currency_code: currency,
      email,
      source_id: token,
      description: finalDescription,
      metadata: { firstName: firstName || "", lastName: lastName || "", phone: sanitizedPhone, orderId, requestId },
      ...(Object.keys(antifraudDetails).length > 0 && { antifraud_details: antifraudDetails }),
    };

    console.log("[Culqi Payment] Payload a Culqi (sin token completo)", {
      requestId,
      orderId,
      amount: clampedAmount,
      currency_code: currency,
      descriptionLength: finalDescription.length,
      antifraudKeys: Object.keys(antifraudDetails),
      metadataOrderId: payloadForCulqi.metadata.orderId,
      elapsedMs: Date.now() - requestStartedAt,
    });

    // 5. Realizar petición a Culqi
    let response: Response;
    let responseText: string;

    console.log("[Culqi Payment] Llamando API Culqi /v2/charges", { requestId });
    try {
      response = await fetch("https://api.culqi.com/v2/charges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secretKey}`,
        },
        body: JSON.stringify(payloadForCulqi),
      });
      responseText = await response.text();
      console.log("[Culqi Payment] Respuesta Culqi recibida", {
        requestId,
        status: response.status,
        statusOk: response.ok,
        bodyLength: responseText?.length,
        elapsedMs: Date.now() - requestStartedAt,
      });
    } catch (err) {
      console.error("[Culqi Payment] Error de red al llamar Culqi", { requestId, error: err });
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
      console.warn("[Culqi Payment] Culqi rechazó el cargo", {
        requestId,
        orderId,
        status: response.status,
        type: data?.type,
        param: data?.param,
        merchant_message: data?.merchant_message,
        code: data?.code,
        decline_code: data?.decline_code,
        elapsedMs: Date.now() - requestStartedAt,
      });
      if (response.status === 422 || data?.type === "parameter_error") {
        console.error("[Culqi Payment] parameter_error (detalle)", {
          requestId,
          body: responseText?.slice(0, 500),
        });
      }
      let statusCode = 400;
      if (response.status >= 500) statusCode = 502;
      else if (response.status === 401 || response.status === 403) statusCode = 500;
      else if (response.status === 422) statusCode = 422;

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
      console.error("[Culqi Payment] Respuesta sin charge id", { requestId, orderId, dataKeys: data ? Object.keys(data) : [] });
      return createErrorResponse("Respuesta incompleta del procesador de pagos", 502, requestId);
    }

    console.log("[Culqi Payment] Pago exitoso", {
      requestId,
      orderId,
      chargeId: chargeData.id,
      amount: chargeData.amount,
      outcomeType: chargeData.outcome?.type,
      elapsedMs: Date.now() - requestStartedAt,
    });

    return NextResponse.json(
      { success: true, data: chargeData, requestId },
      { headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
    );
  } catch (error) {
    console.error("[Culqi Payment] Unexpected error:", { requestId, error });
    return createErrorResponse("Error interno al procesar el pago. Contacta con soporte si el problema persiste.", 500, requestId);
  }
}