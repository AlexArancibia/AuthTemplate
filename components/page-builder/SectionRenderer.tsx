"use client"

import type { PageBuilderV2Section } from "@/types/pageBuilderV2"
import { Hero } from "./sections/Hero"
import { Stats } from "./sections/Stats"
import { CardsManual } from "./sections/CardsManual"
import { ProductRail } from "./sections/ProductRail"
import { Testimonials } from "./sections/Testimonials"
import { Faq } from "./sections/Faq"
import { ContactInfo } from "./sections/ContactInfo"

function railSourceFromData(data: any) {
  // catalog-mode CARDS / IMAGE_CAROUSEL
  if (data.catalogSource) {
    return {
      type: data.catalogSource.type,
      collectionId: data.catalogSource.collectionId,
      categorySlug: data.catalogSource.categorySlug,
      limit: data.catalogSource.limit,
    }
  }
  // PRODUCT_CAROUSEL shape
  if (data.sourceType) {
    return {
      type: data.sourceType === "all" ? "products" : data.sourceType,
      collectionId: data.sourceType === "collection" ? data.sourceId : undefined,
      categorySlug: data.sourceType === "category" ? data.sourceId : undefined,
      limit: data.limit,
    }
  }
  return null
}

export function SectionRenderer({
  section,
  index,
  muted,
}: {
  section: PageBuilderV2Section
  index: number
  muted: boolean
}) {
  const { type, data } = section

  switch (type) {
    case "HERO":
      return <Hero data={data} />

    case "STATS":
      return <Stats data={data} />

    case "CARDS":
      if (data.itemsMode === "catalog") {
        const source = railSourceFromData(data)
        if (!source) return null
        return (
          <ProductRail
            title={data.title}
            subtitle={data.subtitle}
            source={source}
            muted={muted}
          />
        )
      }
      return <CardsManual data={data} />

    case "IMAGE_CAROUSEL":
    case "PRODUCT_CAROUSEL": {
      const source = railSourceFromData(data)
      if (!source) return null
      return (
        <ProductRail
          title={data.title}
          subtitle={data.subtitle}
          source={source}
          muted={muted}
        />
      )
    }

    case "TESTIMONIALS":
      return <Testimonials data={data} />

    case "FAQ":
      return <Faq data={data} />

    case "CONTACT_INFO":
      return <ContactInfo data={data} />

    // Global chrome rendered by layout — skip in page body
    case "HEADER":
    case "FOOTER":
      return null

    default:
      return null
  }
}

export default SectionRenderer
