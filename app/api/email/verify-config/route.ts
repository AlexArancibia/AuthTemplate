import { type NextRequest, NextResponse } from "next/server"
import { verifyEmailConfig } from "@/lib/nodemailer"

export async function GET(request: NextRequest) {
  try {
    const isValid = await verifyEmailConfig()

    return NextResponse.json({
      success: isValid,
      message: isValid ? "Configuración de correo válida" : "Error en la configuración de correo",
    })
  } catch (error) {
    console.error("Error verificando configuración de correo:", error)
    return NextResponse.json({ error: "Error verificando configuración" }, { status: 500 })
  }
}
