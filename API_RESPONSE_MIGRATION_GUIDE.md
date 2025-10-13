# Guía de Migración: Respuestas Envueltas del Backend

## 📋 Resumen

Esta guía documenta los cambios realizados en **AuthTemplate** para adaptarse al nuevo formato de respuestas del backend, que ahora envuelve todos los datos en una estructura estandarizada.

**Fecha de Migración:** Octubre 13, 2025  
**Versión:** 2.0  
**Impacto:** Frontend (AuthTemplate)

---

## 🔍 Problema Identificado

### Formato Anterior (Legacy)
```json
[
  { "id": "1", "title": "Item 1" },
  { "id": "2", "title": "Item 2" }
]
```

### Nuevo Formato (Envuelto)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operación exitosa",
  "data": [
    { "id": "1", "title": "Item 1" },
    { "id": "2", "title": "Item 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2025-10-13T04:26:54.322Z"
}
```

### Errores Causados

```javascript
// ❌ Error anterior
const collection = await getCollectionById(id)
console.log(collection.title.toUpperCase()) 
// Error: undefined is not an object (evaluating 'collection.title.toUpperCase')
// Porque collection contenía el objeto envuelto completo, no los datos

// ✅ Después del fix
const collection = await getCollectionById(id)
console.log(collection.title.toUpperCase()) 
// Funciona correctamente
```

---

## 🛠️ Cambios Implementados

### 1. Nuevo Archivo: `lib/apiHelpers.ts`

Creado un archivo de helpers para extraer datos de respuestas envueltas:

```typescript
import type { AxiosResponse } from 'axios'
import type { PaginationMeta } from '@/types/pagination'

/**
 * Extrae datos de respuestas paginadas del backend
 * Maneja tanto el formato nuevo (envuelto) como el legacy
 */
export function extractPaginatedData<T>(
  response: AxiosResponse
): { data: T; pagination: PaginationMeta } {
  if (response.data && 'data' in response.data && 'pagination' in response.data) {
    return {
      data: response.data.data as T,
      pagination: response.data.pagination,
    }
  }
  
  // Fallback para formato legacy
  return {
    data: (Array.isArray(response.data) ? response.data : []) as T,
    pagination: {
      page: 1,
      limit: 100,
      total: Array.isArray(response.data) ? response.data.length : 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  }
}

/**
 * Extrae datos simples de respuestas envueltas del backend
 * Maneja tanto el formato nuevo (envuelto) como el legacy
 */
export function extractApiData<T>(response: AxiosResponse): T {
  if (response.data && 'data' in response.data && 'success' in response.data) {
    return response.data.data
  }
  
  return response.data
}

/**
 * Maneja errores de API de forma estandarizada
 */
export function handleApiError(error: any): never {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message)
  }
  
  if (error.message) {
    throw new Error(error.message)
  }
  
  throw new Error('An unexpected error occurred')
}
```

**Características:**
- ✅ TypeScript con tipado genérico
- ✅ Retrocompatible con respuestas legacy
- ✅ Manejo automático de errores
- ✅ Soporte para paginación

---

### 2. Tipos Actualizados

#### `types/heroSection.ts`
```diff
+ export interface CreateHeroSectionDto {
+   title: string;
+   subtitle?: string;
+   backgroundImage?: string;
+   mobileBackgroundImage?: string;
+   backgroundVideo?: string;
+   mobileBackgroundVideo?: string;
+   buttonText?: string;
+   buttonLink?: string;
+   styles: HeroSectionStyles | Record<string, any>;
+   metadata?: HeroSectionMetadata;
+   isActive?: boolean;
+ }
+ 
+ export interface UpdateHeroSectionDto {
+   title?: string;
+   subtitle?: string;
+   buttonText?: string;
+   buttonLink?: string;
+   backgroundImage?: string;
+   mobileBackgroundImage?: string;
+   backgroundVideo?: string;
+   mobileBackgroundVideo?: string;
+   styles?: HeroSectionStyles | Record<string, any>;
+   metadata?: HeroSectionMetadata;
+   isActive?: boolean;
+ }
```

#### `types/card.ts`
```diff
  export interface CreateCardSectionDto {
-   storeId: string
    title: string
    subtitle?: string
    // ... otros campos
  }
  
  export interface UpdateCardSectionDto {
    title?: string
    subtitle?: string | null
-   storeId?: string
    // ... otros campos
  }
```

#### `types/fbt.ts`
```diff
+ export interface CreateFrequentlyBoughtTogetherDto {
+   name: string;
+   variantIds: string[];
+   discountName?: string;
+   discount?: number;
+ }
+ 
+ export interface UpdateFrequentlyBoughtTogetherDto {
+   name?: string;
+   variantIds?: string[];
+   discountName?: string | null;
+   discount?: number | null;
+ }
```

#### `types/team.ts`
```diff
  export interface CreateTeamSectionDto {
-   storeId: string;
+   storeId: string; // Mantenido porque el endpoint no lo tiene en URL
    title: string;
    // ... otros campos
  }
```

**Cambios clave:**
- ❌ Removido `storeId` de DTOs donde va en URL
- ✅ Mantenido `storeId` donde va en body (TeamSection)
- ✅ Agregados DTOs faltantes (HeroSection, FBT)

---

### 3. Store Actualizado: `stores/mainStore.ts`

#### Imports Agregados
```typescript
import { extractApiData, extractPaginatedData } from "@/lib/apiHelpers"
```

#### Tipos Importados
```typescript
import type { 
  HeroSection, 
  CreateHeroSectionDto, 
  UpdateHeroSectionDto 
} from "@/types/heroSection"

import type { 
  CardSection, 
  CreateCardSectionDto, 
  UpdateCardSectionDto 
} from "@/types/card"

import type { 
  TeamMember, 
  TeamSection, 
  CreateTeamSectionDto, 
  UpdateTeamSectionDto 
} from "@/types/team"

import type { 
  FrequentlyBoughtTogether, 
  CreateFrequentlyBoughtTogetherDto, 
  UpdateFrequentlyBoughtTogetherDto 
} from "@/types/fbt"

import type { 
  CreateCollectionDto, 
  UpdateCollectionDto 
} from "@/types/collection"
```

---

## 📊 Métodos Actualizados

### Endpoints Paginados (13 actualizados)

#### Antes
```typescript
fetchCategories: async (params?: SearchCategoryParams, forceRefresh?: boolean) => {
  const response = await apiClient.get(`/categories/${STORE_ID}`)
  set({
    categories: response.data.data,  // ❌ Acceso directo
    paginationMeta: { ...get().paginationMeta, categories: response.data.pagination },
  })
  return response.data
}
```

#### Después
```typescript
fetchCategories: async (params?: SearchCategoryParams, forceRefresh?: boolean) => {
  const response = await apiClient.get(`/categories/${STORE_ID}`)
  const { data, pagination } = extractPaginatedData<Category[]>(response)  // ✅ Helper
  set({
    categories: data,
    paginationMeta: { ...get().paginationMeta, categories: pagination },
  })
  return { data, pagination }
}
```

**Endpoints actualizados:**
1. ✅ `fetchCategories`
2. ✅ `fetchProducts`
3. ✅ `fetchProductVariants`
4. ✅ `fetchCollections`
5. ✅ `fetchHeroSections`
6. ✅ `fetchOrders`
7. ✅ `fetchCoupons`
8. ✅ `fetchShippingMethods`
9. ✅ `fetchPaymentTransactions`
10. ✅ `fetchContents`
11. ✅ `fetchCurrencies`
12. ✅ `fetchExchangeRates`
13. ✅ `fetchFrequentlyBoughtTogether`

---

### Endpoints Simples (6 actualizados)

#### Antes
```typescript
fetchCardSections: async () => {
  const response = await apiClient.get(`/card-section/${STORE_ID}`)
  set({
    cardSections: response.data,  // ❌ Puede ser el objeto envuelto
  })
  return response.data
}
```

#### Después
```typescript
fetchCardSections: async () => {
  const response = await apiClient.get(`/card-section/${STORE_ID}`)
  const cardSections = extractApiData<CardSection[]>(response)  // ✅ Helper
  set({
    cardSections,
  })
  return cardSections
}
```

**Endpoints actualizados:**
1. ✅ `fetchCardSections`
2. ✅ `fetchTeamSections`
3. ✅ `fetchTeamMembers`
4. ✅ `fetchPaymentProviders`
5. ✅ `fetchUsers`
6. ✅ `fetchShopSettings`

---

### Métodos getById (9 actualizados)

#### Antes
```typescript
getCollectionById: async (id) => {
  const response = await apiClient.get(`/collections/${STORE_ID}/${id}`)
  return response.data  // ❌ Devuelve objeto envuelto
}
```

#### Después
```typescript
getCollectionById: async (id) => {
  const response = await apiClient.get(`/collections/${STORE_ID}/${id}`)
  return extractApiData<Collection>(response)  // ✅ Extrae datos correctamente
}
```

**Métodos actualizados:**
1. ✅ `getCategoryById`
2. ✅ `getProductById`
3. ✅ `getProductBySlug`
4. ✅ `getCollectionById`
5. ✅ `getOrderById`
6. ✅ `getCouponById`
7. ✅ `getCurrencyById`
8. ✅ `getExchangeRateById`
9. ✅ `getFrequentlyBoughtTogetherById`

---

### Métodos Create/Update (5 actualizados)

#### Antes
```typescript
createFrequentlyBoughtTogether: async (data: any) => {  // ❌ any
  const response = await apiClient.post(`/fbt/${STORE_ID}`, data)
  set((state) => ({
    frequentlyBoughtTogether: [...state.frequentlyBoughtTogether, response.data],
  }))
  return response.data
}
```

#### Después
```typescript
createFrequentlyBoughtTogether: async (data: CreateFrequentlyBoughtTogetherDto) => {  // ✅ Tipado
  const response = await apiClient.post(`/fbt/${STORE_ID}`, data)
  const newFbt = extractApiData<FrequentlyBoughtTogether>(response)  // ✅ Helper
  set((state) => ({
    frequentlyBoughtTogether: [...state.frequentlyBoughtTogether, newFbt],
  }))
  return newFbt
}
```

**Métodos actualizados:**
1. ✅ `createFrequentlyBoughtTogether`
2. ✅ `updateFrequentlyBoughtTogether`
3. ✅ `fetchFrequentlyBoughtTogetherById`
4. ✅ `createOrder`
5. ✅ `updateOrder`

---

## 🎯 Reglas de Negocio: storeId

### Endpoints que NO requieren storeId en body (solo en URL)

```typescript
// ✅ Correcto - storeId en URL, NO en body
POST   /hero-sections/:storeId
PATCH  /hero-sections/:storeId/:id
POST   /card-section/:storeId
PATCH  /card-section/:storeId/:id
POST   /fbt/:storeId
PATCH  /fbt/:storeId/:id
```

**Implementación:**
```typescript
createHeroSection: async (data: CreateHeroSectionDto) => {
  // NO incluir storeId en data
  const response = await apiClient.post(`/hero-sections/${STORE_ID}`, data)
  return extractApiData<HeroSection>(response)
}
```

### Endpoints que SÍ requieren storeId en body

```typescript
// ✅ Correcto - storeId en body
POST   /team-sections
PATCH  /team-sections/:id
POST   /collections/:storeId  // También valida que coincida con URL
```

**Implementación:**
```typescript
createTeamSection: async (data: CreateTeamSectionDto) => {
  // Incluir storeId en data
  const dataWithStore = {
    ...data,
    storeId: STORE_ID,
  }
  const response = await apiClient.post('/team-sections', dataWithStore)
  return extractApiData<TeamSection>(response)
}
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Fetch con Paginación

```typescript
// En un componente
const { fetchProducts } = useMainStore()

const loadProducts = async () => {
  const result = await fetchProducts({
    page: 1,
    limit: 20,
    search: 'zapatillas'
  })
  
  console.log(result.data)        // Array de productos
  console.log(result.pagination)  // Metadata de paginación
}
```

### Ejemplo 2: Get por ID

```typescript
// En un componente
const { getCollectionById } = useMainStore()

const loadCollection = async (id: string) => {
  const collection = await getCollectionById(id)
  
  // ✅ Ahora funciona correctamente
  console.log(collection.title.toUpperCase())
  console.log(collection.products)
}
```

### Ejemplo 3: Create

```typescript
// En un componente
const { createFrequentlyBoughtTogether } = useMainStore()

const handleCreate = async () => {
  const newFbt = await createFrequentlyBoughtTogether({
    name: 'Combo Raqueta + Jebe',
    variantIds: ['variant1', 'variant2'],
    discount: 10,
    discountName: '10% OFF'
  })
  
  console.log('Created:', newFbt)
}
```

---

## ✅ Verificación de Migración

### Checklist

- [x] ✅ Creado `lib/apiHelpers.ts`
- [x] ✅ Actualizados 13 endpoints paginados
- [x] ✅ Actualizados 6 endpoints simples
- [x] ✅ Actualizados 9 métodos getById
- [x] ✅ Actualizados 5 métodos create/update
- [x] ✅ Agregados DTOs faltantes
- [x] ✅ Removido `storeId` de DTOs apropiados
- [x] ✅ 0 errores de TypeScript
- [x] ✅ 0 errores de linter
- [x] ✅ Retrocompatibilidad mantenida

### Tests Recomendados

```typescript
// Test 1: Verificar extracción de datos paginados
const response = {
  data: {
    success: true,
    data: [{ id: '1' }, { id: '2' }],
    pagination: { page: 1, limit: 10, total: 2 }
  }
}
const result = extractPaginatedData(response)
expect(result.data).toEqual([{ id: '1' }, { id: '2' }])
expect(result.pagination.page).toBe(1)

// Test 2: Verificar extracción de datos simples
const response2 = {
  data: {
    success: true,
    data: { id: '1', name: 'Test' }
  }
}
const result2 = extractApiData(response2)
expect(result2).toEqual({ id: '1', name: 'Test' })

// Test 3: Verificar retrocompatibilidad
const legacyResponse = {
  data: [{ id: '1' }]
}
const result3 = extractPaginatedData(legacyResponse)
expect(result3.data).toEqual([{ id: '1' }])
```

---

## 🚀 Beneficios

1. **Consistencia**: Todos los endpoints usan el mismo patrón
2. **Tipo Seguro**: TypeScript detecta errores en tiempo de compilación
3. **Mantenible**: Cambios centralizados en `apiHelpers.ts`
4. **Retrocompatible**: Funciona con respuestas legacy
5. **Escalable**: Fácil agregar nuevos endpoints

---

## 📚 Referencias

- **Archivo de Helpers**: `lib/apiHelpers.ts`
- **Store Principal**: `stores/mainStore.ts`
- **Tipos**: `types/heroSection.ts`, `types/card.ts`, `types/fbt.ts`, `types/team.ts`
- **Backend**: `sportt-nest-backend` (formato de respuestas estandarizado)

---

## 🔧 Troubleshooting

### Error: "undefined is not an object"

**Causa**: Intentar acceder a propiedades del objeto envuelto  
**Solución**: Usar `extractApiData` o `extractPaginatedData`

```typescript
// ❌ Incorrecto
const collection = response.data
console.log(collection.title) // Error si está envuelto

// ✅ Correcto
const collection = extractApiData<Collection>(response)
console.log(collection.title) // Funciona
```

### Error: Tipos no coinciden

**Causa**: No especificar el tipo genérico correcto  
**Solución**: Pasar el tipo correcto al helper

```typescript
// ❌ Incorrecto
const data = extractApiData(response) // tipo: any

// ✅ Correcto
const data = extractApiData<Product[]>(response) // tipo: Product[]
```

### Error: Paginación no disponible

**Causa**: Endpoint no devuelve paginación  
**Solución**: Usar `extractApiData` en lugar de `extractPaginatedData`

```typescript
// Para endpoints sin paginación
const data = extractApiData<CardSection[]>(response)

// Para endpoints con paginación
const { data, pagination } = extractPaginatedData<Product[]>(response)
```

---

## 📞 Soporte

Para preguntas o problemas relacionados con esta migración:
- Revisar esta documentación
- Consultar ejemplos en `stores/mainStore.ts`
- Verificar tipos en `types/`

---

**Última actualización:** Octubre 13, 2025  
**Mantenido por:** Equipo de Desarrollo  
**Versión:** 2.0.0

