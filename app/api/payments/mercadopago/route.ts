// app/api/mercadopago/preference/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/mercadopago-ac";
import { MercadoPagoConfig, Preference } from 'mercadopago';

const accessToken = await getAccessToken();
const client = new MercadoPagoConfig({ accessToken: accessToken });
const localUrl = process.env.NEXT_PUBLIC_LOCAL_PUBLIC_URL


export async function OPTIONS() {
  const origin = process.env.NEXTAUTH_URL;
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const {
      // mismos datos que ya mandas a Culqi:
      amount, // en CENTIMOS si viene de Culqi
      currency, // "PEN"
      description,
      email,
      firstName,
      lastName,
      phone,
      address,
      city,
      countryCode,
      temporalOrderId,
      // opcional: si tienes líneas de ítems
      items, // [{ title, quantity, unit_price, currency_id }]
      // opcional: URLs de retorno
      backUrls, // { success, pending, failure }
    } = await req.json();

    let origin = process.env.NEXTAUTH_URL;
    if (!origin) {
      return NextResponse.json(
        { error: "Falta NEXTAUTH_URL en variables de entorno" },
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }
    // Si origin no es https, usar https://sporttperu.com/ como fallback temporal
    if (!/^https:\/\//i.test(origin)) {
      origin = "localhost:3000";
    }

    // Si no envías items detallados, crea uno con description+amount:
    const mpItems =
      Array.isArray(items) && items.length > 0
        ? items.map((it, idx) => ({
            id: it.id ? String(it.id) : `item-${idx + 1}`,
            title: String(it.title),
            quantity: Number(it.quantity) || 1,
            unit_price: Number(it.unit_price),
            currency_id: it.currency_id || currency || "PEN",
          }))
        : [
            {
              id: "item-1",
              title: String(description || "Pedido"),
              quantity: 1,
              unit_price: Number((Number(amount) || 0) / 100), // ¡Culqi usa centavos!
              currency_id: currency || "PEN",
            },
          ];

    // backUrls puede venir vacío o incompleto, aseguramos URLs absolutas válidas
    const safeBackUrls = {
      success: backUrls?.success && /^https?:\/\//i.test(backUrls.success) ? backUrls.success : `${origin.replace(/\/$/, '')}/success`,
      pending: backUrls?.pending && /^https?:\/\//i.test(backUrls.pending) ? backUrls.pending : `${origin.replace(/\/$/, '')}/pending`,
      failure: backUrls?.failure && /^https?:\/\//i.test(backUrls.failure) ? backUrls.failure : `${origin.replace(/\/$/, '')}/failure`,
    };

    const preference = {
      items: mpItems,
      payer: {
        email,
        name: firstName,
        surname: lastName,
        phone: phone ? { number: String(phone) } : undefined,
        address: address
          ? {
              street_name: String(address),
              city: city ? String(city) : undefined,
            }
          : undefined,
      },
      external_reference: String(temporalOrderId || ""),
      metadata: {
        temporalOrderId,
        source: "ecommerce",
        countryCode,
        rawAddress: address,
        city,
      },
      back_urls: safeBackUrls,
      auto_return: "approved",
      payment_methods: {
        installments: 1
      },
      // redirectMode: "modal",
      notification_url: `${localUrl}/api/webhooks/mercadopago`,
    };

    // Usar el SDK oficial para crear la preferencia
    const preferenceClient = new Preference(client);
    let data;
    try {
      data = await preferenceClient.create({ body: preference });
    } catch (err: any) {
      return NextResponse.json(
        { error: err?.message || "No se pudo crear la preferencia" },
        { status: 400, headers: { "Access-Control-Allow-Origin": origin } }
      );
    }
    if (!data?.id) {
      return NextResponse.json(
        { error: "No se pudo obtener el preference_id de MercadoPago" },
        { status: 400, headers: { "Access-Control-Allow-Origin": origin } }
      );
    }
    // Enviar al frontend la URL para redirigir:
    return NextResponse.json(
      {
        success: true,
        preference_id: data.id,
        init_point: data.init_point, // URL PROD (o sandbox según tu token)
        sandbox_init_point: data.sandbox_init_point,
      },
      { headers: { "Access-Control-Allow-Origin": origin } }
    );
  } catch (err) {
    const origin = process.env.NEXTAUTH_URL;
    return NextResponse.json(
      { error: "Error creando preferencia" },
      { status: 500, headers: { "Access-Control-Allow-Origin": origin || "*" } }
    );
  }
}
