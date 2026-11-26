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
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { registerModule } from '@/features/crud/model/module-registry'
import { createCrudRoutes } from '@/features/crud/routes/create-crud-routes'
import az from '@/locales/az/inflation.json'
import en from '@/locales/en/inflation.json'
import { InflationPage } from '@/pages/inflation'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import {
  inflationHandlers,
  inflationSettingsStore,
  inflationStore,
} from '@/shared/testing/handlers/inflation'
import { server } from '@/shared/testing/server'
import { inflationModule } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(inflationModule), {
      list: InflationPage,
    }),
  ]),
])

function renderPage(path: string) {
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

const rowsFor = (year: number, month: number, code: string) =>
  inflationStore.store
    .all()
    .filter(
      (r) => r.year === year && r.month === month && r.parameterCode === code,
    )

describe('İnflyasiya', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'inflation', az, true, true)
    i18n.addResourceBundle('en', 'inflation', en, true, true)
  })

  beforeEach(() => {
    inflationStore.store.reset()
    inflationSettingsStore.reset()
    server.use(...inflationHandlers)
  })

  it('siyahı: ay adı, parametr nişanı, səhifələmə yoxdur', async () => {
    renderPage('/inflation')
    expect(
      await screen.findByRole('heading', { name: 'İnflyasiya' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('5.6')).toBeInTheDocument()
    // Radix Select gizli native <option>-larda da ay adlarını saxlayır — yalnız cədvəl sayılır.
    const table = within(screen.getByRole('table'))
    expect(table.getAllByText('Noyabr').length).toBe(2)
    expect(table.getAllByText('İİQ (illik)').length).toBe(3)
    expect(table.getAllByText('Hədəf').length).toBe(3)
    expect(screen.queryByText(/qeyd · səhifə/)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Yeni' }),
    ).not.toBeInTheDocument()
  })

  it('eyni il + ay + parametr iki dəfə → bir sətir, dəyər yenilənir', async () => {
    const user = userEvent.setup()
    renderPage('/inflation')
    await screen.findByText('5.6')
    // Filtr kartında da "İl" etiketi var — yalnız upsert forması axtarılır.
    const card = within(
      screen.getByRole('form', { name: 'Parametr əlavə et / yenilə' }),
    )

    const year = card.getByLabelText('İl')
    await user.clear(year)
    await user.type(year, '2027')
    await user.type(card.getByLabelText('Dəyər'), '3.3')
    await user.click(card.getByRole('button', { name: 'Yadda saxla' }))
    expect(
      await screen.findByText('İnflyasiya parametri yadda saxlanıldı'),
    ).toBeInTheDocument()
    expect(await screen.findByText('3.3')).toBeInTheDocument()
    expect(rowsFor(2027, 1, 'cpi_yoy')).toHaveLength(1)
    expect(card.getByLabelText('Dəyər')).toHaveValue(null)
    expect(card.getByLabelText('İl')).toHaveValue(2027)

    await user.type(card.getByLabelText('Dəyər'), '3.8')
    await user.click(card.getByRole('button', { name: 'Yadda saxla' }))
    expect(await screen.findByText('3.8')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByText('3.3')).not.toBeInTheDocument(),
    )
    const rows = rowsFor(2027, 1, 'cpi_yoy')
    expect(rows).toHaveLength(1)
    expect(rows[0].value).toBe(3.8)
  })

  it('validasiya: il 4 rəqəm deyil, dəyər boş → sorğu getmir', async () => {
    const user = userEvent.setup()
    renderPage('/inflation')
    await screen.findByText('5.6')
    const before = inflationStore.store.all().length
    const card = within(
      screen.getByRole('form', { name: 'Parametr əlavə et / yenilə' }),
    )
    const year = card.getByLabelText('İl')
    await user.clear(year)
    await user.type(year, '20')
    await user.click(card.getByRole('button', { name: 'Yadda saxla' }))
    expect(
      await screen.findByText('İl 4 rəqəmdən ibarət olmalıdır'),
    ).toBeInTheDocument()
    expect(screen.getByText('Dəyər rəqəm olmalıdır')).toBeInTheDocument()
    expect(inflationStore.store.all().length).toBe(before)
  })

  it('URL il filtri sorğuya gedir', async () => {
    renderPage('/inflation?year=2026')
    expect(await screen.findByText('5.1')).toBeInTheDocument()
    expect(screen.queryByText('5.6')).not.toBeInTheDocument()
    expect(screen.queryByText('5.4')).not.toBeInTheDocument()
    expect(
      screen.getByLabelText('İl', { selector: '#inflation-year' }),
    ).toHaveValue(2026)
  })

  it('aylıq parametrlər: mövcud dəyərlər yüklənir, hədəf mətn kimi saxlanır', async () => {
    const user = userEvent.setup()
    renderPage('/inflation')
    const form = within(
      await screen.findByRole('form', {
        name: 'Aylıq inflyasiya parametrləri',
      }),
    )
    expect(form.getByLabelText('Cari inflyasiya')).toHaveValue(5.7)
    const target = form.getByLabelText('Hədəf inflyasiya')
    expect(target).toHaveValue('4 (±2)')

    await user.clear(target)
    await user.type(target, '3.5 (±1)')
    await user.click(form.getByRole('button', { name: 'Yadda saxla' }))
    expect(
      await screen.findByText('Aylıq inflyasiya parametrləri yadda saxlanıldı'),
    ).toBeInTheDocument()
    expect(inflationSettingsStore.get()).toMatchObject({
      currentInflation: 5.7,
      targetInflation: '3.5 (±1)',
      nextUpdateDate: '2026-08-16',
    })
  })

  it('aylıq parametrlər: heç saxlanmayıb (204) → boş forma, validasiya sorğunu saxlayır', async () => {
    inflationSettingsStore.set(null)
    const user = userEvent.setup()
    renderPage('/inflation')
    const form = within(
      await screen.findByRole('form', {
        name: 'Aylıq inflyasiya parametrləri',
      }),
    )
    expect(form.getByLabelText('Cari inflyasiya')).toHaveValue(null)
    await user.click(form.getByRole('button', { name: 'Yadda saxla' }))
    expect(
      await screen.findByText('Cari inflyasiya rəqəm olmalıdır'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Hədəf inflyasiya boş ola bilməz'),
    ).toBeInTheDocument()
    expect(screen.getByText('Tarix seçilməlidir')).toBeInTheDocument()
    expect(inflationSettingsStore.get()).toBeNull()
  })

  it('silmə dialoqu: ad göstərir, təsdiqdən sonra sətir yox olur', async () => {
    const user = userEvent.setup()
    renderPage('/inflation')
    await screen.findByText('5.4')
    await user.click(
      screen.getByRole('button', { name: 'Sil: 2025-12 cpi_yoy' }),
    )
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText(
        /"2025-12 cpi_yoy" inflyasiya parametri silinsin/,
      ),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Sil' }))
    expect(await screen.findByText('Qeyd silindi')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByText('5.4')).not.toBeInTheDocument(),
    )
    expect(inflationStore.store.get(3)).toBeNull()
  })
})
