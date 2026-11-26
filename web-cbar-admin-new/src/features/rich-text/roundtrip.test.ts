import { Editor } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import FAQ_ANSWER from './fixtures/faq-answer.html?raw'
import FINCERT_DIRECTION from './fixtures/fincert-direction.html?raw'
import STRATEGY_LETTER from './fixtures/strategy-letter.html?raw'
import { LEGACY_SAMPLES, countFeatures } from './fixtures/legacy-content'
import { buildExtensions } from './model/extensions'

// Passes legacy HTML through the editor and back: the merge gate (research R11).
function roundTrip(html: string): string {
  const editor = new Editor({ extensions: buildExtensions(), content: html })
  try {
    return editor.getHTML()
  } finally {
    editor.destroy()
  }
}

describe('rich-text round-trip', () => {
  for (const sample of LEGACY_SAMPLES) {
    it(`keeps the structure of the "${sample.name}" sample`, () => {
      const output = roundTrip(sample.html)
      expect(countFeatures(output)).toEqual(countFeatures(sample.html))
    })
  }

  it('writes accordion markup in the legacy form', () => {
    const output = roundTrip(LEGACY_SAMPLES[0].html)
    expect(output).toContain('data-accordion')
    expect(output).toContain('data-type="details-content"')
    expect(output).not.toContain('detailsContent')
  })

  it('keeps the media link attribute', () => {
    const output = roundTrip(LEGACY_SAMPLES[2].html)
    expect(output).toContain('data-media-link')
    expect(output).toContain('href="/media/3"')
  })

  it('also reads the stock detailsContent spelling', () => {
    const output = roundTrip(
      '<details><summary>a</summary><div data-type="detailsContent"><p>b</p></div></details>',
    )
    expect(output).toContain('data-type="details-content"')
  })

  // Web-cbar-new builds the contact cards from this table: specs/037-media-requests/contracts/cms-markup.md
  it('keeps the contact table of the media requests page', () => {
    const output = roundTrip(
      '<h3>Media ilə əməkdaşlıq</h3><table><tbody>' +
        '<tr><td><p>E-mail</p></td><td><p><a href="mailto:press@cbar.az">press@cbar.az</a></p></td><td><p></p></td></tr>' +
        '<tr><td><p>Telefon</p></td><td><p><a href="tel:966">(+994 12) 966</a></p></td><td><p>Daxili nömrə: 2243</p></td></tr>' +
        '</tbody></table>',
    )

    expect(output).toContain('<h3>Media ilə əməkdaşlıq</h3>')
    expect(output.match(/<tr/g)).toHaveLength(2)
    expect(output.match(/<td/g)).toHaveLength(6)
    expect(output).toContain('href="mailto:press@cbar.az"')
    expect(output).toContain('href="tel:966"')
    expect(output).toContain('Daxili nömrə: 2243')
  })
})

// A seeded FAQ answer (spec 051, migration 0033), as the legacy import stored it: the first save
// may normalise the markup, but it keeps the table and its cells and then stays as it is.
describe('FAQ answer markup', () => {
  it('keeps the table of a seeded answer and is stable after the first save', () => {
    const firstSave = roundTrip(FAQ_ANSWER)

    expect(countFeatures(firstSave)).toEqual(countFeatures(FAQ_ANSWER))
    expect(firstSave.match(/<td/g)).toHaveLength(FAQ_ANSWER.match(/<td/g)!.length)
    expect(firstSave).toContain('7.7 qr</strong>')
    expect(roundTrip(firstSave)).toBe(firstSave)
  })
})

// A seeded FinCERT direction body (spec 053, migration 0037): paragraphs and a list. The site styles exactly these
// elements (`cms-content` variant `fincert`), so the editor must keep every paragraph and list item.
describe('FinCERT direction markup', () => {
  it('keeps the paragraphs and list items of a seeded direction and is stable after the first save', () => {
    const firstSave = roundTrip(FINCERT_DIRECTION)

    expect(countFeatures(firstSave)).toEqual(countFeatures(FINCERT_DIRECTION))
    expect(firstSave.match(/<li>/g)).toHaveLength(FINCERT_DIRECTION.match(/<li>/g)!.length)
    expect(firstSave.match(/<p>/g)?.length).toBeGreaterThanOrEqual(FINCERT_DIRECTION.match(/^<p>/gm)!.length)
    expect(firstSave).toContain('CERT-lər ilə sıx kommunikasiya')
    expect(roundTrip(firstSave)).toBe(firstSave)
  })
})

// One fixture per structured layout, the same files as web-cbar-new: the site builds its Figma
// blocks from them, so the editor must save them unchanged (`layout-fixtures.test.ts` there).
const LAYOUT_FIXTURES = import.meta.glob<string>('./fixtures/layouts/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const layoutName = (path: string) => path.replace(/^.*\/|\.html$/g, '')

describe('structured layout markup', () => {
  it('covers every layout of the public site', () => {
    expect(Object.keys(LAYOUT_FIXTURES).map(layoutName).sort()).toEqual([
      'about-main',
      'appeal-statistics',
      'brand-logos',
      'complaint-index',
      'consumer-documents',
      'consumer-text',
      'csr-projects',
      'document-list',
      'file-archive',
      'financial-literacy',
      'history',
      'ifi-organizations',
      'literacy-platform',
      'media-requests',
      'memberships',
      'memorandums',
      'mission',
    ])
  })

  for (const [path, fixture] of Object.entries(LAYOUT_FIXTURES)) {
    it(`saves the ${layoutName(path)} markup unchanged`, () => {
      // Fixtures keep one block per line for review; the editor saves a single line.
      const saved = fixture.replace(/\r?\n/g, '')
      expect(roundTrip(saved)).toBe(saved)
    })
  }
})

// The text of page 104 (spec 057 US4), written by tools/media-backfill/import-strategy-page.mjs from the legacy
// /pages/strategy: the portrait's width, the right-aligned signature and the PDF link must survive an editor save.
describe('strategy letter markup', () => {
  it('is saved byte for byte', () => {
    const html = STRATEGY_LETTER.trim()
    const saved = roundTrip(html)

    expect(saved).toBe(html)
    expect(saved).toContain('width="300"')
    expect(saved.match(/style="text-align: right;"/g)).toHaveLength(4)
    expect(saved).toContain('href="/media/9002" data-media-link=""')
    expect(saved.match(/<strong>/g)).toHaveLength(14)
  })
})

describe('MediaImage', () => {
  it('mediaBaseUrl verilsə də getHTML() nisbi /media ünvanını saxlayır', () => {
    const editor = new Editor({
      extensions: buildExtensions({
        mediaBaseUrl: 'https://api-cbar-test.cbar.az',
      }),
      content: '<p><img src="/media/7" alt="a"></p>',
    })
    expect(editor.getHTML()).toContain('src="/media/7"')
    // Redaktor DOM-unda isə tam ünvan — şəkil paneldən görünsün.
    // `img[src]` — ProseMirror-un öz ayırıcı `<img>`-ləri src-sizdir.
    expect(editor.view.dom.querySelector('img[src]')?.getAttribute('src')).toBe(
      'https://api-cbar-test.cbar.az/media/7',
    )
    editor.destroy()
  })
})
