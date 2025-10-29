import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

// POST: Crear una nueva dirección para un usuario
export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    // Verificación de autenticación usando auth() en lugar de getServerSession
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { userId } = await params

    // Obtener los datos para crear la dirección
    const data = await request.json()

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
        { message: "No tienes permiso para crear direcciones para este usuario" },
        { status: 403 },
      )
    }

    // Si la dirección es predeterminada, actualizar otras direcciones del mismo tipo
    if (data.isDefault) {
      await db.address.updateMany({
        where: {
          userId,
          addressType: data.addressType,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    // Crear la nueva dirección
    const newAddress = await db.address.create({
      data: {
        ...data,
        userId,
      },
    })

    return NextResponse.json(newAddress)
  } catch (error: any) {
    console.error("Error creating address:", error)
    return NextResponse.json({ message: `Error al crear la dirección: ${error.message}` }, { status: 500 })
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
  } catch (error: any) {
    console.error("Error obteniendo direcciones:", error)
    return NextResponse.json({ message: "Error al obtener las direcciones" }, { status: 500 })
  }
}
