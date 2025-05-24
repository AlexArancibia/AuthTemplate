// Plantillas HTML para correos electrónicos mejoradas con configuración de tienda

import type { Order, OrderItem, CustomerInfo, AddressInfo } from "@/types/order"
import type { ShopSettings } from "@/types/store"

// Función para obtener el logo de la tienda (sin imagen)
const getStoreLogo = (shopSettings?: ShopSettings) => {
  return `<div class="logo-text">${shopSettings?.name || "🛍️ Tu Tienda Online"}</div>`
}

// Función para obtener colores de la tienda
const getStoreColors = (shopSettings?: ShopSettings) => {
  const primaryColor = shopSettings?.primaryColor || "#6366f1"
  const secondaryColor = shopSettings?.secondaryColor || "#8b5cf6"

  return {
    primary: primaryColor,
    secondary: secondaryColor,
  }
}

// Plantilla base mejorada para todos los correos
const baseTemplate = (content: string, title: string, shopSettings?: ShopSettings) => {
  const colors = getStoreColors(shopSettings)
  const storeLogo = getStoreLogo(shopSettings)

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.7;
        color: #1f2937;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 40px 20px;
    }
    
    .email-wrapper {
        max-width: 680px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        position: relative;
        background-image: url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21 22L0 43.9615L0 0.0384865L21 22ZM42 0.0384865L42 43.9615L21 22L42 0.0384865Z' fill='rgba(0,0,0,0.015)'/%3E%3C/svg%3E");
        border: 1px solid #e2e8f0;
    }
    
    .email-wrapper::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 6px;
        background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary});
    }
    
    .header {
        background: linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}10);
        padding: 32px 24px;
        text-align: center;
        position: relative;
        overflow: hidden;
        border-bottom: 1px solid #f3f4f6;
    }
    
    .header::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, ${colors.primary}08 0%, transparent 70%);
        animation: float 6s ease-in-out infinite;
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
    }
    
    .logo-text {
        font-size: 32px;
        font-weight: 700;
        background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 12px;
        position: relative;
        z-index: 1;
        letter-spacing: -0.5px;
    }
    
    .store-description {
        color: #6b7280;
        font-size: 16px;
        font-weight: 400;
        position: relative;
        z-index: 1;
    }
    
    .container {
        padding: 32px 24px;
    }
    
    .title {
        color: #111827;
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 24px;
        text-align: center;
        letter-spacing: -0.5px;
    }
    
    .content {
        margin-bottom: 40px;
    }
    
    .content p {
        margin-bottom: 16px;
        color: #4b5563;
        font-size: 16px;
        line-height: 1.6;
    }
    
    .order-details {
        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        padding: 24px;
        border-radius: 16px;
        margin: 20px 0;
        border: 1px solid #e2e8f0;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
    }
    
    .order-details::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: linear-gradient(180deg, ${colors.primary}, ${colors.secondary});
    }
    
    .order-details h3 {
        color: #111827;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .order-details h4 {
        color: #374151;
        font-size: 16px;
        font-weight: 600;
        margin: 24px 0 16px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 14px;
    }
    
    .order-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid #e5e7eb;
        font-size: 15px;
    }
    
    .order-item:last-child {
        border-bottom: none;
        font-weight: 600;
        font-size: 18px;
        color: ${colors.primary};
        background: linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}05);
        margin: 16px -16px -16px -16px;
        padding: 20px 16px;
        border-radius: 12px;
    }
    
    .order-item span:first-child {
        color: #374151;
        font-weight: 500;
    }
    
    .order-item span:last-child {
        color: #111827;
        font-weight: 600;
        text-align: right;
    }
    
    .button {
        display: inline-block;
        background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
        color: white;
        padding: 16px 32px;
        text-decoration: none;
        border-radius: 12px;
        margin: 20px auto;
        font-weight: 600;
        text-align: center;
        font-size: 16px;
        box-shadow: 0 10px 25px -5px ${colors.primary}40;
        transition: all 0.3s ease;
        display: block;
        max-width: 280px;
        letter-spacing: 0.3px;
    }
    
    .button:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 35px -5px ${colors.primary}50;
    }
    
    .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-left: 8px;
    }
    
    .status-pending { 
        background: linear-gradient(135deg, #fef3c7, #fde68a); 
        color: #92400e; 
    }
    .status-confirmed { 
        background: linear-gradient(135deg, #d1fae5, #a7f3d0); 
        color: #065f46; 
    }
    .status-shipped { 
        background: linear-gradient(135deg, #dbeafe, #bfdbfe); 
        color: #1e40af; 
    }
    .status-delivered { 
        background: linear-gradient(135deg, #e0f2fe, #b3e5fc); 
        color: #0c4a6e; 
    }
    
    .address-box, .contact-info {
        background: linear-gradient(135deg, #fafafa, #f5f5f5);
        padding: 18px;
        border-radius: 12px;
        margin: 20px 0;
        border-left: 4px solid ${colors.primary};
        position: relative;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02);
    }
    
    .address-box h4, .contact-info h4 {
        color: #111827;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .address-box p, .contact-info p {
        color: #4b5563;
        margin-bottom: 8px;
        line-height: 1.5;
    }
    
    .footer {
        background: linear-gradient(135deg, #f9fafb, #f3f4f6);
        padding: 24px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
    }
    
    .store-info {
        background: white;
        padding: 24px;
        border-radius: 12px;
        margin: 24px 0;
        font-size: 14px;
        line-height: 1.6;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .store-info strong {
        color: #111827;
        font-size: 16px;
        display: block;
        margin-bottom: 8px;
    }
    
    .social-links {
        margin: 24px 0;
        text-align: center;
    }
    
    .social-links strong {
        display: block;
        margin-bottom: 12px;
        color: #374151;
        font-weight: 600;
    }
    
    .social-links a {
        display: inline-block;
        margin: 0 12px;
        color: ${colors.primary};
        text-decoration: none;
        font-weight: 500;
        padding: 8px 16px;
        border-radius: 8px;
        background: ${colors.primary}10;
        transition: all 0.3s ease;
    }
    
    .social-links a:hover {
        background: ${colors.primary}20;
        transform: translateY(-1px);
    }
    
    .footer p {
        color: #6b7280;
        font-size: 14px;
        margin: 12px 0;
        line-height: 1.5;
    }
    
    .footer a {
        color: ${colors.primary};
        text-decoration: none;
        font-weight: 500;
    }
    
    .footer a:hover {
        text-decoration: underline;
    }
    
    /* Responsive Design */
    @media only screen and (max-width: 600px) {
        body {
            padding: 20px 10px;
        }
        
        .email-wrapper {
            border-radius: 16px;
        }
        
        .header, .container, .footer {
            padding: 32px 24px;
        }
        
        .logo-text {
            font-size: 28px;
        }
        
        .title {
            font-size: 24px;
        }
        
        .order-details {
            padding: 24px;
        }
        
        .button {
            padding: 14px 24px;
            font-size: 15px;
        }
        
        .social-links a {
            margin: 4px 8px;
            padding: 6px 12px;
            font-size: 13px;
        }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
        .email-wrapper {
            background: #1f2937;
            color: #f9fafb;
            border-color: #374151;
        }
        
        .title {
            color: #f9fafb;
        }
        
        .content p {
            color: #d1d5db;
        }
        
        .order-details {
            background: linear-gradient(135deg, #374151, #4b5563);
            border-color: #4b5563;
        }
        
        .address-box, .contact-info {
            background: linear-gradient(135deg, #374151, #4b5563);
        }
        
        .footer {
            background: linear-gradient(135deg, #111827, #1f2937);
            border-color: #374151;
        }
        
        .store-info {
            background: #374151;
        }
    }
</style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            ${storeLogo}
            ${shopSettings?.description ? `<div class="store-description">${shopSettings.description}</div>` : ""}
        </div>
        
        <div class="container">
            ${content}
        </div>
        
        <div class="footer">
            <div class="store-info">
                <strong>${shopSettings?.name || "Tu Tienda Online"}</strong>
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
                <strong>Síguenos en redes sociales</strong>
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
  const locale = shopSettings?.country === "PE" ? "es-PE" : "es-ES"

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
  const billingAddress = order.billingAddress as AddressInfo

  const content = `
    <h1 class="title">🎉 ¡Gracias por tu pedido!</h1>
    <div class="content">
        <p>Hola <strong>${customerInfo.name || "Cliente"}</strong>,</p>
        <p>Hemos recibido tu pedido en <strong>${shopSettings?.name || "nuestra tienda"}</strong> y lo estamos procesando con mucho cuidado. Aquí tienes todos los detalles:</p>
        
        <div class="order-details">
            <h3>📦 Detalles del Pedido #${order.orderNumber}</h3>
            <p><strong>Fecha de pedido:</strong> ${new Date(order.createdAt).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
            
            <h4>🛍️ Productos pedidos</h4>
            ${order.lineItems
              .map(
                (item: OrderItem) => `
                <div class="order-item">
                    <span>${item.title}</span>
                    <span>${item.quantity} × ${formatCurrency(item.price, order.currency.code, shopSettings)} = ${formatCurrency(item.price * item.quantity, order.currency.code, shopSettings)}</span>
                </div>
            `,
              )
              .join("")}
            
            <div class="order-item">
                <span>Subtotal:</span>
                <span>${formatCurrency(order.subtotalPrice, order.currency.code, shopSettings)}</span>
            </div>
            ${
              order.totalTax > 0
                ? `
            <div class="order-item">
                <span>Impuestos${shopSettings?.taxesIncluded ? " (incluidos)" : ""}:</span>
                <span>${formatCurrency(order.totalTax, order.currency.code, shopSettings)}</span>
            </div>
            `
                : ""
            }
            ${
              order.totalDiscounts > 0
                ? `
            <div class="order-item">
                <span>Descuentos aplicados:</span>
                <span>-${formatCurrency(order.totalDiscounts, order.currency.code, shopSettings)}</span>
            </div>
            `
                : ""
            }
            <div class="order-item">
                <span>Total final:</span>
                <span>${formatCurrency(order.totalPrice, order.currency.code, shopSettings)}</span>
            </div>
        </div>
        
        ${
          shippingAddress
            ? `
        <div class="address-box">
            <h4>📍 Dirección de Envío</h4>
            <p><strong>${shippingAddress.name || ""}</strong><br>
            ${shippingAddress.address1 || ""}<br>
            ${shippingAddress.address2 ? `${shippingAddress.address2}<br>` : ""}
            ${shippingAddress.city || ""}, ${shippingAddress.state || ""} ${shippingAddress.postalCode || ""}<br>
            ${shippingAddress.country || ""}</p>
            ${shippingAddress.phone ? `<p>📞 ${shippingAddress.phone}</p>` : ""}
        </div>
        `
            : ""
        }
        
        ${
          order.shippingMethod
            ? `
        <div class="contact-info">
            <h4>🚚 Información de Envío</h4>
            <p><strong>Método:</strong> ${order.shippingMethod.name}</p>
            ${order.trackingNumber ? `<p><strong>Número de seguimiento:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${order.trackingNumber}</code></p>` : ""}
            ${order.estimatedDeliveryDate ? `<p><strong>Entrega estimada:</strong> ${new Date(order.estimatedDeliveryDate).toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>` : ""}
        </div>
        `
            : ""
        }
        
        ${
          order.customerNotes
            ? `
        <div class="contact-info">
            <h4>📝 Tus notas</h4>
            <p style="font-style: italic;">"${order.customerNotes}"</p>
        </div>
        `
            : ""
        }
        
        <p>Te mantendremos informado sobre el estado de tu pedido enviando actualizaciones a esta dirección de correo electrónico.</p>
        
        <a href="${shopSettings?.domain || process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.orderNumber}" class="button">
            Ver Estado del Pedido
        </a>
        
        ${
          shopSettings?.liveChatEnabled
            ? `
        <div class="contact-info">
            <h4>💬 ¿Necesitas ayuda inmediata?</h4>
            <p>Nuestro chat en vivo está disponible las 24 horas en <a href="${shopSettings.domain}" style="color: #6366f1; font-weight: 600;">nuestra tienda online</a></p>
        </div>
        `
            : ""
        }
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
    <h1 class="title">🚀 ¡Nuevo Pedido Recibido!</h1>
    <div class="content">
        <p>¡Excelentes noticias! Se ha recibido un nuevo pedido en <strong>${shopSettings?.name || "la tienda"}</strong>:</p>
        
        <div class="order-details">
            <h3>📋 Pedido #${order.orderNumber}</h3>
            <p><strong>👤 Cliente:</strong> ${customerInfo.name || "No especificado"}</p>
            <p><strong>📧 Email:</strong> <a href="mailto:${customerInfo.email}" style="color: #6366f1;">${customerInfo.email || "No especificado"}</a></p>
            <p><strong>📱 Teléfono:</strong> ${customerInfo.phone ? `<a href="tel:${customerInfo.phone}" style="color: #6366f1;">${customerInfo.phone}</a>` : "No especificado"}</p>
            ${customerInfo.company ? `<p><strong>🏢 Empresa:</strong> ${customerInfo.company}</p>` : ""}
            ${customerInfo.taxId ? `<p><strong>🆔 NIF/CIF:</strong> ${customerInfo.taxId}</p>` : ""}
            <p><strong>📅 Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            <p><strong>💰 Total:</strong> <span style="font-size: 18px; font-weight: 700; color: #059669;">${formatCurrency(order.totalPrice, order.currency.code, shopSettings)}</span></p>
            
            <h4>🛍️ Productos pedidos</h4>
            ${order.lineItems
              .map(
                (item: OrderItem) => `
                <div class="order-item">
                    <span><strong>${item.title}</strong></span>
                    <span>${item.quantity} × ${formatCurrency(item.price, order.currency.code, shopSettings)}</span>
                </div>
            `,
              )
              .join("")}
            
            <div class="order-item">
                <span>Subtotal:</span>
                <span>${formatCurrency(order.subtotalPrice, order.currency.code, shopSettings)}</span>
            </div>
            ${
              order.totalTax > 0
                ? `
            <div class="order-item">
                <span>Impuestos${shopSettings?.taxesIncluded ? " (incluidos)" : ""}:</span>
                <span>${formatCurrency(order.totalTax, order.currency.code, shopSettings)}</span>
            </div>
            `
                : ""
            }
            ${
              order.totalDiscounts > 0
                ? `
            <div class="order-item">
                <span>Descuentos:</span>
                <span>-${formatCurrency(order.totalDiscounts, order.currency.code, shopSettings)}</span>
            </div>
            `
                : ""
            }
            <div class="order-item">
                <span><strong>Total Final:</strong></span>
                <span><strong>${formatCurrency(order.totalPrice, order.currency.code, shopSettings)}</strong></span>
            </div>
        </div>
        
        ${
          shippingAddress
            ? `
        <div class="address-box">
            <h4>📦 Dirección de Envío</h4>
            <p><strong>${shippingAddress.name || ""}</strong><br>
            ${shippingAddress.address1 || ""}<br>
            ${shippingAddress.address2 ? `${shippingAddress.address2}<br>` : ""}
            ${shippingAddress.city || ""}, ${shippingAddress.state || ""} ${shippingAddress.postalCode || ""}<br>
            ${shippingAddress.country || ""}</p>
            ${shippingAddress.phone ? `<p>📞 <a href="tel:${shippingAddress.phone}" style="color: #6366f1;">${shippingAddress.phone}</a></p>` : ""}
        </div>
        `
            : ""
        }
        
        ${
          billingAddress && JSON.stringify(billingAddress) !== JSON.stringify(shippingAddress)
            ? `
        <div class="address-box">
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
        <div class="contact-info">
            <h4>💳 Información de Pago</h4>
            <p><strong>Proveedor:</strong> ${order.paymentProvider.name}</p>
            <p><strong>Estado:</strong> <span class="status-badge status-${order.financialStatus?.toLowerCase()}">${getFinancialStatusText(order.financialStatus || "PENDING")}</span></p>
        </div>
        `
            : ""
        }
        
        ${
          order.shippingMethod
            ? `
        <div class="contact-info">
            <h4>🚚 Método de Envío</h4>
            <p><strong>Servicio:</strong> ${order.shippingMethod.name}</p>
            ${order.preferredDeliveryDate ? `<p><strong>Fecha preferida de entrega:</strong> ${new Date(order.preferredDeliveryDate).toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>` : ""}
        </div>
        `
            : ""
        }
        
        ${
          order.customerNotes
            ? `
        <div class="contact-info">
            <h4>📝 Notas del Cliente</h4>
            <p style="font-style: italic; background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #6366f1;">"${order.customerNotes}"</p>
        </div>
        `
            : ""
        }
        
        <a href="${shopSettings?.domain || process.env.NEXT_PUBLIC_ADMIN_URL || process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order.id}" class="button">
            Gestionar en Panel de Admin
        </a>
    </div>
  `

  return baseTemplate(content, `Nuevo Pedido #${order.orderNumber}`, shopSettings)
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
    <h1 class="title">📬 Nuevo Mensaje de Contacto</h1>
    <div class="content">
        <p>Se ha recibido un nuevo mensaje a través del formulario de contacto${shopSettings?.name ? ` de <strong>${shopSettings.name}</strong>` : ""}:</p>
        
        <div class="order-details">
            <h3>📋 Información del Contacto</h3>
            <p><strong>👤 Nombre:</strong> ${formData.name}</p>
            <p><strong>📧 Email:</strong> <a href="mailto:${formData.email}" style="color: #6366f1;">${formData.email}</a></p>
            ${formData.phone ? `<p><strong>📱 Teléfono:</strong> <a href="tel:${formData.phone}" style="color: #6366f1;">${formData.phone}</a></p>` : ""}
            <p><strong>📝 Asunto:</strong> ${formData.subject}</p>
            <p><strong>📅 Fecha:</strong> ${new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            
            <h4>💬 Mensaje</h4>
            <div class="address-box" style="background: #f8fafc; border-left: 4px solid #6366f1;">
                ${formData.message.replace(/\n/g, "<br>")}
            </div>
        </div>
        
        <div class="contact-info">
            <h4>🎯 Acciones Rápidas</h4>
            <p><strong>✉️ Responder por email:</strong> <a href="mailto:${formData.email}?subject=Re: ${formData.subject}" style="color: #6366f1; font-weight: 600;">${formData.email}</a></p>
            ${formData.phone ? `<p><strong>📞 Llamar directamente:</strong> <a href="tel:${formData.phone}" style="color: #6366f1; font-weight: 600;">${formData.phone}</a></p>` : ""}
        </div>
    </div>
  `

  return baseTemplate(content, `Nuevo Mensaje: ${formData.subject}`, shopSettings)
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
    <h1 class="title">✨ ¡Gracias por contactarnos!</h1>
    <div class="content">
        <p>Hola <strong>${formData.name}</strong>,</p>
        <p>Hemos recibido tu mensaje${shopSettings?.name ? ` en <strong>${shopSettings.name}</strong>` : ""} y queremos agradecerte por ponerte en contacto con nosotros. Nuestro equipo revisará tu consulta y te responderá lo antes posible.</p>
        
        <div class="order-details">
            <h3>📋 Resumen de tu mensaje</h3>
            <p><strong>📝 Asunto:</strong> ${formData.subject}</p>
            <p><strong>📅 Fecha de envío:</strong> ${new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            
            <h4>💬 Tu mensaje</h4>
            <div class="address-box" style="background: #f8fafc; border-left: 4px solid #6366f1;">
                ${formData.message.replace(/\n/g, "<br>")}
            </div>
        </div>
        
        <div class="contact-info">
            <h4>📞 Información de Contacto</h4>
            <p><strong>📧 Email de soporte:</strong> <a href="mailto:${shopSettings?.supportEmail || shopSettings?.email || "soporte@tutienda.com"}" style="color: #6366f1;">${shopSettings?.supportEmail || shopSettings?.email || "soporte@tutienda.com"}</a></p>
            ${shopSettings?.supportPhone ? `<p><strong>📱 Teléfono de soporte:</strong> <a href="tel:${shopSettings.supportPhone}" style="color: #6366f1;">${shopSettings.supportPhone}</a></p>` : ""}
            ${shopSettings?.phone && !shopSettings?.supportPhone ? `<p><strong>📱 Teléfono:</strong> <a href="tel:${shopSettings.phone}" style="color: #6366f1;">${shopSettings.phone}</a></p>` : ""}
            <p><strong>🕒 Horario de atención:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</p>
        </div>
        
        <div class="contact-info" style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-left: 4px solid #10b981;">
            <h4>⏱️ Tiempo de Respuesta</h4>
            <p>Nuestro tiempo de respuesta habitual es de <strong>24-48 horas</strong> en días laborables. Para consultas urgentes, no dudes en llamarnos directamente.</p>
        </div>
        
        ${
          shopSettings?.liveChatEnabled
            ? `
        <div class="contact-info">
            <h4>💬 Chat en Vivo Disponible</h4>
            <p>¿Necesitas ayuda inmediata? También puedes contactarnos a través de nuestro chat en vivo disponible las 24 horas en <a href="${shopSettings.domain}" style="color: #6366f1; font-weight: 600;">nuestra tienda online</a></p>
        </div>
        `
            : ""
        }
        
        <p style="text-align: center; font-style: italic; color: #6b7280;">Gracias por confiar en nosotros. ¡Esperamos poder ayudarte pronto!</p>
    </div>
  `

  return baseTemplate(content, "Confirmación: Mensaje Recibido", shopSettings)
}
