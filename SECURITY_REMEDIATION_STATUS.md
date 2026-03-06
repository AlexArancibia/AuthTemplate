# Estado de Remedios del Security Audit

**Audit original:** `SECURITY_AUDIT.md`  
**Última revisión:** 2025-03-06  
**Estado:** Todos los puntos cubiertos

---

## Critical

### C-01 · `NEXT_PUBLIC_API_KEY` Exposed in Client Bundle

**Estado:** ✅ Cubierto (backend)

El backend no devuelve `secret_key` cuando se usa la API key pública. La obtención de `secret_key` se hace solo server-side con `SERVER_INTERNAL_KEY` y header `X-Server-Secret`.

**Implementación:**
- `lib/culqui-pk.tsx`: `getSecretKey()` usa `fetchCulquiProviderWithCredentials()` que hace `fetch` server-side con `X-Server-Secret`
- `getPublicKey()` usa `apiClient` (expone public_key, que es pública por diseño de Culqi)

---

### C-02 · Webhook Signature Verification Can Be Bypassed

**Estado:** ✅ Cubierto

El bypass en desarrollo fue eliminado. La firma se verifica siempre.

**Implementación:**
- `app/api/webhooks/culqui/route.ts`:51-56 — No existe `skipSignatureCheck`; si `verifySignature` falla, se retorna 400 inmediatamente.

```ts
if (!verifySignature(rawBody, signature, secretKey)) {
  return NextResponse.json(
    { error: "Invalid Culqi signature" },
    { status: 400 }
  );
}
```

---

### C-03 · All Request Headers and Raw Body Logged in Webhook

**Estado:** ✅ Cubierto

Los logs no exponen headers completos, body, firma ni longitud de secret key.

**Implementación:**
- `app/api/webhooks/culqui/route.ts`:49 — Solo se loguea `bodyLength` y `hasSignature`.

```ts
logger.debug({ bodyLength: rawBody.length, hasSignature: !!signature }, "[Culqi webhook] Petición recibida");
```

---

### C-04 · Verification Token Returned in API Response

**Estado:** ✅ Cubierto

El token de verificación ya no se devuelve en la respuesta.

**Implementación:**
- `app/api/email/send-verification/route.ts`:34-38 — Respuesta sin `verificationToken`.

```ts
return NextResponse.json({
  success: true,
  message: "Email de verificación enviado correctamente",
  messageId: result.messageId,
});
```

---

## High

### H-01 · TLS Certificate Validation Disabled for SpaceMail

**Estado:** ✅ Cubierto

TLS con validación habilitada; sin SSLv3 ni `rejectUnauthorized: false`.

**Implementación:**
- `lib/nodemailer.ts`:16 — `tls: { rejectUnauthorized: true }` para todos los proveedores
- No hay `ciphers: 'SSLv3'` ni `checkServerIdentity` anulado

---

### H-02 · No Rate Limiting on Payment and Webhook Endpoints

**Estado:** ✅ Cubierto

Ambos endpoints tienen rate limiting por IP.

**Implementación:**
- `app/api/webhooks/culqui/route.ts`:34-36 — `checkRateLimit(\`webhook:${ip}\`, 100)`
- `app/api/payments/culqui/route.ts`:79-81 — `checkRateLimit(\`payment:${ip}\`, 15)`

---

### H-03 · Mass Assignment on User PATCH Endpoint

**Estado:** ✅ Cubierto

Allowlist explícita con Zod y campos sensibles excluidos.

**Implementación:**
- `app/api/users/by-email/[email]/route.ts`:79-96 — `userPatchSchema.safeParse(raw)` y construcción manual de `updateData` solo con campos permitidos
- `lib/zod.ts`:34-44 — `userPatchSchema` con `.strict()` que rechaza claves desconocidas (role, password, emailVerified, etc.)

```ts
// Campos permitidos: name, firstName, lastName, phone, company, taxId, image, acceptsMarketing
// email se acepta en el schema pero NUNCA se aplica (updateData no lo incluye)
```

---

### H-04 · CORS Origin Hardcoded with Trailing Slash

**Estado:** ✅ Cubierto

CORS desde variable de entorno; trailing slash removido.

**Implementación:**
- `app/api/payments/culqui/route.ts`:9

```ts
const CORS_ORIGIN = (process.env.CORS_ORIGIN || process.env.NEXTAUTH_URL || "https://anj.com").replace(/\/$/, "");
```

---

### H-05 · Webhook GET Endpoint Confirms Attack Surface

**Estado:** ✅ Cubierto

El webhook de Culqi no exporta un handler GET. Solo existe `POST`.

**Implementación:**
- `app/api/webhooks/culqui/route.ts` — Solo `export async function POST(...)`; no hay `export function GET`.

---

### H-06 · Internal Error Details Exposed to Clients

**Estado:** ✅ Cubierto

Respuestas de error genéricas; detalles solo en logs server-side.

**Implementación:**
- `app/api/email/verify-config/route.ts`:14-17 — `{ error: "Error interno del servidor" }`
- `app/api/email/send-verification/route.ts`:41-45 — `{ error: "Error interno del servidor" }`; `logger.error` para el detalle

---

## Medium

### M-01 · Webhook Signature Length Check Before Timing-Safe Comparison

**Estado:** ✅ Cubierto

Se normalizan ambos buffers al mismo tamaño antes de comparar; no hay early return que filtre por longitud de forma insegura.

**Implementación:**
- `app/api/webhooks/culqui/route.ts`:19-26 — Si la longitud no es la esperada, se copian a buffers de tamaño fijo y se llama `crypto.timingSafeEqual` de todos modos antes de retornar false.

---

### M-02 · Checkout Step Can Be Skipped via URL Parameter

**Estado:** ✅ Cubierto

El paso inicial se controla con `sessionStorage`, no con query params.

**Implementación:**
- `app/checkout/page.tsx`:156-168 — `sessionStorage.getItem("checkout_from_login")`; `searchParams.get('fromLogin')` ya no se usa para determinar el paso inicial.

---

### M-03 · `send-verification` Endpoint Has No Authentication

**Estado:** ✅ Cubierto (auth por secreto interno)

El endpoint requiere header interno; no es accesible sin el secreto.

**Implementación:**
- `app/api/email/send-verification/route.ts`:6, 10-13 — Requiere `x-send-verification-internal-secret` = `SEND_VERIFICATION_INTERNAL_KEY`; retorna 401 si falta o no coincide
- Rate limiting por IP: `checkRateLimit(\`send-verification:ip:${ip}\`, 15)`

---

### M-04 · Email Verification Token Not Invalidated After Use

**Estado:** ✅ Cubierto

El token se elimina tras un uso correcto.

**Implementación:**
- `app/api/auth/verify-email/route.ts`:49-54 — `db.verificationToken.delete` después de actualizar `user.emailVerified`

---

### M-05 · SSRF Pattern — Internal Self-HTTP Call

**Estado:** ✅ Cubierto

Se usa llamada directa en lugar de HTTP interno.

**Implementación:**
- `auth.config.ts`:79-84 — `sendVerificationEmail({...})` importada de `@/lib/send-verification`
- `lib/send-verification.ts` — Función compartida usada por ruta API y auth.config

---

## Low

### L-01 · Predictable Request ID

**Estado:** ✅ Cubierto

Se usa `crypto.randomUUID()` para el ID de petición.

**Implementación:**
- `app/api/payments/culqui/route.ts`:75 — `const requestId = \`req-${crypto.randomUUID()}\`;`

---

### L-02 · Weak Email Regex

**Estado:** ✅ Cubierto

Validación con Zod `.email()`.

**Implementación:**
- `app/api/payments/culqui/route.ts`:126 — `z.string().email().safeParse(email).success`

---

### L-03 · No CSRF Tokens on State-Changing Forms

**Estado:** ✅ Cubierto (SameSite)

Sesión con SameSite=Lax para mitigar CSRF.

**Implementación:**
- `auth.config.ts`:102-108

```ts
cookies: {
  sessionToken: {
    options: {
      sameSite: "lax",
    },
  },
},
```

---

### L-04 · Verbose Payment Logging

**Estado:** ✅ Cubierto (L-05)

Logging estructurado sin token ni email en logs; datos sensibles redactados.

**Implementación:**
- `app/api/payments/culqui/route.ts` — Usa `logger`; se loguea `hasToken`, no el valor del token
- `lib/logger.ts` — Redacta `email`, `token`, `password`, `secret`, etc.

---

### L-05 · `console.log` Statements in Production Code

**Estado:** ✅ Cubierto

Logger estructurado con pino; nivel `warn` en producción.

**Implementación:**
- `lib/logger.ts` — Logger con pino, `LOG_LEVEL`, redacción de PII
- Rutas API, acciones, libs migradas a `logger.debug/info/warn/error`

---

## Resumen

| Severidad | Total | Cubiertos |
|-----------|-------|-----------|
| Critical  | 4     | 4         |
| High      | 6     | 6         |
| Medium    | 5     | 5         |
| Low       | 5     | 5         |
| **Total** | **20**| **20**    |

---

## Variables de entorno relevantes

| Variable                         | Uso                                        |
|----------------------------------|--------------------------------------------|
| `CORS_ORIGIN`                    | Origen CORS para payments                  |
| `SEND_VERIFICATION_INTERNAL_KEY` | Auth interna para send-verification        |
| `SERVER_INTERNAL_KEY`            | Auth server-side para payment-providers    |
| `LOG_LEVEL`                      | Nivel del logger (default: warn en prod)   |
