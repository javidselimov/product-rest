import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { navItems } from '@/app/routes/nav'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { brand } from '@/shared/config/brand'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { adminUser, makeAdminJwt } from '@/shared/testing/factories'
import { renderApp } from '@/shared/testing/render'

const signIn = () =>
  useAuthStore
    .getState()
    .login(
      makeAdminJwt(),
      adminUser,
      new Date(Date.now() + 15 * 60_000).toISOString(),
    )

describe('router (daxil olmuş istifadəçi)', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(signIn)

  afterEach(() => {
    useAuthStore.getState().logout()
    document.documentElement.classList.remove('dark')
  })

  it('kök URL idarə panelini render edir', async () => {
    renderApp('/')
    expect(
      await screen.findByRole('heading', { name: 'İdarə paneli' }),
    ).toBeInTheDocument()
  })

  it('tanınmayan URL 404 səhifəsi göstərir', async () => {
    renderApp('/movcud-deyil')
    expect(
      await screen.findByText(/ünvanında səhifə yoxdur/),
    ).toBeInTheDocument()
  })

  it.each(navItems.map((item) => item.path))(
    '%s route-u açılır, "Nexus" görünmür, tab başlığı brend adı ilə bitir',
    async (path) => {
      renderApp(path)
      await waitFor(() =>
        expect(document.title.endsWith(` · ${brand.appName}`)).toBe(true),
      )
      expect(screen.queryByText(/Nexus/)).not.toBeInTheDocument()
    },
  )

  it('sidebar holds every item once, grouped by the site sections; the current user is in the top bar', async () => {
    renderApp('/')
    await screen.findByRole('heading', { name: 'İdarə paneli' })
    const nav = screen.getByRole('navigation', { name: 'Əsas naviqasiya' })
    // Items of closed groups stay in the DOM (hidden), so every item is counted once.
    expect(nav.querySelectorAll('a')).toHaveLength(navItems.length)
    for (const title of [
      'Haqqımızda',
      'Statistika',
      'Media',
      'Beynəlxalq əməkdaşlıq',
      'Ana səhifə',
      'İdarəetmə',
    ]) {
      expect(
        within(nav).getByRole('button', { name: title }),
      ).toBeInTheDocument()
    }
    expect(
      screen.getByRole('button', { name: 'Hesab menyusu' }),
    ).toHaveTextContent('admin')
  })

  it('dil keçidi etiketləri dəyişir, tema düyməsi html.dark-ı çevirir', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await screen.findByRole('heading', { name: 'İdarə paneli' })

    await user.click(
      screen.getByRole('button', { name: 'Qaranlıq temaya keç' }),
    )
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Dil' }))
    await user.click(
      await screen.findByRole('menuitemradio', { name: 'English' }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Language' }))
    await user.click(
      await screen.findByRole('menuitemradio', { name: 'Azərbaycanca' }),
    )
    await screen.findByRole('heading', { name: 'İdarə paneli' })
  })
})

describe('router (auth-suz)', () => {
  it('qorunan route login səhifəsinə yönləndirir', async () => {
    renderApp('/laws')
    expect(await screen.findByText('Daxil ol')).toBeInTheDocument()
    expect(screen.queryByText(/Nexus/)).not.toBeInTheDocument()
  })
})
