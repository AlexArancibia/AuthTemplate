"use client"

import { Star } from "lucide-react"
import { Reveal } from "../Reveal"
import { SectionHeader } from "../SectionHeader"

interface TestimonialItem {
  name?: string
  role?: string
  image?: string
  quote?: string
  rating?: number
}

export function Testimonials({
  data,
}: {
  data: { title?: string; subtitle?: string; items?: TestimonialItem[] }
}) {
  const items = data.items || []
  if (!items.length) return null
  return (
    <section className="container-section py-16 sm:py-20">
      <div className="content-section">
        <SectionHeader title={data.title} subtitle={data.subtitle} className="mb-12" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.slice(0, 6).map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <figure className="flex h-full flex-col border border-border bg-background p-7">
                <div className="mb-4 flex gap-0.5">
                  {[...Array(5)].map((_, s) => (
                    <Star
                      key={s}
                      className={
                        s < (item.rating ?? 5)
                          ? "h-4 w-4 fill-brand text-brand"
                          : "h-4 w-4 text-border"
                      }
                    />
                  ))}
                </div>
                <blockquote
                  className="flex-grow text-sm leading-relaxed text-foreground [&_p]:mb-0"
                  dangerouslySetInnerHTML={{ __html: item.quote || "" }}
                />
                <figcaption className="mt-5 border-t border-border pt-4">
                  <span className="block text-sm font-medium text-foreground">{item.name}</span>
                  {item.role && (
                    <span className="text-xs text-muted-foreground">{item.role}</span>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
