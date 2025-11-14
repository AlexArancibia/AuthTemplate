import { NextRequest, NextResponse } from "next/server";
import { getSecretKey } from "@/lib/culqui-pk";

const sanitizePhone = (value?: string) => (value ?? "").replace(/\D/g, "");

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "https://anj.com/",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const {
      token, amount, currency, description, email,
      firstName, lastName, phone, address, city, countryCode,
      orderNumber
    } = await req.json();
    const secretKey = await getSecretKey();
    const sanitizedPhone = sanitizePhone(phone);

    if (sanitizedPhone.length < 6 || sanitizedPhone.length > 14) {
      return NextResponse.json(
        { error: "Número de teléfono inválido. Debe tener entre 6 y 14 dígitos." },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "https://anj.com/",
          },
        }
      );
    }

    const response = await fetch("https://api.culqi.com/v2/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        amount,
        currency_code: currency,
        email,
        source_id: token,
        description,
        orderNumber,
        metadata: {
          firstName,
          lastName,
          phone: sanitizedPhone,
        },
        antifraud_details: {
          first_name: firstName,
          last_name: lastName,
          phone_number: sanitizedPhone,
          address,
          address_city: city,
          country_code: countryCode
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.merchant_message || "Error en el pago" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, {
        headers: {
            "Access-Control-Allow-Origin": "https://anj.com/",
        },
    });
  } catch (error) {
    return NextResponse.json({ error: "Error procesando el pago" }, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://anj.com/",
      },
    });
  }
}