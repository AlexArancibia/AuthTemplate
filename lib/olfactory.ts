// Heuristic parser for fragrance olfactory notes.
//
// The Scentra API does NOT expose structured notes. They live inside the
// Spanish marketing copy in `product.description`. The copy consistently uses
// phrases like:
//   - Salida (top):  "Abre con notas de salida de X", "Se abre con X", "abre con X"
//   - Corazón (heart): "un corazón de X", "En el corazón laten X", "El corazón revela X"
//   - Fondo (base):  "La base de X", "base se asienta sobre X", "el fondo te envuelve en X"
//
// This module strips any HTML, then scans for those tier markers and extracts
// the note phrase that follows up to the next sentence/tier boundary. The
// extracted span is split into individual note chips on connectors
// (",", "y", "e").
//
// It is intentionally conservative: if it cannot confidently find a tier it
// leaves that tier empty so the UI can fall back to the rich description.

export interface OlfactoryNotes {
  top: string[]
  heart: string[]
  base: string[]
}

export interface ParsedOlfactory extends OlfactoryNotes {
  /** true if at least one tier yielded notes */
  hasAny: boolean
}

const TIER_PATTERNS: { tier: keyof OlfactoryNotes; regexes: RegExp[] }[] = [
  {
    tier: "top",
    regexes: [
      /(?:abre|se\s+abre)\s+con\s+(?:un\s+)?(?:notas?\s+de\s+salida\s+de\s+|notas?\s+de\s+|un\s+(?:trazo|acorde)\s+(?:luminoso\s+)?de\s+)?([^.;]+)/i,
      /notas?\s+de\s+salida\s*(?:de|:)?\s*([^.;]+)/i,
    ],
  },
  {
    tier: "heart",
    regexes: [
      /(?:un\s+)?coraz[oó]n\s+(?:de|:|revela|laten|laten\s+|se\s+despliegan?\s+en)?\s*(?:una\s+(?:rica\s+)?(?:mezcla|combinaci[oó]n)\s+de\s+)?([^.;]+)/i,
      /(?:en\s+el|el)\s+coraz[oó]n[, ]+(?:laten|revela|se\s+despliegan?|reposan?|reposa)?\s*([^.;]+)/i,
      /notas?\s+de\s+coraz[oó]n\s*(?:de|:)?\s*([^.;]+)/i,
    ],
  },
  {
    tier: "base",
    regexes: [
      /(?:la\s+)?base\s+(?:de|:|se\s+asienta\s+sobre|reposa\s+sobre|reposa\s+en)?\s*([^.;]+)/i,
      /(?:el\s+)?fondo\s+(?:de|:|te\s+envuelve\s+en|se\s+asienta\s+(?:sobre|en)|reposa\s+(?:sobre|en))?\s*(?:un\s+(?:c[aá]lido\s+)?abrazo\s+de\s+)?([^.;]+)/i,
      /notas?\s+de\s+fondo\s*(?:de|:)?\s*([^.;]+)/i,
    ],
  },
]

// Words/connectors that should never become a note chip on their own.
const STOP_PHRASES = new Set([
  "que",
  "y",
  "e",
  "un",
  "una",
  "unos",
  "unas",
  "el",
  "la",
  "los",
  "las",
  "de",
  "del",
  "con",
  "su",
])

// Trailing descriptive clauses we want to cut off if they leak into a span.
const TRAILING_CUTS = [
  /\bque\s+(?:dan?|aportan?|crean?|deja|dejan|realzan?|envuelve|aporta|otorga|otorgan)\b.*$/i,
  // Bare conjugated verbs (no "que") that introduce an effect: "...y ámbar deja una estela..."
  /\b(?:deja|dejan|dan?\s+paso|crea|crean|aporta|aportan|realza|realzan|envuelve|envuelven|otorga|otorgan|se\s+despliegan?|se\s+asienta|se\s+funden?|dan\s+vida|laten)\b.*$/i,
  /\bdejando\b.*$/i,
  /\bcreando\b.*$/i,
  /\baportando\b.*$/i,
  /\bdando\b.*$/i,
  /\bofreciendo\b.*$/i,
  /\bpara\s+(?:quienes|las|los|mujeres|hombres)\b.*$/i,
  /\ben\s+(?:un|una)\s+(?:suave|delicado|cremoso)\b.*$/i,
]

// Leading descriptive adjectives to strip from an individual note fragment.
const LEADING_ADJ = new Set([
  "delicado", "delicada", "resplandeciente", "cremoso", "cremosa", "suave",
  "suaves", "intenso", "intensa", "profundo", "profunda", "cálido", "cálida",
  "luminoso", "luminosa", "fresco", "fresca", "vibrante", "embriagador",
  "embriagadora", "seductor", "seductora", "aromático", "aromática",
  "exuberante", "noble", "rico", "rica", "jugoso", "jugosa", "puro", "pura",
  "claro", "clara", "reconfortante", "elegante", "trazo", "acorde", "halo",
])

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function cleanSpan(span: string): string[] {
  let s = span.trim()

  // Cut trailing descriptive clauses.
  for (const cut of TRAILING_CUTS) s = s.replace(cut, "").trim()

  // Drop a leading "de " left over from a marker.
  s = s.replace(/^(?:de|del|con|sobre|en|un|una|unos|unas)\s+/i, "")

  // Split on commas and the connectors "y" / "e" surrounded by spaces.
  const parts = s
    .split(/\s*,\s*|\s+y\s+|\s+e\s+/i)
    .map((p) => {
      let part = p
        .replace(/\([^)]*\)/g, "") // drop parentheticals like "(madera de agar)"
        .replace(/^(?:el|la|los|las|un|una|unos|unas)\s+/i, "")
        .replace(/[.;:]+$/g, "")
        .replace(/\s+/g, " ")
        .trim()

      // Strip leading descriptive adjectives ("delicado iris" -> "iris",
      // "cremoso acorde de violeta" -> after removing "cremoso acorde" the
      // "de violeta" tail is normalized below).
      let words = part.split(" ")
      while (words.length > 1 && LEADING_ADJ.has(words[0].toLowerCase())) {
        words.shift()
      }
      part = words.join(" ")

      // "acorde de X" / "ramo de X" -> keep the part after "de".
      part = part.replace(/^(?:acorde|ramo|toque|nota|notas|matiz)\s+de\s+/i, "")
      // A leftover leading "de " from constructs like "reconfortante de sándalo".
      part = part.replace(/^de\s+/i, "")

      return part.trim()
    })
    .filter((p) => {
      if (!p) return false
      if (STOP_PHRASES.has(p.toLowerCase())) return false
      // Drop single-word fragments that are purely a descriptive adjective.
      if (!p.includes(" ") && LEADING_ADJ.has(p.toLowerCase())) return false
      // Reject overly long fragments (likely a clause, not a note).
      if (p.split(" ").length > 4) return false
      // Reject fragments with no letters.
      if (!/[a-záéíóúñ]/i.test(p)) return false
      return true
    })

  // Deduplicate (case-insensitive) preserving order.
  const seen = new Set<string>()
  const out: string[] = []
  for (const p of parts) {
    const key = p.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      out.push(p)
    }
  }
  // Cap to a reasonable number of chips per tier.
  return out.slice(0, 6)
}

/**
 * Parse olfactory notes from a (possibly HTML) Spanish product description.
 */
export function parseOlfactoryNotes(description?: string | null): ParsedOlfactory {
  const empty: ParsedOlfactory = { top: [], heart: [], base: [], hasAny: false }
  if (!description) return empty

  const text = stripHtml(description)
  if (!text) return empty

  const result: OlfactoryNotes = { top: [], heart: [], base: [] }

  for (const { tier, regexes } of TIER_PATTERNS) {
    for (const re of regexes) {
      const m = text.match(re)
      if (m && m[1]) {
        const notes = cleanSpan(m[1])
        if (notes.length > 0) {
          result[tier] = notes
          break
        }
      }
    }
  }

  const hasAny = result.top.length > 0 || result.heart.length > 0 || result.base.length > 0
  return { ...result, hasAny }
}
