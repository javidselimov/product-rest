/**
 * Sayt axtarışı (spec 002 data-model.md §6).
 */
import { z } from 'zod'

export const searchResultSchema = z
  .object({ title: z.string(), url: z.string(), type: z.string(), snippet: z.string().optional().transform((v) => v ?? '') })
  .passthrough()

export const searchResponseSchema = z.object({ results: z.array(searchResultSchema) }).passthrough()

export type SearchResult = z.infer<typeof searchResultSchema>
export type SearchResponse = z.infer<typeof searchResponseSchema>

export const KNOWN_RESULT_TYPES = ['page', 'press-release', 'law', 'money-mark', 'staff', 'event', 'csr-project'] as const
export type KnownResultType = (typeof KNOWN_RESULT_TYPES)[number]

/** Nəticəni məlum tipə, qalanını `other`-ə xəritələyir. */
export function resultTypeKey(type: string): KnownResultType | 'other' {
  return (KNOWN_RESULT_TYPES as readonly string[]).includes(type) ? (type as KnownResultType) : 'other'
}

/** Tip üzrə qruplaşdırır — məlum tiplər sabit sırada, `other` sonda. */
export function groupByType(results: SearchResult[]): { type: KnownResultType | 'other'; items: SearchResult[] }[] {
  const order: (KnownResultType | 'other')[] = [...KNOWN_RESULT_TYPES, 'other']
  const buckets = new Map<string, SearchResult[]>()
  for (const result of results) {
    const key = resultTypeKey(result.type)
    buckets.set(key, [...(buckets.get(key) ?? []), result])
  }
  return order.flatMap((type) => (buckets.has(type) ? [{ type, items: buckets.get(type) ?? [] }] : []))
}
