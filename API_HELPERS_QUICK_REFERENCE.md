# API Helpers - Referencia Rápida

## 🎯 ¿Cuándo usar cada helper?

### `extractApiData<T>(response)`
Para respuestas **simples** (sin paginación):

```typescript
// GET /products/:storeId/:id
// GET /collections/:storeId/:id
// POST /fbt/:storeId
// PATCH /orders/:id

const product = extractApiData<Product>(response)
const collection = extractApiData<Collection>(response)
const newFbt = extractApiData<FrequentlyBoughtTogether>(response)
```

### `extractPaginatedData<T>(response)`
Para respuestas **con paginación**:

```typescript
// GET /products/:storeId?page=1&limit=20
// GET /collections/:storeId?search=zapatillas
// GET /orders/:storeId?status=PENDING

const { data, pagination } = extractPaginatedData<Product[]>(response)
const { data, pagination } = extractPaginatedData<Collection[]>(response)
const { data, pagination } = extractPaginatedData<Order[]>(response)
```

---

## 📋 Ejemplos por Tipo de Operación

### Fetch Simple (Sin paginación)
```typescript
fetchCardSections: async () => {
  const response = await apiClient.get(`/card-section/${STORE_ID}`)
  const cardSections = extractApiData<CardSection[]>(response)
  set({ cardSections })
  return cardSections
}
```

### Fetch con Paginación
```typescript
fetchProducts: async (params) => {
  const queryParams = buildQueryParams(params)
  const response = await apiClient.get(`/products/${STORE_ID}${queryParams}`)
  const { data, pagination } = extractPaginatedData<Product[]>(response)
  set({
    products: data,
    paginationMeta: { ...get().paginationMeta, products: pagination }
  })
  return { data, pagination }
}
```

### Get por ID
```typescript
getProductById: async (id) => {
  const response = await apiClient.get(`/products/${STORE_ID}/${id}`)
  return extractApiData<Product>(response)
}
```

### Create
```typescript
createFrequentlyBoughtTogether: async (data: CreateFbtDto) => {
  const response = await apiClient.post(`/fbt/${STORE_ID}`, data)
  const newFbt = extractApiData<FrequentlyBoughtTogether>(response)
  set((state) => ({
    frequentlyBoughtTogether: [...state.frequentlyBoughtTogether, newFbt]
  }))
  return newFbt
}
```

### Update
```typescript
updateOrder: async (id, data: UpdateOrderDto) => {
  const response = await apiClient.put(`/orders/${id}`, data)
  const updatedOrder = extractApiData<Order>(response)
  set((state) => ({
    orders: state.orders.map(o => o.id === id ? updatedOrder : o)
  }))
  return updatedOrder
}
```

---

## ⚠️ Reglas Importantes

### 1. storeId en URL vs Body

```typescript
// ❌ NO incluir storeId si está en URL
POST   /hero-sections/:storeId        → NO storeId en body
POST   /card-section/:storeId         → NO storeId en body
POST   /fbt/:storeId                  → NO storeId en body

// ✅ SÍ incluir storeId si no está en URL
POST   /team-sections                 → storeId en body
```

### 2. Siempre especificar el tipo genérico

```typescript
// ❌ Mal - pierde tipos
const data = extractApiData(response)

// ✅ Bien - mantiene tipos
const data = extractApiData<Product>(response)
const data = extractPaginatedData<Product[]>(response)
```

### 3. Destructurar correctamente

```typescript
// Para paginación - SIEMPRE destructurar
const { data, pagination } = extractPaginatedData<T[]>(response)

// Para simple - asignar directamente
const item = extractApiData<T>(response)
```

---

## 🔍 Formato de Respuestas

### Respuesta Envuelta (Actual)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operación exitosa",
  "data": { "id": "1", "title": "..." },
  "timestamp": "2025-10-13T04:26:54.322Z"
}
```

### Respuesta Paginada
```json
{
  "success": true,
  "statusCode": 200,
  "data": [{ "id": "1" }, { "id": "2" }],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🚨 Errores Comunes

### Error 1: Acceso directo a response.data
```typescript
// ❌ NO HACER
const products = response.data
console.log(products[0].title) // Error: puede ser undefined

// ✅ HACER
const products = extractApiData<Product[]>(response)
console.log(products[0].title) // Funciona
```

### Error 2: Olvidar destructurar paginación
```typescript
// ❌ NO HACER
const products = extractPaginatedData<Product[]>(response)
// products es { data: [...], pagination: {...} }

// ✅ HACER
const { data, pagination } = extractPaginatedData<Product[]>(response)
```

### Error 3: Tipo genérico incorrecto
```typescript
// ❌ NO HACER
const { data } = extractPaginatedData<Product>(response)
// Debería ser Product[] no Product

// ✅ HACER
const { data } = extractPaginatedData<Product[]>(response)
```

---

## 📦 Imports Necesarios

```typescript
// En stores/mainStore.ts
import { extractApiData, extractPaginatedData } from "@/lib/apiHelpers"

// Tipos
import type { Product } from "@/types/product"
import type { Category } from "@/types/category"
// ... etc
```

---

## ✅ Checklist al Crear Nuevos Endpoints

- [ ] Importar el tipo correspondiente
- [ ] Usar `extractApiData` o `extractPaginatedData`
- [ ] Especificar el tipo genérico `<T>`
- [ ] Verificar si storeId va en URL o body
- [ ] Actualizar el estado correctamente
- [ ] Retornar los datos extraídos

---

## 📚 Archivos Relacionados

- **Helpers**: `lib/apiHelpers.ts`
- **Store**: `stores/mainStore.ts`
- **Tipos**: `types/*.ts`
- **Referencia de endpoints del backend**: [API_ENDPOINTS_REFERENCE.md](./API_ENDPOINTS_REFERENCE.md)

---

**Tip**: Copia y pega los ejemplos de arriba al crear nuevos endpoints para mantener consistencia.

