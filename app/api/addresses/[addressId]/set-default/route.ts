import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

// POST: Establecer una dirección como predeterminada
export async function POST(request: Request, { params }: { params: Promise<{ addressId: string }> }) {
  try {
    // Verificación de autenticación usando auth() en lugar de getServerSession
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { addressId } = await params

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

    // Quitar el estado predeterminado de otras direcciones según el tipo
    let addressTypesToUpdate: ("both" | "shipping" | "billing")[] = []
    
    if (address.addressType === "both") {
      // Si es tipo "both", desmarcar todas las direcciones (both, shipping, billing)
      addressTypesToUpdate = ["both", "shipping", "billing"]
    } else if (address.addressType === "shipping") {
      // Si es tipo "shipping", desmarcar shipping y both
      addressTypesToUpdate = ["shipping", "both"]
    } else if (address.addressType === "billing") {
      // Si es tipo "billing", desmarcar billing y both
      addressTypesToUpdate = ["billing", "both"]
    }

    await db.address.updateMany({
      where: {
        userId: address.userId,
        addressType: { in: addressTypesToUpdate },
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
  } catch (error: unknown) {
    console.error("Error estableciendo dirección predeterminada:", error)
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json(
      { message: `Error al establecer la dirección predeterminada: ${errorMessage}` },
      { status: 500 },
    )
  }
}
