import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSecretKey } from "@/lib/culqui-pk";

const SIGNATURE_HEADER = "x-culqi-signature";

const verifySignature = (payload: string, signature: string | null, secret: string) => {
  if (!signature) return false;

  const computed = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  const signatureBuffer = Buffer.from(signature, "utf8");
  const computedBuffer = Buffer.from(computed, "utf8");

  if (signatureBuffer.length !== computedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, computedBuffer);
};

export async function POST(req: NextRequest) {
  try {
    const secretKey = await getSecretKey();
    const rawBody = await req.text();
    const signature = req.headers.get(SIGNATURE_HEADER);

    if (!verifySignature(rawBody, signature, secretKey)) {
      return NextResponse.json(
        { error: "Invalid Culqi signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.type || event.event_type;

    switch (eventType) {
      case "charge.created":
      case "charge.captured":
      case "charge.refunded":
        // TODO: actualiza el estado de la orden según tu lógica de negocio
        console.info(`[Culqi webhook] Event received: ${eventType}`, {
          chargeId: event.data?.id ?? event.charge?.id,
        });
        break;
      default:
        console.warn("[Culqi webhook] Unhandled event type", eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Culqi webhook] Error processing webhook", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json(
    { message: "Culqi webhook endpoint" },
    { status: 200 }
  );
}

