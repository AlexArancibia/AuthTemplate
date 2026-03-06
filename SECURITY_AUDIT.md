# Security Audit Report — Branch `anjsports`

**Date:** 2026-03-02
**Branch:** `anjsports` vs `main`
**Scope:** All changed files in the branch, with focus on payment processing, authentication, webhooks, and API endpoints.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 4 |
| High | 6 |
| Medium | 5 |
| Low | 5 |
| **Total** | **20** |

---

## Critical

---

### C-01 · `NEXT_PUBLIC_API_KEY` Exposed in Client Bundle

**File:** `lib/axiosConfig.ts:25-26`

```ts
if (process.env.NEXT_PUBLIC_API_KEY) {
  config.headers["Authorization"] = `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
}
```

Any variable prefixed with `NEXT_PUBLIC_` is compiled into the client-side JavaScript bundle and is fully visible to anyone who opens DevTools or reads the minified source. This key is sent as the `Authorization` header on **every** API request — including the one that retrieves the Culqi secret key (`lib/culqui-pk.tsx:20`).

**Attack chain:**
1. Attacker visits the site and opens `Network` → `JS bundle`
2. Extracts `NEXT_PUBLIC_API_KEY`
3. Calls `GET /payment-providers/<storeId>` with that key
4. Receives the Culqi `secret_key` (used to charge cards server-side)

**Remediation:**
- Move the API key to a server-only environment variable (no `NEXT_PUBLIC_` prefix).
- Proxy all backend calls through Next.js API routes so the key never reaches the browser.
- Rotate the key immediately.

---

### C-02 · Webhook Signature Verification Can Be Bypassed

**File:** `app/api/webhooks/culqui/route.ts:51-70`

```ts
const isDevelopment = process.env.NODE_ENV === "development";
const skipSignatureCheck = isDevelopment && !signature;

if (!verifySignature(rawBody, signature, secretKey)) {
  if (!skipSignatureCheck) {          // ← bypass condition
    return NextResponse.json({ error: "Invalid Culqi signature" }, { status: 400 });
  }
  console.warn("[Culqi webhook] Saltando verificación de firma en desarrollo");
}
```

If a production deployment is made without setting `NODE_ENV=production` (common in misconfigured Docker images, Railway, Render, etc.), any unauthenticated request with no `x-culqi-signature` header will pass signature validation entirely. An attacker can then trigger refunds, void orders, or spam the handler at will.

**Remediation:**
- Remove the bypass completely. Signature must always be verified.
- If you need testability, use a dedicated test secret key instead of skipping verification.

---

### C-03 · All Request Headers and Raw Body Logged in Webhook

**File:** `app/api/webhooks/culqui/route.ts:38-64`

```ts
// Headers log — includes Authorization, Cookie, etc.
console.log("[Culqi webhook] Headers recibidos:", {
  allHeaders,                               // ← every header in plain text
  signatureHeader: signature,
  bodyPreview: rawBody.substring(0, 200),   // ← raw payment payload fragment
});

// On failed signature:
console.error("[Culqi webhook] Firma inválida", {
  signatureValue: signature,                // ← full HMAC signature exposed
  bodyPreview: rawBody.substring(0, 200),
  secretKeyLength: secretKey?.length,
});
```

If application logs are shipped to an external service (Datadog, Sentry, Logtail, etc.), the HMAC signature and request body — which may contain card charge data — are transmitted and stored in plain text. The leaked signature can be replayed or used to understand the signing mechanism.

**Remediation:**
- Remove `allHeaders` from logs entirely.
- Remove `bodyPreview` — log only `bodyLength`.
- Remove `signatureValue` — log only `hasSignature: boolean`.
- Remove `secretKeyLength` — it reveals characteristics of the key.

---

### C-04 · Verification Token Returned in API Response

**File:** `app/api/email/send-verification/route.ts:45-50`

```ts
return NextResponse.json({
  success: true,
  message: "Email de verificación enviado correctamente",
  messageId: result.messageId,
  verificationToken: token,    // ← token sent back to caller
})
```

The endpoint is public (listed in `middleware.ts` `publicRoutes`). Any caller — including a registered user calling this endpoint directly with someone else's email — receives the verification token in the response body. They can then verify the victim's account without access to their inbox.

Additionally, the error path also leaks internals:
```ts
// Line 56
details: error instanceof Error ? error.message : "Error desconocido"
```

**Remediation:**
- Remove `verificationToken` from the response entirely. The token's only valid delivery channel is email.
- Remove `details` from error responses; keep it server-side.

---

## High

---

### H-01 · TLS Certificate Validation Disabled for SpaceMail

**File:** `lib/nodemailer.ts:16-22`

```ts
...(isSpaceMail ? {
  tls: {
    rejectUnauthorized: false,     // ← MitM attacks possible
    ciphers: 'SSLv3',              // ← SSLv3 deprecated since RFC 7568 (2015)
    checkServerIdentity: () => undefined,
    servername: undefined
  },
```

With `rejectUnauthorized: false` and SSLv3, email traffic (including SMTP credentials and email content) can be intercepted by a network attacker using a forged certificate. SSLv3 is vulnerable to POODLE.

**Remediation:**
- Set `rejectUnauthorized: true` unconditionally.
- Remove `ciphers: 'SSLv3'` — use the Node.js default (TLS 1.2+).
- If the SpaceMail server has a certificate issue, fix the server; don't disable client-side validation.

---

### H-02 · No Rate Limiting on Payment and Webhook Endpoints

**Files:** `app/api/payments/culqui/route.ts`, `app/api/webhooks/culqui/route.ts`

Neither endpoint has rate limiting middleware. This allows:
- Brute-force card testing (carding attacks) — attacker cycles stolen card numbers through the payment endpoint
- Webhook flooding to trigger repeated order status updates
- Amplified charges to the payment processor (Culqi charges per API call)

**Remediation:**
- Apply rate limiting middleware (e.g., `@upstash/ratelimit` with Redis, or `next-rate-limit`).
- Suggested limits: payment endpoint ≤ 5 req/IP/min; webhook endpoint ≤ 60 req/min globally.
- Return `429 Too Many Requests` on violation.

---

### H-03 · Mass Assignment on User PATCH Endpoint

**File:** `app/api/users/by-email/[email]/route.ts` (PATCH handler)

```ts
const data = await request.json()
// ...
const updatedUser = await db.user.update({
  where: { email },
  data,    // ← raw request body passed directly to Prisma
})
```

Any authenticated user can modify their own record with arbitrary fields: `role`, `emailVerified`, `password`, `id`, `createdAt`, etc. A user could escalate their own role to admin or mark their email as verified without going through the email verification flow.

**Remediation:**
- Define an explicit allowlist of editable fields (e.g., `name`, `phone`).
- Parse and validate with Zod before passing to Prisma.
- Never pass `request.json()` directly to an ORM `update` call.

---

### H-04 · CORS Origin Hardcoded with Trailing Slash

**File:** `app/api/payments/culqui/route.ts:3`

```ts
const CORS_ORIGIN = "https://anj.com/";  // trailing slash
```

`https://anj.com/` and `https://anj.com` are treated as different origins by some browsers and server implementations. This can silently block legitimate requests or, if the validation logic normalizes the value, allow unintended origins. The value is also hardcoded and cannot be changed per environment without a code deploy.

**Remediation:**
- Remove the trailing slash: `"https://anj.com"`.
- Source the value from an environment variable: `process.env.CORS_ORIGIN`.
- Validate the incoming `Origin` header against a whitelist on the server side instead of relying solely on `Access-Control-Allow-Origin`.

---

### H-05 · Webhook GET Endpoint Confirms Attack Surface

**File:** `app/api/webhooks/culqui/route.ts:270-275`

```ts
export function GET() {
  return NextResponse.json({ message: "Culqi webhook endpoint" }, { status: 200 });
}
```

This endpoint serves no functional purpose and confirms to automated scanners that the webhook path exists and is active. It also slightly enlarges the attack surface.

**Remediation:**
- Remove the GET handler entirely. Webhook endpoints should only accept POST.

---

### H-06 · Internal Error Details Exposed to Clients

**Files:**
- `app/api/email/verify-config/route.ts:14-17`
- `app/api/email/send-verification/route.ts:55-57`

```ts
// verify-config
return NextResponse.json({
  error: "Error verificando configuración",
  details: error instanceof Error ? error.message : String(error)  // ← stack / config details
}, { status: 500 })

// send-verification
details: error instanceof Error ? error.message : "Error desconocido"
```

Node.js error messages often contain file paths, module names, connection strings, and server-side configuration. Exposing them in HTTP responses helps attackers map the backend.

**Remediation:**
- Return only a generic message to the client (`"Error interno del servidor"`).
- Log the full error server-side only.

---

## Medium

---

### M-01 · Webhook Signature Length Check Before Timing-Safe Comparison

**File:** `app/api/webhooks/culqui/route.ts:17-19`

```ts
if (signatureBuffer.length !== computedBuffer.length) {
  return false;    // ← returns early, different timing from successful path
}
return crypto.timingSafeEqual(signatureBuffer, computedBuffer);
```

The early exit on length mismatch creates a timing discrepancy. The code correctly uses `timingSafeEqual` for the value comparison but the preceding length check leaks information via response time. In practice, HMAC-SHA256 hex output is always 64 characters, so this only matters if Culqi sends a non-hex signature format.

**Remediation:**
- Pad or normalize both buffers to the same length before comparison, then use a single `timingSafeEqual` call.
- Alternatively, always compute the HMAC and compare unconditionally.

---

### M-02 · Checkout Step Can Be Skipped via URL Parameter

**File:** `app/checkout/page.tsx:143-147`

```ts
const getInitialStep = () => {
  const fromLogin = searchParams.get('fromLogin')
  return fromLogin === 'true' ? STEPS.CUSTOMER_INFO : STEPS.CART_REVIEW
}
```

Any user can navigate to `/checkout?fromLogin=true` to skip the cart review step. While payment validation must also be passed, skipping steps may bypass client-side price recalculation and coupon validation that runs only in specific steps.

**Remediation:**
- Drive step transitions from authenticated session state, not URL query parameters.
- Perform all price and coupon validation server-side at order creation time regardless of which step the client claims to be on.

---

### M-03 · `send-verification` Endpoint Has No Authentication

**File:** `app/api/email/send-verification/route.ts` + `middleware.ts`

The `/api/email/send-verification` endpoint is listed in `publicRoutes` in `middleware.ts`, meaning no session is required to call it. Any actor can call it with an arbitrary `email` value and trigger sending of verification emails to any address — a classic email-spam-abuse vector.

**Remediation:**
- Require an authenticated session or a short-lived CSRF-bound token to call this endpoint.
- Add rate limiting per IP and per target email address.
- Move the verification logic to a server action that runs only in the context of a just-registered user.

---

### M-04 · Email Verification Token Not Invalidated After Use

**File:** `app/api/auth/verify-email/route.ts`

The token validation does not delete or mark the token as consumed after a successful verification. If a token is leaked (e.g., via browser history, referrer header, or log), it can be replayed.

**Remediation:**
- Delete the token from `verificationToken` table immediately after successful verification.
- Add a `usedAt` timestamp field and reject already-used tokens.

---

### M-05 · SSRF Pattern — Internal Self-HTTP Call

**Files:** `actions/auth-action.ts:78-93`, `auth.config.ts:83`

```ts
const response = await fetch(
  `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email/send-verification`,
  { method: 'POST', ... }
)
```

A server action making an HTTP request to itself using a configurable URL is an SSRF pattern. If `NEXTAUTH_URL` is misconfigured or an attacker can influence it, the fetch could target an internal network address. This also adds unnecessary network latency and a potential failure point.

**Remediation:**
- Call the email sending logic directly as a function import instead of via HTTP.
- This eliminates both the SSRF risk and the extra network hop.

---

## Low

---

### L-01 · Predictable Request ID

**File:** `app/api/payments/culqui/route.ts:72`

```ts
const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

`Math.random()` is not cryptographically secure. Request IDs built from predictable values are guessable, which may allow log spoofing or request correlation attacks.

**Remediation:**
- Use `crypto.randomUUID()` which is available in Node.js 15.6+ and the Web Crypto API.

---

### L-02 · Weak Email Regex

**File:** `app/api/payments/culqui/route.ts:124`

```ts
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { ... }
```

This regex is too permissive and accepts structurally invalid email addresses (e.g., `a@b.c` with single-char TLD, or `a@@b.com`). More critically, it does not sanitize the value before it is passed to Culqi, where unexpected characters could trigger API errors.

**Remediation:**
- Use a well-tested library such as `zod`'s `.email()` validator or the `validator.js` `isEmail` function.

---

### L-03 · No CSRF Tokens on State-Changing Forms

**Files:** Authentication forms, PATCH endpoints

Next-Auth provides some CSRF protection via its session token mechanism, but state-changing API routes (PATCH `/api/users/...`) do not explicitly validate a CSRF token. If a session cookie has `SameSite=None` or the app is embedded in an iframe, cross-site request forgery is possible.

**Remediation:**
- Verify `SameSite=Strict` or `SameSite=Lax` is set on session cookies (check Next-Auth configuration).
- Add an explicit `x-csrf-token` header requirement to all state-changing endpoints.

---

### L-04 · Verbose Payment Logging

**File:** `app/api/payments/culqui/route.ts:89-100`

```ts
console.log("[Culqi Payment] Body recibido", {
  emailPrefix: email ? `${email.slice(0, 3)}***` : "",
  tokenPrefix: token ? `${String(token).slice(0, 12)}...` : "(vacío)",
  tokenLength: token ? String(token).length : 0,
});
```

Token length and the first 12 characters of the payment token are logged. Even partial token exposure in log aggregation systems reduces the security of the tokenization scheme.

**Remediation:**
- Log only `hasToken: boolean` and `tokenType: string` (e.g., `"culqi_token"`).
- Never log email addresses, names, or addresses even in partial form.

---

### L-05 · `console.log` Statements in Production Code

Multiple API routes and the auth action use extensive `console.log` for debugging. In production, these entries pollute log systems, increase costs, and risk leaking PII if the log level is not filtered.

**Remediation:**
- Replace `console.log/warn/error` with a structured logger (e.g., `pino`, `winston`) that supports log levels and can redact sensitive fields.
- Set the default level to `warn` in production.

---

## Recommendations by Priority

### Immediate (before next production deploy)

1. **Rotate all credentials** — Culqi keys, database password, Google OAuth secret, Resend API key, SMTP password. Assume all are compromised.
2. **Remove `NEXT_PUBLIC_API_KEY`** — Move backend auth to a server-side proxy. The current setup exposes the key that is used to retrieve the Culqi secret key.
3. **Remove `verificationToken` from the send-verification response** (C-04).
4. **Remove the signature bypass** in the webhook (C-02).
5. **Remove `allHeaders` and `bodyPreview` from webhook logs** (C-03).

### Short-term (within the sprint)

6. Add **rate limiting** to payment and webhook endpoints (H-02).
7. Fix the **PATCH mass assignment** on the user endpoint (H-03).
8. Restrict the `send-verification` endpoint to **authenticated callers only** (M-03).
9. **Invalidate tokens after use** in the email verification flow (M-04).
10. Fix **TLS configuration** for SpaceMail — `rejectUnauthorized: true`, remove SSLv3 (H-01).

### Medium-term

11. Replace self-HTTP calls with **direct function imports** (M-05).
12. Replace `Math.random()` IDs with `crypto.randomUUID()` (L-01).
13. Implement a **structured logger** with redaction and log levels (L-05).
14. Review all CORS origins and move values to environment variables (H-04).
15. Add explicit **field allowlists** to all Prisma update calls.

---

*Generated by automated diff analysis and manual code review of the `anjsports` branch.*
