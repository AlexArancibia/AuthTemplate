// Create a new API route to safely fetch the session on the client side

import { auth } from "@/auth"
import { NextResponse } from "next/server"
 

export async function GET() {
  try {
    const session = await auth()
    return NextResponse.json(session)
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}
