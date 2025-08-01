// Plantillas HTML para correos electrónicos mejoradas con configuración de tienda

import type { Order, OrderItem, CustomerInfo, AddressInfo } from "@/types/order"
import type { ShopSettings } from "@/types/store"

// Función para obtener colores de la tienda
const getStoreColors = (shopSettings?: ShopSettings) => {
  // Verde principal del logo
  const primaryColor = '#23B14D';
  // Fondo oscuro
  const backgroundColor = '#151C27';
  // Blanco
  const white = '#FFFFFF';
  return {
    primary: primaryColor,
    background: backgroundColor,
    white,
  };
}

// Plantilla base mejorada para todos los correos
const baseTemplate = (content: string, title: string, shopSettings?: ShopSettings) => {
  const colors = getStoreColors(shopSettings);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: ${colors.white};
        margin: 0;
        padding: 20px;
        background-color: ${colors.background};
    }
    .email-wrapper {
        max-width: 600px;
        margin: 0 auto;
        background-color: ${colors.white};
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(35, 177, 77, 0.08);
        border: 1px solid ${colors.primary};
    }
    .header {
        background-color: ${colors.primary};
        color: ${colors.white};
        text-align: center;
        padding: 35px 30px;
    }
    .store-name {
        font-size: 32px;
        font-weight: 700;
        margin: 0;
        text-shadow: 0 2px 4px rgba(21,28,39,0.2);
    }
    .store-description {
        font-size: 15px;
        margin-top: 8px;
        opacity: 0.9;
    }
    .container {
        padding: 35px 30px;
    }
    .title {
        color: ${colors.primary};
        font-size: 26px;
        font-weight: 700;
        margin: 0 0 24px 0;
        text-align: center;
    }
    .content {
        margin-bottom: 30px;
        color: #151C27;
    }
    .card {
        background-color: ${colors.white};
        border: 1px solid ${colors.primary};
        border-radius: 12px;
        padding: 24px;
        margin: 20px 0;
        border-left: 4px solid ${colors.primary};
        box-shadow: 0 2px 10px rgba(35, 177, 77, 0.05);
    }
    .card h3, .card h4 {
        color: ${colors.primary};
        font-weight: 700;
    }
    .order-item {
        display: table;
        width: 100%;
        padding: 12px 0;
        border-bottom: 1px solid ${colors.primary}22;
    }
    .order-item:last-child {
        border-bottom: none;
        font-weight: 700;
        font-size: 16px;
        color: ${colors.primary};
        margin-top: 12px;
        padding-top: 16px;
        border-top: 2px solid ${colors.primary};
        background-color: ${colors.primary}08;
        padding-left: 12px;
        padding-right: 12px;
        border-radius: 8px;
    }
    .order-item-name {
        display: table-cell;
        vertical-align: middle;
        font-weight: 500;
        width: 60%;
    }
    .order-item-price {
        display: table-cell;
        vertical-align: middle;
        text-align: right;
        font-weight: 600;
        color: #151C27;
        width: 40%;
    }
    .button {
        background-color: ${colors.primary};
        color: ${colors.white} !important;
        padding: 16px 32px;
        border-radius: 8px;
        text-decoration: none;
        display: inline-block;
        font-weight: 600;
        font-size: 15px;
        text-align: center;
        margin: 12px 6px;
        border: none;
        box-shadow: 0 4px 12px rgba(35, 177, 77, 0.15);
        transition: background 0.2s;
    }
    .button:hover {
        background-color: #18913a;
    }
    .button-small {
        padding: 10px 20px;
        font-size: 14px;
        border-radius: 6px;
    }
    .info-section {
        background-color: ${colors.primary}08;
        border-radius: 8px;
        padding: 18px;
        margin: 16px 0;
        border-left: 4px solid ${colors.primary};
        border: 1px solid ${colors.primary}22;
    }
    .info-section h4 {
        margin: 0 0 10px 0;
        color: ${colors.primary};
        font-size: 15px;
        font-weight: 700;
    }
    .info-section p {
        margin: 6px 0;
        font-size: 14px;
        color: #151C27;
        line-height: 1.5;
    }
    .highlight-card {
        background-color: ${colors.primary}10;
        border: 1px solid ${colors.primary};
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
        text-align: center;
    }
    .highlight-card h3, .highlight-card p {
        color: ${colors.primary};
        margin: 0;
        font-size: 16px;
        font-weight: 700;
    }
    .footer {
        background-color: ${colors.background};
        padding: 30px;
        text-align: center;
        color: ${colors.white}CC;
        font-size: 14px;
        border-top: 1px solid ${colors.primary};
    }
    .footer strong {
        color: ${colors.primary};
        font-weight: 600;
    }
    .footer a {
        color: ${colors.primary};
        text-decoration: none;
        font-weight: 500;
    }
    .social-links {
        margin: 18px 0;
    }
    .social-links a {
        display: inline-block;
        margin: 0 8px;
        color: ${colors.primary};
        text-decoration: none;
        font-weight: 500;
        font-size: 14px;
        padding: 6px 12px;
        border-radius: 6px;
        background-color: ${colors.primary}10;
    }
    @media only screen and (max-width: 600px) {
        body {
            padding: 10px;
        }
        .email-wrapper {
            border-radius: 12px;
        }
        .container {
            padding: 25px 20px;
        }
        .header {
            padding: 30px 20px;
        }
        .store-name {
            font-size: 28px;
        }
        .title {
            font-size: 22px;
        }
        .card {
            padding: 20px;
        }
        .order-item-name,
        .order-item-price {
            display: block;
            width: 100%;
            text-align: left;
        }
        .order-item-price {
            margin-top: 4px;
            font-size: 14px;
        }
        .button {
            display: block;
            margin: 12px 0;
        }
    }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <h1 class="store-name">${shopSettings?.name || "Tu Tienda Online"}</h1>
            ${shopSettings?.description ? `<div class="store-description">${shopSettings.description}</div>` : ""}
        </div>
        
        <div class="container">
            ${content}
        </div>
        
        <div class="footer">
            <div>
                <strong>${shopSettings?.name || "Tu Tienda Online"}</strong><br>
                ${shopSettings?.address1 ? `${shopSettings.address1}<br>` : ""}
                ${shopSettings?.address2 ? `${shopSettings.address2}<br>` : ""}
                ${shopSettings?.city ? `${shopSettings.city}` : ""}${shopSettings?.province ? `, ${shopSettings.province}` : ""} ${shopSettings?.zip || ""}<br>
                ${shopSettings?.country || ""}<br>
                ${shopSettings?.phone ? `📞 ${shopSettings.phone}<br>` : ""}
                ${shopSettings?.email ? `📧 ${shopSettings.email}` : ""}
            </div>
            
            ${
              shopSettings?.facebookUrl ||
              shopSettings?.instagramUrl ||
              shopSettings?.twitterUrl ||
              shopSettings?.tiktokUrl ||
              shopSettings?.youtubeUrl
                ? `
            <div class="social-links">
                <strong>Síguenos:</strong><br>
                ${shopSettings.facebookUrl ? `<a href="${shopSettings.facebookUrl}">Facebook</a>` : ""}
                ${shopSettings.instagramUrl ? `<a href="${shopSettings.instagramUrl}">Instagram</a>` : ""}
                ${shopSettings.twitterUrl ? `<a href="${shopSettings.twitterUrl}">Twitter</a>` : ""}
                ${shopSettings.tiktokUrl ? `<a href="${shopSettings.tiktokUrl}">TikTok</a>` : ""}
                ${shopSettings.youtubeUrl ? `<a href="${shopSettings.youtubeUrl}">YouTube</a>` : ""}
            </div>
            `
                : ""
            }
            
            <p>© ${new Date().getFullYear()} ${shopSettings?.name || "Tu Tienda Online"}. Todos los derechos reservados.</p>
            <p>Si tienes alguna pregunta, contáctanos en <a href="mailto:${shopSettings?.supportEmail || shopSettings?.email || "soporte@tutienda.com"}">${shopSettings?.supportEmail || shopSettings?.email || "soporte@tutienda.com"}</a></p>
            ${shopSettings?.supportPhone ? `<p>📞 Soporte: ${shopSettings.supportPhone}</p>` : ""}
        </div>
    </div>
</body>
</html>
`
}

// Función para formatear moneda usando la configuración de la tienda
const formatCurrency = (amount: number, currencyCode = "PEN", shopSettings?: ShopSettings) => {
  const currency = currencyCode || shopSettings?.defaultCurrency?.code || "PEN"
  const locale = shopSettings?.country === "PE" ? "es-PE" : "es-PE"

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount)
}

// Función para obtener texto del estado de envío
const getShippingStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: "Pendiente",
    PROCESSING: "Procesando",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  }
  return statusMap[status] || status
}

// Función para obtener texto del estado financiero
const getFinancialStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: "Pendiente",
    AUTHORIZED: "Autorizado",
    PARTIALLY_PAID: "Parcialmente Pagado",
    PAID: "Pagado",
    PARTIALLY_REFUNDED: "Parcialmente Reembolsado",
    REFUNDED: "Reembolsado",
    VOIDED: "Anulado",
  }
  return statusMap[status] || status
}

// 1. Plantilla para confirmación de pedido al cliente
export const orderConfirmationClientTemplate = (order: Order, shopSettings?: ShopSettings) => {
  const customerInfo = order.customerInfo as CustomerInfo
  const shippingAddress = order.shippingAddress as AddressInfo

  const content = `
    <h1 class="title" style="color: #092b4e;">¡Gracias por tu pedido!</h1> 
<div class="content">
  <p style="font-size: 16px; margin-bottom: 20px;">Hola <strong>${customerInfo.name || "Cliente"}</strong>,</p>
  <p style="font-size: 16px; margin-bottom: 25px;">Hemos recibido tu pedido y lo estamos procesando. Aquí tienes los detalles:</p>

  <div class="card" style="border: 1px solid #ccc; border-radius: 8px; padding: 20px;">
    <h3 style="color: #109c39;">Pedido #${order.orderNumber}</h3>
    <p style="margin-bottom: 20px;"><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString("es-PE")}</p>

    <h4 style="color: #109c39;">Productos:</h4>
    ${order.lineItems.map((item: OrderItem) => `
      <div class="order-item">
        <div class="order-item-name">${item.title}</div>
        <div class="order-item-price">${item.quantity} × ${formatCurrency(item.price, order.currency.code, shopSettings)}</div>
      </div>
    `).join("")}

    <div class="order-item">
      <div class="order-item-name">Subtotal:</div>
      <div class="order-item-price">${formatCurrency(order.subtotalPrice, order.currency.code, shopSettings)}</div>
    </div>
    ${order.totalTax > 0 ? `
      <div class="order-item">
        <div class="order-item-name">IGV:</div>
        <div class="order-item-price">${formatCurrency(order.totalTax, order.currency.code, shopSettings)}</div>
      </div>
    ` : ""}

    ${order.totalDiscounts > 0 ? `
      <div class="order-item">
        <div class="order-item-name">Descuento:</div>
        <div class="order-item-price">${formatCurrency(order.totalDiscounts, order.currency.code, shopSettings)}</div>
      </div>
    ` : ""}


    <div class="order-item">
      <div class="order-item-name"><strong>Total:</strong></div>
      <div class="order-item-price"><strong>${formatCurrency(order.totalPrice, order.currency.code, shopSettings)}</strong></div>
    </div>
  </div>

  ${shippingAddress ? `
    <div class="info-section">
      <h4 style="color: #109c39;">📦 Dirección de Envío</h4>
      <p>${shippingAddress.name || ""}<br>
      ${shippingAddress.address1 || ""}<br>
      ${shippingAddress.address2 ? `${shippingAddress.address2}<br>` : ""}
      ${shippingAddress.city || ""}, ${shippingAddress.state || ""} ${shippingAddress.postalCode || ""}<br>
      ${shippingAddress.country || ""}</p>
      ${shippingAddress.phone ? `<p>📞 ${shippingAddress.phone}</p>` : ""}
    </div>
  ` : ""}

  ${order.customerNotes ? `
    <div class="info-section">
      <h4 style="color: #109c39;">📝 Notas</h4>
      <p>${order.customerNotes}</p>
    </div>
  ` : ""}

  <p style="font-size: 16px; margin: 25px 0;">Te enviaremos actualizaciones sobre el estado de tu pedido.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://wa.me/51912345678?text=${encodeURIComponent(`
¡Hola! Tengo una consulta sobre mi pedido #${order.orderNumber}

${order.lineItems.map(
  (item: OrderItem) => {
    const attrs = item.variant?.attributes
      ? Object.entries(item.variant.attributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : "";

    const price = `${order.currency.code}${Number(item.price).toFixed(2)}`;

    return `- ${item.title}${attrs ? ` - ${attrs}` : ""} (${item.quantity} x ${price})`;
  }
).join("\n")}

*Subtotal:* ${order.currency.code}${Number(order.subtotalPrice).toFixed(2)}
*IGV:* ${order.currency.code}${Number(order.totalTax || 0).toFixed(2)}
*Envío:* ${order.currency.code}${Number(order.shippingMethod?.prices[0].price || 0).toFixed(2)}
*Total:* ${order.currency.code}${Number(order.totalPrice).toFixed(2)}
`)}" 
       class="button" 
       style="background-color: #109c39; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
      📱 Hablar por WhatsApp
    </a>
  </div>
</div>

  `

  return baseTemplate(content, `Confirmación de Pedido #${order.orderNumber}`, shopSettings)
}

// 2. Plantilla para notificación de nuevo pedido al administrador
export const orderNotificationAdminTemplate = (order: Order, shopSettings?: ShopSettings) => {
  const customerInfo = order.customerInfo as CustomerInfo
  const shippingAddress = order.shippingAddress as AddressInfo
  const billingAddress = order.billingAddress as AddressInfo

  const content = `
    <h1 class="title">🎉 Nuevo Pedido Recibido</h1>
    <div class="content">
        <div class="highlight-card">
            <h3>⚡ Nuevo Pedido</h3>
            <p>Se ha recibido un nuevo pedido que requiere tu atención.</p>
        </div>
        
        <div class="card">
            <h3>👤 Cliente</h3>
            <p><strong>Nombre:</strong> ${customerInfo.name || "No especificado"}</p>
            <p><strong>Email:</strong> <a href="mailto:${customerInfo.email}" style="color: #1e40af; text-decoration: none;">${customerInfo.email || "No especificado"}</a></p>
            <p><strong>Teléfono:</strong> ${customerInfo.phone ? `<a href="tel:${customerInfo.phone}" style="color: #1e40af; text-decoration: none;">${customerInfo.phone}</a>` : "No especificado"}</p>
            ${customerInfo.company ? `<p><strong>Empresa:</strong> ${customerInfo.company}</p>` : ""}
        </div>
        
        <div class="card">
            <h3>📋 Pedido #${order.orderNumber}</h3>
            <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString("es-PE")} - ${new Date(order.createdAt).toLocaleTimeString("es-PE")}</p>
            <p><strong>Total:</strong> <span style="font-size: 20px; color: #059669; font-weight: bold;">${formatCurrency(order.totalPrice, order.currency.code, shopSettings)}</span></p>
            
            <h4>📦 Productos</h4>
            ${order.lineItems
              .map(
                (item: OrderItem) => `
                <div class="order-item">
                    <div class="order-item-name"><strong>${item.title}</strong></div>
                    <div class="order-item-price">${item.quantity} × ${formatCurrency(item.price, order.currency.code, shopSettings)}</div>
                </div>
            `,
              )
              .join("")}
            
            <div class="order-item">
                <div class="order-item-name">Subtotal:</div>
                <div class="order-item-price">${formatCurrency(order.subtotalPrice, order.currency.code, shopSettings)}</div>
            </div>
            ${
              order.totalTax > 0
                ? `
            <div class="order-item">
                <div class="order-item-name">Impuestos:</div>
                <div class="order-item-price">${formatCurrency(order.totalTax, order.currency.code, shopSettings)}</div>
            </div>
            `
                : ""
            }
            ${
              order.totalDiscounts > 0
                ? `
            <div class="order-item">
                <div class="order-item-name">Descuentos:</div>
                <div class="order-item-price">-${formatCurrency(order.totalDiscounts, order.currency.code, shopSettings)}</div>
            </div>
            `
                : ""
            }
            <div class="order-item">
                <div class="order-item-name"><strong>TOTAL:</strong></div>
                <div class="order-item-price"><strong>${formatCurrency(order.totalPrice, order.currency.code, shopSettings)}</strong></div>
            </div>
        </div>
        
        ${
          shippingAddress
            ? `
        <div class="info-section">
            <h4>📦 Dirección de Envío</h4>
            <p><strong>${shippingAddress.name || ""}</strong><br>
            ${shippingAddress.address1 || ""}<br>
            ${shippingAddress.address2 ? `${shippingAddress.address2}<br>` : ""}
            ${shippingAddress.city || ""}, ${shippingAddress.state || ""} ${shippingAddress.postalCode || ""}<br>
            ${shippingAddress.country || ""}</p>
            ${shippingAddress.phone ? `<p>📞 <a href="tel:${shippingAddress.phone}" style="color: #1e40af; text-decoration: none;">${shippingAddress.phone}</a></p>` : ""}
        </div>
        `
            : ""
        }
        
        ${
          billingAddress && JSON.stringify(billingAddress) !== JSON.stringify(shippingAddress)
            ? `
        <div class="info-section">
            <h4>💳 Dirección de Facturación</h4>
            <p><strong>${billingAddress.name || ""}</strong><br>
            ${billingAddress.address1 || ""}<br>
            ${billingAddress.address2 ? `${billingAddress.address2}<br>` : ""}
            ${billingAddress.city || ""}, ${billingAddress.state || ""} ${billingAddress.postalCode || ""}<br>
            ${billingAddress.country || ""}</p>
        </div>
        `
            : ""
        }
        
        ${
          order.paymentProvider
            ? `
        <div class="info-section">
            <h4>💳 Información de Pago</h4>
            <p><strong>Proveedor:</strong> ${order.paymentProvider.name}</p>
        </div>
        `
            : ""
        }
        
        ${
          order.shippingMethod
            ? `
        <div class="info-section">
            <h4>🚚 Información de Envío</h4>
            <p><strong>Método:</strong> ${order.shippingMethod.name}</p>
            ${order.preferredDeliveryDate ? `<p><strong>Fecha preferida:</strong> ${new Date(order.preferredDeliveryDate).toLocaleDateString("es-PE")}</p>` : ""}
            ${order.trackingNumber ? `<p><strong>Seguimiento:</strong> ${order.trackingNumber}</p>` : ""}
        </div>
        `
            : ""
        }
        
        ${
          order.customerNotes
            ? `
        <div class="info-section">
            <h4>📝 Notas del Cliente</h4>
            <p><em>"${order.customerNotes}"</em></p>
        </div>
        `
            : ""
        }
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${customerInfo.email}" class="button button-small">📧 Email</a>
            ${customerInfo.phone ? `<a href="tel:${customerInfo.phone}" class="button button-small">📞 Llamar</a>` : ""}
        </div>
    </div>
  `

  return baseTemplate(
    content,
    `🚨 NUEVO PEDIDO #${order.orderNumber} - ${formatCurrency(order.totalPrice, order.currency.code, shopSettings)}`,
    shopSettings,
  )
}

// 3. Plantilla para formulario de contacto
export const contactFormTemplate = (
  formData: {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
  },
  shopSettings?: ShopSettings,
) => {
  const content = `
    <h1 class="title">📧 Nuevo Mensaje de Contacto</h1>
    <div class="content">
        <div class="highlight-card">
            <h3>📬 Mensaje Recibido</h3>
            <p>Se ha recibido un nuevo mensaje a través del formulario de contacto.</p>
        </div>
        
        <div class="card">
            <h3>👤 Remitente</h3>
            <p><strong>Nombre:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${formData.email}" style="color: #1e40af; text-decoration: none;">${formData.email}</a></p>
            ${formData.phone ? `<p><strong>Teléfono:</strong> <a href="tel:${formData.phone}" style="color: #1e40af; text-decoration: none;">${formData.phone}</a></p>` : ""}
            <p><strong>Asunto:</strong> ${formData.subject}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-PE")} - ${new Date().toLocaleTimeString("es-PE")}</p>
        </div>
        
        <div class="card">
            <h4>💬 Mensaje</h4>
            <div style="background-color: #f8fafc; padding: 18px; border-radius: 8px; border-left: 3px solid #1e40af; font-style: italic; margin-top: 12px;">
                ${formData.message.replace(/\n/g, "<br>")}
            </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${formData.email}?subject=Re: ${formData.subject}" class="button">📧 Responder</a>
            ${formData.phone ? `<a href="tel:${formData.phone}" class="button">📞 Llamar</a>` : ""}
        </div>
    </div>
  `

  return baseTemplate(content, `📧 Nuevo Contacto: ${formData.subject}`, shopSettings)
}

// Plantilla para respuesta automática de contacto
export const contactAutoReplyTemplate = (
  formData: {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
  },
  shopSettings?: ShopSettings,
) => {
  const content = `
    <h1 class="title">Gracias por contactarnos</h1>
    <div class="content">
        <p style="font-size: 16px; margin-bottom: 20px;">Hola <strong>${formData.name}</strong>,</p>
        <p style="font-size: 16px; margin-bottom: 25px;">Hemos recibido tu mensaje${shopSettings?.name ? ` en <strong>${shopSettings.name}</strong>` : ""} y te responderemos lo antes posible.</p>
        
        <div class="card">
            <h4>📋 Resumen de tu mensaje</h4>
            <p><strong>Asunto:</strong> ${formData.subject}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-PE")} - ${new Date().toLocaleTimeString("es-PE")}</p>
            
            <div style="background-color: #f8fafc; padding: 18px; border-radius: 8px; margin-top: 12px; border-left: 3px solid #1e40af; font-style: italic;">
                ${formData.message.replace(/\n/g, "<br>")}
            </div>
        </div>
        
        <div class="info-section">
            <h4>📞 Información de Contacto</h4>
            <p>📧 <strong>Email:</strong> <a href="mailto:${shopSettings?.supportEmail || shopSettings?.email || "soporte@tutienda.com"}" style="color: #1e40af; text-decoration: none;">${shopSettings?.supportEmail || shopSettings?.email || "soporte@tutienda.com"}</a></p>
            ${shopSettings?.supportPhone ? `<p>📞 <strong>Teléfono:</strong> <a href="tel:${shopSettings.supportPhone}" style="color: #1e40af; text-decoration: none;">${shopSettings.supportPhone}</a></p>` : ""}
            <p>🕒 <strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</p>
        </div>
        
        <div class="highlight-card">
            <h3>⏱️ Tiempo de Respuesta</h3>
            <p>Nuestro tiempo de respuesta habitual es de <strong>24-48 horas</strong> en días laborables.</p>
        </div>
        
        ${
          shopSettings?.liveChatEnabled
            ? `
        <div class="info-section">
            <h4>💬 Chat en Vivo</h4>
            <p>También puedes contactarnos a través de nuestro chat en vivo.</p>
            <div style="text-align: center; margin-top: 18px;">
                <a href="${shopSettings.domain}" class="button button-small">🌐 Visitar Tienda</a>
            </div>
        </div>
        `
            : ""
        }
    </div>
  `

  return baseTemplate(content, "✅ Confirmación de Mensaje Recibido", shopSettings)
}



export const emailVerificationTemplate = (verificationToken: string, verifyUrl: string): string => {
  // Colores de la marca
  const primary = '#23B14D';
  const background = '#151C27';
  const white = '#FFFFFF';
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de Email</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: ${white};
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: ${background};
          }
          .container {
            background-color: ${white};
            padding: 30px;
            border-radius: 10px;
            border: 1px solid ${primary};
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: ${primary};
            margin: 0;
          }
          .content {
            background-color: ${white};
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
            color: #151C27;
          }
          .button {
            display: inline-block;
            background-color: ${primary};
            color: ${white};
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            transition: background 0.2s;
          }
          .button:hover {
            background-color: #18913a;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: ${primary};
            margin-top: 20px;
          }
          .token {
            background-color: ${primary}10;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
            border: 1px solid ${primary};
            margin: 10px 0;
            word-break: break-all;
            color: #151C27;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verificación de Email</h1>
          </div>
          
          <div class="content">
            <h2>¡Bienvenido!</h2>
            <p>Gracias por registrarte. Para completar tu registro, necesitas verificar tu dirección de email.</p>
            
            <p>Haz clic en el siguiente botón para verificar tu cuenta:</p>
            
            <div style="text-align: center;">
              <a href="${verifyUrl}" class="button">Verificar Email</a>
            </div>
            
            <p>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
            <div class="token">${verifyUrl}</div>
            
            <p><strong>Importante:</strong></p>
            <ul>
              <li>Este enlace expirará en 24 horas</li>
              <li>Si no solicitaste esta verificación, puedes ignorar este email</li>
              <li>Por tu seguridad, no compartas este código con nadie</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} ${process.env.SMTP_FROM_NAME || "Tu Tienda"}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `
}


export const passwordResetTemplate = (resetLink: string): string => {
  // Colores de la marca
  const primary = '#23B14D';
  const background = '#151C27';
  const white = '#FFFFFF';
  return `
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reseteo de Contraseña</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: ${white};
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: ${background};
          }
          .container {
            background-color: ${white};
            padding: 30px;
            border-radius: 10px;
            border: 1px solid ${primary};
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: ${primary};
            margin: 0;
          }
          .content {
            background-color: ${white};
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
            color: #151C27;
          }
          .button {
            display: inline-block;
            background-color: ${primary};
            color: ${white};
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            transition: background 0.2s;
          }
          .button:hover {
            background-color: #18913a;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: ${primary};
            margin-top: 20px;
          }
          .link-text {
            background-color: ${primary}10;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
            border: 1px solid ${primary};
            margin: 10px 0;
            word-break: break-all;
            color: #151C27;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reseteo de Contraseña</h1>
          </div>
          <div class="content">
            <h2 style="color:${primary}">¿Olvidaste tu contraseña?</h2>
            <p>Hemos recibido una solicitud para resetear la contraseña de tu cuenta.</p>
            <p>Haz clic en el siguiente botón para establecer una nueva contraseña:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Resetear Contraseña</a>
            </div>
            <p>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
            <div class="link-text">${resetLink}</div>
            <p><strong>Importante:</strong></p>
            <ul>
              <li>Este enlace expirará en 1 hora.</li>
              <li>Si no solicitaste un reseteo de contraseña, puedes ignorar este email de forma segura.</li>
              <li>Por tu seguridad, no compartas este enlace con nadie.</li>
            </ul>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} ${process.env.SMTP_FROM_NAME || "Tu Tienda"}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `
}