import apiClient from "@/lib/axiosConfig"
import { extractApiData } from "@/lib/apiHelpers"
import type { PageBuilderV2Page } from "@/types/pageBuilderV2"

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID as string

/**
 * Fetch a PUBLISHED Page Builder V2 page by slug.
 * Public endpoint: GET /page-builder-v2/{storeId}/pages/{slug}
 * Returns null when the page does not exist / is unpublished.
 */
export async function getPublishedPage(
  slug: string,
): Promise<PageBuilderV2Page | null> {
  try {
    const res = await apiClient.get(
      `/page-builder-v2/${STORE_ID}/pages/${slug}`,
    )
    const page = extractApiData<PageBuilderV2Page>(res)
    if (!page || !page.content) return null
    return page
  } catch {
    return null
  }
}

/** List published page summaries (for static params / sitemap if needed). */
export async function listPages() {
  try {
    const res = await apiClient.get(`/page-builder-v2/${STORE_ID}/pages`)
    return extractApiData<PageBuilderV2Page[]>(res) || []
  } catch {
    return []
  }
}
