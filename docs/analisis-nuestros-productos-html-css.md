# Análisis HTML/CSS — Sección «Nuestros Productos» (carrusel + Ver Tienda)

**Origen:** `c:\My Web Sites\vitivinicolalujan-offline\vitivinicolalujan.com\index.html`  
**Fragmento:** líneas 1483–1518 (contenedores `data-id="0df3afa"`, `be84488`, widget `7517675`).  
**Breakpoints:** Desktop ≥1025px, Tablet 768px–1024px, Móvil ≤767px (según `data-settings` del carrusel).

---

## 1) ESTRUCTURA Y CONTENIDO

La sección consta de:

1. **Contenedor raíz** `0df3afa`: fondo clásico (crema), `e-con-boxed` → `e-con-inner`.
2. **Contenedor interior** `be84488`: flex, animación `fadeIn`, `elementor-invisible` hasta entrada.
3. **Título** `9810a1a`: texto "Nuestros Productos" (text-editor).
4. **Subtítulo** `59d935a`: texto "Ingresa a Nuestra Tienda de Vinos y Piscos".
5. **Divider** `0d6d63f`: línea separadora (`elementor-widget-divider--view-line`).
6. **Widget** `7517675`: `jkit_product_carousel` (Jeg Elementor Kit) → carrusel de productos WooCommerce.
7. **Botón** `84a1a59`: "Ver Tienda" (elementor-button, link a `shop/index.html`).

### Jerarquía detallada (HTML)

| # | Tipo | Clase / data-id | Contenido / notas |
|---|------|------------------|-------------------|
| 1 | div | `elementor-element-0df3afa e-flex e-con-boxed e-con e-parent` | **Contenedor raíz** · background classic (crema) |
| 2 | div | `e-con-inner` | Wrapper boxed |
| 3 | div | `elementor-element-be84488 e-con-full e-flex elementor-invisible e-con e-child` | Contenedor con animación fadeIn |
| 4 | div | `elementor-element-9810a1a elementor-widget-text-editor` | **Título:** `<p>Nuestros Productos</p>` |
| 5 | div | `elementor-element-59d935a elementor-widget-text-editor` | **Subtítulo:** `<p>Ingresa a Nuestra Tienda de Vinos y Piscos</p>` |
| 6 | div | `elementor-element-0d6d63f elementor-widget-divider--view-line` | Línea (`.elementor-divider-separator`) |
| 7 | div | `elementor-element-7517675 elementor-widget-jkit_product_carousel` | **Carrusel** (ver abajo) |
| 8 | div | `elementor-element-84a1a59 elementor-widget-button` | **Botón:** `<a class="elementor-button elementor-button-link elementor-size-sm elementor-animation-pulse" href="shop/index.html">` → `<span class="elementor-button-text">Ver Tienda</span>` |

### Textos literales

- **Título:** "Nuestros Productos"
- **Subtítulo:** "Ingresa a Nuestra Tienda de Vinos y Piscos"
- **Botón:** "Ver Tienda" (enlace a tienda/shop)

---

## 2) CARRUSEL DE PRODUCTOS (jkit-product-carousel)

**Contenedor del carrusel:**  
`<div class="jeg-elementor-kit jkit-product-carousel jkit-postblock post-element arrow-middle-edge jeg_module_14_3_69981c0e961dc" data-id="jeg_module_14_3_69981c0e961dc" data-settings="...">`

### data-settings (JSON)

| Clave | Valor |
|-------|--------|
| `autoplay` | false |
| `autoplay_speed` | 3500 |
| `autoplay_hover_pause` | false |
| `show_navigation` | false |
| `show_dots` | true |
| `arrow_position` | "bottom" |
| **responsive** | |
| desktop | items: 4, margin: 50, breakpoint: 1025 |
| tablet | items: 3, margin: 10, breakpoint: 768 |
| mobile | items: 1, margin: 10, breakpoint: 0 |

### Estructura interna del carrusel

- `.jkit-block-container` → `.woocommerce` → `.products.jkit-products`
- Cada ítem: `.product.jkit-product-block` → `.jkit-product-block-wrapper` → enlace `.jkit-product-link` que contiene:
  - `.jkit-product-image-block` → `<img class="wp-post-image product-image jkit-product-image" ...>`
  - `h2.product-title` (nombre del producto)
  - `span.price` con:
    - `del` → precio original (ej. S/40.00)
    - `ins` → precio actual (ej. S/35.00)
    - `.screen-reader-text` para accesibilidad

### Productos mostrados (primeros 4 en la captura)

| Producto | Imagen (path) | Precio original | Precio oferta |
|----------|----------------|------------------|----------------|
| Licor de Crema Chocolate | wp-content/uploads/2025/01/Group-3-16-600x600.png | S/40.00 | S/35.00 |
| Licor de Crema Lúcuma | Group-3-15-600x600.png | S/40.00 | S/35.00 |
| Licor de Crema Arándanos | Group-3-14-600x600.png | S/40.00 | S/35.00 |
| Licor de Crema Cafe | Group-3-13-600x600.png | S/40.00 | S/35.00 |

El carrusel incluye más productos (piscos, vinos, etc.) en el HTML; la vista inicial muestra 4 (desktop).

---

## 3) CSS — VARIABLES GLOBALES (elementor-kit-30)

Mismas variables que en el resto del sitio (definidas en línea 147 de `index.html`):

| Variable | Valor | Uso en esta sección |
|----------|--------|----------------------|
| `--e-global-color-7733ea9` | #FFF9EF | Fondo crema/beige (contenedor) |
| `--e-global-color-2aa7e4a` | #F4EBDE | Alternativa fondo |
| `--e-global-color-56d9187` | #2B2824 | Texto marrón oscuro (títulos, precios) |
| `--e-global-color-ad251b8` | #817C7B | Texto gris |
| `--e-global-color-cf0afa1` | #C65441 | Acento rojo/marrón (divider, botón, dot activo) |
| `--e-global-color-21c332c` | #FFFFFF | Blanco (texto del botón) |

---

## 4) CSS — CONTENEDORES Y WIDGETS

**Nota:** En el `index.html` no aparecen reglas CSS que referencien los `data-id` de esta sección (0df3afa, be84488, 9810a1a, 59d935a, 0d6d63f, 7517675, 84a1a59) en el bloque de estilos inline (líneas 147–151). Los estilos visibles se deben a clases genéricas de Elementor (`.e-con`, `.e-flex`, `.elementor-widget-container`), del tema y del plugin jkit. Para réplica fiel conviene medir en DevTools.

Patrón típico Elementor para este tipo de bloques:

- **Contenedor 0df3afa:** `--display:flex; --background_background: classic` (color desde tema/kit, ej. #FFF9EF); `e-con-boxed` usa `--content-width` del tema.
- **Contenedor be84488:** `--display:flex;` animación `fadeIn`; `elementor-invisible` hasta que la animación se dispara.
- **Título 9810a1a / Subtítulo 59d935a:** widget text-editor; tipografía y color suelen heredar del kit o definirse en el mismo bloque (ej. `color: var(--e-global-color-56d9187)` para títulos).
- **Divider 0d6d63f:** `elementor-widget-divider--view-line` → `.elementor-divider-separator` con `border-top` (color típico acento, ej. #C65441).
- **Botón 84a1a59:** `.elementor-button` con `elementor-size-sm`, `elementor-animation-pulse`; fondo acento (ej. #C65441), texto blanco.

Para **pixel-perfect** conviene medir en DevTools los valores computados de:

- Padding/margin del contenedor `0df3afa` y de `be84488`
- `font-size` y `line-height` del título y subtítulo
- Ancho y color del divider
- `padding`, `border-radius`, `font-size` del botón

---

## 5) CSS — CARRUSEL (jkit / WooCommerce)

Los estilos del carrusel vienen de:

- **Jeg Elementor Kit** (jkit-product-carousel): layout del slider, dots, márgenes entre ítems.
- **WooCommerce:** `.product`, `.price`, `del`, `ins`, `.woocommerce-Price-amount`, etc.

Breakpoints efectivos del carrusel (desde `data-settings`):

- **Desktop (≥1025px):** 4 ítems visibles, margen 50px entre ítems.
- **Tablet (768px–1024px):** 3 ítems, margen 10px.
- **Mobile (<768px):** 1 ítem, margen 10px.

Dots de navegación: visibles (`show_dots: true`), posición bottom; estilo activo suele usar el color acento (`--e-global-color-cf0afa1`).

---

## 6) RESUMEN PARA IMPLEMENTACIÓN (Next.js / AuthTemplate)

- **Estructura:** sección → título → subtítulo → divider → carrusel (grid o slider) → botón "Ver Tienda".
- **Contenido:** lista de productos con imagen, nombre, precio tachado y precio actual; enlace a tienda.
- **Estilos:** fondo #FFF9EF, títulos/precios #2B2824, divider y botón #C65441, botón texto blanco; tipografía alineada al resto del sitio Luján.
- **Carrusel:** 4 columnas desktop, 3 tablet, 1 móvil; dots debajo; sin flechas.
- **Accesibilidad:** mantener `del`/`ins` y texto para screen readers en precios.

Referencia de imágenes (licores de crema):  
`Group-3-16`, `Group-3-15`, `Group-3-14`, `Group-3-13` (Chocolate, Lúcuma, Arándanos, Café).
