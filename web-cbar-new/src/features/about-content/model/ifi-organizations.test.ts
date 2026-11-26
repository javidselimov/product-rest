import { describe, expect, it } from 'vitest'

import { cooperationLayoutFor } from './layouts'
import { parseAbout } from './parse'
import type { IfiOrganization, IfiOrganizationsBlock } from './types'

const organization: IfiOrganization = {
  id: 1,
  name: 'Dünya Bankı Qrupu',
  logo: null,
  memberSince: 1992,
  websiteUrl: null,
  websiteLabel: null,
  mission: null,
  membershipIntro: null,
  html: '',
  memberships: [],
}

const PAGE = '<p>Giriş</p><p><strong>Dünya Bankı</strong></p><p>Köhnə mətn</p>'

function parsed(html: string, organizations: IfiOrganization[]): IfiOrganizationsBlock {
  const [block] = parseAbout(html, 'ifi-organizations', { organizations })
  if (block?.kind !== 'ifi-organizations') throw new Error(`unexpected block: ${block?.kind}`)
  return block
}

describe('cooperationLayoutFor', () => {
  it.each([
    'beynelxalq-teskilatlarla-emekdasliq',
    'cooperation-with-international-organizations',
    'beynelxalq-teskilatlarla-emekdasliq-copy',
    'cooperation-with-international-organizations-copy',
  ])('%s gets the IFI layout', (slug) => {
    expect(cooperationLayoutFor(slug)).toBe('ifi-organizations')
  })

  it('leaves the other pages of the section ordinary content', () => {
    expect(cooperationLayoutFor('amb-terefinden-teqdim-edilen-texniki-yardimlar')).toBe('plain')
  })
})

describe('parseAbout ifi-organizations', () => {
  it('cuts the old organization list from its first heading line once organizations arrive', () => {
    const block = parsed(PAGE, [organization])

    expect(block.introHtml).toBe('<p>Giriş</p>')
    expect(block.organizations).toEqual([organization])
  })

  it('keeps the whole text while there are no organizations', () => {
    expect(parsed(PAGE, []).introHtml).toBe(PAGE)
  })

  it('keeps the whole text when it has no heading line', () => {
    expect(parsed('<p>Giriş</p><p>İkinci abzas</p>', [organization]).introHtml).toBe('<p>Giriş</p><p>İkinci abzas</p>')
  })

  it('does not take a paragraph with bold words for a heading', () => {
    const html = '<p>Giriş <strong>vurğu</strong> ilə</p><p><strong>Dünya Bankı</strong></p>'
    expect(parsed(html, [organization]).introHtml).toBe('<p>Giriş <strong>vurğu</strong> ilə</p>')
  })
})
