# Análisis detallado: página Nosotros (Luján) — vitivinicolalujan-offline → React

**Fuente:** `vitivinicolalujan-offline/vitivinicolalujan.com/wp-json/wp/v2/pages/1943.json`  
**Ruta destino:** `/nosotros` (sin header ni footer; contenido full-page).  
**Colores y tipografías globales:** definidos en `vitivinicolalujan.com/tienda/indexffef.html` (`.elementor-kit-30`).

---

## 1. Paleta y tipografía (Elementor kit)

### Colores globales (hex)

| Variable Elementor      | Hex       | Uso en Nosotros |
|------------------------|-----------|------------------|
| `--e-global-color-7733ea9` | **#FFF9EF** | Fondo sección "Trabaja con Nosotros"; color título hero "Nosotros" |
| `--e-global-color-2aa7e4a` | **#F4EBDE** | Fondo sección "¡Visita nuestra vitivinícola!" |
| `--e-global-color-56d9187` | **#2B2824** | Títulos "Trabaja con", "El Campo y" (con stroke #000) |
| `--e-global-color-21c332c` | **#FFFFFF** | "Nosotros" (heading sobre fondo rosa); títulos/descripciones de las 3 tarjetas |
| `--e-global-color-e60916c` | **#9A3C62** | Fondo tagline "SOMOS LUJÁN"; fondo "Nosotros" (heading); divisor; "el Sol"; ¡! en "¡Visita...!" |
| `--e-global-color-b71031b` | **#912E60** | Fondo del tagline "SOMOS LUJÁN" (en JSON se usa este; visualmente muy parecido a 9A3C62) |
| `--e-global-color-097d8d8` | **#C99C4C** | Color texto tagline "SOMOS LUJÁN" |
| `--e-global-color-text`    | **#7A7A7A** | Párrafos (Trabaja con Nosotros, Visita, El Campo y el Sol) |

Colores fijos en el JSON (no variables):

- **#005A6E** — Fondo tarjeta 1 (Precios Competitivos).
- **#C8AA8F** — Fondo tarjeta 3.

### Tipografías globales

| Variable Elementor        | Familia  | Tamaño (desktop) | Peso | Line-height | Letter-spacing | Responsive |
|---------------------------|----------|-------------------|------|-------------|----------------|------------|
| **48b2242** (títulos H2)  | Margiona | 3.8rem            | 500  | 3.5rem      | 0.3px          | ≤1024: 3rem / 3.2rem; ≤767: 2rem / 2.7rem |
| **0f848ce** (body)        | Satoshi  | 1rem              | 400  | 1.2rem      | 0.5px          | ≤1024: 0.95em |

En la página también se usan directamente:

- **Margiona**: hero "Nosotros" (5em), "SOMOS LUJÁN" (3rem), títulos tarjetas (2.2rem), etc.
- **Satoshi**: párrafos (1.15rem, 1rem, 0.9rem según bloque).

---

## 2. Breakpoints

- **Desktop:** > 1024px (content-width 1600px en contenedores boxed).
- **Tablet:** 768px–1024px (`max-width: 1024px`).
- **Móvil:** ≤ 767px (`max-width: 767px`).
- **Tablet exacta:** `(max-width: 1024px) and (min-width: 768px)` para algunos anchos (ej. columna "Visita" 356.559px).

---

## 3. Componente 1 — Hero "Nosotros / SOMOS LUJÁN"

### Estructura

- Contenedor flex (row desktop), fondo imagen + overlay negro.
- Hijo: columna de texto con "Nosotros" y "SOMOS LUJÁN".

### Contenedor hero (06e29bd)

| Propiedad        | Desktop        | Tablet (≤1024)      | Móvil (≤767)     |
|------------------|----------------|----------------------|------------------|
| min-height       | 63vh           | 31vh                 | (hereda 31vh)    |
| flex-direction   | row            | —                    | —                |
| justify-content  | flex-start     | flex-end             | —                |
| align-items      | center         | flex-end             | —                |
| padding          | 0 0 0 2em      | 2em 2em 1em 2em      | 0                |
| overlay opacity  | 0.2            | 0                    | 0.26             |
| background-image | fondo extendido| fondo tablet         | mismo que tablet |
| background-position | center left | top center        | center center    |
| content-width    | —              | —                    | —                |
| (min-width 768px)| content-width: 1600px | —              | —                |

Imágenes:

- Desktop: `fondo-nosotros-Lujan-extendido-scaled-e1737110687299.webp`
- Tablet/móvil: `fondo-nosotros-e1736937351307.webp`

Overlay: `::before` con `background-color: #000000` y mix-blend-mode overlay.

### Bloque de texto (548fbee)

| Propiedad        | Desktop   | Tablet | Móvil        |
|------------------|-----------|--------|-------------|
| min-height       | 305px     | —      | 342px       |
| flex-direction   | column    | —      | —           |
| justify-content  | flex-end  | —      | —           |
| align-items      | flex-start| —      | —           |
| padding          | 0         | 0      | 1em         |

### Título "Nosotros" (134bb28)

| Propiedad   | Desktop | Tablet | Móvil  |
|-------------|---------|--------|--------|
| font-family | Margiona, Sans-serif | — | — |
| font-size   | 5em     | 4rem   | 3rem   |
| font-weight | 500     | —      | —      |
| line-height | 3.5rem  | —      | —      |
| letter-spacing | 0.3px | —   | —      |
| color       | #FFF9EF (7733ea9) | — | — |
| width       | 74.509% | —      | —      |
| margin      | 0 0 -0.5rem 0 | — | — |

### Tagline "SOMOS LUJÁN" (96cedda)

| Propiedad      | Desktop | Tablet | Móvil  |
|----------------|---------|--------|--------|
| font-family    | Margiona | —    | —      |
| font-size      | 3rem    | 2.6rem | 1.9rem |
| font-weight    | 500     | —      | —      |
| line-height    | 2rem    | —      | —      |
| letter-spacing | 1.5px   | —      | —      |
| word-spacing   | 9px     | —      | —      |
| color          | #C99C4C (097d8d8) | — | — |
| background-color | #912E60 (b71031b) | — | — |
| padding        | 16px 13px 0 15px | — | — |

---

## 4. Componente 2 — "Trabaja con Nosotros"

Fondo: **#FFF9EF** (7733ea9). Contenedor (0e8b0b1): flex row, gap 6em, padding 5em 4em.

### Desktop

- **Imagen izquierda (cd7ffe7):** visible solo desktop. width 29.239%. Img: `width: 100%`, `border-radius: 8% 0% 0% 0%`. Archivo: `Sin-titulo-1xddddMesa-de-trabajo-20-1.webp` (1518×2325).
- **Columna derecha (7819130):** flex column, 100%.
  - **Fila (7da3a2f):** flex row, gap 5% en tablet.
    - **Imagen tablet (2f4b0ae):** solo visible en tablet, width 230.887px, img 84%.
    - **Bloque texto (a734c89):** flex column (tablet: column, align flex-start).
      - **"Trabaja con" (045532c):** typography 48b2242, -webkit-text-stroke #000, color #2B2824. margin 0, padding 0 0 0.5em 0. text-align start (tablet idem; móvil center).
      - **"Nosotros" (9584b52):** misma typography, color #FFFFFF, background #9A3C62. padding 0.5em 1em 0 1em. align-self flex-start (móvil center).
      - **Divisor (bae97ef):** sólido, color #9A3C62, width 6% (tablet 10%, móvil 10% center). border-width 0.35em. padding block 15px (móvil + padding bottom 1em).
    - **Fila (cdceaa9):** desktop flex; móvil column, center, gap 0.
      - **Imagen móvil (bc54a0b):** oculta desktop/tablet; visible móvil. width desktop 29.239%; tablet 230.887px; móvil 92.572%. img 100%, border-radius 8% 0 0 0.
      - **Párrafo (a28e06b):** Satoshi 1.15rem, 400, line-height 1.4rem, letter-spacing 0.5px, color #7A7A7A. width 79% (tablet 90%, móvil 100%). Tablet font-size 0.95em. Móvil: padding 39px 10px 10px 10px, text-align justify, align-self center.

Texto del párrafo (corregir "estaurante" → "restaurante"):

> Buscamos aliados estratégicos para expandir nuestra presencia y llevar nuestros exclusivos piscos y vinos a más clientes. Si eres distribuidor, dueño de **restaurante**, bar, o estás organizando un evento, queremos ofrecerte productos de alta calidad y una colaboración sólida y confiable.

### Responsive sección Trabaja

| Elemento      | Tablet (≤1024)                          | Móvil (≤767)                                      |
|---------------|------------------------------------------|---------------------------------------------------|
| Contenedor    | padding 4em 1em                          | flex-direction column; padding 0; justify center; align center |
| Img izquierda| oculta                                   | oculta                                            |
| Img tablet    | visible, 230.887px, img 84%              | oculta                                            |
| Img móvil     | oculta                                   | visible, 92.572% width, img 100%                  |
| Títulos      | mismo tamaño typography                  | text-align center; align-self center             |
| Divisor      | width 10%, margin-left 0, text-align left| text-align center; separator margin 0 auto       |
| Párrafo      | 90% width, 0.95em                        | 100% width, padding 39px 10px 10px 10px, justify  |

---

## 5. Componente 3 — Tres tarjetas (Precios Competitivos)

Contenedor (11605ac): flex row, justify flex-start, gap 2em (móvil: space-around, gap 0). Cada tarjeta ~30% en desktop/tablet (768px+); móvil cada una 90% width, flex column, align center, margin 10px.

### Tarjeta 1 (ebf821c)

| Propiedad  | Desktop/Tablet | Móvil        |
|------------|----------------|-------------|
| background | #005A6E        | —           |
| padding    | 3em 2em 5em 2em| 1em         |
| flex       | column, gap 0  | column, 90% width |
| min-height | —              | 0 (tablet)  |

- **Imagen (d00f13d):** max-width 55%, opacity 0.98. margin 0, padding 0 0 2em 0. Archivo: `20222222222222-01-2.png` (429×485). Móvil: width 84px, img 69%, align-self center.
- **Título (f5a3779):** Margiona 2.2rem, 500, line-height 2.6rem, color #FFFFFF, text-align center. Tablet 1.7rem; móvil 1.6rem / 1.9rem, width 100%.
- **Descripción (1c80c07):** Satoshi 0.9rem, 400, line-height 1.2rem, letter-spacing 0.5px, color #FFFFFF. Móvil 0.9em, line-height 1.4rem, width 1000% (overflow).

### Tarjeta 2 (a9a43f9)

- background: **#9A3C62** (e60916c).
- Imagen: `20222222222222-03.png` (375×390). max-width 60%. Móvil: width 89.007px, img 71%.
- Mismos estilos de título (1ec43a3) y descripción (3746f90).

### Tarjeta 3 (9737129)

- background: **#C8AA8F**.
- Imagen: `20222222222222-02-1.png` (279×506). max-width 35%. Móvil: width 89.007px, img 41%.
- Mismos estilos de título (bf8775e) y descripción (d4e22b6).

Texto (igual en las 3): título "Precios Competitivos" (con <br />), descripción "Ofrecemos precios atractivos para compras por mayor, lo que te permitirá maximizar tus márgenes de ganancia."

---

## 6. Componente 4 — "¡Visita nuestra vitivinícola!"

Contenedor (dc933a3): flex row, justify center, align center, padding 6em 4em, background **#F4EBDE** (2aa7e4a). content-width 1600px (≥768px). Tablet padding 6em 3em; móvil 4em 1em.

### Desktop

- **Imagen (f9ba743):** solo desktop. Archivo: `nama-1-1024x834.png` (800×652, srcset hasta 1530w).
- **Columna derecha (c8fe567):** flex, justify center, padding 4em 4em 4em 0. Tablet: padding 0; align-self center. Móvil: idem.
  - **Título (e40e8ab):** typography 48b2242 (Margiona 3.8rem…). En HTML: "¡" y "!" en `<span style="color: #9a3c62;">`. Tablet: text-align center. Móvil: mismo tamaño, margin 0 0 -0.4em 0.
  - **Fila (d9acf01):** flex (tablet row, gap 5%; móvil column-reverse).
    - **Imagen tablet/móvil (438cbfc):** oculta desktop. Tablet 30% width; móvil 40.182%, align-self center.
    - **Párrafo (ee54700):** Satoshi 1rem, 400, line-height 1.2rem, letter-spacing 0.5px, color #7A7A7A. max-width 734px (tablet 60%, 0.95em; móvil 92%, text-align center, padding 0 0 18px 0).

Texto: "**¡**Visita nuestra vitivinícola**!**" (¡ y ! en #9A3C62). Párrafo: "Necesaria para seguir el fascinante mundo de la elaboración de vinos y piscos, donde la pasión y el amor por crear grandes experiencias se hace día a día. Asimismo, la aceptación de zonas aledañas y de muchas provincias ha sido de mayor inspiración para salir siempre adelante."

### Tablet (≤1024)

- e44bd23: padding 0.
- Columna "Visita": e44bd23 width 356.559px (en media 768–1024).
- Imagen visible (438cbfc) 30%.
- Párrafo 60%, 0.95em.

### Móvil (≤767)

- d9acf01: flex-direction column-reverse.
- Imagen 40.182% arriba (en orden reverso queda abajo del título, arriba del párrafo según DOM).
- Párrafo 92%, center, padding 0 0 18px 0.

---

## 7. Componente 5 — "El Campo y el Sol"

Contenedor (05f62c8): flex row, justify center, padding 4em (tablet 5em 3em; móvil 5em 1em). content-width 1600px (≥768px).

Contenedor interno (e44bd23): flex, padding 6em (tablet/móvil 0). width desktop 45.648%; tablet 356.559px (en 768–1024).

### Columna izquierda (0e74521)

- **"El Campo y" (8a5f839):** typography 48b2242, stroke #000, color #2B2824. margin 0, padding 0 0 0.5em 0. text-align start (tablet idem; móvil center, width 100%).
- **"el Sol" (3d6d1a8):** misma typography, color **#9A3C62**. width 85.5% (móvil 100%, center).
- **Divisor (7c5f189):** sólido #9A3C62, width 6% (móvil 10% center). border-width 0.35em. padding block 10px. Móvil: text-align center.
- **Párrafo (856732f):** typography 0f848ce (Satoshi 1rem…), color #7A7A7A. Tablet: width 100%, text-align justify. Móvil: width 92%, text-align center, align-self center.

Texto (corregir "ransmitir" → "transmitir"): "En el arte abstracto, las formas, los colores y las composiciones no suelen representar objetos o escenas figurativas de manera directa, sino que buscan **transmitir** ideas, emociones o conceptos a través de elementos no figurativos. La «unión de bebedores» podría simbolizar varias ideas"

### Imagen derecha (be6f272)

- **Archivo:** `luchy-1.webp` (2248×1949).
- **Estilo:** max-width 81% (tablet 100%, height 100%; móvil 75%).

---

## 8. Imágenes a descargar y ubicación en `public/lujan/nosotros/`

Descargar desde el sitio en vivo (o desde donde se indique) y colocar en AuthTemplate:

| Archivo origen (wp-content/uploads/2025/01/) | Uso | Ruta destino sugerida |
|---------------------------------------------|-----|------------------------|
| fondo-nosotros-Lujan-extendido-scaled-e1737110687299.webp | Hero desktop | `public/lujan/nosotros/hero-desktop.webp` |
| fondo-nosotros-e1736937351307.webp | Hero tablet/móvil | `public/lujan/nosotros/hero-tablet.webp` |
| Sin-titulo-1xddddMesa-de-trabajo-20-1.webp | Trabaja con Nosotros (1 imagen, 3 breakpoints) | `public/lujan/nosotros/trabaja-imagen.webp` |
| 20222222222222-01-2.png | Tarjeta 1 | `public/lujan/nosotros/card-1.png` |
| 20222222222222-03.png | Tarjeta 2 | `public/lujan/nosotros/card-2.png` |
| 20222222222222-02-1.png | Tarjeta 3 | `public/lujan/nosotros/card-3.png` |
| nama-1-1024x834.png (o nama-1.png) | Visita vitivinícola | `public/lujan/nosotros/visita-nama.png` |
| luchy-1.webp | El Campo y el Sol | `public/lujan/nosotros/campo-sol-luchy.webp` |

En código usar rutas: `/lujan/nosotros/hero-desktop.webp`, etc.

---

## 9. Ruta y layout

- **Ruta:** `/nosotros` (mantener; no migrar header/footer del sitio).
- **Comportamiento:** Página de contenido completo; sin header ni footer del template. En AuthTemplate, `LayoutShell` solo envuelve con `<main>` y `WhatsAppButton`; si en el futuro se añade Navbar/Footer global, conviene un layout de grupo (ej. `(lujan)/nosotros`) que no los renderice para esta ruta.
- **Eliminar antes de migrar:** Todo el contenido actual de `app/nosotros/page.tsx` (SimpleListSection, OurTeam, Testimonials, CTA comentado, etc.) y sustituir por los 5 componentes Luján.

---

## 10. Resumen de correcciones de texto

1. "dueño de **estaurante**" → "dueño de **restaurante**".
2. "buscan **ransmitir**" → "buscan **transmitir**".

---

## 11. Orden sugerido al implementar

1. Descargar imágenes con script/comando y colocar en `public/lujan/nosotros/` (nombres como arriba).
2. Vaciar `app/nosotros/page.tsx` y opcionalmente usar `app/nosotros/layout.tsx` sin header/footer si se añaden después.
3. Crear componentes en `components/lujan/nosotros/`:  
   `NosotrosHero.tsx`, `TrabajaConNosotros.tsx`, `NosotrosTarjetas.tsx`, `VisitaVitivinicola.tsx`, `ElCampoYElSol.tsx`.
4. Añadir bloques `.lujan-nosotros-*` en `globals.css` según este análisis (desktop / 1024 / 767).
5. Montar la página con los 5 componentes en orden y corregir textos según sección 10.
