# API Endpoints Reference - Sportt Backend

**Base URL:** Configurar según entorno (variable de entorno o `.env` en el frontend). Ejemplo: `https://your-api-domain.com/api`

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

**Request Body:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 characters)",
  "phone": "string (optional)",
  "role": "UserRole (optional, default: CUSTOMER_SERVICE)",
  "authProvider": "AuthProvider (optional, default: EMAIL)",
  "storeId": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string | null",
  "role": "UserRole",
  "authProvider": "AuthProvider",
  "image": "string | null",
  "bio": "string | null",
  "emailVerified": "Date | null",
  "lastLogin": "Date | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### Login User
```
POST /auth/login
Auth: PublicKeyGuard
```

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 6 characters)"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "string (JWT token)",
  "userInfo": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "UserRole",
    "phone": "string | null",
    "image": "string | null",
    "bio": "string | null",
    "emailVerified": "Date | null",
    "lastLogin": "Date",
    "createdAt": "Date",
    "updatedAt": "Date"
  }
}
```

---

### Get All Users
```
GET /auth
Auth: AuthGuard
```

**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "UserRole",
    "image": "string | null",
    "phone": "string | null",
    "bio": "string | null",
    "emailVerified": "Date | null",
    "lastLogin": "Date | null",
    "createdAt": "Date",
    "updatedAt": "Date",
    "stores": [{ "id": "string" }]
  }
]
```

---

### Get Users by Store
```
GET /auth/store/:storeId
Auth: AuthGuard
```

**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "UserRole",
    "image": "string | null",
    "phone": "string | null",
    "createdAt": "Date",
    "updatedAt": "Date"
  }
]
```

---

### Get User by ID
```
GET /auth/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "UserRole",
  "image": "string | null",
  "phone": "string | null",
  "bio": "string | null",
  "emailVerified": "Date | null",
  "lastLogin": "Date | null",
  "createdAt": "Date",
  "updatedAt": "Date",
  "stores": [
    {
      "id": "string",
      "name": "string",
      "slug": "string"
    }
  ]
}
```

---

### Update User
```
PATCH /auth/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional)
```json
{
  "email": "string (optional, valid email)",
  "password": "string (optional, min 6 characters, current password)",
  "newPassword": "string (optional, min 6 characters)",
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "role": "UserRole (optional)",
  "image": "string (optional)",
  "phone": "string (optional)",
  "bio": "string (optional)",
  "preferences": "object (optional)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "UserRole",
  "image": "string | null",
  "phone": "string | null",
  "bio": "string | null",
  "updatedAt": "Date"
}
```

---

### Delete User
```
DELETE /auth/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "User deleted successfully"
}
```

---

## Stores

### Create Store
```
POST /stores
Auth: AuthGuard
```

**Request Body:**
```json
{
  "name": "string (required, max 100 chars)",
  "slug": "string (required, max 100 chars, lowercase, numbers, hyphens only)",
  "ownerId": "string (required)",
  "isActive": "boolean (optional, default: true)",
  "maxProducts": "number (optional, min: 0)",
  "planType": "string (optional, max 50 chars)",
  "planExpiryDate": "Date (optional)",
  "apiKeys": "object (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "ownerId": "string",
  "isActive": "boolean",
  "maxProducts": "number | null",
  "planType": "string | null",
  "planExpiryDate": "Date | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### Get All Stores
```
GET /stores
Auth: AuthGuard
Query Params: page, limit, sortBy, sortOrder
Pagination: Default limit=20, max=100
```

**Query Parameters:**
- `page`: number (default: 1, min: 1)
- `limit`: number (default: 20, min: 1, max: 100)
- `sortBy`: string (default: 'createdAt')
- `sortOrder`: 'asc' | 'desc' (default: 'desc')

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "slug": "string",
      "ownerId": "string",
      "isActive": "boolean",
      "maxProducts": "number | null",
      "planType": "string | null",
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

---

### Get Store by Slug
```
GET /stores/by-slug/:slug
Auth: PublicKeyGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "ownerId": "string",
  "isActive": "boolean",
  "maxProducts": "number | null",
  "planType": "string | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### Get Stores by Owner
```
GET /stores/owner/:ownerId
Auth: AuthGuard
Query Params: page, limit, sortBy, sortOrder
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "slug": "string",
      "isActive": "boolean",
      "createdAt": "Date"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

---

### Get Store by ID
```
GET /stores/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "ownerId": "string",
  "isActive": "boolean",
  "maxProducts": "number | null",
  "planType": "string | null",
  "planExpiryDate": "Date | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### Update Store
```
PATCH /stores/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional)
```json
{
  "name": "string (optional, max 100 chars)",
  "slug": "string (optional, max 100 chars)",
  "isActive": "boolean (optional)",
  "maxProducts": "number (optional)",
  "planType": "string (optional)",
  "planExpiryDate": "Date (optional)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "isActive": "boolean",
  "updatedAt": "Date"
}
```

---

### Delete Store
```
DELETE /stores/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Store deleted successfully"
}
```

---

### Create API Key
```
POST /stores/api-keys
Auth: AuthGuard
```

**Request Body:**
```json
{
  "storeId": "string (required)",
  "name": "string (required)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "key": "string",
  "name": "string",
  "storeId": "string",
  "createdAt": "Date"
}
```

---

### Get API Keys
```
GET /stores/:storeId/api-keys
Auth: AuthGuard
```

**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "name": "string",
    "key": "string (partially masked)",
    "createdAt": "Date",
    "lastUsed": "Date | null"
  }
]
```

---

### Delete API Key
```
DELETE /stores/:storeId/api-keys/:keyId
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "API Key deleted successfully"
}
```

---

### Get Store Statistics
```
GET /stores/:storeId/statistics
Auth: PublicKeyGuard
```

**Response:** `200 OK`
```json
{
  "totalProducts": "number",
  "totalOrders": "number",
  "totalRevenue": "number",
  "totalCustomers": "number"
}
```

---

### Verify API Key
```
POST /stores/verify-api-key
Auth: PublicKeyGuard
```

**Request Body:**
```json
{
  "apiKey": "string (required)"
}
```

**Response:** `200 OK`
```json
{
  "valid": "boolean",
  "storeId": "string",
  "storeName": "string"
}
```

---

## Products

### Get Products by Store
```
GET /products/store/:storeId
Auth: PublicKeyGuard
Query Params:
  - query: string (search term, max 200 chars)
  - status: ProductStatus[] (DRAFT, ACTIVE, ARCHIVED)
  - vendor: string (max 100 chars)
  - categoryIds: string[]
  - collectionIds: string[]
  - page: number (default: 1, min: 1)
  - limit: number (default: 20, min: 1, max: 100)
  - sortBy: string (createdAt, updatedAt, title, price, viewCount)
  - sortOrder: 'asc' | 'desc' (default: 'desc')
Pagination: ✅ Supported
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "slug": "string",
      "description": "string | null",
      "vendor": "string | null",
      "status": "ProductStatus",
      "imageUrls": "string[]",
      "viewCount": "number",
      "createdAt": "Date",
      "updatedAt": "Date",
      "variants": [
        {
          "id": "string",
          "title": "string",
          "sku": "string | null",
          "inventoryQuantity": "number",
          "prices": [
            {
              "price": "number",
              "originalPrice": "number | null",
              "currency": {
                "code": "string",
                "symbol": "string"
              }
            }
          ]
        }
      ]
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

---

### Get Product by Slug
```
GET /products/by-slug/:storeId/:slug
Auth: PublicKeyGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "title": "string",
  "slug": "string",
  "description": "string | null",
  "vendor": "string | null",
  "status": "ProductStatus",
  "allowBackorder": "boolean",
  "releaseDate": "Date | null",
  "restockThreshold": "number | null",
  "restockNotify": "boolean | null",
  "imageUrls": "string[]",
  "metaTitle": "string | null",
  "metaDescription": "string | null",
  "viewCount": "number",
  "createdAt": "Date",
  "updatedAt": "Date",
  "categories": [
    {
      "id": "string",
      "name": "string",
      "slug": "string"
    }
  ],
  "collections": [
    {
      "id": "string",
      "title": "string",
      "slug": "string"
    }
  ],
  "variants": [
    {
      "id": "string",
      "title": "string",
      "sku": "string | null",
      "imageUrls": "string[]",
      "inventoryQuantity": "number",
      "weightValue": "number | null",
      "isActive": "boolean",
      "position": "number",
      "attributes": "object",
      "prices": [
        {
          "id": "string",
          "price": "number",
          "originalPrice": "number | null",
          "currencyId": "string",
          "currency": {
            "code": "string",
            "symbol": "string",
            "name": "string"
          }
        }
      ]
    }
  ]
}
```

---

### Get Product Statistics
```
GET /products/statistics/:storeId
Auth: PublicKeyGuard
```

**Response:** `200 OK`
```json
{
  "totalProducts": "number",
  "activeProducts": "number",
  "draftProducts": "number",
  "archivedProducts": "number",
  "lowStockProducts": "number"
}
```

---

### Create Product
```
POST /products/:storeId
Auth: AuthGuard
```

**Request Body:**
```json
{
  "title": "string (required, max 200 chars)",
  "slug": "string (required, lowercase, numbers, hyphens only, max 100 chars)",
  "description": "string (optional, max 2000 chars)",
  "vendor": "string (optional, max 100 chars)",
  "allowBackorder": "boolean (optional, default: false)",
  "releaseDate": "Date (optional)",
  "status": "ProductStatus (optional, default: ACTIVE)",
  "restockThreshold": "number (optional, min: 0)",
  "restockNotify": "boolean (optional)",
  "categoryIds": "string[] (optional, max 10 items)",
  "collectionIds": "string[] (optional, max 5 items)",
  "imageUrls": "string[] (optional, max 10 items)",
  "metaTitle": "string (optional, max 60 chars)",
  "metaDescription": "string (optional, max 160 chars)",
  "variants": [
    {
      "title": "string (required, max 100 chars)",
      "sku": "string (optional, uppercase, numbers, hyphens, underscores only, max 50 chars)",
      "imageUrls": "string[] (optional, max 5 items)",
      "inventoryQuantity": "number (optional, min: 0)",
      "weightValue": "number (optional, min: 0)",
      "isActive": "boolean (optional, default: true)",
      "position": "number (optional, min: 0)",
      "attributes": "object (optional)",
      "prices": [
        {
          "currencyId": "string (required)",
          "price": "number (required, positive, min: 0.01)",
          "originalPrice": "number (optional, positive, min: 0.01)"
        }
      ]
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "title": "string",
  "slug": "string",
  "status": "ProductStatus",
  "createdAt": "Date",
  "variants": [
    {
      "id": "string",
      "title": "string",
      "sku": "string | null"
    }
  ]
}
```

---

### Get Product by ID
```
GET /products/:storeId/:id
Auth: PublicKeyGuard
```

**Response:** Same as Get Product by Slug

---

### Update Product
```
PUT /products/:storeId/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional, same structure as Create Product)

**Response:** `200 OK`
```json
{
  "id": "string",
  "title": "string",
  "slug": "string",
  "updatedAt": "Date"
}
```

---

### Update Product Status
```
PATCH /products/:storeId/:id/status
Auth: AuthGuard
```

**Request Body:**
```json
{
  "status": "ProductStatus (required: ACTIVE, INACTIVE, DRAFT, ARCHIVED)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "status": "ProductStatus",
  "updatedAt": "Date"
}
```

---

### Delete Product
```
DELETE /products/:storeId/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Product deleted successfully"
}
```

---

### Increment Product View Count
```
POST /products/:storeId/:id/view
Auth: PublicKeyGuard
```

**Response:** `200 OK`
```json
{
  "viewCount": "number"
}
```

---

### Create Product Variant
```
POST /products/:storeId/:productId/variants
Auth: AuthGuard
```

**Request Body:**
```json
{
  "title": "string (required, max 100 chars)",
  "sku": "string (optional, max 50 chars)",
  "imageUrls": "string[] (optional, max 5 items)",
  "inventoryQuantity": "number (optional, min: 0)",
  "weightValue": "number (optional, min: 0)",
  "isActive": "boolean (optional, default: true)",
  "position": "number (optional, min: 0)",
  "attributes": "object (optional)",
  "prices": [
    {
      "currencyId": "string (required)",
      "price": "number (required, positive)",
      "originalPrice": "number (optional, positive)"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "title": "string",
  "sku": "string | null",
  "productId": "string",
  "createdAt": "Date"
}
```

---

### Get Variant by ID
```
GET /products/:storeId/variants/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "title": "string",
  "sku": "string | null",
  "imageUrls": "string[]",
  "inventoryQuantity": "number",
  "weightValue": "number | null",
  "isActive": "boolean",
  "position": "number",
  "attributes": "object",
  "productId": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "prices": [
    {
      "id": "string",
      "price": "number",
      "originalPrice": "number | null",
      "currency": {
        "code": "string",
        "symbol": "string"
      }
    }
  ]
}
```

---

### Update Variant
```
PUT /products/:storeId/variants/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional)
```json
{
  "title": "string (optional)",
  "sku": "string (optional)",
  "imageUrls": "string[] (optional)",
  "inventoryQuantity": "number (optional)",
  "weightValue": "number (optional)",
  "isActive": "boolean (optional)",
  "position": "number (optional)",
  "attributes": "object (optional)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "title": "string",
  "updatedAt": "Date"
}
```

---

### Update Variant Product
```
PATCH /products/:storeId/variants/:id/new-product/:productId
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "productId": "string",
  "message": "Variant moved to new product successfully"
}
```

---

### Delete Variant
```
DELETE /products/:storeId/variants/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Variant deleted successfully"
}
```

---

### Create Variant Price
```
POST /products/:storeId/variant-prices
Auth: AuthGuard
```

**Request Body:**
```json
{
  "variantId": "string (required)",
  "currencyId": "string (required)",
  "price": "number (required, positive, min: 0.01)",
  "originalPrice": "number (optional, positive, min: 0.01)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "variantId": "string",
  "currencyId": "string",
  "price": "number",
  "originalPrice": "number | null",
  "createdAt": "Date"
}
```

---

### Get Variant Price
```
GET /products/:storeId/variant-prices/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "variantId": "string",
  "currencyId": "string",
  "price": "number",
  "originalPrice": "number | null",
  "currency": {
    "code": "string",
    "symbol": "string",
    "name": "string"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### Update Variant Price
```
PUT /products/:storeId/variant-prices/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional)
```json
{
  "price": "number (optional, positive)",
  "originalPrice": "number (optional, positive)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "price": "number",
  "originalPrice": "number | null",
  "updatedAt": "Date"
}
```

---

### Delete Variant Price
```
DELETE /products/:storeId/variant-prices/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Variant price deleted successfully"
}
```

---

## Categories

### Create Category
```
POST /categories/:storeId
Auth: AuthGuard
```

**Request Body:**
```json
{
  "name": "string (required, max 100 chars)",
  "slug": "string (required, lowercase, numbers, hyphens only, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "imageUrl": "string (optional, valid URL)",
  "storeId": "string (required)",
  "parentId": "string (optional)",
  "metaTitle": "string (optional, max 100 chars)",
  "metaDescription": "string (optional, max 200 chars)",
  "priority": "number (optional, integer)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "description": "string | null",
  "imageUrl": "string | null",
  "storeId": "string",
  "parentId": "string | null",
  "metaTitle": "string | null",
  "metaDescription": "string | null",
  "priority": "number | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### Get Categories by Store
```
GET /categories/:storeId
Auth: PublicKeyGuard
Query Params: page, limit, sortBy, sortOrder
Pagination: ✅ Supported (default limit=20)
```

**Query Parameters:**
- `page`: number (default: 1, min: 1)
- `limit`: number (default: 20, min: 1, max: 100)
- `sortBy`: string (default: 'createdAt')
- `sortOrder`: 'asc' | 'desc' (default: 'desc')

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "slug": "string",
      "description": "string | null",
      "imageUrl": "string | null",
      "parentId": "string | null",
      "priority": "number | null",
      "createdAt": "Date",
      "updatedAt": "Date",
      "_count": {
        "products": "number"
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

---

### Get Category by ID
```
GET /categories/:storeId/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "description": "string | null",
  "imageUrl": "string | null",
  "storeId": "string",
  "parentId": "string | null",
  "metaTitle": "string | null",
  "metaDescription": "string | null",
  "priority": "number | null",
  "createdAt": "Date",
  "updatedAt": "Date",
  "parent": {
    "id": "string",
    "name": "string",
    "slug": "string"
  } | null,
  "children": [
    {
      "id": "string",
      "name": "string",
      "slug": "string"
    }
  ],
  "_count": {
    "products": "number"
  }
}
```

---

### Update Category
```
PUT /categories/:storeId/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional)
```json
{
  "name": "string (optional, max 100 chars)",
  "slug": "string (optional, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "imageUrl": "string (optional)",
  "parentId": "string (optional)",
  "metaTitle": "string (optional, max 100 chars)",
  "metaDescription": "string (optional, max 200 chars)",
  "priority": "number (optional)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "updatedAt": "Date"
}
```

---

### Delete Category
```
DELETE /categories/:storeId/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Category deleted successfully"
}
```

---

## Collections

### Create Collection
```
POST /collections/:storeId
Auth: AuthGuard
```

**Request Body:**
```json
{
  "title": "string (required, max 100 chars)",
  "slug": "string (required, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "imageUrl": "string (optional, valid URL)",
  "storeId": "string (required)",
  "isFeatured": "boolean (optional, default: false)",
  "metaTitle": "string (optional, max 100 chars)",
  "metaDescription": "string (optional, max 200 chars)",
  "products": [
    {
      "productId": "string (required)",
      "priority": "number (optional, default: 0)"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "title": "string",
  "slug": "string",
  "description": "string | null",
  "imageUrl": "string | null",
  "storeId": "string",
  "isFeatured": "boolean",
  "metaTitle": "string | null",
  "metaDescription": "string | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

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

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "slug": "string",
      "description": "string | null",
      "imageUrl": "string | null",
      "isFeatured": "boolean",
      "createdAt": "Date",
      "updatedAt": "Date",
      "_count": {
        "products": "number"
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

---

### Get Collection by ID
```
GET /collections/:storeId/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "title": "string",
  "slug": "string",
  "description": "string | null",
  "imageUrl": "string | null",
  "storeId": "string",
  "isFeatured": "boolean",
  "metaTitle": "string | null",
  "metaDescription": "string | null",
  "createdAt": "Date",
  "updatedAt": "Date",
  "products": [
    {
      "productId": "string",
      "priority": "number",
      "product": {
        "id": "string",
        "title": "string",
        "slug": "string",
        "imageUrls": "string[]",
        "status": "ProductStatus"
      }
    }
  ]
}
```

---

### Update Collection
```
PATCH /collections/:storeId/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional)
```json
{
  "title": "string (optional, max 100 chars)",
  "slug": "string (optional, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "imageUrl": "string (optional)",
  "isFeatured": "boolean (optional)",
  "metaTitle": "string (optional, max 100 chars)",
  "metaDescription": "string (optional, max 200 chars)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "title": "string",
  "slug": "string",
  "updatedAt": "Date"
}
```

---

### Delete Collection
```
DELETE /collections/:storeId/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Collection deleted successfully"
}
```

---

### Add Product to Collection
```
PATCH /collections/:storeId/:id/products/:productId
Auth: AuthGuard
```

**Request Body:** (Optional)
```json
{
  "priority": "number (optional, default: 0)"
}
```

**Response:** `200 OK`
```json
{
  "message": "Product added to collection successfully",
  "collectionId": "string",
  "productId": "string",
  "priority": "number"
}
```

---

### Remove Product from Collection
```
DELETE /collections/:storeId/:id/products/:productId
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Product removed from collection successfully"
}
```

---

## Orders

### Create Order
```
POST /orders/:storeId
Auth: PublicKeyGuard
```

**Request Body:**
```json
{
  "storeId": "string (required)",
  "orderNumber": "number (required)",
  "customerInfo": "object (required)",
  "financialStatus": "OrderFinancialStatus (optional)",
  "fulfillmentStatus": "OrderFulfillmentStatus (optional)",
  "currencyId": "string (required)",
  "totalPrice": "number (required, positive)",
  "subtotalPrice": "number (required, positive)",
  "totalTax": "number (required)",
  "totalDiscounts": "number (required)",
  "lineItems": [
    {
      "variantId": "string (optional)",
      "title": "string (required)",
      "quantity": "number (required, positive)",
      "price": "number (required, positive)",
      "totalDiscount": "number (optional, default: 0)"
    }
  ],
  "shippingAddress": "object (optional)",
  "billingAddress": "object (optional)",
  "couponId": "string (optional)",
  "paymentProviderId": "string (optional)",
  "paymentStatus": "PaymentStatus (optional)",
  "paymentDetails": "object (optional)",
  "shippingMethodId": "string (optional)",
  "shippingStatus": "ShippingStatus (optional, default: PENDING)",
  "trackingNumber": "string (optional)",
  "trackingUrl": "string (optional, valid URL)",
  "estimatedDeliveryDate": "Date (optional)",
  "shippedAt": "Date (optional)",
  "deliveredAt": "Date (optional)",
  "customerNotes": "string (optional)",
  "internalNotes": "string (optional)",
  "source": "string (optional)",
  "preferredDeliveryDate": "Date (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "orderNumber": "number",
  "storeId": "string",
  "totalPrice": "number",
  "financialStatus": "OrderFinancialStatus",
  "fulfillmentStatus": "OrderFulfillmentStatus",
  "createdAt": "Date"
}
```

---

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
Pagination: ✅ Supported
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "string",
      "orderNumber": "number",
      "customerInfo": "object",
      "totalPrice": "number",
      "financialStatus": "OrderFinancialStatus",
      "fulfillmentStatus": "OrderFulfillmentStatus",
      "paymentStatus": "PaymentStatus",
      "shippingStatus": "ShippingStatus",
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

---

### Get Order Statistics
```
GET /orders/:storeId/statistics
Auth: PublicKeyGuard
Query Params: startDate, endDate
```

**Response:** `200 OK`
```json
{
  "totalOrders": "number",
  "totalRevenue": "number",
  "averageOrderValue": "number",
  "pendingOrders": "number",
  "completedOrders": "number",
  "cancelledOrders": "number"
}
```

---

### Get Order by Number
```
GET /orders/:storeId/number/:orderNumber
Auth: PublicKeyGuard
```

**Response:** `200 OK` - Same structure as Get Order by ID

---

### Get Order by ID
```
GET /orders/:storeId/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "orderNumber": "number",
  "storeId": "string",
  "customerInfo": "object",
  "financialStatus": "OrderFinancialStatus",
  "fulfillmentStatus": "OrderFulfillmentStatus",
  "currencyId": "string",
  "totalPrice": "number",
  "subtotalPrice": "number",
  "totalTax": "number",
  "totalDiscounts": "number",
  "shippingAddress": "object | null",
  "billingAddress": "object | null",
  "paymentStatus": "PaymentStatus",
  "paymentDetails": "object | null",
  "shippingStatus": "ShippingStatus",
  "trackingNumber": "string | null",
  "trackingUrl": "string | null",
  "estimatedDeliveryDate": "Date | null",
  "shippedAt": "Date | null",
  "deliveredAt": "Date | null",
  "customerNotes": "string | null",
  "internalNotes": "string | null",
  "source": "string | null",
  "preferredDeliveryDate": "Date | null",
  "createdAt": "Date",
  "updatedAt": "Date",
  "lineItems": [
    {
      "id": "string",
      "variantId": "string | null",
      "title": "string",
      "quantity": "number",
      "price": "number",
      "totalDiscount": "number"
    }
  ],
  "currency": {
    "code": "string",
    "symbol": "string"
  },
  "coupon": {
    "id": "string",
    "code": "string"
  } | null,
  "paymentProvider": {
    "id": "string",
    "name": "string"
  } | null,
  "shippingMethod": {
    "id": "string",
    "name": "string"
  } | null
}
```

---

### Update Order
```
PUT /orders/:storeId/:id
Auth: PublicKeyGuard
```

**Request Body:** (All fields optional, same structure as Create Order, plus:)
```json
{
  "addLineItems": [
    {
      "variantId": "string (optional)",
      "title": "string (required)",
      "quantity": "number (required)",
      "price": "number (required)",
      "totalDiscount": "number (optional)"
    }
  ],
  "removeLineItemIds": ["string"]
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "orderNumber": "number",
  "updatedAt": "Date"
}
```

---

### Update Order Status
```
PATCH /orders/:storeId/:id/status
Auth: AuthGuard
```

**Request Body:**
```json
{
  "financialStatus": "OrderFinancialStatus (optional)",
  "fulfillmentStatus": "OrderFulfillmentStatus (optional)",
  "paymentStatus": "PaymentStatus (optional)",
  "shippingStatus": "ShippingStatus (optional)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "financialStatus": "OrderFinancialStatus",
  "fulfillmentStatus": "OrderFulfillmentStatus",
  "paymentStatus": "PaymentStatus",
  "shippingStatus": "ShippingStatus",
  "updatedAt": "Date"
}
```

---

### Delete Order
```
DELETE /orders/:storeId/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Order deleted successfully"
}
```

---

## Coupons

### Create Coupon
```
POST /coupons/:storeId
Auth: AuthGuard
```

**Request Body:**
```json
{
  "code": "string (required, uppercase, numbers, hyphens, underscores only, max 20 chars)",
  "description": "string (optional, max 500 chars)",
  "type": "DiscountType (required: PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING)",
  "value": "number (required if not FREE_SHIPPING, positive, max 2 decimals)",
  "minPurchase": "number (optional, positive)",
  "maxUses": "number (optional, integer, min: 1)",
  "startDate": "Date (required)",
  "endDate": "Date (required)",
  "isActive": "boolean (optional, default: true)",
  "storeId": "string (required)",
  "applicableProductIds": "string[] (optional)",
  "applicableCategoryIds": "string[] (optional)",
  "applicableCollectionIds": "string[] (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "code": "string",
  "description": "string | null",
  "type": "DiscountType",
  "value": "number",
  "minPurchase": "number | null",
  "maxUses": "number | null",
  "usedCount": "number",
  "startDate": "Date",
  "endDate": "Date",
  "isActive": "boolean",
  "storeId": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

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

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "string",
      "code": "string",
      "description": "string | null",
      "type": "DiscountType",
      "value": "number",
      "minPurchase": "number | null",
      "maxUses": "number | null",
      "usedCount": "number",
      "startDate": "Date",
      "endDate": "Date",
      "isActive": "boolean",
      "createdAt": "Date"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

---

### Get Coupon by ID
```
GET /coupons/:storeId/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "code": "string",
  "description": "string | null",
  "type": "DiscountType",
  "value": "number",
  "minPurchase": "number | null",
  "maxUses": "number | null",
  "usedCount": "number",
  "startDate": "Date",
  "endDate": "Date",
  "isActive": "boolean",
  "storeId": "string",
  "createdAt": "Date",
  "updatedAt": "Date",
  "applicableProducts": [
    {
      "id": "string",
      "title": "string"
    }
  ],
  "applicableCategories": [
    {
      "id": "string",
      "name": "string"
    }
  ],
  "applicableCollections": [
    {
      "id": "string",
      "title": "string"
    }
  ]
}
```

---

### Get Coupon by Code
```
GET /coupons/by-code/:storeId/:code
Auth: PublicKeyGuard
```

**Response:** `200 OK` - Same structure as Get Coupon by ID

---

### Update Coupon
```
PUT /coupons/:storeId/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional, same structure as Create Coupon)

**Response:** `200 OK`
```json
{
  "id": "string",
  "code": "string",
  "updatedAt": "Date"
}
```

---

### Delete Coupon
```
DELETE /coupons/:storeId/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Coupon deleted successfully"
}
```

---

### Validate Coupon
```
POST /coupons/:storeId/validate
Auth: PublicKeyGuard
```

**Request Body:**
```json
{
  "code": "string (required)",
  "storeId": "string (required)",
  "cartTotal": "number (required, positive)",
  "productIds": "string[] (optional)",
  "categoryIds": "string[] (optional)",
  "collectionIds": "string[] (optional)"
}
```

**Response:** `200 OK`
```json
{
  "valid": "boolean",
  "coupon": {
    "id": "string",
    "code": "string",
    "type": "DiscountType",
    "value": "number"
  },
  "discountAmount": "number",
  "message": "string"
}
```

---

### Apply Coupon
```
PATCH /coupons/:storeId/:id/apply
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "code": "string",
  "usedCount": "number",
  "message": "Coupon applied successfully"
}
```

---

## Content

### Create Content
```
POST /contents/:storeId
Auth: AuthGuard
```

**Request Body:**
```json
{
  "title": "string (required, max 200 chars)",
  "slug": "string (required, max 200 chars)",
  "body": "string (optional)",
  "type": "ContentType (required: BLOG, PAGE, ARTICLE, etc.)",
  "storeId": "string (required)",
  "authorId": "string (optional)",
  "category": "string (optional, max 100 chars)",
  "published": "boolean (optional, default: false)",
  "publishedAt": "Date (optional)",
  "featuredImage": "string (optional, valid URL)",
  "metadata": "object (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "title": "string",
  "slug": "string",
  "type": "ContentType",
  "published": "boolean",
  "createdAt": "Date"
}
```

---

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

**Response:** `200 OK` (With pagination)

---

### Get Content by ID
```
GET /contents/:storeId/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK` (Full content object)

---

### Get Content by Slug
```
GET /contents/by-slug/:storeId/:slug
Auth: PublicKeyGuard
```

**Response:** `200 OK` (Full content object)

---

### Update Content
```
PUT /contents/:storeId/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional, same structure as Create)

**Response:** `200 OK`

---

### Publish Content
```
PATCH /contents/:storeId/:id/publish
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "published": true,
  "publishedAt": "Date"
}
```

---

### Unpublish Content
```
PATCH /contents/:storeId/:id/unpublish
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "published": false
}
```

---

### Delete Content
```
DELETE /contents/:storeId/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Content deleted successfully"
}
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

**Response:** `200 OK` (With pagination, list of shipping methods)

---

### Get Shipping Methods by Location
```
GET /shipping-methods/store/:storeId/location
Auth: PublicKeyGuard
Query Params: countryCode, stateCode, cityName, postalCode
```

**Response:** `200 OK` (Filtered shipping methods for location)

---

### Search Geographic Data
```
GET /shipping-methods/geographic-data/search
Auth: PublicKeyGuard
Query Params:
  - q: string (search term)
  - type: 'country' | 'state' | 'city'
```

**Response:** `200 OK` (Geographic data matching search)

---

### Get Geographic Data
```
GET /shipping-methods/geographic-data/:countryId?/:stateId?
Auth: PublicKeyGuard
```

**Response:** `200 OK` (Geographic hierarchy data)

---

### Get Shipping Method by ID
```
GET /shipping-methods/:storeId/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK` (Full shipping method details with prices)

---

### Calculate Shipping Cost
```
GET /shipping-methods/:storeId/:methodId/calculate-cost
Auth: PublicKeyGuard
Query Params: weight, countryCode, stateCode, cityName, postalCode
```

**Response:** `200 OK`
```json
{
  "cost": "number",
  "currency": "string",
  "estimatedDays": "number"
}
```

---

### Create Shipping Method
```
POST /shipping-methods/:storeId
Auth: AuthGuard
```

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "minDeliveryDays": "number (optional, integer)",
  "maxDeliveryDays": "number (optional, integer)",
  "estimatedDeliveryTime": "string (optional)",
  "availableDays": "string[] (optional, weekdays)",
  "cutOffTime": "string (optional, HH:MM format)",
  "maxWeight": "number (optional)",
  "isActive": "boolean (optional)",
  "prices": [
    {
      "currencyId": "string (required)",
      "price": "number (required)",
      "zoneName": "string (optional)",
      "zoneDescription": "string (optional)",
      "countryCodes": "string[] (optional)",
      "stateCodes": "string[] (optional)",
      "cityNames": "string[] (optional)",
      "postalCodes": "string[] (optional)",
      "postalCodePatterns": "string[] (optional)",
      "freeShippingThreshold": "number (optional)",
      "pricePerKg": "number (optional)",
      "freeWeightLimit": "number (optional)",
      "zonePriority": "number (optional)",
      "isZoneActive": "boolean (optional)"
    }
  ]
}
```

**Response:** `201 Created`

---

### Update Shipping Method
```
PATCH /shipping-methods/:storeId/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional, same structure as Create)

**Response:** `200 OK`

---

### Delete Shipping Method
```
DELETE /shipping-methods/:storeId/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Shipping method deleted successfully"
}
```

---

## Payment Providers

### Create Payment Provider
```
POST /payment-providers
Auth: AuthGuard
```

**Request Body:**
```json
{
  "name": "string (required, max 100 chars)",
  "type": "PaymentProviderType (required)",
  "description": "string (optional, max 500 chars)",
  "isActive": "boolean (optional, default: true)",
  "credentials": "object (optional, secure payment credentials)",
  "minimumAmount": "number (optional, positive)",
  "maximumAmount": "number (optional, positive)",
  "testMode": "boolean (optional)",
  "imgUrl": "string (optional, valid URL)",
  "storeId": "string (required)",
  "currencyId": "string (required)"
}
```

**Response:** `201 Created`

---

### Get All Payment Providers
```
GET /payment-providers
Auth: PublicKeyGuard
```

**Response:** `200 OK` (List of all payment providers)

---

### Get Payment Providers by Store
```
GET /payment-providers/store/:storeId
Auth: PublicKeyGuard
Query Params:
  - includeInactive: boolean
  - type: PaymentProviderType
```

**Response:** `200 OK` (Filtered payment providers for store)

---

### Get Payment Provider by ID
```
GET /payment-providers/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK` (Full payment provider details)

---

### Update Payment Provider
```
PUT /payment-providers/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional, same structure as Create)

**Response:** `200 OK`

---

### Activate Payment Provider
```
PATCH /payment-providers/:id/activate
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "isActive": true
}
```

---

### Deactivate Payment Provider
```
PATCH /payment-providers/:id/deactivate
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "isActive": false
}
```

---

### Delete Payment Provider
```
DELETE /payment-providers/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Payment provider deleted successfully"
}
```

---

### Get Payment Provider Statistics
```
GET /payment-providers/:id/statistics
Auth: PublicKeyGuard
```

**Response:** `200 OK`
```json
{
  "totalTransactions": "number",
  "totalAmount": "number",
  "successRate": "number"
}
```

---

## Payment Transactions

### Create Payment Transaction
```
POST /payment-transactions
Auth: AuthGuard
```

**Request Body:** (Payment transaction details)

**Response:** `201 Created`

---

### Get All Payment Transactions
```
GET /payment-transactions
Auth: PublicKeyGuard
Query Params: page, limit, sortBy, sortOrder
Pagination: ✅ Supported
```

**Response:** `200 OK` (With pagination)

---

### Get Transactions by Order
```
GET /payment-transactions/order/:orderId
Auth: PublicKeyGuard
```

**Response:** `200 OK` (Transactions for specific order)

---

### Get Transactions by Store
```
GET /payment-transactions/store/:storeId
Auth: PublicKeyGuard
Query Params: page, limit, sortBy, sortOrder
Pagination: ✅ Supported
```

**Response:** `200 OK` (With pagination)

---

### Get Transactions by Provider
```
GET /payment-transactions/provider/:paymentProviderId
Auth: PublicKeyGuard
Query Params: status
```

**Response:** `200 OK` (Filtered transactions by provider)

---

### Get Transaction by ID
```
GET /payment-transactions/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK` (Full transaction details)

---

### Update Transaction
```
PUT /payment-transactions/:id
Auth: AuthGuard
```

**Request Body:** (Updated transaction fields)

**Response:** `200 OK`

---

### Delete Transaction
```
DELETE /payment-transactions/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Transaction deleted successfully"
}
```

---

### Get Transaction Statistics
```
GET /payment-transactions/statistics/store/:storeId
Auth: PublicKeyGuard
Query Params: startDate, endDate
```

**Response:** `200 OK`
```json
{
  "totalTransactions": "number",
  "totalAmount": "number",
  "averageAmount": "number"
}
```

---

## Refunds

### Create Refund
```
POST /refunds
Auth: AuthGuard
```

**Request Body:** (Refund details including orderId, amount, reason, refund line items)

**Response:** `201 Created`

---

### Get All Refunds
```
GET /refunds
Auth: PublicKeyGuard
```

**Response:** `200 OK` (List of all refunds)

---

### Get Refunds by Order
```
GET /refunds/order/:orderId
Auth: PublicKeyGuard
```

**Response:** `200 OK` (Refunds for specific order)

---

### Get Refunds by Store
```
GET /refunds/store/:storeId
Auth: PublicKeyGuard
```

**Response:** `200 OK` (Store refunds)

---

### Get Refund by ID
```
GET /refunds/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK` (Full refund details with line items)

---

### Update Refund
```
PUT /refunds/:id
Auth: AuthGuard
```

**Request Body:** (Updated refund fields)

**Response:** `200 OK`

---

### Delete Refund
```
DELETE /refunds/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Refund deleted successfully"
}
```

---

### Create Refund Line Item
```
POST /refunds/line-items
Auth: AuthGuard
```

**Request Body:** (Refund line item details)

**Response:** `201 Created`

---

### Get Refund Line Item
```
GET /refunds/line-items/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`

---

### Update Refund Line Item
```
PUT /refunds/line-items/:id
Auth: AuthGuard
```

**Request Body:** (Updated line item fields)

**Response:** `200 OK`

---

### Delete Refund Line Item
```
DELETE /refunds/line-items/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Refund line item deleted successfully"
}
```

---

### Get Refund Statistics
```
GET /refunds/statistics/store/:storeId
Auth: PublicKeyGuard
Query Params: startDate, endDate
```

**Response:** `200 OK`
```json
{
  "totalRefunds": "number",
  "totalAmount": "number",
  "refundRate": "number"
}
```

---

## Hero Sections

### Create Hero Section
```
POST /hero-sections/:storeId
Auth: AuthGuard
```

**Request Body:**
```json
{
  "title": "string (required, max 100 chars)",
  "subtitle": "string (optional, max 200 chars)",
  "backgroundImage": "string (optional, valid URL)",
  "mobileBackgroundImage": "string (optional, valid URL)",
  "backgroundVideo": "string (optional, valid URL)",
  "mobileBackgroundVideo": "string (optional, valid URL)",
  "buttonText": "string (optional, max 50 chars)",
  "buttonLink": "string (optional, max 200 chars)",
  "styles": "object (optional, CSS styles)",
  "metadata": "object (optional)",
  "isActive": "boolean (optional, default: true)",
  "storeId": "string (required)"
}
```

**Response:** `201 Created`

---

### Get Hero Sections by Store
```
GET /hero-sections/:storeId
Auth: PublicKeyGuard
Query Params:
  - includeInactive: boolean (default: false)
  - page: number (default: 1, min: 1)
  - limit: number (default: 20, min: 1, max: 100)
  - sortBy: string (default: 'createdAt')
  - sortOrder: 'asc' | 'desc' (default: 'desc')
Pagination: ✅ Supported
```

**Response:** `200 OK` (With pagination)

---

### Get Active Hero Sections
```
GET /hero-sections/:storeId/active
Auth: PublicKeyGuard
```

**Response:** `200 OK` (Active hero sections only)

---

### Get Hero Section by ID
```
GET /hero-sections/:storeId/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK` (Full hero section details)

---

### Update Hero Section
```
PUT /hero-sections/:storeId/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional, same structure as Create)

**Response:** `200 OK`

---

### Activate Hero Section
```
PATCH /hero-sections/:storeId/:id/activate
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "isActive": true
}
```

---

### Deactivate Hero Section
```
PATCH /hero-sections/:storeId/:id/deactivate
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "isActive": false
}
```

---

### Delete Hero Section
```
DELETE /hero-sections/:storeId/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Hero section deleted successfully"
}
```

---

## Card Sections

### Create Card Section
```
POST /card-section/:storeId
Auth: AuthGuard
```

**Request Body:** (Card section details)

**Response:** `201 Created`

---

### Get Card Sections by Store
```
GET /card-section/:storeId
Auth: PublicKeyGuard
Pagination: ❌ Not supported (returns all card sections for the store)
```

**Response:** `200 OK` (Array of card sections)

---

### Get Card Section by ID
```
GET /card-section/:storeId/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`

---

### Update Card Section
```
PATCH /card-section/:storeId/:id
Auth: AuthGuard
```

**Request Body:** (Updated card section fields)

**Response:** `200 OK`

---

### Delete Card Section
```
DELETE /card-section/:storeId/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Card section deleted successfully"
}
```

---

## Client Logo Sections

### Create Client Logo Section
```
POST /client-logo-sections/:storeId
Auth: AuthGuard
```

**Request Body:** (Client logo section details)

**Response:** `201 Created`

---

### Get Client Logo Sections by Store
```
GET /client-logo-sections/:storeId
Auth: PublicKeyGuard
Pagination: ❌ Not supported (returns all client logo sections for the store)
```

**Response:** `200 OK` (Array of client logo sections)

---

### Get Client Logo Section by ID
```
GET /client-logo-sections/:storeId/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`

---

### Update Client Logo Section
```
PATCH /client-logo-sections/:storeId/:id
Auth: AuthGuard
```

**Request Body:** (Updated section fields)

**Response:** `200 OK`

---

### Delete Client Logo Section
```
DELETE /client-logo-sections/:storeId/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Client logo section deleted successfully"
}
```

---

### Create Client Logo
```
POST /client-logo-sections/:storeId/:sectionId/client-logos
Auth: AuthGuard
```

**Request Body:** (Client logo details including imageUrl, name)

**Response:** `201 Created`

---

### Get Client Logo
```
GET /client-logo-sections/:storeId/client-logos/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`

---

### Update Client Logo
```
PUT /client-logo-sections/:storeId/client-logos/:id
Auth: AuthGuard
```

**Request Body:** (Updated logo fields)

**Response:** `200 OK`

---

### Delete Client Logo
```
DELETE /client-logo-sections/:storeId/client-logos/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Client logo deleted successfully"
}
```

---

## Team Sections

### Create Team Section
```
POST /team-sections
Auth: AuthGuard
```

**Request Body:** (Team section details)

**Response:** `201 Created`

---

### Get All Team Sections
```
GET /team-sections
Auth: PublicKeyGuard
Pagination: ❌ Not supported (returns all team sections)
```

**Response:** `200 OK` (Array of team sections)

---

### Get Team Sections by Store
```
GET /team-sections/store/:storeId
Auth: PublicKeyGuard
Pagination: ❌ Not supported (returns all team sections for the store)
```

**Response:** `200 OK` (Array of team sections)

---

### Get Team Section by ID
```
GET /team-sections/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`

---

### Update Team Section
```
PATCH /team-sections/:id
Auth: AuthGuard
```

**Request Body:** (Updated team section fields)

**Response:** `200 OK`

---

### Delete Team Section
```
DELETE /team-sections/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Team section deleted successfully"
}
```

---

## Frequently Bought Together

### Create FBT
```
POST /fbt/:storeId
Auth: AuthGuard
```

**Request Body:**
```json
{
  "storeId": "string (required)",
  "name": "string (required)",
  "variantIds": "string[] (required, min 2 items)",
  "discountName": "string (optional)",
  "discount": "number (optional, min 0)",
  "isActive": "boolean (optional)"
}
```

**Response:** `201 Created`

---

### Get FBT by Store
```
GET /fbt/:storeId
Auth: PublicKeyGuard
Query Params:
  - query: string (search term in name or discount name)
  - page: number (default: 1, min: 1)
  - limit: number (default: 20, min: 1, max: 100)
  - sortBy: string (default: 'createdAt')
  - sortOrder: 'asc' | 'desc' (default: 'desc')
Pagination: ✅ Supported
```

**Response:** `200 OK` (With pagination)

---

### Get FBT by ID
```
GET /fbt/:storeId/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK` (Full FBT details with variants)

---

### Update FBT
```
PATCH /fbt/:storeId/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional, same structure as Create)

**Response:** `200 OK`

---

### Delete FBT
```
DELETE /fbt/:storeId/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "FBT deleted successfully"
}
```

---

## Currencies

### Create Currency
```
POST /currencies
Auth: AuthGuard
```

**Request Body:**
```json
{
  "code": "string (required, max 3 chars, e.g. USD, EUR)",
  "name": "string (required, max 50 chars)",
  "symbol": "string (required, max 5 chars, e.g. $, €)",
  "decimalPlaces": "number (optional, default: 2, min: 0)",
  "symbolPosition": "CurrencyPosition (optional, default: BEFORE)",
  "isActive": "boolean (optional, default: true)",
  "autoUpdateRates": "boolean (optional)",
  "updateFrequency": "string (optional, max 50 chars)",
  "roundingPrecision": "number (optional, min: 0)",
  "storeId": "string (required)"
}
```

**Response:** `201 Created`

---

### Get All Currencies
```
GET /currencies
Auth: PublicKeyGuard
Query Params: page, limit, sortBy, sortOrder
Pagination: ✅ Supported
```

**Response:** `200 OK` (With pagination)

---

### Get Currency by ID
```
GET /currencies/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`

---

### Get Currency by Code
```
GET /currencies/by-code/:code
Auth: PublicKeyGuard
```

**Response:** `200 OK`

---

### Update Currency
```
PATCH /currencies/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional, same structure as Create)

**Response:** `200 OK`

---

### Delete Currency
```
DELETE /currencies/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Currency deleted successfully"
}
```

---

## Exchange Rates

### Create Exchange Rate
```
POST /exchange-rates/:storeId
Auth: AuthGuard
```

**Request Body:**
```json
{
  "fromCurrencyId": "string (required)",
  "toCurrencyId": "string (required)",
  "rate": "number (required, positive, max 6 decimals)",
  "effectiveDate": "Date (required)"
}
```

**Response:** `201 Created`

---

### Get All Exchange Rates
```
GET /exchange-rates/:storeId
Auth: PublicKeyGuard
Query Params: page, limit, sortBy, sortOrder
Pagination: ✅ Supported
```

**Response:** `200 OK` (With pagination)

---

### Get Exchange Rate by ID
```
GET /exchange-rates/:storeId/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`

---

### Update Exchange Rate
```
PATCH /exchange-rates/:storeId/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional, same structure as Create)

**Response:** `200 OK`

---

### Delete Exchange Rate
```
DELETE /exchange-rates/:storeId/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "Exchange rate deleted successfully"
}
```

---

## SEO Config

### Create SEO Config
```
POST /seo-config/:storeId
Auth: AuthGuard
```

**Request Body:**
```json
{
  "storeId": "string (required)",
  "title": "string (required)",
  "description": "string (optional)",
  "keywords": "string[] (optional)",
  "canonicalUrl": "string (optional, valid URL)",
  "ogTitle": "string (optional, Open Graph title)",
  "ogDescription": "string (optional)",
  "ogImage": "string (optional, valid URL)",
  "twitterImage": "string (optional, valid URL)",
  "twitterCard": "string (optional)",
  "twitterSite": "string (optional)",
  "twitterCreator": "string (optional)",
  "structuredData": "string[] (optional, JSON-LD schemas)"
}
```

**Response:** `201 Created`

---

### Get SEO Configs by Store
```
GET /seo-config/:storeId
Auth: PublicKeyGuard
```

**Response:** `200 OK` (Array of SEO configs for store)

---

### Get SEO Config by ID
```
GET /seo-config/:storeId/:id
Auth: PublicKeyGuard
```

**Response:** `200 OK`

---

### Update SEO Config
```
PATCH /seo-config/:storeId/:id
Auth: AuthGuard
```

**Request Body:** (All fields optional, same structure as Create)

**Response:** `200 OK`

---

### Delete SEO Config
```
DELETE /seo-config/:storeId/:id
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "SEO config deleted successfully"
}
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

**Response:** `200 OK`
```json
{
  "totalRevenue": "number",
  "totalOrders": "number",
  "totalProducts": "number",
  "totalCustomers": "number",
  "averageOrderValue": "number",
  "conversionRate": "number",
  "topProducts": [
    {
      "productId": "string",
      "productName": "string",
      "totalSales": "number"
    }
  ],
  "revenueByDate": [
    {
      "date": "Date",
      "revenue": "number"
    }
  ]
}
```

---

## Kardex

### Get Kardex General
```
GET /kardex/general
Auth: PublicKeyGuard
Query Params:
  - storeId: string (required)
  - startDate: string (optional, ISO date)
  - endDate: string (optional, ISO date)
  - valuationMethod: 'FIFO' | 'WEIGHTED_AVERAGE' (optional)
```

**Response:** `200 OK`
```json
{
  "storeId": "string",
  "startDate": "Date | null",
  "endDate": "Date | null",
  "valuationMethod": "string",
  "items": [
    {
      "variantId": "string",
      "variantTitle": "string",
      "sku": "string",
      "movements": [
        {
          "date": "Date",
          "type": "IN | OUT | ADJUSTMENT",
          "quantity": "number",
          "unitCost": "number",
          "totalCost": "number",
          "balance": "number",
          "reference": "string"
        }
      ],
      "initialBalance": "number",
      "finalBalance": "number",
      "totalIn": "number",
      "totalOut": "number"
    }
  ],
  "summary": {
    "totalInventoryValue": "number",
    "totalMovements": "number"
  }
}
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

**Request Body:** `multipart/form-data` with file field

**Response:** `200 OK`
```json
{
  "filename": "string",
  "url": "string",
  "size": "number",
  "mimeType": "string"
}
```

---

### List Files
```
GET /file/list
Auth: AuthGuard
```

**Response:** `200 OK`
```json
[
  {
    "filename": "string",
    "url": "string",
    "size": "number",
    "uploadedAt": "Date"
  }
]
```

---

### Delete File
```
DELETE /file/delete/:filename
Auth: AuthGuard
```

**Response:** `200 OK`
```json
{
  "message": "File deleted successfully"
}
```

---

## Email

### Send Email
```
POST /email/send
Auth: PublicKeyGuard
```

**Request Body:**
```json
{
  "to": "string (required, email address)",
  "subject": "string (required)",
  "html": "string (required, HTML content)",
  "from": {
    "name": "string (optional)",
    "address": "string (optional, email address)"
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "Email sent successfully",
  "messageId": "string"
}
```

---

### Submit Form
```
POST /email/submit-form
Auth: PublicKeyGuard
```

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "message": "string (optional)",
  "[any custom field]": "string"
}
```

**Response:** `200 OK`
```json
{
  "message": "Form submitted successfully"
}
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

