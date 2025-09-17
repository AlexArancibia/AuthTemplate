"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const resetPassword = async (token: string, newPassword: string) => {
  // Validación del token
  if (!token) {
    return { error: "Token no proporcionado." };
  }

  // Validación de la contraseña
  if (!newPassword || newPassword.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  try {
    // Buscar el token en la base de datos
    const tokenRecord = await db.passwordResetToken.findFirst({
      where: { token },
    });

    if (!tokenRecord) {
      return { error: "Token inválido o no encontrado." };
    }

    // Verificar si el token ha expirado
    const now = new Date();

    if (tokenRecord.expires < now) {
      try {
        await db.passwordResetToken.delete({ 
          where: { identifier: tokenRecord.identifier } 
        });
      } catch (deleteError) {
        // Error al eliminar token expirado
      }
      return { error: "El token ha expirado. Por favor, solicita un nuevo reseteo." };
    }

    // Buscar el usuario directamente usando Prisma
    const user = await db.user.findUnique({
      where: {
        email: tokenRecord.identifier,
      },
    });

    if (!user) {
      return { error: "Usuario no encontrado. Contacta a soporte." };
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    try {
      const updatedUser = await db.user.update({
        where: { id: user.id }, // Usar ID en lugar de email para mayor precisión
        data: { password: hashedPassword },
      });
      
    } catch (updateError) {
      return { error: "No se pudo actualizar la contraseña. Intenta de nuevo." };
    }

    // Eliminar el token de reseteo una vez usado
    try {
      await db.passwordResetToken.delete({
        where: { identifier: tokenRecord.identifier },
      });
    } catch (deleteError) {
      // No retornamos error aquí porque la contraseña ya se actualizó correctamente
    }
    return { success: "¡Tu contraseña ha sido reseteada exitosamente!" };

  } catch (generalError) {
    return { 
      error: "Error interno del servidor. Por favor, intenta de nuevo más tarde." 
    };
  }
};