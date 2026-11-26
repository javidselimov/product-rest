/**
 * Layout reyestri dil + slug ilə (spec 026 FR-022, FR-022a, research R2).
 */
import { describe, expect, it } from 'vitest'

import type { AttachmentFile } from '@/entities/content'
import type { Locale } from '@/shared/i18n'

import {
  consumerLayoutFor,
  layoutFor,
  literacyLayoutFor,
  publicationsLayoutFor,
  sectionLayoutFor,
  type LayoutContext,
} from './layouts'

describe('consumerLayoutFor (spec 050)', () => {
  it.each([
    ['istehlakcilarin-ve-investorlarin-huquqlari', 'consumer-text'],
    ['consumer-and-investor-rights-copy', 'consumer-text'],
    ['fealiyyet-istiqametleri-copy', 'consumer-text'],
    ['inzibati-islere-baxan-vezifeli-sexsler', 'consumer-text'],
    ['officials-authorized-to-consider-cases-on-administrative-violations', 'consumer-text'],
    ['bank-xidmetlerinden-istifade-uzre-sikayet-indeksi', 'complaint-index'],
    ['complaint-index-on-bank-customers-use-of-bank-services-copy', 'complaint-index'],
    ['vetendas-muracietlerine-dair-statistika', 'appeal-statistics'],
    ['statistics-of-citizens-appeals', 'appeal-statistics'],
    ['kapital-bazari-3', 'consumer-documents'],
    ['capital-market-3-copy', 'consumer-documents'],
  ])('%s → %s', (slug, layout) => {
    expect(consumerLayoutFor(slug)).toBe(layout)
  })

  it('the companion pages and the pages outside Figma stay ordinary content', () => {
    expect(consumerLayoutFor('avto-icbari-sigorta-uzre-sikayet-indeksi')).toBe('plain')
    expect(consumerLayoutFor('infoqrafika')).toBe('plain')
    expect(consumerLayoutFor('tedbirler-2')).toBe('plain')
  })
})

describe('literacyLayoutFor (spec 047)', () => {
  it.each([
    ['maliyye-savadliligi', 'financial-literacy'],
    ['financial-literacy-copy', 'financial-literacy'],
    ['umumi-melumat-copy', 'financial-literacy'],
    ['general-information', 'financial-literacy'],
    ['maliyye-savadliligi-portali', 'literacy-platform'],
    ['virtual-education-platform-copy', 'literacy-platform'],
    ['maliyye-mehsul-ve-xidmetlerinin-melumat-axtaris-sistemi', 'literacy-platform'],
    ['information-and-search-system-for-financial-products-and-services', 'literacy-platform'],
  ])('%s → %s', (slug, layout) => {
    expect(literacyLayoutFor(slug)).toBe(layout)
  })

  it('Seminars, Competitions and slugs of other sections stay ordinary content', () => {
    expect(literacyLayoutFor('seminarlar-vebinarlar')).toBe('plain')
    expect(literacyLayoutFor('musabiqeler')).toBe('plain')
    expect(literacyLayoutFor('haqqimizda')).toBe('plain')
  })
})

describe('layoutFor', () => {
  it('az/en əsas və kopya slug-ları, qalanı plain', () => {
    expect(layoutFor('haqqimizda', 'az')).toBe('about-main')
    expect(layoutFor('about-us-copy', 'en')).toBe('about-main')
    expect(layoutFor('mission-and-values', 'en')).toBe('mission')
    expect(layoutFor('elaqe', 'az')).toBe('plain')
  })

  it('Tarix: az əsas `tarix`, köhnə `tarixi`, kopya; en əsas və kopya', () => {
    expect(layoutFor('tarix', 'az')).toBe('history')
    expect(layoutFor('tarixi', 'az')).toBe('history')
    expect(layoutFor('tarix-copy', 'az')).toBe('history')
    expect(layoutFor('history', 'en')).toBe('history')
    expect(layoutFor('history-copy', 'en')).toBe('history')
  })

  it('bir dilin slug-ı başqa dilin layout-unu almır', () => {
    // Test mühitində az "Haqqımızda (Kopya)"-nın slug-ı `history-copy`-dir.
    expect(layoutFor('history-copy', 'az')).toBe('about-main')
    expect(layoutFor('tarix', 'en')).toBe('plain')
  })

  it('təsadüfi `-2` sonluğu reyestrdə yoxdur — redaktor düzəldir', () => {
    expect(layoutFor('history-copy-2', 'en')).toBe('plain')
  })
})

describe('publicationsLayoutFor (spec 054 FR-016)', () => {
  const pdf: AttachmentFile = { id: 947, title: 'Hesabat', mimeType: 'application/pdf', sizeBytes: 1024, group: null, url: '/media/947' }

  it('picks file-archive for a top-level accordion, also inside the legacy import div', () => {
    expect(publicationsLayoutFor('<p>Giriş</p><details><summary>2025</summary><p>x</p></details>', [])).toBe('file-archive')
    expect(publicationsLayoutFor('<div><div><details><summary>2024</summary></details></div></div>', [])).toBe('file-archive')
  })

  it('does not count an accordion nested in another block: the archive parser would not read it', () => {
    const html = '<table><tbody><tr><td><details><summary>2025</summary></details></td></tr></tbody></table>'
    expect(publicationsLayoutFor(html, [])).toBe('plain')
  })

  it('picks document-list for a /media link in either quote style, marked or not, or for attached files', () => {
    expect(publicationsLayoutFor('<p><a href="/media/12">Strategiya</a></p>', [])).toBe('document-list')
    expect(publicationsLayoutFor("<p><a href='/media/12'>Strategiya</a></p>", [])).toBe('document-list')
    expect(publicationsLayoutFor('<p><a data-media-link href="/media/12">Strategiya</a></p>', [])).toBe('document-list')
    expect(publicationsLayoutFor('<p>Ekonometrik modellər</p>', [pdf])).toBe('document-list')
  })

  it('leaves other links and plain text as plain', () => {
    // An absolute address is an ordinary link: the card reader takes only the media library's own `/media/{id}`.
    expect(publicationsLayoutFor('<p><a href="https://www.cbar.az/media/12">Köhnə</a></p>', [])).toBe('plain')
    expect(publicationsLayoutFor('<p><a href="/media/12/extra">x</a> <a href="/az/tarix">Tarix</a></p>', [])).toBe('plain')
    expect(publicationsLayoutFor('', [])).toBe('plain')
  })

  it('an accordion wins over file links: the archive shows its files itself', () => {
    expect(publicationsLayoutFor('<p><a href="/media/1">Şrift</a></p><details><summary>2025</summary></details>', [pdf])).toBe('file-archive')
  })
})

describe('sectionLayoutFor', () => {
  const context = (slug: string, locale: Locale = 'az'): LayoutContext => ({ slug, locale, html: '', files: [] })

  it('reads each section with its own rule', () => {
    expect(sectionLayoutFor('about', context('tarix'))).toBe('history')
    expect(sectionLayoutFor('media', context('media-sorgulari'))).toBe('media-requests')
    expect(sectionLayoutFor('cooperation', context('merkezi-banklarla-emekdasliq'))).toBe('memorandums')
    expect(sectionLayoutFor('consumer', context('kapital-bazari-3'))).toBe('consumer-documents')
    expect(sectionLayoutFor('publications', { ...context('any-slug'), html: '<details><summary>2025</summary></details>' })).toBe('file-archive')
  })

  it("never gives one section's slug layout to a page of another section", () => {
    expect(sectionLayoutFor('media', context('tarix'))).toBe('plain')
    expect(sectionLayoutFor('about', context('merkezi-banklarla-emekdasliq'))).toBe('plain')
    // Publications ignores the slug: a slug another section knows stays plain without matching text.
    expect(sectionLayoutFor('publications', context('kapital-bazari-3'))).toBe('plain')
  })
})
