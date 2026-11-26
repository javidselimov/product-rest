/**
 * Mətn köməkçiləri — HTML-dən düz mətn və qısaltma (ana səhifə featured excerpt).
 */
import { EXCERPT_WORD_BOUNDARY_SHARE } from '@/shared/constants/text'

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
}

/** Teqləri silir, əsas entity-ləri açır, boşluqları sıxır. */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(nbsp|amp|lt|gt|quot|#39|apos);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, ' ')
    .trim()
}

/** `max` simvolda söz sərhədində kəsir və `…` əlavə edir. */
export function excerpt(text: string, max: number): string {
  const clean = text.trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * EXCERPT_WORD_BOUNDARY_SHARE ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}
