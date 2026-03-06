## Código muerto y rutas no utilizadas en AuthTemplate

Este documento resume el código relacionado con **refunds** y **payment-transactions** que, a fecha del análisis, no tiene uso real dentro de este repositorio.

### Metodología

- Búsqueda de símbolos con `Grep`/`rg` en todo `AuthTemplate`.
- Para cada función:
  - Localizar su **definición**.
  - Buscar todas sus **referencias** (imports, llamadas).
  - Si solo aparece en su propio fichero (declaración/implementación) y no hay llamadas, se marca como **código muerto**.
- Para endpoints:
  - Revisar las URLs usadas con `apiClient` (`/refunds`, `/payment-transactions`, etc.).
  - Comparar con los endpoints disponibles en el backend `sportt-nest-backend`.

---

### 1. Refunds

#### 1.1. Método `createRefund` en `stores/mainStore.ts`

- **Ubicación**: `stores/mainStore.ts`
- **Definición**:

```984:992:c:\Users\User\Documents\AuthTemplate\stores\mainStore.ts
createRefund: async (data: any) => {
  set({ loading: true, error: null })
  try {
    await apiClient.post("/refunds", data)
    set({ loading: false })
  } catch (error) {
    set({ error: "Failed to create refund", loading: false })
    throw error
  }
},
```

- **Búsqueda de usos**:
  - `Grep` de `createRefund(` en todo el repo devuelve solo:
    - La **firma** en la interfaz del store.
    - La **implementación** anterior.
  - No hay componentes, hooks ni páginas que llamen a `createRefund`.

- **Conclusión**:
  - Este método es **código muerto** en `AuthTemplate`.
  - El endpoint de backend `POST /refunds` **no se usa** desde este frontend.

---

### 2. Payment Transactions

#### 2.1. Método `fetchPaymentTransactions` en `stores/mainStore.ts`

- **Ubicación**: `stores/mainStore.ts`
- **Definición**:

```646:655:c:\Users\User\Documents\AuthTemplate\stores\mainStore.ts
// Método fetchPaymentTransactions con paginación
fetchPaymentTransactions: async (params: SearchPaymentTransactionParams = {}, forceRefresh = false) => {
  if (!STORE_ID) {
    throw new Error("No store ID provided in environment variables")
  }

  set({ loading: true, error: null })
  try {
    const queryParams = buildQueryParams(params)
    const response = await apiClient.get<PaginatedResponse<PaymentTransaction>>(`/payment-transactions/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`)
    ...
```

- **Búsqueda de usos**:
  - `Grep` de `fetchPaymentTransactions(` en todo el repo no devuelve llamadas, solo la definición y la firma en la interfaz del store.
  - El estado `paymentTransactions` se declara en el store y en algunos tipos (`types/order.ts`, `types/payments.ts`), pero no hay componentes que:
    - Llamen a `fetchPaymentTransactions`.
    - Lean `paymentTransactions` para renderizar algo.

- **Conclusión**:
  - `fetchPaymentTransactions` y el slice `paymentTransactions` del store están **definidos pero sin uso real** en la UI.
  - Los endpoints de backend `GET /payment-transactions/:storeId` no se consumen desde `AuthTemplate`.

---

### 3. Resumen por endpoint backend

En relación con el backend `sportt-nest-backend`:

- **Refunds (`/refunds`)**
  - `POST /refunds`: **expuesto en el store** (`createRefund`) pero **no usado** en ningún flujo de UI.
  - Resto de endpoints de refunds: **no tienen llamadas** desde este repo.

- **Payment Transactions (`/payment-transactions`)**
  - `GET /payment-transactions/:storeId`: **preparado** en `fetchPaymentTransactions`, pero **no invocado**.
  - `POST/PUT/DELETE /payment-transactions...`: sin referencias en `AuthTemplate`.

En cambio, los **Payment Providers** (`/payment-providers/:storeId`) sí se usan activamente (checkout, sidebar, etc.), por lo que no se consideran aquí como código muerto.

---

### 4. Recomendaciones

- Si no se planea implementar un flujo de UI para:
  - crear refunds desde `AuthTemplate`, o
  - listar transacciones de pago en este frontend,
  
  entonces:
  - Se puede **eliminar** `createRefund` y `fetchPaymentTransactions` del store para reducir complejidad.
  - O bien marcarlos explícitamente como **“para uso futuro”** en comentarios y documentación, si quieres mantenerlos como utilidades preparadas.

