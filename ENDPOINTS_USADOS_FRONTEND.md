# Endpoints del Backend Utilizados en el Frontend

## Configuración Base

**URL Base:** `process.env.NEXT_PUBLIC_BACKEND_ENDPOINT`  
**Autenticación:** Bearer Token (`process.env.NEXT_PUBLIC_API_KEY`)  
**Store ID:** `process.env.NEXT_PUBLIC_STORE_ID`

---

## 📋 Endpoints Utilizados por Módulo

### 🔐 Autenticación
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Login de usuarios  
- `GET /auth/store/{STORE_ID}` - Obtener usuarios por tienda

### 🏪 Categorías
- `GET /categories/{STORE_ID}` - Listar categorías (con paginación)
- `GET /categories/{STORE_ID}/{id}` - Obtener categoría por ID

### 🛍️ Productos
- `GET /products/store/{STORE_ID}` - Listar productos (con paginación)
- `GET /products/{STORE_ID}/{id}` - Obtener producto por ID
- `GET /products/by-slug/{STORE_ID}/{slug}` - Obtener producto por slug

### 🎨 Variantes de Productos
- `GET /product-variants/store/{STORE_ID}` - Listar variantes (con paginación)

### 📦 Colecciones
- `GET /collections/{STORE_ID}` - Listar colecciones (con paginación)
- `GET /collections/{STORE_ID}/{id}` - Obtener colección por ID

### 🎯 Hero Sections
- `GET /hero-sections/{STORE_ID}` - Listar hero sections (con paginación)

### 🃏 Card Sections
- `GET /card-section/{STORE_ID}` - Obtener card sections

### 👥 Team Sections
- `GET /team-section/store/{STORE_ID}` - Obtener team sections
- `GET /team-section/store/{STORE_ID}/members` - Obtener miembros del equipo

### 📋 Órdenes
- `GET /orders/{STORE_ID}` - Listar órdenes (con paginación)
- `GET /orders/{STORE_ID}/{id}` - Obtener orden por ID
- `POST /orders/{STORE_ID}` - Crear nueva orden
- `PUT /orders/{STORE_ID}/{id}` - Actualizar orden

### 🎫 Cupones
- `GET /coupons/{STORE_ID}` - Listar cupones (con paginación)
- `GET /coupons/{STORE_ID}/{id}` - Obtener cupón por ID

### 🚚 Métodos de Envío
- `GET /shipping-methods/{STORE_ID}` - Listar métodos de envío (con paginación)
- `GET /shipping-methods/geographic-data` - Obtener datos geográficos
- `GET /shipping-methods/geographic-data/{countryId}` - Obtener estados por país
- `GET /shipping-methods/geographic-data/{countryId}/{stateId}` - Obtener ciudades por estado

### 💳 Proveedores de Pago
- `GET /payment-providers/store/{STORE_ID}` - Obtener proveedores de pago

### 💰 Transacciones de Pago
- `GET /payment-transactions/store/{STORE_ID}` - Listar transacciones (con paginación)

### 📄 Contenido
- `GET /contents/{STORE_ID}` - Listar contenido (con paginación)

### ⚙️ Configuración de Tienda
- `GET /shop-settings/store/{STORE_ID}` - Obtener configuración de tienda

### 💱 Monedas
- `GET /currencies` - Listar monedas (con paginación)
- `GET /currencies/{id}` - Obtener moneda por ID

### 📈 Tipos de Cambio
- `GET /exchange-rates` - Listar tipos de cambio (con paginación)
- `GET /exchange-rates/{id}` - Obtener tipo de cambio por ID

### 🛒 Frequently Bought Together (FBT)
- `GET /fbt/{STORE_ID}` - Listar FBT (con paginación)
- `GET /fbt/{STORE_ID}/{id}` - Obtener FBT por ID
- `POST /fbt/{STORE_ID}` - Crear nuevo FBT
- `PATCH /fbt/{STORE_ID}/{id}` - Actualizar FBT
- `DELETE /fbt/{STORE_ID}/{id}` - Eliminar FBT

### 💸 Reembolsos
- `POST /refunds` - Crear reembolso

### 📧 Email
- `POST /email/send` - Enviar email
- `POST /email/submit-form` - Enviar formulario

---

## 🔧 Parámetros de Consulta Comunes

### Paginación
- `page` - Número de página (default: 1)
- `limit` - Elementos por página (default: 20, max: 100)
- `sortBy` - Campo de ordenamiento (default: 'createdAt')
- `sortOrder` - Orden ('asc' | 'desc', default: 'desc')

### Filtros Comunes
- `status` - Estado del recurso (ACTIVE, INACTIVE, etc.)
- `query` - Búsqueda de texto
- `startDate` / `endDate` - Rango de fechas
- `published` - Solo contenido publicado (true/false)

---

## 📊 Formato de Respuesta

### Respuesta Paginada
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Respuesta Simple
```json
{
  "data": {...},
  "success": true,
  "message": "Success"
}
```

---

## 🚀 Endpoints de Next.js API Routes (Internos)

### Autenticación
- `POST /api/auth/[...nextauth]` - NextAuth.js
- `GET /api/auth/session` - Obtener sesión
- `POST /api/auth/verify-email` - Verificar email

### Direcciones
- `GET /api/addresses/[addressId]` - Obtener dirección
- `PUT /api/addresses/[addressId]/set-default` - Establecer dirección por defecto

### Email
- `POST /api/email/contact-form` - Formulario de contacto
- `POST /api/email/send-to-admin` - Enviar a admin
- `POST /api/email/send-to-client` - Enviar a cliente
- `POST /api/email/send-verification` - Enviar verificación
- `GET /api/email/verify-config` - Verificar configuración

### Pagos
- `POST /api/payments/culqui` - Procesar pago Culqui
- `POST /api/payments/mercadopago` - Procesar pago MercadoPago
- `POST /api/webhooks/mercadopago` - Webhook MercadoPago

### Usuarios
- `GET /api/users/[userId]/addresses` - Direcciones del usuario
- `POST /api/users/[userId]/addresses` - Crear dirección
- `PUT /api/users/[userId]/change-password` - Cambiar contraseña
- `POST /api/users/[userId]/set-password` - Establecer contraseña
- `GET /api/users/by-email/[email]` - Obtener usuario por email

---

## 📝 Notas Importantes

1. **Store ID**: Todos los endpoints requieren el `STORE_ID` en la URL
2. **Autenticación**: Se usa Bearer Token con la API Key pública
3. **Paginación**: La mayoría de endpoints GET soportan paginación
4. **Filtros**: Muchos endpoints soportan filtros adicionales
5. **Slugs**: Algunos recursos pueden consultarse por slug además de ID
6. **Variables de Entorno**: Configurar `NEXT_PUBLIC_BACKEND_ENDPOINT`, `NEXT_PUBLIC_API_KEY` y `NEXT_PUBLIC_STORE_ID`

---

**Última actualización:** Enero 2025  
**Total de endpoints utilizados:** 45+ endpoints del backend + 15+ API routes internos
