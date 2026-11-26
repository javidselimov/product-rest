/**
 * Sidebar grouped by the public site's sections (spec 046, `contracts/admin-nav.md`): groups open and
 * close, the open screen's group opens on arrival, and the choice outlives a reload.
 */
import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { navEntries, navItems } from '@/app/routes/nav'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { UI_STORE_KEY } from '@/shared/constants/storage'
import { useUiStore } from '@/shared/model/ui-store'
import { adminUser, makeAdminJwt } from '@/shared/testing/factories'
import { pagesStore } from '@/shared/testing/handlers/pages'
import { renderApp } from '@/shared/testing/render'

const TOKEN_LIFETIME_MS = 15 * 60_000

const signIn = () =>
  useAuthStore
    .getState()
    .login(
      makeAdminJwt(),
      adminUser,
      new Date(Date.now() + TOKEN_LIFETIME_MS).toISOString(),
    )

const openPage = async (path: string) => {
  renderApp(path)
  const nav = await screen.findByRole('navigation', { name: 'Əsas naviqasiya' })
  return { nav }
}

/** Lines the editor sees: the links outside a closed group and the group buttons. */
const visibleLines = (nav: HTMLElement) =>
  [...nav.querySelectorAll('a, button')].filter(
    (node) => !node.closest('[hidden]'),
  )

describe('Sidebar groups', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    localStorage.removeItem(UI_STORE_KEY)
    useUiStore.setState({ openNavGroups: [] })
    signIn()
  })

  afterEach(() => {
    useAuthStore.getState().logout()
  })

  it('places every screen exactly once', () => {
    const keys = navEntries().flatMap((entry) =>
      entry.kind === 'item' ? [entry.item.key] : entry.items.map((i) => i.key),
    )
    expect([...keys].sort()).toEqual(navItems.map((item) => item.key).sort())
  })

  it('shows 16 lines with every group closed, one-screen sections as plain links', async () => {
    const { nav } = await openPage('/')

    expect(visibleLines(nav)).toHaveLength(16)
    for (const label of ['İdarə paneli', 'Səhifələr', 'Media kitabxanası', 'MEAS', 'Qanunlar', 'Pul nişanları', 'Aylıq hesabatlar', 'İşçi məqalələri', 'Sual-cavab', 'FinCERT']) {
      expect(within(nav).getByRole('link', { name: label })).toBeVisible()
    }
    // The site's footer order (spec 054): consumer rights, publications and research, FAQ.
    const lines = visibleLines(nav).map((node) => node.textContent?.trim())
    expect(lines.indexOf('Aylıq hesabatlar')).toBeLessThan(lines.indexOf('İşçi məqalələri'))
    expect(lines.indexOf('İşçi məqalələri')).toBeLessThan(lines.indexOf('Sual-cavab'))
    expect(within(nav).queryByRole('button', { name: 'Hüquqi aktlar' })).toBeNull()
    expect(within(nav).getByRole('button', { name: 'Media' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the group of the screen reached by its address and marks the screen', async () => {
    const { nav } = await openPage('/memorandums')

    expect(within(nav).getByRole('button', { name: 'Beynəlxalq əməkdaşlıq' })).toHaveAttribute('aria-expanded', 'true')
    expect(within(nav).getByRole('link', { name: 'Memorandumlar' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Maliyyə təşkilatları' })).toBeVisible()
  })

  it('opens and closes a group with the keyboard', async () => {
    const user = userEvent.setup()
    const { nav } = await openPage('/')
    const media = within(nav).getByRole('button', { name: 'Media' })

    media.focus()
    await user.keyboard('{Enter}')
    expect(media).toHaveAttribute('aria-expanded', 'true')
    expect(within(nav).getByRole('link', { name: 'Tədbirlər' })).toBeVisible()

    await user.keyboard(' ')
    expect(media).toHaveAttribute('aria-expanded', 'false')
    expect(within(nav).getByRole('link', { name: 'Tədbirlər', hidden: true })).not.toBeVisible()
  })

  it('lets the editor close the open screen’s group', async () => {
    const user = userEvent.setup()
    const { nav } = await openPage('/memorandums')
    const cooperation = within(nav).getByRole('button', { name: 'Beynəlxalq əməkdaşlıq' })

    await user.click(cooperation)
    expect(cooperation).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps the opened groups after a reload', async () => {
    const user = userEvent.setup()
    const first = await openPage('/')
    await user.click(within(first.nav).getByRole('button', { name: 'Statistika' }))
    cleanup()

    const { nav } = await openPage('/')
    expect(within(nav).getByRole('button', { name: 'Statistika' })).toHaveAttribute('aria-expanded', 'true')
    expect(JSON.parse(localStorage.getItem(UI_STORE_KEY) ?? '{}').state.openNavGroups).toContain('statistics')
  })

  it('ignores stored groups that no longer exist', async () => {
    useUiStore.setState({ openNavGroups: ['content', 'finance'] })
    const { nav } = await openPage('/')

    expect(visibleLines(nav)).toHaveLength(16)
  })

  it('finds a screen in the ⌘K palette under its section', async () => {
    const user = userEvent.setup()
    await openPage('/')

    await user.keyboard('{Control>}k{/Control}')
    const dialog = await screen.findByRole('dialog', { name: 'Əmr paleti' })
    await user.type(within(dialog).getByPlaceholderText('Bölmə axtar…'), 'Memorandum')
    expect(within(dialog).getByRole('option', { name: /Memorandumlar/ })).toBeInTheDocument()
    expect(within(dialog).getByText('Beynəlxalq əməkdaşlıq')).toBeInTheDocument()
  })
})

/**
 * A page whose content comes from a panel section of its own (spec 053 US4, `contracts/admin-ux.md` §3): its form marks
 * that section in the menu, not "Səhifələr", once the page has loaded.
 */
describe('Active item on a managed page form', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    localStorage.removeItem(UI_STORE_KEY)
    useUiStore.setState({ openNavGroups: [] })
    pagesStore.reset()
    signIn()
  })

  afterEach(() => {
    useAuthStore.getState().logout()
  })

  /** Page 2 ("Tarix") with the given az slug, opened in its form. */
  const openPageForm = async (slug: string) => {
    pagesStore.get(2)!.translations.az!.slug = slug
    const result = await openPage('/pages/2')
    await screen.findByRole('heading', { name: /Səhifə: Tarix/ })
    return result
  }

  it.each(['fincert', 'fincert-copy'])('marks "FinCERT" on the %s page form, not "Səhifələr"', async (slug) => {
    const { nav } = await openPageForm(slug)

    expect(await within(nav).findByRole('link', { name: 'FinCERT' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Səhifələr' })).not.toHaveAttribute('aria-current')
  })

  it('marks "Memorandumlar" and opens its group on the central banks page form', async () => {
    const { nav } = await openPageForm('merkezi-banklarla-emekdasliq')

    expect(await within(nav).findByRole('link', { name: 'Memorandumlar' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('button', { name: 'Beynəlxalq əməkdaşlıq' })).toHaveAttribute('aria-expanded', 'true')
    expect(within(nav).getByRole('link', { name: 'Səhifələr' })).not.toHaveAttribute('aria-current')
  })

  it.each(['tarix', 'beynelxalq-teskilatlarda-uzvluk'])('keeps "Səhifələr" on the %s page form (no section link)', async (slug) => {
    const { nav } = await openPageForm(slug)

    expect(within(nav).getByRole('link', { name: 'Səhifələr' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).queryByRole('link', { current: 'page', name: 'Memorandumlar' })).toBeNull()
  })

  it('gives "Səhifələr" back after leaving the form, and never stores the mark', async () => {
    const user = userEvent.setup()
    const { nav } = await openPageForm('fincert')
    await within(nav).findByRole('link', { name: 'FinCERT', current: 'page' })
    expect(localStorage.getItem(UI_STORE_KEY) ?? '').not.toContain('activeNavOverride')

    await user.click(within(nav).getByRole('link', { name: 'Səhifələr' }))

    expect(await within(nav).findByRole('link', { name: 'Səhifələr', current: 'page' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'FinCERT' })).not.toHaveAttribute('aria-current')
  })

  it('marks the same item in the mobile menu', async () => {
    const user = userEvent.setup()
    await openPageForm('fincert')

    await user.click(screen.getByRole('button', { name: 'Naviqasiyanı aç' }))
    const sheet = await screen.findByRole('dialog', { name: 'Naviqasiya' })
    expect(within(sheet).getByRole('link', { name: 'FinCERT' })).toHaveAttribute('aria-current', 'page')
  })
})
