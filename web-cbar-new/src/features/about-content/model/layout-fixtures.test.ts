/**
 * Guard of the structured CMS layouts (`specs/024-about-us-redesign/contracts/cms-markup.md` §7).
 *
 * Each layout has one markup fixture in `../fixtures`, in the form the admin editor saves. The admin
 * panel's `roundtrip.test.ts` keeps the same file byte-stable, this test turns it into Figma blocks.
 * The `Record` is exhaustive on purpose: a new layout does not compile until it has an entry here.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { prepareCmsHtml } from '@/shared/lib/cms-html'

import { parseAbout } from './parse'
import type { AboutBlock, AboutLayoutKind } from './types'

type StructuredLayout = Exclude<AboutLayoutKind, 'plain'>

const FIXTURES_DIR = join(import.meta.dirname, '../fixtures')

const EXPECTED_BLOCKS: Record<StructuredLayout, string[]> = {
  'about-main': ['html', 'date-cards:2', 'highlight', 'html', 'accordion-group', 'html'],
  history: ['history-hero', 'timeline:4', 'html'],
  mission: ['mission', 'values:3'],
  'media-requests': ['media-requests:2'],
  'csr-projects': ['csr-projects:0'],
  'brand-logos': ['brand-logos:4'],
  'ifi-organizations': ['ifi-organizations:0'],
  memorandums: ['memorandums:0'],
  memberships: ['memberships:3'],
  'financial-literacy': ['financial-literacy:4'],
  'literacy-platform': ['literacy-platform:5'],
  'consumer-text': ['consumer-text:2'],
  'complaint-index': ['complaint-index:2'],
  'appeal-statistics': ['appeal-statistics:3'],
  'consumer-documents': ['consumer-documents:3'],
  // Publications (spec 054): accordion groups (three years and one other label), document cards.
  'file-archive': ['file-archive:4'],
  'document-list': ['document-list:1'],
}

/** Block kind with its item count: a recognised block with no items is still a broken page. */
function blockShape(block: AboutBlock): string {
  switch (block.kind) {
    case 'csr-projects':
      return `${block.kind}:${block.projects.length}`
    case 'brand-logos':
      return `${block.kind}:${block.versions.length}`
    case 'ifi-organizations':
      return `${block.kind}:${block.organizations.length}`
    case 'memorandums':
    case 'memberships':
      return `${block.kind}:${block.rows.length}`
    case 'financial-literacy':
      return `${block.kind}:${block.sections.filter((s) => s.heading).length}`
    case 'literacy-platform':
      return `${block.kind}:${block.sections.length}`
    // Consumer rights (spec 050): numbered lists, archive years of the first tab, channels, sections.
    case 'consumer-text':
      return `${block.kind}:${block.parts.filter((part) => part.type === 'numbered').length}`
    case 'complaint-index':
      return `${block.kind}:${block.tabs[0]?.archive.years.length ?? 0}`
    case 'appeal-statistics':
      return `${block.kind}:${block.channels.length}`
    case 'consumer-documents':
      return `${block.kind}:${block.sections.length}`
    case 'file-archive':
      return `${block.kind}:${block.groups.length}`
    case 'document-list':
      return `${block.kind}:${block.files.length}`
    case 'date-cards':
    case 'media-requests':
      return `${block.kind}:${block.cards.length}`
    case 'timeline':
      return `${block.kind}:${block.years.length}`
    case 'values':
      return `${block.kind}:${block.items.length}`
    default:
      return block.kind
  }
}

/** Fixtures keep one block per line for review; the editor saves a single line. */
const loadFixture = (layout: string) => readFileSync(join(FIXTURES_DIR, `${layout}.html`), 'utf8').replace(/\r?\n/g, '')

describe('structured CMS layouts', () => {
  it('have exactly one fixture each', () => {
    const fixtures = readdirSync(FIXTURES_DIR).map((file) => file.replace(/\.html$/, ''))
    expect(fixtures.sort()).toEqual(Object.keys(EXPECTED_BLOCKS).sort())
  })

  for (const [layout, expected] of Object.entries(EXPECTED_BLOCKS)) {
    it(`builds the ${layout} blocks from the saved editor markup`, () => {
      const blocks = parseAbout(prepareCmsHtml(loadFixture(layout)), layout as StructuredLayout)
      expect(blocks.map(blockShape)).toEqual(expected)
    })
  }
})
