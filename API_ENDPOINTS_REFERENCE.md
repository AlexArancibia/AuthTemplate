# API Endpoints Reference - Sportt Backend

**Base URL:** `https://your-api-domain.com/api`

## Autenticación

La API utiliza dos métodos de autenticación:
- **AuthGuard**: Requiere Bearer Token JWT en el header `Authorization: Bearer {token}`
- **PublicKeyGuard**: Requiere API Key en el header `x-api-key: {apiKey}`

---

## 📋 Índice de Módulos

1. [Authentication](#authentication)
2. [Stores](#stores)
3. [Products](#products)
4. [Categories](#categories)
5. [Collections](#collections)
6. [Orders](#orders)
7. [Coupons](#coupons)
8. [Content](#content)
9. [Shipping Methods](#shipping-methods)
10. [Payment Providers](#payment-providers)
11. [Payment Transactions](#payment-transactions)
12. [Refunds](#refunds)
13. [Hero Sections](#hero-sections)
14. [Card Sections](#card-sections)
15. [Client Logo Sections](#client-logo-sections)
16. [Team Sections](#team-sections)
17. [Frequently Bought Together](#frequently-bought-together)
18. [Currencies](#currencies)
19. [Exchange Rates](#exchange-rates)
20. [SEO Config](#seo-config)
21. [Statistics](#statistics)
22. [Kardex](#kardex)
23. [Files](#files)
24. [Email](#email)

---

## Authentication

### Register User
```
POST /auth/register
Auth: PublicKeyGuard
```

### Login User
```
POST /auth/login
Auth: PublicKeyGuard
```

### Get All Users
```
GET /auth
Auth: AuthGuard
```

### Get Users by Store
```
GET /auth/store/:storeId
Auth: AuthGuard
```

### Get User by ID
```
GET /auth/:id
Auth: AuthGuard
```

### Update User
```
PATCH /auth/:id
Auth: AuthGuard
```

### Delete User
```
DELETE /auth/:id
Auth: AuthGuard
```

---

## Stores

### Create Store
```
POST /stores
Auth: AuthGuard
```

### Get All Stores
```
GET /stores
Auth: AuthGuard
Query Params: page, limit, sortBy, sortOrder
Pagination: Default limit=20, max=100
```

### Get Store by Slug
```
GET /stores/by-slug/:slug
Auth: PublicKeyGuard
```

### Get Stores by Owner
```
GET /stores/owner/:ownerId
Auth: AuthGuard
Query Params: page, limit, sortBy, sortOrder
```

### Get Store by ID
```
GET /stores/:id
Auth: PublicKeyGuard
```

### Update Store
```
PATCH /stores/:id
Auth: AuthGuard
```

### Delete Store
```
DELETE /stores/:id
Auth: AuthGuard
```

### Create API Key
```
POST /stores/api-keys
Auth: AuthGuard
```

### Get API Keys
```
GET /stores/:storeId/api-keys
Auth: AuthGuard
```

### Delete API Key
```
DELETE /stores/:storeId/api-keys/:keyId
Auth: AuthGuard
```

### Get Store Statistics
```
GET /stores/:storeId/statistics
Auth: PublicKeyGuard
```

### Verify API Key
```
POST /stores/verify-api-key
Auth: PublicKeyGuard
Body: { apiKey: string }
```

---

## Products

### Get Products by Store
```
GET /products/:storeId
Auth: PublicKeyGuard
Query Params:
  - query: string (search term, max 200 chars)
  - status: ProductStatus[] (ACTIVE, INACTIVE, DRAFT, ARCHIVED)
  - vendor: string (max 100 chars)
  - categorySlugs: string[]
  - collectionIds: string[]
  - page: number (default: 1, min: 1)
  - limit: number (default: 20, min: 1, max: 100)
  - sortBy: string (createdAt, updatedAt, title, price, viewCount)
  - sortOrder: 'asc' | 'desc' (default: 'desc')
  - minPrice: number (≥ 0)
  - maxPrice: number (≥ 0)
  - currencyId: string
Pagination: ✅ Supported
```

### Get Product by Slug
```
GET /products/by-slug/:storeId/:slug
Auth: PublicKeyGuard
```

### Get Product Statistics
```
GET /products/statistics/:storeId
Auth: PublicKeyGuard
```

### Create Product
```
POST /products/:storeId
Auth: AuthGuard
```

### Get Product by ID
```
GET /products/:storeId/:id
Auth: PublicKeyGuard
```

### Update Product
```
PATCH /products/:storeId/:id
Auth: AuthGuard
```

### Update Product Status
```
PATCH /products/:storeId/:id/status
Auth: AuthGuard
Body: { status: ProductStatus }
```

### Delete Product
```
DELETE /products/:storeId/:id
Auth: AuthGuard
```

### Increment Product View Count
```
POST /products/:storeId/:id/view
Auth: PublicKeyGuard
```

### Create Product Variant
```
POST /products/:storeId/:productId/variants
Auth: AuthGuard
```

### Get Variant by ID
```
GET /products/:storeId/variants/:id
Auth: PublicKeyGuard
```

### Update Variant
```
PATCH /products/:storeId/variants/:id
Auth: AuthGuard
```

### Update Variant Product
```
PATCH /products/:storeId/variants/:id/new-product/:productId
Auth: AuthGuard
```

### Delete Variant
```
DELETE /products/:storeId/variants/:id
Auth: AuthGuard
```

### Create Variant Price
```
POST /products/:storeId/variant-prices
Auth: AuthGuard
```

### Get Variant Price
```
GET /products/:storeId/variant-prices/:id
Auth: PublicKeyGuard
```

### Update Variant Price
```
PATCH /products/:storeId/variant-prices/:id
Auth: AuthGuard
```

### Delete Variant Price
```
DELETE /products/:storeId/variant-prices/:id
Auth: AuthGuard
```

---

## Categories

### Create Category
```
POST /categories/:storeId
Auth: AuthGuard
```

### Get Categories by Store
```
GET /categories/:storeId
Auth: PublicKeyGuard
Query Params: page, limit, sortBy, sortOrder
Pagination: ✅ Supported (default limit=20)
```

### Get Category by ID
```
GET /categories/:storeId/:id
Auth: PublicKeyGuard
```

### Update Category
```
PUT /categories/:storeId/:id
Auth: AuthGuard
```

### Delete Category
```
DELETE /categories/:storeId/:id
Auth: AuthGuard
```

---

## Collections

### Create Collection
```
POST /collections/:storeId
Auth: AuthGuard
```

### Get Collections by Store
```
GET /collections/:storeId
Auth: PublicKeyGuard
Query Params:
  - query: string (search term)
  - includeInactive: boolean (default: false)
  - page: number (default: 1, min: 1)
  - limit: number (default: 20, min: 1, max: 100)
  - sortBy: string (default: 'createdAt')
  - sortOrder: 'asc' | 'desc' (default: 'desc')
Pagination: ✅ Supported
```

### Get Collection by ID
```
GET /collections/:storeId/:id
Auth: PublicKeyGuard
```

### Update Collection
```
PATCH /collections/:storeId/:id
Auth: AuthGuard
```

### Delete Collection
```
DELETE /collections/:storeId/:id
Auth: AuthGuard
```

### Add Product to Collection
```
PATCH /collections/:storeId/:id/products/:productId
Auth: AuthGuard
```

### Remove Product from Collection
```
DELETE /collections/:storeId/:id/products/:productId
Auth: AuthGuard
```

---

## Orders

### Create Order
```
POST /orders/:storeId
Auth: PublicKeyGuard
```

### Get Orders by Store
```
GET /orders/:storeId
Auth: PublicKeyGuard
Query Params:
  - financialStatus: OrderFinancialStatus
  - fulfillmentStatus: OrderFulfillmentStatus
  - paymentStatus: PaymentStatus
  - shippingStatus: ShippingStatus
  - startDate: string (ISO date)
  - endDate: string (ISO date)
  - page: number (default: 1, min: 1)
  - limit: number (default: 20, min: 1, max: 100)
  - sortBy: string (default: 'createdAt')
  - sortOrder: 'asc' | 'desc' (default: 'desc')
  - customerEmail: string (TODO: NOT IMPLEMENTED - filter by customer email)
Pagination: ✅ Supported

⚠️ LIMITATION: customerEmail filter not yet implemented in backend
```

### Get Order Statistics
```
GET /orders/:storeId/statistics
Auth: PublicKeyGuard
Query Params: startDate, endDate
```

### Get Order by Number
```
GET /orders/:storeId/number/:orderNumber
Auth: PublicKeyGuard
```

### Get Order by ID
```
GET /orders/:storeId/:id
Auth: PublicKeyGuard
```

### Update Order
```
PUT /orders/:storeId/:id
Auth: PublicKeyGuard
```

### Update Order Status
```
PATCH /orders/:storeId/:id/status
Auth: AuthGuard
Body: {
  financialStatus?: OrderFinancialStatus,
  fulfillmentStatus?: OrderFulfillmentStatus,
  paymentStatus?: PaymentStatus,
  shippingStatus?: ShippingStatus
}
```

### Delete Order
```
DELETE /orders/:storeId/:id
Auth: AuthGuard
```

---

## Coupons

### Create Coupon
```
POST /coupons/:storeId
Auth: AuthGuard
```

### Get Coupons by Store
```
GET /coupons/:storeId
Auth: PublicKeyGuard
Query Params:
  - query: string (search term)
  - includeInactive: boolean (default: false)
  - page: number (default: 1, min: 1)
  - limit: number (default: 20, min: 1, max: 100)
  - sortBy: string (default: 'createdAt')
  - sortOrder: 'asc' | 'desc' (default: 'desc')
Pagination: ✅ Supported
```

### Get Coupon by ID
```
GET /coupons/:storeId/:id
Auth: PublicKeyGuard
```

### Get Coupon by Code
```
GET /coupons/by-code/:storeId/:code
Auth: PublicKeyGuard
```

### Update Coupon
```
PUT /coupons/:storeId/:id
Auth: AuthGuard
```

### Delete Coupon
```
DELETE /coupons/:storeId/:id
Auth: AuthGuard
```

### Validate Coupon
```
POST /coupons/:storeId/validate
Auth: PublicKeyGuard
```

### Apply Coupon
```
PATCH /coupons/:storeId/:id/apply
Auth: AuthGuard
```

---

## Content

### Create Content
```
POST /contents/:storeId
Auth: AuthGuard
```

### Get Content by Store
```
GET /contents/:storeId
Auth: PublicKeyGuard
Query Params:
  - query: string (search term)
  - type: ContentType
  - category: string
  - published: boolean
  - page: number (default: 1, min: 1)
  - limit: number (default: 20, min: 1, max: 100)
  - sortBy: string (default: 'createdAt')
  - sortOrder: 'asc' | 'desc' (default: 'desc')
Pagination: ✅ Supported
```

### Get Content by ID
```
GET /contents/:storeId/:id
Auth: PublicKeyGuard
```

### Get Content by Slug
```
GET /contents/by-slug/:storeId/:slug
Auth: PublicKeyGuard
```

### Update Content
```
PUT /contents/:storeId/:id
Auth: AuthGuard
```

### Publish Content
```
PATCH /contents/:storeId/:id/publish
Auth: AuthGuard
```

### Unpublish Content
```
PATCH /contents/:storeId/:id/unpublish
Auth: AuthGuard
```

### Delete Content
```
DELETE /contents/:storeId/:id
Auth: AuthGuard
```

---

## Shipping Methods

### Get Shipping Methods by Store
```
GET /shipping-methods/:storeId
Auth: PublicKeyGuard
Query Params: page, limit, sortBy, sortOrder
Pagination: ✅ Supported
```

### Get Shipping Methods by Location
```
GET /shipping-methods/store:storeId/location
Auth: PublicKeyGuard
Query Params: countryCode, stateCode, cityName, postalCode
```

### Search Geographic Data
```
GET /shipping-methods/geographic-data/search
Auth: PublicKeyGuard
Query Params:
  - q: string (search term)
  - type: 'country' | 'state' | 'city'
```

### Get Geographic Data
```
GET /shipping-methods/geographic-data/:countryId?/:stateId?
Auth: PublicKeyGuard
```

### Get Shipping Method by ID
```
GET /shipping-methods/:storeId/:id
Auth: PublicKeyGuard
```

### Calculate Shipping Cost
```
GET /shipping-methods/:storeId/:methodId/calculate-cost
Auth: PublicKeyGuard
Query Params: weight, countryCode, stateCode, cityName, postalCode
```

### Create Shipping Method
```
POST /shipping-methods/:storeId
Auth: AuthGuard
```

### Update Shipping Method
```
PATCH /shipping-methods/:storeId/:id
Auth: AuthGuard
```

### Delete Shipping Method
```
DELETE /shipping-methods/:storeId/:id
Auth: AuthGuard
```

---

## Payment Providers

### Create Payment Provider
```
POST /payment-providers
Auth: AuthGuard
```

### Get All Payment Providers
```
GET /payment-providers
Auth: PublicKeyGuard
```

### Get Payment Providers by Store
```
GET /payment-providers/store/:storeId
Auth: PublicKeyGuard
Query Params:
  - includeInactive: boolean
  - type: PaymentProviderType
```

### Get Payment Provider by ID
```
GET /payment-providers/:id
Auth: PublicKeyGuard
```

### Update Payment Provider
```
PUT /payment-providers/:id
Auth: AuthGuard
```

### Activate Payment Provider
```
PATCH /payment-providers/:id/activate
Auth: AuthGuard
```

### Deactivate Payment Provider
```
PATCH /payment-providers/:id/deactivate
Auth: AuthGuard
```

### Delete Payment Provider
```
DELETE /payment-providers/:id
Auth: AuthGuard
```

### Get Payment Provider Statistics
```
GET /payment-providers/:id/statistics
Auth: PublicKeyGuard
```

---

## Payment Transactions

### Create Payment Transaction
```
POST /payment-transactions
Auth: AuthGuard
```

### Get All Payment Transactions
```
GET /payment-transactions
Auth: PublicKeyGuard
Query Params: page, limit, sortBy, sortOrder
Pagination: ✅ Supported
```

### Get Transactions by Order
```
GET /payment-transactions/order/:orderId
Auth: PublicKeyGuard
```

### Get Transactions by Store
```
GET /payment-transactions/store/:storeId
Auth: PublicKeyGuard
Query Params: page, limit, sortBy, sortOrder
Pagination: ✅ Supported
```

### Get Transactions by Provider
```
GET /payment-transactions/provider/:paymentProviderId
Auth: PublicKeyGuard
Query Params: status
```

### Get Transaction by ID
```
GET /payment-transactions/:id
Auth: PublicKeyGuard
```

### Update Transaction
```
PUT /payment-transactions/:id
Auth: AuthGuard
```

### Delete Transaction
```
DELETE /payment-transactions/:id
Auth: AuthGuard
```

### Get Transaction Statistics
```
GET /payment-transactions/statistics/store/:storeId
Auth: PublicKeyGuard
Query Params: startDate, endDate
```

---

## Refunds

### Create Refund
```
POST /refunds
Auth: AuthGuard
```

### Get All Refunds
```
GET /refunds
Auth: PublicKeyGuard
```

### Get Refunds by Order
```
GET /refunds/order/:orderId
Auth: PublicKeyGuard
```

### Get Refunds by Store
```
GET /refunds/store/:storeId
Auth: PublicKeyGuard
```

### Get Refund by ID
```
GET /refunds/:id
Auth: PublicKeyGuard
```

### Update Refund
```
PUT /refunds/:id
Auth: AuthGuard
```

### Delete Refund
```
DELETE /refunds/:id
Auth: AuthGuard
```

### Create Refund Line Item
```
POST /refunds/line-items
Auth: AuthGuard
```

### Get Refund Line Item
```
GET /refunds/line-items/:id
Auth: PublicKeyGuard
```

### Update Refund Line Item
```
PUT /refunds/line-items/:id
Auth: AuthGuard
```

### Delete Refund Line Item
```
DELETE /refunds/line-items/:id
Auth: AuthGuard
```

### Get Refund Statistics
```
GET /refunds/statistics/store/:storeId
Auth: PublicKeyGuard
Query Params: startDate, endDate
```

---

## Hero Sections

### Create Hero Section
```
POST /hero-sections/:storeId
Auth: AuthGuard
```

### Get Hero Sections by Store
```
GET /hero-sections/:storeId
Auth: PublicKeyGuard
Query Params: page, limit, sortBy, sortOrder
Pagination: ✅ Supported
```

### Get Active Hero Sections
```
GET /hero-sections/:storeId/active
Auth: PublicKeyGuard
```

### Get Hero Section by ID
```
GET /hero-sections/:storeId/:id
Auth: PublicKeyGuard
```

### Update Hero Section
```
PUT /hero-sections/:storeId/:id
Auth: AuthGuard
```

### Activate Hero Section
```
PATCH /hero-sections/:storeId/:id/activate
Auth: AuthGuard
```

### Deactivate Hero Section
```
PATCH /hero-sections/:storeId/:id/deactivate
Auth: AuthGuard
```

### Delete Hero Section
```
DELETE /hero-sections/:storeId/:id
Auth: AuthGuard
```

---

## Card Sections

### Create Card Section
```
POST /card-section/:storeId
Auth: AuthGuard
```

### Get Card Sections by Store
```
GET /card-section/:storeId
Auth: PublicKeyGuard
```

### Get Card Section by ID
```
GET /card-section/:storeId/:id
Auth: PublicKeyGuard
```

### Update Card Section
```
PATCH /card-section/:storeId/:id
Auth: AuthGuard
```

### Delete Card Section
```
DELETE /card-section/:storeId/:id
Auth: AuthGuard
```

---

## Client Logo Sections

### Create Client Logo Section
```
POST /client-logo-sections/:storeId
Auth: AuthGuard
```

### Get Client Logo Sections by Store
```
GET /client-logo-sections/:storeId
Auth: PublicKeyGuard
```

### Get Client Logo Section by ID
```
GET /client-logo-sections/:storeId/:id
Auth: PublicKeyGuard
```

### Update Client Logo Section
```
PATCH /client-logo-sections/:storeId/:id
Auth: AuthGuard
```

### Delete Client Logo Section
```
DELETE /client-logo-sections/:storeId/:id
Auth: AuthGuard
```

### Create Client Logo
```
POST /client-logo-sections/:storeId/:sectionId/client-logos
Auth: AuthGuard
```

### Get Client Logo
```
GET /client-logo-sections/:storeId/client-logos/:id
Auth: PublicKeyGuard
```

### Update Client Logo
```
PUT /client-logo-sections/:storeId/client-logos/:id
Auth: AuthGuard
```

### Delete Client Logo
```
DELETE /client-logo-sections/:storeId/client-logos/:id
Auth: AuthGuard
```

---

## Team Sections

### Create Team Section
```
POST /team-sections
Auth: AuthGuard
```

### Get All Team Sections
```
GET /team-sections
Auth: PublicKeyGuard
```

### Get Team Sections by Store
```
GET /team-sections/store/:storeId
Auth: PublicKeyGuard
```

### Get Team Section by ID
```
GET /team-sections/:id
Auth: PublicKeyGuard
```

### Update Team Section
```
PATCH /team-sections/:id
Auth: AuthGuard
```

### Delete Team Section
```
DELETE /team-sections/:id
Auth: AuthGuard
```

---

## Frequently Bought Together

### Create FBT
```
POST /fbt/:storeId
Auth: AuthGuard
```

### Get FBT by Store
```
GET /fbt/:storeId
Auth: PublicKeyGuard
Query Params: page, limit, sortBy, sortOrder
```

### Get FBT by ID
```
GET /fbt/:storeId/:id
Auth: PublicKeyGuard
```

### Update FBT
```
PATCH /fbt/:storeId/:id
Auth: AuthGuard
```

### Delete FBT
```
DELETE /fbt/:storeId/:id
Auth: AuthGuard
```

---

## Currencies

### Create Currency
```
POST /currencies
Auth: AuthGuard
```

### Get All Currencies
```
GET /currencies
Auth: PublicKeyGuard
Query Params: page, limit, sortBy, sortOrder
Pagination: ✅ Supported
```

### Get Currency by ID
```
GET /currencies/:id
Auth: PublicKeyGuard
```

### Get Currency by Code
```
GET /currencies/by-code/:code
Auth: PublicKeyGuard
```

### Update Currency
```
PATCH /currencies/:id
Auth: AuthGuard
```

### Delete Currency
```
DELETE /currencies/:id
Auth: AuthGuard
```

---

## Exchange Rates

### Create Exchange Rate
```
POST /exchange-rates
Auth: AuthGuard
```

### Get All Exchange Rates
```
GET /exchange-rates
Auth: PublicKeyGuard
Query Params: page, limit, sortBy, sortOrder
Pagination: ✅ Supported
```

### Get Exchange Rate by ID
```
GET /exchange-rates/:id
Auth: PublicKeyGuard
```

### Update Exchange Rate
```
PATCH /exchange-rates/:id
Auth: AuthGuard
```

### Delete Exchange Rate
```
DELETE /exchange-rates/:id
Auth: AuthGuard
```

---

## SEO Config

### Create SEO Config
```
POST /seo-config/:storeId
Auth: AuthGuard
```

### Get SEO Configs by Store
```
GET /seo-config/:storeId
Auth: PublicKeyGuard
```

### Get SEO Config by ID
```
GET /seo-config/:storeId/:id
Auth: PublicKeyGuard
```

### Update SEO Config
```
PATCH /seo-config/:storeId/:id
Auth: AuthGuard
```

### Delete SEO Config
```
DELETE /seo-config/:storeId/:id
Auth: AuthGuard
```

---

## Statistics

### Get Statistics
```
GET /statistics
Auth: AuthGuard (Bearer Token)
Query Params:
  - storeId: string (required)
  - startDate: string (ISO date)
  - endDate: string (ISO date)
```

---

## Kardex

### Get Kardex General
```
GET /kardex/general
Auth: Public
Query Params:
  - storeId: string (required)
  - productId: string (optional)
  - variantId: string (optional)
  - startDate: string (optional)
  - endDate: string (optional)
```

---

## Files

### Upload File
```
POST /file/upload
Auth: AuthGuard
Content-Type: multipart/form-data
Max Size: 1MB
Allowed: Images only
```

### List Files
```
GET /file/list
Auth: AuthGuard
```

### Delete File
```
DELETE /file/delete/:filename
Auth: AuthGuard
```

---

## Email

### Send Email
```
POST /email/send
Auth: PublicKeyGuard
Body: {
  to: string,
  subject: string,
  html: string,
  from?: { name?: string, address?: string }
}
```

### Submit Form
```
POST /email/submit-form
Auth: PublicKeyGuard
Body: { [key: string]: string }
```

---

## 📊 Paginación Estándar

La mayoría de los endpoints GET que devuelven listas soportan paginación con los siguientes parámetros:

### Query Parameters
- **page**: Número de página (default: 1, min: 1)
- **limit**: Elementos por página (default: 20, min: 1, max: 100)
- **sortBy**: Campo por el cual ordenar (default: 'createdAt')
- **sortOrder**: Orden ascendente o descendente ('asc' | 'desc', default: 'desc')

### Response Format
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 🔑 Headers Requeridos

### Para AuthGuard (Admin/Dashboard)
```
Authorization: Bearer {jwt_token}
```

### Para PublicKeyGuard (Frontend público)
```
x-api-key: {api_key}
```

---

## ⚠️ Notas Importantes

1. **Store ID**: La mayoría de los endpoints requieren un `storeId` en la ruta o como parámetro
2. **Validación**: El storeId en la ruta debe coincidir con el storeId en el body cuando aplique
3. **Límites**: Los límites de paginación están entre 1 y 100 elementos por página
4. **Filtros**: Muchos endpoints soportan filtros adicionales mediante query params
5. **Slugs**: Algunos recursos como productos, contenido y stores pueden consultarse por slug
6. **Estadísticas**: Varios módulos ofrecen endpoints de estadísticas con rangos de fecha opcionales

---

## 📝 Ejemplos de Uso

### Obtener productos con filtros y paginación
```
GET /products/store/{storeId}?page=1&limit=20&status=ACTIVE&sortBy=price&sortOrder=asc&query=shoes
```

### Obtener órdenes por rango de fechas
```
GET /orders/{storeId}?startDate=2025-01-01&endDate=2025-12-31&page=1&limit=50&financialStatus=PAID
```

### Buscar contenido publicado
```
GET /contents/{storeId}?published=true&type=BLOG&page=1&limit=10
```

---

**Última actualización:** Octubre 2025
**Versión API:** 1.0.0

