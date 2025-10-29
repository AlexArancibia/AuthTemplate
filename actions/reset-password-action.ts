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
        console.error("Error al eliminar token expirado:", deleteError);
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
      console.error("Usuario no encontrado para token válido:", {
        token: token.substring(0, 8) + "...",
        email: tokenRecord.identifier
      });
      return { error: "Usuario no encontrado. Contacta a soporte." };
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    try {
      await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    } catch (updateError) {
      console.error("Error al actualizar la contraseña del usuario:", {
        error: updateError,
        errorMessage: updateError instanceof Error ? updateError.message : 'Error desconocido',
        userEmail: tokenRecord.identifier,
        userId: user.id
      });
      return { error: "No se pudo actualizar la contraseña. Intenta de nuevo." };
    }

    // Eliminar el token de reseteo una vez usado
    try {
      await db.passwordResetToken.delete({
        where: { identifier: tokenRecord.identifier },
      });
    } catch (deleteError) {
      console.warn("No se pudo eliminar el token de reseteo usado:", {
        token: token.substring(0, 8) + "...",
        identifier: tokenRecord.identifier,
        error: deleteError
      });
      // No retornamos error aquí porque la contraseña ya se actualizó correctamente
    }

    return { success: "¡Tu contraseña ha sido reseteada exitosamente!" };

  } catch (generalError) {
    console.error("Error general en el proceso de reset:", {
      error: generalError,
      errorMessage: generalError instanceof Error ? generalError.message : 'Error desconocido',
      errorStack: generalError instanceof Error ? generalError.stack : null,
      token: token.substring(0, 8) + "..."
    });
    
    return { 
      error: "Error interno del servidor. Por favor, intenta de nuevo más tarde." 
    };
  }
};