import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Content } from "@/types/content";

interface BlogCardProps {
  content: Content;
}

export function BlogCard({ content }: BlogCardProps) {
  const publishedDate = content.publishedAt ? new Date(content.publishedAt) : null;
  
  return (
    <Link
      href={`/blog/${content.slug}`}
      className="group block   rounded-2xl bg-white transition-all duration-300 hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden ">
        <Image
          src={content.featuredImage || "/placeholder.svg"}
          alt={content.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 rounded-b-xl border border-border border-t-0" >
        <Badge variant="secondary" className="bg-primary/10 text-accent hover:bg-primary/20 ">
          {content.type}
        </Badge>

        <h3 className="text-xl font-semibold text-secondary line-clamp-2 group-hover:text-primary transition-colors">
          {content.title}
        </h3>

        <div className="flex items-center gap-3 ">
          <div className="flex gap-2 text-sm text-muted-foreground">
            {content.author ? <span>{content.author.firstName} {content.author.lastName}</span> : <span>Autor desconocido</span>}
            <span>·</span>
            {publishedDate && (
              <time dateTime={publishedDate.toISOString()}>
                {publishedDate.toLocaleDateString()}
              </time>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
