import type { Category } from "@/types/category"

export type CategoryWithChildren = Category & { children: CategoryWithChildren[] }

/**
 * Returns whether the categories array is already in tree shape (roots with nested children from API).
 */
function isTreeShape(categories: Category[]): boolean {
  if (!categories?.length) return false
  const first = categories[0]
  return Array.isArray(first.children)
}

const PRIORITY_MAX = Number.MAX_SAFE_INTEGER

function sortByPriority<T extends { priority?: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.priority ?? PRIORITY_MAX) - (b.priority ?? PRIORITY_MAX))
}

/** Build tree from flat list; roots and each level sorted by priority. */
function buildTreeFromFlat(categories: Category[]): CategoryWithChildren[] {
  const categoryMap = new Map<string, CategoryWithChildren>()
  const rootCategories: CategoryWithChildren[] = []

  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] })
  })

  categories.forEach((category) => {
    const node = categoryMap.get(category.id)!
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId)
      if (parent) parent.children.push(node)
      else rootCategories.push(node)
    } else {
      rootCategories.push(node)
    }
  })

  const sortByPriorityRec = (nodes: CategoryWithChildren[]): CategoryWithChildren[] => {
    const sorted = sortByPriority(nodes)
    sorted.forEach((n) => {
      n.children = sortByPriorityRec(n.children)
    })
    return sorted
  }
  return sortByPriorityRec(rootCategories)
}

/**
 * Normalizes categories to a tree of roots with children.
 * Uses the order from the API response; no client-side re-sorting.
 * - If data is already tree-shaped (e.g. from GET with mode=tree), returns a copy as-is.
 * - If data is flat, builds the tree preserving the array order.
 */
export function getCategoriesTree(categories: Category[]): CategoryWithChildren[] {
  if (!categories?.length) return []

  if (isTreeShape(categories)) {
    return [...(categories as CategoryWithChildren[])]
  }

  return buildTreeFromFlat(categories)
}
