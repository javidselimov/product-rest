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
import az from '@/locales/az/pressReleases.json'
import en from '@/locales/en/pressReleases.json'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import { message } from '@/shared/testing/handlers/lib/errors'
import {
  pressReleasesHandlers,
  pressReleasesStore,
} from '@/shared/testing/handlers/press-releases'
import { server } from '@/shared/testing/server'
import { pressReleasesModule } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(pressReleasesModule)),
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

/** Records list request query strings; returning nothing lets the store handler answer. */
function spyListRequests(): URLSearchParams[] {
  const seen: URLSearchParams[] = []
  server.use(
    http.get(pressReleasesStore.base, ({ request }) => {
      seen.push(new URL(request.url).searchParams)
    }),
  )
  return seen
}

/** Records POST or PUT bodies, then falls through to the real handlers. */
function spyWriteBodies(method: 'post' | 'put'): Record<string, unknown>[] {
  const seen: Record<string, unknown>[] = []
  server.use(
    http[method](`${pressReleasesStore.base}*`, async ({ request }) => {
      seen.push((await request.clone().json()) as Record<string, unknown>)
    }),
  )
  return seen
}

// jsdom has no pointer capture; the kit Select (Radix) calls it.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}

/** Opens a kit Select: if a click does not (jsdom pointer limits), ArrowDown does. */
async function openSelect(
  user: ReturnType<typeof userEvent.setup>,
  trigger: HTMLElement,
) {
  await user.click(trigger)
  if (trigger.getAttribute('aria-expanded') !== 'true') {
    trigger.focus()
    await user.keyboard('{ArrowDown}')
  }
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
}

const assetsList = () =>
  screen.getByRole('list', { name: 'Şəkillər və sənədlər' })
/** The row (`<li>`) of an attachment by file name, for scoped badge/button queries. */
const assetRow = (name: string) => {
  const row = within(assetsList()).getByText(name).closest('li')
  if (!row) throw new Error(`attachment row ${name} not found`)
  return row
}
const assetMediaIds = (id: number) =>
  pressReleasesStore.store.get(id)?.assets.map((asset) => asset.mediaId)
const assetLocale = (id: number, mediaId: number) =>
  pressReleasesStore.store.get(id)?.assets.find((asset) => asset.mediaId === mediaId)?.locale
const localeSelect = (name: string) =>
  screen.getByRole('combobox', { name: `Fayl dili: ${name}` })

describe('Press releases', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'pressReleases', az, true, true)
    i18n.addResourceBundle('en', 'pressReleases', en, true, true)

    // The form carries the rich-text editor — the Range measuring APIs jsdom lacks
    // are minimally stubbed for ProseMirror (as in the rich-text test).
    const emptyRect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      toJSON: () => ({}),
    } as DOMRect
    if (!Range.prototype.getClientRects) {
      Range.prototype.getClientRects = () => [] as unknown as DOMRectList
    }
    if (!Range.prototype.getBoundingClientRect) {
      Range.prototype.getBoundingClientRect = () => emptyRect
    }
    if (!document.elementFromPoint) {
      document.elementFromPoint = () => null
    }
  })

  beforeEach(() => {
    pressReleasesStore.store.reset()
    // setup.ts calls resetHandlers() after every test — the handlers are added again.
    server.use(...pressReleasesHandlers)
  })

  it('list: flat title, status and type badges, search box', async () => {
    renderCrud('/press-releases')
    expect(
      await screen.findByRole('heading', { name: 'Press relizlər' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Uçot dərəcəsi dəyişməz saxlanılıb'),
    ).toBeInTheDocument()
    expect(screen.getByText('Statement on FX market')).toBeInTheDocument()
    expect(screen.getByText('5 qeyd · səhifə 1 / 1')).toBeInTheDocument()
    expect(screen.getAllByText('Dərc olunub')).toHaveLength(2)
    expect(screen.getByText('Qaralama')).toBeInTheDocument()
    expect(screen.getByText('Planlaşdırılıb')).toBeInTheDocument()
    // The type column tells news and announcements apart.
    const row = (title: string) => screen.getByText(title).closest('tr')!
    expect(within(row('Uçot dərəcəsi dəyişməz saxlanılıb')).getByText('Xəbər')).toBeInTheDocument()
    expect(within(row('Statement on FX market')).getByText('Elan')).toBeInTheDocument()
    expect(screen.getByLabelText('Axtar')).toBeInTheDocument()
  })

  it('the type filter sends type=2 and lists only announcements', async () => {
    const user = userEvent.setup()
    const requests = spyListRequests()
    const router = renderCrud('/press-releases')
    await screen.findByText('Uçot dərəcəsi dəyişməz saxlanılıb')

    const trigger = screen.getByRole('combobox', { name: 'Növ' })
    await openSelect(user, trigger)
    await user.click(await screen.findByRole('option', { name: 'Elan' }))

    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({ type: '2' }),
    )
    await waitFor(() =>
      expect(requests.at(-1)?.get('type')).toBe('2'),
    )
    expect(
      await screen.findByText('Maliyyə sabitliyi hesabatı təqdim olunub'),
    ).toBeInTheDocument()
    expect(screen.getByText('Statement on FX market')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.queryByText('Uçot dərəcəsi dəyişməz saxlanılıb'),
      ).not.toBeInTheDocument(),
    )
    expect(
      screen.queryByText('Yeni əskinasların tədavülə buraxılması'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('2 qeyd · səhifə 1 / 1')).toBeInTheDocument()
  })

  it('create: choosing "Elan" sends type 2 as a number', async () => {
    const user = userEvent.setup()
    const bodies = spyWriteBodies('post')
    const router = renderCrud('/press-releases/new')
    await screen.findByRole('heading', { name: 'Yeni press reliz' })

    const trigger = screen.getByRole('combobox', { name: 'Növ' })
    // News is preselected, so a new item is never sent without a type.
    expect(trigger).toHaveTextContent('Xəbər')
    await openSelect(user, trigger)
    await user.click(await screen.findByRole('option', { name: 'Elan' }))
    await user.type(
      screen.getByLabelText('Başlıq (AZ)', { exact: false }),
      'Yeni elan',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/press-releases'),
    )
    expect(bodies.at(-1)).toMatchObject({ type: 2 })
    const created = pressReleasesStore.store
      .all()
      .find((r) => r.translations.az?.title === 'Yeni elan')
    expect(created?.type).toBe(2)
  })

  it('edit: an announcement stays an announcement — the form sends its type back', async () => {
    const user = userEvent.setup()
    const bodies = spyWriteBodies('put')
    const router = renderCrud('/press-releases/2')
    const title = await screen.findByLabelText('Başlıq (AZ)', { exact: false })
    await waitFor(() => expect(title).toHaveValue('Maliyyə sabitliyi hesabatı təqdim olunub'))
    expect(screen.getByRole('combobox', { name: 'Növ' })).toHaveTextContent('Elan')

    await user.type(title, ' (yenilənib)')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/press-releases'),
    )
    // Explicitly sent, not just kept by the API — an older panel that omitted it is what broke types.
    expect(bodies.at(-1)).toMatchObject({ type: 2 })
    expect(pressReleasesStore.store.get(2)?.type).toBe(2)
  })

  it('the status filter from the URL goes into the request (status=published)', async () => {
    renderCrud('/press-releases?status=published')
    expect(
      await screen.findByText('Uçot dərəcəsi dəyişməz saxlanılıb'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Yeni əskinasların tədavülə buraxılması'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Maliyyə sabitliyi hesabatı təqdim olunub'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Statement on FX market')).not.toBeInTheDocument()
    expect(screen.getByText('2 qeyd · səhifə 1 / 1')).toBeInTheDocument()
  })

  it('search works on translated titles', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/press-releases')
    await screen.findByText('Uçot dərəcəsi dəyişməz saxlanılıb')
    await user.type(screen.getByLabelText('Axtar'), 'FX market')
    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({
        search: 'FX market',
      }),
    )
    expect(
      await screen.findByText('Statement on FX market'),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.queryByText('Uçot dərəcəsi dəyişməz saxlanılıb'),
      ).not.toBeInTheDocument(),
    )
  })

  it('create: AZ title → created as a draft news item, empty document list', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/press-releases/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni press reliz' }),
    ).toBeInTheDocument()
    // The create screen has no documents section — the record has to be saved first.
    expect(
      screen.queryByRole('button', { name: 'Sənəd əlavə et' }),
    ).not.toBeInTheDocument()
    await user.type(
      screen.getByLabelText('Başlıq (AZ)', { exact: false }),
      'Yeni açıqlama',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/press-releases'),
    )
    expect(await screen.findByText('Qeyd yaradıldı')).toBeInTheDocument()
    const created = pressReleasesStore.store
      .all()
      .find((row) => row.translations.az?.title === 'Yeni açıqlama')
    expect(created).toBeDefined()
    expect(created?.status).toBe('draft')
    expect(created?.type).toBe(1)
    expect(created?.publishedAt).toBeNull()
    expect(created?.translations.en).toBeUndefined()
    expect(created?.assets).toEqual([])
    expect(await screen.findByText('Yeni açıqlama')).toBeInTheDocument()
  })

  it('edit: attach a document (picker) → listed → detach (dialog)', async () => {
    const user = userEvent.setup()
    renderCrud('/press-releases/1')
    expect(
      await screen.findByLabelText('Başlıq (AZ)', { exact: false }),
    ).toHaveValue('Uçot dərəcəsi dəyişməz saxlanılıb')
    expect(
      within(assetsList()).getByText('hesabat-2025.pdf'),
    ).toBeInTheDocument()

    // Attach: an already attached file is disabled in the picker; POST 204 → detail refetch.
    await user.click(screen.getByRole('button', { name: 'Sənəd əlavə et' }))
    const picker = await screen.findByRole('dialog')
    expect(
      await within(picker).findByRole('button', {
        name: 'hesabat-2025.pdf faylını seç',
      }),
    ).toBeDisabled()
    await user.click(
      within(picker).getByRole('button', { name: 'mezenne.xlsx faylını seç' }),
    )
    expect(await screen.findByText('Sənəd bağlandı')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(
      await within(assetsList()).findByText('mezenne.xlsx'),
    ).toBeInTheDocument()
    expect(assetMediaIds(1)).toEqual([3, 4])

    // Detach: confirmation dialog → gone from the list, the file stays in the library.
    await user.click(
      screen.getByRole('button', { name: 'mezenne.xlsx sənədini ayır' }),
    )
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText(/"mezenne.xlsx" bu qeyddən ayrılsın/),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Ayır' }))
    expect(await screen.findByText('Sənəd ayrıldı')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        within(assetsList()).queryByText('mezenne.xlsx'),
      ).not.toBeInTheDocument(),
    )
    expect(assetMediaIds(1)).toEqual([3])
    expect(
      within(assetsList()).getByText('hesabat-2025.pdf'),
    ).toBeInTheDocument()
  })

  // Spec 030 — the order decides what the public site shows: first image = cover,
  // other images = photo gallery, files = document list.
  it('edit: the first image is badged "Örtük", the other images "Qalereya", the PDF has none', async () => {
    renderCrud('/press-releases/4')
    expect(
      await screen.findByLabelText('Başlıq (AZ)', { exact: false }),
    ).toHaveValue('Yeni əskinasların tədavülə buraxılması')

    expect(
      within(assetRow('placeholder-1.svg')).getByText('Örtük'),
    ).toBeInTheDocument()
    expect(
      within(assetRow('placeholder-2.svg')).getByText('Qalereya'),
    ).toBeInTheDocument()
    expect(
      within(assetRow('eskinas-3.jpg')).getByText('Qalereya'),
    ).toBeInTheDocument()
    const pdf = assetRow('hesabat-2025.pdf')
    expect(within(pdf).queryByText('Örtük')).not.toBeInTheDocument()
    expect(within(pdf).queryByText('Qalereya')).not.toBeInTheDocument()
    expect(screen.getAllByText('Qalereya')).toHaveLength(2)
    expect(
      screen.getByText(/İlk şəkil saytda örtük, qalan şəkillər fotoqalereyadır/),
    ).toBeInTheDocument()
  })

  it('edit: an announcement (spec 031) gets no cover/gallery badges, an explanatory text, and keeps the reorder arrows', async () => {
    renderCrud('/press-releases/3')
    expect(
      await screen.findByLabelText('Başlıq (EN)', { exact: false }),
    ).toHaveValue('Statement on FX market')
    expect(screen.getByRole('combobox', { name: 'Növ' })).toHaveTextContent('Elan')

    const image = assetRow('placeholder-2.svg')
    expect(within(image).queryByText('Örtük')).not.toBeInTheDocument()
    expect(within(image).queryByText('Qalereya')).not.toBeInTheDocument()
    expect(screen.queryByText('Örtük')).not.toBeInTheDocument()
    expect(
      screen.getByText(/Elanlarda şəkil göstərilmir; bütün fayllar saytda qoşma siyahısı kimi görünür/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'hesabat-2025.pdf faylını yuxarı köçür' }),
    ).toBeEnabled()
  })

  it('edit: moving the second image up PUTs the full new order and the cover badge follows it', async () => {
    const user = userEvent.setup()
    const bodies = spyWriteBodies('put')
    renderCrud('/press-releases/4')
    expect(
      await within(await screen.findByRole('list', { name: 'Şəkillər və sənədlər' }))
        .findByText('placeholder-2.svg'),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'placeholder-2.svg faylını yuxarı köçür',
      }),
    )
    expect(await screen.findByText('Sıra yeniləndi')).toBeInTheDocument()
    expect(bodies).toEqual([{ mediaIds: [2, 1, 7, 3] }])
    expect(assetMediaIds(4)).toEqual([2, 1, 7, 3])

    // After the refetch the list is in the new order and the badge moved with it.
    await waitFor(() =>
      expect(
        within(assetRow('placeholder-2.svg')).getByText('Örtük'),
      ).toBeInTheDocument(),
    )
    expect(
      within(assetRow('placeholder-1.svg')).getByText('Qalereya'),
    ).toBeInTheDocument()
    const names = within(assetsList())
      .getAllByRole('listitem')
      .map((li) => li.querySelector('.truncate')?.textContent)
    expect(names).toEqual([
      'placeholder-2.svg',
      'placeholder-1.svg',
      'eskinas-3.jpg',
      'hesabat-2025.pdf',
    ])
  })

  it('edit: the first row cannot move up and the last row cannot move down', async () => {
    renderCrud('/press-releases/4')
    expect(
      await within(await screen.findByRole('list', { name: 'Şəkillər və sənədlər' }))
        .findByText('placeholder-1.svg'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'placeholder-1.svg faylını yuxarı köçür',
      }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', {
        name: 'placeholder-1.svg faylını aşağı köçür',
      }),
    ).toBeEnabled()
    expect(
      screen.getByRole('button', {
        name: 'hesabat-2025.pdf faylını aşağı köçür',
      }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', {
        name: 'hesabat-2025.pdf faylını yuxarı köçür',
      }),
    ).toBeEnabled()
  })

  it('edit: choosing a file language PUTs it and the row shows it after the refetch', async () => {
    const user = userEvent.setup()
    const bodies = spyWriteBodies('put')
    renderCrud('/press-releases/1')
    await screen.findByLabelText('Başlıq (AZ)', { exact: false })

    const trigger = localeSelect('hesabat-2025.pdf')
    expect(trigger).toHaveTextContent('Hər iki dil')
    await openSelect(user, trigger)
    await user.click(await screen.findByRole('option', { name: 'EN' }))

    await waitFor(() => expect(assetLocale(1, 3)).toBe('en'))
    expect(bodies.at(-1)).toEqual({ locale: 'en' })
    expect(await screen.findByText('Fayl dili yeniləndi')).toBeInTheDocument()
    await waitFor(() =>
      expect(localeSelect('hesabat-2025.pdf')).toHaveTextContent('EN'),
    )
  })

  it('edit: "Hər iki dil" clears the language with null', async () => {
    const user = userEvent.setup()
    const bodies = spyWriteBodies('put')
    renderCrud('/press-releases/5')
    await screen.findByLabelText('Başlıq (AZ)', { exact: false })

    await openSelect(user, localeSelect('report-2025.pdf'))
    await user.click(await screen.findByRole('option', { name: 'Hər iki dil' }))

    await waitFor(() => expect(assetLocale(5, 8)).toBeNull())
    expect(bodies.at(-1)).toEqual({ locale: null })
  })

  it('edit: a rejected language is shown inline and the row keeps its value', async () => {
    const user = userEvent.setup()
    server.use(
      http.put(`${pressReleasesStore.base}/1/assets/3/locale`, () =>
        message(400, 'Unknown locale.'),
      ),
    )
    renderCrud('/press-releases/1')
    await screen.findByLabelText('Başlıq (AZ)', { exact: false })

    await openSelect(user, localeSelect('hesabat-2025.pdf'))
    await user.click(await screen.findByRole('option', { name: 'AZ' }))

    expect(await screen.findByText('Unknown locale.')).toBeInTheDocument()
    expect(localeSelect('hesabat-2025.pdf')).toHaveTextContent('Hər iki dil')
  })

  it('list: an interview has its own badge and the type filter finds it', async () => {
    const user = userEvent.setup()
    const requests = spyListRequests()
    renderCrud('/press-releases')
    await screen.findByText('Mərkəzi Bankın sədrinin müsahibəsi')
    expect(screen.getByText('Müsahibə və çıxış')).toBeInTheDocument()

    await openSelect(user, screen.getByRole('combobox', { name: 'Növ' }))
    await user.click(await screen.findByRole('option', { name: 'Müsahibə və çıxış' }))

    await waitFor(() => expect(requests.at(-1)?.get('type')).toBe('3'))
    await waitFor(() =>
      expect(
        screen.queryByText('Uçot dərəcəsi dəyişməz saxlanılıb'),
      ).not.toBeInTheDocument(),
    )
  })

  it('create: choosing "Müsahibə və çıxış" sends type 3 as a number', async () => {
    const user = userEvent.setup()
    const bodies = spyWriteBodies('post')
    const router = renderCrud('/press-releases/new')
    await screen.findByRole('heading', { name: 'Yeni press reliz' })

    await openSelect(user, screen.getByRole('combobox', { name: 'Növ' }))
    await user.click(await screen.findByRole('option', { name: 'Müsahibə və çıxış' }))
    await user.type(
      screen.getByLabelText('Başlıq (AZ)', { exact: false }),
      'Yeni müsahibə',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/press-releases'),
    )
    expect(bodies.at(-1)).toMatchObject({ type: 3 })
  })

  it('edit: an interview badges the card image and the first PDF of each language', async () => {
    renderCrud('/press-releases/5')
    await screen.findByLabelText('Başlıq (AZ)', { exact: false })
    await screen.findByText('hesabat-2025.pdf')

    expect(
      within(assetRow('placeholder-1.svg')).getByText('Kart şəkli'),
    ).toBeInTheDocument()
    expect(
      within(assetRow('placeholder-2.svg')).queryByText('Kart şəkli'),
    ).not.toBeInTheDocument()
    expect(
      within(assetRow('hesabat-2025.pdf')).getByText('PDF düyməsi'),
    ).toBeInTheDocument()
    expect(
      within(assetRow('report-2025.pdf')).getByText('PDF düyməsi'),
    ).toBeInTheDocument()
    expect(
      within(assetRow('elave-2025.pdf')).queryByText('PDF düyməsi'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Örtük')).not.toBeInTheDocument()
    expect(screen.queryByText('Qalereya')).not.toBeInTheDocument()
    expect(
      screen.getByText(/İlk şəkil yalnız siyahı kartında görünür/),
    ).toBeInTheDocument()
  })

  it('edit: a PDF for both languages is the only button, and the language-bound one after it gets none', async () => {
    const row = pressReleasesStore.store.get(5)!
    pressReleasesStore.store.replace({
      ...row,
      assets: row.assets.map((asset) =>
        asset.mediaId === 3 ? { ...asset, locale: null } : asset,
      ),
    })
    renderCrud('/press-releases/5')
    await screen.findByText('hesabat-2025.pdf')

    expect(
      within(assetRow('hesabat-2025.pdf')).getByText('PDF düyməsi'),
    ).toBeInTheDocument()
    expect(
      within(assetRow('report-2025.pdf')).queryByText('PDF düyməsi'),
    ).not.toBeInTheDocument()
  })

  it('an unknown type comes back as a 400 and stays on the form', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(pressReleasesStore.base, () =>
        message(400, 'Type must be 1 (news), 2 (announcement) or 3 (interview or speech).'),
      ),
    )
    const router = renderCrud('/press-releases/new')
    await screen.findByRole('heading', { name: 'Yeni press reliz' })
    await user.type(
      screen.getByLabelText('Başlıq (AZ)', { exact: false }),
      'Yeni',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    expect(
      await screen.findByText(/Type must be 1 \(news\), 2 \(announcement\) or 3/),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/press-releases/new')
  })

  it('edit: a rejected order (400 with message) is shown inline and the list stays', async () => {
    const user = userEvent.setup()
    server.use(
      http.put(`${pressReleasesStore.base}/:id/assets/order`, () =>
        message(400, 'Sıra qəbul edilmədi.'),
      ),
    )
    renderCrud('/press-releases/4')
    expect(
      await within(await screen.findByRole('list', { name: 'Şəkillər və sənədlər' }))
        .findByText('placeholder-2.svg'),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'placeholder-2.svg faylını yuxarı köçür',
      }),
    )
    expect(await screen.findByText('Sıra qəbul edilmədi.')).toBeInTheDocument()
    expect(assetMediaIds(4)).toEqual([1, 2, 7, 3])
    expect(
      within(assetRow('placeholder-1.svg')).getByText('Örtük'),
    ).toBeInTheDocument()
  })
})
