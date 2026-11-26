/**
 * "Membership in international organizations" page (spec 046): CMS HTML → the membership table.
 *
 * The rows are an ordinary editor table, not a content type of their own: the first table of the page,
 * organization | year (`specs/046-international-memberships/contracts/cms-markup.md`). A header row
 * (`th` cells, or a first row without a year) is the editor's; the site has its own column names.
 * Text before the table is the intro, text after it follows the table. Without a usable table the
 * whole text is the intro and the page reads as ordinary content, so nothing is dropped.
 */
import { attrOf, textOf, type HtmlNode } from '@/shared/lib/html-blocks'

import { ANCHOR_TAG, MEMBERSHIP_YEAR, WEB_LINK } from './constants'
import { outerOf } from './markup'
import { tableRows } from './table-rows'
import type { Membership, MembershipsBlock } from './types'

function yearIn(text: string): number | null {
  const match = MEMBERSHIP_YEAR.exec(text)
  return match ? Number(match[0]) : null
}

function webLinkIn(html: string): string | null {
  const anchor = ANCHOR_TAG.exec(html)
  const href = anchor?.[1] ? attrOf(anchor[1], 'href') : null
  return href && WEB_LINK.test(href) ? href : null
}

function membership(cells: HtmlNode[]): Membership | null {
  const [organizationCell, yearCell] = cells
  const organization = organizationCell ? textOf(organizationCell.inner) : ''
  const yearLabel = yearCell ? textOf(yearCell.inner) : ''
  if (!organization && !yearLabel) return null
  return {
    organization,
    href: organizationCell ? webLinkIn(organizationCell.inner) : null,
    yearLabel,
    year: yearIn(yearLabel),
  }
}

/** `tableRows` already skips `th` rows; a first `td` row whose year cell holds no year is a header too. */
function memberships(table: HtmlNode): Membership[] | null {
  const rows = tableRows(table)
  if (!rows) return null
  const [first] = rows
  const body = first && first[0]?.tag === 'td' && yearIn(first[1] ? textOf(first[1].inner) : '') === null ? rows.slice(1) : rows
  return body.map(membership).filter((row) => row !== null)
}

export function parseMemberships(nodes: HtmlNode[]): MembershipsBlock {
  const index = nodes.findIndex((node) => node.tag === 'table')
  const table = nodes[index]
  const rows = table ? memberships(table) : null
  if (!rows || rows.length === 0) return { kind: 'memberships', introHtml: outerOf(nodes), rows: [], restHtml: '' }

  return {
    kind: 'memberships',
    introHtml: outerOf(nodes.slice(0, index)),
    rows,
    restHtml: outerOf(nodes.slice(index + 1)),
  }
}
