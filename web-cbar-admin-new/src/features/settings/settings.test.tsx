import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http } from 'msw'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { SettingsPage } from '@/pages/settings'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { adminUser } from '@/shared/testing/factories'
import { accessibilityWidgetFixtures } from '@/shared/testing/fixtures/settings'
import { message } from '@/shared/testing/handlers/lib/errors'
import { settingsStore } from '@/shared/testing/handlers/settings'
import { server } from '@/shared/testing/server'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/settings',
  component: SettingsPage,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([settingsRoute]),
])

function renderPage() {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/settings'] }),
  })
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return router
}

/** Mühitin öz JSON parser mesajı — dialoqda eynilə göstərilməlidir. */
const parserMessage = (text: string): string => {
  try {
    JSON.parse(text)
    return ''
  } catch (error) {
    return (error as Error).message
  }
}

describe('Parametrlər', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    settingsStore.reset()
  })

  it('cədvəl açarları və gözəl JSON-u göstərir', async () => {
    renderPage()
    expect(
      await screen.findByRole('heading', { name: 'Parametrlər' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('site.contact')).toBeInTheDocument()
    expect(screen.getByText('homepage.showBanner')).toBeInTheDocument()
    expect(
      screen.getByText(/"phone": "\+994 12 493 11 22"/),
    ).toBeInTheDocument()
    expect(screen.getByText(/"email": "info@cbar.az"/)).toBeInTheDocument()
    expect(screen.getByText('true')).toBeInTheDocument()
  })

  it('yeni açar: yanlış JSON → parser mesajı sahədə, sorğu getmir', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('site.contact')
    await user.click(screen.getByRole('button', { name: 'Yeni parametr' }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('Açar'), 'test.key')
    const value = within(dialog).getByLabelText('Dəyər (JSON)')
    await user.click(value)
    await user.paste('{bad json')
    await user.click(
      within(dialog).getByRole('button', { name: 'Yadda saxla' }),
    )
    expect(
      await within(dialog).findByText(parserMessage('{bad json')),
    ).toBeInTheDocument()
    expect(settingsStore.get('test.key')).toBeNull()
  })

  it('yeni açar: etibarlı JSON → toast, sətir cədvəldə', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('site.contact')
    await user.click(screen.getByRole('button', { name: 'Yeni parametr' }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('Açar'), 'test.key')
    await user.click(within(dialog).getByLabelText('Dəyər (JSON)'))
    await user.paste('{"enabled": true, "limit": 5}')
    await user.click(
      within(dialog).getByRole('button', { name: 'Yadda saxla' }),
    )
    expect(await screen.findByText('Parametr yaradıldı')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(await screen.findByText('test.key')).toBeInTheDocument()
    expect(screen.getByText(/"limit": 5/)).toBeInTheDocument()
    expect(settingsStore.get('test.key')?.value).toEqual({
      enabled: true,
      limit: 5,
    })
  })

  it('redaktə: açar kilidli, dəyər dolu, saxlama upsert edir', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('site.contact')
    await user.click(
      screen.getByRole('button', {
        name: 'site.contact parametrini redaktə et',
      }),
    )
    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByText('Parametr: site.contact'),
    ).toBeInTheDocument()
    const key = within(dialog).getByLabelText('Açar')
    expect(key).toBeDisabled()
    expect(key).toHaveValue('site.contact')
    const value = within(dialog).getByLabelText('Dəyər (JSON)')
    expect(value).toHaveValue(
      JSON.stringify(
        { phone: '+994 12 493 11 22', email: 'info@cbar.az' },
        null,
        2,
      ),
    )
    await user.clear(value)
    await user.paste('"yalnız mətn"')
    await user.click(
      within(dialog).getByRole('button', { name: 'Yadda saxla' }),
    )
    expect(
      await screen.findByText('Parametr yadda saxlanıldı'),
    ).toBeInTheDocument()
    expect(settingsStore.get('site.contact')?.value).toBe('yalnız mətn')
    expect(settingsStore.all()).toHaveLength(3)
  })

  it('boş dəyər → API-yə getmədən validasiya mesajı', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('site.contact')
    await user.click(screen.getByRole('button', { name: 'Yeni parametr' }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('Açar'), 'bos acar')
    await user.click(
      within(dialog).getByRole('button', { name: 'Yadda saxla' }),
    )
    expect(
      await within(dialog).findByText('Açarda boşluq ola bilməz'),
    ).toBeInTheDocument()
    expect(within(dialog).getByText('Dəyər məcburidir')).toBeInTheDocument()
    expect(settingsStore.all()).toHaveLength(3)
  })
})

describe('Müyəssərlik menyusu kartı (spec 007)', () => {
  const toggleName = 'Müyəssərlik menyusunu ictimai saytda göstər'

  /** Keçid siyahı yüklənəndən sonra aktivləşir — ondan sonra vəziyyət oxunur. */
  const findToggle = async () => {
    const toggle = await screen.findByRole('switch', { name: toggleName })
    await waitFor(() => expect(toggle).toBeEnabled())
    return toggle
  }

  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    settingsStore.reset()
    useAuthStore.setState({ isAuthenticated: true, user: adminUser })
  })

  afterEach(() => {
    useAuthStore.getState().logout()
  })

  it('açar yoxdur → keçid deaktivdir', async () => {
    renderPage()
    const toggle = await findToggle()
    expect(toggle).not.toBeChecked()
    expect(screen.getByText('Deaktiv')).toBeInTheDocument()
    expect(screen.getByText(/Hələ dəyişdirilməyib/)).toBeInTheDocument()
  })

  it('enabled:true → keçid aktivdir', async () => {
    settingsStore.upsert(accessibilityWidgetFixtures.enabled)
    renderPage()
    const toggle = await findToggle()
    expect(toggle).toBeChecked()
    expect(screen.getByText('Aktiv')).toBeInTheDocument()
    expect(screen.getByText(/Son dəyişiklik:/)).toBeInTheDocument()
  })

  it('səhv forma → keçid deaktivdir', async () => {
    settingsStore.upsert(accessibilityWidgetFixtures.malformed)
    renderPage()
    expect(await findToggle()).not.toBeChecked()
  })

  it('klik → ayar saxlanılır, toast, keçid server vəziyyətini göstərir', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await findToggle())
    expect(
      await screen.findByText('Müyəssərlik menyusu aktiv edildi'),
    ).toBeInTheDocument()
    expect(settingsStore.get('accessibility.widget')?.value).toEqual({
      enabled: true,
    })
    await waitFor(() =>
      expect(
        screen.getByRole('switch', { name: toggleName }),
      ).toBeChecked(),
    )
    // Ümumi cədvəl də yenilənib: yeni açar sətir kimi görünür.
    expect(await screen.findByText('accessibility.widget')).toBeInTheDocument()
  })

  it('aktivdən söndürmə → enabled:false saxlanılır', async () => {
    const user = userEvent.setup()
    settingsStore.upsert(accessibilityWidgetFixtures.enabled)
    renderPage()
    await user.click(await findToggle())
    expect(
      await screen.findByText('Müyəssərlik menyusu deaktiv edildi'),
    ).toBeInTheDocument()
    expect(settingsStore.get('accessibility.widget')?.value).toEqual({
      enabled: false,
    })
  })

  it('PUT 500 → xəta toast-u, keçid əvvəlki vəziyyətdə qalır', async () => {
    const user = userEvent.setup()
    server.use(
      http.put('/api/v1/settings/:key', () =>
        message(500, 'Server xətası baş verdi.'),
      ),
    )
    renderPage()
    const toggle = await findToggle()
    await user.click(toggle)
    expect(
      await screen.findByText('Server xətası baş verdi.'),
    ).toBeInTheDocument()
    await waitFor(() => expect(toggle).toBeEnabled())
    expect(toggle).not.toBeChecked()
    expect(settingsStore.get('accessibility.widget')).toBeNull()
  })

  it('PUT gedərkən keçid bağlıdır', async () => {
    const user = userEvent.setup()
    let release: () => void = () => {}
    const pending = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      http.put('/api/v1/settings/:key', async () => {
        await pending
        return message(500, 'Server xətası baş verdi.')
      }),
    )
    renderPage()
    const toggle = await findToggle()
    await user.click(toggle)
    await waitFor(() => expect(toggle).toBeDisabled())
    release()
    await waitFor(() => expect(toggle).toBeEnabled())
  })

  it('settings.manage icazəsi yoxdursa kart görünmür', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { ...adminUser, permissions: ['content.manage'] },
    })
    renderPage()
    expect(await screen.findByText('site.contact')).toBeInTheDocument()
    expect(
      screen.queryByRole('switch', { name: toggleName }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Müyəssərlik menyusu')).not.toBeInTheDocument()
  })
})
