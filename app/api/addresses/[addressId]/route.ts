import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { addressPatchSchema } from "@/lib/zod"

// PATCH: Actualizar una dirección existente
export async function PATCH(request: Request, { params }: { params: Promise<{ addressId: string }> }) {
  try {
    // Verificación de autenticación usando auth() en lugar de getServerSession
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { addressId } = await params

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

    // Obtener y validar datos (allowlist: solo campos permitidos)
    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return NextResponse.json({ message: "Cuerpo de solicitud inválido" }, { status: 400 })
    }

    const parsed = addressPatchSchema.safeParse(raw)
    if (!parsed.success) {
      const firstError = parsed.error.flatten().fieldErrors
      const msg = Object.values(firstError).flat().join("; ") || "Datos de actualización inválidos"
      return NextResponse.json({ message: msg }, { status: 400 })
    }

    const data = parsed.data
    const updateData: Record<string, unknown> = {}
    if (data.address1 !== undefined) updateData.address1 = data.address1
    if (data.address2 !== undefined) updateData.address2 = data.address2
    if (data.city !== undefined) updateData.city = data.city
    if (data.province !== undefined) updateData.province = data.province
    if (data.zip !== undefined) updateData.zip = data.zip
    if (data.country !== undefined) updateData.country = data.country
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.company !== undefined) updateData.company = data.company
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault
    if (data.addressType !== undefined) updateData.addressType = data.addressType

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No hay campos válidos para actualizar" }, { status: 400 })
    }

    // Si se está estableciendo como predeterminada, actualizar otras direcciones del mismo tipo
    if (data.isDefault) {
      await db.address.updateMany({
        where: {
          userId: currentAddress.userId,
          addressType: (data.addressType ?? currentAddress.addressType) as "shipping" | "billing" | "both",
          isDefault: true,
          id: { not: addressId },
        },
        data: { isDefault: false },
      })
    }

    // Actualizar la dirección (solo campos allowlist)
    const updatedAddress = await db.address.update({
      where: { id: addressId },
      data: updateData,
    })

    return NextResponse.json(updatedAddress)
  } catch (error: unknown) {
    console.error("Error actualizando dirección:", error)
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ message: `Error al actualizar la dirección: ${errorMessage}` }, { status: 500 })
  }
}

// DELETE: Eliminar una dirección
export async function DELETE(request: Request, { params }: { params: Promise<{ addressId: string }> }) {
  try {
    // Verificación de autenticación usando auth() en lugar de getServerSession
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { addressId } = await params

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
  } catch (error: unknown) {
    console.error("Error eliminando dirección:", error)
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ message: `Error al eliminar la dirección: ${errorMessage}` }, { status: 500 })
  }
}
