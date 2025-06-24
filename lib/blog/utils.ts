import { ContentType } from "@/types/common"

// Traducciones de ContentType al español
export const contentTypeTranslations = {
  [ContentType.ARTICLE]: "Artículo",
  [ContentType.BLOG]: "Blog",
  [ContentType.PAGE]: "Página",
  [ContentType.NEWS]: "Noticia",
}

// Traducciones de ContentType al inglés (por si se necesita en el futuro)
export const contentTypeTranslationsEn = {
  [ContentType.ARTICLE]: "Article",
  [ContentType.BLOG]: "Blog",
  [ContentType.PAGE]: "Page",
  [ContentType.NEWS]: "News",
}

/**
 * Traduce un ContentType al español
 * @param type El tipo de contenido a traducir
 * @returns La traducción en español
 */
export function translateContentType(type: ContentType): string {
  return contentTypeTranslations[type] || type
}

/**
 * Obtiene el color de fondo según el tipo de contenido
 * @param type El tipo de contenido
 * @returns Clase CSS para el color de fondo
 */
 
/**
 * Obtiene la variante de badge según el tipo de contenido
 * @param type El tipo de contenido
 * @returns Clases CSS para el badge
 */
export function getContentTypeBadgeVariant(type: ContentType): string {
  switch (type) {
    case ContentType.BLOG:
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case ContentType.ARTICLE:
      return "bg-purple-100 text-purple-800 hover:bg-purple-200"
    case ContentType.PAGE:
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case ContentType.NEWS:
      return "bg-amber-100 text-amber-800 hover:bg-amber-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

