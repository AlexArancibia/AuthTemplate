import { Resend } from "resend";
import { passwordResetTemplate, emailVerificationTemplate } from "./email-templates"; // Importar la nueva plantilla

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export const sendEmailVerification = async (email: string, verificationUrl: string) => { // Cambiado token por verificationUrl para consistencia
  try {
    const htmlBody = emailVerificationTemplate(verificationUrl, verificationUrl); // Asumiendo que el template toma la URL directamente

    await resend.emails.send({
      from: `${process.env.SMTP_FROM_NAME || "Tu Tienda"} <${process.env.SMTP_FROM_EMAIL || "noreply@tutienda.com"}>`,
      to: email,
      subject: "Verify your email",
      html: htmlBody, // Usar la plantilla generada
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error enviando email de verificación:", error); // Mejor log de error
    return {
      error: "Error enviando email de verificación.", // Mensaje de error más específico
    };
  }
};

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  try {
    const htmlBody = passwordResetTemplate(resetLink); // Usar la nueva plantilla

    await resend.emails.send({
      from: `${process.env.SMTP_FROM_NAME || "Tu Tienda"} <${process.env.SMTP_FROM_EMAIL || "noreply@tutienda.com"}>`,
      to: email,
      subject: "Resetea tu contraseña",
      html: htmlBody,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error enviando email de reseteo de contraseña:", error);
    return {
      error: "Error enviando email de reseteo de contraseña.",
    };
  }
};
