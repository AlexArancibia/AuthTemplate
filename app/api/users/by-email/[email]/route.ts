import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { userProfileUpdateSchema } from "@/lib/zod"

// GET: Obtener usuario por email
export async function GET(request: Request, { params }: { params: Promise<{ email: string }> }) {
  try {
    // Verificación de autenticación usando auth() en lugar de getServerSession
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    // Descodificar el email (viene codificado en la URL)
    const { email: encodedEmail } = await params
    const email = decodeURIComponent(encodedEmail)

    // Verificar que el usuario actual está solicitando sus propios datos
    if (email !== session.user.email) {
      return NextResponse.json({ message: "No tienes permiso para acceder a estos datos" }, { status: 403 })
    }

    // Consulta a Prisma para obtener el usuario con todas sus relaciones
    const user = await db.user.findUnique({
      where: {
        email: email,
      },
      include: {
        accounts: true,
        addresses: {
          orderBy: {
            isDefault: "desc", // Ordenar direcciones con la predeterminada primero
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
    }

    // Eliminar el campo password por seguridad antes de devolverlo
    const { password, ...safeUser } = user

    return NextResponse.json(safeUser)
  } catch (error: unknown) {
    console.error("Error obteniendo usuario por email:", error)
    return NextResponse.json({ message: "Error al obtener datos del usuario" }, { status: 500 })
  }
}

// PATCH: Actualizar usuario por email
export async function PATCH(request: Request, { params }: { params: Promise<{ email: string }> }) {
  try {
    // Verificación de autenticación usando auth() en lugar de getServerSession
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    // Descodificar el email (viene codificado en la URL)
    const { email: encodedEmail } = await params
    const email = decodeURIComponent(encodedEmail)

    // Verificar que el usuario actual está actualizando sus propios datos
    if (email !== session.user.email) {
      return NextResponse.json({ message: "No tienes permiso para modificar estos datos" }, { status: 403 })
    }

    // Obtener y validar datos (allowlist: solo campos permitidos)
    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      return NextResponse.json({ message: "Cuerpo de solicitud inválido" }, { status: 400 })
    }

    const parsed = userProfileUpdateSchema.safeParse(raw)
    if (!parsed.success) {
      const firstError = parsed.error.flatten().fieldErrors
      const msg = Object.values(firstError).flat().join("; ") || "Datos de actualización inválidos"
      return NextResponse.json({ message: msg }, { status: 400 })
    }

    const data = parsed.data
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.firstName !== undefined) updateData.firstName = data.firstName
    if (data.lastName !== undefined) updateData.lastName = data.lastName
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.company !== undefined) updateData.company = data.company
    if (data.taxId !== undefined) updateData.taxId = data.taxId
    if (data.image !== undefined) updateData.image = data.image
    if (data.acceptsMarketing !== undefined) updateData.acceptsMarketing = data.acceptsMarketing

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No hay campos válidos para actualizar" }, { status: 400 })
    }

    // Verificar que el usuario existe antes de actualizarlo
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (!existingUser) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
    }

    // Actualizar el usuario en la base de datos (solo campos allowlist)
    const updatedUser = await db.user.update({
      where: { email },
      data: updateData,
      include: {
        accounts: true,
        addresses: {
          orderBy: {
            isDefault: "desc",
          },
        },
      },
    })

    // Eliminar el campo password por seguridad
    const { password, ...safeUser } = updatedUser

    return NextResponse.json(safeUser)
  } catch (error: unknown) {
    console.error("Error actualizando usuario por email:", error)

    // Manejar errores específicos de Prisma
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      return NextResponse.json({ message: "El email ya está en uso por otro usuario" }, { status: 409 })
    }

    return NextResponse.json({ message: "Error al actualizar datos del usuario" }, { status: 500 })
  }
}
