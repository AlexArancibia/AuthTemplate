"use client"

import { Reveal } from "../Reveal"

interface StatItem {
  icon?: string
  value?: string
  label?: string
}

export function Stats({ data }: { data: { title?: string; items?: StatItem[] } }) {
  const items = data.items || []
  if (!items.length) return null
  return (
    <section className="border-y border-border bg-muted/50">
      <div className="container-section">
        <div className="content-section py-12 sm:py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {items.map((item, i) => (
              <Reveal key={i} delay={i * 0.06} className="flex flex-col items-center text-center">
                {item.icon && <span className="mb-3 text-2xl">{item.icon}</span>}
                <span className="font-display text-3xl font-medium text-foreground sm:text-4xl">
                  {item.value}
                </span>
                <span className="mt-1 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  {item.label}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Stats
