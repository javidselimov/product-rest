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
import az from '@/locales/az/galleries.json'
import en from '@/locales/en/galleries.json'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import {
  galleriesHandlers,
  galleriesStore,
} from '@/shared/testing/handlers/galleries'
import { message } from '@/shared/testing/handlers/lib/errors'
import { server } from '@/shared/testing/server'
import { galleriesModule } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(galleriesModule)),
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

const imagesList = () => screen.getByRole('list', { name: 'Şəkillər' })
const galleryImageMediaIds = (id: number) =>
  galleriesStore.store.get(id)?.images.map((image) => image.mediaId)

describe('Qalereyalar', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'galleries', az, true, true)
    i18n.addResourceBundle('en', 'galleries', en, true, true)
  })

  beforeEach(() => {
    galleriesStore.store.reset()
    // resetHandlers() setup.ts-də hər testdən sonra çağırılır — handler-lər yenidən əlavə olunur.
    server.use(...galleriesHandlers)
  })

  it('siyahı: düz başlıq, şəkil sayı və aktiv nişanı', async () => {
    renderCrud('/galleries')
    expect(
      await screen.findByRole('heading', { name: 'Qalereyalar' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Valyuta sərgisi')).toBeInTheDocument()
    // Yalnız EN tərcüməsi olan qeyd də başlıqla görünür.
    expect(screen.getByText('Open day')).toBeInTheDocument()
    expect(screen.getByText('3 qeyd · səhifə 1 / 1')).toBeInTheDocument()
    expect(screen.getAllByText('Aktiv').length).toBe(2)
    expect(screen.getByText('Qeyri-aktiv')).toBeInTheDocument()
  })

  it('yaratma: AZ başlıq → qeyd yaranır, şəkil siyahısı boş', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/galleries/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni qalereya' }),
    ).toBeInTheDocument()
    // Yaratma ekranında şəkil bölməsi yoxdur — əvvəlcə qeyd yadda saxlanılmalıdır.
    expect(
      screen.queryByRole('button', { name: 'Şəkil əlavə et' }),
    ).not.toBeInTheDocument()
    await user.type(
      screen.getByLabelText('Başlıq (AZ)', { exact: false }),
      'Yeni sərgi',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/galleries'),
    )
    expect(await screen.findByText('Qeyd yaradıldı')).toBeInTheDocument()
    const created = galleriesStore.store
      .all()
      .find((row) => row.translations.az?.title === 'Yeni sərgi')
    expect(created).toBeDefined()
    expect(created?.images).toEqual([])
    expect(created?.isActive).toBe(true)
    expect(created?.sortOrder).toBe(0)
    expect(await screen.findByText('Yeni sərgi')).toBeInTheDocument()
  })

  it('redaktə: şəkil əlavə et → aşağı köçür (tam siyahı) → çıxar', async () => {
    const user = userEvent.setup()
    renderCrud('/galleries/1')
    expect(
      await screen.findByLabelText('Başlıq (AZ)', { exact: false }),
    ).toHaveValue('Valyuta sərgisi')
    expect(
      within(imagesList()).getByText('placeholder-1.svg'),
    ).toBeInTheDocument()

    // Əlavə et: artıq bağlı fayl seçicidə söndürülüb, yenisi seçilir.
    await user.click(screen.getByRole('button', { name: 'Şəkil əlavə et' }))
    const picker = await screen.findByRole('dialog')
    expect(
      within(picker).getByRole('heading', { name: 'Şəkil seç' }),
    ).toBeInTheDocument()
    const attached = await within(picker).findByRole('button', {
      name: 'placeholder-1.svg faylını seç',
    })
    expect(attached).toBeDisabled()
    await user.click(
      within(picker).getByRole('button', {
        name: 'placeholder-2.svg faylını seç',
      }),
    )
    expect(await screen.findByText('Şəkil əlavə edildi')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(
      await within(imagesList()).findByText('placeholder-2.svg'),
    ).toBeInTheDocument()
    expect(galleryImageMediaIds(1)).toEqual([1, 2])

    // Aşağı köçür: mock tam id dəstini tələb edir — natamam siyahı 400 verərdi.
    await user.click(
      screen.getByRole('button', {
        name: 'placeholder-1.svg şəklini aşağı köçür',
      }),
    )
    expect(await screen.findByText('Sıra yeniləndi')).toBeInTheDocument()
    expect(galleryImageMediaIds(1)).toEqual([2, 1])
    await waitFor(() => {
      const rows = within(imagesList()).getAllByRole('listitem')
      expect(rows[0]).toHaveTextContent('placeholder-2.svg')
      expect(rows[1]).toHaveTextContent('placeholder-1.svg')
    })
    expect(
      screen.getByRole('button', {
        name: 'placeholder-2.svg şəklini yuxarı köçür',
      }),
    ).toBeDisabled()

    // Çıxar: təsdiq dialoqu → siyahıdan yox olur.
    await user.click(
      screen.getByRole('button', { name: 'placeholder-2.svg şəklini çıxar' }),
    )
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText(/"placeholder-2.svg" qalereyadan çıxarılsın/),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Çıxar' }))
    expect(await screen.findByText('Şəkil çıxarıldı')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        within(imagesList()).queryByText('placeholder-2.svg'),
      ).not.toBeInTheDocument(),
    )
    expect(galleryImageMediaIds(1)).toEqual([1])
  })

  it('əlavə etmədə 409 → mesaj seçici içində göstərilir', async () => {
    server.use(
      http.post('/api/v1/galleries/:id/images', () =>
        message(409, 'Already attached.'),
      ),
    )
    const user = userEvent.setup()
    renderCrud('/galleries/2')
    await screen.findByLabelText('Başlıq (AZ)', { exact: false })
    expect(screen.getByText('Şəkil yoxdur.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Şəkil əlavə et' }))
    const picker = await screen.findByRole('dialog')
    await user.click(
      await within(picker).findByRole('button', {
        name: 'hesabat-2025.pdf faylını seç',
      }),
    )
    expect(
      await within(picker).findByText('Already attached.'),
    ).toBeInTheDocument()
    expect(galleriesStore.store.get(2)?.images).toEqual([])
  })
})
