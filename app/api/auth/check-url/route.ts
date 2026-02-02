import { NextResponse } from "next/server";

/** Solo desarrollo: ayuda a depurar redirect_uri con Google. En producción responde 404. */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse(null, { status: 404 });
  }
  const base = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "";
  const redirectUri = base ? `${base.replace(/\/$/, "")}/api/auth/callback/google` : "";
  return NextResponse.json({
    AUTH_URL: process.env.AUTH_URL ?? "",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "",
    redirect_uri: redirectUri,
  });
}
