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
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { registerModule } from '@/features/crud/model/module-registry'
import { createCrudRoutes } from '@/features/crud/routes/create-crud-routes'
import az from '@/locales/az/imagePopups.json'
import en from '@/locales/en/imagePopups.json'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import {
  imagePopupsHandlers,
  imagePopupsStore,
} from '@/shared/testing/handlers/image-popups'
import { message } from '@/shared/testing/handlers/lib/errors'
import { server } from '@/shared/testing/server'
import { imagePopupsModule } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(imagePopupsModule)),
  ]),
])

function renderCrud(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return router
}

const ACTIVE = 'Maliyyə savadlılığı həftəsi'

describe('Şəkilli popup-lar', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'imagePopups', az, true, true)
    i18n.addResourceBundle('en', 'imagePopups', en, true, true)
  })

  beforeEach(() => {
    imagePopupsStore.store.reset()
    // resetHandlers() setup.ts-də hər testdən sonra çağırılır — handler-lər yenidən əlavə olunur.
    server.use(...imagePopupsHandlers)
  })

  it('siyahı: başlıq, fayl adı, dil nişanları və status', async () => {
    renderCrud('/image-popups')
    expect(
      await screen.findByRole('heading', { name: 'Şəkilli popup-lar' }),
    ).toBeInTheDocument()
    const table = await screen.findByRole('table')
    const activeRow = (await within(table).findByText(ACTIVE)).closest('tr')!
    expect(within(activeRow).getByText('placeholder-1.svg')).toBeInTheDocument()
    expect(within(activeRow).getByText('AZ')).toBeInTheDocument()
    expect(within(activeRow).getByText('EN')).toBeInTheDocument()
    expect(within(activeRow).getByText('Aktiv')).toBeInTheDocument()

    const inactiveRow = within(table).getByText('Köhnə elan').closest('tr')!
    expect(
      within(inactiveRow).getByText('placeholder-2.svg'),
    ).toBeInTheDocument()
    expect(within(inactiveRow).getByText('AZ')).toBeInTheDocument()
    expect(within(inactiveRow).queryByText('EN')).toBeNull()
    expect(within(inactiveRow).getByText('Qeyri-aktiv')).toBeInTheDocument()
  })

  it('yaratma: şəkilsiz saxlanmır, javascript: link rədd olunur, düzgün body POST olunur', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/image-popups/new')
    expect(
      await screen.findByRole('heading', { name: /Yeni şəkilli popup/i }),
    ).toBeInTheDocument()
    const before = imagePopupsStore.store.all().length

    await user.type(
      screen.getByLabelText('Başlıq', { exact: false }),
      'Yeni kampaniya',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    expect(
      await screen.findByText(/Şəkil ən azı bir dildə doldurulmalıdır/),
    ).toBeInTheDocument()
    expect(imagePopupsStore.store.all()).toHaveLength(before)

    // AZ tabının şəkli (tablar forceMount ilə render olunur: ilk düymə AZ-dır).
    await user.click(screen.getAllByRole('button', { name: 'Seç' })[0])
    const dialog = await screen.findByRole('dialog')
    await user.click(
      await within(dialog).findByRole('button', {
        name: 'placeholder-1.svg faylını seç',
      }),
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )

    const linkInput = screen.getByLabelText('Link (AZ)', { exact: false })
    await user.type(linkInput, 'javascript:alert(1)')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    expect(await screen.findByText(az.validation.link)).toBeInTheDocument()
    expect(imagePopupsStore.store.all()).toHaveLength(before)
    expect(router.state.location.pathname).toBe('/image-popups/new')

    await user.clear(linkInput)
    await user.type(linkInput, '/az/page-40')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/image-popups'),
    )
    const created = imagePopupsStore.store
      .all()
      .find((row) => row.title === 'Yeni kampaniya')
    expect(created).toMatchObject({
      isActive: true,
      translations: {
        az: {
          mediaId: 1,
          mediaName: 'placeholder-1.svg',
          link: '/az/page-40',
          altText: null,
        },
      },
    })
    // Boş EN tərcüməsi göndərilmir.
    expect(created?.translations.en).toBeUndefined()
    expect(created?.activatedAt).toEqual(expect.any(String))
  })

  it('redaktə: hər tabda fayl adı görünür', async () => {
    renderCrud('/image-popups/1')
    expect(
      await screen.findByText('#1 · placeholder-1.svg'),
    ).toBeInTheDocument()
    expect(screen.getByText('#2 · placeholder-2.svg')).toBeInTheDocument()
  })

  it('siyahıdan status: klik PUT tam DTO göndərir, düymə və toast yenilənir', async () => {
    const user = userEvent.setup()
    renderCrud('/image-popups')
    await user.click(
      await screen.findByRole('button', {
        name: `Statusu dəyiş: ${ACTIVE} (Aktiv)`,
      }),
    )
    expect(
      await screen.findByText(`"${ACTIVE}" qeyri-aktiv edildi`),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', {
        name: `Statusu dəyiş: ${ACTIVE} (Qeyri-aktiv)`,
      }),
    ).toBeInTheDocument()
    // Digər sahələr toxunulmaz qalır — PUT tam DTO ilə gedir.
    expect(imagePopupsStore.store.get(1)).toMatchObject({
      isActive: false,
      title: ACTIVE,
      activatedAt: '2026-06-10T09:00:00+00:00',
      translations: {
        az: { mediaId: 1, link: 'https://www.cbar.az/az/page-40' },
        en: { mediaId: 2, link: '/en/page-40' },
      },
    })

    // Geri aktiv etmək popup-ı önə çəkir (activatedAt yenilənir).
    await user.click(
      screen.getByRole('button', {
        name: `Statusu dəyiş: ${ACTIVE} (Qeyri-aktiv)`,
      }),
    )
    await waitFor(() =>
      expect(imagePopupsStore.store.get(1)).toMatchObject({ isActive: true }),
    )
    expect(imagePopupsStore.store.get(1)?.activatedAt).not.toBe(
      '2026-06-10T09:00:00+00:00',
    )
  })

  it('siyahıdan status: API xətası toast ilə göstərilir, store dəyişmir', async () => {
    const user = userEvent.setup()
    server.use(
      http.put('/api/v1/image-popups/:id', () =>
        message(400, 'Media asset not found.'),
      ),
    )
    renderCrud('/image-popups')
    await user.click(
      await screen.findByRole('button', {
        name: `Statusu dəyiş: ${ACTIVE} (Aktiv)`,
      }),
    )
    expect(
      await screen.findByText('Media asset not found.'),
    ).toBeInTheDocument()
    expect(imagePopupsStore.store.get(1)).toMatchObject({ isActive: true })
  })

  it('silmə: dialoq başlığı göstərir, DELETE yazını silir', async () => {
    const user = userEvent.setup()
    renderCrud('/image-popups')
    await screen.findByText(ACTIVE)
    await user.click(screen.getByRole('button', { name: `Sil: ${ACTIVE}` }))
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText(new RegExp(`"${ACTIVE}" qeydi silinsin`)),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Sil' }))
    await waitFor(() =>
      expect(screen.queryByText(ACTIVE)).not.toBeInTheDocument(),
    )
    expect(imagePopupsStore.store.get(1)).toBeNull()
  })
})
