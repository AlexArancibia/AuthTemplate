import nodemailer from "nodemailer"

// Configuración del transportador de correo
const createTransporter = () => {
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
    const transporter = createTransporter()

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Tu Tienda"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email enviado al cliente:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error enviando email al cliente:", error)
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
