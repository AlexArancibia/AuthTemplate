"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";
import { sendEmailToClient } from "@/lib/nodemailer";

export const forgotPassword = async (email: string) => {
  if (!email || !z.string().email().safeParse(email).success) {
    return { error: "Email inválido." };
  }

  try {
    // Buscar al usuario directamente usando Prisma
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });
    
    // Retornar mensaje genérico si no existe (seguridad)
    if (!existingUser) {
      return {
        success:
          "Si existe una cuenta con ese email, recibirás un enlace para resetear tu contraseña.",
      };
    }
    
    const token = nanoid();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 1); // 1 hora

    // Eliminar tokens anteriores
    const deletedTokens = await db.passwordResetToken.deleteMany({
      where: {
        identifier: email,
      },
    });
    
    // Crear nuevo token
    const newToken = await db.passwordResetToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });
    
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    
    try {
      // Usar sendEmailToClient en lugar de sendPasswordResetEmail
      await sendEmailToClient({
        to: email,
        subject: "Restablecer tu contraseña",
        html: generatePasswordResetEmailHTML(resetLink, existingUser.name || "Usuario")
      });

      return {
        success:
          "Si existe una cuenta con ese email, recibirás un enlace para resetear tu contraseña.",
      };
    } catch (emailError) {
      return {
        error:
          "No se pudo enviar el email de reseteo. Intenta de nuevo más tarde.",
      };
    }
    
  } catch (dbError) {
    return {
      error: "Error interno del servidor. Intenta de nuevo más tarde."
    };
  }
};

// Función para generar el HTML del email de reseteo de contraseña
const generatePasswordResetEmailHTML = (resetLink: string, userName: string) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecer Contraseña</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #2d3748;
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                min-height: 100vh;
                padding: 20px;
            }
            .email-wrapper {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }
            .header-gradient {
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                padding: 40px 30px;
                text-align: center;
                position: relative;
            }
            .header-gradient::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            }
            .header h1 {
                color: white;
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                position: relative;
                z-index: 1;
            }
            .header p {
                color: rgba(255, 255, 255, 0.9);
                font-size: 16px;
                position: relative;
                z-index: 1;
            }
            .lock-icon {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                position: relative;
                z-index: 1;
            }
            .container {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 18px;
                color: #1f2937;
                margin-bottom: 20px;
                font-weight: 600;
            }
            .content {
                margin-bottom: 30px;
                color: #4b5563;
                font-size: 16px;
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: white !important;
                padding: 16px 32px;
                text-decoration: none !important;
                border-radius: 12px;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.4);
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .button:link {
                color: white !important;
            }
            .button:visited {
                color: white !important;
            }
            .button:hover {
                color: white !important;
            }
            .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 15px 35px -5px rgba(34, 197, 94, 0.5);
            }
            .link-section {
                background: #f8fafc;
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid #22c55e;
                margin: 25px 0;
            }
            .link-section p {
                margin-bottom: 10px;
                color: #374151;
                font-weight: 500;
            }
            .link-text {
                word-break: break-all;
                background-color: #e5e7eb;
                padding: 12px 16px;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                color: #1f2937;
                border: 1px solid #d1d5db;
            }
            .warning {
                background: #dcfce7;
                border-left: 4px solid #22c55e;
                border-radius: 12px;
                padding: 20px;
                margin: 25px 0;
            }
            .warning-title {
                display: flex;
                align-items: center;
                font-weight: 600;
                color: #166534;
                margin-bottom: 12px;
                font-size: 16px;
            }
            .warning ul {
                margin-left: 20px;
                color: #166534;
            }
            .warning li {
                margin-bottom: 8px;
                font-size: 14px;
            }
            .footer {
                background: #f1f5f9;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            .footer p {
                font-size: 14px;
                color: #64748b;
                margin-bottom: 8px;
            }
            .security-badge {
                display: inline-flex;
                align-items: center;
                background: #dcfce7;
                color: #166534;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
                margin-top: 15px;
            }
            @media (max-width: 600px) {
                body {
                    padding: 10px;
                }
                .container {
                    padding: 30px 20px;
                }
                .header-gradient {
                    padding: 30px 20px;
                }
                .button {
                    padding: 14px 28px;
                    font-size: 15px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
 
            
            <div class="container">
                <div class="greeting">
                    ¡Hola ${userName}! 👋
                </div>
                
                <div class="content">
                    <p>Has solicitado restablecer tu contraseña. No te preocupes, esto sucede a menudo y es completamente seguro.</p>
                    <p>Para crear una nueva contraseña, simplemente haz clic en el botón verde de abajo:</p>
                </div>
                
                <div class="button-container">
                    <a href="${resetLink}" class="button">
                        Restablecer Mi Contraseña
                    </a>
                </div>
                
                <div class="link-section">
                    <p><strong>¿El botón no funciona?</strong> Copia y pega este enlace en tu navegador:</p>
                    <div class="link-text">${resetLink}</div>
                </div>
                
                <div class="warning">
                    <div class="warning-title">
                        ⚠️ Información Importante
                    </div>
                    <ul>
                        <li><strong>Tiempo límite:</strong> Este enlace expirará en exactamente <strong>1 hora</strong></li>
                        <li><strong>Seguridad:</strong> Si no solicitaste este cambio, puedes ignorar este email de forma segura</li>
                        <li><strong>Contraseña actual:</strong> Seguirá siendo válida hasta que confirmes el cambio</li>
                        <li><strong>Una sola vez:</strong> Este enlace solo puede usarse una vez por seguridad</li>
                    </ul>
                </div>
                
                <div style="text-align: center;">
                    <div class="security-badge">
                        🛡️ Conexión Segura y Encriptada
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Este es un mensaje automático del sistema</strong></p>
                <p>Por favor, no respondas a este email. Si necesitas ayuda, contacta a nuestro equipo de soporte.</p>
                <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                    © ${new Date().getFullYear()} Tu Tienda. Todos los derechos reservados.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};