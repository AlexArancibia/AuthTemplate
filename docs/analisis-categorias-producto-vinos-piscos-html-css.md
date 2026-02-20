# Análisis HTML/CSS — Sección «Categorías de producto» (Vinos, Piscos, Cremas y Macerados, Personaliza)

**Origen:** `c:\My Web Sites\vitivinicolalujan-offline\vitivinicolalujan.com\index.html`  
**Fragmento:** líneas 1370–1482 (contenedores `data-id="d7f1912"` y `62d3c1a`).  
**Breakpoints:** Desktop ≥768px (--content-width: 1500px), Tablet 768px–1024px, Móvil ≤767px.

---

## 1) ESTRUCTURA Y CONTENIDO

La sección consta de **dos bloques principales** dentro del mismo contenedor padre:

1. **Bloque superior (4 columnas):** contenedor `d7f1912` → `e-con-inner` → contenedor `5beb49e` → contenedor fila `b32e811` con 4 columnas (Vinos, Piscos, Cremas y Macerados, Personaliza).
2. **Bloque inferior (imagen):** contenedor `62d3c1a` (imagen de fondo: hombre en cata / bodega).

### Jerarquía detallada (HTML)

| # | Tipo | Clase / data-id | Contenido / notas |
|---|------|------------------|-------------------|
| 1 | div | `elementor-element-d7f1912 e-flex e-con-boxed e-con e-parent` | **Contenedor raíz sección** · data-settings background classic (color crema) |
| 2 | div | `e-con-inner` | Wrapper boxed (max-width vía --content-width) |
| 3 | div | `elementor-element-5beb49e e-con-full e-flex e-con e-child` | Fila flex que agrupa las 4 columnas + bloque imagen |
| 4 | div | `elementor-element-b32e811 e-con-full e-flex e-con e-child` | **Fila de las 4 columnas** (--width: 25% cada una en desktop) |
| 5 | div | `d31ed9a` (contenedor) + `02c8a39` (widget image) | **Vinos:** imagen `copa-vino.png` (365×543) |
| 6 | div | `908c2ea` | Texto: título "Vinos" (text-editor) |
| 7 | div | `d641a2c` | Divider (línea) |
| 8 | div | `300ed5e` (text-editor) | Párrafo: "Cada vino cuenta una historia..." |
| 9 | div | `c8d9951` + `a797aa7` + `51dcf67` (image) | **Piscos:** imagen `COPA-PISCO-e1736886477837.png` (178×403) |
| 10 | div | `6e221b3` + `b330191` + divider `47fb1b3` + `6ed4913` | Título "Piscos" + línea + párrafo pisco |
| 11 | div | `ba65aeb` + `9480c43` + `b627e13` (image) | **Cremas y Macerados:** imagen `cafe.png` (148×652) |
| 12 | div | `6c53289` + `b051a2d` + divider `043193b` + `41a8bde` | Título "Cremas y Macerados" + línea + párrafo |
| 13 | div | `c702e1a` + `469099e` + `83cfa20` (image) | **Personaliza:** imagen `oackging-e1736886505378.png` (213×580) |
| 14 | div | `317937e` + `e343f0a` + divider `66a0996` + `51edfba` | Título "Personaliza" + línea + párrafo |
| 15 | div | `elementor-element-62d3c1a e-con-full e-flex e-con e-child` | **Bloque inferior:** imagen de fondo (classic), --min-height 411px (tablet), 247px (móvil) |

### Textos literales

- **Vinos:** "Vinos" · "Cada vino cuenta una historia. Inspirados por la majestuosidad de Luján elaboramos vinos que reflejan la pasión, dedicacición y el carácter único de esta tierra."
- **Piscos:** "Piscos" · "El pisco, bebida espirituosa tradicional Luján, se elabora destilando uvas selecionadas y el proceso de destilación y la tradición."
- **Cremas y Macerados:** "Cremas y Macerados" · "Los macerados de fruta son versátiles y se pueden usar en una variedad de preparaciones y eventos."
- **Personaliza:** "Personaliza" · "Ahora puedes personalizar tu etiqueta con nosotros, para tu empresa o regalo a tus clientes."

### Imágenes (rutas en el original)

- `wp-content/uploads/2025/01/copa-vino.png`
- `wp-content/uploads/2025/01/COPA-PISCO-e1736886477837.png`
- `wp-content/uploads/2025/01/cafe.png`
- `wp-content/uploads/2025/01/oackging-e1736886505378.png`

El bloque `62d3c1a` lleva imagen de fondo vía data-settings (background classic); en el CSS solo se define `background-size: cover` (no la URL en el fragmento analizado; puede estar en otro bloque de estilos o inline).

---

## 2) CSS — CONTENEDORES PRINCIPALES

Variables globales de color usadas en el tema (`.elementor-kit-30`):

- `--e-global-color-7733ea9: #FFF9EF` (fondo crema/beige)
- `--e-global-color-2aa7e4a: #F4EBDE`
- `--e-global-color-ad251b8: #817C7B` (texto)
- `--e-global-color-e60916c: #9A3C62` (divider)
- `--e-global-color-3aa4ac5: #B2966D`

El contenedor `d7f1912` tiene `data-settings` con `background_background: "classic"`; el color efectivo suele ser el de tema (p. ej. #FFF9EF).

---

## 3) CSS — DESKTOP (min-width: 768px)

**Extraído del HTML (index.html línea 148) con comandos:**

- **d7f1912:** `--display:flex; --flex-direction:column; --container-widget-width:100%; --gap:0em 0em; --margin:0; --padding-top:4em` (y resto padding/margin 0). Contenedor raíz de la sección (e-con-boxed → e-con-inner limita ancho vía --content-width en tema).
- **5beb49e:** `--display:flex; --flex-direction:row; --container-widget-width:initial; --container-widget-flex-grow:1; --gap:0px; --margin:0em; --padding:0em`. Fila que envuelve b32e811 + banner.
- **b32e811:** `--display:flex; --flex-direction:row; --container-widget-width:initial; --container-widget-flex-grow:1; --gap:0px; --margin:0; --padding:0`. Fila de las 4 columnas. `.e-con` sobre b32e811: `--flex-grow:0; --flex-shrink:0`. El ancho 25% por columna en Elementor suele venir de **--width** en cada hijo (d31ed9a, c8d9951, ba65aeb, c702e1a) o del layout; en el CSS inline de la línea no aparece explícito el 25%, queda en el análisis de especificación.
- **d31ed9a:** `--display:flex; --gap:0px; --margin:0em; --padding:0`. Contenedor imagen Vinos. `.e-con`: `--flex-grow:0; --flex-shrink:0`. Ancho de la “columna imagen” en el original: **30%** (según spec).
- **02c8a39 (img Vinos):** `> .elementor-widget-container { margin:-14px -31px 3px -31px; padding:0 }` y `img { width:100%; max-width:100%; height:246px; object-fit:cover; object-position:center center }`.
- **c8d9951, a797aa7:** c8d9951 `--display:flex; --flex-direction:row; --container-widget-flex-grow:1; ...`; a797aa7 `--display:flex; --flex-direction:column; ...`. Estructura análoga: columna 25% y dentro contenedor imagen 30%.
- **62d3c1a (banner):** `--min-height:680px; --border-radius:17px 17px 17px 17px` y background classic.

| Selector (data-id) | Propiedad | Valor (spec / extraído) |
|--------------------|-----------|-------------------------|
| d7f1912 | --content-width (tema) / padding-top | 1500px; 4em |
| b32e811 | display, flex-direction, .e-con | flex; row; --flex-grow:0; --flex-shrink:0 |
| b32e811 hijos (d31ed9a, c8d9951, …) | --width (spec) | 25% cada columna |
| d31ed9a, a797aa7, 9480c43, 469099e | --width (spec) | 30% (contenedor imagen) |
| 62d3c1a | min-height; border-radius | 680px; 17px |

Cada columna es 25% del contenedor `b32e811`; dentro de cada columna el subcontenedor de imagen tiene 30% y el de texto el resto (flex). **En desktop cada tarjeta es fila: imagen a la izquierda (30%), texto a la derecha.** Banner con esquinas redondeadas 17px.

---

## 4) CSS — TABLET (max-width: 1024px)

| data-id | Reglas relevantes |
|---------|-------------------|
| d7f1912 | --gap: 2em 0em; --row-gap: 2em; --column-gap: 0em; --flex-wrap: wrap; --padding-top: 3em; --padding-bottom: 0em; --padding-left: 0em; --padding-right: 0em |
| 5beb49e | --justify-content: center; --align-items: center; --gap: 2em 2em; --row-gap: 2em; --column-gap: 2em; --flex-wrap: wrap; --padding: 2em |
| b32e811 | --min-height: 240px |
| b32e811 (width) | --width: 45% (con d31ed9a 30%, c8d9951 45%, etc.) |
| d31ed9a | --flex-direction: row; --justify-content: center; --align-items: flex-start; --padding: 0 |
| 02c8a39 | margin: -30px 0 -28px 0; img width 100%; object-fit: cover |
| 908c2ea | --padding-top: 01em; --padding-bottom: 01em; --padding-left: 1em; --padding-right: 0 |
| cce21d5 (título Vinos) | font-size: 2.8rem |
| 300ed5e (párrafo) | font-size: 0.95em |
| 51dcf67 (img Piscos) | margin: -33px -28px -28px -28px; img max-width 76%; height 295px; object-fit: contain |
| b330191, b051a2d, e343f0a | font-size: 2.8rem (títulos) |
| 6ed4913, 41a8bde, 51edfba | font-size: 0.95em (párrafos) |
| b627e13 (img Cremas) | img height 220px; max-width 100% |
| 83cfa20 (img Personaliza) | margin: 0 0 -24px 0; padding 0 0 2em 0; img width 94%; height 228px |
| 62d3c1a | --min-height: 411px; background-size: cover |

---

## 5) CSS — MÓVIL (max-width: 767px)

| data-id | Reglas relevantes |
|---------|-------------------|
| d7f1912 | --gap: 0; --row-gap: 0; --column-gap: 0; --padding-top: 2.5em; --padding-bottom: 2.5em; --padding-left: 1.3em; --padding-right: 1.3em |
| 5beb49e | --gap: 0; --padding-top: 0; --padding-bottom: 4em; --padding-left: 0; --padding-right: 0 |
| b32e811 | --flex-direction: row; --justify-content: flex-start; --align-items: center; --gap: 0% 5%; --column-gap: 5% |
| d31ed9a | --width: 25% |
| 908c2ea | --width: 70% (texto a la derecha de la imagen en fila) |
| 02c8a39 | margin: -32px -12px -12px -12px; img height 227px; object-fit: cover |
| cce21d5 | font-size: 2rem; line-height: 2.5rem |
| 300ed5e | width 100%; text-align: start |
| c8d9951, ba65aeb, c702e1a | --flex-direction: row; --gap: 0% 5%; (imagen + texto en fila) |
| a797aa7, 9480c43, 469099e | --width: 25% (imagen); columnas de texto --width: 70% |
| 51dcf67 | margin: 0 -12px 5px -12px; padding 0 6px 0 16px; img height 191px |
| b627e13 | margin: -35px 0 -27px 1px; padding 0 0 0 1em; img width 75%; height 229px |
| 83cfa20 | margin: -32px -10px -19px -29px; padding 0 0 0 34px; img width 75%; height 257px |
| 317937e, 6c53289, 6e221b3 | --width: 70% |
| b330191, b051a2d, e343f0a | font-size: 2rem; line-height: 2.5rem |
| 62d3c1a | --min-height: 247px; background-size: cover |
| 0df3afa (siguiente bloque) | --padding-top: 3em; --padding-bottom: 1.1em; --padding-left: 1.3em; --padding-right: 1.3em |

En móvil las 4 columnas se reorganicen en filas: cada “tarjeta” es una fila con imagen (~25%) + texto (~70%), y el bloque `62d3c1a` reduce altura a 247px.

---

## 6) DIVIDER (líneas bajo títulos)

Los dividers (d641a2c, 47fb1b3, 043193b, 66a0996) comparten en el tema:

- `--divider-border-style: solid`
- `--divider-color: var(--e-global-color-e60916c)` (#9A3C62)
- `--divider-border-width: 0.25em`
- `.elementor-divider-separator`: ancho variable (8% en móvil), margin auto
- `.elementor-divider`: padding-block 10px, text-align left/center según breakpoint

---

## 7) CSS IMÁGENES EXTRAÍDO DEL HTML (index.html)

Estilos inline/Elementor para los widgets de imagen (data-id). Aplicar al wrap de la imagen y a la `img` para evitar deformaciones.

### Desktop (base)

| data-id   | Contenedor (margin)           | img |
|-----------|------------------------------|-----|
| 02c8a39 (Vinos) | margin: -14px -31px 3px -31px | width: 100%; max-width: 100%; height: 246px; object-fit: cover; object-position: center center |
| 51dcf67 (Piscos) | margin: -43px -23px -23px -23px | width: 86%; max-width: 59%; height: 336px; object-fit: contain; object-position: center center |
| b627e13 (Cremas) | margin: -12px -8px -8px -8px | width: 37%; max-width: 100%; height: 256px; object-fit: contain; object-position: center center |
| 83cfa20 (Personaliza) | margin: -25px -16px -16px -16px | width: 49%; max-width: 100%; height: 287px; object-fit: contain; object-position: center center |

### Tablet (max-width: 1024px)

- 02c8a39: margin -30px 0 -28px 0; img width 100%; object-fit: cover.
- 51dcf67: margin -33px -28px -28px -28px; img max-width 76%; height 295px; object-fit: contain.
- b627e13: img height 220px; max-width 100%; object-fit: contain.
- 83cfa20: margin 0 0 -24px 0; padding 0 0 2em 0; img width 94%; height 228px; object-fit: contain.

### Móvil (max-width: 767px)

- 02c8a39: margin -32px -12px -12px -12px; img height 227px; object-fit: cover.
- 51dcf67: margin 0 -12px 5px -12px; padding 0 6px 0 16px; img height 191px.
- b627e13: margin -35px 0 -27px 1px; padding 0 0 0 1em; img width 75%; height 229px.
- 83cfa20: margin -32px -10px -19px -29px; padding 0 0 0 34px; img width 75%; height 257px.

---

## 8) RESUMEN PARA IMPLEMENTACIÓN

- **Contenedor raíz:** boxed, max-width 1500px, fondo crema (p. ej. #FFF9EF).
- **Fila de 4 columnas:** flex, 25% por columna en desktop; en tablet 45% (2 columnas) y reflow; en móvil cada ítem es fila (imagen 25% + texto 70%).
- **Cada columna:** contenedor imagen (30% ancho en desktop) + contenedor texto (título sin tag h2 en el HTML, solo div con texto; divider; párrafo).
- **Imágenes:** usar **clases modificadoras por categoría** (ej. `.lujan-categorias__card--vinos`) y aplicar los tamaños/object-fit/márgenes de la tabla anterior para que no se deformen.
- **Tipografía:** títulos 2.8rem (tablet/móvil 2rem), párrafos 0.95em, fuente Satoshi/Margiona según tema.
- **Bloque inferior:** min-height 411px (tablet), 247px (móvil), background-size cover; imagen de fondo (hombre en cata) definida en data-settings o estilos adicionales.

Referencia de IDs para localizar estilos en el HTML: `d7f1912`, `5beb49e`, `b32e811`, `d31ed9a`, `908c2ea`, `cce21d5`, `d641a2c`, `300ed5e`, `c8d9951`, `a797aa7`, `51dcf67`, `6e221b3`, `b330191`, `47fb1b3`, `6ed4913`, `ba65aeb`, `9480c43`, `b627e13`, `6c53289`, `b051a2d`, `043193b`, `41a8bde`, `c702e1a`, `469099e`, `83cfa20`, `317937e`, `e343f0a`, `66a0996`, `51edfba`, `62d3c1a`.
