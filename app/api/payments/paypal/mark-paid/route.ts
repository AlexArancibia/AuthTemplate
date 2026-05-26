import { NextRequest, NextResponse } from "next/server"
import { getPayPalApiBase, getPayPalCredentials } from "@/lib/paypal"

export const dynamic = "force-dynamic"

const CORS_ORIGIN = (
  process.env.CORS_ORIGIN ||
  process.env.NEXTAUTH_URL ||
  "https://sporttperu.com"
).replace(/\/$/, "")

const getBackendConfig = () => ({
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_ENDPOINT?.trim().replace(/\/$/, ""),
  storeId: process.env.NEXT_PUBLIC_STORE_ID?.trim(),
  orderUpdateSecret: process.env.ORDER_UPDATE_SECRET?.trim(),
})

type PayPalOrderResponse = {
  id?: string
  status?: string
  payer?: {
    email_address?: string
  }
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id?: string
        status?: string
        amount?: {
          currency_code?: string
          value?: string
        }
      }>
    }
  }>
}

async function getPayPalAccessToken() {
  const credentials = await getPayPalCredentials()
  const baseUrl = getPayPalApiBase(credentials.mode)
  const auth = Buffer.from(
    `${credentials.clientId}:${credentials.clientSecret}`
  ).toString("base64")

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || "No se pudo autenticar PayPal.")
  }

  return {
    accessToken: data.access_token as string,
    baseUrl,
    mode: credentials.mode,
  }
}

async function verifyPayPalOrder(orderID: string) {
  const { accessToken, baseUrl, mode } = await getPayPalAccessToken()
  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderID)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  )

  const paypalOrder = (await response.json().catch(() => ({}))) as PayPalOrderResponse

  if (!response.ok) {
    throw new Error("No se pudo verificar la orden PayPal.")
  }

  const capture = paypalOrder.purchase_units?.[0]?.payments?.captures?.[0] ?? null
  const isCompleted =
    paypalOrder.status === "COMPLETED" || capture?.status === "COMPLETED"

  if (!isCompleted) {
    throw new Error("PayPal aún no confirmó el pago como completado.")
  }

  return {
    mode,
    capture,
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": CORS_ORIGIN,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  )
}

export async function POST(req: NextRequest) {
  const { backendUrl, storeId, orderUpdateSecret } = getBackendConfig()

  if (!backendUrl || !storeId || !orderUpdateSecret) {
    return NextResponse.json(
      { success: false, error: "No está configurado el backend para actualizar órdenes." },
      { status: 500, headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
    )
  }

  try {
    const body = await req.json()
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : ""
    const orderID = typeof body.orderID === "string" ? body.orderID.trim() : ""

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId es requerido." },
        { status: 400, headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
      )
    }

    if (!orderID) {
      return NextResponse.json(
        { success: false, error: "orderID de PayPal es requerido." },
        { status: 400, headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
      )
    }

    const { mode, capture } = await verifyPayPalOrder(orderID)
    const captureId =
      capture?.id ?? (typeof body.captureId === "string" ? body.captureId : undefined)
    const payerEmail = typeof body.payerEmail === "string" ? body.payerEmail : undefined

    let updateResponse = await fetch(
      `${backendUrl}/orders/${encodeURIComponent(storeId)}/${encodeURIComponent(orderId)}/mark-paid`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-order-update-secret": orderUpdateSecret,
        },
        body: JSON.stringify({
          provider: "PAYPAL",
          orderID,
          captureId,
          payerEmail,
          amount: capture?.amount ?? body.amount,
          mode,
          paymentSuccessful: true,
        }),
      }
    )

    let updateResult = await updateResponse.json().catch(() => ({}))

    if (updateResponse.status === 404) {
      console.warn(
        "[PayPal mark-paid] Dedicated backend endpoint unavailable, using transitional PUT fallback",
        { orderId, orderID }
      )
      updateResponse = await fetch(
        `${backendUrl}/orders/${encodeURIComponent(storeId)}/${encodeURIComponent(orderId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-order-update-secret": orderUpdateSecret,
          },
          body: JSON.stringify({
            financialStatus: "PAID",
            paymentStatus: "COMPLETED",
            paymentDetails: {
              provider: "PAYPAL",
              mode,
              paypalStatus: "COMPLETED",
              captureStatus: "COMPLETED",
              paymentSuccessful: true,
              paymentStatusLabel: "Pago exitoso",
              orderID,
              captureId,
              payerEmail,
              amount: capture?.amount ?? body.amount,
              paidAt: new Date().toISOString(),
              paypalVerifiedAt: new Date().toISOString(),
              markedPaidBy: "paypal-server",
            },
          }),
        }
      )
      updateResult = await updateResponse.json().catch(() => ({}))
    }

    const updatedOrder = updateResult?.data ?? updateResult

    if (!updateResponse.ok) {
      console.warn("[PayPal mark-paid] Backend update failed", {
        orderId,
        orderID,
        captureId,
        status: updateResponse.status,
        error: updateResult?.message || updateResult?.error,
      })
      return NextResponse.json(
        {
          success: false,
          error: updateResult?.message || "No se pudo marcar la orden como pagada en backend.",
          backend: updateResult,
        },
        { status: updateResponse.status, headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
      )
    }

    return NextResponse.json(
      { success: true, data: updatedOrder },
      { headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
    )
  } catch (error) {
    console.error("[PayPal mark-paid] Error marking order as paid:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "No se pudo marcar la orden PayPal como pagada.",
      },
      { status: 500, headers: { "Access-Control-Allow-Origin": CORS_ORIGIN } }
    )
  }
}
