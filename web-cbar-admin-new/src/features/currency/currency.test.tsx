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
// @ts-expect-error -- app tsconfig-də Node tipləri yoxdur; yalnız test mühiti (multipart) üçün
import { File as NodeFile } from 'node:buffer'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { z } from 'zod'

import { AppProviders } from '@/app/providers/app-providers'
import az from '@/locales/az/currency.json'
import en from '@/locales/en/currency.json'
import { CurrenciesPage } from '@/pages/currencies'
import { CurrencyRatesPage } from '@/pages/currency-rates'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { dateToDateString } from '@/shared/crud/date-io'
import { i18n } from '@/shared/i18n'
import {
  currencyHandlers,
  currencyStore,
  importProblem,
} from '@/shared/testing/handlers/currency'
import { message } from '@/shared/testing/handlers/lib/errors'
import { server } from '@/shared/testing/server'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const ratesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/currency-rates',
  validateSearch: z.object({ date: z.string().optional().catch(undefined) }),
  component: CurrencyRatesPage,
})
const currenciesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/currency-rates/currencies',
  component: CurrenciesPage,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([ratesRoute, currenciesRoute]),
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

/** Göndərilən PUT sorğularının yollarını toplayır (app davranışı — mock deyil). */
function trackPuts() {
  const paths: string[] = []
  const listener = ({ request }: { request: Request }) => {
    if (request.method === 'PUT') paths.push(new URL(request.url).pathname)
  }
  server.events.on('request:start', listener)
  return {
    paths,
    stop: () => server.events.removeListener('request:start', listener),
  }
}

describe('Məzənnələr', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'currency', az, true, true)
    i18n.addResourceBundle('en', 'currency', en, true, true)
  })

  beforeEach(() => {
    currencyStore.reset()
    server.use(...currencyHandlers)
  })

  afterEach(() => server.events.removeAllListeners())

  it('son vərəq yüklənir: tarix, sətirlər və məzənnə input-ları', async () => {
    renderPage('/currency-rates')
    expect(
      await screen.findByRole('heading', { name: 'Məzənnələr' }),
    ).toBeInTheDocument()
    expect(await screen.findByLabelText('USD məzənnəsi')).toHaveValue(1.7)
    expect(screen.getByRole('combobox', { name: 'Vərəq tarixi' })).toHaveValue(
      '15.01.2026',
    )
    expect(screen.getByText('Türk lirəsi')).toBeInTheDocument()
    expect(
      screen.queryByText('saxlanılmayıb', { exact: false }),
    ).not.toBeInTheDocument()
    // Yüklənmiş vərəqdə sətir silmək olmur
    expect(
      screen.queryByRole('button', { name: 'EUR sətrini sil' }),
    ).not.toBeInTheDocument()
  })

  it('yeni vərəq: USD dəyişir, EUR silinir, GBP əlavə olunur, təkrar və boş məzənnə xətası, PUT yalnız qalan kodlarla', async () => {
    const user = userEvent.setup()
    const router = renderPage('/currency-rates')
    await screen.findByLabelText('USD məzənnəsi')
    const today = dateToDateString(new Date())

    await user.click(screen.getByRole('button', { name: 'Yeni vərəq' }))
    expect(await screen.findByText(/saxlanılmayıb/)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Vərəq tarixi' })).toHaveValue(
      today.split('-').reverse().join('.'),
    )

    const usd = screen.getByLabelText('USD məzənnəsi')
    await user.clear(usd)
    await user.type(usd, '1.75')

    await user.click(screen.getByRole('button', { name: 'EUR sətrini sil' }))
    expect(screen.queryByLabelText('EUR məzənnəsi')).not.toBeInTheDocument()

    // Combobox: trigger → axtarış → seçim
    await user.click(screen.getByRole('combobox', { name: 'Valyuta əlavə et' }))
    await user.type(await screen.findByPlaceholderText('Kod və ya ad…'), 'GBP')
    await user.click(await screen.findByRole('option', { name: /GBP/ }))
    expect(await screen.findByLabelText('GBP məzənnəsi')).toHaveValue(null)

    // Eyni kod ikinci dəfə → xəta
    await user.click(screen.getByRole('combobox', { name: 'Valyuta əlavə et' }))
    await user.type(await screen.findByPlaceholderText('Kod və ya ad…'), 'GBP')
    await user.click(await screen.findByRole('option', { name: /GBP/ }))
    expect(await screen.findByText('GBP artıq vərəqdədir')).toBeInTheDocument()
    expect(screen.getAllByLabelText('GBP məzənnəsi')).toHaveLength(1)

    // Boş məzənnə → sətir xətası, sorğu getmir
    await user.click(screen.getByRole('button', { name: 'Vərəqi saxla' }))
    expect(
      await screen.findByText('Məzənnə boş ola bilməz'),
    ).toBeInTheDocument()
    expect(currencyStore.sheet(today)).toBeNull()

    await user.type(screen.getByLabelText('GBP məzənnəsi'), '2.15')
    await user.click(screen.getByRole('button', { name: 'Vərəqi saxla' }))
    expect(
      await screen.findByText('Vərəq yadda saxlanıldı'),
    ).toBeInTheDocument()
    expect(currencyStore.sheet(today)).toEqual({
      USD: 1.75,
      RUB: 2.1234,
      TRY: 0.0512,
      GBP: 2.15,
    })
    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({ date: today }),
    )
    await waitFor(() =>
      expect(screen.queryByText(/saxlanılmayıb/)).not.toBeInTheDocument(),
    )
  })

  it('tarixlər paneli 3 tarixi göstərir, klik həmin vərəqi yükləyir', async () => {
    const user = userEvent.setup()
    const router = renderPage('/currency-rates')
    await screen.findByLabelText('USD məzənnəsi')
    await user.click(screen.getByRole('button', { name: 'Tarixlər' }))
    const panel = await screen.findByRole('dialog')
    expect(await within(panel).findByText('15.01.2026')).toBeInTheDocument()
    expect(within(panel).getByText('14.01.2026')).toBeInTheDocument()
    expect(within(panel).getByText('13.01.2026')).toBeInTheDocument()
    await user.click(within(panel).getByText('13.01.2026'))
    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({
        date: '2026-01-13',
      }),
    )
    expect(await screen.findByLabelText('EUR məzənnəsi')).toHaveValue(1.9401)
    await waitFor(() =>
      expect(screen.queryByLabelText('RUB məzənnəsi')).not.toBeInTheDocument(),
    )
  })

  it('vərəqi sil: dialoq, təsdiq → son vərəqə qayıdış', async () => {
    const user = userEvent.setup()
    renderPage('/currency-rates?date=2026-01-14')
    expect(await screen.findByLabelText('RUB məzənnəsi')).toHaveValue(2.1102)
    await user.click(screen.getByRole('button', { name: 'Vərəqi sil' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/14.01.2026/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Sil' }))
    expect(await screen.findByText('Vərəq silindi')).toBeInTheDocument()
    expect(currencyStore.sheet('2026-01-14')).toBeNull()
    await waitFor(() =>
      expect(
        screen.getByRole('combobox', { name: 'Vərəq tarixi' }),
      ).toHaveValue('15.01.2026'),
    )
  })

  it('valyuta grid: 3 sətir dəyişir → "(3)" → 3 PUT → dirty təmizlənir', async () => {
    const user = userEvent.setup()
    renderPage('/currency-rates/currencies')
    expect(
      await screen.findByRole('heading', { name: 'Valyutalar' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/3 valyuta ana səhifədə/),
    ).toBeInTheDocument()
    const save = screen.getByRole('button', { name: 'Dəyişiklikləri saxla' })
    expect(save).toBeDisabled()

    await user.click(screen.getByRole('switch', { name: 'GBP ana səhifədə' }))
    await user.click(screen.getByRole('switch', { name: 'JPY aktivliyi' }))
    const sort = screen.getByRole('spinbutton', { name: 'CNY sırası' })
    await user.clear(sort)
    await user.type(sort, '9')

    expect(screen.getByText(/4 valyuta ana səhifədə/)).toBeInTheDocument()
    const saveWithCount = screen.getByRole('button', {
      name: 'Dəyişiklikləri saxla (3)',
    })
    const puts = trackPuts()
    await user.click(saveWithCount)
    expect(
      await screen.findByText('Valyuta dəyişiklikləri yadda saxlanıldı'),
    ).toBeInTheDocument()
    puts.stop()
    expect(puts.paths).toEqual([
      '/api/v1/currencies/GBP',
      '/api/v1/currencies/JPY',
      '/api/v1/currencies/CNY',
    ])
    expect(currencyStore.currency('GBP')?.showOnHomepage).toBe(true)
    expect(currencyStore.currency('JPY')?.isActive).toBe(true)
    expect(currencyStore.currency('CNY')?.sortOrder).toBe(9)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Dəyişiklikləri saxla' }),
      ).toBeDisabled(),
    )
  })

  it('valyuta grid: uğursuz PUT dirty qalır, xəta toast-da', async () => {
    server.use(
      http.put('/api/v1/currencies/JPY', () =>
        message(404, "Unknown currency 'JPY'."),
      ),
    )
    const user = userEvent.setup()
    renderPage('/currency-rates/currencies')
    await screen.findByRole('switch', { name: 'JPY aktivliyi' })
    await user.click(screen.getByRole('switch', { name: 'JPY aktivliyi' }))
    await user.click(screen.getByRole('switch', { name: 'TRY ana səhifədə' }))
    await user.click(
      screen.getByRole('button', { name: 'Dəyişiklikləri saxla (2)' }),
    )
    expect(
      await screen.findByText("JPY: Unknown currency 'JPY'."),
    ).toBeInTheDocument()
    expect(currencyStore.currency('TRY')?.showOnHomepage).toBe(true)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Dəyişiklikləri saxla (1)' }),
      ).toBeEnabled(),
    )
  })

  describe('bülleten importu (spec 025)', () => {
    const IMPORT_TITLE = 'Bülleteni yüklə'
    const bulletin = (name = 'Resmi Mezenne 13 10 2026.xlsx') =>
      new NodeFile(['PK'], name, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }) as unknown as File

    // jsdom-un FormData/File-ı MSW-nin Node Request-ində qəbul olunmur — media
    // kitabxanası testindəki kimi Node-un öz sinifləri.
    beforeEach(async () => {
      const form = await new Response('a=1', {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      }).formData()
      vi.stubGlobal('FormData', form.constructor)
      vi.stubGlobal('File', NodeFile)
    })

    afterEach(() => vi.unstubAllGlobals())

    /** Göndərilən import sorğularının `overwrite` dəyərləri (app davranışı). */
    function trackImports() {
      const overwrites: (string | null)[] = []
      const listener = ({ request }: { request: Request }) => {
        if (request.method !== 'POST') return
        void request
          .clone()
          .formData()
          .then((form) =>
            overwrites.push(form.get('overwrite') as string | null),
          )
      }
      server.events.on('request:start', listener)
      return overwrites
    }

    async function openImport(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('button', { name: 'Excel-dən yüklə' }))
      return screen.findByRole('dialog', { name: IMPORT_TITLE })
    }

    it('boş tarixə import: tanınan kodlar yazılır, ötürülənlər toast-da, sonra əl ilə düzəliş', async () => {
      const user = userEvent.setup()
      renderPage('/currency-rates?date=2026-01-20')
      expect(
        await screen.findByText('Bu tarix üçün məzənnə yoxdur'),
      ).toBeInTheDocument()

      const dialog = await openImport(user)
      await user.upload(
        within(dialog).getByLabelText('Bülleten faylı'),
        bulletin(),
      )
      expect(
        within(dialog).getByText('Resmi Mezenne 13 10 2026.xlsx'),
      ).toBeInTheDocument()
      await user.click(within(dialog).getByRole('button', { name: 'Yüklə' }))

      expect(
        await screen.findByText('5 valyutanın məzənnəsi yazıldı'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Tanınmayan kodlar ötürüldü: SDR, XAU'),
      ).toBeInTheDocument()
      expect(currencyStore.sheet('2026-01-20')).toEqual({
        USD: 1.7,
        EUR: 1.8992,
        GBP: 2.2468,
        RUB: 2.0276,
        TRY: 0.0344,
      })
      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: IMPORT_TITLE }),
        ).not.toBeInTheDocument(),
      )

      // US2: import olunmuş vərəq adi redaktorda düzəldilir
      const usd = await screen.findByLabelText('USD məzənnəsi')
      expect(usd).toHaveValue(1.7)
      await user.clear(usd)
      await user.type(usd, '1.7001')
      await user.click(screen.getByRole('button', { name: 'Vərəqi saxla' }))
      expect(
        await screen.findByText('Vərəq yadda saxlanıldı'),
      ).toBeInTheDocument()
      expect(currencyStore.sheet('2026-01-20')).toMatchObject({
        USD: 1.7001,
        EUR: 1.8992,
      })
    })

    it('məzənnəsi olan tarix: 409 → təsdiq → overwrite=true ilə təkrar', async () => {
      const user = userEvent.setup()
      renderPage('/currency-rates')
      await screen.findByLabelText('USD məzənnəsi')
      const before = structuredClone(currencyStore.sheet('2026-01-15'))
      const overwrites = trackImports()

      const dialog = await openImport(user)
      await user.upload(
        within(dialog).getByLabelText('Bülleten faylı'),
        bulletin(),
      )
      await user.click(within(dialog).getByRole('button', { name: 'Yüklə' }))

      expect(
        await within(dialog).findByText(
          /15\.01\.2026 tarixi üçün artıq \d+ məzənnə var/,
        ),
      ).toBeInTheDocument()
      expect(currencyStore.sheet('2026-01-15')).toEqual(before)

      await user.click(
        within(dialog).getByRole('button', { name: 'Üstünə yaz' }),
      )
      expect(
        await screen.findByText('5 valyutanın məzənnəsi yazıldı'),
      ).toBeInTheDocument()
      expect(currencyStore.sheet('2026-01-15')).toMatchObject({ EUR: 1.8992 })
      await waitFor(() => expect(overwrites).toEqual([null, 'true']))
    })

    it('tarix və ya fayl yoxdursa sorğu getmir', async () => {
      const user = userEvent.setup()
      renderPage('/currency-rates?date=2026-01-20')
      await screen.findByText('Bu tarix üçün məzənnə yoxdur')
      const overwrites = trackImports()

      const dialog = await openImport(user)
      await user.click(within(dialog).getByRole('button', { name: 'Yüklə' }))
      expect(await within(dialog).findByText('Fayl seçin')).toBeInTheDocument()
      expect(overwrites).toEqual([])
      expect(currencyStore.sheet('2026-01-20')).toBeNull()
    })

    it('rədd olunan fayl: sətir/kod və format mesajı, dialoq açıq qalır', async () => {
      server.use(
        http.post('/api/v1/currency-rates/import', () =>
          importProblem(
            400,
            'invalid_rate',
            'Row 8: the rate for EUR is missing or not a positive number.',
            {
              row: 8,
              currency: 'EUR',
            },
          ),
        ),
      )
      const user = userEvent.setup()
      renderPage('/currency-rates?date=2026-01-20')
      await screen.findByText('Bu tarix üçün məzənnə yoxdur')

      const dialog = await openImport(user)
      await user.upload(
        within(dialog).getByLabelText('Bülleten faylı'),
        bulletin(),
      )
      await user.click(within(dialog).getByRole('button', { name: 'Yüklə' }))
      expect(
        await within(dialog).findByText(
          'Sətir 8, EUR: məzənnə boşdur və ya müsbət rəqəm deyil',
        ),
      ).toBeInTheDocument()

      server.use(
        http.post('/api/v1/currency-rates/import', () =>
          importProblem(400, 'not_xlsx', 'Only .xlsx files can be imported.'),
        ),
      )
      await user.upload(
        within(dialog).getByLabelText('Bülleten faylı'),
        bulletin('rates.pdf'),
      )
      await user.click(within(dialog).getByRole('button', { name: 'Yüklə' }))
      expect(
        await within(dialog).findByText(
          'Yalnız .xlsx formatlı bülleten yükləmək olar',
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('dialog', { name: IMPORT_TITLE }),
      ).toBeInTheDocument()
      expect(currencyStore.sheet('2026-01-20')).toBeNull()
    })
  })
})
