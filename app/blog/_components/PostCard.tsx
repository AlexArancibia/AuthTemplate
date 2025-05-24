"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, Clock, Tag, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Content } from "@/types/content"
import { getContentTypeBadgeVariant, translateContentType } from "@/lib/blog/utils"
import { ContentType } from "@/types/common"


interface PostCardProps {
  content: Content
  index: number
}

export function PostCard({ content, index }: PostCardProps) {
  // Función para formatear la fecha
  const formatDate = (date: Date | undefined) => {
    if (!date) return "Sin fecha"
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Función para obtener un extracto del cuerpo
  const getExcerpt = (body: string | undefined, maxLength = 120) => {
    if (!body) return ""
    // Convertir HTML a texto plano
    const text = body.replace(/<[^>]*>/g, "")
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
  }

  // Obtener el nombre completo del autor
  const getAuthorName = () => {
    if (!content.author) return ""
    return `${content.author.firstName} ${content.author.lastName}`
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <Link href={`/blog/${content.slug}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={content.featuredImage || "/placeholder.svg?height=400&width=600"}
            alt={content.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge
            className={`absolute top-3 right-3 font-medium ${getContentTypeBadgeVariant(content.type)}`}
            variant="secondary"
          >
            {translateContentType(content.type)}
          </Badge>
        </div>

        <div className="p-5 space-y-3">
          {content.metadata?.category && (
            <div className="flex items-center text-xs text-gray-600">
              <Tag className="w-3 h-3 mr-1" />
              {content.metadata.category}
            </div>
          )}

          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {content.title}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-3">{content.metadata?.excerpt || getExcerpt(content.body)}</p>

          <div className="flex flex-wrap gap-3 pt-2 text-xs text-gray-500">
            {content.author && (
              <div className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                {getAuthorName()}
              </div>
            )}

            {content.publishedAt && (
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(content.publishedAt)}
              </div>
            )}

            {content.metadata?.readTime && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {content.metadata.readTime} min
              </div>
            )}

            {/* Información específica para noticias */}
            {content.type === ContentType.NEWS && content.metadata?.source && (
              <div className="flex-1 text-right font-medium text-amber-600">{content.metadata.source}</div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

