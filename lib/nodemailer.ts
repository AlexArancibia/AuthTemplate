import nodemailer from "nodemailer"

// Configuración del transportador de correo
const createTransporter = () => {
  console.log("🔍 [DEBUG-ENV] === VERIFICANDO VARIABLES DE ENTORNO ===")
  console.log("🔍 [DEBUG-ENV] SMTP_HOST:", process.env.SMTP_HOST)
  console.log("🔍 [DEBUG-ENV] SMTP_PORT:", process.env.SMTP_PORT)
  console.log("🔍 [DEBUG-ENV] SMTP_SECURE:", process.env.SMTP_SECURE)
  console.log("🔍 [DEBUG-ENV] SMTP_USER:", process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 5)}***` : "❌ NO CONFIGURADO")
  console.log("🔍 [DEBUG-ENV] SMTP_PASS:", process.env.SMTP_PASS ? "***configurado***" : "❌ NO CONFIGURADO")
  console.log("🔍 [DEBUG-ENV] SMTP_FROM_NAME:", process.env.SMTP_FROM_NAME)
  console.log("🔍 [DEBUG-ENV] SMTP_FROM_EMAIL:", process.env.SMTP_FROM_EMAIL)
  console.log("🔍 [DEBUG-ENV] ==========================================")
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// Función para enviar correo al cliente
export const sendEmailToClient = async ({
  to,
  subject,
  html,
  attachments = [],
}: {
  to: string
  subject: string
  html: string
  attachments?: any[]
}) => {
  try {
    console.log("📨 [NODEMAILER] Iniciando envío de email")
    console.log("📨 [NODEMAILER] Configuración SMTP:", {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || "587",
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER ? "***configurado***" : "❌ NO CONFIGURADO",
      pass: process.env.SMTP_PASS ? "***configurado***" : "❌ NO CONFIGURADO",
    })
    
    const transporter = createTransporter()
    console.log("📨 [NODEMAILER] Transporter creado")

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Tu Tienda"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments,
    }
    
    console.log("📨 [NODEMAILER] Opciones de email:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    })

    console.log("📨 [NODEMAILER] Enviando email...")
    const result = await transporter.sendMail(mailOptions)
    console.log("✅ [NODEMAILER] Email enviado exitosamente:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("💥 [NODEMAILER] ERROR al enviar email:")
    console.error("💥 [NODEMAILER] Error:", error)
    if (error instanceof Error) {
      console.error("💥 [NODEMAILER] Mensaje:", error.message)
      console.error("💥 [NODEMAILER] Stack:", error.stack)
    }
    throw error
  }
}

// Función para enviar correo al administrador
export const sendEmailToAdmin = async ({
  subject,
  html,
  attachments = [],
}: {
  subject: string
  html: string
  attachments?: any[]
}) => {
  try {
    const transporter = createTransporter()

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Sistema de Tienda"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: adminEmail,
      subject,
      html,
      attachments,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email enviado al administrador:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error enviando email al administrador:", error)
    throw error
  }
}

// Verificar configuración de correo
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    console.log("Configuración de correo verificada correctamente")
    return true
  } catch (error) {
    console.error("Error en la configuración de correo:", error)
    return false
  }
}

 