"use client"

import { Reveal } from "../Reveal"
import { SectionHeader } from "../SectionHeader"

interface ContactItem {
  icon?: string
  label?: string
  value?: string
  href?: string
}

export function ContactInfo({
  data,
}: {
  data: { title?: string; subtitle?: string; items?: ContactItem[] }
}) {
  const items = data.items || []
  return (
    <section className="container-section py-16 sm:py-20">
      <div className="content-section">
        <SectionHeader title={data.title} subtitle={data.subtitle} className="mb-12" />
        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => {
              const inner = (
                <div className="flex h-full flex-col items-start gap-2 border border-border p-7 transition-colors hover:border-brand">
                  {item.icon && <span className="text-2xl">{item.icon}</span>}
                  <span className="eyebrow">{item.label}</span>
                  <span className="text-sm text-foreground">{item.value}</span>
                </div>
              )
              return (
                <Reveal key={i} delay={i * 0.06}>
                  {item.href ? (
                    <a href={item.href} className="block h-full">
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </Reveal>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default ContactInfo
