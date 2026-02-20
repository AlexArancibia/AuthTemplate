# Spec pixel-perfect: Sección «Esfuerzo que Transciende» (#acerca)

**Versión:** 2.0 — Protocolo 10/10 (ingeniería visual cerrada).  
**Fuente:** `c:\My Web Sites\vitivinicolalujan-offline\vitivinicolalujan.com\index.html`  
**Fragmento:** contenedor con `id="acerca"` (data-id `19202ba6`), líneas ~1339–1370.  
**Destino:** AuthTemplate Next.js — solo tablas de especificación (sin implementación).

**⚠️ JSON ≠ render final.** Los valores en `content.rendered` / JSON son **declarados**; el valor **final** puede verse afectado por `font-size` base, rem/em, media queries, `.e-con-inner` y theme. Para pixel-perfect **obligatorio** rellenar las tablas de **Mediciones reales en px** y **Altura total** desde DevTools → Computed.

---

## 1. Fuente de verdad

- **Valores:** deben obtenerse desde **DevTools → Computed**.
- Si un valor está en varias reglas, usar el **valor final computado**.
- Si cambia por media query, documentar por breakpoint.
- **em/rem:** documentar siempre el valor resuelto en **px** (según font-size base del contexto) para eliminar ambigüedad.

---

## 2. Breakpoints reales

| Breakpoint | Ancho | Origen |
|------------|--------|--------|
| Desktop   | 1440px (medir aquí) | Spec: medir en este ancho |
| Tablet    | 1024px              | Elementor: `@media (max-width: 1024px)` |
| Mobile    | 767px               | Elementor: `@media (max-width: 767px)` |
| Mobile pequeño | 375px / 320px | Verificar reflujo entre 1440px y 320px |

- **Comportamiento fluido:** verificar al redimensionar entre 1440px y 320px.

---

## 2A. Mediciones reales en px (obligatorio para pixel-perfect)

Los valores en em/rem **no garantizan** el resultado final; pueden verse afectados por font-size base, theme y media queries. Documentar el valor **resuelto en px** desde DevTools → Computed (viewport Desktop 1440px; asumir font-size base 16px si no se mide).

| Declarado | Resuelto Desktop (px) | Notas |
|-----------|------------------------|--------|
| 19202ba6 padding-top: 4em | **XXXpx** (ej. 64px si 1em=16px) | Medir en #acerca |
| 19202ba6 padding-bottom: 6em | **XXXpx** | |
| 19202ba6 padding-left / padding-right: 4em | **XXXpx** | |
| 7551e883 padding-top: 5em | **XXXpx** | |
| 7551e883 padding-bottom: 3em | **XXXpx** | |
| 7551e883 padding-right: 1em | **XXXpx** | |
| h2 font-size (var 48b2242) | **XXXpx** | |
| p font-size: 0.92rem | **XXXpx** (ej. 14.72px si root 16px) | |
| p line-height: 1.2rem | **XXXpx** | |
| Divider border-top-width: 0.25em | **XXXpx** | Ver sección Divider más abajo |

*Rellenar XXXpx desde Computed; sin esto la spec no es 10/10.*

---

## 2B. Altura total del bloque

Medir en DevTools: altura total del nodo `#acerca` (incl. padding, sin overflow recortado).

| Breakpoint | Altura total renderizada (px) | Cómo medir |
|------------|------------------------------|------------|
| Desktop (1440px) | **XXXpx** | getBoundingClientRect().height o Computed height en #acerca |
| Tablet (1024px) | **XXXpx** | Idem |
| Mobile (767px) | **XXXpx** | Idem |
| Mobile (375px) | **XXXpx** | Opcional |

Sin esta tabla pueden quedar diferencias invisibles entre clon y original.

---

## 2C. Distribución de columnas (flex-basis / width real)

Con `justify-content: space-between` en la raíz, el ancho de cada columna depende de flex-grow, flex-basis y contenido. Documentar valores **reales** desde Computed.

| Elemento | Desktop width real (px) | Desktop width (%) | Tablet | Mobile |
|----------|-------------------------|-------------------|--------|--------|
| cd1b6c6 (columna izquierda) | **XXXpx** | **XX%** | **XXXpx / XX%** | 100% (reflujo) |
| 3ad97b3f (columna derecha vacía) | **XXXpx** | **XX%** | **XXXpx / XX%** | (oculta o 0 si reflujo) |

Preguntas a responder desde Computed: ¿50/50, 60/40, auto + flex-grow, o contenido + resto? Sin esto el layout puede desviarse.

---

## 2D. Reflujo entre breakpoints

Documentar **exactamente** en qué ancho de viewport ocurre el cambio de layout (p. ej. row → column).

| Transición | Ancho aproximado (px) donde ocurre | Comportamiento |
|------------|------------------------------------|----------------|
| row → column (flex-direction) | **XXXpx** (típ. 767 o 1024 según Elementor) | e-con flex-wrap o media query |
| Cambio de padding / tipografía | **XXXpx** | Si hay media queries que pisan em/rem |

*Redimensionar ventana y anotar el breakpoint exacto donde cambia el reflujo.*

---

## 2E. Relación con bloques adyacentes

Pixel-perfect no es solo el bloque aislado; el espaciado respecto a vecinos define la página real. Medir en el DOM renderizado (no solo el padding del bloque).

| Medición | Desktop (px) | Tablet (px) | Mobile (px) |
|----------|--------------|-------------|-------------|
| Distancia desde **bottom del bloque anterior** hasta **top de #acerca** | **XXXpx** | **XXXpx** | **XXXpx** |
| Distancia desde **bottom de #acerca** hasta **top del siguiente bloque** | **XXXpx** | **XXXpx** | **XXXpx** |

*Puede ser margin del bloque anterior, margin-top de #acerca, o colapso de márgenes; anotar valor final entre bordes de caja (o entre bordes de contenido si se prefiere y se documenta). Sin esto un clon “perfecto” puede quedar desalineado en la página.*

---

## 2E.1 Ancho real del texto y alineación (dentro del 85.5%)

El `width: 85.5%` no define por sí solo la posición visual; puede haber centrado (`justify-content`), `text-align: start`, margin-left implícito o alineación flex. Documentar desde Computed / getBoundingClientRect:

| Elemento | Width real (px) | Left offset desde contenedor (px) | Notas |
|----------|-----------------|-----------------------------------|--------|
| cd1b6c6 (columna texto) | **XXXpx** | **XXXpx** | Respecto a e-con-inner o #acerca |
| 7551e883 (wrapper contenido) | **XXXpx** | **XXXpx** | |
| h2 (3006085a) / h2 (286e816) | **XXXpx** | **XXXpx** | Bloque de cada heading |
| p (875ae2d) | **XXXpx** | **XXXpx** | |

*Detecta si el contenido queda centrado, alineado a start o con hueco lateral no obvio.*

---

## 2F. Line box real de headings

En tipografías custom (p. ej. Margiona) el line-box renderizado puede diferir del `line-height` declarado y generar espacio extra arriba/abajo. Medir en Computed / inspección:

| Elemento | Altura real del h2 (px) | font-size (px) | line-height (px) | Diferencia (altura − line-height) |
|----------|-------------------------|----------------|------------------|-----------------------------------|
| h2 "Esfuerzo que" (3006085a) | **XXXpx** | **XXXpx** | **XXXpx** | **XXXpx** |
| h2 "Transciende" (286e816) | **XXXpx** | **XXXpx** | **XXXpx** | **XXXpx** |

*Si la diferencia es notable, el line-height está afectando el bloque; replicar en CSS (o aceptar la diferencia si se documenta).*

---

## 3. Contexto global (crítico)

Revisar estilos heredados desde `html`, `body`, `.elementor-kit-30`, `.elementor-14`.

| Propiedad | Origen | Valor documentado |
|-----------|--------|-------------------|
| **font-size base** | body / tema | A confirmar en Computed (típ. 16px) |
| **line-height base** | body / tema | A confirmar en Computed |
| **box-sizing** | `.elementor *` | `border-box` |
| **max-width global (boxed)** | `.e-con > .e-con-inner` | `--content-width: min(100%, var(--container-max-width, 1140px))` → **1140px** por defecto |
| **Variables CSS globales (.elementor-kit-30)** | index.html línea ~147 | Ver tabla siguiente |

### Variables CSS globales que afectan al bloque

| Variable | Valor | Uso probable |
|----------|--------|---------------|
| `--e-global-color-56d9187` | `#2B2824` | Título / texto oscuro |
| `--e-global-color-8d7e92a` | `#462E3F` | Párrafo (texto cuerpo) |
| `--e-global-color-2aa7e4a` | `#F4EBDE` | Fondo (acerca) |
| `--e-global-typography-primary-font-family` | `"Roboto"` | Fallback |
| Otras del kit | (ver línea 147 index.html) | Colores y tipografía |

*Incluir en la spec del bloque las que apliquen a este contenedor.*

---

## 4. Estructura exacta del DOM

Jerarquía de nodos (no eliminar wrappers; no fusionar headings).

| # | Tipo | Clases originales | ID | Texto literal / atributos | Rol |
|---|------|-------------------|-----|---------------------------|-----|
| 1 | div | `elementor-element elementor-element-19202ba6   e-flex e-con-boxed e-con e-parent` | **acerca** | `data-id="19202ba6"` `data-element_type="container"` `data-e-type="container"` `data-settings='{"background_background":"classic"}'` | Section root |
| 2 | div | `e-con-inner` | — | — | Wrapper interno boxed |
| 3 | div | `elementor-element elementor-element-cd1b6c6 e-con-full e-flex e-con e-child` | — | `data-id="cd1b6c6"` | Contenedor fila (columna izquierda) |
| 4 | div | `elementor-element elementor-element-7551e883 e-con-full e-flex e-con e-child` | — | `data-id="7551e883"` | Wrapper contenido texto |
| 5 | div | `elementor-element elementor-element-3006085a elementor-widget__width-initial elementor-widget-tablet__width-inherit elementor-widget elementor-widget-heading` | — | `data-id="3006085a"` `data-widget_type="heading.default"` | Widget heading |
| 6 | div | `elementor-widget-container` | — | — | Contenedor del heading |
| 7 | h2 | `elementor-heading-title elementor-size-default` | — | **Esfuerzo que** (solo este texto; cierre `</h2>` en línea siguiente en HTML) | Título línea 1 |
| 8 | div | `elementor-element elementor-element-286e816 ...` | — | `data-id="286e816"` | Widget heading |
| 9 | div | `elementor-widget-container` | — | — | Contenedor del heading |
| 10 | h2 | `elementor-heading-title elementor-size-default` | — | **Transciende** (solo este texto; cierre `</h2>` en línea siguiente) | Título línea 2 |
| 11 | div | `elementor-element elementor-element-9fd1958 elementor-widget-divider--view-line elementor-widget elementor-widget-divider` | — | `data-id="9fd1958"` | Widget divider |
| 12 | div | `elementor-widget-container` | — | — | Contenedor divider |
| 13 | div | `elementor-divider` | — | — | Wrapper línea |
| 14 | span | `elementor-divider-separator` | — | (vacío) | Línea separadora |
| 15 | div | `elementor-element elementor-element-875ae2d elementor-widget__width-initial elementor-widget-mobile__width-initial elementor-widget elementor-widget-text-editor` | — | `data-id="875ae2d"` | Widget texto |
| 16 | div | `elementor-widget-container` | — | — | Contenedor párrafo |
| 17 | p | — | — | **Luján es esfuerzo, amor y pasión de quienes laboran desde el camino hasta la bodega. Es un espejo de diversidad, riqueza y audacia de la naturaleza. Nuestros productos al ser degustado por cada persona, tienen la capacidad de evocar un sinfín de recuerdos, y sentimientos en cualquier momento.** | Párrafo cuerpo |
| 18 | div | `elementor-element elementor-element-3ad97b3f e-con-full e-flex e-con e-child` | — | `data-id="3ad97b3f"` `data-settings='{"background_background":"classic"}'` | Columna derecha (vacía; posible bg) |

**Salto de línea entre "Esfuerzo que" y "Transciende":** En el HTML del original **no hay `<br>`**. Son **dos elementos `h2`** distintos (3006085a y 286e816); el salto visual es por **dos bloques en bloque**, no por wrap ni white-space. Confirmar en Computed: margin/padding entre ambos h2; no añadir `<br>` si el original no lo tiene.

---

## 5. Layout y sistema de distribución

Por contenedor relevante, por breakpoint.

### 5.1 Contenedor raíz `#acerca` (19202ba6)

**Valores declarados (page 14 JSON):** `--display:flex`; `--flex-direction:row`; `--justify-content:space-between`; `--gap:0px 0px`; `--row-gap:0px`; `--column-gap:0px`; `--padding-top:4em`; `--padding-bottom:6em`; `--padding-left:4em`; `--padding-right:4em`; `--margin:0em` (top/right/bottom/left); `background-color: var(--e-global-color-7733ea9)` → **#FFF9EF**.

| Propiedad | Desktop (≥1025px) | Tablet (768px–1024px) | Mobile (≤767px) |
|-----------|-------------------|------------------------|-----------------|
| display | flex | idem | idem |
| flex-direction | row | documentar si cambia | column si reflujo |
| justify-content | **space-between** | — | — |
| align-items | (por e-con-boxed) | — | — |
| gap / row-gap / column-gap | 0px 0px | idem | idem |
| width / max-width | 100%; max-width boxed 1140px (e-con-inner) | idem | 100% |
| min-height | (no declarado) | idem | idem |
| margin | 0em (todos) | idem | idem |
| padding | **4em 4em 6em 4em** (top right bottom left) | documentar si cambia | documentar |
| background-color | **#FFF9EF** (--e-global-color-7733ea9) | idem | idem |
| position / overflow | relative, visible (por .e-con) | idem | idem |

### 5.2 e-con-inner (wrapper boxed)

| Propiedad | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| max-width | 1140px (--content-width) | idem | 100% |
| margin | 0 auto | idem | idem |
| padding | A obtener Computed | idem | idem |
| gap (flex) | A obtener Computed | idem | idem |

### 5.3 Contenedor cd1b6c6 (columna izquierda)

**Declarado:** `--display:flex`; `--flex-direction:row`; `--justify-content:center`; `--container-widget-flex-grow:1`.

| Propiedad | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| display | flex | idem | idem |
| flex-direction | row | idem | idem |
| justify-content | **center** | idem | idem |
| flex-grow | 1 | idem | idem |
| order | — | — | documentar si cambia |

### 5.4 Contenedor 7551e883 (wrapper texto)

**Declarado:** `--padding-top:5em`; `--padding-bottom:3em`; `--padding-left:0em`; `--padding-right:1em`; `--justify-content:center`; `--gap:0px 0px`.

| Propiedad | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| padding | **5em 1em 3em 0em** (top right bottom left) | documentar | documentar |
| justify-content | center | idem | idem |
| gap | 0px 0px | idem | idem |

### 5.6 Contenedor 3ad97b3f (columna derecha vacía)

**Declarado:** sin padding/margin; `--display:flex`; `--min-height:0px`; `--justify-content:flex-start`; `--align-items:flex-start`.

| Propiedad | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| flex | (crece según space-between) | idem | idem |
| padding / margin | 0 | idem | idem |
| order | — | — | documentar si reflujo |

---

## 6. Tablas por elemento

### 6.A Tipografía

**Headings (3006085a, 286e816):** Usan `var(--e-global-typography-48b2242-font-family)`, `-font-size`, `-font-weight`, `-line-height`, `-letter-spacing`. Resolver 48b2242 en el mismo &lt;style&gt; de la página o en Computed. **text-align: start.** **width/max-width: 85.5%.**

**Párrafo (875ae2d) declarado:** `font-family: "Satoshi", Sans-serif`; `font-size: 0.92rem`; `font-weight: 400`; `line-height: 1.2rem`; `letter-spacing: 0.5px`; `color: var(--e-global-color-ad251b8)` → **#817C7B**; **text-align: justify**; **width/max-width: 94.261%.**

| Elemento | Breakpoint | font-family | font-size | font-weight | line-height | letter-spacing | text-align | white-space |
|----------|------------|-------------|-----------|-------------|-------------|----------------|------------|-------------|
| h2 (3006085a, 286e816) | Desktop | var(48b2242) → confirmar Computed | var(48b2242) | var(48b2242) | var(48b2242) | var(48b2242) | **start** | normal |
| h2 (ambos) | Tablet | idem | idem | idem | idem | idem | idem | — |
| h2 (ambos) | Mobile | idem (pos. 100% width) | idem | idem | idem | idem | idem | — |
| p (875ae2d) | Desktop | **Satoshi**, Sans-serif | **0.92rem** | **400** | **1.2rem** | **0.5px** | **justify** | normal |
| p (875ae2d) | Tablet | idem | idem | idem | idem | idem | idem | — |
| p (875ae2d) | Mobile | idem | idem | idem | idem | idem | idem | — |

*Si Satoshi no está en el proyecto, añadir @font-face o next/font y documentar fallback.*

### 6.B Dimensiones (por breakpoint)

| Elemento | Breakpoint | width | max-width | min-width | height | min-height | aspect-ratio |
|----------|------------|--------|-----------|-----------|--------|-------------|--------------|
| #acerca (19202ba6) | Desktop | 100% | (contenido boxed) | — | auto | A Computed | — |
| e-con-inner | Desktop | 100% | 1140px | — | — | — | — |
| cd1b6c6 | Desktop | A Computed | — | — | — | — | — |
| 7551e883 | Desktop | A Computed | — | — | — | — | — |
| elementor-widget heading (3006085a, 286e816) | Desktop | **85.5%** (--container-widget-width) | 85.5% | — | — | — | — |
| elementor-widget text (875ae2d) | Desktop | **94.261%** | 94.261% | — | — | — | — |
| 9fd1958 (divider) | Desktop | (auto) | — | — | — | — | — |
| 3ad97b3f | Desktop | (flex child) | — | — | — | — | — |
| (Repetir filas para Tablet y Mobile) | Tablet / Mobile | (documentar cambios) | — | — | — | — | — |

### 6.C Espaciado (por breakpoint)

| Elemento | Breakpoint | margin-top | margin-right | margin-bottom | margin-left | padding-top | padding-right | padding-bottom | padding-left |
|----------|------------|------------|--------------|---------------|-------------|-------------|---------------|----------------|--------------|
| 19202ba6 | Desktop | 0em | 0em | 0em | 0em | **4em** | **4em** | **6em** | **4em** |
| e-con-inner | Desktop | 0 | 0 | 0 | 0 | (hereda o 0) | (hereda o 0) | (hereda o 0) | (hereda o 0) |
| 7551e883 | Desktop | — | — | — | — | **5em** | **1em** | **3em** | **0em** |
| cd1b6c6 | Desktop | — | — | — | — | — | — | — | — |
| 7551e883 | Desktop | — | — | — | — | — | — | — | — |
| elementor-widget-container (headings) | Desktop | — | — | — | — | — | — | — | — |
| 9fd1958 (divider) | Desktop | — | — | — | — | — | — | — | — |
| 875ae2d (text) | Desktop | — | — | — | — | — | — | — | — |
| 3ad97b3f | Desktop | — | — | — | — | — | — | — | — |
| (Repetir para Tablet y Mobile) | — | — | — | — | — | — | — | — | — |

### 6.D Estilos visuales (por breakpoint)

| Elemento | Breakpoint | color | background-color | background-image | border | border-radius | box-shadow | opacity | z-index |
|----------|------------|--------|------------------|------------------|--------|---------------|------------|---------|---------|
| 19202ba6 | Desktop | inherit | **#FFF9EF** (var --e-global-color-7733ea9) | none | — | 0 | none | 1 | auto |
| h2 (3006085a, 286e816) | Desktop | var(48b2242) → confirmar (#2B2824 típ.) | transparent | — | — | — | — | 1 | — |
| .elementor-divider (9fd1958) .elementor-divider-separator | Desktop | — | — | — | **border-top: 0.25em solid** | 0 | — | 1 | — |
| Divider color | Desktop | — | — | — | **var(--e-global-color-e60916c)** → **#9A3C62** | — | — | — | — |
| p (875ae2d) | Desktop | **#817C7B** (--e-global-color-ad251b8) | transparent | — | — | — | — | 1 | — |
| 3ad97b3f | Desktop | — | (sin declarar en bloque) | — | — | — | — | 1 | — |
| (Repetir para Tablet y Mobile) | — | — | — | — | — | — | — | — | — |

**Divider (9fd1958) — mediciones reales para pixel-perfect:** Declarado `border-top: 0.25em solid #9A3C62`. Documentar desde Computed:

| Propiedad | Declarado | Resuelto Desktop (px) |
|-----------|-----------|------------------------|
| Altura de línea (border-top-width) | 0.25em | **XXXpx** (depende del font-size del contexto) |
| Margen vertical arriba | (widget spacing) | **XXXpx** |
| Margen vertical abajo | (widget spacing) | **XXXpx** |
| Width real del separador | 100% del contenedor | **XXXpx** o **XX%** |
| Color | #9A3C62 | Confirmar #9A3C62 en Computed |

*Divider: en widget-divider.min4d16.css --divider-color:#0c0d0e; --divider-border-width:1px; verificar en Computed si el bloque sobreescribe.*

---

## 7. Estados interactivos

| Estado | ¿Existe? | Notas |
|--------|----------|--------|
| :hover | No | Ninguno en este bloque. |
| :active | No | Ninguno. |
| :focus | No (salvo focus visible en enlaces si los hubiera) | Ninguno en este fragmento. |

**Indicación explícita:** en este bloque no hay estados interactivos propios.

---

## 8. Gestión de imágenes

| # | Origen (HTML/CSS/data) | ¿Imagen en este bloque? | Ruta local offline | Destino public | Validación |
|---|------------------------|--------------------------|--------------------|----------------|-------------|
| 1 | Bloque #acerca | No | — | — | Este bloque no contiene imágenes; solo texto + divider + columna vacía. |

**No hay imágenes en la sección «Esfuerzo que Transciende».** No usar URLs absolutas del dominio original; si en el futuro se añade imagen (p. ej. en 3ad97b3f), guardar en `public/lujan/home/` y usar rutas con barra inicial.

---

## 9. Fuentes

| Texto | font-family (declarado / Computed) | font-weight (Computed) | Fallback stack | ¿En proyecto? | Acción |
|-------|------------------------------------|------------------------|----------------|---------------|--------|
| h2 "Esfuerzo que" / "Transciende" | var(--e-global-typography-48b2242-font-family) → confirmar en Computed | var(48b2242) | Sans-serif | Margiona sí (globals.css) | Resolver 48b2242 en style de la página o Computed |
| p (cuerpo) | **Satoshi**, Sans-serif | 400 | Sans-serif | Comprobar Satoshi en proyecto | Añadir @font-face o next/font si falta |

*Confirmar en DevTools → Computed en el sitio original. Si Satoshi no existe localmente, usar fallback (ej. Roboto) y documentar.*

---

## 10. Validación pixel-perfect

| Verificación | Desktop | Tablet | Mobile |
|--------------|---------|--------|--------|
| Altura total del bloque | Screenshot original vs implementación | idem | idem |
| Distancia entre elementos | ≤2px diferencia | idem | idem |
| Alineación horizontal | Coincide | idem | idem |
| max-width boxed | 1140px | idem | 100% |
| Comportamiento flex en mobile | Reflujo idéntico | — | idem |
| Divider alineado | Sí | idem | idem |
| Diferencia máxima permitida | 2px | 2px | 2px |

*Si diferencia > 2px, documentar ajuste exacto necesario.*

---

## 11. Checklist final (sin implementación aún)

| # | Item | Estado |
|---|------|--------|
| 1 | Layout exacto desktop | Pendiente medición |
| 2 | Layout exacto tablet | Pendiente medición |
| 3 | Layout exacto mobile | Pendiente medición |
| 4 | Espaciados coinciden | Pendiente Computed |
| 5 | Proporciones coinciden | Pendiente |
| 6 | max-width coincide | 1140px boxed |
| 7 | Tipografías coinciden | Pendiente Computed |
| 8 | Divider alineado | Pendiente |
| 9 | No hay URLs externas | N/A (sin imágenes) |
| 10 | No hay 404 | N/A |
| 11 | Reflujo idéntico al original | Pendiente |

---

## 12. Referencia rápida: textos literales

- **h2 (primera línea):** `Esfuerzo que` + salto de línea.
- **h2 (segunda línea):** `Transciende` + salto de línea.
- **p:** `Luján es esfuerzo, amor y pasión de quienes laboran desde el camino hasta la bodega. Es un espejo de diversidad, riqueza y audacia de la naturaleza. Nuestros productos al ser degustado por cada persona, tienen la capacidad de evocar un sinfín de recuerdos, y sentimientos en cualquier momento.`

---

## Protocolo de ingeniería visual (estándar reutilizable)

Esta spec sirve como **plantilla** para migrar cualquier sección Elementor → React/Next sin margen de error. Para cada nueva sección:

1. **Estructura DOM** — No omitir wrappers; listar todos los nodos y data-id.
2. **Declarado vs resuelto** — Nunca usar solo JSON/declarado; añadir tabla **Mediciones reales en px** y rellenar desde Computed.
3. **Altura total del bloque** — Medir en Desktop, Tablet y Mobile (px).
4. **Distribución de columnas** — Ancho real (px y %) de cada columna flex; confirmar si 50/50, 60/40, auto+grow.
5. **Reflujo** — Ancho exacto (px) donde cambia layout (row→column u otros).
6. **Relación con bloques adyacentes** — Distancia bottom bloque anterior → top del bloque; bottom del bloque → top siguiente (Desktop, Tablet, Mobile).
7. **Ancho real del texto y alineación** — Width real en px y left offset desde contenedor (no solo %); detectar centrado o margin implícito.
8. **Line box real de headings** — Altura renderizada del h2 (px), font-size, line-height y diferencia (tipografías custom).
9. **Saltos de línea** — Confirmar si es `<br>`, dos bloques, o wrap por width; no asumir.
10. **Divider / líneas** — Altura en px, márgenes verticales, width real.
11. **Checklist final** — Incluir ítem “Valores en px rellenados” y “Altura total verificada”.

---

## Cumplimiento 10/10 (pixel-perfect)

| Requisito | Estado |
|-----------|--------|
| Valores declarados documentados | ✅ |
| **Valores computados en px documentados** | ⬜ Rellenar tablas 2A y Divider |
| **Altura total del bloque (3 breakpoints)** | ⬜ Rellenar tabla 2B |
| **Ancho real de columnas (px / %)** | ⬜ Rellenar tabla 2C |
| **Reflujo exacto (ancho en px)** | ⬜ Rellenar tabla 2D |
| **Relación con bloques adyacentes (2E)** | ⬜ Rellenar distancias anterior/siguiente |
| **Ancho real del texto y left offset (2E.1)** | ⬜ Rellenar width px y offset desde contenedor |
| **Line box real de h2 (2F)** | ⬜ Rellenar altura, font-size, line-height, diferencia |
| Salto de línea h2 confirmado (dos h2, no &lt;br&gt;) | ✅ |
| Divider: altura y márgenes en px | ⬜ Rellenar subsección Divider |
| Checklist final completo | ✅ |

*Documento solo de especificación (tablas). Implementación en Next.js en fases posteriores según este spec. Spec v2.0 — blindada para 10/10 una vez rellenados todos los XXXpx desde DevTools.*
