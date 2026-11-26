import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from '@tanstack/react-router'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http } from 'msw'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod'

import { AppProviders } from '@/app/providers/app-providers'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { PAGE_FLAG_KEYS } from '@/features/pages/model/schemas'
import { countFeatures } from '@/features/rich-text/fixtures/legacy-content'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import az from '@/locales/az/pages.json'
import en from '@/locales/en/pages.json'
import { adminUser, makeAdminJwt } from '@/shared/testing/factories'
import { LEGACY_PAGE_HTML } from '@/shared/testing/fixtures/pages'
import { pagesHandlers, pagesStore } from '@/shared/testing/handlers/pages'
import { renderApp } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

// ProseMirror jsdom polyfill-ləri (rich-text-editor.test ilə eyni).
if (!Range.prototype.getClientRects) {
  Range.prototype.getClientRects = () =>
    ({
      length: 0,
      item: () => null,
      [Symbol.iterator]: [][Symbol.iterator],
    }) as unknown as DOMRectList
  Range.prototype.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    toJSON: () => ({}),
  })
}
if (!document.elementFromPoint) document.elementFromPoint = () => null

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'l',
  component: Outlet,
})
const listRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/pages',
  validateSearch: z.object({
    locale: z.enum(['az', 'en']).optional().catch(undefined),
  }),
  component: lazyRouteComponent(() => import('@/pages/pages'), 'PagesPage'),
})
const newRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/pages/new',
  validateSearch: z.object({
    parentId: z.number().int().optional().catch(undefined),
  }),
  component: lazyRouteComponent(() => import('@/pages/pages'), 'PageFormPage'),
})
const editRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/pages/$id',
  component: lazyRouteComponent(() => import('@/pages/pages'), 'PageFormPage'),
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([listRoute, newRoute, editRoute]),
])

function renderPages(path: string) {
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

/**
 * The tree row of the "Haqqımızda" root. Not its text: with the shell around the page the sidebar has a
 * "Haqqımızda" group too (spec 046).
 */
const TREE_ROOT_HANDLE = 'Sürükləyib sırala: Haqqımızda'

/** The tree starts collapsed — opens every node to reach the deep rows. */
async function expandAll(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByTitle(TREE_ROOT_HANDLE)
  let toggles = screen.queryAllByRole('button', { name: /^Aç: / })
  while (toggles.length > 0) {
    for (const toggle of toggles) await user.click(toggle)
    toggles = screen.queryAllByRole('button', { name: /^Aç: / })
  }
}

describe('səhifələr', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'pages', az, true, true)
    i18n.addResourceBundle('en', 'pages', en, true, true)
  })

  beforeEach(() => {
    pagesStore.reset()
    server.use(...pagesHandlers)
  })

  it('ağac render olunur, EN keçidi URL-ə düşür və boş başlıq "(başlıqsız)" olur', async () => {
    const user = userEvent.setup()
    const router = renderPages('/pages')
    expect(await screen.findByTitle(TREE_ROOT_HANDLE)).toBeInTheDocument()
    await expandAll(user)
    expect(screen.getByText('Sədrlər')).toBeInTheDocument()
    expect(screen.getByText('Qeyri-aktiv')).toBeInTheDocument()
    expect(screen.getByText('Gizli')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'EN' }))
    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({ locale: 'en' }),
    )
    expect(await screen.findByText('About us')).toBeInTheDocument()
    expect(screen.getByText('(başlıqsız)')).toBeInTheDocument()
  })

  it('ağac default yığılıdır; klik açır və yığır — nəsilləri gizlənir, özü qalır', async () => {
    const user = userEvent.setup()
    renderPages('/pages')
    await screen.findByTitle(TREE_ROOT_HANDLE)
    expect(screen.queryByText('Tarix')).not.toBeInTheDocument()

    const expand = screen.getByRole('button', { name: 'Aç: Haqqımızda' })
    expect(expand).toHaveAttribute('aria-expanded', 'false')
    await user.click(expand)
    expect(screen.getByText('Tarix')).toBeInTheDocument()
    // Uşaq öz alt ağacını ayrıca açır.
    expect(screen.queryByText('Sədrlər')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Aç: Tarix' }))
    expect(screen.getByText('Sədrlər')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Yığ: Haqqımızda' }))
    expect(screen.getByText('Haqqımızda')).toBeInTheDocument()
    expect(screen.queryByText('Tarix')).not.toBeInTheDocument()
    expect(screen.queryByText('Sədrlər')).not.toBeInTheDocument()
  })

  it('tutacaqla sürükləyib-buraxma qonşular arasında sıranı dəyişir', async () => {
    renderPages('/pages')
    await screen.findByTitle(TREE_ROOT_HANDLE)
    // Sırası kilidli səhifədə tutacaq yoxdur.
    expect(
      screen.queryByTitle('Sürükləyib sırala: Qanunvericilik'),
    ).not.toBeInTheDocument()

    const dataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      setData: () => undefined,
      getData: () => '',
    }
    const handle = screen.getByTitle('Sürükləyib sırala: Haqqımızda')
    const target = screen.getByText('Pul siyasəti').closest('tr')!
    fireEvent.dragStart(handle, { dataTransfer })
    // jsdom-da sətrin ölçüsü 0-dır → hədəfin sonrasına düşür.
    fireEvent.dragOver(target, { dataTransfer })
    fireEvent.drop(target, { dataTransfer })
    fireEvent.dragEnd(handle, { dataTransfer })

    expect(await screen.findByText('Sıra yeniləndi')).toBeInTheDocument()
    // [Pul siyasəti, Haqqımızda, Qanunvericilik] — boşluq yox idi, yenidən nömrələndi.
    expect(pagesStore.get(5)!.sortOrder).toBe(1)
    expect(pagesStore.get(1)!.sortOrder).toBe(2)
    expect(pagesStore.get(6)!.sortOrder).toBe(3)
    const roots = /^(Haqqımızda|Pul siyasəti|Qanunvericilik)$/
    await waitFor(() =>
      expect(screen.getAllByText(roots).map((el) => el.textContent)).toEqual([
        'Pul siyasəti',
        'Haqqımızda',
        'Qanunvericilik',
      ]),
    )
  })

  it('removable=false sətirdə Sil, hərəkətsiz sətirdə Köçür qeyri-aktivdir', async () => {
    renderPages('/pages')
    await screen.findByText('Qanunvericilik')
    expect(
      screen.getByRole('button', { name: 'Sil: Qanunvericilik' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Köçür: Qanunvericilik' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Sil: Haqqımızda' }),
    ).toBeEnabled()
  })

  it('uşaqlı silmədə say göstərilir və təsdiqdən sonra alt ağac silinir', async () => {
    const user = userEvent.setup()
    renderPages('/pages')
    await screen.findByTitle(TREE_ROOT_HANDLE)
    await user.click(screen.getByRole('button', { name: 'Sil: Haqqımızda' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText(/3 alt səhifəsi silinsin/),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Sil' }))
    await waitFor(() =>
      expect(screen.queryByText('Haqqımızda')).not.toBeInTheDocument(),
    )
    expect(pagesStore.get(3)).toBeNull()
  })

  it('köçürmə dialoqu: sıra ilə kökə köçürür (POST /move)', async () => {
    const user = userEvent.setup()
    renderPages('/pages')
    await expandAll(user)
    await user.click(screen.getByRole('button', { name: 'Köçür: Sədrlər' }))
    const dialog = await screen.findByRole('dialog')
    const sort = within(dialog).getByLabelText('Sıra')
    await user.clear(sort)
    await user.type(sort, '9')
    await user.click(within(dialog).getByRole('button', { name: 'Köçür' }))
    await waitFor(() => expect(pagesStore.get(3)?.sortOrder).toBe(9))
    expect(await screen.findByText('Səhifə köçürüldü')).toBeInTheDocument()
  })

  it('readonly səhifə formu məzmunu kilidləyir', async () => {
    renderPages('/pages/2')
    expect(
      await screen.findByText(/məzmun sahələri kilidlidir/),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Başlıq (AZ)')).toBeDisabled()
  })

  it('yeni səhifə: yalnız AZ → payload-da en yoxdur, flags tam, parentId search-dən', async () => {
    const user = userEvent.setup()
    const router = renderPages('/pages/new?parentId=5')
    await screen.findByRole('heading', { name: 'Yeni səhifə' })
    await user.type(screen.getByLabelText('Başlıq (AZ)'), 'Yeni bölmə')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/pages'))
    const created = pagesStore
      .all()
      .find((p) => p.translations.az?.title === 'Yeni bölmə')
    expect(created?.parentId).toBe(5)
    expect(Object.keys(created?.translations ?? {})).toEqual(['az'])
    expect(created?.translations.az.slug).toBe('yeni-bolme')
    // Every flag the form knows, spec 041 showInSideNav and spec 054 showInDropdownNav included.
    expect(Object.keys(created?.flags ?? {}).sort()).toEqual([...PAGE_FLAG_KEYS, 'showInDropdownNav'].sort())
    // A new page left on "Bütün menyularda" follows the left menu: no dropdown value is stored.
    expect(created?.flags.showInDropdownNav).toBeNull()
  })

  it('validasiya: başlıqsız saxlama sorğu göndərmir', async () => {
    const user = userEvent.setup()
    renderPages('/pages/new')
    await screen.findByRole('heading', { name: 'Yeni səhifə' })
    const before = pagesStore.all().length
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    expect(
      await screen.findByText('Başlıq ən azı bir dildə doldurulmalıdır'),
    ).toBeInTheDocument()
    expect(pagesStore.all().length).toBe(before)
  })

  it('legacy səhifə açılıb dəyişilmədən saxlananda struktur sayğacları eynidir (SC-003)', async () => {
    const user = userEvent.setup()
    const router = renderPages('/pages/5')
    expect(await screen.findByLabelText('Başlıq (AZ)')).toHaveValue(
      'Pul siyasəti',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/pages'))
    const saved = pagesStore.get(5)?.translations.az.content ?? ''
    expect(countFeatures(saved)).toEqual(countFeatures(LEGACY_PAGE_HTML))
    expect(saved).toContain('data-accordion')
    expect(saved).toContain('data-media-link')
  })

  it('sənədlər: sırala (tam siyahı), başlıq redaktə, ayır', async () => {
    const user = userEvent.setup()
    renderPages('/pages/1')
    await screen.findByText('İllik hesabat')
    await user.click(
      screen.getByRole('button', { name: 'İllik hesabat sənədini aşağı' }),
    )
    await waitFor(() =>
      expect(
        pagesStore.get(1)?.assets.find((a) => a.id === 11)?.sortOrder,
      ).toBe(2),
    )

    await user.click(
      screen.getByRole('button', {
        name: 'İllik hesabat başlıqlarını redaktə et',
      }),
    )
    const dialog = await screen.findByRole('dialog')
    const az = within(dialog).getByLabelText('Başlıq (AZ)')
    await user.clear(az)
    await user.type(az, 'Hesabat 2025')
    await user.click(
      within(dialog).getByRole('button', { name: 'Yadda saxla' }),
    )
    expect(await screen.findByText('Hesabat 2025')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Hesabat 2025 sənədini ayır' }),
    )
    const confirm = await screen.findByRole('alertdialog')
    await user.click(within(confirm).getByRole('button', { name: 'Ayır' }))
    await waitFor(() => expect(pagesStore.get(1)?.assets).toHaveLength(1))
  })
})

// Spec 004: real route ağacı + app shell (renderApp) — `renderPages`-in öz ağacı
// app shell-i və real route konfiqini yoxlamır.
describe('səhifələr — real route ağacında alt səhifə (spec 004)', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    pagesStore.reset()
    server.use(...pagesHandlers)
    useAuthStore
      .getState()
      .login(
        makeAdminJwt(),
        adminUser,
        new Date(Date.now() + 15 * 60_000).toISOString(),
      )
  })

  afterEach(() => useAuthStore.getState().logout())

  it('"Haqqımızda" + → forma açılır, saxlanan səhifə onun uşağıdır', async () => {
    const user = userEvent.setup()
    const router = renderApp('/pages')
    await user.click(
      await screen.findByRole('button', {
        name: 'Alt səhifə əlavə et: Haqqımızda',
      }),
    )
    await screen.findByRole('heading', { name: 'Yeni səhifə' })
    expect(router.state.location.pathname).toBe('/pages/new')
    expect(router.state.location.search).toMatchObject({ parentId: 1 })
    expect(screen.queryByText('Nəsə səhv getdi')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Başlıq (AZ)'), 'Yeni menyu bəndi')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/pages'))
    const created = pagesStore
      .all()
      .find((p) => p.translations.az?.title === 'Yeni menyu bəndi')
    expect(created?.parentId).toBe(1)
  })

  // Kök, 2-ci səviyyə (readonly valideyn), 3-cü səviyyə, başqa kök.
  it.each([
    ['Haqqımızda', 1],
    ['Tarix', 2],
    ['Sədrlər', 3],
    ['Pul siyasəti', 5],
  ])('"%s" + → uşaq həmin valideynə yazılır', async (title, parentId) => {
    const user = userEvent.setup()
    const router = renderApp('/pages')
    await expandAll(user)
    await user.click(
      await screen.findByRole('button', {
        name: `Alt səhifə əlavə et: ${title}`,
      }),
    )
    await screen.findByRole('heading', { name: 'Yeni səhifə' })
    // Valideynin readonly kilidi uşağa keçmir.
    expect(screen.queryByText(/məzmun sahələri kilidlidir/)).toBeNull()
    await user.type(screen.getByLabelText('Başlıq (AZ)'), `Uşaq ${parentId}`)
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/pages'))
    const created = pagesStore
      .all()
      .find((p) => p.translations.az?.title === `Uşaq ${parentId}`)
    expect(created?.parentId).toBe(parentId)
  })

  it('"Saytın menyusunda" kartı status, başlıq və dil bayrağına canlı reaksiya verir (US4)', async () => {
    const user = userEvent.setup()
    renderApp('/pages')
    await user.click(
      await screen.findByRole('button', {
        name: 'Alt səhifə əlavə et: Haqqımızda',
      }),
    )
    await screen.findByRole('heading', { name: 'Yeni səhifə' })
    const az = () => screen.getByTestId('menu-visibility-az')
    const en = () => screen.getByTestId('menu-visibility-en')

    // Default: qaralama, başlıqsız.
    await waitFor(() => expect(az()).toHaveTextContent(/«Dərc olunub» deyil/))
    expect(en()).toHaveTextContent(/«Dərc olunub» deyil/)

    await user.click(screen.getByRole('combobox', { name: 'Status' }))
    await user.click(await screen.findByRole('option', { name: 'Dərc olunub' }))
    await user.type(screen.getByLabelText('Başlıq (AZ)'), 'Menyu bəndi')
    await waitFor(() => expect(az()).toHaveTextContent('Görünəcək'))
    expect(en()).toHaveTextContent(/bu dildə başlıq yoxdur/)

    await user.click(screen.getByRole('checkbox', { name: 'AZ saytda göstər' }))
    await waitFor(() => expect(az()).toHaveTextContent(/bu dildə göstərilmir/))
  })

  it('3-cü səviyyənin altındakı səhifə menyu dərinliyini keçir (US4)', async () => {
    // Sədrlər (id 3, Haqqımızda → Tarix → Sədrlər) fixture-da qaralamadır və
    // onun uşağı api-cbar-da kökə qalxardı; dərinlik yoxlaması üçün dərc et.
    pagesStore.get(3)!.status = 'published'
    const user = userEvent.setup()
    renderApp('/pages')
    await expandAll(user)
    await user.click(
      await screen.findByRole('button', {
        name: 'Alt səhifə əlavə et: Sədrlər',
      }),
    )
    await screen.findByRole('heading', { name: 'Yeni səhifə' })
    await user.click(screen.getByRole('combobox', { name: 'Status' }))
    await user.click(await screen.findByRole('option', { name: 'Dərc olunub' }))
    await user.type(screen.getByLabelText('Başlıq (AZ)'), 'Dərin')
    await waitFor(() =>
      expect(screen.getByTestId('menu-visibility-az')).toHaveTextContent(
        /menyu yalnız 3 səviyyə göstərir/,
      ),
    )
  })

  describe('menyu yeri: sol menyu və açılan menyular (spec 041, spec 054)', () => {
    const side = (locale: 'az' | 'en' = 'az') =>
      screen.getByTestId(`menu-visibility-${locale}-side`)
    const top = (locale: 'az' | 'en' = 'az') =>
      screen.getByTestId(`menu-visibility-${locale}-top`)

    async function newChildOf(
      user: ReturnType<typeof userEvent.setup>,
      parent: string,
      title: string,
    ) {
      await user.click(
        await screen.findByRole('button', {
          name: `Alt səhifə əlavə et: ${parent}`,
        }),
      )
      await screen.findByRole('heading', { name: 'Yeni səhifə' })
      await user.click(screen.getByRole('combobox', { name: 'Status' }))
      await user.click(
        await screen.findByRole('option', { name: 'Dərc olunub' }),
      )
      await user.type(screen.getByLabelText('Başlıq (AZ)'), title)
    }

    it('yeni səhifədə "Bütün menyularda"-dır; "Menyularda yox" kartda hər iki menyunu gizli göstərir, saxlanır və ağacda nişan çıxır', async () => {
      const user = userEvent.setup()
      const router = renderApp('/pages')
      await newChildOf(user, 'Haqqımızda', 'Gizli bənd')

      expect(screen.getByRole('radio', { name: 'Bütün menyularda' })).toBeChecked()
      await waitFor(() => expect(side()).toHaveTextContent('Görünəcək'))

      await user.click(screen.getByRole('radio', { name: 'Menyularda yox' }))
      await waitFor(() =>
        expect(side()).toHaveTextContent(/sol menyuda göstərilmir/),
      )
      expect(side()).toHaveTextContent(
        'Səhifənin özü açıq olanda sol menyuda görünür.',
      )
      // The site's dropdown menus leave it out too, with no open-page note (spec 048).
      expect(top()).toHaveTextContent(/Görünməyəcək: açılan menyularda göstərilmir/)
      expect(top()).not.toHaveTextContent(/açıq olanda/)

      await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
      await waitFor(() => expect(router.state.location.pathname).toBe('/pages'))
      const created = pagesStore
        .all()
        .find((p) => p.translations.az?.title === 'Gizli bənd')
      expect(created?.flags.showInSideNav).toBe(false)
      // Equal to the left-menu flag it follows, so the API stores no dropdown value.
      expect(created?.flags.showInDropdownNav).toBeNull()

      await expandAll(user)
      const row = (await screen.findByText('Gizli bənd')).closest('tr')!
      expect(within(row).getByText('Sol menyuda gizli')).toBeInTheDocument()
    })

    it('valideyn sol menyuda gizlidirsə alt səhifə üçün səbəb göstərilir', async () => {
      pagesStore.get(2)!.flags.showInSideNav = false
      const user = userEvent.setup()
      renderApp('/pages')
      await expandAll(user)
      await newChildOf(user, 'Tarix', 'Uşaq bənd')

      await waitFor(() =>
        expect(side()).toHaveTextContent(/valideyn sol menyuda gizlidir/),
      )
      // The parent's dropdown flag is unset, so it follows its left-menu flag.
      expect(top()).toHaveTextContent(/valideyn açılan menyularda gizlidir/)
    })

    it('kök səhifə sol menyunun başlığıdır', async () => {
      const user = userEvent.setup()
      renderApp('/pages')
      await screen.findByTitle(TREE_ROOT_HANDLE)
      await user.click(screen.getByRole('button', { name: 'Yeni səhifə' }))
      await screen.findByRole('heading', { name: 'Yeni səhifə' })
      await user.click(screen.getByRole('combobox', { name: 'Status' }))
      await user.click(
        await screen.findByRole('option', { name: 'Dərc olunub' }),
      )
      await user.type(screen.getByLabelText('Başlıq (AZ)'), 'Kök')

      await waitFor(() =>
        expect(side()).toHaveTextContent(/bölmənin kökü/),
      )
      expect(top()).toHaveTextContent('Görünəcək')
    })

    it('"Menyuda görünür" söndürülübsə hər iki sətir görünməyəcək', async () => {
      const user = userEvent.setup()
      renderApp('/pages')
      await newChildOf(user, 'Haqqımızda', 'Heç yerdə')

      await user.click(screen.getByRole('checkbox', { name: 'Menyuda görünür' }))
      await waitFor(() => expect(top()).toHaveTextContent(/gizlidir/))
      expect(side()).toHaveTextContent(/gizlidir/)
      expect(side()).not.toHaveTextContent(/açıq olanda/)
    })

    it('bayrağı bilməyən saxlama dəyəri dəyişmir (R4)', async () => {
      pagesStore.get(2)!.flags.showInSideNav = false
      const user = userEvent.setup()
      renderApp('/pages/2')
      await screen.findByRole('heading', { name: /Səhifə: Tarix/ })
      expect(screen.getByRole('radio', { name: 'Menyularda yox' })).toBeChecked()
      await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
      await waitFor(() =>
        expect(pagesStore.get(2)?.flags.showInSideNav).toBe(false),
      )
      expect(pagesStore.get(2)?.flags.showInDropdownNav).toBeNull()
    })

    // contracts/admin-ux.md §3: each option is a pair of flags, and the panel sends both.
    // Each case starts from another option with a stored dropdown value, so the pick writes its own (the API
    // keeps an existing row).
    it.each([
      ['Yalnız açılan menyularda (sol menyuda yox)', { showInSideNav: true, showInDropdownNav: true }, false, true],
      ['Menyularda yox', { showInSideNav: false, showInDropdownNav: true }, false, false],
      ['Bütün menyularda', { showInSideNav: false, showInDropdownNav: true }, true, true],
    ] as const)('"%s" seçimi cütü saxlayır', async (option, stored, sideNav, dropdownNav) => {
      Object.assign(pagesStore.get(2)!.flags, stored)
      const user = userEvent.setup()
      const router = renderApp('/pages/2')
      await screen.findByRole('heading', { name: /Səhifə: Tarix/ })
      const radio = screen.getByRole('radio', { name: option })
      expect(radio).not.toBeChecked()
      await user.click(radio)
      expect(radio).toBeChecked()
      await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
      await waitFor(() => expect(router.state.location.pathname).toBe('/pages'))
      expect(pagesStore.get(2)?.flags).toMatchObject({ showInSideNav: sideNav, showInDropdownNav: dropdownNav })
    })

    it('"Yalnız açılan menyularda" kartda: üst menyuda görünür, sol menyuda yalnız özü açıq olanda', async () => {
      const user = userEvent.setup()
      renderApp('/pages/2')
      await screen.findByRole('heading', { name: /Səhifə: Tarix/ })
      await user.click(screen.getByRole('radio', { name: 'Yalnız açılan menyularda (sol menyuda yox)' }))
      await waitFor(() => expect(top()).toHaveTextContent('Görünəcək'))
      expect(side()).toHaveTextContent(/sol menyuda göstərilmir/)
      expect(side()).toHaveTextContent('Səhifənin özü açıq olanda sol menyuda görünür.')
    })

    it('bölmə kökündə "Yalnız açılan menyularda" deaktivdir və səbəbi yazılıb', async () => {
      renderApp('/pages/1')
      await screen.findByRole('heading', { name: /Səhifə: Haqqımızda/ })
      const radio = screen.getByRole('radio', { name: 'Yalnız açılan menyularda (sol menyuda yox)' })
      expect(radio).toBeDisabled()
      expect(radio).toHaveAccessibleDescription(/Bölmə kökü üçün bu seçim yoxdur/)
      expect(screen.getByRole('radio', { name: 'Bütün menyularda' })).toBeEnabled()
      expect(screen.getByRole('radiogroup', { name: 'Menyudakı yeri' })).toBeInTheDocument()
    })

    it('bölmə kökündə "Menyularda yox" yalnız geniş hamburger panelinə təsir edir və kart bunu yazır (spec 056)', async () => {
      const user = userEvent.setup()
      renderApp('/pages/1')
      await screen.findByRole('heading', { name: /Səhifə: Haqqımızda/ })
      const none = screen.getByRole('radio', { name: 'Menyularda yox' })
      expect(none).toHaveAccessibleDescription(/geniş ekranın hamburger panelində görünməyəcək/)
      expect(top()).not.toHaveTextContent(/hamburger/)

      await user.click(none)
      // A root keeps the nav bar, tablet and mobile menus and the footer: the top row stays "shown", with a note.
      await waitFor(() => expect(top()).toHaveTextContent('Geniş ekranın hamburger panelində görünməyəcək'))
      expect(top()).toHaveTextContent('Görünəcək')
      expect(top()).toHaveTextContent('ilk 9 bölmə zolaqda qalır')
      expect(top('en')).toHaveTextContent('Geniş ekranın hamburger panelində görünməyəcək')

      await user.click(screen.getByRole('radio', { name: 'Bütün menyularda' }))
      await waitFor(() => expect(top()).not.toHaveTextContent(/hamburger/))
    })

    it('alt səhifədə "Menyularda yox"un izahı və üst menyu sətri dəyişmir (spec 056)', async () => {
      const user = userEvent.setup()
      renderApp('/pages/2')
      await screen.findByRole('heading', { name: /Səhifə: Tarix/ })
      const none = screen.getByRole('radio', { name: 'Menyularda yox' })
      expect(none).toHaveAccessibleDescription(/Heç bir menyuda görünmür/)
      await user.click(none)
      await waitFor(() => expect(top()).toHaveTextContent(/açılan menyularda göstərilmir/))
      expect(top()).not.toHaveTextContent(/hamburger/)
    })

    it('saxlanmış "yalnız sol menyuda" cütü: heç bir seçim işarəli deyil, məlumat mətni var, saxlamada dəyişmir', async () => {
      Object.assign(pagesStore.get(2)!.flags, { showInSideNav: true, showInDropdownNav: false })
      const user = userEvent.setup()
      const router = renderApp('/pages/2')
      await screen.findByRole('heading', { name: /Səhifə: Tarix/ })
      expect(screen.getByText(/yalnız sol menyuda göstərilir \(köhnə ayar\)/)).toBeInTheDocument()
      for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked()
      expect(top()).toHaveTextContent(/açılan menyularda göstərilmir/)
      expect(side()).toHaveTextContent('Görünəcək')
      await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
      await waitFor(() => expect(router.state.location.pathname).toBe('/pages'))
      expect(pagesStore.get(2)?.flags).toMatchObject({ showInSideNav: true, showInDropdownNav: false })
    })
  })

  describe('menyu qrupu (spec 054)', () => {
    it('dil tabında yazılır, trim olunur; dəyişməyən en etiketi qalır', async () => {
      const about = pagesStore.get(1)!
      about.translations.en!.menuGroup = 'Payment systems'
      const user = userEvent.setup()
      const router = renderApp('/pages/1')
      await screen.findByRole('heading', { name: /Səhifə: Haqqımızda/ })
      expect(screen.getByLabelText('Menyu qrupu (EN)')).toHaveValue('Payment systems')
      expect(screen.getByLabelText('Menyu qrupu (AZ)')).toHaveAccessibleDescription(/Saytın yeni menyusunda görünəcək/)

      await user.type(screen.getByLabelText('Menyu qrupu (AZ)'), '  Ödəniş sistemləri ')
      await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
      await waitFor(() => expect(router.state.location.pathname).toBe('/pages'))
      expect(pagesStore.get(1)?.translations.az?.menuGroup).toBe('Ödəniş sistemləri')
      expect(pagesStore.get(1)?.translations.en?.menuGroup).toBe('Payment systems')
    })

    it('boşaldılan etiket silinir', async () => {
      pagesStore.get(1)!.translations.en!.menuGroup = 'Payment systems'
      const user = userEvent.setup()
      const router = renderApp('/pages/1')
      await screen.findByRole('heading', { name: /Səhifə: Haqqımızda/ })
      await user.clear(screen.getByLabelText('Menyu qrupu (EN)'))
      await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
      await waitFor(() => expect(router.state.location.pathname).toBe('/pages'))
      expect(pagesStore.get(1)?.translations.en?.menuGroup).toBeNull()
    })

    it('dəyişməyən etiket PUT-da göndərilmir (göndərilməyən = saxla), dəyişən göndərilir', async () => {
      pagesStore.get(1)!.translations.en!.menuGroup = 'Payment systems'
      let sent: { translations?: Record<string, { menuGroup?: string }> } | undefined
      server.use(
        http.put('/api/v1/pages/:id', async ({ request }) => {
          sent = (await request.clone().json()) as typeof sent
          // No response: the request goes on to the page handlers.
        }),
      )
      const user = userEvent.setup()
      const router = renderApp('/pages/1')
      await screen.findByRole('heading', { name: /Səhifə: Haqqımızda/ })
      await user.type(screen.getByLabelText('Menyu qrupu (AZ)'), 'Strategiyalar')
      await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
      await waitFor(() => expect(router.state.location.pathname).toBe('/pages'))
      expect(sent?.translations?.az?.menuGroup).toBe('Strategiyalar')
      expect(sent?.translations?.en).not.toHaveProperty('menuGroup')
    })
  })

  describe('"Bu səhifənin məzmunu" card (spec 046)', () => {
    const openWithSlug = async (slug: string) => {
      pagesStore.get(2)!.translations.az!.slug = slug
      const router = renderApp('/pages/2')
      await screen.findByRole('heading', { name: /Səhifə: Tarix/ })
      return router
    }

    it.each(['merkezi-banklarla-emekdasliq', 'merkezi-banklarla-emekdasliq-copy'])(
      'on %s names the section by its menu path and opens it',
      async (slug) => {
        const user = userEvent.setup()
        const router = await openWithSlug(slug)

        const card = screen.getByTestId('managed-section')
        expect(card).toHaveTextContent('Beynəlxalq əməkdaşlıq → Memorandumlar')
        await user.click(within(card).getByRole('link', { name: 'Memorandumlar bölməsini aç' }))
        await waitFor(() => expect(router.state.location.pathname).toBe('/memorandums'))
      },
    )

    it('explains the table rule on the membership page, without a link', async () => {
      await openWithSlug('beynelxalq-teskilatlarda-uzvluk')

      const card = screen.getByTestId('managed-section')
      expect(card).toHaveTextContent(/birinci cədvəldir/)
      expect(within(card).queryByRole('link')).toBeNull()
    })

    it('is not shown on an ordinary page', async () => {
      await openWithSlug('tarix')
      expect(screen.queryByTestId('managed-section')).toBeNull()
    })

    it('is not shown while a new page is being created', async () => {
      const user = userEvent.setup()
      renderApp('/pages')
      await screen.findByTitle(TREE_ROOT_HANDLE)
      await user.click(screen.getByRole('button', { name: 'Yeni səhifə' }))
      await screen.findByRole('heading', { name: 'Yeni səhifə' })
      expect(screen.queryByTestId('managed-section')).toBeNull()
    })

    it('on the FAQ page opens the "Sual-cavab" section (spec 051)', async () => {
      const user = userEvent.setup()
      const router = await openWithSlug('sual-cavab')

      const card = screen.getByTestId('managed-section')
      await user.click(within(card).getByRole('link', { name: 'Sual-cavab bölməsini aç' }))
      await waitFor(() => expect(router.state.location.pathname).toBe('/faq'))
    })

    it.each(['fincert', 'fincert-copy'])('on %s opens the "FinCERT" section (spec 053)', async (slug) => {
      const user = userEvent.setup()
      const router = await openWithSlug(slug)

      const card = screen.getByTestId('managed-section')
      expect(card).toHaveTextContent('FinCERT → FinCERT')
      await user.click(within(card).getByRole('link', { name: 'FinCERT bölməsini aç' }))
      await waitFor(() => expect(router.state.location.pathname).toBe('/fincert'))
    })

    it.each([
      ['bank-xidmetlerinden-istifade-uzre-sikayet-indeksi', 'bank-complaint-index'],
      ['avto-icbari-sigorta-uzre-sikayet-indeksi', 'insurance-complaint-index'],
      ['infoqrafika', 'infographics'],
    ])('on %s opens the monthly reports of its series (spec 052)', async (slug, series) => {
      const user = userEvent.setup()
      const router = await openWithSlug(slug)

      const card = screen.getByTestId('managed-section')
      expect(card).toHaveTextContent('İstehlakçı hüquqları → Aylıq hesabatlar')
      expect(card).toHaveTextContent(/metodologiya/)
      await user.click(within(card).getByRole('link', { name: 'Aylıq hesabatlar bölməsini aç' }))
      await waitFor(() => expect(router.state.location.pathname).toBe('/monthly-reports'))
      expect(router.state.location.search).toMatchObject({ series })
    })

    it.each(['isci-meqaleler-silsilesi', 'isci-meqaleler-silsilesi-copy'])(
      'on %s opens the working papers and marks them in the menu (spec 054)',
      async (slug) => {
        const user = userEvent.setup()
        const router = await openWithSlug(slug)

        const card = screen.getByTestId('managed-section')
        expect(card).toHaveTextContent('Nəşrlər və tədqiqatlar → İşçi məqalələri')
        const nav = screen.getByRole('navigation', { name: 'Əsas naviqasiya' })
        expect(await within(nav).findByRole('link', { name: 'İşçi məqalələri' })).toHaveAttribute('aria-current', 'page')
        expect(within(nav).getByRole('link', { name: 'Səhifələr' })).not.toHaveAttribute('aria-current')

        await user.click(within(card).getByRole('link', { name: 'İşçi məqalələri bölməsini aç' }))
        await waitFor(() => expect(router.state.location.pathname).toBe('/working-papers'))
      },
    )
  })

  describe('"Sual-cavab keçid kartı" (spec 051)', () => {
    it('lists the FAQ topics linked to the page and opens one', async () => {
      const user = userEvent.setup()
      const router = renderApp('/pages/5')

      const card = await screen.findByTestId('faq-page-links')
      await user.click(within(card).getByRole('link', { name: 'Pul siyasəti' }))
      await waitFor(() => expect(router.state.location.pathname).toBe('/faq/topics/1'))
    })

    it('is not shown on a page no topic links to', async () => {
      let answered = false
      server.use(
        http.get('/api/v1/faq/topics', () => {
          answered = true
        }),
      )
      renderApp('/pages/2')
      await screen.findByRole('heading', { name: /Səhifə: Tarix/ })
      await waitFor(() => expect(answered).toBe(true))
      expect(screen.queryByTestId('faq-page-links')).toBeNull()
    })
  })

  it('yuxarıdakı "Yeni səhifə" düyməsi kök səhifə yaradır', async () => {
    const user = userEvent.setup()
    const router = renderApp('/pages')
    await screen.findByTitle(TREE_ROOT_HANDLE)
    await user.click(screen.getByRole('button', { name: 'Yeni səhifə' }))
    await screen.findByRole('heading', { name: 'Yeni səhifə' })
    await user.type(screen.getByLabelText('Başlıq (AZ)'), 'Kök bölmə')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/pages'))
    const created = pagesStore
      .all()
      .find((p) => p.translations.az?.title === 'Kök bölmə')
    expect(created?.parentId).toBeNull()
  })
})
