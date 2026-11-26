import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { fincertPartial } from '@/shared/testing/fixtures/fincert'
import { pageDetailFixture } from '@/shared/testing/fixtures/pages'
import { renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { FincertView } from './index'
import { loadFincertPage } from './loader'

/** CMS page 133 in both locales; the slug is `fincert` in az and en. */
function mockFincertPage() {
  server.use(
    http.get(`${API}/api/v1/pages/:slug`, () =>
      HttpResponse.json({ ...pageDetailFixture, id: 133, title: 'FinCERT', slug: 'fincert', content: '<p>Köhnə mətn</p>', assets: [] }),
    ),
  )
}

async function renderFincert(locale: 'az' | 'en' = 'az') {
  mockFincertPage()
  const data = await loadFincertPage(locale, 'fincert')
  if (!data) throw new Error('FinCERT data expected')
  renderApp(<FincertView data={data} />, { locale })
}

const direction = (title: string) => screen.getByText(title, { selector: 'summary *' }).closest('details')!

describe('FinCERT page (spec 053 US1)', () => {
  it('shows the breadcrumb, the title and the sections in the Figma order, each with its anchor', async () => {
    await renderFincert()

    expect(screen.getByRole('link', { name: 'Ana səhifə' })).toHaveAttribute('href', '/az')
    expect(screen.getByRole('heading', { level: 1, name: 'FinCERT' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Fəaliyyətin əsas istiqamətləri',
      'Əlaqə məlumatları',
      'Yüksək kateqoriyalı insident üzrə hesabatın göndərilməsi',
      'RFC-2350',
      'Beynəlxalq əməkdaşlıq',
    ])
    // The mission has no visible heading (Figma); its region is still named.
    expect(screen.getByRole('region', { name: 'Missiya' })).toHaveAttribute('id', 'missiya')
    expect(screen.getByRole('region', { name: 'Fəaliyyətin əsas istiqamətləri' })).toHaveAttribute('id', 'istiqametler')
    expect(screen.getByRole('region', { name: 'Əlaqə məlumatları' })).toHaveAttribute('id', 'elaqe')
    expect(screen.getByRole('region', { name: /Yüksək kateqoriyalı/ })).toHaveAttribute('id', 'hesabat-portali')
    expect(screen.getByRole('region', { name: 'RFC-2350' })).toHaveAttribute('id', 'rfc-2350')
    expect(screen.getByRole('region', { name: 'Beynəlxalq əməkdaşlıq' })).toHaveAttribute('id', 'beynelxalq-emekdasliq')
    expect(screen.queryByText(/Bu səhifədə/)).toBeNull()
  })

  it('shows four closed numbered directions; one opens on click and the others stay closed', async () => {
    await renderFincert()
    const user = userEvent.setup()
    const titles = [
      'İnsidentlər barədə məlumatların əldə olunması və paylaşılması',
      'İnsidentlərin təhlili və ilkin cavab tədbirlərinin təmin olunması',
      'İnsidentlər üzrə fəaliyyətin koordinasiyası və maliyyə ekosistemində dayanıqlılığın gücləndirilməsi',
      'Təhdidlərin proaktiv aşkarlanması və iştirakçıların əvvəlcədən xəbərdar edilməsi',
    ]

    titles.forEach((title, index) => {
      expect(direction(title)).not.toHaveAttribute('open')
      expect(within(direction(title)).getByText(String(index + 1))).toBeInTheDocument()
    })

    await user.click(screen.getByText(titles[0]!, { selector: 'summary *' }))
    expect(direction(titles[0]!)).toHaveAttribute('open')
    expect(within(direction(titles[0]!)).getByText('CERT-lər ilə sıx kommunikasiya həyata keçirir;')).toBeVisible()
    expect(direction(titles[1]!)).not.toHaveAttribute('open')
  })

  it('links the e-mail and the phone cards', async () => {
    await renderFincert()
    expect(screen.getByRole('link', { name: /Elektron poçt.*fincert@cbar\.az/ })).toHaveAttribute('href', 'mailto:fincert@cbar.az')
    expect(screen.getByRole('link', { name: /Əlaqə nömrəsi.*437 00 97/ })).toHaveAttribute('href', 'tel:+994124370097')
  })

  it('opens the reporting portal in a new tab', async () => {
    await renderFincert()
    const portal = within(screen.getByRole('region', { name: /Yüksək kateqoriyalı/ }))
    expect(portal.getByText('Vahid Elektron Hesabatlılıq Portalı')).toBeInTheDocument()
    const link = portal.getByRole('link', { name: /Portala keçid/ })
    expect(link).toHaveAttribute('href', 'https://portal.e-cbar.az/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('makes the RFC-2350 card one link with the PDF badge', async () => {
    await renderFincert()
    const rfc = within(screen.getByRole('region', { name: 'RFC-2350' }))
    const links = rfc.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', 'https://uploads.cbar.az/assets/f7322827bd3688a2be3136204.pdf')
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(rfc.getByText('PDF')).toBeInTheDocument()
  })

  it('shows the membership card with its name, description and badge, as a link', async () => {
    await renderFincert()
    const cooperation = within(screen.getByRole('region', { name: 'Beynəlxalq əməkdaşlıq' }))
    expect(cooperation.getByText('Forum for Incident Response and Security Teams')).toBeInTheDocument()
    expect(cooperation.getByText('2026-cı ildən tam hüquqlu üzv')).toBeInTheDocument()
    expect(cooperation.getByRole('link', { name: /Forum for Incident Response/ })).toHaveAttribute('href', 'https://www.first.org/')
    expect(cooperation.queryByRole('img')).toBeNull()
  })

  it('shows the en content with en labels', async () => {
    await renderFincert('en')
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/en')
    expect(screen.getByRole('heading', { level: 2, name: 'Main areas of activity' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Go to the portal/ })).toBeInTheDocument()
  })

  it('leaves out the sections without content', async () => {
    server.use(http.get(`${API}/api/v1/fincert`, () => HttpResponse.json(fincertPartial)))
    await renderFincert()

    expect(screen.getByRole('region', { name: 'Missiya' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Əlaqə məlumatları' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Fəaliyyətin əsas istiqamətləri' })).toBeNull()
    expect(screen.queryByRole('region', { name: /Yüksək kateqoriyalı/ })).toBeNull()
    expect(screen.queryByRole('region', { name: 'RFC-2350' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Beynəlxalq əməkdaşlıq' })).toBeNull()
  })
})
