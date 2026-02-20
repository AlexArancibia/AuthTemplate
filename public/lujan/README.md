# Imágenes Vitivinícola Luján

Las imágenes **no** venían descargadas en la copia offline; el crawler guardó solo HTML.  
Coloca aquí las imágenes descargadas del sitio, organizadas por carpeta.

## Estructura

| Carpeta       | Uso                                      |
|---------------|------------------------------------------|
| `header/`     | Logo, logo extendido, iconos del header |
| `home/`       | Hero, slides, secciones de la home       |
| `contactanos/`| Fondo, fotos de contacto, mapa          |
| `nosotros/`   | Fotos de la página Nosotros             |
| `eventos/`    | Fotos de la página Eventos              |
| `tienda/`     | Banners o assets de la tienda           |
| `productos/`  | Imágenes de productos (o usar API)      |
| `shared/`     | Fondos, iconos y assets comunes          |

## Rutas en código

En la app se usan rutas como:

- `/lujan/header/logo.png`
- `/lujan/home/hero.webp`
- `/lujan/contactanos/fondo-contacto.webp`
- etc.

## Descargar todas las imágenes

Desde la raíz del proyecto (AuthTemplate):

```bash
pnpm run lujan:download-images "C:\My Web Sites\vitivinicolalujan-offline\vitivinicolalujan.com"
```

O con variable de entorno:

```bash
set LUJAN_OFFLINE_ROOT=C:\My Web Sites\vitivinicolalujan-offline\vitivinicolalujan.com
pnpm run lujan:download-images
```

El script lee los JSON de `wp-json/wp/v2/pages` y `wp-json/wp/v2/product`, extrae las URLs de imágenes y las guarda en las carpetas anteriores según la página (inicio→home, contactanos→contactanos, etc.).

## Origen de las URLs

Las URLs originales están en los JSON de `vitivinicolalujan-offline` (wp-json wp/v2/pages) o en el sitio en vivo:  
`https://vitivinicolalujan.com/wp-content/uploads/2025/01/...`
