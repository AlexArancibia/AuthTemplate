import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

// POST: Establecer una dirección como predeterminada
export async function POST(request: Request, { params }: { params: { addressId: string } }) {
  try {
    // Verificación de autenticación usando auth() en lugar de getServerSession
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const addressId = params.addressId

    // Obtener la dirección para verificar el usuario y tipo
    const address = await db.address.findUnique({
      where: { id: addressId },
      include: { user: { select: { email: true } } },
    })

    if (!address) {
      return NextResponse.json({ message: "Dirección no encontrada" }, { status: 404 })
    }

    // Verificar que el usuario actual es el propietario de la dirección
    // Comparamos el email del usuario en sesión con el email del usuario propietario de la dirección
    if (address.user.email !== session.user.email) {
      return NextResponse.json({ message: "No tienes permiso para modificar esta dirección" }, { status: 403 })
    }

    // Quitar el estado predeterminado de otras direcciones del mismo tipo
    await db.address.updateMany({
      where: {
        userId: address.userId,
        addressType: address.addressType,
        isDefault: true,
        id: { not: addressId },
      },
      data: {
        isDefault: false,
      },
    })

    // Establecer esta dirección como predeterminada
    const updatedAddress = await db.address.update({
      where: { id: addressId },
      data: {
        isDefault: true,
      },
    })

    return NextResponse.json(updatedAddress)
  } catch (error: any) {
    console.error("Error estableciendo dirección predeterminada:", error)
    return NextResponse.json(
      { message: `Error al establecer la dirección predeterminada: ${error.message}` },
      { status: 500 },
    )
  }
}
