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

    // Verificar que el usuario actual está estableciendo su propia contraseña
    if (user.email !== session.user.email) {
      return NextResponse.json({ message: "No tienes permiso para establecer esta contraseña" }, { status: 403 })
    }

    // Verificar que el usuario no tiene contraseña
    if (user.password) {
      return NextResponse.json(
        { message: "El usuario ya tiene una contraseña configurada. Usa la opción de cambiar contraseña." },
        { status: 400 },
      )
    }

    const { newPassword } = await request.json()

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Establecer la contraseña
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error estableciendo contraseña:", error)
    return NextResponse.json({ message: "Error al establecer la contraseña" }, { status: 500 })
  }
}
