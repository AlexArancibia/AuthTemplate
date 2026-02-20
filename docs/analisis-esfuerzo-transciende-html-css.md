# Análisis HTML/CSS — Sección «Esfuerzo que Transciende» (#acerca)

**Origen:** `c:\My Web Sites\vitivinicolalujan-offline\vitivinicolalujan.com\index.html`  
**Fragmento:** líneas 1339–1371 (contenedor `id="acerca"`, data-id `19202ba6`).  
**Breakpoints usados en el sitio:** Desktop >1024px (min-width:768px usa --content-width:1500px; 1024px y 767px definen tipografía y padding).

---

## 1) ESTRUCTURA Y CONTENIDO

Listado de todos los elementos en orden jerárquico (section → contenedores → bloques → textos). Incluidas capas intermedias (e-con, e-con-inner).

| # | Tipo | Clase / ID en el original | Contenido literal / atributos |
|---|------|----------------------------|-------------------------------|
| 1 | div | `elementor-element elementor-element-19202ba6 e-flex e-con-boxed e-con e-parent` | **id="acerca"** · data-id="19202ba6" · data-settings='{"background_background":"classic"}' · **Section root** |
| 2 | div | `e-con-inner` | — (wrapper interno boxed; max-width 1140px) |
| 3 | div | `elementor-element elementor-element-cd1b6c6 e-con-full e-flex e-con e-child` | data-id="cd1b6c6" · **Contenedor columna izquierda** |
| 4 | div | `elementor-element elementor-element-7551e883 e-con-full e-flex e-con e-child` | data-id="7551e883" · **Wrapper contenido texto** |
| 5 | div | `elementor-element elementor-element-3006085a elementor-widget__width-initial elementor-widget-tablet__width-inherit elementor-widget elementor-widget-heading` | data-id="3006085a" · data-widget_type="heading.default" |
| 6 | div | `elementor-widget-container` | — |
| 7 | h2 | `elementor-heading-title elementor-size-default` | **Esfuerzo que** (texto literal; cierre en línea siguiente en HTML) |
| 8 | div | `elementor-element elementor-element-286e816 elementor-widget__width-initial elementor-widget-tablet__width-inherit elementor-widget elementor-widget-heading` | data-id="286e816" |
| 9 | div | `elementor-widget-container` | — |
| 10 | h2 | `elementor-heading-title elementor-size-default` | **Transciende** (texto literal) |
| 11 | div | `elementor-element elementor-element-9fd1958 elementor-widget-divider--view-line elementor-widget elementor-widget-divider` | data-id="9fd1958" · data-widget_type="divider.default" |
| 12 | div | `elementor-widget-container` | — |
| 13 | div | `elementor-divider` | — |
| 14 | span | `elementor-divider-separator` | (vacío) · **Línea separadora** |
| 15 | div | `elementor-element elementor-element-875ae2d elementor-widget__width-initial elementor-widget-mobile__width-initial elementor-widget elementor-widget-text-editor` | data-id="875ae2d" |
| 16 | div | `elementor-widget-container` | — |
| 17 | p | (sin clase en el fragmento) | **Luján es esfuerzo, amor y pasión de quienes laboran desde el camino hasta la bodega. Es un espejo de diversidad, riqueza y audacia de la naturaleza. Nuestros productos al ser degustado por cada persona, tienen la capacidad de evocar un sinfín de recuerdos, y sentimientos en cualquier momento.** |
| 18 | div | `elementor-element elementor-element-3ad97b3f e-con-full e-flex e-con e-child` | data-id="3ad97b3f" · data-settings='{"background_background":"classic"}' · **Columna derecha (imagen de fondo vía CSS)** |

**Nota:** No hay `<br>` entre "Esfuerzo que" y "Transciende"; son dos `h2` distintos. El salto es por dos bloques en bloque.

---

## 2) TABLAS POR BREAKPOINT

Breakpoints del sitio: **Desktop** >1024px (en el CSS: min-width:768px aplica widths 50% / 60%); **Tablet** 768px–1024px (`@media (max-width:1024px)` y `(max-width:1024px) and (min-width:768px)`); **Móvil** ≤767px (`@media (max-width:767px)`).

### 2.1 TIPOGRAFÍA (Desktop | Tablet | Móvil)

| Id original | Elemento | Desktop | Tablet | Móvil |
|-------------|----------|---------|--------|--------|
| 3006085a, 286e816 | h2 (.elementor-heading-title) | font-family: var(--e-global-typography-48b2242-font-family) → **"Margiona", Sans-serif** · font-size: **3.8rem** · font-weight: **500** · line-height: **3.5rem** · letter-spacing: **0.3px** · text-align: start | font-size: **3rem** · line-height: **3.2rem** (resto =) | font-size: **2rem** · line-height: **2.7rem** (resto =) |
| 875ae2d | p (text-editor) | font-family: **"Satoshi", Sans-serif** · font-size: **0.92rem** · font-weight: **400** · line-height: **1.2rem** · letter-spacing: **0.5px** · text-align: **justify** | = | = |

**Variable global tipografía 48b2242 (elementor-kit-30):**  
`--e-global-typography-48b2242-font-family: "Margiona"; font-size: 3.8rem; font-weight: 500; line-height: 3.5rem; letter-spacing: 0.3px` (Desktop). En 1024px y 767px se sobreescriben solo font-size y line-height (ver arriba).

---

### 2.2 DIMENSIONES (Desktop | Tablet | Móvil)

| Id original | Elemento | Desktop | Tablet | Móvil |
|-------------|----------|---------|--------|--------|
| 19202ba6 | #acerca (section root) | width: 100% · max-width: (boxed vía e-con-inner) | = | = |
| e-con-inner | Wrapper boxed | width: 100% · **max-width: 1140px** (--container-max-width: 1140px) | max-width: **1024px** | max-width: **767px** |
| cd1b6c6 | Columna izquierda | **--width: 100%** (en min-width:768px; dentro del boxed) | = | 100% (reflujo) |
| 7551e883 | Wrapper texto | **--width: 50%** (min-width:768px) | **--width: 45.63%** (max-width:1024px and min-width:768px) | 100% (reflujo) |
| 3ad97b3f | Columna derecha (imagen) | **--width: 60%** (min-width:768px) | **--width: 50%** (max-width:1024px and min-width:768px) | 100% (reflujo) |
| 3006085a, 286e816 | Widget heading | width: **85.5%** · max-width: **85.5%** | = | = |
| 875ae2d | Widget text | width: **94.261%** · max-width: **94.261%** | = | = |
| 9fd1958 | Divider | (auto / 100% del contenedor) | = | = |

*Si el original no define un valor para ese breakpoint: "hereda" o "=" según corresponda.*

---

### 2.3 ESPACIADO (Desktop | Tablet | Móvil)

Margin (top, right, bottom, left) y padding (top, right, bottom, left). Incluye contenedores relevantes.

| Id original | Elemento | margin (t r b l) Desktop | padding (t r b l) Desktop | Tablet | Móvil |
|-------------|----------|--------------------------|----------------------------|--------|--------|
| 19202ba6 | #acerca | **0em 0em 0em 0em** | **4em 4em 6em 4em** | padding: **3em 1em 3em 1em** | padding: **2em 0em 0em 0em** |
| e-con-inner | — | (0 auto típ.) | no definido / hereda | = | = |
| cd1b6c6 | Columna izquierda | no definido | 0 | justify-content: space-between; gap 0 | margin: **0** · padding: **0** |
| 7551e883 | Wrapper texto | — | **5em 1em 3em 0em** | = | = |
| 3006085a | Widget heading (primer h2) | — | contenedor: **0 0 1em 0** (padding-bottom 1em) | = | = |
| 286e816 | Widget heading (segundo h2) | (widget spacing: margin-block-end 20px en :not(:last-child)) | (hereda / 0) | = | = |
| 9fd1958 | Divider | (widget spacing) | (contenedor) | = | = |
| 875ae2d | Widget text | — | — | = | = |
| 3ad97b3f | Columna derecha | **0** (todos) | **0em** (todos) | = | = |

*Valores en em; para pixel-perfect rellenar resueltos en px desde Computed (ej. 1em = 16px si base 16px).*

---

### 2.4 ESTILOS VISUALES (Desktop | Tablet | Móvil)

| Id original | Elemento | color | background-color | background-image | border / border-radius | box-shadow |
|-------------|----------|--------|-------------------|-------------------|------------------------|------------|
| 19202ba6 | #acerca | inherit | **#FFF9EF** (var --e-global-color-7733ea9) | none | — | — |
| h2 (3006085a, 286e816) | .elementor-heading-title | (hereda / var global; en spec 56d9187 #2B2824) | transparent | — | — | — |
| 9fd1958 | .elementor-divider-separator | — | — | — | **border-top: 0.25em solid** · color: **#9A3C62** (var --e-global-color-e60916c) | — |
| 875ae2d | p | **#817C7B** (var --e-global-color-ad251b8) | transparent | — | — | — |
| 3ad97b3f | Columna derecha | — | (sin declarar en bloque) | **url("wp-content/uploads/2025/01/Home-1-Mesa-de-trabajo-18-1.webp")** · **background-size: cover** | — | — |

Tablet y móvil: no hay cambio en color/background/border en el CSS analizado; indicar "=" o "igual que desktop".

---

## 3) IDENTIFICACIÓN EN EL ORIGINAL

Referencia rápida para ubicar en el código fuente.

| Uso en tablas | Clase / selector en HTML o CSS original |
|---------------|----------------------------------------|
| 19202ba6 | `.elementor-element.elementor-element-19202ba6` · id="acerca" |
| e-con-inner | `.e-con-inner` (hijo de .e-con-boxed) |
| cd1b6c6 | `.elementor-element.elementor-element-cd1b6c6` |
| 7551e883 | `.elementor-element.elementor-element-7551e883` |
| 3006085a | `.elementor-element.elementor-element-3006085a` · heading "Esfuerzo que" |
| 286e816 | `.elementor-element.elementor-element-286e816` · heading "Transciende" |
| 9fd1958 | `.elementor-element.elementor-element-9fd1958` · divider |
| 875ae2d | `.elementor-element.elementor-element-875ae2d` · párrafo |
| 3ad97b3f | `.elementor-element.elementor-element-3ad97b3f` · columna derecha (imagen de fondo) |
| Tipografía h2 | `.elementor-element-3006085a .elementor-heading-title` (y 286e816) · variables --e-global-typography-48b2242-* |
| Divider | --divider-color: var(--e-global-color-e60916c); --divider-border-width: 0.25em; --divider-border-style: solid |

---

## 4) ENLACES Y BOTONES

En este bloque **no hay CTAs, enlaces ni botones**. Solo texto (h2, p) y un divider. No hay estilos :hover, :active ni :focus propios del bloque.

---

## 5) IMÁGENES

La sección no usa `<img>` en el HTML. La fotografía de la viña (pareja con uvas) es **imagen de fondo** del contenedor **3ad97b3f** (columna derecha), aplicada por CSS.

| # | Descripción | src / origen en el original | Atributos (alt, width/height en HTML) | Ruta final en el proyecto |
|---|-------------|-----------------------------|----------------------------------------|----------------------------|
| 1 | Imagen de fondo columna derecha (viña, pareja con uvas) | **CSS:** `url("wp-content/uploads/2025/01/Home-1-Mesa-de-trabajo-18-1.webp")` · background-size: cover | N/A (background-image) | Usar **`/home/esfuerzo-transciende.png`** (ya en `public/home/esfuerzo-transciende.png`) o, si se prefiere WebP, descargar/copiar `Home-1-Mesa-de-trabajo-18-1.webp` del sitio offline a **`public/lujan/home/esfuerzo-transciende.webp`** (o `public/home/esfuerzo-transciende.webp`). Formato preferido: WebP; nombre descriptivo. |

**Resumen:**  
- **Original:** `wp-content/uploads/2025/01/Home-1-Mesa-de-trabajo-18-1.webp` (existe en el sitio offline).  
- **En proyecto:** imagen ya descargada como `public/home/esfuerzo-transciende.png`. Para fidelidad al original usar esa ruta o convertir/añadir WebP en `public/lujan/home/` o `public/home/`.

---

## 6) FUENTES

| Texto | Fuente declarada | ¿En proyecto? | Acción |
|-------|-------------------|--------------|--------|
| h2 "Esfuerzo que" / "Transciende" | **Margiona** (--e-global-typography-48b2242-font-family) | Sí (mencionado en spec: globals.css) | Usar @font-face o next/font existente; ruta según proyecto (ej. `public/lujan/fonts/` o en globals.css). |
| p (cuerpo) | **Satoshi**, Sans-serif | Comprobar en AuthTemplate (public/fonts, globals.css) | Si no existe: añadir @font-face y indicar ruta (ej. `public/lujan/fonts/Satoshi.woff2`). Fallback: Sans-serif. |

*No se encontraron otras fuentes custom en este bloque. Variables globales del kit: Roboto, Roboto Slab, Spectral, Poppins, Margiona, Satoshi.*

---

## 7) RESUMEN PARA IMPLEMENTACIÓN

- **Breakpoints usados:** Desktop >1024px; Tablet 768px–1024px; Móvil ≤767px (coinciden con el sitio: `@media (max-width: 1024px)` y `@media (max-width: 767px)`).
- **Clases CSS sugeridas para el componente (sin implementar aún):**
  - `.lujan-esfuerzo` o `.lujan-acerca` — section root (#acerca / 19202ba6)
  - `.lujan-esfuerzo__inner` — e-con-inner (boxed max-width)
  - `.lujan-esfuerzo__col-text` — cd1b6c6 (columna izquierda)
  - `.lujan-esfuerzo__content` — 7551e883 (wrapper texto)
  - `.lujan-esfuerzo__title` — h2 (ambos 3006085a y 286e816)
  - `.lujan-esfuerzo__divider` — 9fd1958 (divider)
  - `.lujan-esfuerzo__body` — 875ae2d (párrafo)
  - `.lujan-esfuerzo__col-image` — 3ad97b3f (columna derecha con imagen de fondo)
- **Recordatorio:** Aplicar márgenes y paddings a **todos** los contenedores según las tablas anteriores (19202ba6, 7551e883, 3006085a container, etc.) para que no quede nada "pegado" o inconsistente con el original. En móvil, padding de #acerca pasa a 2em 0 0 0; cd1b6c6 margin/padding a 0. Tipografía h2 y max-width del boxed cambian por breakpoint según tablas de tipografía y dimensiones.
