/**
 * US5 — pul nişanları, təşkilat, media, axtarış (quickstart §4 ssenari 16).
 */
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { boardMembers, divisions, managementMembers, orgChartNodes } from '@/shared/testing/fixtures/organization'
import { renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { DivisionView } from './division'
import { loadDivision } from './division/loader'
import { MediaView } from './media'
import { loadMedia } from './media/loader'
import { MoneyMarkView } from './money-mark'
import { loadMoneyMark } from './money-mark/loader'
import { MoneyMarksView } from './money-marks'
import { loadMoneyMarks } from './money-marks/loader'
import { OrganizationView } from './organization'
import { loadOrganization } from './organization/loader'
import { SearchView } from './search'
import { loadSearch } from './search/loader'
import { StaffMemberView } from './staff-member'
import { loadStaffMember } from './staff-member/loader'

function recordRequests() {
  const seen: string[] = []
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    seen.push(`${url.pathname}${url.search}`)
  })
  return seen
}

describe('pul nişanları', () => {
  it('type həmişə göndərilir (default 1), kateqoriya başlıq olur', async () => {
    const seen = recordRequests()
    const data = await loadMoneyMarks('az', { categoryId: '2' })
    renderApp(<MoneyMarksView data={data} />, { locale: 'az' })

    expect(seen).toContain('/api/v1/money-marks?locale=az&type=1&categoryId=2')
    expect(screen.getByRole('heading', { level: 1, name: 'Yubiley' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sikkələr' })).toHaveAttribute('href', '/az/national-currency?type=2&categoryId=2')
  })

  it('sikkə tipi və kartlar', async () => {
    const data = await loadMoneyMarks('az', { type: '2' })
    renderApp(<MoneyMarksView data={data} />, { locale: 'az' })

    expect(data.items?.map((m) => m.title)).toEqual(['50 qəpik', 'Yubiley sikkəsi'])
    expect(screen.getByRole('link', { name: /50 qəpik/ })).toHaveAttribute('href', '/az/national-currency/50-qepik')
  })

  it('detal: ön/arxa şəkil, tablar, geri keçid', async () => {
    const user = userEvent.setup()
    const data = await loadMoneyMark('az', '1-manat')
    renderApp(<MoneyMarkView data={data!} />, { locale: 'az' })

    // Şəkil `next/image` optimizer-indən keçir (spec 003 FR-009): `src` optimizer
    // ünvanıdır, mənbə isə onun `url` parametrində same-origin media yoludur.
    expect(screen.getByRole('img', { name: '1 manat — Ön tərəf' })).toHaveAttribute(
      'src',
      expect.stringContaining('url=%2Fmedia%2F11'),
    )
    expect(screen.getByRole('tab', { name: 'Mühafizə elementləri' })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Mühafizə elementləri' }))
    expect(await screen.findByText('Su nişanı')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Bütün pul nişanları' })).toHaveAttribute('href', '/az/national-currency?type=1')
    await expect(loadMoneyMark('az', 'yoxdur')).resolves.toBeNull()
  })
})

describe('təşkilat', () => {
  it('default bölmə İdarə Heyətidir — bir sorğu + ağac; sədr ayrıca, müavinlər şəbəkədə (spec 024)', async () => {
    const seen = recordRequests()
    const data = await loadOrganization('az', {})
    renderApp(<OrganizationView data={data} />, { locale: 'az' })

    expect(seen).toEqual(expect.arrayContaining(['/api/v1/organization/staff?locale=az&type=1', '/api/v1/pages/tree?locale=az']))
    expect(seen).toHaveLength(2)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: 'İdarə Heyəti' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Sədr' })).toHaveClass('sr-only')
    expect(screen.getByRole('heading', { level: 2, name: 'Sədr müavinləri' })).not.toHaveClass('sr-only')
    expect(screen.getByRole('link', { name: /Taleh Kazımov/ })).toHaveAttribute('href', '/az/organization/staff/detail/1')
    expect(screen.getByRole('link', { name: /Taleh Kazımov/ })).toHaveAttribute('data-slot', 'chair-card')
    expect(screen.getByRole('link', { name: /Aliyə Məmmədova/ })).toHaveAttribute('data-slot', 'deputy-card')
    // Tab düymələri yoxdur — keçid "Haqqımızda" menyusundandır.
    expect(screen.queryByRole('navigation', { name: 'Struktur bölmələri' })).toBeNull()
    expect(screen.getByRole('navigation', { name: 'Səhifənin yeri' })).toBeInTheDocument()
  })

  it('İdarə Heyətində bir üzv: müavinlər bölməsi yoxdur', async () => {
    server.use(http.get(`${API}/api/v1/organization/staff`, () => HttpResponse.json([boardMembers[0]])))
    const data = await loadOrganization('az', { section: 'board' })
    renderApp(<OrganizationView data={data} />, { locale: 'az' })

    expect(data.board.deputies).toEqual([])
    expect(screen.queryByRole('heading', { name: 'Sədr müavinləri' })).toBeNull()
  })

  it('struktur sxemi (spec 027): kartlar əməkdaş/şöbə səhifəsinə keçir, düz siyahı və CMS şəkli göstərilmir', async () => {
    const seen = recordRequests()
    server.use(http.get(`${API}/api/v1/organization/chart`, () => HttpResponse.json(orgChartNodes)))
    const data = await loadOrganization('az', { section: 'divisions' })
    renderApp(<OrganizationView data={data} />, { locale: 'az' })

    expect(seen).toContain('/api/v1/organization/chart?locale=az')
    // Desktop canvas və planşet/mobil ağac eyni kartları göstərir (görünən CSS ilə seçilir).
    const governor = screen.getAllByRole('link', { name: /Taleh Kazımov/ })
    expect(governor).toHaveLength(2)
    for (const link of governor) expect(link).toHaveAttribute('href', '/az/organization/staff/detail/1')
    for (const link of screen.getAllByRole('link', { name: /Aliyə Məmmədova/ })) expect(link).toHaveAttribute('href', '/az/organization/staff/detail/2')
    for (const link of screen.getAllByRole('link', { name: /Hüquq bloku/ })) expect(link).toHaveAttribute('href', '/az/organization/divisions/2')

    // Keçidi olmayan kart klikli deyil; kuratora tabe olan "*" və qeyd alır.
    expect(screen.queryByRole('link', { name: /Sədrin ofisi şöbəsi/ })).toBeNull()
    expect(screen.getAllByText('Sədrin ofisi şöbəsi *').length).toBeGreaterThan(0)
    expect(screen.getByText('* Kuratora birbaşa tabe olan şöbə')).toBeInTheDocument()

    // The block is a dropdown both on the desktop chart (spec 060) and in the tablet/mobile tree.
    const accordions = screen.getAllByText('Hüquq bloku', { selector: 'summary span' }).map((s) => s.closest('details')!)
    expect(accordions).toHaveLength(2)
    for (const accordion of accordions)
      expect(within(accordion).getByRole('link', { name: /Hüquq departamenti/ })).toHaveAttribute('href', '/az/organization/divisions/2')

    expect(screen.queryByRole('link', { name: 'Pul siyasəti departamenti' })).toBeNull()
  })

  it('struktur sxemi sorğusu yıxılanda köhnə görünüş qalır', async () => {
    server.use(http.get(`${API}/api/v1/organization/chart`, () => new HttpResponse(null, { status: 500 })))
    const data = await loadOrganization('az', { section: 'divisions' })
    renderApp(<OrganizationView data={data} />, { locale: 'az' })

    expect(data.error).toBe(false)
    expect(data.orgChart).toEqual([])
    expect(screen.getByRole('link', { name: 'Pul siyasəti departamenti' })).toBeInTheDocument()
  })

  it('şöbələr və ofislər bölmələri', async () => {
    const divisions = await loadOrganization('az', { section: 'divisions' })
    const { unmount } = renderApp(<OrganizationView data={divisions} />, { locale: 'az' })
    expect(screen.getByRole('link', { name: 'Pul siyasəti departamenti' })).toHaveAttribute(
      'href',
      `/az/organization/divisions/${divisions.divisions[0]!.id}`,
    )
    unmount()

    const offices = await loadOrganization('en', { section: 'offices' })
    renderApp(<OrganizationView data={offices} />, { locale: 'en' })
    expect(screen.getByRole('link', { name: '(+994 22) 256 12 34' })).toHaveAttribute('href', 'tel:+994222561234')
  })

  it('ərazi idarəsi kartı — Figma 2046:3531: foto, rəhbər, əsasnamə düyməsi; boş sahə və sənədsiz kart', async () => {
    const data = await loadOrganization('az', { section: 'offices' })
    renderApp(<OrganizationView data={data} />, { locale: 'az' })

    const cards = screen.getAllByRole('article').filter((el) => el.dataset.slot === 'office-card')
    expect(cards).toHaveLength(2)
    expect(within(cards[0]!).getByRole('heading', { level: 2, name: 'Gəncə ərazi idarəsi' })).toBeInTheDocument()
    expect(within(cards[0]!).getByRole('img', { name: 'Gəncə ərazi idarəsi — foto' })).toHaveAttribute(
      'src',
      expect.stringContaining('url=%2Fmedia%2F41'),
    )
    expect(within(cards[0]!).getByText('Rəhbər')).toBeInTheDocument()
    expect(within(cards[0]!).getByText('Hacıyev Fuad Həsən oğlu')).toBeInTheDocument()
    const regulation = within(cards[0]!).getByRole('link', { name: /Əsasnamə/ })
    expect(regulation).toHaveAttribute('href', '/media/51')
    expect(regulation).toHaveAttribute('target', '_blank')

    // İkinci ofisdə yalnız ad var: etiketlər və düymə yoxdur, foto yer tutucudur.
    expect(within(cards[1]!).queryByText('Ünvan')).toBeNull()
    expect(within(cards[1]!).queryByRole('link')).toBeNull()
    expect(within(cards[1]!).queryByRole('img')).toBeNull()
  })

  it('Rəhbərlik: baş direktorlar (type 2) və müşavirlər (type 3) ayrı qruplarda — Figma 1814:4894', async () => {
    const seen = recordRequests()
    const data = await loadOrganization('az', { section: 'management' })
    renderApp(<OrganizationView data={data} />, { locale: 'az' })

    expect(seen).toEqual(
      expect.arrayContaining(['/api/v1/organization/staff?locale=az&type=2', '/api/v1/organization/staff?locale=az&type=3']),
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Baş direktorlar və müşavirlər' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Baş direktorlar' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Müşavirlər' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Rəşad Orucov/ })).toHaveAttribute('data-slot', 'staff-card')
    expect(screen.getByRole('link', { name: /Rəna Məlikova/ })).toHaveAttribute('href', '/az/organization/staff/detail/4')
  })

  it('Rəhbərlik: müşavir yoxdursa qrup başlığı da yoxdur', async () => {
    server.use(
      http.get(`${API}/api/v1/organization/staff`, ({ request }) =>
        HttpResponse.json(new URL(request.url).searchParams.get('type') === '3' ? [] : managementMembers),
      ),
    )
    const data = await loadOrganization('az', { section: 'management' })
    renderApp(<OrganizationView data={data} />, { locale: 'az' })

    expect(data.management.advisers).toEqual([])
    expect(screen.queryByRole('heading', { name: 'Müşavirlər' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Baş direktorlar' })).toBeInTheDocument()
  })

  it('xəta halında ErrorState', async () => {
    server.use(http.get(`${API}/api/v1/organization/staff`, () => new HttpResponse(null, { status: 500 })))
    const data = await loadOrganization('az', { section: 'management' })
    renderApp(<OrganizationView data={data} />, { locale: 'az' })

    expect(data.error).toBe(true)
    expect(screen.getByText('Serverdə xəta baş verdi. Bir azdan yenidən cəhd edin')).toBeInTheDocument()
  })

  it('əməkdaş kartı; yanlış id və 404 → null', async () => {
    const data = await loadStaffMember('az', '1')
    renderApp(<StaffMemberView data={data!} />, { locale: 'az' })

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: 'Taleh Kazımov' })).toBeInTheDocument()
    expect(screen.getByText('Çərşənbə')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '966' })).toHaveAttribute('href', 'tel:966')
    // Mətbuat fotoları (Figma `2037:4289`): kart meta sətri, fərdi yükləmə və ZIP same-origin proxy ilə.
    expect(screen.getByRole('heading', { level: 2, name: 'Fotoşəkillər' })).toBeInTheDocument()
    expect(screen.getByText('JPG · 4000×6000 px · 8,2 MB')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'portret.jpg faylını yüklə' })).toHaveAttribute('download', 'portret.jpg')
    expect(screen.getByRole('link', { name: 'Hamısını yüklə (ZIP, 12,8 MB)' })).toHaveAttribute('href', '/media/staff-photos/1')
    // Siyahıya qayıdış breadcrumb-dandır (spec 024 US4 #5).
    const crumbs = screen.getByRole('navigation', { name: 'Səhifənin yeri' })
    expect(within(crumbs).getByRole('link', { name: 'Ana səhifə' })).toHaveAttribute('href', '/az')
    expect(within(crumbs).getByText('Taleh Kazımov')).toHaveAttribute('aria-current', 'page')
    await expect(loadStaffMember('az', 'abc')).resolves.toBeNull()
    await expect(loadStaffMember('az', '99')).resolves.toBeNull()
  })

  it('əməkdaş: fotosuz üzvdə "Fotoşəkillər" bölməsi yoxdur; köhnə API (sahəsiz) boş dəst sayılır', async () => {
    const data = await loadStaffMember('az', '3')
    renderApp(<StaffMemberView data={data!} />, { locale: 'az' })
    expect(screen.queryByRole('heading', { name: 'Fotoşəkillər' })).toBeNull()

    server.use(http.get(`${API}/api/v1/organization/staff/:id`, () => HttpResponse.json({ id: 5, fullName: 'Köhnə API', position: null, receptionDays: null, phone: null, bio: null, photoUrl: null })))
    const legacy = await loadStaffMember('az', '5')
    expect(legacy?.photos).toEqual([])
    expect(legacy?.photosZip).toBeNull()
  })

  it('şöbə səhifəsi: başlıq, "Direktor" kartı, breadcrumb; yanlış id → null', async () => {
    server.use(
      http.get(`${API}/api/v1/organization/divisions`, () =>
        HttpResponse.json([...divisions, { id: 20, name: 'Statistika departamenti', description: '<p> Direktor: <span> Canməmmədova Mehriban </span></p>' }]),
      ),
    )
    const data = await loadDivision('az', '20')
    renderApp(<DivisionView data={data!} />, { locale: 'az' })

    expect(screen.getByRole('heading', { level: 1, name: 'Statistika departamenti' })).toBeInTheDocument()
    expect(screen.getByText('Direktor')).toBeInTheDocument()
    expect(screen.getByText('Canməmmədova Mehriban')).toBeInTheDocument()
    const crumbs = screen.getByRole('navigation', { name: 'Səhifənin yeri' })
    expect(within(crumbs).getByText('Statistika departamenti')).toHaveAttribute('aria-current', 'page')
    await expect(loadDivision('az', '0')).resolves.toBeNull()
    await expect(loadDivision('az', '999999')).resolves.toBeNull()
  })

  it('şöbə təsvirində link varsa mətn HTML kimi qalır', async () => {
    const data = await loadDivision('az', '1')
    expect(data?.facts).toEqual([])
    expect(data?.html).toContain('hazırlanması')
  })

  it('şöbənin əsasnaməsi kartın altında "Əsasnamə" fayl sətri kimi; bağlanmayıbsa sətir yoxdur', async () => {
    const data = await loadDivision('az', '1')
    expect(data?.attachments).toEqual([expect.objectContaining({ id: 31, title: 'Əsasnamə', mimeType: 'application/pdf' })])
    const { unmount } = renderApp(<DivisionView data={data!} />, { locale: 'az' })
    const row = screen.getByRole('link', { name: /Əsasnamə/ })
    expect(row).toHaveAttribute('href', expect.stringContaining('/media/31'))
    unmount()

    const bare = await loadDivision('az', '2')
    expect(bare?.attachments).toEqual([])
    renderApp(<DivisionView data={bare!} />, { locale: 'az' })
    expect(screen.queryByRole('link', { name: /Əsasnamə/ })).toBeNull()
  })
})

describe('media', () => {
  it('giriş səhifəsi yalnız CMS səhifəsi + ağac sorğusu edir; qalereya/video sorğusu yoxdur (spec 028)', async () => {
    const seen = recordRequests()
    const data = await loadMedia('az')
    renderApp(<MediaView data={data} />, { locale: 'az' })

    expect(seen).toEqual(expect.arrayContaining(['/api/v1/pages/media?locale=az', '/api/v1/pages/tree?locale=az']))
    expect(seen.some((path) => path.startsWith('/api/v1/galleries') || path.startsWith('/api/v1/videos'))).toBe(false)
    expect(screen.getByRole('navigation', { name: 'Səhifənin yeri' })).toBeInTheDocument()
  })

})

describe('axtarış', () => {
  it('boş sorğu API-yə getmir', async () => {
    const seen = recordRequests()
    const data = await loadSearch('az', { q: '  ' })
    renderApp(<SearchView data={data} />, { locale: 'az' })

    expect(seen).toEqual([])
    expect(screen.getByText('Axtarış üçün sorğu daxil edin')).toBeInTheDocument()
  })

  it('nəticələr tip üzrə qruplaşdırılır, naməlum tip «Digər»dədir', async () => {
    const data = await loadSearch('az', { q: ['manat', 'ikinci'] })
    renderApp(<SearchView data={data} />, { locale: 'az' })

    expect(screen.getByText('«manat» üzrə nəticələr')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Səhifələr' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Digər' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Manat haqqında' })).toHaveAttribute('href', '/az/haqqimizda/manat')
    expect(screen.getByRole('link', { name: 'Naməlum' })).toHaveAttribute('target', '_blank')
  })

  it('nəticəsiz sorğu və xəta', async () => {
    const empty = await loadSearch('en', { q: 'yoxdur' })
    const { unmount } = renderApp(<SearchView data={empty} />, { locale: 'en' })
    expect(screen.getByText('No results match your query')).toBeInTheDocument()
    unmount()

    server.use(http.get(`${API}/api/v1/search`, () => new HttpResponse(null, { status: 500 })))
    const failed = await loadSearch('en', { q: 'manat' })
    expect(failed.error).toBe(true)
  })
})
