/**
 * Platform page markup → blocks (spec 047 `contracts/cms-markup.md` §2).
 */
import { describe, expect, it } from 'vitest'

import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { parseBlocks } from '@/shared/lib/html-blocks'
import { infobankAz, portalAz, virtualAz, virtualAzLegacy, virtualEn } from '@/shared/testing/fixtures/literacy-section'

import { parseLiteracyPlatform } from './literacy-platform'

const parse = (html: string) => parseLiteracyPlatform(parseBlocks(prepareCmsHtml(html))!)

describe('parseLiteracyPlatform', () => {
  it('reads the three seed pages: note, photos, sections and the button', () => {
    const portal = parse(portalAz.content!)
    expect(portal.sections.map((s) => s.heading)).toEqual([
      'Maliyyə xidmətləri',
      'Mərkəzi Bank',
      'Pullar',
      '“Mərkəzi Bank” oyun simulyatoru',
      'Xəbərlər',
      'Digər bölmələr',
    ])
    expect(portal.noteHtml).toContain('heç bir qeydiyyat tələb olunmur')
    expect(portal.photos.map((p) => p.mediaId)).toEqual([1387, 1388, 1389])
    expect(portal.link).toEqual({ href: 'https://www.bizimpullar.az/', label: 'Portala keçid: www.bizimpullar.az' })

    const virtual = parse(virtualAz.content!)
    expect(virtual.sections).toHaveLength(5)
    expect(virtual.sections.at(-1)?.html).toContain('mailto:edu@cbar.az')
    expect(virtual.link?.href).toBe('https://edu.e-cbar.az/')
    expect(parse(virtualEn.content!).link?.label).toBe('Go to the platform: edu.e-cbar.az')

    const infobank = parse(infobankAz.content!)
    expect(infobank.sections.map((s) => s.heading)).toEqual(['Necə işləyir', 'Əlaqə'])
    expect(infobank.usedMediaIds).toEqual([1393, 1394, 1395])
  })

  it('the intro is the text before the first section, without the note and the photos', () => {
    const block = parse(virtualAz.content!)
    expect(block.introHtml).toContain('2017-ci ildə fəaliyyətə başlamışdır')
    expect(block.introHtml).not.toContain('blockquote')
    expect(block.introHtml).not.toContain('data-media-link')
  })

  it('the legacy text is all intro, its photos still become the row', () => {
    const block = parse(virtualAzLegacy.content!)
    expect(block.sections).toEqual([])
    expect(block.noteHtml).toBeNull()
    expect(block.link).toBeNull()
    expect(block.photos).toHaveLength(3)
    expect(block.introHtml).toContain('edu@cbar.az')
  })

  it('a closing paragraph is the button only with a single web link', () => {
    expect(parse('<p>Mətn</p><p><a href="javascript:alert(1)">x</a></p>').link).toBeNull()
    expect(parse('<p><a href="https://a.az">a</a> <a href="https://b.az">b</a></p>').link).toBeNull()
    expect(parse('<p>Keçid: <a href="https://a.az">a.az</a></p>').link).toBeNull()
    expect(parse('<p><a href="mailto:a@cbar.az">a@cbar.az</a></p>').link).toBeNull()
  })

  it('a second quote and a second photo paragraph stay in place', () => {
    const photos = (id: number) => `<p><a data-media-link="" href="/media/${id}">${id}</a></p>`
    const block = parse(`<blockquote><p>Bir</p></blockquote><h2>B</h2><blockquote><p>İki</p></blockquote>${photos(1)}${photos(2)}`)
    expect(block.noteHtml).toBe('<p>Bir</p>')
    expect(block.photos.map((p) => p.mediaId)).toEqual([1])
    expect(block.sections[0]!.html).toContain('<blockquote><p>İki</p></blockquote>')
    expect(block.sections[0]!.html).toContain('/media/2')
  })

  it('a page without photos has an empty row', () => {
    expect(parse('<p>Mətn</p><h2>Bölmə</h2><p>Mətn</p>').photos).toEqual([])
  })
})
