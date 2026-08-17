"use client"

import type { PageBuilderV2Page } from "@/types/pageBuilderV2"
import { SectionRenderer } from "./SectionRenderer"

const RAIL_TYPES = new Set(["CARDS", "IMAGE_CAROUSEL", "PRODUCT_CAROUSEL"])

export function PageRenderer({ page }: { page: PageBuilderV2Page }) {
  const sections = [...(page.content.sections || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  )

  // Alternate background rhythm across product rails
  let railCount = 0

  return (
    <>
      {sections.map((section, index) => {
        let muted = false
        const isCatalogRail =
          RAIL_TYPES.has(section.type) &&
          (section.data?.itemsMode === "catalog" || !!section.data?.sourceType)
        if (isCatalogRail) {
          muted = railCount % 2 === 1
          railCount += 1
        }
        return (
          <SectionRenderer
            key={section.id || index}
            section={section}
            index={index}
            muted={muted}
          />
        )
      })}
    </>
  )
}

export default PageRenderer
