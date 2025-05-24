import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

// PATCH: Actualizar una dirección existente
export async function PATCH(request: Request, { params }: { params: { addressId: string } }) {
  try {
    // Verificación de autenticación usando auth() en lugar de getServerSession
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const addressId = params.addressId

    // Obtener la dirección actual para verificar el usuario
    const currentAddress = await db.address.findUnique({
      where: { id: addressId },
      include: { user: { select: { email: true } } },
    })

    if (!currentAddress) {
      return NextResponse.json({ message: "Dirección no encontrada" }, { status: 404 })
    }

    // Verificar que el usuario actual es el propietario de la dirección
    // Comparamos el email del usuario en sesión con el email del usuario propietario de la dirección
    if (currentAddress.user.email !== session.user.email) {
      return NextResponse.json({ message: "No tienes permiso para modificar esta dirección" }, { status: 403 })
    }

    // Obtener los datos para actualizar
    const data = await request.json()

    // Si se está estableciendo como predeterminada, actualizar otras direcciones del mismo tipo
    if (data.isDefault) {
      await db.address.updateMany({
        where: {
          userId: currentAddress.userId,
          addressType: currentAddress.addressType,
          isDefault: true,
          id: { not: addressId },
        },
        data: {
          isDefault: false,
        },
      })
    }

    // Actualizar la dirección
    const updatedAddress = await db.address.update({
      where: { id: addressId },
      data,
    })

    return NextResponse.json(updatedAddress)
  } catch (error: any) {
    console.error("Error actualizando dirección:", error)
    return NextResponse.json({ message: `Error al actualizar la dirección: ${error.message}` }, { status: 500 })
  }
}

// DELETE: Eliminar una dirección
export async function DELETE(request: Request, { params }: { params: { addressId: string } }) {
  try {
    // Verificación de autenticación usando auth() en lugar de getServerSession
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const addressId = params.addressId

    // Obtener la dirección para verificar el usuario
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
      return NextResponse.json({ message: "No tienes permiso para eliminar esta dirección" }, { status: 403 })
    }

    // Eliminar la dirección
    await db.address.delete({
      where: { id: addressId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error eliminando dirección:", error)
    return NextResponse.json({ message: `Error al eliminar la dirección: ${error.message}` }, { status: 500 })
  }
}
