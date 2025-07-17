import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
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
      select: { id: true, email: true, password: true },
    })

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar que el usuario actual está cambiando su propia contraseña
    if (user.email !== session.user.email) {
      return NextResponse.json({ message: "No tienes permiso para cambiar esta contraseña" }, { status: 403 })
    }

    const { currentPassword, newPassword } = await request.json()

    // Verificar que la contraseña actual es correcta
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return NextResponse.json({ message: "La contraseña actual es incorrecta" }, { status: 400 })
      }
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar la contraseña
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error cambiando contraseña:", error)
    return NextResponse.json({ message: "Error al cambiar la contraseña" }, { status: 500 })
  }
}
