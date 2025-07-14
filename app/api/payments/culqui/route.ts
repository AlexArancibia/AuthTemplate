import { NextRequest, NextResponse } from "next/server";
import { getSecretKey } from "@/lib/culqui-pk";

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // O pon tu dominio en vez de *
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log("Petición recibida en /api/payments/culqui");
    const { token, amount, currency, description, email } = await req.json();
    const secretKey = await getSecretKey();

    const response = await fetch("https://api.culqi.com/v2/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        amount, // en centavos
        currency_code: currency, // "PEN"
        email,
        source_id: token,
        description,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.merchant_message || "Error en el pago" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, {
        headers: {
            "Access-Control-Allow-Origin": "*", // O pon tu dominio
        },
    });
  } catch (error) {
    return NextResponse.json({ error: "Error procesando el pago" }, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // O pon tu dominio
      },
    });
  }
}