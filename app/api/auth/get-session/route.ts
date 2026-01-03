import { NextResponse } from "next/server";

// Handle the invalid /api/auth/get-session endpoint
// This route has precedence over the catch-all [...nextauth] route
export async function GET() {
  // Return 404 for invalid endpoint
  return NextResponse.json(
    { error: "Endpoint not found. Use /api/auth/session instead." },
    { status: 404 }
  );
}
