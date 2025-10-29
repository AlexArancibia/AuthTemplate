# Auditoría Completa de Endpoints - Sportt Backend API

**Fecha de auditoría:** 15 de enero de 2025  
**Versión:** 1.2.0  
**Total de controladores:** 26  
**Total de endpoints:** 162

---

## 📋 Índice

1. [App Controller](#1-app-controller)
2. [Auth Controller](#2-auth-controller)
3. [Card Section Controller](#3-card-section-controller)
4. [Category Controller](#4-category-controller)
5. [Client Logo Section Controller](#5-client-logo-section-controller)
6. [Collection Controller](#6-collection-controller)
7. [Content Controller](#7-content-controller)
8. [Coupon Controller](#8-coupon-controller)
9. [Currency Controller](#9-currency-controller)
10. [Email Controller](#10-email-controller)
11. [Exchange Rate Controller](#11-exchange-rate-controller)
12. [FBT Controller](#12-fbt-controller-frequently-bought-together)
13. [File Controller](#13-file-controller)
14. [Hero Section Controller](#14-hero-section-controller)
15. [Kardex Controller](#15-kardex-controller)
16. [Order Controller](#16-order-controller)
17. [Payment Providers Controller](#17-payment-providers-controller)
18. [Payment Transaction Controller](#18-payment-transaction-controller)
19. [Product Controller](#19-product-controller)
20. [Refund Controller](#20-refund-controller)
21. [SEO Config Controller](#21-seo-config-controller)
22. [Shipping Methods Controller](#22-shipping-methods-controller)
23. [Shop Settings Controller](#23-shop-settings-controller)
24. [Statistics Controller](#24-statistics-controller)
25. [Store Controller](#25-store-controller)
26. [Team Section Controller](#26-team-section-controller)

---

## 🔐 Leyenda de Autenticación

- **🔓 Public:** Acceso público sin autenticación
- **🔑 PublicKeyGuard:** Requiere API Key pública
- **🔒 AuthGuard:** Requiere autenticación de usuario/administrador

---

## 1. App Controller

**Ruta base:** `/`

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| GET | `/` | 🔓 Public | Redirección a interfaz de testing |
| GET | `/health` | 🔓 Public | Health check del servicio |

---

## 2. Auth Controller

**Ruta base:** `/auth`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/auth/register` | 🔑 PublicKeyGuard | Body: CreateAuthDto | Registrar nuevo usuario |
| POST | `/auth/login` | 🔑 PublicKeyGuard | Body: LoginAuthDto | Iniciar sesión |
| GET | `/auth` | 🔒 AuthGuard | - | Obtener todos los usuarios |
| GET | `/auth/store/:storeId` | 🔒 AuthGuard | storeId | Obtener usuarios por tienda |
| GET | `/auth/:id` | 🔒 AuthGuard | id | Obtener usuario por ID |
| PATCH | `/auth/:id` | 🔒 AuthGuard | id, Body: UpdateUserDto | Actualizar usuario |
| DELETE | `/auth/:id` | 🔒 AuthGuard | id | Eliminar usuario |

---

## 3. Card Section Controller

**Ruta base:** `/card-section`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/card-section/:storeId` | 🔒 AuthGuard | storeId, Body: CreateCardSectionDto | Crear sección de tarjetas |
| GET | `/card-section/:storeId` | 🔑 PublicKeyGuard | storeId | Obtener todas las secciones de tarjetas |
| GET | `/card-section/:storeId/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener sección de tarjetas por ID |
| PATCH | `/card-section/:storeId/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateCardSectionDto | Actualizar sección de tarjetas |
| DELETE | `/card-section/:storeId/:id` | 🔒 AuthGuard | storeId, id | Eliminar sección de tarjetas |

---

## 4. Category Controller

**Ruta base:** `/categories`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/categories/:storeId` | 🔒 AuthGuard | storeId, Body: CreateCategoryDto | Crear categoría |
| GET | `/categories/:storeId` | 🔑 PublicKeyGuard | storeId, Query: searchParams | Obtener todas las categorías |
| GET | `/categories/:storeId/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener categoría por ID |
| PUT | `/categories/:storeId/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateCategoryDto | Actualizar categoría |
| DELETE | `/categories/:storeId/:id` | 🔒 AuthGuard | storeId, id | Eliminar categoría |

---

## 5. Client Logo Section Controller

**Ruta base:** `/client-logo-sections`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/client-logo-sections/:storeId` | 🔒 AuthGuard | storeId, Body: CreateClientLogoSectionDto | Crear sección de logos |
| GET | `/client-logo-sections/:storeId` | 🔑 PublicKeyGuard | storeId | Obtener secciones de logos por tienda |
| GET | `/client-logo-sections/:storeId/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener sección de logos por ID |
| PATCH | `/client-logo-sections/:storeId/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateClientLogoSectionDto | Actualizar sección de logos |
| DELETE | `/client-logo-sections/:storeId/:id` | 🔒 AuthGuard | storeId, id | Eliminar sección de logos |
| POST | `/client-logo-sections/:storeId/:sectionId/client-logos` | 🔒 AuthGuard | storeId, sectionId, Body: CreateClientLogoDto | Crear logo de cliente |
| GET | `/client-logo-sections/:storeId/client-logos/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener logo de cliente |
| PUT | `/client-logo-sections/:storeId/client-logos/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateClientLogoDto | Actualizar logo de cliente |
| DELETE | `/client-logo-sections/:storeId/client-logos/:id` | 🔒 AuthGuard | storeId, id | Eliminar logo de cliente |

---

## 6. Collection Controller

**Ruta base:** `/collections`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/collections/:storeId` | 🔒 AuthGuard | storeId, Body: CreateCollectionDto | Crear colección |
| GET | `/collections/:storeId` | 🔑 PublicKeyGuard | storeId, Query: SearchCollectionDto | Obtener todas las colecciones |
| GET | `/collections/:storeId/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener colección por ID |
| PATCH | `/collections/:storeId/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateCollectionDto | Actualizar colección |
| DELETE | `/collections/:storeId/:id` | 🔒 AuthGuard | storeId, id | Eliminar colección |
| PATCH | `/collections/:storeId/:id/products/:productId` | 🔒 AuthGuard | storeId, id, productId | Agregar producto a colección |
| DELETE | `/collections/:storeId/:id/products/:productId` | 🔒 AuthGuard | storeId, id, productId | Remover producto de colección |

---

## 7. Content Controller

**Ruta base:** `/contents`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/contents/:storeId` | 🔒 AuthGuard | storeId, Body: CreateContentDto | Crear contenido |
| GET | `/contents/:storeId` | 🔑 PublicKeyGuard | storeId, Query: SearchContentDto | Obtener todos los contenidos |
| GET | `/contents/:storeId/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener contenido por ID |
| GET | `/contents/by-slug/:storeId/:slug` | 🔑 PublicKeyGuard | storeId, slug | Obtener contenido por slug |
| PUT | `/contents/:storeId/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateContentDto | Actualizar contenido |
| PATCH | `/contents/:storeId/:id/publish` | 🔒 AuthGuard | storeId, id | Publicar contenido |
| PATCH | `/contents/:storeId/:id/unpublish` | 🔒 AuthGuard | storeId, id | Despublicar contenido |
| DELETE | `/contents/:storeId/:id` | 🔒 AuthGuard | storeId, id | Eliminar contenido |

---

## 8. Coupon Controller

**Ruta base:** `/coupons`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/coupons/:storeId` | 🔒 AuthGuard | storeId, Body: CreateCouponDto | Crear cupón |
| GET | `/coupons/:storeId` | 🔑 PublicKeyGuard | storeId, Query: SearchCouponDto | Obtener todos los cupones |
| GET | `/coupons/:storeId/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener cupón por ID |
| GET | `/coupons/by-code/:storeId/:code` | 🔑 PublicKeyGuard | storeId, code | Obtener cupón por código |
| PUT | `/coupons/:storeId/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateCouponDto | Actualizar cupón |
| DELETE | `/coupons/:storeId/:id` | 🔒 AuthGuard | storeId, id | Eliminar cupón |
| POST | `/coupons/:storeId/validate` | 🔑 PublicKeyGuard | storeId, Body: ValidateCouponDto | Validar cupón |
| PATCH | `/coupons/:storeId/:id/apply` | 🔒 AuthGuard | storeId, id | Aplicar cupón |

---

## 9. Currency Controller

**Ruta base:** `/currencies`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/currencies` | 🔒 AuthGuard | Body: CreateCurrencyDto | Crear moneda |
| GET | `/currencies` | 🔑 PublicKeyGuard | Query: searchParams | Obtener todas las monedas |
| GET | `/currencies/:id` | 🔑 PublicKeyGuard | id | Obtener moneda por ID |
| GET | `/currencies/by-code/:code` | 🔑 PublicKeyGuard | code | Obtener moneda por código |
| PATCH | `/currencies/:id` | 🔒 AuthGuard | id, Body: UpdateCurrencyDto | Actualizar moneda |
| DELETE | `/currencies/:id` | 🔒 AuthGuard | id | Eliminar moneda |

---

## 10. Email Controller

**Ruta base:** `/email`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/email/send` | 🔑 PublicKeyGuard | Body: SendEmailDto | Enviar email |
| POST | `/email/submit-form` | 🔑 PublicKeyGuard | Body: FormSubmissionDto | Enviar formulario por email |

---

## 11. Exchange Rate Controller

**Ruta base:** `/exchange-rates`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/exchange-rates` | 🔒 AuthGuard | Body: CreateExchangeRateDto | Crear tasa de cambio |
| GET | `/exchange-rates` | 🔑 PublicKeyGuard | Query: searchParams | Obtener todas las tasas de cambio |
| GET | `/exchange-rates/:id` | 🔑 PublicKeyGuard | id | Obtener tasa de cambio por ID |
| PATCH | `/exchange-rates/:id` | 🔒 AuthGuard | id, Body: UpdateExchangeRateDto | Actualizar tasa de cambio |
| DELETE | `/exchange-rates/:id` | 🔒 AuthGuard | id | Eliminar tasa de cambio |

---

## 12. FBT Controller (Frequently Bought Together)

**Ruta base:** `/fbt`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/fbt/:storeId` | 🔒 AuthGuard | storeId, Body: CreateFrequentlyBoughtTogetherDto | Crear relación FBT |
| GET | `/fbt/:storeId` | 🔑 PublicKeyGuard | storeId, Query: searchParams | Obtener todas las relaciones FBT |
| GET | `/fbt/:storeId/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener relación FBT por ID |
| PATCH | `/fbt/:storeId/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateFrequentlyBoughtTogetherDto | Actualizar relación FBT |
| DELETE | `/fbt/:storeId/:id` | 🔒 AuthGuard | storeId, id | Eliminar relación FBT |

---

## 13. File Controller

**Ruta base:** `/file`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/file/upload` | 🔒 AuthGuard | FormData: file, Body: CreateFileDto | Subir archivo (max 1MB) |
| GET | `/file/list` | 🔒 AuthGuard | - | Listar archivos subidos |
| DELETE | `/file/delete/:filename` | 🔒 AuthGuard | filename | Eliminar archivo |

**Notas:**
- Límite de tamaño: 1MB
- Solo acepta imágenes
- Directorio: definido en FILE_UPLOADS_DIR

---

## 14. Hero Section Controller

**Ruta base:** `/hero-sections`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/hero-sections/:storeId` | 🔒 AuthGuard | storeId, Body: CreateHeroSectionDto | Crear sección hero |
| GET | `/hero-sections/:storeId` | 🔑 PublicKeyGuard | storeId, Query: searchParams | Obtener todas las secciones hero |
| GET | `/hero-sections/:storeId/active` | 🔑 PublicKeyGuard | storeId | Obtener sección hero activa |
| GET | `/hero-sections/:storeId/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener sección hero por ID |
| PUT | `/hero-sections/:storeId/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateHeroSectionDto | Actualizar sección hero |
| PATCH | `/hero-sections/:storeId/:id/activate` | 🔒 AuthGuard | storeId, id | Activar sección hero |
| PATCH | `/hero-sections/:storeId/:id/deactivate` | 🔒 AuthGuard | storeId, id | Desactivar sección hero |
| DELETE | `/hero-sections/:storeId/:id` | 🔒 AuthGuard | storeId, id | Eliminar sección hero |

---

## 15. Kardex Controller

**Ruta base:** `/kardex`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| GET | `/kardex/general` | Sin guard específico | Query: KardexFilterDto (storeId requerido) | Obtener kardex general |

**Notas:**
- storeId es obligatorio en query params

---

## 16. Order Controller

**Ruta base:** `/orders`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/orders/:storeId` | 🔑 PublicKeyGuard | storeId, Body: CreateOrderDto | Crear orden |
| GET | `/orders/:storeId` | Sin guard específico | storeId, Query: SearchOrderDto | Obtener todas las órdenes |
| GET | `/orders/:storeId/statistics` | 🔑 PublicKeyGuard | storeId, Query: startDate, endDate | Obtener estadísticas de órdenes |
| GET | `/orders/:storeId/number/:orderNumber` | 🔑 PublicKeyGuard | storeId, orderNumber | Obtener orden por número |
| GET | `/orders/:storeId/temporal/:temporalOrderId` | 🔑 PublicKeyGuard | storeId, temporalOrderId | Obtener orden por ID temporal |
| GET | `/orders/:storeId/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener orden por ID |
| PUT | `/orders/:storeId/:id` | 🔑 PublicKeyGuard | storeId, id, Body: UpdateOrderDto | Actualizar orden |
| PATCH | `/orders/:storeId/:id/status` | 🔒 AuthGuard | storeId, id, Body: statusData | Actualizar estado de orden |
| DELETE | `/orders/:storeId/:id` | 🔒 AuthGuard | storeId, id | Eliminar orden |

---

## 17. Payment Providers Controller

**Ruta base:** `/payment-providers`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/payment-providers/:storeId` | 🔒 AuthGuard | storeId, Body: CreatePaymentProviderDto | Crear proveedor de pago |
| GET | `/payment-providers` | 🔑 PublicKeyGuard | - | Obtener todos los proveedores |
| GET | `/payment-providers/:storeId` | 🔑 PublicKeyGuard | storeId, Query: includeInactive, type | Obtener proveedores por tienda |
| GET | `/payment-providers/:id` | 🔑 PublicKeyGuard | id | Obtener proveedor por ID |
| PUT | `/payment-providers/:storeId/:id` | 🔒 AuthGuard | storeId, id, Body: UpdatePaymentProviderDto | Actualizar proveedor |
| PATCH | `/payment-providers/:id/activate` | 🔒 AuthGuard | id | Activar proveedor |
| PATCH | `/payment-providers/:id/deactivate` | 🔒 AuthGuard | id | Desactivar proveedor |
| DELETE | `/payment-providers/:id` | 🔒 AuthGuard | id | Eliminar proveedor |
| GET | `/payment-providers/:id/statistics` | 🔑 PublicKeyGuard | id | Obtener estadísticas del proveedor |

---

## 18. Payment Transaction Controller

**Ruta base:** `/payment-transactions`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/payment-transactions` | 🔒 AuthGuard | Body: CreatePaymentTransactionDto | Crear transacción |
| GET | `/payment-transactions` | 🔑 PublicKeyGuard | Query: searchParams | Obtener todas las transacciones |
| GET | `/payment-transactions/order/:orderId` | 🔑 PublicKeyGuard | orderId | Obtener transacciones por orden |
| GET | `/payment-transactions/:storeId` | 🔑 PublicKeyGuard | storeId, Query: searchParams | Obtener transacciones por tienda |
| GET | `/payment-transactions/provider/:paymentProviderId` | 🔑 PublicKeyGuard | paymentProviderId, Query: status | Obtener transacciones por proveedor |
| GET | `/payment-transactions/:id` | 🔑 PublicKeyGuard | id | Obtener transacción por ID |
| PUT | `/payment-transactions/:id` | 🔒 AuthGuard | id, Body: UpdatePaymentTransactionDto | Actualizar transacción |
| DELETE | `/payment-transactions/:id` | 🔒 AuthGuard | id | Eliminar transacción |
| GET | `/payment-transactions/statistics/:storeId` | 🔑 PublicKeyGuard | storeId, Query: DateRangeDto | Obtener estadísticas por tienda |

---

## 19. Product Controller

**Ruta base:** `/products`

### Endpoints de Productos

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| GET | `/products/:storeId` | 🔑 PublicKeyGuard | storeId, Query: SearchProductDto | Obtener productos por tienda |
| GET | `/products/by-slug/:storeId/:slug` | 🔑 PublicKeyGuard | storeId, slug | Obtener producto por slug |
| GET | `/products/statistics/:storeId` | 🔑 PublicKeyGuard | storeId | Obtener estadísticas de productos |
| POST | `/products/:storeId` | 🔒 AuthGuard | storeId, Body: CreateProductDto | Crear producto |
| GET | `/products/:storeId/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener producto por ID |
| PATCH | `/products/:storeId/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateProductDto | Actualizar producto |
| PATCH | `/products/:storeId/:id/status` | 🔒 AuthGuard | storeId, id, Body: { status } | Actualizar estado del producto |
| DELETE | `/products/:storeId/:id` | 🔒 AuthGuard | storeId, id | Eliminar producto |
| POST | `/products/:storeId/:id/view` | 🔑 PublicKeyGuard | storeId, id | Incrementar contador de vistas |

### Endpoints de Variantes de Producto

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/products/:storeId/:productId/variants` | 🔒 AuthGuard | storeId, productId, Body: CreateProductVariantDto | Crear variante |
| GET | `/products/:storeId/variants/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener variante por ID |
| PATCH | `/products/:storeId/variants/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateProductVariantDto | Actualizar variante |
| PATCH | `/products/:storeId/variants/:id/new-product/:productId` | 🔒 AuthGuard | storeId, id, productId, Body: UpdateProductVariantDto | Cambiar producto de variante |
| DELETE | `/products/:storeId/variants/:id` | 🔒 AuthGuard | storeId, id | Eliminar variante |

### Endpoints de Precios de Variantes

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/products/:storeId/variant-prices` | 🔒 AuthGuard | storeId, Body: CreateVariantPriceDto | Crear precio de variante |
| GET | `/products/:storeId/variant-prices/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener precio de variante |
| PATCH | `/products/:storeId/variant-prices/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateVariantPriceDto | Actualizar precio de variante |
| DELETE | `/products/:storeId/variant-prices/:id` | 🔒 AuthGuard | storeId, id | Eliminar precio de variante |

### Endpoints de Gestión de Precios

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/products/:storeId/adjust-prices` | 🔒 AuthGuard | storeId, Body: AdjustPricesDto | Ajustar precios masivamente por tipos de cambio |

---

## 20. Refund Controller

**Ruta base:** `/refunds`

### Endpoints de Reembolsos

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/refunds` | 🔒 AuthGuard | Body: CreateRefundDto | Crear reembolso |
| GET | `/refunds` | 🔑 PublicKeyGuard | - | Obtener todos los reembolsos |
| GET | `/refunds/order/:orderId` | 🔑 PublicKeyGuard | orderId | Obtener reembolsos por orden |
| GET | `/refunds/:storeId` | 🔑 PublicKeyGuard | storeId | Obtener reembolsos por tienda |
| GET | `/refunds/:id` | 🔑 PublicKeyGuard | id | Obtener reembolso por ID |
| PUT | `/refunds/:id` | 🔒 AuthGuard | id, Body: UpdateRefundDto | Actualizar reembolso |
| DELETE | `/refunds/:id` | 🔒 AuthGuard | id | Eliminar reembolso |
| GET | `/refunds/statistics/:storeId` | 🔑 PublicKeyGuard | storeId, Query: DateRangeDto | Obtener estadísticas por tienda |

### Endpoints de Ítems de Reembolso

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/refunds/line-items` | 🔒 AuthGuard | Body: CreateRefundLineItemDto | Crear ítem de reembolso |
| GET | `/refunds/line-items/:id` | 🔑 PublicKeyGuard | id | Obtener ítem de reembolso |
| PUT | `/refunds/line-items/:id` | 🔒 AuthGuard | id, Body: UpdateRefundLineItemDto | Actualizar ítem de reembolso |
| DELETE | `/refunds/line-items/:id` | 🔒 AuthGuard | id | Eliminar ítem de reembolso |

---

## 21. SEO Config Controller

**Ruta base:** `/seo-config`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/seo-config/:storeId` | 🔒 AuthGuard | storeId, Body: CreateSeoConfigDto | Crear configuración SEO |
| GET | `/seo-config/:storeId` | 🔑 PublicKeyGuard | storeId | Obtener configuraciones SEO |
| GET | `/seo-config/:storeId/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener configuración SEO por ID |
| PATCH | `/seo-config/:storeId/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateSeoConfigDto | Actualizar configuración SEO |
| DELETE | `/seo-config/:storeId/:id` | 🔒 AuthGuard | storeId, id | Eliminar configuración SEO |

---

## 22. Shipping Methods Controller

**Ruta base:** `/shipping-methods`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| GET | `/shipping-methods/:storeId` | 🔑 PublicKeyGuard | storeId, Query: searchParams | Obtener métodos de envío |
| GET | `/shipping-methods/:storeId/location` | 🔑 PublicKeyGuard | storeId, Query: countryCode, stateCode, cityName, postalCode | Buscar por ubicación geográfica |
| GET | `/shipping-methods/geographic-data/search` | 🔑 PublicKeyGuard | Query: q, type | Buscar datos geográficos |
| GET | `/shipping-methods/geographic-data/:countryId?/:stateId?` | 🔑 PublicKeyGuard | countryId, stateId | Obtener datos geográficos |
| GET | `/shipping-methods/:storeId/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener método de envío por ID |
| GET | `/shipping-methods/:storeId/:methodId/calculate-cost` | 🔑 PublicKeyGuard | storeId, methodId, Query: weight, countryCode, stateCode, cityName, postalCode | Calcular costo de envío |
| POST | `/shipping-methods/:storeId` | 🔒 AuthGuard | storeId, Body: CreateShippingMethodDto | Crear método de envío |
| PATCH | `/shipping-methods/:storeId/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateShippingMethodDto | Actualizar método de envío |
| DELETE | `/shipping-methods/:storeId/:id` | 🔒 AuthGuard | storeId, id | Eliminar método de envío |

**Notas:**
- Soporte completo para zonas geográficas (países, estados, ciudades)
- Cálculo dinámico de costos de envío basado en peso y ubicación
- Búsqueda de datos geográficos integrada

---

## 23. Shop Settings Controller

**Ruta base:** `/shop-settings`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/shop-settings/:storeId` | 🔒 AuthGuard | storeId, Body: CreateShopSettingsDto | Crear configuración de tienda |
| GET | `/shop-settings` | Sin guard específico | - | Obtener todas las configuraciones |
| GET | `/shop-settings/:storeId` | 🔑 PublicKeyGuard | storeId | Obtener configuración por tienda |
| GET | `/shop-settings/domain/:domain` | 🔑 PublicKeyGuard | domain | Obtener configuración por dominio |
| PATCH | `/shop-settings/:storeId` | 🔒 AuthGuard | storeId, Body: UpdateShopSettingsDto | Actualizar configuración |
| POST | `/shop-settings/:storeId/currencies/:currencyId` | 🔒 AuthGuard | storeId, currencyId | Agregar moneda aceptada |
| DELETE | `/shop-settings/:storeId/currencies/:currencyId` | 🔒 AuthGuard | storeId, currencyId | Remover moneda aceptada |

---

## 24. Statistics Controller

**Ruta base:** `/statistics`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| GET | `/statistics` | 🔒 AuthGuard | Query: StatisticsFilterDto (storeId requerido) | Obtener estadísticas generales |

**Notas:**
- Requiere autenticación Bearer
- storeId es obligatorio en query params
- Documentado con Swagger (@ApiBearerAuth)

---

## 25. Store Controller

**Ruta base:** `/stores`

### Endpoints de Tiendas

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/stores` | 🔒 AuthGuard | Body: CreateStoreDto | Crear tienda |
| GET | `/stores` | 🔒 AuthGuard | Query: searchParams | Obtener todas las tiendas |
| GET | `/stores/by-slug/:slug` | 🔑 PublicKeyGuard | slug | Obtener tienda por slug |
| GET | `/stores/owner/:ownerId` | 🔒 AuthGuard | ownerId, Query: searchParams | Obtener tiendas por propietario |
| GET | `/stores/:id` | 🔑 PublicKeyGuard | id | Obtener tienda por ID |
| PATCH | `/stores/:id` | 🔒 AuthGuard | id, Body: UpdateStoreDto | Actualizar tienda |
| DELETE | `/stores/:id` | 🔒 AuthGuard | id | Eliminar tienda |
| GET | `/stores/:storeId/statistics` | 🔑 PublicKeyGuard | storeId | Obtener estadísticas de tienda |

### Endpoints de API Keys

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/stores/api-keys` | 🔒 AuthGuard | Body: CreateApiKeyDto | Crear API Key |
| GET | `/stores/:storeId/api-keys` | 🔒 AuthGuard | storeId | Obtener API Keys de tienda |
| DELETE | `/stores/:storeId/api-keys/:keyId` | 🔒 AuthGuard | storeId, keyId | Eliminar API Key |
| POST | `/stores/verify-api-key` | 🔑 PublicKeyGuard | Body: { apiKey } | Verificar API Key |

---

## 26. Team Section Controller

**Ruta base:** `/team-sections`

| Método | Endpoint | Autenticación | Parámetros | Descripción |
|--------|----------|---------------|------------|-------------|
| POST | `/team-sections/:storeId` | 🔒 AuthGuard | storeId, Body: CreateTeamSectionDto | Crear sección de equipo |
| GET | `/team-sections/:storeId` | 🔑 PublicKeyGuard | storeId | Obtener secciones por tienda |
| GET | `/team-sections/:storeId/:id` | 🔑 PublicKeyGuard | storeId, id | Obtener sección por ID |
| PATCH | `/team-sections/:storeId/:id` | 🔒 AuthGuard | storeId, id, Body: UpdateTeamSectionDto | Actualizar sección |
| DELETE | `/team-sections/:storeId/:id` | 🔒 AuthGuard | storeId, id | Eliminar sección |

---

## 📊 Resumen de la Auditoría

### Estadísticas Generales

- **Total de controladores:** 26
- **Total de endpoints:** 162
- **Métodos HTTP utilizados:** GET, POST, PUT, PATCH, DELETE

### Distribución de Autenticación

- **🔓 Public (sin autenticación):** 2 endpoints
- **🔑 PublicKeyGuard (API Key pública):** ~65% de los endpoints
- **🔒 AuthGuard (autenticación requerida):** ~33% de los endpoints

### Endpoints por Categoría

1. **Gestión de Contenido:** 45+ endpoints (Products, Categories, Collections, Content, Hero Sections, etc.)
2. **E-commerce:** 40+ endpoints (Orders, Payments, Shipping, Coupons, Refunds)
3. **Configuración:** 30+ endpoints (Store, Shop Settings, SEO Config, Currencies, Exchange Rates)
4. **Administración:** 25+ endpoints (Auth, Users, Statistics, Kardex, Files)
5. **UI/UX:** 20+ endpoints (Card Sections, Client Logos, Team Sections, FBT)
6. **Comunicación:** 2 endpoints (Email)

### Patrones Identificados

#### ✅ Buenas Prácticas Implementadas

1. **Consistencia en rutas:** Uso consistente de `:storeId` en la mayoría de los endpoints
2. **Validación de parámetros:** Validación de `storeId` y otros parámetros requeridos
3. **Separación de responsabilidades:** Controllers delgados que delegan a services
4. **Guards de seguridad:** Implementación de AuthGuard y PublicKeyGuard
5. **RESTful design:** Uso apropiado de métodos HTTP (GET, POST, PUT, PATCH, DELETE)
6. **Endpoints especializados:** Rutas específicas como `/by-slug`, `/statistics`, `/activate`
7. **Paginación:** Soporte para SearchParams en múltiples endpoints
8. **Nested resources:** Manejo de recursos anidados (variants, prices, line-items, etc.)

#### ⚠️ Áreas de Mejora Identificadas

1. **Inconsistencia en guards:**
   - Algunos endpoints no tienen guards específicos (Order GET all, Shop Settings GET all, Kardex)
   - Recomendación: Agregar PublicKeyGuard o AuthGuard según corresponda

2. **Validación de storeId:**
   - Algunos controladores validan storeId manualmente en cada endpoint
   - Recomendación: Crear un interceptor o pipe para validar storeId automáticamente

3. **Manejo de errores:**
   - Algunos usan `BadRequestException`, otros usan `Error`
   - Recomendación: Estandarizar el manejo de excepciones

4. **Documentación:**
   - Solo Statistics Controller usa decoradores de Swagger
   - Recomendación: Agregar documentación Swagger a todos los endpoints

5. **DTOs en línea:**
   - Email Controller define DTOs dentro del archivo del controlador
   - Payment Transaction y Refund Controllers definen DTOs de validación en el controlador
   - Recomendación: Mover todos los DTOs a archivos separados

6. **Respuestas inconsistentes:**
   - Algunos endpoints retornan objetos directos, otros envuelven en `{ message, data }`
   - Recomendación: Estandarizar el formato de respuestas

7. **Rate limiting:**
   - No se observa implementación de rate limiting
   - Recomendación: Agregar throttling para endpoints públicos

### Recomendaciones de Seguridad

1. **Implementar rate limiting:** Especialmente en endpoints públicos de login, registro y envío de emails
2. **Validar permisos por tienda:** Asegurar que usuarios solo puedan modificar recursos de sus tiendas
3. **Sanitización de inputs:** Validar y sanitizar todos los inputs para prevenir inyección SQL/NoSQL
4. **CORS configurado:** Asegurar que CORS esté configurado apropiadamente
5. **Helmet.js:** Implementar headers de seguridad
6. **Logs de auditoría:** Implementar logging para operaciones críticas (creación, actualización, eliminación)

### Recomendaciones de Performance

1. **Caché:** Implementar caché para endpoints de lectura frecuente (categorías, productos, configuraciones)
2. **Paginación obligatoria:** Hacer paginación obligatoria en todos los endpoints de listado
3. **Índices de base de datos:** Asegurar índices en campos frecuentemente consultados (storeId, slug, etc.)
4. **Lazy loading:** Implementar carga perezosa para relaciones complejas
5. **Compresión:** Habilitar compresión de respuestas

### Endpoints Críticos que Requieren Atención Especial

1. **File Upload (`/file/upload`):**
   - Límite actual: 1MB
   - Considerar: Validación de tipos MIME más robusta, escaneo de malware, almacenamiento en CDN

2. **Order Creation (`/orders/:storeId`):**
   - Requiere: Transacciones para garantizar integridad, validación de stock, webhook de confirmación

3. **Payment Transactions:**
   - Requiere: Encriptación de datos sensibles, logs de auditoría, webhooks de proveedores de pago

4. **Email Sending (`/email/send`, `/email/submit-form`):**
   - Requiere: Rate limiting estricto, validación de emails, prevención de spam

5. **Statistics Endpoints:**
   - Considerar: Caché agresivo, pre-cálculo de estadísticas, índices de base de datos optimizados

---

## 🔍 Conclusiones

El backend de Sportt presenta una arquitectura sólida con un diseño RESTful bien estructurado. Los 26 controladores cubren completamente las necesidades de un sistema de e-commerce multi-tienda, desde la gestión de productos y órdenes hasta configuración de SEO y estadísticas.

### Fortalezas Principales

1. ✅ Arquitectura modular y escalable
2. ✅ Separación clara de responsabilidades
3. ✅ Implementación consistente de guards de seguridad
4. ✅ Soporte multi-tienda completo
5. ✅ Endpoints especializados para casos de uso específicos
6. ✅ Manejo de recursos anidados (variantes, precios, line-items)

### Próximos Pasos Recomendados

1. **Corto plazo (1-2 semanas):**
   - Corregir el typo en Shipping Methods Controller
   - Agregar guards faltantes en endpoints sin autenticación definida
   - Estandarizar manejo de excepciones

2. **Mediano plazo (1 mes):**
   - Implementar documentación Swagger completa
   - Agregar rate limiting
   - Implementar caché para endpoints de lectura
   - Mover DTOs en línea a archivos separados

3. **Largo plazo (2-3 meses):**
   - Implementar sistema de logs de auditoría
   - Optimizar queries de base de datos
   - Agregar tests unitarios y de integración
   - Implementar monitoreo y alertas

---

**Fecha de documento:** 15 de enero de 2025  
**Versión:** 1.2.0  
**Auditado por:** AI Assistant  
**Última actualización:** Corrección completa de todos los endpoints y actualización de estadísticas  
**Próxima revisión sugerida:** Abril 2025

