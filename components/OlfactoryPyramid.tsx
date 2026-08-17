"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { OlfactoryNotes } from "@/lib/olfactory"

interface OlfactoryPyramidProps {
  notes: OlfactoryNotes
  /** Optional fallback copy shown when no structured notes could be parsed. */
  fallbackText?: string
  className?: string
}

const TIERS: {
  key: keyof OlfactoryNotes
  label: string
  duration: string
  blurb: string
}[] = [
  {
    key: "top",
    label: "Salida",
    duration: "Primeros ~5–15 min",
    blurb: "La primera impresión, luminosa y fugaz.",
  },
  {
    key: "heart",
    label: "Corazón",
    duration: "Durante 2–3 horas",
    blurb: "El alma de la fragancia, su carácter.",
  },
  {
    key: "base",
    label: "Fondo",
    duration: "La estela, por horas",
    blurb: "La huella que permanece sobre la piel.",
  },
]

const EASE = [0.22, 1, 0.36, 1] as const

export default function OlfactoryPyramid({
  notes,
  fallbackText,
  className = "",
}: OlfactoryPyramidProps) {
  const reduce = useReducedMotion()
  const hasAny =
    notes.top.length > 0 || notes.heart.length > 0 || notes.base.length > 0

  return (
    <section className={`relative ${className}`}>
      <header className="mb-10 max-w-2xl">
        <span className="eyebrow">La pirámide olfativa</span>
        <h2 className="mt-3">Una historia en tres actos</h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Toda gran fragancia se revela con el tiempo. Estas son las notas que
          la componen, desde el primer destello hasta la estela final.
        </p>
      </header>

      {hasAny ? (
        <ol className="relative space-y-10 pl-8 sm:pl-10">
          {/* Connecting vertical line */}
          <span
            aria-hidden
            className="absolute left-[7px] top-2 bottom-2 w-px bg-border sm:left-[9px]"
          />
          {TIERS.map((tier, i) => {
            const tierNotes = notes[tier.key]
            return (
              <motion.li
                key={tier.key}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
                className="relative"
              >
                {/* Node dot on the line */}
                <span
                  aria-hidden
                  className="absolute -left-8 top-1.5 flex h-4 w-4 items-center justify-center sm:-left-10"
                >
                  <span className="h-3 w-3 rounded-full border border-brand bg-brand/20" />
                </span>

                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-xl text-foreground sm:text-2xl">
                    {tier.label}
                  </h3>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {tier.duration}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{tier.blurb}</p>

                {tierNotes.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {tierNotes.map((note) => (
                      <li
                        key={note}
                        className="rounded-full border border-border bg-secondary px-4 py-1.5 text-sm capitalize text-foreground"
                      >
                        {note}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm italic text-muted-foreground/70">
                    Notas no detalladas para este acto.
                  </p>
                )}
              </motion.li>
            )
          })}
        </ol>
      ) : (
        // Graceful fallback: keep the 3-act concept visible, render the
        // descriptive copy elegantly when no chips could be parsed.
        <div className="relative pl-8 sm:pl-10">
          <span
            aria-hidden
            className="absolute left-[7px] top-2 bottom-2 w-px bg-border sm:left-[9px]"
          />
          <div className="space-y-8">
            {TIERS.map((tier) => (
              <div key={tier.key} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-8 top-1.5 flex h-4 w-4 items-center justify-center sm:-left-10"
                >
                  <span className="h-3 w-3 rounded-full border border-brand bg-brand/20" />
                </span>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-xl text-foreground sm:text-2xl">
                    {tier.label}
                  </h3>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {tier.duration}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{tier.blurb}</p>
              </div>
            ))}
          </div>
          {fallbackText && (
            <p className="mt-10 max-w-2xl border-l border-brand pl-5 text-base leading-relaxed text-muted-foreground">
              {fallbackText}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
