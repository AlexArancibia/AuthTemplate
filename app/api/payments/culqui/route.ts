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

  try {
    // 1. Parsear y validar body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      return createErrorResponse("Formato de solicitud inválido", 400, requestId);
    }

    const { token, amount: reqAmount, currency, description, email, firstName, lastName, phone, address, city, countryCode, orderId } = requestBody;

    // 2. Validar campos requeridos
    const missingFields = [token ? null : "token", reqAmount ? null : "amount", currency ? null : "currency", email ? null : "email", orderId ? null : "orderId"].filter(Boolean) as string[];
    if (missingFields.length > 0) {
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
      return createErrorResponse("Número de teléfono inválido. Debe tener entre 6 y 14 dígitos.", 400, requestId);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return createErrorResponse("El formato del email no es válido", 400, requestId);
    }

    const numericAmount = Number(reqAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return createErrorResponse("El monto debe ser un número positivo", 400, requestId);
    }

    // 5. Realizar petición a Culqi
    let response: Response;
    let responseText: string;

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
          description: description || `Orden ${orderId}`,
          metadata: { firstName, lastName, phone: sanitizedPhone, orderId, requestId },
          antifraud_details: {
            first_name: firstName,
            last_name: lastName,
            phone_number: sanitizedPhone,
            address,
            address_city: city,
            country_code: countryCode || "PE",
          },
        }),
      });
      responseText = await response.text();
    } catch {
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
      return createErrorResponse("Respuesta incompleta del procesador de pagos", 502, requestId);
    }

    return NextResponse.json(
      { success: true, data: chargeData, requestId },
      { headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
    );
  } catch (error) {
    console.error("[Culqi Payment] Unexpected error:", error);
    return createErrorResponse("Error interno al procesar el pago. Contacta con soporte si el problema persiste.", 500, requestId);
  }
}