/**
 * spec 010 — media sahəsində önizləmə (US1) və böyüdülmüş önizləmə (US3).
 * Real CRUD formu (şəkilli popup: hər dildə ayrıca şəkil sahəsi) + MSW kontraktı.
 */

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
import type { ReactNode } from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import type { MediaItem } from '@/entities/media/model/types'
import { AssetsSection } from '@/features/assets/components/assets-section'
import { registerModule } from '@/features/crud/model/module-registry'
import { createCrudRoutes } from '@/features/crud/routes/create-crud-routes'
import { GalleryImagesSection } from '@/features/galleries/components/gallery-images-section'
import { imagePopupsModule } from '@/features/image-popups/model/module'
import galleriesAz from '@/locales/az/galleries.json'
import az from '@/locales/az/imagePopups.json'
import galleriesEn from '@/locales/en/galleries.json'
import en from '@/locales/en/imagePopups.json'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import {
  imagePopupsHandlers,
  imagePopupsStore,
} from '@/shared/testing/handlers/image-popups'
import { message } from '@/shared/testing/handlers/lib/errors'
import { mediaStore } from '@/shared/testing/handlers/media'
import { mockAllInView } from '@/shared/testing/in-view'
import { server } from '@/shared/testing/server'
import { MediaGrid } from './components/media-grid'
import { MediaPickerDialog } from './components/media-picker-dialog'

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

/** Önizləmə şəkli — tablar forceMount ilə render olunur, gizli tab da sayılır. */
const previewImage = (name: string) =>
  screen.findByRole('img', { name, hidden: true })

async function pickFromDialog(user: ReturnType<typeof userEvent.setup>, name: string) {
  const dialog = await screen.findByRole('dialog')
  await user.click(
    await within(dialog).findByRole('button', { name: `${name} faylını seç` }),
  )
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  )
}

describe('Media önizləməsi (spec 010)', () => {
  let restoreInView: () => void

  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'imagePopups', az, true, true)
    i18n.addResourceBundle('en', 'imagePopups', en, true, true)
  })

  beforeEach(() => {
    imagePopupsStore.store.reset()
    mediaStore.reset()
    server.use(...imagePopupsHandlers)
    restoreInView = mockAllInView()
  })

  afterEach(() => restoreInView())

  it('redaktə: hər dilin saxlanılmış şəkli önizlənir, "#id · ad" qalır', async () => {
    renderCrud('/image-popups/1')

    const azImage = await previewImage('placeholder-1.svg')
    const enImage = await previewImage('placeholder-2.svg')
    expect(azImage.getAttribute('src')).toMatch(/^blob:/)
    expect(enImage.getAttribute('src')).toMatch(/^blob:/)
    expect(azImage.getAttribute('src')).not.toBe(enImage.getAttribute('src'))
    expect(screen.getByText('#1 · placeholder-1.svg')).toBeInTheDocument()
    expect(screen.getByText('#2 · placeholder-2.svg')).toBeInTheDocument()
  })

  it('yaratma: seçilən şəkil dərhal önizlənir, "Təmizlə" onu götürür', async () => {
    const user = userEvent.setup()
    renderCrud('/image-popups/new')
    expect(
      await screen.findByRole('heading', { name: /Yeni şəkilli popup/i }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('img', { hidden: true })).toBeNull()

    await user.click(screen.getAllByRole('button', { name: 'Seç' })[0])
    await pickFromDialog(user, 'placeholder-2.svg')
    expect(await previewImage('placeholder-2.svg')).toBeInTheDocument()

    // Saxlamadan dəyişmək: köhnə önizləmə yenisi ilə əvəzlənir.
    await user.click(screen.getByRole('button', { name: 'Dəyiş' }))
    await pickFromDialog(user, 'placeholder-1.svg')
    expect(await previewImage('placeholder-1.svg')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'placeholder-2.svg', hidden: true })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Təmizlə' }))
    await waitFor(() =>
      expect(screen.queryByRole('img', { hidden: true })).toBeNull(),
    )
    expect(screen.getAllByText('Fayl seçilməyib').length).toBeGreaterThan(0)
  })

  it('şəkil olmayan fayl: ikon + ad, sınıq şəkil yoxdur', async () => {
    const user = userEvent.setup()
    renderCrud('/image-popups/new')
    await screen.findByRole('heading', { name: /Yeni şəkilli popup/i })

    await user.click(screen.getAllByRole('button', { name: 'Seç' })[0])
    await pickFromDialog(user, 'hesabat-2025.pdf')

    expect(await screen.findByText('#3 · hesabat-2025.pdf')).toBeInTheDocument()
    expect(screen.queryByRole('img', { hidden: true })).toBeNull()
  })

  it('önizləmə alınmasa yer tutucu görünür, forma işləyir', async () => {
    server.use(
      http.get('/api/v1/media/:id/preview', () => message(404, 'Not found.')),
    )
    renderCrud('/image-popups/1')

    await waitFor(() =>
      expect(
        screen.getAllByRole('img', {
          name: 'Önizləmə əlçatan deyil',
          hidden: true,
        }),
      ).toHaveLength(2),
    )
    expect(screen.getByText('#1 · placeholder-1.svg')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Yadda saxla' })).toBeEnabled()
  })

  it('böyüt: lightbox açılır, Esc və × ilə bağlanır, forma göndərilmir', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/image-popups/1')
    const before = structuredClone(imagePopupsStore.store.all())

    const trigger = await screen.findByRole('button', {
      name: 'placeholder-1.svg — böyüt',
    })
    // Şəkil yüklənənə qədər düymə yoxdur — tapılması önizləmənin hazır olduğunu göstərir.
    await user.click(trigger)
    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('heading', { name: 'placeholder-1.svg' }),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByRole('img', { name: 'placeholder-1.svg' }).getAttribute('src'),
    ).toMatch(/^blob:/)

    await user.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    await waitFor(() => expect(trigger).toHaveFocus())

    await user.click(trigger)
    const again = await screen.findByRole('dialog')
    await user.click(within(again).getByRole('button', { name: /bağla|close/i }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )

    expect(router.state.location.pathname).toBe('/image-popups/1')
    expect(imagePopupsStore.store.all()).toEqual(before)
  })
})

/** Komponent səviyyəsi (US2/US3): siyahı və bağlanmış fayllar MSW kontraktından. */
function renderInApp(ui: ReactNode) {
  render(<AppProviders>{ui}</AppProviders>)
}

describe('Siyahılarda önizləmə (spec 010 US2/US3)', () => {
  let restoreInView: () => void

  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'galleries', galleriesAz, true, true)
    i18n.addResourceBundle('en', 'galleries', galleriesEn, true, true)
  })

  beforeEach(() => {
    mediaStore.reset()
    restoreInView = mockAllInView()
  })

  afterEach(() => restoreInView())

  it('seçici: şəkillər önizləmə ilə, sənədlər ikonla; klik seçimdir, lightbox açmır', async () => {
    const user = userEvent.setup()
    const picked: MediaItem[] = []
    renderInApp(
      <MediaPickerDialog
        open
        onClose={() => {}}
        onPick={(item) => picked.push(item)}
      />,
    )

    const dialog = await screen.findByRole('dialog')
    expect(
      await within(dialog).findByRole('img', { name: 'placeholder-1.svg' }),
    ).toBeInTheDocument()
    expect(
      await within(dialog).findByRole('img', { name: 'placeholder-2.svg' }),
    ).toBeInTheDocument()
    expect(within(dialog).getAllByRole('img')).toHaveLength(2)
    expect(
      within(dialog).queryByRole('button', { name: /böyüt/ }),
    ).not.toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', { name: 'placeholder-1.svg faylını seç' }),
    )
    expect(picked.map((item) => item.id)).toEqual([1])
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
  })

  it('qalereya: bağlanmış şəkillər sətirlərdə önizlənir', async () => {
    renderInApp(
      <GalleryImagesSection
        id="2"
        detail={{
          images: [
            { id: 2, mediaId: 1, originalName: 'placeholder-1.svg', sortOrder: 0 },
            { id: 3, mediaId: 2, originalName: 'placeholder-2.svg', sortOrder: 1 },
          ],
        }}
      />,
    )

    expect(await previewImage('placeholder-1.svg')).toBeInTheDocument()
    expect(await previewImage('placeholder-2.svg')).toBeInTheDocument()
  })

  it('əlavələr: şəkil önizlənir, PDF ikonla qalır', async () => {
    renderInApp(
      <AssetsSection
        assetsPath="/laws/1/assets"
        assets={[
          { mediaId: 2, originalName: 'placeholder-2.svg', mimeType: 'image/svg+xml', sizeBytes: 2100 },
          { mediaId: 3, originalName: 'hesabat-2025.pdf', mimeType: 'application/pdf', sizeBytes: 240113 },
        ]}
        onChanged={() => {}}
      />,
    )

    expect(await previewImage('placeholder-2.svg')).toBeInTheDocument()
    expect(screen.getByText('hesabat-2025.pdf')).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(1)
  })

  it('media kitabxanası: şəkil kartı önizlənir və böyüdülür, sənəd kartında şəkil yoxdur', async () => {
    const user = userEvent.setup()
    const items = mediaStore.all().filter((item) => [1, 3].includes(item.id))
    renderInApp(<MediaGrid items={items} onDelete={() => {}} />)

    const card = await screen.findByRole('button', {
      name: 'placeholder-1.svg — böyüt',
    })
    expect(screen.getAllByRole('img')).toHaveLength(1)

    await user.click(card)
    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('img', { name: 'placeholder-1.svg' }),
    ).toBeInTheDocument()
  })
})
