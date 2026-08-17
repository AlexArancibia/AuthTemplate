---
name: scentra-design
description: Sistema de diseño y UI/UX para el storefront de Scentra (perfumería de lujo accesible, Perú). Úsalo SIEMPRE al construir o modificar páginas, componentes o estilos del storefront en el repo AuthTemplate (rama scentra) — define tokens de color, tipografía, spacing, motion, specs de componentes (ProductCard, ficha de perfume con pirámide olfativa, hero, mega-menú, catálogo) y el mapeo de secciones del Page Builder V2 → React. Incluye los datos reales de la tienda (storeId, endpoint, categorías, colecciones, moneda).
---

# Scentra — Sistema de Diseño del Storefront

Storefront de **Scentra** (`scentra.pe`), perfumería de autor en Perú: fragancias árabes, de diseñador y de nicho, 100% originales. Repo: `AuthTemplate`, rama `scentra`. Stack: Next.js 15 (App Router), React 19, Tailwind v4, shadcn/ui, Embla, Framer Motion, NextAuth v5, Zustand.

## Dirección estética (no negociable)

**"Lujo accesible, minimalismo moderno"** — el estilo de las referencias elegidas por el dueño: `beautyhouse.com` y `sentua.com` (perfumería/beauty peruana). Ni frío/austero ni juguetón. El principio rector es **restraint (contención)**: el lujo se percibe por lo que quitas, no por lo que agregas.

Las 6 reglas que separan "premium" de "barato" (regla → aplicación):
1. **Mucho aire.** Espacio en blanco intencional alrededor de tipografía e imágenes. Padding de sección generoso (96–160px en desktop). Vacío sin razón compositiva = barato; vacío intencional = caro.
2. **Imagen grande y escasa** > grid denso. En catálogo, **3–4 columnas máx** (nunca 5+). Cards grandes.
3. **Tipografía contenida.** 2 familias máximo. Pesos ligeros (300–500), nunca black. Tracking generoso en mayúsculas/eyebrows.
4. **Color sobrio.** Fondo claro dominante, acentos metálicos cálidos con moderación. Descuentos discretos (ver más abajo) — nada de rojos chillones ni badges enormes.
5. **Deseo antes que especificación.** En la ficha, primero la emoción (imagen + nombre evocador + descripción sensorial); las specs técnicas accesibles pero más abajo.
6. **Motion sutil.** Fades/reveals suaves al scroll, hover discreto en cards, carrusel con autoplay lento. Nada agresivo, nada de parallax pesado.

> Honestidad sobre las fuentes (research adversarial, jun-2026): lo MEJOR verificado (Baymard, NN/g) es: filtrado por familia olfativa, 3–4 columnas, y hover-swap de thumbnail (cut-out ↔ lifestyle). Las recomendaciones tipográficas concretas son **heurísticas de diseño**, no leyes empíricas; el pairing exacto "Playfair+Montserrat" y el sistema "serif+sans+script" fueron **refutados** como reglas universales. Las decisiones de fuentes abajo son elecciones de diseño deliberadas para Scentra, no verdades probadas.

## Tokens de color

**Dirección definitiva (elegida por el dueño):** monocromo **negro / blanco / gris claro + UN acento configurable**. Como las mejores referencias. El acento por defecto es `#A5CA3F` (verde lima fresco/moderno) pero **debe ser configurable cambiando UNA variable** (`--brand` en globals.css). Esto reemplaza la idea previa de dorado/plum.

```css
/* Acento de marca — CONFIGURABLE (cambiar solo aquí) */
--brand:            #A5CA3F;  /* acento: CTAs, links activos, underlines, focus ring, badges */
--brand-dark:       #8FB332;  /* hover/active del acento */
--brand-foreground: #14140F;  /* texto sobre el acento (casi negro, el lima es claro) */

/* Monocromo */
--background:        #FFFFFF;
--foreground:        #0A0A0A;  /* casi negro — texto y titulares */
--primary:           #0A0A0A;  /* negro — botones primarios, fondos oscuros */
--primary-foreground:#FFFFFF;
--secondary:         #F4F4F5;  /* gris claro — superficies alternas */
--muted:             #F5F5F4;  /* gris claro — fondos de sección */
--muted-foreground:  #71717A;  /* gris medio — texto secundario, marca/vendor, captions */
--border:            #E7E7E7;  /* gris claro — bordes 1px, divisores */
--ring:              var(--brand);  /* focus = acento */
```

En Tailwind v4 (`@theme inline`) exponer `--color-brand`, `--color-brand-dark`, `--color-brand-foreground` → utilidades `bg-brand`, `text-brand`, `border-brand`. **NO** repurposees el `--accent` de shadcn (lo usan los componentes para hover gris) — el acento de marca es token aparte `--brand`.

**Reglas de color premium:** el acento con cuentagotas (CTAs, 1px underlines, iconos, dot de "in stock", focus). Negro para titulares y botones principales; gris para texto secundario; mucho blanco. Descuentos discretos: precio original en `muted-foreground` tachado + precio actual en `foreground`; badge `-X%` pequeño en esquina (negro o brand) — **nunca rojo grande**.

## Tipografía

Dos familias. AuthTemplate hoy usa Druk Wide + AdihausDIN (de ANJ Sports) — **reemplazar** por:

- **Display / titulares (serif elegante, alto contraste):** `Cormorant Garamond` (Google Fonts, gratis). Para H1/H2, hero, momentos editoriales. Pesos 400/500. Tracking ligero (0.01–0.02em). line-height apretado (1.05–1.15).
- **UI / cuerpo (sans geométrica):** `Montserrat` (coincide con la lectura de beautyhouse/sentua) — o alternativa más refinada `Geist`/`Inter` si se quiere menos genérico. Pesos 300/400/500. Cuerpo 16px, line-height 1.5–1.6.
- **Eyebrows / labels:** Montserrat 500 en MAYÚSCULAS, tracking 0.12–0.18em, 12px.

Cargar con `next/font/google` en `app/layout.tsx` como variables (`--font-display`, `--font-sans`) y exponerlas en `@theme`.

**Escala tipográfica** (ratio ~1.25–1.333, contenida):

| Token | px (móvil → desktop) | familia | peso | line-height |
|---|---|---|---|---|
| caption | 12 | sans | 400 | 1.4 |
| body | 16 | sans | 400 | 1.55 |
| lead | 18 → 20 | sans | 400 | 1.5 |
| h3 | 20 → 24 | display | 500 | 1.2 |
| h2 | 28 → 40 | display | 500 | 1.15 |
| h1 | 36 → 64 | display | 400/500 | 1.05 |
| eyebrow | 12 | sans caps | 500 | 1 |

## Escala de spacing

Base 4/8, pero **generosa** en el extremo alto. Tokens: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160`. Padding de sección: **64–96px móvil, 96–160px desktop**. Gap de grid de productos: 24–32px. Contenedor máx: `max-w-screen-2xl` centrado (ya existe `.content-section` / `.container-section` en globals.css — reutilizar).

## Motion (Framer Motion, ya instalado)

- **Reveal al scroll:** fade + translateY(16px), duración 0.5–0.7s, ease `[0.22, 1, 0.36, 1]`, `once: true`, stagger 0.06–0.1s entre items.
- **Hover card:** elevación sutil (shadow) + `scale(1.01)` imagen, 0.3s. Sin saltos bruscos.
- **Carrusel (Embla):** autoplay lento (5–6s), transición suave. Ya hay `embla-carousel-autoplay`.
- Respetar `prefers-reduced-motion`.

## Specs de componentes

### ProductCard (el componente más importante)
- Imagen **protagonista** (~70% de la altura del card), fondo blanco/ivory, ratio 3:4 o 1:1 consistente.
- **Hover-swap** (verificado por Baymard/NN/g): imagen por defecto = cut-out (producto sobre blanco); al hover muestra la 2ª imagen (`imageUrls[1]`, lifestyle/segundo ángulo) con pequeño delay para evitar flicker. **Fallback móvil:** sin hover → mostrar indicadores/segunda imagen en mini-carrusel o nada.
- Debajo: marca (`vendor`) en eyebrow/muted; nombre del producto en display 500 (2 líneas máx, truncar); precio.
- **Precio:** mínimo de las variantes. Si hay `originalPrice` > `price`: original tachado en muted + actual en ink, badge `-X%` pequeño en esquina (plum). Formato `S/ 1,058.40` (PEN, símbolo BEFORE, 2 decimales).
- Wishlist (corazón) arriba-derecha, sutil — `enableWishlist` está activo en la tienda.
- CTA "Agregar" discreto, aparece en hover en desktop (visible en móvil).

### Hero
- Full-width, carrusel de slides. Imagen editorial/lifestyle, texto mínimo: eyebrow + H1 (display) + 1 línea + 1 CTA. Overlay `plum` semitransparente si la imagen compite con el texto. Alto ~70–85vh desktop.

### Catálogo / Listing (`/productos`)
- Grid **3–4 columnas** desktop (no 5+), 2 móvil. Cards grandes.
- **Sidebar de filtros** (ya existe `ProductFilterSidebar`): adaptar para perfumería. Filtros: Marca (`vendor`, 37 marcas), Categoría, Colección, Precio. **Añadir "Comprar por aroma"** (familia olfativa: Frescos & Cítricos, Maderas & Oud, Gourmands, etc. — mapean a colecciones existentes) — patrón verificado como clave en perfumería.
- Filtros vía API: `categorySlugs`, `collectionIds`, `vendor`, `minPrice/maxPrice`, `query`, `sortBy`, `page/limit`.

### Ficha de producto / PDP (`/productos/[slug]`) — diseño fragancia-específico
Orden **deseo-primero** (verificado):
1. **Above the fold:** galería de imágenes grande (izq) + a la derecha: marca → nombre (display grande) → descripción sensorial corta → selector de **tamaño** (variantes: 75ml, 250ml… como swatches/botones con precio por variante) → precio → CTA "Agregar al carrito". Envío gratis desde S/199 (mostrar incentivo).
2. **Pirámide olfativa** (componente `OlfactoryPyramid`): 3 niveles — **Salida** (top, fugaz, ~5–15min), **Corazón** (heart, carácter, 2–3h), **Fondo** (base, estela, horas). Chips de notas por nivel. Enmarcar como "historia en tres actos". ⚠️ **Las notas NO están estructuradas en la API** (viven en el texto de `description`) — parsearlas del texto o añadir campo `attributes`/metadata después. Mientras tanto, render condicional: si no hay notas estructuradas, mostrar descripción rica.
3. Specs técnicas (concentración, tamaño, género) accesibles **debajo**, no escondidas.
4. Productos relacionados (misma colección/categoría), carrusel.

### Header + Mega-menú
- Sticky. Logo centrado o izq, search e iconos (cuenta, wishlist, cart) a la derecha. Barra de anuncio arriba (envío gratis S/199).
- Mega-menú por las 4 categorías raíz (Nicho, Diseñador, Árabes, Sets) con sub Unisex/Mujer/Hombre + destacar colecciones. (El research NO confirmó un umbral exacto para mega-menú vs dropdown — decisión de diseño; el mega-menú encaja por la cantidad de marcas/colecciones.)

### Footer
- Fondo `plum`, texto `on-dark`, dorado para acentos. Newsletter, links legales (ya hay 9 páginas en PBV2), redes (IG `@scentra.pe`, TikTok, FB), contacto.

## Integración Page Builder V2

El storefront **debe renderizar** las páginas diseñadas en el CMS (sportt-cms). La home (`inicio`) y 9 páginas más ya existen y están publicadas.

**Endpoint público:** `GET {BACKEND}/page-builder-v2/{storeId}/pages/{slug}` → `{ data: { content: { sections: [], theme: {} } } }`.

**Modelo:** `content.sections[]` ordenado por `order`; cada `section = { id, type, label, order, data }`. `content.theme` = tokens de color a nivel página (sobreescriben los defaults). 18 tipos de sección; la home usa: `HERO, STATS, CARDS, IMAGE_CAROUSEL, TESTIMONIALS, FAQ, FOOTER`.

**Renderer:** crear `components/page-builder/SectionRenderer.tsx` con un mapa `type → componente`. Cada componente recibe `data` y aplica el theme de la página + estos tokens. Tipos commerce (`PRODUCT_CAROUSEL, COLLECTION_CAROUSEL, CATEGORY_GRID`, y `CARDS`/`IMAGE_CAROUSEL` en modo catálogo) resuelven productos desde la API (filtros por categoría/colección).

**Regla del dueño (importante):** NO limitarse a las secciones del builder. Se pueden "reconstruir bloques": una sección del builder puede expandirse en varias secciones reales más ricas en la página. El builder define *intención y contenido*; el storefront tiene libertad de render premium. Tipos de `data` por sección están documentados en `sportt-cms/types/pageBuilderV2.ts` y `lib/page-builder-v2/` (catalog templates con vars `{{product.title}}`, `{{product.imageUrl}}`, `{{product.priceRange}}`, etc.).

## Datos reales de la tienda (para integración)

- **storeId:** `store_a65065b5-0920` · **slug:** `screnta-peru` · **shop:** `shop_a6d7c5ab-b60f`
- **Backend:** `NEXT_PUBLIC_BACKEND_ENDPOINT=https://enest.lexarsolutions.com` · auth: `Bearer <NEXT_PUBLIC_API_KEY>` (public key) para endpoints públicos.
- **Moneda:** única, PEN — `curr_795fd17e-128e`, símbolo `S/` BEFORE, 2 decimales. Envío gratis ≥ S/199. IGV 18% incluido.
- **Categorías raíz:** Perfumes de Nicho (`perfumes-de-nicho`), Perfumes de Diseñador (`perfumes-de-disenador`), Perfumes Árabes (`perfumes-arabes`), Sets y Estuches (`sets-y-estuches`). Cada una con sub `*-unisex / *-mujer / *-hombre`.
- **Colecciones (10):** Regalo Perfecto ⭐, Bestsellers en Perú ⭐, Frescos & Cítricos, Maderas & Oud, Gourmands Adictivos, Para Ella, Para Él, Alta Perfumería de Nicho, Iconos de Diseñador, Tesoros Árabes.
- **Producto:** `{ title, description (HTML/texto, español), slug, vendor, imageUrls[], categories[], collections[], variants[] }`. Variante: `{ title, attributes.Size, inventoryQuantity, imageUrls[], prices[{ price, originalPrice, currency }] }`.
- **Endpoints clave:** `GET /products/{storeId}?...filtros`, `GET /products/by-slug/{storeId}/{slug}`, `GET /products/{storeId}/vendors`, `GET /categories/{storeId}`, `GET /collections/{storeId}`, `GET /shop-settings/{storeId}`, `GET /page-builder-v2/{storeId}/pages/{slug}`.

## Checklist al construir cualquier página
- [ ] ¿Usa los tokens de color/tipografía/spacing de este skill (no valores arbitrarios)?
- [ ] ¿Respeta el restraint? (aire suficiente, máx 3–4 columnas, dorado con moderación)
- [ ] ¿Imágenes grandes y protagonistas, con hover-swap en cards?
- [ ] ¿Deseo antes que specs en la ficha?
- [ ] ¿Motion sutil y `prefers-reduced-motion`?
- [ ] ¿Precios en formato PEN correcto, descuentos discretos?
- [ ] ¿Reutiliza componentes existentes de AuthTemplate antes de crear nuevos?
- [ ] ¿Renderiza desde Page Builder V2 cuando la página existe en el CMS?
