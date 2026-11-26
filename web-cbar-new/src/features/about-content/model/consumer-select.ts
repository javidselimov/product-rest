/**
 * What the consumer rights pages show for the page's search parameters (spec 050 research R5). The blocks hold every
 * tab, channel and year; the view picks one. A missing or unknown value falls back to the first tab, the first
 * channel and that channel's newest year.
 */
import type { ComplaintIndexBlock, ComplaintTab, StatChannel } from './types'

type QueryValue = string | string[] | undefined

const first = (value: QueryValue): string | undefined => (Array.isArray(value) ? value[0] : value)

export function selectComplaintTab(block: ComplaintIndexBlock, tab: QueryValue): ComplaintTab | undefined {
  const key = first(tab)
  return block.tabs.find((t) => t.key === key) ?? block.tabs[0]
}

export type StatSelection = { channel: StatChannel; year: StatChannel['years'][number] | undefined }

export function selectStat(channels: StatChannel[], channel: QueryValue, year: QueryValue): StatSelection | undefined {
  const selected = channels.find((c) => String(c.index) === first(channel)) ?? channels[0]
  if (!selected) return undefined
  return { channel: selected, year: selected.years.find((y) => String(y.year) === first(year)) ?? selected.years[0] }
}
