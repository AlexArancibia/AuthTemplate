import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { addressCreateSchema } from "@/lib/zod"

// POST: Crear una nueva dirección para un usuario
export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    // Verificación de autenticación usando auth() en lugar de getServerSession
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { userId } = await params

    // Obtener y validar datos (allowlist: solo campos permitidos)
    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return NextResponse.json({ message: "Cuerpo de solicitud inválido" }, { status: 400 })
    }

    const parsed = addressCreateSchema.safeParse(raw)
    if (!parsed.success) {
      const firstError = parsed.error.flatten().fieldErrors
      const msg = Object.values(firstError).flat().join("; ") || "Datos de dirección inválidos"
      return NextResponse.json({ message: msg }, { status: 400 })
    }

    const data = parsed.data

    // Verificar que el usuario existe
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    })

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
    }

    if (user.email !== session.user.email) {
      return NextResponse.json(
        { message: "No tienes permiso para crear direcciones para este usuario" },
        { status: 403 },
      )
    }

    if (data.isDefault) {
      await db.address.updateMany({
        where: {
          userId,
          addressType: data.addressType,
          isDefault: true,
        },
        data: { isDefault: false },
      })
    }

    const newAddress = await db.address.create({
      data: {
        addressType: data.addressType,
        address1: data.address1,
        address2: data.address2 ?? null,
        city: data.city,
        province: data.province ?? null,
        zip: data.zip,
        country: data.country,
        phone: data.phone ?? null,
        company: data.company ?? null,
        isDefault: data.isDefault ?? false,
        userId,
      },
    })
    return NextResponse.json(newAddress)
  } catch (error: unknown) {
    console.error("Error creating address:", error)
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ message: `Error al crear la dirección: ${errorMessage}` }, { status: 500 })
  }
}

// GET: Obtener todas las direcciones de un usuario
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    // Verificación de autenticación usando auth() en lugar de getServerSession
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { userId } = await params

    // Verificar que el usuario existe
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    })

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar que el usuario actual es el propietario de la dirección
    if (user.email !== session.user.email) {
      return NextResponse.json(
        { message: "No tienes permiso para ver las direcciones de este usuario" },
        { status: 403 },
      )
    }

    // Obtener todas las direcciones del usuario
    const addresses = await db.address.findMany({
      where: { userId },
      orderBy: {
        isDefault: "desc",
      },
    })

    return NextResponse.json(addresses)
  } catch (error: unknown) {
    console.error("Error obteniendo direcciones:", error)
    return NextResponse.json({ message: "Error al obtener las direcciones" }, { status: 500 })
  }
}
