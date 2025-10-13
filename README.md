This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 📚 Documentación Importante

### Migración API (v2.0.0)
El backend ahora envuelve todas las respuestas en un formato estandarizado. **Lee esta documentación antes de trabajar con el store:**

- **[Guía de Migración Completa](./API_RESPONSE_MIGRATION_GUIDE.md)** - Detalles completos de los cambios
- **[Referencia Rápida de API Helpers](./API_HELPERS_QUICK_REFERENCE.md)** - Para desarrollo diario
- **[Changelog](./CHANGELOG_FRONTEND.md)** - Historial de cambios

### 🎯 Quick Start: API Helpers

```typescript
import { extractApiData, extractPaginatedData } from "@/lib/apiHelpers"

// Para respuestas simples
const product = extractApiData<Product>(response)

// Para respuestas paginadas
const { data, pagination } = extractPaginatedData<Product[]>(response)
```

**Importante:** Todos los métodos del store ya están actualizados. No necesitas cambiar código existente.

## Environment Setup

Before running the application, you need to create a `.env.local` file in the root directory with the following variables:

```env
# Backend Configuration
NEXT_PUBLIC_BACKEND_ENDPOINT=your-backend-url-here
NEXT_PUBLIC_API_KEY=your-api-key-here
NEXT_PUBLIC_STORE_ID=your-store-id-here
```

Replace the placeholder values with your actual configuration:
- `NEXT_PUBLIC_BACKEND_ENDPOINT`: Your backend API URL (e.g., `http://localhost:8000/api` or `https://your-api.com/api`)
- `NEXT_PUBLIC_API_KEY`: Your API authentication key
- `NEXT_PUBLIC_STORE_ID`: Your store ID for fetching store-specific data

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
