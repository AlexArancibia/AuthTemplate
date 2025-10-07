"use server"

import { signIn } from "@/auth"
import { db } from "@/lib/db"
import { type loginSchema, registerSchema } from "@/lib/zod"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import type { z } from "zod"
import { validateQuickLoginToken } from "@/lib/quick-login-utils"

export const loginAction = async (values: z.infer<typeof loginSchema>) => {
  try {
    // Obtener información del usuario antes del login para el inicio rápido
    let userData = null;
    if (values.rememberMe) {
      const user = await db.user.findUnique({
        where: { email: values.email },
        select: { id: true, name: true, email: true }
      });
      userData = user;
    }

    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    })
    
    return { 
      success: true, 
      userData: userData // Devolver datos del usuario para el inicio rápido
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message }
    }
    return { error: "error 500" }
  }
}

export const registerAction = async (values: z.infer<typeof registerSchema>) => {
  try {
    const { data, success } = registerSchema.safeParse(values)
    if (!success) {
      return {
        error: "Invalid data",
      }
    }

    // verificar si el usuario ya existe
    const user = await db.user.findUnique({
      where: {
        email: data.email,
      },
      include: {
        accounts: true, // Incluir las cuentas asociadas
      },
    })

    if (user) {
      // Verificar si tiene cuentas OAuth vinculadas
      const oauthAccounts = user.accounts.filter((account: { type: string }) => account.type === "oauth")
      if (oauthAccounts.length > 0) {
        return {
          error: "To confirm your identity, sign in with the same account you used originally.",
        }
      }
      return {
        error: "User already exists",
      }
    }

    // hash de la contraseña
    const passwordHash = await bcrypt.hash(data.password, 10)

    // crear el usuario
    await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: passwordHash,
      },
    })

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message }
    }
    return { error: "error 500" }
  }
}

export const quickLoginAction = async (token: string) => {
  try {
    // Validar el token de inicio rápido
    const quickLoginData = validateQuickLoginToken(token);
    
    if (!quickLoginData) {
      return { error: "Token inválido o expirado" };
    }

    // Verificar que el usuario existe
    const user = await db.user.findUnique({
      where: { 
        id: quickLoginData.userId,
        email: quickLoginData.email 
      },
      select: { 
        id: true, 
        email: true, 
        name: true,
        emailVerified: true,
        password: true
      }
    });

    if (!user) {
      return { error: "Usuario no encontrado" };
    }

    if (!user.emailVerified) {
      return { error: "Email no verificado. Por favor verifica tu email primero." };
    }

    if (!user.password) {
      return { error: "Esta cuenta usa autenticación social." };
    }

    // Usar signIn con un token especial que el auth.config reconocerá
    await signIn("credentials", {
      email: user.email,
      password: `__QUICK_LOGIN_TOKEN__:${token}`,
      redirect: false,
    });
    
    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  } catch (error) {
    console.error('Error en quick login action:', error);
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message || "Error de autenticación" };
    }
    return { error: "Error en inicio rápido" };
  }
}
