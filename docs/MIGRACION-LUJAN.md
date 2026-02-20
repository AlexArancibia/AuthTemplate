# Plan completo de migración: Vitivinícola Luján → AuthTemplate

## 1. Estado de las imágenes

**Las imágenes no están descargadas en la copia offline.**

- El crawler guardó páginas HTML y en `_https_.../wp-content/uploads/...` hay solo **index.html** (páginas de error/redirect), no archivos .webp/.jpg.
- Las URLs de imágenes siguen siendo las del sitio en vivo: `https://vitivinicolalujan.com/wp-content/uploads/2025/01/...` (referenciadas en los JSON de wp-json).

**Qué se hizo:**

- En AuthTemplate se creó la estructura bajo **`public/lujan/`** para que, cuando tengas las imágenes, vayan ahí y se usen desde `/lujan/...` en el código.
- Por ahora las imágenes se pueden usar desde la URL del sitio en vivo; cuando las descargues, las colocas en `public/lujan/` y se cambian las rutas en el código a `/lujan/...`.

### Estructura en `public/lujan/`

```
public/lujan/
├── README.md          # Descripción y uso de carpetas
├── header/            # Logo, logo extendido
├── home/              # Hero, slides, secciones home
├── contactanos/       # Fondo, fotos contacto
├── nosotros/          # Fotos página Nosotros
├── eventos/           # Fotos página Eventos
├── tienda/            # Banners tienda
├── productos/         # Imágenes de productos (si se guardan locales)
└── shared/            # Fondos e iconos comunes
```

En código se usan rutas como: `/lujan/header/logo.png`, `/lujan/home/hero.webp`, etc.

---

## 2. Fases del plan de migración

### Fase 0: Preparación (hecho / en curso)

- [x] Estructura `public/lujan/*` creada.
- [ ] Decidir origen de imágenes: descargar del sitio en vivo a `public/lujan/` o usar URLs en vivo por ahora.
- [ ] Si descargas: script o proceso para bajar desde las URLs de los JSON a las carpetas correspondientes (por página: home, contactanos, nosotros, eventos, tienda).

---

### Fase 1: Configuración global y marca

| Tarea | Dónde | Detalle |
|-------|--------|---------|
| Metadata y marca | `app/layout.tsx` | Título por defecto "Vitivinícola Luján", description, `metadataBase` a dominio Luján, Open Graph, Twitter. |
| Favicon / PWA | `public/favicons/`, manifest | Sustituir por logo Luján si aplica; actualizar `manifest.webmanifest` (name, icons). |
| Logo en header | `components/headers/HeaderLujanPrimary.tsx` | Usar `/lujan/header/logo.png` (o extendido) cuando exista; si no, mantener URL actual. |

---

### Fase 2: Home (`/`)

| Tarea | Detalle |
|-------|---------|
| Fuente de contenido | JSON página **Inicio** (id 14) en `vitivinicolalujan-offline/.../wp-json/wp/v2/pages/14.json`. |
| Componentes | Hero (imagen/video), bloque intro, productos destacados, CTA. Crear o reutilizar en `components/home/`. |
| Imágenes | Hero y secciones: colocar en `public/lujan/home/` y referenciar como `/lujan/home/...`. |
| Página | `app/page.tsx`: dejar de devolver `null`; renderizar los bloques con datos extraídos del JSON. |

---

### Fase 3: Contactanos (`/contactanos`)

| Tarea | Detalle |
|-------|---------|
| Fuente | JSON **Contactanos** (id 38). |
| Contenido | Títulos, texto, formulario (nombre, email, mensaje), botón/link WhatsApp (ej. 986541932). |
| Mapa | Iframe Google Maps: extraer URL del JSON y embeber en un componente. |
| Imágenes | Fondo y fotos en `public/lujan/contactanos/`; en código usar `/lujan/contactanos/...`. |

---

### Fase 4: Nosotros (`/nosotros`)

| Tarea | Detalle |
|-------|---------|
| Fuente | JSON **Nosotros** (id 1943). |
| Contenido | Hero "Nosotros / SOMOS LUJÁN", sección "Trabaja con Nosotros", bloques (Precios competitivos, etc.), "El Campo y el Sol", texto e imágenes. |
| Componentes | Reactivar/rellenar secciones ya existentes en la página; añadir las que falten. |
| Imágenes | En `public/lujan/nosotros/`; rutas `/lujan/nosotros/...`. |

---

### Fase 5: Eventos (`/eventos`)

| Tarea | Detalle |
|-------|---------|
| Fuente | JSON **Eventos** (id 1982). |
| Contenido | Hero "Brindemos por lo que nos hace felices", catálogo descargable, "TU PROVEEDOR DE EVENTOS", galería, mapa, WhatsApp. |
| Enlaces | Botones a PDF (Drive) y a WhatsApp. |
| Imágenes | En `public/lujan/eventos/`; rutas `/lujan/eventos/...`. |

---

### Fase 6: Tienda / Productos

| Tarea | Detalle |
|-------|---------|
| Ruta | Mantener listado en `/productos`; opcional: `app/tienda/page.tsx` que redirija o reutilice la misma vista. |
| Imágenes productos | Según backend: si hay URLs en API, usarlas; si se guardan locales, usar `public/lujan/productos/` y rutas `/lujan/productos/...`. |
| Banners tienda | En `public/lujan/tienda/` si aplica. |

---

### Fase 7: Cart y Checkout

| Tarea | Detalle |
|-------|---------|
| Textos | Revisar copy, moneda (S/), mensajes para que sean coherentes con Luján. |
| Sin cambios estructurales | Flujo existente en AuthTemplate; solo ajuste de contenido y marca. |

---

### Fase 8: Contenido estático y datos

| Tarea | Detalle |
|-------|---------|
| Copiar JSON de páginas | Opcional: copiar los 6 JSON de `wp-json/wp/v2/pages` a algo como `content/lujan/pages/` en AuthTemplate para leer en build (getStaticProps o script que genere datos). |
| Helper de contenido | Función tipo `getPageBySlug('nosotros')` que devuelva título, extractos de contenido y lista de URLs de imágenes para mapear a rutas `/lujan/...`. |

---

## 3. Orden recomendado de ejecución

1. Fase 0 (imágenes): decidir si se descargan ya o se usan URLs en vivo; si se descargan, llenar `public/lujan/` según README.
2. Fase 1: layout, metadata, logo en header.
3. Fase 2: Home.
4. Fases 3, 4, 5: Contactanos, Nosotros, Eventos (en el orden que prefieras).
5. Fase 6: Tienda/productos.
6. Fase 7: Ajustes Cart/Checkout.
7. Fase 8: Organización de datos estáticos y helper de contenido.

---

## 4. Rutas de imágenes en código

- **Header / logo:** `/lujan/header/logo.png`, `/lujan/header/logo-extend.png`.
- **Home:** `/lujan/home/hero.webp`, `/lujan/home/slide-1.webp`, etc.
- **Contactanos:** `/lujan/contactanos/fondo.webp`, etc.
- **Nosotros:** `/lujan/nosotros/hero.webp`, `/lujan/nosotros/...`.
- **Eventos:** `/lujan/eventos/...`.
- **Tienda/productos:** `/lujan/tienda/...`, `/lujan/productos/...`.
- **Compartidos:** `/lujan/shared/...`.

Mientras no existan archivos en `public/lujan/`, se pueden seguir usando las URLs completas de `vitivinicolalujan.com`; al añadir los archivos, se sustituyen por las rutas anteriores.

---

## 5. Resumen

- **Imágenes:** No estaban en la copia offline; se usa `public/lujan/` organizado por carpetas y, por ahora, URLs en vivo o descarga posterior.
- **Contenido:** De los JSON de `vitivinicolalujan-offline/.../wp-json/wp/v2/pages` (Inicio, Contactanos, Nosotros, Eventos, Tienda, Cart).
- **Migración:** Recrear secciones en React con datos de esos JSON; imágenes desde `public/lujan/` cuando estén disponibles.
