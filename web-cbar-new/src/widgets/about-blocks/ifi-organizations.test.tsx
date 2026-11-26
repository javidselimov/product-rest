import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { IfiOrganization, IfiOrganizationsBlock } from '@/features/about-content/model/types'
import { renderApp, screen, within } from '@/shared/testing/render'

import { IfiOrganizations } from './ifi-organizations'

const worldBank: IfiOrganization = {
  id: 1,
  name: 'Dünya Bankı Qrupu',
  logo: { src: '/media/2001', alt: 'Dünya Bankı Qrupu' },
  memberSince: 1992,
  websiteUrl: 'https://www.worldbank.org/',
  websiteLabel: 'www.worldbank.org',
  mission: 'Yoxsulluğun azaldılması.',
  membershipIntro: 'Azərbaycan beş quruma üzv olmuşdur:',
  html: '<p>Sədr DB-də müdirdir.</p>',
  memberships: [
    { date: '18.09.1992', name: 'Beynəlxalq Yenidənqurma və İnkişaf Bankı' },
    { date: '23.09.1992', name: 'Çoxtərəfli İnvestisiya Zəmanətləri Agentliyi' },
  ],
}

const bare: IfiOrganization = {
  id: 3,
  name: 'Asiya İnkişaf Bankı',
  logo: null,
  memberSince: null,
  websiteUrl: null,
  websiteLabel: null,
  mission: null,
  membershipIntro: null,
  html: '',
  memberships: [],
}

const block: IfiOrganizationsBlock = { kind: 'ifi-organizations', introHtml: '<p>Giriş mətni</p>', organizations: [worldBank, bare] }

const cardOf = (name: string) => screen.getByText(name).closest('details')!

describe('IfiOrganizations', () => {
  it('shows the intro, the section title and a card per organization, all closed', () => {
    renderApp(<IfiOrganizations block={block} locale="az" />, { locale: 'az' })

    expect(screen.getByText('Giriş mətni')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Əməkdaşlıq edilən təşkilatlar' })).toBeInTheDocument()
    expect(cardOf('Dünya Bankı Qrupu')).not.toHaveAttribute('open')
    expect(cardOf('Asiya İnkişaf Bankı')).not.toHaveAttribute('open')
  })

  it('shows the header and the open body of an organization', () => {
    renderApp(<IfiOrganizations block={block} locale="az" />, { locale: 'az' })
    const card = within(cardOf('Dünya Bankı Qrupu'))

    expect(card.getByRole('img', { name: 'Dünya Bankı Qrupu' })).toBeInTheDocument()
    expect(card.getByText('Üzvlük: 1992')).toBeInTheDocument()
    expect(card.getByText('Əsas missiya')).toBeInTheDocument()
    expect(card.getByText('Yoxsulluğun azaldılması.')).toBeInTheDocument()
    expect(card.getByText('Azərbaycan beş quruma üzv olmuşdur:')).toBeInTheDocument()
    expect(card.getByText('18.09.1992')).toBeInTheDocument()
    expect(card.getByText('Çoxtərəfli İnvestisiya Zəmanətləri Agentliyi')).toBeInTheDocument()
    expect(card.getByText('Sədr DB-də müdirdir.')).toBeInTheDocument()

    const link = card.getByRole('link', { name: /www\.worldbank\.org/ })
    expect(link).toHaveAttribute('href', 'https://www.worldbank.org/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('leaves out the parts an organization has no data for', () => {
    renderApp(<IfiOrganizations block={block} locale="az" />, { locale: 'az' })
    const card = within(cardOf('Asiya İnkişaf Bankı'))

    expect(card.queryByRole('img')).toBeNull()
    expect(card.queryByText(/Üzvlük/)).toBeNull()
    expect(card.queryByText('Əsas missiya')).toBeNull()
    expect(card.queryByRole('link')).toBeNull()
  })

  // Keyboard toggling is the browser's own `<summary>` behaviour, which jsdom does not emulate; it is
  // checked in a real browser (quickstart §5).
  it('opens and closes a card from its header', async () => {
    const user = userEvent.setup()
    renderApp(<IfiOrganizations block={block} locale="az" />, { locale: 'az' })
    const card = cardOf('Asiya İnkişaf Bankı')

    await user.click(screen.getByText('Asiya İnkişaf Bankı'))
    expect(card).toHaveAttribute('open')

    await user.click(screen.getByText('Asiya İnkişaf Bankı'))
    expect(card).not.toHaveAttribute('open')
  })

  it('has no title without organizations', () => {
    renderApp(<IfiOrganizations block={{ ...block, organizations: [] }} locale="az" />, { locale: 'az' })

    expect(screen.getByText('Giriş mətni')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull()
  })

  it('labels the chrome in English', () => {
    renderApp(<IfiOrganizations block={block} locale="en" />, { locale: 'en' })

    expect(screen.getByRole('heading', { level: 2, name: 'Cooperating organizations' })).toBeInTheDocument()
    expect(screen.getByText('Membership: 1992')).toBeInTheDocument()
    expect(screen.getByText('Main mission')).toBeInTheDocument()
  })
})
