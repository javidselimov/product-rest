/**
 * The homepage payload (spec 002 data-model.md §4).
 */
import { z } from 'zod'

const nullableString = z.string().nullable().optional().transform((v) => v ?? null)

export const homepageBannerSchema = z
  .object({
    title: nullableString,
    description: nullableString,
    link: nullableString,
    imageUrl: nullableString,
  })
  .passthrough()

export const newsSliderItemSchema = z
  .object({
    title: nullableString,
    description: nullableString,
    link: nullableString,
    imageUrl: nullableString,
    newsDate: z.string(),
  })
  .passthrough()

export const homepageLinkSchema = z.object({ title: nullableString, url: nullableString }).passthrough()

export const homepagePublicationSchema = z
  .object({
    title: nullableString,
    url: nullableString,
    imageUrl: nullableString,
    publishedAt: z.string(),
  })
  .passthrough()

/**
 * A card of the "Strategiya və sənədlər" block (spec 057). `href` is a site path without the locale or an absolute URL;
 * `coverUrl` is already the other locale's cover when this one has none.
 */
export const homepageStrategyDocSchema = z.looseObject({
  id: z.number(),
  title: z.string(),
  summary: nullableString,
  coverUrl: nullableString,
  href: z.string(),
})

export const infoLineItemSchema = z
  .object({
    title: nullableString,
    value: nullableString,
    year: z.number().nullable().optional().transform((v) => v ?? null),
    // When an editor last saved the line (not the date of the decision). Missing until the API is deployed.
    updatedAt: z.string().nullable().optional().transform((v) => v ?? null),
  })
  .passthrough()

export const infoLineGroupSchema = z
  .object({ alias: z.string(), items: z.array(infoLineItemSchema) })
  .passthrough()

export const homepageSchema = z
  .object({
    banners: z.array(homepageBannerSchema).default([]),
    newsSlider: z.array(newsSliderItemSchema).default([]),
    runningLines: z.array(z.string()).default([]),
    links: z.array(homepageLinkSchema).default([]),
    publications: z.array(homepagePublicationSchema).default([]),
    infoLines: z.array(infoLineGroupSchema).default([]),
    // An API without spec 057 sends no such field: the block then stays hidden.
    strategyDocs: z.array(homepageStrategyDocSchema).default([]),
  })
  .passthrough()

export type Homepage = z.infer<typeof homepageSchema>
export type HomepageBanner = z.infer<typeof homepageBannerSchema>
export type NewsSliderItem = z.infer<typeof newsSliderItemSchema>
export type HomepageLink = z.infer<typeof homepageLinkSchema>
export type HomepagePublication = z.infer<typeof homepagePublicationSchema>
export type HomepageStrategyDoc = z.infer<typeof homepageStrategyDocSchema>
export type InfoLineGroup = z.infer<typeof infoLineGroupSchema>
export type InfoLineItem = z.infer<typeof infoLineItemSchema>

/** Info line aliases: which card shows which lines (research R14). */
export const INFO_LINE_ALIASES = {
  corridor: ['corridor_min', 'corridor_max', 'corridor_percent'],
  monetary: ['money_reserve_usd', 'money_base'],
  notesVolume: ['nots_volume'],
  notesLevels: ['nots_levels_28', 'nots_levels_84', 'nots_levels_168', 'nots_levels_252'],
  banking: ['bank_credit', 'bank_nation'],
} as const

export type StatRow = { label: string; value: string }

/** Turns a list of aliases into `{label, value}` rows; a blank title or value is skipped. */
export function statRows(groups: InfoLineGroup[], aliases: readonly string[]): StatRow[] {
  return aliases.flatMap((alias) => {
    const item = groups.find((g) => g.alias === alias)?.items[0]
    if (!item?.title || !item.value) return []
    return [{ label: item.title, value: item.value }]
  })
}

/** The latest `updatedAt` (ISO) of the aliases, for the card's date; `null` without any. */
export function statUpdatedAt(groups: InfoLineGroup[], aliases: readonly string[]): string | null {
  let latest: string | null = null
  for (const alias of aliases) {
    const at = groups.find((g) => g.alias === alias)?.items[0]?.updatedAt
    if (at && (latest == null || Date.parse(at) > Date.parse(latest))) latest = at
  }
  return latest
}
