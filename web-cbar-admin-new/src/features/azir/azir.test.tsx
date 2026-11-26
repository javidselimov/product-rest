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
import { HttpResponse, http } from 'msw'
// @ts-expect-error -- no Node types in the app tsconfig; only the test environment (multipart) needs it
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

import { AppProviders } from '@/app/providers/app-providers'
import { registerModule } from '@/features/crud/model/module-registry'
import { createCrudRoutes } from '@/features/crud/routes/create-crud-routes'
import az from '@/locales/az/azir.json'
import en from '@/locales/en/azir.json'
import { AzirPage } from '@/pages/azir'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import { AZIR_IMPORT_DATE } from '@/shared/testing/fixtures/azir'
import { azirHandlers, azirStore } from '@/shared/testing/handlers/azir'
import { importProblem } from '@/shared/testing/handlers/currency'
import { server } from '@/shared/testing/server'
import { azirService } from './api/azir.service'
import { azirModule } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(azirModule), {
      list: AzirPage,
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

const rowsFor = (valueDate: string, term: string) =>
  azirStore.store
    .all()
    .filter((r) => r.valueDate === valueDate && r.term === term)

describe('AZIR', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'azir', az, true, true)
    i18n.addResourceBundle('en', 'azir', en, true, true)
  })

  beforeEach(() => {
    azirStore.store.reset()
    server.use(...azirHandlers)
  })

  it('siyahı: sətirlər, müddət nişanı, yaratma/redaktə düymələri yoxdur', async () => {
    renderPage('/azir')
    expect(
      await screen.findByRole('heading', { name: 'AZIR' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('7.25')).toBeInTheDocument()
    expect(screen.getAllByText('1D').length).toBeGreaterThan(0)
    expect(
      screen.queryByRole('button', { name: 'Yeni' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Redaktə et:/ }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('7 qeyd · səhifə 1 / 1')).toBeInTheDocument()
  })

  it('eyni tarix + müddət iki dəfə saxlanır → bir sətir, dəyər yenilənir', async () => {
    const user = userEvent.setup()
    renderPage('/azir')
    await screen.findByText('7.25')

    const date = screen.getByLabelText('Tarix')
    await user.type(date, '05.02.2026')
    await user.keyboard('{Escape}')
    await user.type(screen.getByLabelText('Dəyər (%)'), '7.9')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    expect(
      await screen.findByText('AZIR dəyəri yadda saxlanıldı'),
    ).toBeInTheDocument()
    expect(await screen.findByText('7.9')).toBeInTheDocument()
    expect(rowsFor('2026-02-05', '1D')).toHaveLength(1)
    // Dəyər sahəsi sıfırlanır, tarix qalır
    expect(screen.getByLabelText('Dəyər (%)')).toHaveValue(null)
    expect(screen.getByLabelText('Tarix')).toHaveValue('05.02.2026')

    await user.type(screen.getByLabelText('Dəyər (%)'), '8.1')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    expect(await screen.findByText('8.1')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByText('7.9')).not.toBeInTheDocument(),
    )
    const rows = rowsFor('2026-02-05', '1D')
    expect(rows).toHaveLength(1)
    expect(rows[0].rate).toBe(8.1)
  })

  it('validasiya: tarix və dəyər boş → sorğu getmir, mesajlar görünür', async () => {
    const user = userEvent.setup()
    renderPage('/azir')
    await screen.findByText('7.25')
    const before = azirStore.store.all().length
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    expect(
      await screen.findByText('Tarix düzgün seçilməlidir'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Dəyər 0 ilə 10000 arasında, ən çox 4 onluq rəqəmli olmalıdır',
      ),
    ).toBeInTheDocument()
    expect(azirStore.store.all().length).toBe(before)
  })

  it('URL filtrləri sorğuya gedir: term və from', async () => {
    renderPage('/azir?term=30D')
    expect(await screen.findByText('7.45')).toBeInTheDocument()
    expect(screen.getByText('7.4')).toBeInTheDocument()
    expect(screen.queryByText('7.25')).not.toBeInTheDocument()
    expect(screen.getByText('2 qeyd · səhifə 1 / 1')).toBeInTheDocument()
  })

  it('URL from/to aralığı', async () => {
    renderPage('/azir?from=2026-02-03&to=2026-02-03')
    expect(await screen.findByText('7.3')).toBeInTheDocument()
    expect(screen.getByText('7.45')).toBeInTheDocument()
    expect(screen.queryByText('7.35')).not.toBeInTheDocument()
    expect(screen.queryByText('7.25')).not.toBeInTheDocument()
  })

  it('silmə dialoqu: ad göstərir, təsdiqdən sonra sətir yox olur', async () => {
    const user = userEvent.setup()
    renderPage('/azir')
    await screen.findByText('7.7')
    await user.click(screen.getByRole('button', { name: 'Sil: 2026-02-04 90D' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText(/"2026-02-04 90D" AZIR dəyəri silinsin/),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Sil' }))
    expect(await screen.findByText('Qeyd silindi')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByText('7.7')).not.toBeInTheDocument(),
    )
    expect(azirStore.store.get(7)).toBeNull()
  })

  describe('spec 021: əlavə sahələr', () => {
    const label = az.form
    const typeDate = async (
      user: ReturnType<typeof userEvent.setup>,
      value: string,
    ) => {
      await user.type(screen.getByLabelText(label.valueDate), value)
      await user.keyboard('{Escape}')
    }
    const reserveBox = () =>
      screen.getByRole('checkbox', { name: label.isReservePlan })
    const save = (user: ReturnType<typeof userEvent.setup>) =>
      user.click(screen.getByRole('button', { name: label.save }))

    it('siyahı: həcm, say, işarə, min/max sütunları; boş → —', async () => {
      renderPage('/azir')
      expect(await screen.findByText('250.5')).toBeInTheDocument()
      expect(screen.getByText('18')).toBeInTheDocument()
      expect(screen.getByText('6.9')).toBeInTheDocument()
      expect(screen.getByText('7.65')).toBeInTheDocument()
      expect(screen.getByText(az.badge.reserve)).toBeInTheDocument()
      expect(screen.getAllByText(az.badge.normal)).toHaveLength(6)
      expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    })

    it('tam saxlama → siyahıda həcm, say və işarə; uğurdan sonra yalnız tarix və müddət qalır', async () => {
      const user = userEvent.setup()
      renderPage('/azir')
      await screen.findByText('7.25')

      await typeDate(user, '05.02.2026')
      await user.type(screen.getByLabelText(label.rate), '7.9')
      await user.type(screen.getByLabelText(label.dealVolume), '312.75')
      await user.type(screen.getByLabelText(label.dealCount), '21')
      await user.type(screen.getByLabelText(label.minRate), '7.05')
      await user.type(screen.getByLabelText(label.maxRate), '8.15')
      await user.click(reserveBox())
      await save(user)

      expect(await screen.findByText(label.saved)).toBeInTheDocument()
      expect(await screen.findByText('312.75')).toBeInTheDocument()
      expect(screen.getByText('21')).toBeInTheDocument()
      expect(screen.getByText('8.15')).toBeInTheDocument()
      expect(screen.getAllByText(az.badge.reserve)).toHaveLength(2)
      const rows = rowsFor('2026-02-05', '1D')
      expect(rows).toHaveLength(1)
      expect(rows[0]).toMatchObject({
        rate: 7.9,
        dealVolume: 312.75,
        dealCount: 21,
        minRate: 7.05,
        maxRate: 8.15,
        isReservePlan: true,
      })

      expect(screen.getByLabelText(label.valueDate)).toHaveValue('05.02.2026')
      for (const name of [
        label.rate,
        label.dealVolume,
        label.dealCount,
        label.minRate,
        label.maxRate,
      ]) {
        expect(screen.getByLabelText(name)).toHaveValue(null)
      }
      expect(reserveBox()).not.toBeChecked()
    })

    it('yalnız tarix + dəyər → əlavə sahələr null, işarə false', async () => {
      const user = userEvent.setup()
      renderPage('/azir')
      await screen.findByText('7.25')
      await typeDate(user, '06.02.2026')
      await user.type(screen.getByLabelText(label.rate), '7.15')
      await save(user)
      expect(await screen.findByText('7.15')).toBeInTheDocument()
      expect(rowsFor('2026-02-06', '1D')[0]).toMatchObject({
        dealVolume: null,
        dealCount: null,
        minRate: null,
        maxRate: null,
        isReservePlan: false,
      })
    })

    it('"Formaya yüklə" kartı doldurur; işarəni götürüb eyni tarix + müddətlə saxlamaq sətri yeniləyir', async () => {
      const user = userEvent.setup()
      renderPage('/azir')
      await screen.findByText('7.3')

      await user.click(
        screen.getByRole('button', { name: 'Formaya yüklə: 2026-02-03 1D' }),
      )
      expect(screen.getByLabelText(label.valueDate)).toHaveValue('03.02.2026')
      expect(screen.getByLabelText(label.rate)).toHaveValue(7.3)
      expect(screen.getByLabelText(label.rate)).toHaveFocus()
      expect(screen.getByLabelText(label.dealVolume)).toHaveValue(180)
      expect(screen.getByLabelText(label.dealCount)).toHaveValue(12)
      expect(screen.getByLabelText(label.minRate)).toHaveValue(7.1)
      expect(screen.getByLabelText(label.maxRate)).toHaveValue(7.55)
      expect(reserveBox()).toBeChecked()

      await user.click(reserveBox())
      await save(user)
      expect(await screen.findByText(label.saved)).toBeInTheDocument()
      await waitFor(() =>
        expect(screen.queryByText(az.badge.reserve)).not.toBeInTheDocument(),
      )
      const rows = rowsFor('2026-02-03', '1D')
      expect(rows).toHaveLength(1)
      expect(rows[0]).toMatchObject({
        id: 4,
        rate: 7.3,
        dealVolume: 180,
        dealCount: 12,
        minRate: 7.1,
        maxRate: 7.55,
        isReservePlan: false,
      })
    })

    it('"Formaya yüklə" ingiliscə etiketlə', async () => {
      await i18n.changeLanguage('en')
      try {
        renderPage('/azir')
        expect(
          await screen.findByRole('button', {
            name: 'Load into form: 2026-02-02 1D',
          }),
        ).toBeInTheDocument()
      } finally {
        await i18n.changeLanguage('az')
      }
    })

    it('klient validasiyası: mənfi həcm, kəsr say, min > max, 3 onluq həcm → sorğu getmir', async () => {
      const user = userEvent.setup()
      renderPage('/azir')
      await screen.findByText('7.25')
      const before = azirStore.store.all().length

      await typeDate(user, '05.02.2026')
      await user.type(screen.getByLabelText(label.rate), '7.9')
      await user.type(screen.getByLabelText(label.dealVolume), '-5')
      await user.type(screen.getByLabelText(label.dealCount), '1.5')
      await user.type(screen.getByLabelText(label.minRate), '8')
      await user.type(screen.getByLabelText(label.maxRate), '7')
      await save(user)

      expect(
        await screen.findByText(az.validation.dealVolume),
      ).toBeInTheDocument()
      expect(screen.getByText(az.validation.dealCount)).toBeInTheDocument()
      expect(screen.getByText(az.validation.minLeMax)).toBeInTheDocument()

      await user.clear(screen.getByLabelText(label.dealVolume))
      await user.type(screen.getByLabelText(label.dealVolume), '1.234')
      await save(user)
      expect(
        await screen.findByText(az.validation.dealVolumeDecimals),
      ).toBeInTheDocument()
      expect(azirStore.store.all().length).toBe(before)
    })

    it('server fieldErrors → sahənin altında; sahəsiz xəta → alert', async () => {
      const user = userEvent.setup()
      const volumeError = 'Deal volume must be zero or positive.'
      server.use(
        http.post(azirStore.base, () =>
          HttpResponse.json(
            {
              type: 'urn:cbar:problem:validation',
              title: 'Validation failed.',
              status: 400,
              message: volumeError,
              errors: { dealVolume: [volumeError] },
            },
            {
              status: 400,
              headers: { 'Content-Type': 'application/problem+json' },
            },
          ),
        ),
      )
      renderPage('/azir')
      await screen.findByText('7.25')
      await typeDate(user, '05.02.2026')
      await user.type(screen.getByLabelText(label.rate), '7.9')
      await user.type(screen.getByLabelText(label.dealVolume), '5')
      await save(user)

      // Bir dəfə — sahənin altında, alert-də təkrarlanmır
      expect(await screen.findByText(volumeError)).toBeInTheDocument()
      expect(screen.getAllByText(volumeError)).toHaveLength(1)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()

      server.use(
        http.post(azirStore.base, () =>
          HttpResponse.json(
            { message: 'Value rejected by the database.' },
            { status: 400 },
          ),
        ),
      )
      await save(user)
      expect(
        await screen.findByText('Value rejected by the database.'),
      ).toBeInTheDocument()
    })

    it('MSW upsert 400: `errors` → AppError.fieldErrors', async () => {
      await expect(
        azirService.upsert({
          valueDate: '2026-02-05',
          term: '1D',
          rate: 7.9,
          dealVolume: -1,
          dealCount: 1.5,
          minRate: 8,
          maxRate: 7,
          isReservePlan: false,
        }),
      ).rejects.toMatchObject({
        status: 400,
        message: 'Deal volume must be zero or positive.',
        fieldErrors: {
          dealVolume: 'Deal volume must be zero or positive.',
          dealCount: expect.any(String),
          minRate: 'Minimum rate must not exceed maximum rate.',
        },
      })
    })
  })

  describe('spec 058: Excel importu', () => {
    const text = az.import
    const xlsx = (name: string) =>
      new NodeFile(['PK'], name, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }) as unknown as File

    /** The `overwrite` value of every import request the page sends. */
    function trackImports() {
      const overwrites: (string | null)[] = []
      server.events.on('request:start', ({ request }) => {
        if (request.method !== 'POST' || !request.url.endsWith('/azir/import'))
          return
        void request
          .clone()
          .formData()
          .then((form) => overwrites.push(form.get('overwrite') as string | null))
      })
      return overwrites
    }

    async function openImport(user: ReturnType<typeof userEvent.setup>) {
      await user.click(await screen.findByRole('button', { name: text.open }))
      return screen.findByRole('dialog', { name: text.title })
    }

    async function upload(
      user: ReturnType<typeof userEvent.setup>,
      dialog: HTMLElement,
      name = 'AZIR Website 2026-10-27.xlsx',
    ) {
      await user.upload(within(dialog).getByLabelText(text.file), xlsx(name))
      await user.click(within(dialog).getByRole('button', { name: text.submit }))
    }

    beforeEach(async () => {
      // jsdom's FormData/File are not accepted by MSW's Node Request — Node's own classes,
      // as in the yield curve and rate bulletin import tests.
      const form = await new Response('a=1', {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      }).formData()
      vi.stubGlobal('FormData', form.constructor)
      vi.stubGlobal('File', NodeFile)
    })

    afterEach(() => vi.unstubAllGlobals())

    it('yeni tarix: dörd müddət yazılır, xülasə və TFAI qeydi görünür, siyahı yenilənir', async () => {
      const user = userEvent.setup()
      renderPage('/azir')
      await screen.findByText('7.25')

      const dialog = await openImport(user)
      await upload(user, dialog)

      expect(
        await within(dialog).findByText('27.10.2026 tarixi üçün 4 dəyər yazıldı'),
      ).toBeInTheDocument()
      const summary = within(dialog).getByRole('table', {
        name: text.summary.caption,
      })
      for (const value of ['1D', '6.3048', '30D', '5.9748', '90D', '180D', '6.3484'])
        expect(within(summary).getByText(value)).toBeInTheDocument()
      expect(
        within(dialog).getByText('Sətir 10 «AZIR TFAI» — TFAI yazılmır'),
      ).toBeInTheDocument()
      expect(within(dialog).queryByText(text.converted)).not.toBeInTheDocument()
      expect(rowsFor(AZIR_IMPORT_DATE, '1D')[0]).toMatchObject({
        rate: 6.3048,
        dealVolume: 0,
        dealCount: 0,
        isReservePlan: true,
      })
      expect(rowsFor(AZIR_IMPORT_DATE, '180D')).toHaveLength(1)

      await user.click(within(dialog).getByRole('button', { name: text.close }))
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      )
      expect(await screen.findByText('6.3048')).toBeInTheDocument()
    })

    it('fayl seçilmədən "Yüklə" → sahə xətası, sorğu getmir', async () => {
      const user = userEvent.setup()
      const overwrites = trackImports()
      renderPage('/azir')
      await screen.findByText('7.25')

      const dialog = await openImport(user)
      await user.click(within(dialog).getByRole('button', { name: text.submit }))

      expect(
        await within(dialog).findByText(text.errors.file_required),
      ).toBeInTheDocument()
      expect(overwrites).toEqual([])
    })

    it('mövcud tarix: 409 → təsdiq; "Ləğv et" heç nə dəyişmir, "Əvəz et" overwrite ilə yazır və köhnə dəyəri göstərir', async () => {
      const user = userEvent.setup()
      azirStore.store.insert({
        id: azirStore.store.nextId(),
        valueDate: AZIR_IMPORT_DATE,
        term: '1D',
        rate: 6.2,
        dealVolume: 40,
        dealCount: 3,
        minRate: null,
        maxRate: null,
        isReservePlan: false,
        updatedAt: '2026-10-27T09:00:00+00:00',
      })
      const overwrites = trackImports()
      renderPage('/azir')
      await screen.findByText('7.25')

      const dialog = await openImport(user)
      await upload(user, dialog)
      const confirm =
        '27.10.2026 tarixi üçün bu müddətlərin dəyəri artıq var: 1D. Fayldakı dəyərlər onları əvəz edəcək.'
      expect(await within(dialog).findByText(confirm)).toBeInTheDocument()
      expect(rowsFor(AZIR_IMPORT_DATE, '30D')).toHaveLength(0)

      await user.click(within(dialog).getByRole('button', { name: 'Ləğv et' }))
      expect(within(dialog).queryByText(confirm)).not.toBeInTheDocument()
      expect(rowsFor(AZIR_IMPORT_DATE, '1D')[0].rate).toBe(6.2)

      await user.click(within(dialog).getByRole('button', { name: text.submit }))
      expect(await within(dialog).findByText(confirm)).toBeInTheDocument()
      await user.click(within(dialog).getByRole('button', { name: text.overwrite }))

      expect(
        await within(dialog).findByText('27.10.2026 tarixi üçün 4 dəyər yazıldı'),
      ).toBeInTheDocument()
      expect(within(dialog).getByText('Əvvəl: 6.2')).toBeInTheDocument()
      expect(within(dialog).getByText('Əvvəl: 40')).toBeInTheDocument()
      expect(rowsFor(AZIR_IMPORT_DATE, '1D')).toHaveLength(1)
      expect(rowsFor(AZIR_IMPORT_DATE, '1D')[0].rate).toBe(6.3048)
      await waitFor(() => expect(overwrites).toEqual([null, null, 'true']))
    })

    it('rədd: xana xətası sətir/sütunla, qeyri-müəyyən həcm, naməlum kod serverin mətni ilə, .xlsx olmayan fayl', async () => {
      const user = userEvent.setup()
      const respond = (code: string, message: string, extra = {}) =>
        server.use(
          http.post('/api/v1/azir/import', () =>
            importProblem(400, code, message, extra),
          ),
        )
      renderPage('/azir')
      await screen.findByText('7.25')
      const before = azirStore.store.all().length
      const dialog = await openImport(user)

      respond('unknown_index', 'Cell B8: unknown index "TF AZIR 60D".', {
        row: 8,
        column: 'B',
      })
      await upload(user, dialog)
      expect(
        await within(dialog).findByText('Sətir 8, sütun B: tanınmayan indeks adı'),
      ).toBeInTheDocument()

      respond('ambiguous_volume', 'Cell D5: the deal volume 250000 is neither…', {
        row: 5,
        column: 'D',
      })
      await upload(user, dialog)
      expect(
        await within(dialog).findByText(
          'Sətir 5, sütun D: həcmin vahidi aydın deyil (nə mln manat, nə manat)',
        ),
      ).toBeInTheDocument()

      respond('something_new', 'The server says no.')
      await upload(user, dialog)
      expect(
        await within(dialog).findByText('The server says no.'),
      ).toBeInTheDocument()

      server.resetHandlers(...azirHandlers)
      await upload(user, dialog, 'AZIR.pdf')
      expect(
        await within(dialog).findByText(text.errors.not_xlsx),
      ).toBeInTheDocument()
      expect(azirStore.store.all()).toHaveLength(before)
    })

    it('kartın müddət siyahısı: 1D, 30D, 90D, 180D; 30D yazılır', async () => {
      const user = userEvent.setup()
      renderPage('/azir')
      await screen.findByText('7.25')
      const card = screen.getByRole('form', { name: az.form.title })

      await user.click(
        within(card).getByRole('combobox', { name: az.form.term }),
      )
      const options = await screen.findAllByRole('option')
      expect(options.map((o) => o.textContent)).toEqual([
        '1D',
        '30D',
        '90D',
        '180D',
      ])
      await user.click(screen.getByRole('option', { name: '30D' }))

      await user.type(within(card).getByLabelText(az.form.valueDate), '05.02.2026')
      await user.keyboard('{Escape}')
      await user.type(within(card).getByLabelText(az.form.rate), '7.81')
      await user.click(within(card).getByRole('button', { name: az.form.save }))
      expect(await screen.findByText(az.form.saved)).toBeInTheDocument()
      expect(rowsFor('2026-02-05', '30D')[0].rate).toBe(7.81)
    })
  })
})
