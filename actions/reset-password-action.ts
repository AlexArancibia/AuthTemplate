"use server";

import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import bcrypt from "bcryptjs";

export const resetPassword = async (token: string, newPassword: string) => {
  if (!token) return { error: "Token no proporcionado." };
  if (!newPassword || newPassword.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  try {
    const tokenRecord = await db.passwordResetToken.findFirst({
      where: { token },
    });

    if (!tokenRecord) return { error: "Token inválido o no encontrado." };

    const now = new Date();
    if (tokenRecord.expires < now) {
      try {
        await db.passwordResetToken.delete({
          where: { identifier: tokenRecord.identifier },
        });
      } catch (deleteError) {
        logger.error({ err: deleteError }, "[resetPassword] Error al eliminar token expirado");
      }
      return { error: "El token ha expirado. Por favor, solicita un nuevo reseteo." };
    }

    const user = await db.user.findUnique({
      where: {
        email: tokenRecord.identifier,
      },
    });

    if (!user) {
      logger.error("[resetPassword] Usuario no encontrado para token válido");
      return { error: "Usuario no encontrado. Contacta a soporte." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    try {
      const updatedUser = await db.user.update({
        where: { id: user.id }, // Usar ID en lugar de email para mayor precisión
        data: { password: hashedPassword },
      });
      
    } catch (updateError) {
      logger.error(
        {
          err: updateError,
          errorMessage: updateError instanceof Error ? updateError.message : "Error desconocido",
          userId: user.id,
        },
        "[resetPassword] Error al actualizar la contraseña del usuario"
      );
      return { error: "No se pudo actualizar la contraseña. Intenta de nuevo." };
    }

    try {
      await db.passwordResetToken.delete({
        where: { identifier: tokenRecord.identifier },
      });
    } catch (deleteError) {
      logger.warn({ err: deleteError }, "[resetPassword] No se pudo eliminar el token de reseteo usado");
      // No retornamos error aquí porque la contraseña ya se actualizó correctamente
    }

    return { success: "¡Tu contraseña ha sido reseteada exitosamente!" };
  } catch (generalError) {
    logger.error(
      {
        err: generalError,
        errorMessage: generalError instanceof Error ? generalError.message : "Error desconocido",
        errorStack: generalError instanceof Error ? generalError.stack : null,
      },
      "[resetPassword] Error general en el proceso"
    );
    
    return { 
      error: "Error interno del servidor. Por favor, intenta de nuevo más tarde." 
    };
  }
};