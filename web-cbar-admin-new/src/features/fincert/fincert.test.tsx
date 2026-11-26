/**
 * "FinCERT" in the panel (spec 053 US2): the general form, the directions and the memberships through the real routes
 * and MSW stores — loaded values, the e-mail rule, the `PUT` body, server field errors under the field, leaving unsaved
 * changes, the list with its language badges, the title/text pair rule, ordering, and the image-only logo.
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
import { HttpResponse, http } from 'msw'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { registerModule } from '@/features/crud/model/module-registry'
import { createCrudRoutes } from '@/features/crud/routes/create-crud-routes'
import { FincertDirectionsPage, FincertMembershipsPage, FincertSettingsPage } from '@/pages/fincert'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import {
  FINCERT_EMAIL_INVALID,
  fincertDirectionsStore,
  fincertHandlers,
  fincertSettingsStore,
  resetFincertMocks,
} from '@/shared/testing/handlers/fincert'
import { server } from '@/shared/testing/server'
import { FINCERT_PATH } from './model/constants'
import { fincertDirectionsModule, fincertMembershipsModule } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({ getParentRoute: () => rootRoute, id: 'test-layout', component: Outlet })
const settingsRoute = createRoute({ getParentRoute: () => layoutRoute, path: FINCERT_PATH, component: FincertSettingsPage })
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    settingsRoute,
    ...createCrudRoutes(layoutRoute, registerModule(fincertDirectionsModule), { list: FincertDirectionsPage }),
    ...createCrudRoutes(layoutRoute, registerModule(fincertMembershipsModule), { list: FincertMembershipsPage }),
  ]),
])

function renderFincert(path: string) {
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) })
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return router
}

// jsdom has no pointer capture, scrollIntoView or Range measuring; the kit Select and ProseMirror call them.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {}

function spyWriteBodies(method: 'post' | 'put', base: string) {
  const seen: Record<string, unknown>[] = []
  server.use(
    http[method](`${base}*`, async ({ request }) => {
      seen.push((await request.clone().json()) as Record<string, unknown>)
    }),
  )
  return seen
}

const save = () => screen.getByRole('button', { name: 'Yadda saxla' })

describe('FinCERT', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    const emptyRect = { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0, toJSON: () => ({}) } as DOMRect
    if (!Range.prototype.getClientRects) Range.prototype.getClientRects = () => [] as unknown as DOMRectList
    if (!Range.prototype.getBoundingClientRect) Range.prototype.getBoundingClientRect = () => emptyRect
    if (!document.elementFromPoint) document.elementFromPoint = () => null
  })

  beforeEach(() => {
    resetFincertMocks()
    server.use(...fincertHandlers)
  })

  describe('Ümumi', () => {
    it('loads the stored values into the form', async () => {
      renderFincert(FINCERT_PATH)

      expect(await screen.findByRole('textbox', { name: 'E-poçt' })).toHaveValue('fincert@cbar.az')
      expect(screen.getByRole('textbox', { name: 'Telefon' })).toHaveValue('(+994 12) 437 00 97')
      expect(screen.getByRole('textbox', { name: 'Portalın ünvanı' })).toHaveValue('https://portal.e-cbar.az/')
      expect(screen.getByRole('textbox', { name: /Portalın adı \(AZ\)/ })).toHaveValue('Vahid Elektron Hesabatlılıq Portalı')
      expect(screen.getByRole('tab', { name: 'Ümumi' })).toHaveAttribute('aria-selected', 'true')
    })

    it('refuses a wrong e-mail under the field and sends nothing', async () => {
      const puts = spyWriteBodies('put', '/api/v1/fincert/settings')
      const user = userEvent.setup()
      renderFincert(FINCERT_PATH)

      const email = await screen.findByRole('textbox', { name: 'E-poçt' })
      await user.clear(email)
      await user.type(email, 'fincert(at)cbar.az')
      await user.click(save())

      expect(await screen.findByText('E-poçt ünvanı düzgün deyil (məs. fincert@cbar.az).')).toBeInTheDocument()
      expect(puts).toHaveLength(0)
    })

    it('saves with one PUT whose body is the contract, both languages included', async () => {
      const puts = spyWriteBodies('put', '/api/v1/fincert/settings')
      const user = userEvent.setup()
      renderFincert(FINCERT_PATH)

      const phone = await screen.findByRole('textbox', { name: 'Telefon' })
      await user.clear(phone)
      await user.type(phone, '(+994 12) 437 00 98')
      await user.click(save())

      await waitFor(() => expect(puts).toHaveLength(1))
      expect(puts[0]).toEqual({
        email: 'fincert@cbar.az',
        phone: '(+994 12) 437 00 98',
        portalUrl: 'https://portal.e-cbar.az/',
        translations: {
          az: {
            mission: 'FinCERT-in missiyası maliyyə bazarının kibertəhlükəsizlik səviyyəsini gücləndirməkdir.',
            portalTitle: 'Vahid Elektron Hesabatlılıq Portalı',
            portalDescription: 'Hesabatlar Mərkəzi Banka bu portal vasitəsilə göndərilir.',
            rfcMediaId: null,
            rfcUrl: 'https://uploads.cbar.az/assets/f7322827bd3688a2be3136204.pdf',
          },
          en: {
            mission: 'The mission of FinCERT is to strengthen the cybersecurity of the financial market.',
            portalTitle: 'Unified Electronic Reporting Portal',
            portalDescription: null,
            rfcMediaId: null,
            rfcUrl: 'https://uploads.cbar.az/assets/02c3d655e376515419c623ce2.pdf',
          },
        },
      })
      expect(await screen.findByText('FinCERT məlumatları yadda saxlanıldı')).toBeInTheDocument()
      expect(fincertSettingsStore.get().phone).toBe('(+994 12) 437 00 98')
    })

    it('shows a server field error under its field', async () => {
      server.use(
        http.put('/api/v1/fincert/settings', () =>
          HttpResponse.json(
            { status: 400, message: FINCERT_EMAIL_INVALID, errors: { 'translations.az.rfcUrl': ['Serverin link xətası'] } },
            { status: 400, headers: { 'Content-Type': 'application/problem+json' } },
          ),
        ),
      )
      const user = userEvent.setup()
      renderFincert(FINCERT_PATH)

      await user.type(await screen.findByRole('textbox', { name: 'Telefon' }), '1')
      await user.click(save())

      const field = await screen.findByRole('textbox', { name: /RFC-2350 linki \(AZ\)/ })
      expect(await screen.findByText('Serverin link xətası')).toBeInTheDocument()
      expect(field).toHaveAttribute('aria-invalid', 'true')
    })

    it('shows a server error on a key the form has no field for in the banner', async () => {
      server.use(
        http.put('/api/v1/fincert/settings', () =>
          HttpResponse.json(
            { status: 400, message: 'Yalnız az və en dilləri qəbul olunur.', errors: { translations: ['Yalnız az və en dilləri qəbul olunur.'] } },
            { status: 400, headers: { 'Content-Type': 'application/problem+json' } },
          ),
        ),
      )
      const user = userEvent.setup()
      renderFincert(FINCERT_PATH)

      await user.type(await screen.findByRole('textbox', { name: 'Telefon' }), '1')
      await user.click(save())

      expect(await screen.findByText('Yalnız az və en dilləri qəbul olunur.')).toBeInTheDocument()
    })

    it('asks before leaving with unsaved changes', async () => {
      const user = userEvent.setup()
      const router = renderFincert(FINCERT_PATH)

      await user.type(await screen.findByRole('textbox', { name: 'Telefon' }), '1')
      await user.click(screen.getByRole('tab', { name: 'Fəaliyyət istiqamətləri' }))

      const dialog = await screen.findByRole('alertdialog', { name: 'Yadda saxlanmamış dəyişikliklər' })
      await user.click(within(dialog).getByRole('button', { name: 'Ləğv et' }))
      expect(router.state.location.pathname).toBe(FINCERT_PATH)
    })
  })

  describe('Fəaliyyət istiqamətləri', () => {
    it('lists the directions with their number and the missing language', async () => {
      renderFincert('/fincert/directions')

      const row = await screen.findByRole('row', { name: /İnsidentlər üzrə fəaliyyətin koordinasiyası/ })
      expect(within(row).getByText('3')).toBeInTheDocument()
      expect(within(row).getByText('EN yoxdur')).toBeInTheDocument()
      const complete = screen.getByRole('row', { name: /İnsidentlərin təhlili/ })
      expect(within(complete).queryByText('EN yoxdur')).not.toBeInTheDocument()
    })

    it('refuses a language with a title but no text', async () => {
      const posts = spyWriteBodies('post', fincertDirectionsStore.base)
      const user = userEvent.setup()
      renderFincert('/fincert/directions/new')

      await user.type(await screen.findByRole('textbox', { name: /Başlıq \(AZ\)/ }), 'Yeni istiqamət')
      await user.click(save())

      expect(await screen.findByText('Bu dildə başlıq və mətn birlikdə doldurulmalıdır.')).toBeInTheDocument()
      expect(posts).toHaveLength(0)
    })

    it('reorders the directions with the keyboard buttons in the dialog', async () => {
      const puts = spyWriteBodies('put', `${fincertDirectionsStore.base}/order`)
      const user = userEvent.setup()
      renderFincert('/fincert/directions')

      await user.click(await screen.findByRole('button', { name: 'Sıranı dəyiş' }))
      const dialog = await screen.findByRole('dialog', { name: 'İstiqamətlərin sırası' })
      await user.click(await within(dialog).findByRole('button', { name: /Təhdidlərin proaktiv aşkarlanması — yuxarı/ }))

      await waitFor(() => expect(puts).toEqual([{ ids: [1, 2, 4, 3] }]))
      await waitFor(() =>
        expect([...fincertDirectionsStore.store.all()].sort((a, b) => a.sortOrder - b.sortOrder).map((row) => row.id)).toEqual([
          1, 2, 4, 3,
        ]),
      )
    })
  })

  describe('Beynəlxalq üzvlüklər', () => {
    it('refuses a language with text but no name instead of dropping it', async () => {
      const posts = spyWriteBodies('post', '/api/v1/fincert/memberships')
      const user = userEvent.setup()
      renderFincert('/fincert/memberships/new')

      await user.type(await screen.findByRole('textbox', { name: /Təşkilatın adı \(AZ\)/ }), 'FIRST')
      await user.click(screen.getByRole('tab', { name: 'EN' }))
      await user.type(await screen.findByRole('textbox', { name: /Təsvir \(EN\)/ }), 'Forum of Incident Response and Security Teams')
      await user.click(save())

      expect(await screen.findByText('Bu dildə mətn yazılıbsa, təşkilatın adı da yazılmalıdır.')).toBeInTheDocument()
      expect(posts).toHaveLength(0)
    })


    it('offers only images for the logo', async () => {
      const user = userEvent.setup()
      renderFincert('/fincert/memberships/new')

      await user.click(await screen.findByRole('button', { name: 'Seç' }))
      const dialog = await screen.findByRole('dialog', { name: 'Fayl seç' })
      expect(within(dialog).getByText(/Yalnız şəkil seçmək olar/)).toBeInTheDocument()
      expect(await within(dialog).findByRole('button', { name: 'hesabat-2025.pdf faylını seç' })).toBeDisabled()
      expect(within(dialog).getByRole('button', { name: 'placeholder-1.svg faylını seç' })).toBeEnabled()
    })
  })
})
