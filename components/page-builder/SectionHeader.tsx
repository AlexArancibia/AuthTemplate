"use client"

import { Reveal } from "./Reveal"
import { cn } from "@/lib/utils"

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string
  title?: string
  subtitle?: string
  align?: "center" | "left"
  className?: string
}) {
  if (!title && !subtitle && !eyebrow) return null
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && <span className="eyebrow text-brand">{eyebrow}</span>}
      {title && <h2 className="max-w-3xl">{title}</h2>}
      {subtitle && (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {subtitle}
        </p>
      )}
    </Reveal>
  )
}

export default SectionHeader
