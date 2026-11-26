import { describe, expect, it } from 'vitest'

import { fincertAz, fincertEmpty, fincertPartial } from '@/shared/testing/fixtures/fincert'

import { FINCERT_SECTION_ORDER } from './constants'
import { buildFincertView, fincertSections } from './view'

const PAGE = { title: 'FinCERT' }

describe('buildFincertView (spec 053)', () => {
  it('builds every section of the full content, the title from the CMS page', () => {
    const view = buildFincertView(fincertAz, PAGE)

    expect(view?.title).toBe('FinCERT')
    expect(view && fincertSections(view)).toEqual(FINCERT_SECTION_ORDER)
    expect(view?.memberships).toEqual([
      {
        id: 1,
        name: 'Forum for Incident Response and Security Teams',
        description: 'İnsidentlərlə Mübarizə və Təhlükəsizlik Mərkəzlərinin Beynəlxalq Forumu',
        badge: '2026-cı ildən tam hüquqlu üzv',
        url: 'https://www.first.org/',
        logo: null,
      },
    ])
  })

  it('keeps only the filled sections', () => {
    const view = buildFincertView(fincertPartial, PAGE)
    expect(view && fincertSections(view)).toEqual(['mission', 'contacts'])
  })

  it('is null when every section is empty, so the route shows the CMS text', () => {
    expect(buildFincertView(fincertEmpty, PAGE)).toBeNull()
  })

  it('numbers the directions by their place in the visible list, with no gaps', () => {
    const view = buildFincertView(
      {
        ...fincertEmpty,
        directions: [
          { id: 7, title: 'A', body: '<p>a</p>' },
          { id: 3, title: 'B', body: '<p>b</p>' },
          { id: 12, title: 'C', body: '<p>c</p>' },
        ],
      },
      PAGE,
    )
    expect(view?.directions.map((d) => [d.id, d.number])).toEqual([
      [7, 1],
      [3, 2],
      [12, 3],
    ])
  })

  it('prepares the direction body for the HTML sink', () => {
    const view = buildFincertView(
      { ...fincertEmpty, directions: [{ id: 1, title: 'A', body: '<p onclick="x()">a</p><script>alert(1)</script>' }] },
      PAGE,
    )
    expect(view?.directions[0]?.bodyHtml).not.toMatch(/onclick|<script/)
    expect(view?.directions[0]?.bodyHtml).toContain('<p')
  })

  it('links the e-mail with mailto: and the phone with tel: built from its digits and +', () => {
    const view = buildFincertView(fincertAz, PAGE)
    expect(view?.contacts).toEqual([
      { kind: 'email', value: 'fincert@cbar.az', href: 'mailto:fincert@cbar.az' },
      { kind: 'phone', value: '(+994 12) 437 00 97', href: 'tel:+994124370097' },
    ])
  })

  it('drops an empty contact card', () => {
    const view = buildFincertView({ ...fincertEmpty, phone: '012 437-00-97' }, PAGE)
    expect(view?.contacts).toEqual([{ kind: 'phone', value: '012 437-00-97', href: 'tel:0124370097' }])
  })

  it('prefers the RFC media file to the link and downloads it', () => {
    const view = buildFincertView(
      { ...fincertEmpty, rfc: { file: { url: '/media/1234', mimeType: 'application/pdf', sizeBytes: 1 }, url: 'https://x.az/old.pdf' } },
      PAGE,
    )
    expect(view?.rfc).toEqual({ href: '/media/1234', download: true, fileType: 'pdf' })
  })

  it('opens an RFC link, its type from the .pdf ending, none when unknown', () => {
    expect(buildFincertView(fincertAz, PAGE)?.rfc).toEqual({
      href: 'https://uploads.cbar.az/assets/f7322827bd3688a2be3136204.pdf',
      download: false,
      fileType: 'pdf',
    })
    expect(buildFincertView({ ...fincertEmpty, rfc: { file: null, url: 'https://x.az/rfc' } }, PAGE)?.rfc?.fileType).toBeNull()
  })

  it('drops an RFC address that is not http(s) or site-relative, falling back to the next one', () => {
    const view = buildFincertView(
      { ...fincertEmpty, rfc: { file: { url: 'javascript:alert(1)', mimeType: 'application/pdf', sizeBytes: 1 }, url: ' https://x.az/rfc.pdf ' } },
      PAGE,
    )
    expect(view?.rfc).toEqual({ href: 'https://x.az/rfc.pdf', download: false, fileType: 'pdf' })
    expect(buildFincertView({ ...fincertEmpty, rfc: { file: null, url: '//evil.example/rfc' } }, PAGE)).toBeNull()
  })

  it('shows the portal only with a title and a safe address, a blank description as none', () => {
    const portal = (title: string, url: string) => buildFincertView({ ...fincertEmpty, portal: { title, description: '  ', url } }, PAGE)?.portal

    expect(portal(' Portal ', 'https://portal.e-cbar.az/')).toEqual({ title: 'Portal', description: null, url: 'https://portal.e-cbar.az/' })
    expect(portal('', 'https://portal.e-cbar.az/')).toBeUndefined()
    expect(portal('Portal', '')).toBeUndefined()
    expect(portal('Portal', 'javascript:alert(1)')).toBeUndefined()
  })

  it('keeps a membership but drops its unsafe link and logo', () => {
    const membership = { id: 1, name: 'FIRST', description: null, badge: null, url: 'javascript:alert(1)', logo: 'data:image/png;base64,AA' }
    const view = buildFincertView({ ...fincertEmpty, memberships: [membership, { ...membership, id: 2, url: 'https://www.first.org/', logo: '/media/1301' }] }, PAGE)

    expect(view?.memberships.map(({ id, url, logo }) => ({ id, url, logo }))).toEqual([
      { id: 1, url: null, logo: null },
      { id: 2, url: 'https://www.first.org/', logo: '/media/1301' },
    ])
  })

  it('splits the mission into paragraphs on line breaks', () => {
    const view = buildFincertView({ ...fincertEmpty, mission: 'Birinci.\r\n\r\n  İkinci.\nÜçüncü.  ' }, PAGE)
    expect(view?.mission).toEqual(['Birinci.', 'İkinci.', 'Üçüncü.'])
  })
})
