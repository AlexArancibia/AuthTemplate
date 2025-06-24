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


// Función para enviar correo de verificación
// export const sendEmailVerification = async ({
//   to,
//   verificationToken,
//   verificationUrl,
// }: {
//   to: string
//   verificationToken: string
//   verificationUrl?: string
// }) => {
//   try {
//     const transporter = createTransporter()

//     // URL de verificación por defecto o personalizada
//     const baseUrl = verificationUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
//     const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}`

//     const html = `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="utf-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Verificación de Email</title>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               line-height: 1.6;
//               color: #333;
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 20px;
//             }
//             .container {
//               background-color: #f9f9f9;
//               padding: 30px;
//               border-radius: 10px;
//               border: 1px solid #ddd;
//             }
//             .header {
//               text-align: center;
//               margin-bottom: 30px;
//             }
//             .header h1 {
//               color: #2c3e50;
//               margin: 0;
//             }
//             .content {
//               background-color: white;
//               padding: 25px;
//               border-radius: 8px;
//               margin-bottom: 20px;
//             }
//             .button {
//               display: inline-block;
//               background-color: #3498db;
//               color: white;
//               padding: 12px 30px;
//               text-decoration: none;
//               border-radius: 5px;
//               font-weight: bold;
//               margin: 20px 0;
//             }
//             .button:hover {
//               background-color: #2980b9;
//             }
//             .footer {
//               text-align: center;
//               font-size: 12px;
//               color: #666;
//               margin-top: 20px;
//             }
//             .token {
//               background-color: #f8f9fa;
//               padding: 10px;
//               border-radius: 4px;
//               font-family: monospace;
//               font-size: 14px;
//               border: 1px solid #e9ecef;
//               margin: 10px 0;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>Verificación de Email</h1>
//             </div>
            
//             <div class="content">
//               <h2>¡Bienvenido!</h2>
//               <p>Gracias por registrarte. Para completar tu registro, necesitas verificar tu dirección de email.</p>
              
//               <p>Haz clic en el siguiente botón para verificar tu cuenta:</p>
              
//               <div style="text-align: center;">
//                 <a href="${verifyUrl}" class="button">Verificar Email</a>
//               </div>
              
//               <p>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
//               <div class="token">${verifyUrl}</div>
              
//               <p><strong>Código de verificación:</strong></p>
//               <div class="token">${verificationToken}</div>
              
//               <p><strong>Importante:</strong></p>
//               <ul>
//                 <li>Este enlace expirará en 24 horas</li>
//                 <li>Si no solicitaste esta verificación, puedes ignorar este email</li>
//                 <li>Por tu seguridad, no compartas este código con nadie</li>
//               </ul>
//             </div>
            
//             <div class="footer">
//               <p>Este es un email automático, por favor no respondas a este mensaje.</p>
//               <p>&copy; ${new Date().getFullYear()} ${process.env.SMTP_FROM_NAME || "Tu Tienda"}. Todos los derechos reservados.</p>
//             </div>
//           </div>
//         </body>
//       </html>
//     `

//     const mailOptions = {
//       from: `"${process.env.SMTP_FROM_NAME || "Tu Tienda"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
//       to,
//       subject: "Verificación de Email - Confirma tu cuenta",
//       html,
//     }

//     const result = await transporter.sendMail(mailOptions)
//     console.log("Email de verificación enviado:", result.messageId)
//     return { 
//       success: true, 
//       messageId: result.messageId,
//       verificationUrl: verifyUrl 
//     }
//   } catch (error) {
//     console.error("Error enviando email de verificación:", error)
//     throw error
//   }
// }