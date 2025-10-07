# Backend TODO - Mejoras Pendientes

## 🔴 CRÍTICO: Filtrado de Órdenes por Cliente

### Problema Actual
El endpoint `GET /orders/:storeId` NO soporta filtrado por cliente/customerEmail. Esto causa que:

- Se tengan que cargar TODAS las órdenes de la tienda (hasta 100)
- El filtrado se hace del lado del CLIENTE
- La paginación es del lado del CLIENTE (no escala bien)
- Afecta el rendimiento y la experiencia del usuario en el dashboard

### Solución Requerida

**Agregar parámetro `customerEmail` al endpoint de órdenes:**

```
GET /orders/:storeId?customerEmail={email}&page={page}&limit={limit}
```

### Cambios Necesarios en el Backend

#### 1. Actualizar el DTO de consulta de órdenes

```typescript
// En: src/order/dto/get-orders-query.dto.ts
export class GetOrdersQueryDto {
  // ... parámetros existentes ...
  
  @IsOptional()
  @IsEmail()
  customerEmail?: string;
}
```

#### 2. Modificar el servicio de órdenes

```typescript
// En: src/order/order.service.ts
async findByStore(storeId: string, query: GetOrdersQueryDto) {
  const where: any = { storeId };
  
  // Agregar filtro por customerEmail
  if (query.customerEmail) {
    where.customerInfo = {
      path: ['email'],
      equals: query.customerEmail
    };
  }
  
  // ... resto de la lógica de paginación y filtros ...
}
```

### Archivos Afectados en el Frontend

Una vez implementado en el backend, actualizar:

1. **`stores/mainStore.ts`**
   - Descomentar `customerEmail` en la interfaz de `fetchOrders`
   - Descomentar línea que agrega `customerEmail` a queryParams

2. **`components/dashboard/user-orders.tsx`**
   - Cambiar de paginación del cliente a paginación del servidor
   - Pasar `customerEmail: userEmail` a `fetchOrders()`
   - Usar `orders` directamente en lugar de `allUserOrders`
   - Usar `ordersPagination` del store en lugar de calcular con `totalPages`

### Beneficios de Implementar Esto

✅ Paginación real del lado del servidor  
✅ Mejor rendimiento (solo se traen las órdenes del cliente)  
✅ Escalabilidad (funciona con miles de órdenes)  
✅ Menor uso de ancho de banda  
✅ Mejor experiencia de usuario  

### Prioridad

**ALTA** - Afecta directamente la experiencia del usuario en el dashboard de pedidos.

---

## Otros TODOs

### Ordenamiento de Productos por Precio
- Actualmente deshabilitado porque el precio no es campo directo del Product
- Requiere calcular precio mínimo de las variantes
- Ver comentarios en `app/productos/_components/ProductList.tsx` líneas 176-183

---

**Última actualización:** Octubre 2025

