# API Reference: Products Endpoint - Para IA Frontend

## Endpoint
```
GET /products/store/:storeId
```

## Cambio Crítico Implementado
Los parámetros `categorySlugs`, `collectionIds` y `status` ahora aceptan **dos formatos**:
- **String con comas**: `?categorySlugs=deportes,fitness,ropa` ✅ RECOMENDADO (usar con checkboxes)
- **Array múltiple**: `?categorySlugs=deportes&categorySlugs=fitness` ✅ También válido

**IMPORTANTE:** El filtro de categorías usa **slugs** (ej: `deportes`) en lugar de IDs, para URLs más amigables y SEO.

## Implementación Recomendada

### Tipos TypeScript para Filtros

```typescript
interface ProductFilters {
  page?: number;
  limit?: number;
  query?: string;
  vendor?: string;
  status?: ('ACTIVE' | 'DRAFT' | 'ARCHIVED')[];
  categorySlugs?: string[];
  collectionIds?: string[];
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'price' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  currencyId?: string;
}
```

### Template para construcción de URLs (con checkboxes)
```javascript
function buildProductsURL(storeId, filters = {}) {
  const params = new URLSearchParams();
  
  // Parámetros numéricos simples
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  
  // Parámetros de texto simple
  if (filters.query) params.append('query', filters.query);
  if (filters.vendor) params.append('vendor', filters.vendor);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  
  // Arrays desde checkboxes: usar join(',') para formato de comas
  // Ejemplo: selectedCategories = ['deportes', 'fitness'] → 'deportes,fitness'
  if (filters.categorySlugs?.length) {
    params.append('categorySlugs', filters.categorySlugs.join(','));
  }
  if (filters.collectionIds?.length) {
    params.append('collectionIds', filters.collectionIds.join(','));
  }
  if (filters.status?.length) {
    params.append('status', filters.status.join(','));
  }
  
  // Parámetros de rango de precio
  if (filters.minPrice !== undefined) {
    params.append('minPrice', filters.minPrice.toString());
  }
  if (filters.maxPrice !== undefined) {
    params.append('maxPrice', filters.maxPrice.toString());
  }
  if (filters.currencyId) {
    params.append('currencyId', filters.currencyId);
  }
  
  return `/products/store/${storeId}?${params.toString()}`;
}
```

## Parámetros Completos

| Parámetro | Tipo | Formato | Obligatorio | Valores/Rango |
|-----------|------|---------|-------------|---------------|
| `storeId` | string | Path param | ✅ | UUID de tienda |
| `query` | string | Query string | ❌ | Texto (max 200 chars) |
| `status` | array | Comma-separated | ❌ | `ACTIVE`, `DRAFT`, `ARCHIVED` |
| `vendor` | string | Query string | ❌ | Texto (max 100 chars) |
| `categorySlugs` | array | Comma-separated | ❌ | Slugs de categorías (ej: `deportes`, `ropa`) |
| `collectionIds` | array | Comma-separated | ❌ | UUIDs de colecciones |
| `page` | number | Integer | ❌ | Min: 1, Default: 1 |
| `limit` | number | Integer | ❌ | Min: 1, Max: 100, Default: 20 |
| `sortBy` | string | Enum | ❌ | `createdAt`, `updatedAt`, `title`, `price`, `viewCount` |
| `sortOrder` | string | Enum | ❌ | `asc`, `desc` (default: `desc`) |
| `minPrice` | number | Decimal | ❌ | Min: 0 |
| `maxPrice` | number | Decimal | ❌ | Min: 0 |
| `currencyId` | string | UUID | ❌ | ID de moneda para filtrar precios |

## Estructura de Respuesta

```typescript
interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  vendor: string | null;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  metaTitle: string | null;
  metaDescription: string | null;
  viewCount: number | null;
  allowBackorder: boolean;
  imageUrls: string[];
  storeId: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  categories: Category[];
  collections: Collection[];
  variants: ProductVariant[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  // ... otros campos
}

interface ProductVariant {
  id: string;
  title: string;
  slug: string;
  sku: string | null;
  inventoryQuantity: number;
  attributes: Record<string, any> | null;
  imageUrls: string[];
  isActive: boolean;
  prices: VariantPrice[];
  // ... otros campos
}

interface VariantPrice {
  id: string;
  price: number; // Decimal as number
  originalPrice: number | null;
  currencyId: string;
  currency: {
    id: string;
    code: string; // 'USD', 'EUR', etc.
    symbol: string; // '$', '€', etc.
    name: string;
  };
}
```

## Comportamiento de Filtros

### categorySlugs & collectionIds
- Usa operador **`some`** (OR lógico)
- Retorna productos que tengan **AL MENOS UNA** de las categorías/colecciones especificadas

**Ejemplo:**
```
Request: ?categorySlugs=deportes,fitness

Producto A: categories = [deportes, ropa] → ✅ INCLUIDO
Producto B: categories = [fitness, tecnologia] → ✅ INCLUIDO
Producto C: categories = [hogar, cocina] → ❌ EXCLUIDO
```

### status
- Filtra por estados exactos
- Puede incluir múltiples estados

### query
- Búsqueda case-insensitive en:
  - `title`
  - `description`
  - `vendor`
- Usa operador **`contains`** (búsqueda parcial)

### minPrice, maxPrice, currencyId
- Filtra productos por rango de precios en una moneda específica
- `minPrice` y `maxPrice` son **inclusivos** (greater than or equal / less than or equal)
- Si solo se especifica `minPrice`, retorna productos con precio ≥ minPrice
- Si solo se especifica `maxPrice`, retorna productos con precio ≤ maxPrice
- Si se especifican ambos, retorna productos con precio en ese rango
- `currencyId` es **requerido** cuando se usan filtros de precio, para especificar en qué moneda buscar
- Busca en variantes > precios: producto incluye resultado si tiene AL MENOS UNA variante con precio en el rango especificado

## Ejemplos de URLs Válidas

```bash
# Productos activos de categoría específica (usando slugs)
GET /products/store/store-123?categorySlugs=deportes&status=ACTIVE

# Búsqueda con texto, paginación y ordenamiento
GET /products/store/store-123?query=zapatos&page=2&limit=10&sortBy=viewCount&sortOrder=desc

# Múltiples categorías y colecciones
GET /products/store/store-123?categorySlugs=deportes,fitness&collectionIds=col-1,col-2

# Productos de proveedor específico
GET /products/store/store-123?vendor=Nike&status=ACTIVE,DRAFT

# Filtrar por rango de precio en una moneda específica
GET /products/store/store-123?minPrice=10&maxPrice=100&currencyId=curr_123

# Solo paginación básica
GET /products/store/store-123?page=1&limit=20

# Combinación de filtros: categoría + rango de precio
GET /products/store/store-123?categorySlugs=deportes&minPrice=20&maxPrice=50&currencyId=curr_usd

# Filtrar por precio mínimo solamente
GET /products/store/store-123?minPrice=25&currencyId=curr_eur
```

## Manejo de Errores

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Store with ID store-123 not found"
}
```

### 400 Bad Request (validación)
```json
{
  "statusCode": 400,
  "message": [
    "categorySlugs debe ser un array",
    "La página debe ser al menos 1",
    "minPrice debe ser mayor o igual a 0"
  ],
  "error": "Bad Request"
}
```

## Reglas de Transformación (Backend)

El backend automáticamente:
1. **Arrays de strings**: Convierte strings con comas a arrays para `categorySlugs`, `collectionIds`, `status`
   - `"cat-1,cat-2"` → `["cat-1", "cat-2"]`
   - Elimina espacios: `"cat-1, cat-2"` → `["cat-1", "cat-2"]`
   - Filtra valores vacíos: `"cat-1,,cat-2"` → `["cat-1", "cat-2"]`
   - Preserva arrays nativos: `["cat-1", "cat-2"]` → `["cat-1", "cat-2"]`

2. **Parámetros numéricos**: Convierte strings a números para `page`, `limit`, `minPrice`, `maxPrice`
   - `"?page=2"` → `page: 2`
   - `"?minPrice=10.5"` → `minPrice: 10.5`
   - Valida rangos (page ≥ 1, limit 1-100, precios ≥ 0)

3. **Filtrado de precios**: Aplica operador `some` en la relación variantes > precios
   - Producto se incluye si **AL MENOS UNA** variante tiene precio en el rango especificado
   - Ejemplo: Producto con variante $15 y variante $30, filtro `minPrice=20` → **SÍ incluye** (tiene variante $30)

## Autenticación
- Requiere `PublicKeyGuard`
- Enviar header: `X-API-Key: <public-key>`

## Rate Limiting
- Consultar con backend para límites específicos por tienda

## Consideraciones de Performance
- `limit` máximo: 100 items
- Default limit: 20 items
- Incluye relaciones completas (categories, collections, variants con prices)
- Usa índices en: `storeId`, `status`, `vendor`

