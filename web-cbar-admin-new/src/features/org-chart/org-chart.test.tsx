/**
 * Org chart editor (spec 027, spec 060) — the real app route with MSW `orgChartHandlers` (the API
 * contract, in-memory store). Assertions are on what the user sees and on the saved store. The desktop
 * chart is laid out from the tree, so the panel edits only the tree: parent, sibling order, and a block's
 * "Departamentlər" choice.
 */

import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/features/auth/model/auth-store'
import { getRuntimeConfig, loadRuntimeConfig } from '@/shared/config/runtime-config'
import { adminUser, makeAdminJwt } from '@/shared/testing/factories'
import { orgChartFixtures } from '@/shared/testing/fixtures/org-chart'
import { orgChartStore } from '@/shared/testing/handlers/org-chart'
import { renderApp } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

describe('struktur sxemi redaktoru', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    orgChartStore.reset()
    useAuthStore.getState().login(makeAdminJwt(), adminUser, new Date(Date.now() + 15 * 60_000).toISOString())
  })

  afterEach(() => useAuthStore.getState().logout())

  const list = async () => screen.findByRole('list', { name: 'Sxemin kartları' })
  const childIds = (parentId: number) =>
    orgChartStore
      .all()
      .filter((r) => r.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
      .map((r) => r.id)

  it('kartlar ağac sırası ilə; canvas, koordinat və «Sıra» sahəsi yoxdur (FR-010)', async () => {
    renderApp('/organization/chart')
    const rows = within(await list()).getAllByRole('listitem')

    expect(rows.map((r) => within(r).getAllByRole('button')[0]!.textContent)).toEqual([
      'Taleh KazımovSədr',
      'Pul siyasəti departamenti *Departament',
      'Hüquq blokuBlok',
    ])
    expect(screen.getByRole('tab', { name: 'Struktur sxemi' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByText('Canvas-da deyil')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Yerləşməni yadda saxla' })).toBeNull()

    await userEvent.setup().click(within(rows[0]!).getByRole('button', { name: '«Taleh Kazımov» kartını redaktə et' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).queryByLabelText('Sıra')).toBeNull()
  })

  it('«Sıranı dəyiş»: hər hərəkət dərhal PUT /order ilə saxlanır (US3-1)', async () => {
    const user = userEvent.setup()
    renderApp('/organization/chart')
    await user.click(within(await list()).getByRole('button', { name: '«Taleh Kazımov» altındakı kartların sırasını dəyiş' }))

    const dialog = await screen.findByRole('dialog')
    await user.click(await within(dialog).findByRole('button', { name: /Hüquq bloku.*yuxarı/ }))
    await waitFor(() => expect(childIds(1)).toEqual([3, 2]))
  })

  it('sıra saxlanmayanda xəta görünür və sıra geri qayıdır (US3-5)', async () => {
    server.use(http.put('/api/v1/organization/chart/order', () => HttpResponse.json({ message: 'Server xətası' }, { status: 500 })))
    const user = userEvent.setup()
    renderApp('/organization/chart')
    await user.click(within(await list()).getByRole('button', { name: '«Taleh Kazımov» altındakı kartların sırasını dəyiş' }))

    const dialog = await screen.findByRole('dialog')
    await user.click(await within(dialog).findByRole('button', { name: /Hüquq bloku.*yuxarı/ }))
    expect(await within(dialog).findByText('Sıranı saxlamaq alınmadı')).toBeInTheDocument()
    const items = within(within(dialog).getByRole('list', { name: '«Taleh Kazımov» altındakı kartların sırası' })).getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Pul siyasəti departamenti')
    expect(childIds(1)).toEqual([2, 3])
  })

  it('blokun «Departamentlər» seçimi saxlanır; başqa növdə seçim yoxdur (US3-2, FR-012)', async () => {
    const user = userEvent.setup()
    renderApp('/organization/chart')
    await user.click(within(await list()).getByRole('button', { name: '«Hüquq bloku» kartını redaktə et' }))

    let dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('radio', { name: 'Açılan siyahı' })).toBeChecked()
    await user.click(within(dialog).getByRole('radio', { name: 'Həmişə açıq' }))
    await user.click(within(dialog).getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() => expect(orgChartStore.all().find((r) => r.id === 3)!.departmentsOpen).toBe(true))
    // The stored order is sent back unchanged.
    expect(orgChartStore.all().find((r) => r.id === 3)!.sortOrder).toBe(2)

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await user.click(within(await list()).getByRole('button', { name: '«Hüquq bloku» kartını redaktə et' }))
    dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('radio', { name: 'Həmişə açıq' })).toBeChecked()
    await user.click(within(dialog).getByRole('button', { name: 'Ləğv et' }))

    await user.click(within(await list()).getByRole('button', { name: '«Taleh Kazımov» kartını redaktə et' }))
    dialog = await screen.findByRole('dialog')
    expect(within(dialog).queryByRole('radiogroup', { name: 'Departamentlər' })).toBeNull()
  })

  it('yeni kart: bağlı qeyd yoxdursa ad tələb olunur, sonra qardaşlarının sonuna düşür', async () => {
    const user = userEvent.setup()
    renderApp('/organization/chart')
    await user.click(within(await list()).getByRole('button', { name: '«Taleh Kazımov» altına kart əlavə et' }))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Yadda saxla' }))
    expect(within(dialog).getByText('Bağlı qeyd yoxdursa ən azı bir dildə ad yazın')).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText('Ad (AZ)'), 'Daxili audit departamenti')
    await user.click(within(dialog).getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(await within(await list()).findByText('Daxili audit departamenti')).toBeInTheDocument()
    const saved = orgChartStore.all().find((r) => r.translations.az?.title === 'Daxili audit departamenti')!
    expect(saved).toMatchObject({ parentId: 1, kind: 5, staffId: null, divisionId: null, sortOrder: 3, departmentsOpen: false })
  })

  it('alt kartı olan kart silinmir — API-nin 409 mesajı dialoqda', async () => {
    const user = userEvent.setup()
    renderApp('/organization/chart')
    await user.click(within(await list()).getByRole('button', { name: '«Taleh Kazımov» kartını sil' }))

    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /Sil/ }))
    expect(await within(dialog).findByText('The node still has child nodes; move or delete them first.')).toBeInTheDocument()
    expect(orgChartStore.all()).toHaveLength(3)
  })

  describe('«Sxem» görünüşü (US4)', () => {
    const chartRegion = () => screen.findByRole('region', { name: 'Saytın desktop sxemi' })

    it('ünvandakı görünüş və dil bərpa olunur; sxem saytın filtrindən keçmiş kartları göstərir (FR-018, FR-020)', async () => {
      orgChartStore.reset(orgChartFixtures.map((r) => (r.id === 3 ? { ...r, isActive: false } : r)))
      renderApp('/organization/chart?view=chart&locale=en')

      const region = await chartRegion()
      expect(screen.getByRole('tab', { name: 'Sxem' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tab', { name: 'EN' })).toHaveAttribute('aria-selected', 'true')
      expect(within(region).getByRole('button', { name: '«Taleh Kazimov» kartını redaktə et' })).toBeInTheDocument()
      expect(within(region).getByRole('button', { name: '«Monetary Policy Department» kartını redaktə et' })).toBeInTheDocument()
      // Inactive on the site, so not in the chart; the list still has it.
      expect(within(region).queryByRole('button', { name: /Legal block/ })).toBeNull()
    })

    it('siyahıdan sxemə və dillər arasında keçid', async () => {
      const user = userEvent.setup()
      renderApp('/organization/chart')
      await list()

      await user.click(screen.getByRole('tab', { name: 'Sxem' }))
      const region = await chartRegion()
      expect(within(region).getByRole('button', { name: '«Hüquq bloku» kartını redaktə et' })).toBeInTheDocument()
      expect(screen.queryByRole('list', { name: 'Sxemin kartları' })).toBeNull()

      await user.click(screen.getByRole('tab', { name: 'EN' }))
      expect(await within(await chartRegion()).findByRole('button', { name: '«Legal block» kartını redaktə et' })).toBeInTheDocument()
    })

    it('karta klik onun formunu açır, saxlanan ad sxemdə görünür (FR-021)', async () => {
      const user = userEvent.setup()
      renderApp('/organization/chart?view=chart')

      await user.click(within(await chartRegion()).getByRole('button', { name: '«Hüquq bloku» kartını redaktə et' }))
      const dialog = await screen.findByRole('dialog')
      expect(within(dialog).getByRole('heading', { name: 'Kartı redaktə et' })).toBeInTheDocument()
      const title = within(dialog).getByLabelText('Ad (AZ)')
      await user.clear(title)
      await user.type(title, 'Hüquq və uyğunluq bloku')
      await user.click(within(dialog).getByRole('button', { name: 'Yadda saxla' }))

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(
        await within(await chartRegion()).findByRole('button', { name: '«Hüquq və uyğunluq bloku» kartını redaktə et' }),
      ).toBeInTheDocument()
    })
  })

  it('«Saytda bax» saytın struktur səhifəsini yeni vərəqdə açır (FR-013)', async () => {
    renderApp('/organization/chart')
    await list()
    const link = screen.getByRole('link', { name: /Saytda bax/ })
    expect(link).toHaveAttribute('href', `${getRuntimeConfig().urls.siteUrl}/az/organization?section=divisions`)
    expect(link).toHaveAttribute('target', '_blank')
  })
})
