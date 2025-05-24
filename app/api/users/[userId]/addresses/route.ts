import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

// POST: Crear una nueva dirección para un usuario
export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    // Verificación de autenticación usando auth() en lugar de getServerSession
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const userId = params.userId
    console.log(`Creating address for user ID: ${userId}`)

    // Obtener los datos para crear la dirección
    const data = await request.json()
    console.log("Address data:", data)

    // Verificar que el usuario existe
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    })

    if (!user) {
      console.log(`User with ID ${userId} not found`)
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar que el usuario actual es el propietario de la dirección
    if (user.email !== session.user.email) {
      return NextResponse.json(
        { message: "No tienes permiso para crear direcciones para este usuario" },
        { status: 403 },
      )
    }

    console.log(`User found: ${user.email}`)

    // Si la dirección es predeterminada, actualizar otras direcciones del mismo tipo
    if (data.isDefault) {
      console.log(`Setting other addresses of type ${data.addressType} to non-default`)
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
    console.log("Creating new address in database")
    const newAddress = await db.address.create({
      data: {
        ...data,
        userId,
      },
    })

    console.log(`Address created successfully with ID: ${newAddress.id}`)
    return NextResponse.json(newAddress)
  } catch (error: any) {
    console.error("Error creating address:", error)
    return NextResponse.json({ message: `Error al crear la dirección: ${error.message}` }, { status: 500 })
  }
}

// GET: Obtener todas las direcciones de un usuario
export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    // Verificación de autenticación usando auth() en lugar de getServerSession
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const userId = params.userId

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
