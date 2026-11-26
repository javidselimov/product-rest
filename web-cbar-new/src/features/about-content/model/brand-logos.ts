/**
 * "Central Bank logo" page: CMS HTML and the page's files → hero, logo versions, downloads (spec 040,
 * `specs/040-media-logo/contracts/cms-markup.md`).
 *
 * The versions come from an ordinary editor table, because the editor keeps neither `class` nor `div`:
 * image | name | description | background. The table is recognised whole or stays in the content as a
 * table, so no text is dropped. The downloads are the page's files, whatever the table holds.
 */
import { fileFormatLabel, type AttachmentFile } from '@/entities/content'
import { textOf, type HtmlNode } from '@/shared/lib/html-blocks'

import { DARK_LOGO_BACKGROUNDS, MAX_LOGO_CELLS, MAX_LOGO_VERSIONS, MIN_LOGO_CELLS } from './constants'
import { imagesIn, outerOf } from './markup'
import { tableRows } from './table-rows'
import type { BrandLogosBlock, LogoDownload, LogoVersion } from './types'

/** A file title the editor never set: the API falls back to the original name ("cbar-logo.zip"). */
const FILE_NAME = /^\S+\.[a-z\d]{2,5}$/i

function logoVersion(cells: HtmlNode[]): LogoVersion | null {
  if (cells.length < MIN_LOGO_CELLS || cells.length > MAX_LOGO_CELLS) return null
  const [imageCell, titleCell, descriptionCell, backgroundCell] = cells
  const title = titleCell ? textOf(titleCell.inner) : ''
  if (!title) return null

  const [image] = imageCell ? imagesIn(imageCell.inner) : []
  const background = backgroundCell ? textOf(backgroundCell.inner).toLowerCase() : ''
  return {
    image: image ? { ...image, alt: image.alt || title } : null,
    title,
    description: descriptionCell ? textOf(descriptionCell.inner) || null : null,
    background: DARK_LOGO_BACKGROUNDS.has(background) ? 'dark' : 'light',
  }
}

function logoVersions(table: HtmlNode): LogoVersion[] | null {
  const rows = tableRows(table)
  if (!rows || rows.length === 0 || rows.length > MAX_LOGO_VERSIONS) return null
  const versions = rows.map(logoVersion)
  return versions.every((version) => version !== null) ? versions : null
}

/** The chip shows the editor's title; a bare file name gives way to its format ("SVG"). */
function downloadLabel(file: AttachmentFile): string {
  const title = file.title.trim()
  if (title && !FILE_NAME.test(title)) return title
  return fileFormatLabel(file.mimeType, title) || title
}

export function logoDownloads(files: AttachmentFile[]): LogoDownload[] {
  return files.map((file) => ({ id: file.id, label: downloadLabel(file), size: Math.max(0, file.sizeBytes), url: file.url }))
}

export function parseBrandLogos(nodes: HtmlNode[], files: AttachmentFile[]): BrandLogosBlock {
  const downloads = logoDownloads(files)
  const index = nodes.findIndex((node) => node.tag === 'table')
  const table = nodes[index]
  const versions = table ? logoVersions(table) : null
  if (!versions) return { kind: 'brand-logos', hero: null, introHtml: outerOf(nodes), versions: [], restHtml: '', downloads }

  const [first] = versions
  return {
    kind: 'brand-logos',
    hero: first?.image ? first : null,
    introHtml: outerOf(nodes.slice(0, index)),
    versions,
    restHtml: outerOf(nodes.slice(index + 1)),
    downloads,
  }
}
