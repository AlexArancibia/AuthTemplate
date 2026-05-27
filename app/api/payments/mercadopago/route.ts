// app/api/mercadopago/preference/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/mercadopago-ac";
import { MercadoPagoConfig, Preference } from 'mercadopago';

const localUrl = process.env.NEXT_PUBLIC_LOCAL_PUBLIC_URL?.trim()

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

const isAbsoluteHttpUrl = (value?: string | null): value is string =>
  Boolean(value && /^https?:\/\//i.test(value));

function isLocalUrl(value: string) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

const isUsableReturnUrl = (value?: string | null): value is string =>
  isAbsoluteHttpUrl(value) &&
  !(process.env.NODE_ENV === "production" && isLocalUrl(value));

function getRequestOrigin(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host");

  if (forwardedHost) {
    const forwardedProto =
      req.headers.get("x-forwarded-proto") ||
      (forwardedHost.includes("localhost") ? "http" : "https");
    return `${forwardedProto}://${forwardedHost}`;
  }

  return req.nextUrl.origin;
}

function resolvePublicBaseUrl(req: NextRequest) {
  const vercelUrl = process.env.VERCEL_URL?.trim()
    ? `https://${process.env.VERCEL_URL.trim()}`
    : undefined;
  const requestOrigin = getRequestOrigin(req);
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    vercelUrl,
    process.env.NODE_ENV === "production" && isLocalUrl(requestOrigin)
      ? undefined
      : requestOrigin,
    "https://sporttperu.com",
  ];

  return candidates
    .map((value) => value?.trim())
    .find(isAbsoluteHttpUrl);
}

function getCorsOrigin(req: NextRequest) {
  return (
    process.env.CORS_ORIGIN?.trim() ||
    resolvePublicBaseUrl(req) ||
    "*"
  );
}


export async function OPTIONS(req: NextRequest) {
  const origin = getCorsOrigin(req);
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
    // IMPORTANT: avoid top-level MercadoPago initialization so builds don't fail
    // when env vars are missing. We only resolve credentials at request time.
    const accessToken = await getAccessToken();
    const client = new MercadoPagoConfig({ accessToken });

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

    const origin = resolvePublicBaseUrl(req);
    if (!origin) {
      return NextResponse.json(
        { error: "No se pudo determinar la URL pública para MercadoPago" },
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const baseUrl = trimTrailingSlash(origin);

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
      success: isUsableReturnUrl(backUrls?.success) ? backUrls.success : `${baseUrl}/success`,
      pending: isUsableReturnUrl(backUrls?.pending) ? backUrls.pending : `${baseUrl}/pending`,
      failure: isUsableReturnUrl(backUrls?.failure) ? backUrls.failure : `${baseUrl}/failure`,
    };

    const canAutoReturn = !Object.values(safeBackUrls).some(isLocalUrl);

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
      ...(canAutoReturn ? { auto_return: "approved" as const } : {}),
      payment_methods: {
        installments: 1
      },
      // redirectMode: "modal",
      ...(localUrl ? { notification_url: `${localUrl}/api/webhooks/mercadopago` } : {}),
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
    const origin = getCorsOrigin(req);
    return NextResponse.json(
      { error: "Error creando preferencia" },
      { status: 500, headers: { "Access-Control-Allow-Origin": origin } }
    );
  }
}
