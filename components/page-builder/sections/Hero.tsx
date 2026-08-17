"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"

interface HeroData {
  title?: string
  subtitle?: string
  description?: string
  background?: string
  mobileBackground?: string
  overlay?: boolean
  buttonText?: string
  buttonLink?: string
}

export function Hero({ data }: { data: HeroData }) {
  const reduce = useReducedMotion()
  const desktop = data.background || "/placeholders/hero.svg"
  const mobile = data.mobileBackground || desktop

  return (
    <section className="relative h-[82vh] min-h-[520px] w-full overflow-hidden bg-foreground">
      {/* Background image (responsive) */}
      <picture>
        <source media="(min-width: 768px)" srcSet={desktop} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mobile}
          alt={data.title || "Scentra"}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      {/* Overlay */}
      {data.overlay !== false && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
      )}

      {/* Content */}
      <div className="container-section relative z-10 flex h-full items-center">
        <div className="content-section">
          <motion.div
            className="max-w-2xl"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {data.subtitle && (
              <span className="eyebrow text-white/80">{data.subtitle}</span>
            )}
            {data.title && (
              <h1 className="mt-4 text-white">{data.title}</h1>
            )}
            {data.description && (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                {data.description}
              </p>
            )}
            {data.buttonText && (
              <div className="mt-8">
                <Link
                  href={data.buttonLink || "/productos"}
                  className="inline-flex items-center bg-brand px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand-foreground transition-colors hover:bg-brand-dark"
                >
                  {data.buttonText}
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
