import { cn } from "@/lib/utils"

interface BlogContentProps {
  content: string
  className?: string
}

export function BlogContent({ content, className }: BlogContentProps) {
  return (
    <div
      className={cn(
        "prose prose-gray max-w-none px-4",

        /* Interlineado general mejorado */
        "text-base leading-relaxed",

        /* Encabezados */
        "prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mb-5",
        "prose-h1:text-3xl prose-h1:leading-tight prose-h1:mb-6",
        "prose-h2:text-2xl prose-h2:leading-tight prose-h2:mt-10 prose-h2:mb-4",
        "prose-h3:text-xl prose-h3:leading-snug prose-h3:mt-8 prose-h3:mb-4",
        "prose-h4:text-lg prose-h4:leading-snug prose-h4:mt-6 prose-h4:mb-3",

        /* Párrafos */
        "prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6",

        /* Enlaces */
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",

        /* Texto enfatizado */
        "prose-strong:text-gray-900 prose-strong:font-semibold",

        /* Listas - Corregido con selectores más específicos */
        "prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:space-y-2",
        "prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:space-y-2",
        "prose-li:text-gray-600 prose-li:leading-relaxed prose-li:my-1",
        
        /* Selectores adicionales para listas usando sintaxis [&_elemento] */
        "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2 [&_ul]:text-gray-600",
        "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2 [&_ol]:text-gray-600",
        "[&_li]:leading-relaxed [&_li]:my-1",
        
        /* Listas anidadas */
        "[&_ul_ul]:list-disc [&_ul_ul]:pl-4 [&_ul_ul]:mb-2 [&_ul_ul]:mt-2",
        "[&_ol_ol]:list-decimal [&_ol_ol]:pl-4 [&_ol_ol]:mb-2 [&_ol_ol]:mt-2",
        "[&_ul_ol]:list-decimal [&_ul_ol]:pl-4 [&_ul_ol]:mb-2 [&_ul_ol]:mt-2",
        "[&_ol_ul]:list-disc [&_ol_ul]:pl-4 [&_ol_ul]:mb-2 [&_ol_ul]:mt-2",

        /* Citas */
        "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:mb-6 prose-blockquote:leading-relaxed",

        /* Imágenes */
        "prose-img:rounded-lg prose-img:shadow-md prose-img:my-8",

        /* Código */
        "prose-code:bg-gray-100 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-sm",
        "prose-pre:bg-gray-100 prose-pre:rounded prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:my-6 prose-pre:leading-normal",

        /* Tablas */
        "[&_table]:w-full [&_table]:border-collapse [&_table]:my-8 [&_table]:overflow-hidden [&_table]:rounded-md [&_table]:border [&_table]:border-gray-200",
        "[&_th]:p-3 [&_th]:text-left [&_th]:font-semibold [&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-100 [&_th]:text-gray-700 [&_th]:leading-normal",
        "[&_td]:p-3 [&_td]:border [&_td]:border-gray-200 [&_td]:text-gray-600 [&_td]:leading-normal",
        "[&_tr:nth-child(even)]:bg-gray-50 [&_tr:hover]:bg-gray-50/80",

        /* Colgroup y col */
        "[&_colgroup]:border-none [&_col]:border-none",

        /* Atributos colspan y rowspan */
        "[&_[colspan]]:table-cell [&_[rowspan]]:table-cell",

        /* Asegurar que los estilos inline no interfieran */
        "[&_table]:!table [&_tr]:!table-row [&_th]:!table-cell [&_td]:!table-cell",

        /* Espaciado general */
        "space-y-6",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}