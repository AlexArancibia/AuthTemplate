"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const resetPassword = async (token: string, newPassword: string) => {
  console.log("🚀 [resetPassword] Iniciando proceso de reseteo de contraseña");
  console.log("🎫 [resetPassword] Token recibido:", token ? token.substring(0, 8) + "..." : "null");
  console.log("🔒 [resetPassword] Nueva contraseña:", newPassword ? `${newPassword.length} caracteres` : "null");

  // Validación del token
  if (!token) {
    console.log("❌ [resetPassword] Token no proporcionado");
    return { error: "Token no proporcionado." };
  }

  // Validación de la contraseña
  if (!newPassword || newPassword.length < 6) {
    console.log("❌ [resetPassword] Contraseña inválida:", {
      provided: !!newPassword,
      length: newPassword?.length || 0,
      minRequired: 6
    });
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  console.log("✅ [resetPassword] Validaciones iniciales pasadas");

  try {
    // Buscar el token en la base de datos
    console.log("🔍 [resetPassword] Buscando token en la base de datos...");
    const tokenRecord = await db.passwordResetToken.findFirst({
      where: { token },
    });

    console.log("🔎 [resetPassword] Resultado de búsqueda de token:", {
      found: !!tokenRecord,
      identifier: tokenRecord?.identifier || null,
      tokenPreview: tokenRecord?.token.substring(0, 8) + "..." || null,
      expires: tokenRecord?.expires.toISOString() || null,
      isExpired: tokenRecord ? tokenRecord.expires < new Date() : null
    });

    if (!tokenRecord) {
      console.log("❌ [resetPassword] Token no encontrado");
      return { error: "Token inválido o no encontrado." };
    }

    // Verificar si el token ha expirado
    const now = new Date();
    console.log("⏰ [resetPassword] Verificando expiración del token:", {
      now: now.toISOString(),
      expires: tokenRecord.expires.toISOString(),
      isExpired: tokenRecord.expires < now,
      timeRemaining: tokenRecord.expires.getTime() - now.getTime() + "ms"
    });

    if (tokenRecord.expires < now) {
      console.log("⏰ [resetPassword] Token expirado, eliminando...");
      try {
        await db.passwordResetToken.delete({ 
          where: { identifier: tokenRecord.identifier } 
        });
        console.log("🗑️ [resetPassword] Token expirado eliminado exitosamente");
      } catch (deleteError) {
        console.error("❌ [resetPassword] Error al eliminar token expirado:", deleteError);
      }
      return { error: "El token ha expirado. Por favor, solicita un nuevo reseteo." };
    }

    console.log("✅ [resetPassword] Token válido y no expirado");

    // Buscar el usuario directamente usando Prisma
    console.log("👤 [resetPassword] Buscando usuario por email:", tokenRecord.identifier);
    const user = await db.user.findUnique({
      where: {
        email: tokenRecord.identifier,
      },
    });

    console.log("👤 [resetPassword] Resultado de búsqueda de usuario:", {
      found: !!user,
      userId: user?.id || null,
      userEmail: user?.email || null
    });

    if (!user) {
      console.error("❌ [resetPassword] Usuario no encontrado para token válido:", {
        token: token.substring(0, 8) + "...",
        email: tokenRecord.identifier
      });
      return { error: "Usuario no encontrado. Contacta a soporte." };
    }

    console.log("✅ [resetPassword] Usuario encontrado, procediendo a hashear contraseña");

    // Hashear la nueva contraseña
    console.log("🔐 [resetPassword] Hasheando nueva contraseña...");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("✅ [resetPassword] Contraseña hasheada exitosamente");

    // Actualizar la contraseña del usuario
    console.log("💾 [resetPassword] Actualizando contraseña en la base de datos...");
    try {
      const updatedUser = await db.user.update({
        where: { id: user.id }, // Usar ID en lugar de email para mayor precisión
        data: { password: hashedPassword },
      });
      
      console.log("✅ [resetPassword] Contraseña actualizada exitosamente:", {
        userId: updatedUser.id,
        email: updatedUser.email,
        updatedAt: updatedUser.updatedAt.toISOString()
      });
    } catch (updateError) {
      console.error("❌ [resetPassword] Error al actualizar la contraseña del usuario:", {
        error: updateError,
        errorMessage: updateError instanceof Error ? updateError.message : 'Error desconocido',
        userEmail: tokenRecord.identifier,
        userId: user.id
      });
      return { error: "No se pudo actualizar la contraseña. Intenta de nuevo." };
    }

    // Eliminar el token de reseteo una vez usado
    console.log("🗑️ [resetPassword] Eliminando token usado...");
    try {
      await db.passwordResetToken.delete({
        where: { identifier: tokenRecord.identifier },
      });
      console.log("✅ [resetPassword] Token eliminado exitosamente");
    } catch (deleteError) {
      console.warn("⚠️ [resetPassword] No se pudo eliminar el token de reseteo usado:", {
        token: token.substring(0, 8) + "...",
        identifier: tokenRecord.identifier,
        error: deleteError
      });
      // No retornamos error aquí porque la contraseña ya se actualizó correctamente
    }

    console.log("🎉 [resetPassword] Proceso completado exitosamente");
    return { success: "¡Tu contraseña ha sido reseteada exitosamente!" };

  } catch (generalError) {
    console.error("❌ [resetPassword] Error general en el proceso:", {
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