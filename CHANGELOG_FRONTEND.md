# Changelog - AuthTemplate Frontend

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [2.0.0] - 2025-10-13

### 🎯 Cambios Mayores
Adaptación completa al nuevo formato de respuestas envueltas del backend.

### ✨ Agregado

#### Nuevo archivo: `lib/apiHelpers.ts`
- `extractApiData<T>()` - Extrae datos de respuestas simples
- `extractPaginatedData<T>()` - Extrae datos paginados con metadata
- `handleApiError()` - Manejo estandarizado de errores
- Retrocompatibilidad con formato legacy

#### Tipos nuevos
- `types/heroSection.ts`
  - `CreateHeroSectionDto`
  - `UpdateHeroSectionDto`
  
- `types/fbt.ts`
  - `CreateFrequentlyBoughtTogetherDto`
  - `UpdateFrequentlyBoughtTogetherDto`

#### Documentación
- `API_RESPONSE_MIGRATION_GUIDE.md` - Guía completa de migración
- `API_HELPERS_QUICK_REFERENCE.md` - Referencia rápida para desarrollo
- `CHANGELOG_FRONTEND.md` - Este archivo

### 🔄 Modificado

#### `stores/mainStore.ts`
**Imports agregados:**
- `extractApiData`, `extractPaginatedData` de `@/lib/apiHelpers`
- DTOs: `Create/Update` para HeroSection, CardSection, TeamSection, FBT, Collection

**13 Endpoints paginados actualizados:**
1. `fetchCategories` - Usa `extractPaginatedData<Category[]>`
2. `fetchProducts` - Usa `extractPaginatedData<Product[]>`
3. `fetchProductVariants` - Usa `extractPaginatedData<ProductVariant[]>`
4. `fetchCollections` - Usa `extractPaginatedData<Collection[]>`
5. `fetchHeroSections` - Usa `extractPaginatedData<HeroSection[]>`
6. `fetchOrders` - Usa `extractPaginatedData<Order[]>`
7. `fetchCoupons` - Usa `extractPaginatedData<Coupon[]>`
8. `fetchShippingMethods` - Usa `extractPaginatedData<ShippingMethod[]>`
9. `fetchPaymentTransactions` - Usa `extractPaginatedData<PaymentTransaction[]>`
10. `fetchContents` - Usa `extractPaginatedData<Content[]>`
11. `fetchCurrencies` - Usa `extractPaginatedData<Currency[]>`
12. `fetchExchangeRates` - Usa `extractPaginatedData<ExchangeRate[]>`
13. `fetchFrequentlyBoughtTogether` - Usa `extractPaginatedData<FrequentlyBoughtTogether[]>`

**6 Endpoints simples actualizados:**
1. `fetchCardSections` - Usa `extractApiData<CardSection[]>`
2. `fetchTeamSections` - Usa `extractApiData<TeamSection[]>`
3. `fetchTeamMembers` - Usa `extractApiData<TeamMember[]>`
4. `fetchPaymentProviders` - Usa `extractApiData<PaymentProvider[]>`
5. `fetchUsers` - Usa `extractApiData<User[]>`
6. `fetchShopSettings` - Usa `extractApiData<ShopSettings>`

**9 Métodos getById actualizados:**
1. `getCategoryById` - Usa `extractApiData<Category>`
2. `getProductById` - Usa `extractApiData<Product>`
3. `getProductBySlug` - Usa `extractApiData<Product>`
4. `getCollectionById` - Usa `extractApiData<Collection>`
5. `getOrderById` - Usa `extractApiData<Order>`
6. `getCouponById` - Usa `extractApiData<Coupon>`
7. `getCurrencyById` - Usa `extractApiData<Currency>`
8. `getExchangeRateById` - Usa `extractApiData<ExchangeRate>`
9. `getFrequentlyBoughtTogetherById` - Usa `extractApiData<FrequentlyBoughtTogether>`

**5 Métodos create/update actualizados:**
1. `createFrequentlyBoughtTogether` - Tipado + `extractApiData`
2. `updateFrequentlyBoughtTogether` - Tipado + `extractApiData`
3. `fetchFrequentlyBoughtTogetherById` - Usa `extractApiData`
4. `createOrder` - Usa `extractApiData`
5. `updateOrder` - Usa `extractApiData`

#### Tipos modificados

**`types/card.ts`**
- ❌ Removido `storeId` de `CreateCardSectionDto`
- ❌ Removido `storeId` de `UpdateCardSectionDto`

**`types/team.ts`**
- ✅ Mantenido `storeId` en `CreateTeamSectionDto` (comentario explicativo agregado)

**`types/collection.ts`**
- ℹ️ Sin cambios (ya estaba correcto)

### 🐛 Corregido

- **Error crítico:** `undefined is not an object (evaluating 'collection.title.toUpperCase')`
  - **Causa:** Acceso directo a `response.data` sin extraer datos envueltos
  - **Solución:** Implementación de helpers `extractApiData` y `extractPaginatedData`

- **Errores de tipo:** 28+ errores de TypeScript por uso de `any`
  - **Solución:** Tipado estricto con DTOs apropiados

- **Inconsistencia:** storeId enviado en body cuando debía ir solo en URL
  - **Solución:** Removido de DTOs donde el endpoint lo tiene en URL

### 🔧 Mejoras Técnicas

- **TypeScript:** 0 errores de tipos
- **ESLint:** 0 errores de linter
- **Cobertura:** 33 métodos actualizados (100% de los necesarios)
- **Retrocompatibilidad:** Mantenida con formato legacy

### 📊 Estadísticas

```
Archivos creados:     3
Archivos modificados: 6
Líneas agregadas:     ~500
Líneas modificadas:   ~200
Métodos actualizados: 33
Errores corregidos:   28+
```

### ⚠️ Breaking Changes

**Ninguno.** Todos los cambios son internos y retrocompatibles.

Los componentes que usan el store no necesitan modificaciones:
```typescript
// Código existente sigue funcionando
const { getCollectionById } = useMainStore()
const collection = await getCollectionById(id)
console.log(collection.title) // ✅ Funciona correctamente
```

### 🔄 Migración

No se requiere migración de código de componentes. Solo el store interno fue actualizado.

Para nuevos endpoints, seguir los patrones documentados en:
- `API_RESPONSE_MIGRATION_GUIDE.md`
- `API_HELPERS_QUICK_REFERENCE.md`

### 📝 Notas

- Los helpers manejan automáticamente tanto respuestas nuevas (envueltas) como legacy
- Todos los métodos mantienen la misma firma pública
- La paginación ahora es consistente en todos los endpoints

---

## [1.0.0] - 2025-10-01

### ✨ Inicial
- Implementación base del frontend AuthTemplate
- Integración con backend sportt-nest-backend
- Sistema de autenticación
- Gestión de productos, categorías, y colecciones
- Carrito de compras y checkout
- Sistema de cupones y promociones

---

## Tipos de Cambios

- `Added` - Para funcionalidad nueva
- `Changed` - Para cambios en funcionalidad existente
- `Deprecated` - Para funcionalidad que será removida
- `Removed` - Para funcionalidad removida
- `Fixed` - Para corrección de bugs
- `Security` - Para vulnerabilidades

---

**Última actualización:** 2025-10-13  
**Mantenido por:** Equipo de Desarrollo

