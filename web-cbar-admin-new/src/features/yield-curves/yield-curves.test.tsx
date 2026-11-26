import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  type RouteComponent,
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

import { AppProviders } from '@/app/providers/app-providers'
import { registerModule } from '@/features/crud/model/module-registry'
import az from '@/locales/az/yieldCurves.json'
import en from '@/locales/en/yieldCurves.json'
import {
  YieldCurveParametersPage,
  YieldCurvePeriodsPage,
  YieldCurveYieldsPage,
} from '@/pages/yield-curves'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { listSearchSchema } from '@/shared/crud/schema'
import type { AnyRow, ModuleConfig } from '@/shared/crud/types'
import { i18n } from '@/shared/i18n'
import { importProblem } from '@/shared/testing/handlers/currency'
import {
  yieldCurvesHandlers,
  yieldCurvesStore,
} from '@/shared/testing/handlers/yield-curves'
import { server } from '@/shared/testing/server'
import {
  yieldCurveParametersModule,
  yieldCurvePeriodsModule,
  yieldCurveYieldsModule,
} from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const listRoute = <Row extends AnyRow, Path extends string>(
  config: ModuleConfig<Row, Path>,
  component: RouteComponent,
) =>
  createRoute({
    getParentRoute: () => layoutRoute,
    path: registerModule(config).basePath,
    validateSearch: listSearchSchema(config),
    component,
  })
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    listRoute(yieldCurveYieldsModule, YieldCurveYieldsPage),
    listRoute(yieldCurveParametersModule, YieldCurveParametersPage),
    listRoute(yieldCurvePeriodsModule, YieldCurvePeriodsPage),
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

const xlsx = (name: string) =>
  new NodeFile(['PK'], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }) as unknown as File

/** Göndərilən import sorğularının `overwrite` dəyərləri (app davranışı). */
function trackImports() {
  const overwrites: (string | null)[] = []
  const listener = ({ request }: { request: Request }) => {
    if (request.method !== 'POST') return
    void request
      .clone()
      .formData()
      .then((form) => overwrites.push(form.get('overwrite') as string | null))
  }
  server.events.on('request:start', listener)
  return overwrites
}

async function openImport(
  user: ReturnType<typeof userEvent.setup>,
  title: string,
) {
  await user.click(screen.getByRole('button', { name: 'Excel-dən yüklə' }))
  return screen.findByRole('dialog', { name: title })
}

/** Dialoqun tarixini `dd.MM.yyyy` ilə dəyişir. */
async function pickDate(
  user: ReturnType<typeof userEvent.setup>,
  dialog: HTMLElement,
  day: string,
) {
  const input = within(dialog).getByLabelText('Tarix', { exact: false })
  await user.clear(input)
  await user.type(input, day)
  await user.keyboard('{Escape}')
}

describe('Gəlirlik əyrisi — üç ayrı bölmə, Excel importu', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'yieldCurves', az, true, true)
    i18n.addResourceBundle('en', 'yieldCurves', en, true, true)
  })

  beforeEach(async () => {
    yieldCurvesStore.reset()
    server.use(...yieldCurvesHandlers)
    // jsdom-un FormData/File-ı MSW-nin Node Request-ində qəbul olunmur — məzənnə
    // importu testindəki kimi Node-un öz sinifləri.
    const form = await new Response('a=1', {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    }).formData()
    vi.stubGlobal('FormData', form.constructor)
    vi.stubGlobal('File', NodeFile)
  })

  afterEach(() => vi.unstubAllGlobals())

  it('əyri: tarixlər nöqtə sayı ilə, üç tab, əl ilə yaratma yoxdur; nöqtələr paneldə', async () => {
    const user = userEvent.setup()
    renderPage('/yield-curves')
    expect(
      await screen.findByRole('heading', { name: 'Gəlirlik əyrisi' }),
    ).toBeInTheDocument()
    for (const tab of ['Əyri', 'Parametrlər', 'Müddətlər'])
      expect(screen.getByRole('tab', { name: tab })).toBeInTheDocument()
    expect(await screen.findByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Yeni' })).toBeNull()

    await user.click(
      screen.getByRole('button', { name: '12.10.2026 tarixinin nöqtələrinə bax' }),
    )
    const sheet = await screen.findByRole('dialog', {
      name: '12.10.2026 — əyri nöqtələri',
    })
    expect(await within(sheet).findByText('90')).toBeInTheDocument()
    expect(within(sheet).getByText('6.87')).toBeInTheDocument()
  })

  it('əyri importu: yeni tarix dərhal yazılır, siyahı yenilənir', async () => {
    const user = userEvent.setup()
    renderPage('/yield-curves')
    await screen.findByText('3')

    const dialog = await openImport(user, 'Əyri nöqtələrini yüklə')
    await pickDate(user, dialog, '19.10.2026')
    await user.upload(
      within(dialog).getByLabelText('Excel faylı'),
      xlsx('yieldcurve_2026_10_19.xlsx'),
    )
    await user.click(within(dialog).getByRole('button', { name: 'Yüklə' }))

    expect(
      await screen.findByText('19.10.2026 tarixi üçün yükləndi'),
    ).toBeInTheDocument()
    expect(
      yieldCurvesStore.points().find((p) => p.curveDate === '2026-10-19')
        ?.points,
    ).toHaveLength(4)
    expect(await screen.findByText('4')).toBeInTheDocument()
  })

  it('müddətlər: data olan tarix → 409 → təsdiq → overwrite=true ilə tam əvəzlənir', async () => {
    const user = userEvent.setup()
    renderPage('/yield-curves/periods')
    expect(await screen.findByText('6.39')).toBeInTheDocument()
    yieldCurvesStore.periods()[0]!.sixMonth = 1
    const overwrites = trackImports()

    const dialog = await openImport(user, 'Müddətləri yüklə')
    await pickDate(user, dialog, '12.10.2026')
    await user.upload(
      within(dialog).getByLabelText('Excel faylı'),
      xlsx('muddetler_2026_10_12.xlsx'),
    )
    await user.click(within(dialog).getByRole('button', { name: 'Yüklə' }))

    expect(
      await within(dialog).findByText(
        '12.10.2026 tarixi üçün bu data artıq yüklənib. Fayldakı ilə tam əvəzlənsin?',
      ),
    ).toBeInTheDocument()
    expect(yieldCurvesStore.periods()[0]!.sixMonth).toBe(1)
    await user.click(within(dialog).getByRole('button', { name: 'Üstünə yaz' }))

    expect(
      await screen.findByText('12.10.2026 tarixi üçün yükləndi'),
    ).toBeInTheDocument()
    expect(yieldCurvesStore.periods()).toHaveLength(1)
    expect(yieldCurvesStore.periods()[0]!.sixMonth).toBe(6.39)
    await waitFor(() => expect(overwrites).toEqual([null, 'true']))
  })

  it('parametrlər: xana xətası mətnlə göstərilir, heç nə yazılmır; .xlsx olmayan fayl rədd edilir', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('/api/v1/yield-curves/parameters/import', () =>
        importProblem(400, 'invalid_value', 'Cell D2: λ is missing.', {
          row: 2,
          column: 'D',
        }),
      ),
    )
    renderPage('/yield-curves/parameters')
    expect(await screen.findByText('7.2654')).toBeInTheDocument()

    const dialog = await openImport(user, 'Parametrləri yüklə')
    await pickDate(user, dialog, '19.10.2026')
    await user.upload(
      within(dialog).getByLabelText('Excel faylı'),
      xlsx('parametrler_2026_10_19.xlsx'),
    )
    await user.click(within(dialog).getByRole('button', { name: 'Yüklə' }))
    expect(
      await within(dialog).findByText(
        'D2 xanası boşdur və ya düzgün rəqəm deyil',
      ),
    ).toBeInTheDocument()
    expect(yieldCurvesStore.parameters()).toHaveLength(1)

    server.resetHandlers(...yieldCurvesHandlers)
    await user.upload(
      within(dialog).getByLabelText('Excel faylı'),
      xlsx('parametrler.pdf'),
    )
    await user.click(within(dialog).getByRole('button', { name: 'Yüklə' }))
    expect(
      await within(dialog).findByText(
        'Yalnız .xlsx formatlı fayl yükləmək olar',
      ),
    ).toBeInTheDocument()
  })

  it('silmə yalnız həmin bölmənin həmin tarixini silir', async () => {
    const user = userEvent.setup()
    renderPage('/yield-curves/parameters')
    await screen.findByText('7.2654')

    await user.click(screen.getByRole('button', { name: 'Sil: 2026-10-12' }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Sil' }))

    expect(
      await screen.findByText('Parametrlər yüklənməyib'),
    ).toBeInTheDocument()
    expect(yieldCurvesStore.parameters()).toHaveLength(0)
    expect(
      yieldCurvesStore.points().some((p) => p.curveDate === '2026-10-12'),
    ).toBe(true)
    expect(yieldCurvesStore.periods()).toHaveLength(1)
  })
})
