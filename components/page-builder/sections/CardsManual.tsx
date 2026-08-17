"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Reveal } from "../Reveal"
import { SectionHeader } from "../SectionHeader"

interface CardItem {
  icon?: string
  image?: string
  title?: string
  subtitle?: string
  description?: string
  link?: string
  buttonText?: string
  buttonLink?: string
}

export function CardsManual({
  data,
}: {
  data: { title?: string; subtitle?: string; items?: CardItem[] }
}) {
  const items = data.items || []
  if (!items.length) return null

  const isCta = items.length === 1 && !data.title

  // Full-width CTA banner variant (e.g. "regalo")
  if (isCta) {
    const item = items[0]
    return (
      <section className="container-section py-16 sm:py-20">
        <div className="content-section">
          <Reveal className="relative overflow-hidden bg-foreground">
            <div className="grid items-center gap-0 md:grid-cols-2">
              {item.image && (
                <div className="relative h-64 w-full md:h-full md:min-h-[360px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.title || ""} className="absolute inset-0 h-full w-full object-cover" />
                </div>
              )}
              <div className="flex flex-col items-start gap-4 p-8 sm:p-12 lg:p-16">
                {item.icon && <span className="text-3xl">{item.icon}</span>}
                {item.title && (
                  <h2 className="text-background">{item.title}</h2>
                )}
                {item.description && (
                  <p className="max-w-md text-sm leading-relaxed text-background/70 sm:text-base">
                    {item.description}
                  </p>
                )}
                {item.buttonText && (
                  <Link
                    href={item.buttonLink || item.link || "/productos"}
                    className="mt-2 inline-flex items-center gap-2 bg-brand px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-foreground transition-colors hover:bg-brand-dark"
                  >
                    {item.buttonText}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  // Editorial cards grid (e.g. "categorias")
  const cols = items.length >= 3 ? "md:grid-cols-3" : items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1"

  return (
    <section className="container-section py-16 sm:py-20">
      <div className="content-section">
        <SectionHeader title={data.title} subtitle={data.subtitle} className="mb-10" />
        <div className={`grid grid-cols-1 gap-5 ${cols}`}>
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <Link
                href={item.buttonLink || item.link || "/productos"}
                className="group relative block aspect-[4/5] overflow-hidden bg-secondary"
              >
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.title || ""}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  {item.subtitle && (
                    <span className="eyebrow text-white/70">{item.subtitle}</span>
                  )}
                  <h3 className="mt-1 text-white">{item.title}</h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-white/90">
                    Explorar
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CardsManual
