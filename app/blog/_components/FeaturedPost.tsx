"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, Tag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Content } from "@/types/content";
import { ContentType } from "@/types/common";
import { getContentTypeBadgeVariant,   translateContentType } from "@/lib/blog/utils";

interface FeaturedContentProps {
  content: Content;
}

export function FeaturedContent({ content }: FeaturedContentProps) {
  const formatDate = (date?: Date) =>
    date
      ? new Date(date).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Sin fecha";

  const getExcerpt = (body?: string, maxLength = 200) =>
    body ? body.replace(/<[^>]*>/g, "").slice(0, maxLength) + "..." : "";

  const getAuthorName = () =>
    content.author ? `${content.author.firstName} ${content.author.lastName}` : "";

  const getButtonText = () => {
    switch (content.type) {
      case ContentType.NEWS:
        return "Ver noticia completa";
      case ContentType.ARTICLE:
        return "Leer artículo";
      case ContentType.PAGE:
        return "Ver página";
      default:
        return "Leer más";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`rounded-2xl overflow-hidden shadow-lg bg-white`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative h-[300px] lg:h-[400px]">
          <Image
            src={content.featuredImage || "/placeholder.svg?height=600&width=800"}
            alt={content.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          <Badge
            className={`absolute top-4 right-4 font-medium ${getContentTypeBadgeVariant(content.type)}`}
            variant="secondary"
          >
            {translateContentType(content.type)}
          </Badge>
        </div>

        <div className="p-6 lg:p-8 flex flex-col justify-center">
          <div className="space-y-4">
            {content.metadata?.category && (
              <div className="flex items-center text-sm text-gray-600">
                <Tag className="w-4 h-4 mr-1" />
                {content.metadata.category}
              </div>
            )}

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{content.title}</h2>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {content.author && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {getAuthorName()}
                </div>
              )}
              {content.publishedAt && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(content.publishedAt)}
                </div>
              )}
              {content.metadata?.readTime && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {content.metadata.readTime} min de lectura
                </div>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed">
              {content.metadata?.excerpt || getExcerpt(content.body)}
            </p>

            {content.type === ContentType.NEWS && content.metadata?.source && (
              <div className="bg-white p-4 rounded-lg text-sm text-gray-600">
                <span className="font-bold text-amber-600">Fuente:</span> {content.metadata.source}
              </div>
            )}

            <Button asChild className="w-fit">
              <Link href={`/blog/${content.slug}`}>{getButtonText()}</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
