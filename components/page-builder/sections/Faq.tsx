"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { SectionHeader } from "../SectionHeader"

interface FaqItem {
  question?: string
  answer?: string
}

export function Faq({
  data,
}: {
  data: { title?: string; subtitle?: string; items?: FaqItem[] }
}) {
  const items = data.items || []
  const [open, setOpen] = useState<number | null>(0)
  if (!items.length) return null

  return (
    <section className="container-section py-16 sm:py-20">
      <div className="content-section mx-auto max-w-3xl">
        <SectionHeader title={data.title} subtitle={data.subtitle} className="mb-10" />
        <div className="divide-y divide-border border-y border-border">
          {items.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-foreground sm:text-base">
                    {item.question}
                  </span>
                  <span className="flex-shrink-0 text-brand">
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
                  }`}
                >
                  <div
                    className="min-h-0 text-sm leading-relaxed text-muted-foreground [&_a]:text-brand [&_p]:mb-2 [&_strong]:text-foreground"
                    dangerouslySetInnerHTML={{ __html: item.answer || "" }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Faq
