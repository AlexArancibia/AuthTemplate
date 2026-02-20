# Comparación: implementación vs original (Esfuerzo que Transciende)

**Original:** `c:\My Web Sites\vitivinicolalujan-offline\vitivinicolalujan.com\index.html`  
**Nuestra implementación:** `app/globals.css` (`.lujan-esfuerzo*`) + `components/lujan/EsfuerzoTransciende.tsx`

---

## 1. Section root (19202ba6 / .lujan-esfuerzo)

| Propiedad | Original | Nuestro | ¿Igual? |
|-----------|----------|---------|--------|
| margin | 0em (t r b l) | 0 | ✅ |
| padding desktop | 4em 4em 6em 4em | 4em 4em 6em 4em | ✅ |
| padding tablet (≤1024) | 3em 1em 3em 1em | 3em 1em 3em 1em | ✅ |
| padding móvil (≤767) | 2em 0 0 0 | 2em 0 0 0 | ✅ |
| display / flex-direction | flex, row | flex, row | ✅ |
| flex-direction móvil | (column por reflujo) | column | ✅ |
| justify-content | space-between | space-between | ✅ |
| background-color | #FFF9EF (var 7733ea9) | #fff9ef | ✅ |

---

## 2. Wrapper boxed (e-con-inner / .lujan-esfuerzo__inner)

| Propiedad | Original | Nuestro | ¿Igual? |
|-----------|----------|---------|--------|
| max-width desktop | **1500px** (--content-width en 19202ba6 a min-width 768px); global .e-con 1140px, pero 19202ba6 sobreescribe con 1500px | 1140px | ❌ **Corregir: 1500px en desktop** |
| max-width tablet (≤1024) | 1024px (.e-con) | 1024px | ✅ |
| max-width móvil (≤767) | 767px (.e-con) | 767px | ✅ |
| margin | 0 auto (típ. boxed) | 0 auto | ✅ |
| display / flex | flex, row | flex, row | ✅ |
| flex-direction móvil | column | column | ✅ |

---

## 3. Columna texto (cd1b6c6 / .lujan-esfuerzo__col-text)

| Propiedad | Original | Nuestro | ¿Igual? |
|-----------|----------|---------|--------|
| desktop width | (flex child; 7551e883 50%, 3ad97b3f 60% son hermanos del inner) | 45.45% (aprox. 50/(50+60)) | ⚠️ Original 50%+60% no suma 100%; nuestro reparto evita overflow |
| tablet width (768–1024) | cd1b6c6 100%; 7551e883 45.63%; 3ad97b3f 50% | 45.63% | ✅ (aplicamos % de columna texto) |
| móvil | 100%, margin 0, padding 0 | 100%, margin 0, padding 0 | ✅ |
| justify-content | center | center | ✅ |
| tablet justify-content | space-between | space-between | ✅ |

---

## 4. Wrapper contenido texto (7551e883 / .lujan-esfuerzo__content)

| Propiedad | Original | Nuestro | ¿Igual? |
|-----------|----------|---------|--------|
| padding | 5em 1em 3em 0 (t r b l) | 5em 1em 3em 0 | ✅ |
| justify-content | center | center | ✅ |
| gap | 0 | 0 | ✅ |

---

## 5. Contenedor primer h2 (3006085a / .lujan-esfuerzo__heading-wrap--first)

| Propiedad | Original | Nuestro | ¿Igual? |
|-----------|----------|---------|--------|
| padding | 0 0 1em 0 (.elementor-widget-container) | 0 0 1em 0 | ✅ |
| margin | 0 | 0 | ✅ |

---

## 6. Contenedor segundo h2 (286e816 / .lujan-esfuerzo__heading-wrap)

| Propiedad | Original | Nuestro | ¿Igual? |
|-----------|----------|---------|--------|
| margin-block-end | 20px (:not(:last-child)) | margin-block-end: 20px | ✅ |

---

## 7. Títulos h2 (3006085a, 286e816 / .lujan-esfuerzo__title)

| Propiedad | Original | Nuestro | ¿Igual? |
|-----------|----------|---------|--------|
| width / max-width | 85.5% | 85.5% | ✅ |
| font-family | Margiona (48b2242) | "Margiona", sans-serif | ✅ |
| font-size desktop | 3.8rem | 3.8rem | ✅ |
| font-size tablet | 3rem | 3rem | ✅ |
| font-size móvil | 2rem | 2rem | ✅ |
| line-height desktop | 3.5rem | 3.5rem | ✅ |
| line-height tablet | 3.2rem | 3.2rem | ✅ |
| line-height móvil | 2.7rem | 2.7rem | ✅ |
| font-weight | 500 | 500 | ✅ |
| letter-spacing | 0.3px | 0.3px | ✅ |
| text-align | start | start | ✅ |
| color (línea 1) | #2B2824 (56d9187) | #2b2824 | ✅ |
| color "Transciende" | (mismo o accent) | #9a3c62 | ✅ (spec: subrayado color e60916c) |

---

## 8. Divider (9fd1958 / .lujan-esfuerzo__divider-line)

| Propiedad | Original | Nuestro | ¿Igual? |
|-----------|----------|---------|--------|
| border-top | 0.25em solid | 0.25em solid | ✅ |
| color | #9A3C62 (e60916c) | #9a3c62 | ✅ |
| width | 100% (del contenedor) | 100% | ✅ |

---

## 9. Párrafo (875ae2d / .lujan-esfuerzo__body, __body-wrap)

| Propiedad | Original | Nuestro | ¿Igual? |
|-----------|----------|---------|--------|
| width / max-width | 94.261% | 94.261% | ✅ |
| font-family | Satoshi, Sans-serif | "Satoshi", sans-serif | ✅ |
| font-size | 0.92rem | 0.92rem | ✅ |
| font-weight | 400 | 400 | ✅ |
| line-height | 1.2rem | 1.2rem | ✅ |
| letter-spacing | 0.5px | 0.5px | ✅ |
| color | #817C7B (ad251b8) | #817c7b | ✅ |
| text-align | justify | justify | ✅ |

---

## 10. Columna imagen (3ad97b3f / .lujan-esfuerzo__col-image)

| Propiedad | Original | Nuestro | ¿Igual? |
|-----------|----------|---------|--------|
| desktop width | 60% (min-width 768) | 54.55% (60/110) | ⚠️ Ver nota columnas |
| tablet width | 50% | 50% | ✅ |
| móvil | 100% | 100% | ✅ |
| margin / padding | 0 | 0 | ✅ |
| background-image | url(Home-1-Mesa-de-trabajo-18-1.webp) | url(/lujan/home/esfuerzo-transciende.webp) | ✅ (mismo asset copiado) |
| background-size | cover | cover | ✅ |
| min-height | (no en original) | 280px desktop, 320px móvil | ℹ️ Añadido nuestro para evitar colapso |

---

## Resumen

- **Coincide con el original:** section (márgenes, paddings por breakpoint), contenido texto (7551e883 padding), contenedores de headings (padding 0 0 1em 0, margin-block-end 20px), tipografía h2 y p, divider, columna imagen (tablet/móvil, background).
- **Diferencia a corregir:** **max-width del inner en desktop** debe ser **1500px** (original: --content-width: 1500px en 19202ba6 para viewport ≥768px).
- **Diferencias asumidas:** (1) Desktop: reparto de columnas 45.45% / 54.55% en lugar de 50% / 60% para no superar 100%. (2) min-height en columna imagen: no existe en el original; lo añadimos para evitar altura 0.
