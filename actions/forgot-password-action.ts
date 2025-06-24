"use server";

import { db } from "@/lib/db";
import { getUserByEmail } from "@/lib/user-utils";
import { nanoid } from "nanoid";
import { sendPasswordResetEmail } from "@/lib/mail"; // Necesitaremos crear esta función

export const forgotPassword = async (email: string) => {
  // Validar el email (aunque Zod ya lo hace en el cliente, es bueno validar en el servidor también)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email inválido." };
  }

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    // No revelar si el usuario existe o no por seguridad
    // Simplemente retornar un mensaje genérico
    return { success: "Si existe una cuenta con ese email, recibirás un enlace para resetear tu contraseña." };
  }

  // Generar token de reseteo
  const token = nanoid();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 1); // 1 hora de expiración

  // Eliminar tokens de reseteo existentes para este usuario
  await db.passwordResetToken.deleteMany({
    where: { identifier: existingUser.email },
  });

  // Guardar el nuevo token en la base de datos
  await db.passwordResetToken.create({
    data: {
      identifier: existingUser.email,
      token,
      expires,
    },
  });

  // Enviar email con el enlace de reseteo
  // El enlace debería apuntar a algo como /reset-password?token=TOKEN_AQUI
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(existingUser.email, resetLink); // Esta función se creará en lib/mail.ts
    return { success: "Si existe una cuenta con ese email, recibirás un enlace para resetear tu contraseña." };
  } catch (error) {
    console.error("Error al enviar email de reseteo:", error);
    return { error: "No se pudo enviar el email de reseteo. Intenta de nuevo más tarde." };
  }
};
