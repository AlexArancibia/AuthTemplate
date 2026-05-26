import { NextRequest, NextResponse } from "next/server";
import { getPayPalApiBase, getPayPalCredentials } from "@/lib/paypal";
import { checkRateLimit } from "@/lib/rate-limit";

const CORS_ORIGIN = (
  process.env.CORS_ORIGIN ||
  process.env.NEXTAUTH_URL ||
  "https://sporttperu.com"
).replace(/\/$/, "");

type PayPalCaptureResponse = {
  id?: string;
  status?: string;
  payer?: {
    email_address?: string;
  };
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
        amount?: {
          currency_code?: string;
          value?: string;
        };
      }>;
    };
  }>;
};

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": CORS_ORIGIN,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}

async function getAccessToken() {
  const credentials = await getPayPalCredentials();
  const baseUrl = getPayPalApiBase(credentials.mode);
  const auth = Buffer.from(
    `${credentials.clientId}:${credentials.clientSecret}`
  ).toString("base64");

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || "No se pudo autenticar PayPal.");
  }

  return {
    accessToken: data.access_token as string,
    baseUrl,
    mode: credentials.mode,
  };
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(`paypal:${ip}`, 20)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." },
        { status: 429, headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
      );
    }

    const { orderID, amount, currency, email, temporalOrderId } =
      await req.json();

    if (!orderID || typeof orderID !== "string") {
      return NextResponse.json(
        { error: "PayPal orderID es requerido." },
        { status: 400, headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
      );
    }

    const { accessToken, baseUrl, mode } = await getAccessToken();
    const response = await fetch(
      `${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
      }
    );

    const captureData = (await response
      .json()
      .catch(() => ({}))) as PayPalCaptureResponse & { message?: string };

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            captureData.message ||
            "No se pudo capturar el pago de PayPal.",
          paypal: captureData,
        },
        { status: 400, headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
      );
    }

    const capture =
      captureData.purchase_units?.[0]?.payments?.captures?.[0] ?? null;
    const isCompleted =
      captureData.status === "COMPLETED" || capture?.status === "COMPLETED";

    if (!isCompleted) {
      return NextResponse.json(
        {
          success: false,
          error: "PayPal no confirmó el pago como completado.",
          paypal: captureData,
        },
        { status: 400, headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        provider: "PAYPAL",
        mode,
        status: "COMPLETED",
        orderID,
        captureId: capture?.id,
        captureStatus: capture?.status,
        payerEmail: captureData.payer?.email_address ?? email,
        amount: capture?.amount ?? {
          value: amount,
          currency_code: currency,
        },
        temporalOrderId,
        paypal: captureData,
      },
      { headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
    );
  } catch (error) {
    console.error("[PayPal] Error capturing payment:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error procesando el pago de PayPal.",
      },
      { status: 500, headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
    );
  }
}
