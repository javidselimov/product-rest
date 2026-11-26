/**
 * "Media requests" page: CMS HTML → intro, contact cards, remaining content (spec 037,
 * `specs/037-media-requests/contracts/cms-markup.md`).
 *
 * The cards come from an ordinary editor table because the editor keeps neither `class` nor `div`.
 * Each row is a card: name | value | extra text. The table is either recognised whole or stays in
 * the content as a table, so no text is dropped.
 */
import { attrOf, textOf, type HtmlNode } from '@/shared/lib/html-blocks'

import { MAX_CONTACT_CARDS, MAX_CONTACT_CARD_CELLS, MIN_CONTACT_CARD_CELLS } from './constants'
import { tableRows } from './table-rows'
import type { AboutBlock, ContactCard, ContactKind } from './types'

const FIRST_LINK = /<a\b([^>]*)>/i
const ALLOWED_LINK = /^(?:mailto:|tel:|https:)/i
const EMAIL_LINK = /^mailto:/i
const PHONE_LINK = /^tel:/i
const PHONE_TEXT = /^[\d\s+()-]+$/

const outerOf = (nodes: HtmlNode[]) => nodes.map((n) => n.outer).join('')

function linkOf(cellHtml: string): string | null {
  const attrs = FIRST_LINK.exec(cellHtml)?.[1]
  const href = attrs === undefined ? null : attrOf(attrs, 'href')?.trim()
  return href && ALLOWED_LINK.test(href) ? href : null
}

function contactKind(value: string, href: string | null): ContactKind | null {
  if ((href && EMAIL_LINK.test(href)) || value.includes('@')) return 'email'
  if ((href && PHONE_LINK.test(href)) || PHONE_TEXT.test(value)) return 'phone'
  return null
}

function contactCard(cells: HtmlNode[]): ContactCard | null {
  const [labelCell, valueCell, noteCell] = cells
  if (cells.length < MIN_CONTACT_CARD_CELLS || cells.length > MAX_CONTACT_CARD_CELLS) return null
  if (!labelCell || !valueCell) return null

  const label = textOf(labelCell.inner)
  const value = textOf(valueCell.inner)
  if (!label || !value) return null

  const href = linkOf(valueCell.inner)
  return { label, value, href, note: noteCell ? textOf(noteCell.inner) || null : null, kind: contactKind(value, href) }
}

function contactCards(table: HtmlNode): ContactCard[] | null {
  const rows = tableRows(table)
  if (!rows || rows.length === 0 || rows.length > MAX_CONTACT_CARDS) return null
  const cards = rows.map(contactCard)
  return cards.every((card) => card !== null) ? cards : null
}

/** A table that does not match stays in `introHtml`, in its place among the content. */
export function parseMediaRequests(nodes: HtmlNode[]): AboutBlock {
  const index = nodes.findIndex((node) => node.tag === 'table')
  const table = nodes[index]
  const cards = table ? contactCards(table) : null
  if (!cards) return { kind: 'media-requests', introHtml: outerOf(nodes), cards: [], restHtml: '' }

  return {
    kind: 'media-requests',
    introHtml: outerOf(nodes.slice(0, index)),
    cards,
    restHtml: outerOf(nodes.slice(index + 1)),
  }
}
