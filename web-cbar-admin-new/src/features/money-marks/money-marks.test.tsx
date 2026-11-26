/**
 * Pul nişanları modulları — test-lokal route tree ilə real istifadəçi axını
 * (crud-engine.test.tsx naxışı). Nişanlar səhifəsi kateqoriya lookup-u ilə
 * qapılıdır (`pages/money-marks`), kateqoriya/xəbər registry route-larıdır.
 */

import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { registerModule } from '@/features/crud/model/module-registry'
import { createCrudRoutes } from '@/features/crud/routes/create-crud-routes'
import azMoneyMarks from '@/locales/az/moneyMarks.json'
import enMoneyMarks from '@/locales/en/moneyMarks.json'
import { MoneyMarksFormPage, MoneyMarksPage } from '@/pages/money-marks'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import {
  moneyMarkCategoriesStore,
  moneyMarkNewsStore,
  moneyMarksHandlers,
  moneyMarksStore,
} from '@/shared/testing/handlers/money-marks'
import { server } from '@/shared/testing/server'
import {
  moneyMarkCategoriesModule,
  moneyMarkNewsModule,
  moneyMarksModuleBase,
} from './model/modules'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(moneyMarksModuleBase), {
      list: MoneyMarksPage,
      form: MoneyMarksFormPage,
    }),
    ...createCrudRoutes(layoutRoute, registerModule(moneyMarkCategoriesModule)),
    ...createCrudRoutes(layoutRoute, registerModule(moneyMarkNewsModule)),
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

describe('Pul nişanları modulları', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'moneyMarks', azMoneyMarks, true, true)
    i18n.addResourceBundle('en', 'moneyMarks', enMoneyMarks, true, true)

    // jsdom-da olmayan Range ölçmə API-ləri — ProseMirror (richtext sahəsi) çağırır.
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
    moneyMarksStore.store.reset()
    moneyMarkCategoriesStore.store.reset()
    moneyMarkNewsStore.store.reset()
    // resetHandlers() setup.ts-də hər testdən sonra çağırılır — handler-ləri yenidən əlavə et.
    server.use(...moneyMarksHandlers)
  })

  it('siyahı: düz başlıq, tip nişanı, kateqoriya adı lookup-dan, səhifələmə xülasəsi', async () => {
    renderCrud('/money-marks')
    expect(
      await screen.findByRole('heading', { name: 'Pul nişanları' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('1 manat əskinası')).toBeInTheDocument()
    expect(screen.getByText('Novruz xatirə sikkəsi')).toBeInTheDocument()
    expect(screen.getAllByText('Əskinas').length).toBe(2)
    expect(screen.getAllByText('Sikkə').length).toBe(2)
    // Kateqoriya sütunu lookup seçimlərindən həll olunur.
    expect(screen.getAllByText('Dövriyyədə olan nişanlar').length).toBe(3)
    expect(screen.getByText('Xatirə sikkələri')).toBeInTheDocument()
    expect(screen.getByText('4 qeyd · səhifə 1 / 1')).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'Kateqoriyalar' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Xəbərlər' })).toBeInTheDocument()
  })

  it('URL-dəki type filtri sorğuya gedir (type=2 → yalnız sikkələr)', async () => {
    renderCrud('/money-marks?type=2')
    expect(await screen.findByText('50 qəpik sikkəsi')).toBeInTheDocument()
    expect(screen.getByText('Novruz xatirə sikkəsi')).toBeInTheDocument()
    expect(screen.queryByText('1 manat əskinası')).not.toBeInTheDocument()
    expect(screen.getByText('2 qeyd · səhifə 1 / 1')).toBeInTheDocument()
  })

  it('forma: kateqoriya seçimi lookup-dan, iki media sahəsi, redaktorlar; AZ başlıqla yaradılır', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/money-marks/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni pul nişanı' }),
    ).toBeInTheDocument()

    // Kateqoriya select-i lookup-dan doldurulub; məcburi olduğundan ilk seçim defaultdur.
    const category = screen.getByRole('combobox', { name: 'Kateqoriya' })
    expect(category).toHaveTextContent('Dövriyyədə olan nişanlar')

    // Ön və arxa şəkil — iki ayrı media sahəsi.
    expect(screen.getByText('Ön şəkil')).toBeInTheDocument()
    expect(screen.getByText('Arxa şəkil')).toBeInTheDocument()
    expect(screen.getAllByText('Fayl seçilməyib')).toHaveLength(2)

    // Təsvir və mühafizə elementləri richtext — lazy redaktor alət paneli.
    expect(
      await screen.findAllByRole(
        'button',
        { name: 'Qalın' },
        { timeout: 10_000 },
      ),
    ).not.toHaveLength(0)

    await user.type(
      screen.getByLabelText('Başlıq (AZ)', { exact: false }),
      '10 manat əskinası',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/money-marks'),
    )
    const created = moneyMarksStore.store
      .all()
      .find((r) => r.translations.az?.title === '10 manat əskinası')
    expect(created).toBeDefined()
    expect(created?.categoryId).toBe(1)
    expect(created?.type).toBe(1)
    expect(created?.status).toBe('draft')
    expect(created?.frontMediaId).toBeNull()
    expect(created?.rearMediaId).toBeNull()
    expect(created?.translations.en).toBeUndefined()
    expect(await screen.findByText('10 manat əskinası')).toBeInTheDocument()
    // Dörd lazy redaktor (2 sahə × 2 dil) + yazma — yüklənmə altında 5 s kifayət etmir.
  }, 20_000)

  it('kateqoriyalar: bare array siyahı, ad tərcümədən', async () => {
    renderCrud('/money-marks/categories')
    expect(
      await screen.findByRole('heading', { name: 'Kateqoriyalar' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Xatirə sikkələri')).toBeInTheDocument()
    expect(screen.getByText('Arxiv nişanları')).toBeInTheDocument()
    expect(screen.getByText('Qeyri-aktiv')).toBeInTheDocument()
    expect(screen.queryByText(/qeyd · səhifə/)).not.toBeInTheDocument()
  })

  it('xəbər yaratma: yalnız AZ başlıq → qaralama, siyahıda görünür', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/money-marks/news/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni xəbər' }),
    ).toBeInTheDocument()
    await user.type(
      screen.getByLabelText('Başlıq (AZ)', { exact: false }),
      'Yeni sikkə seriyası təqdim olundu',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/money-marks/news'),
    )
    const created = moneyMarkNewsStore.store
      .all()
      .find(
        (r) => r.translations.az?.title === 'Yeni sikkə seriyası təqdim olundu',
      )
    expect(created).toBeDefined()
    expect(created?.status).toBe('draft')
    expect(created?.publishedAt).toBeNull()
    expect(created?.translations.en).toBeUndefined()
    expect(
      await screen.findByText('Yeni sikkə seriyası təqdim olundu'),
    ).toBeInTheDocument()
    expect(screen.getByText('3 qeyd · səhifə 1 / 1')).toBeInTheDocument()
    // Məzmun richtext sahəsi lazy redaktoru yükləyir — yüklənmə altında 5 s kifayət etmir.
  }, 20_000)

  it('xəbərlər: URL-dəki status filtri (status=draft) və axtarış', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/money-marks/news?status=draft')
    expect(
      await screen.findByText('Xatirə sikkəsi sərgisi'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/200 manat/)).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Axtar'), 'sərgi')
    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({
        search: 'sərgi',
        status: 'draft',
      }),
    )
    expect(
      await screen.findByText('Xatirə sikkəsi sərgisi'),
    ).toBeInTheDocument()
  })
})
