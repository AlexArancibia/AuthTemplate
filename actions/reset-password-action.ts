"use server";

import { db } from "@/lib/db";
import { getUserByEmail } from "@/lib/user-utils";
import bcrypt from "bcryptjs";

export const resetPassword = async (token: string, newPassword: string) => {
  if (!token) {
    return { error: "Token no proporcionado." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const existingToken = await db.passwordResetToken.findUnique({
    where: { token },
  });

  if (!existingToken) {
    return { error: "Token inválido o no encontrado." };
  }

  if (existingToken.expires < new Date()) {
    // Opcionalmente, eliminar el token expirado
    await db.passwordResetToken.delete({ where: { token } }).catch(console.error);
    return { error: "El token ha expirado. Por favor, solicita un nuevo reseteo." };
  }

  const user = await getUserByEmail(existingToken.identifier);

  if (!user) {
    // Esto no debería suceder si el token es válido y está asociado a un email existente
    console.error(`Usuario no encontrado para el token: ${token}, email: ${existingToken.identifier}`);
    return { error: "Usuario no encontrado. Contacta a soporte." };
  }

  // Hashear la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Actualizar la contraseña del usuario
  try {
    await db.user.update({
      where: { email: existingToken.identifier },
      data: { password: hashedPassword },
    });
  } catch (error) {
    console.error("Error al actualizar la contraseña del usuario:", error);
    return { error: "No se pudo actualizar la contraseña. Intenta de nuevo." };
  }

  // Eliminar el token de reseteo una vez usado
  try {
    await db.passwordResetToken.delete({
      where: { token },
    });
  } catch (error) {
    // No es crítico si falla, pero loguear
    console.warn(`No se pudo eliminar el token de reseteo usado: ${token}`, error);
  }

  return { success: "¡Tu contraseña ha sido reseteada exitosamente!" };
};
