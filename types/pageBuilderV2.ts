// Page Builder V2 — shared types (mirror of sportt-cms/types/pageBuilderV2.ts)

export type PageBuilderV2Json =
  | string
  | number
  | boolean
  | null
  | PageBuilderV2Json[]
  | { [key: string]: PageBuilderV2Json }

export interface PageBuilderV2Section {
  id: string
  type: string
  label: string
  order: number
  data: { [key: string]: any }
}

export interface PageBuilderV2Theme {
  background?: string | null
  foreground?: string | null
  mutedForeground?: string | null
  primary?: string | null
  primaryForeground?: string | null
  border?: string | null
  [key: string]: unknown
}

export interface PageBuilderV2Content {
  sections: PageBuilderV2Section[]
  theme?: PageBuilderV2Theme
  [key: string]: unknown
}

export interface PageBuilderV2Page {
  id: string
  storeId: string
  title: string
  slug: string
  content: PageBuilderV2Content
  isPublished: boolean
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
}
