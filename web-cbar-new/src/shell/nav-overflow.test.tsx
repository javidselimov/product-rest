import userEvent from '@testing-library/user-event'
import { fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { pageTreeAz, pageTreeEn } from '@/shared/testing/fixtures/pages'
import { renderApp, screen, within } from '@/shared/testing/render'

import { MegaMenu } from './mega-menu'
import { LEAVE_DELAY, VISIBLE_SECTIONS, VISIBLE_SECTIONS_NARROW } from './constants'
import { buildNavSections } from './nav'

function renderMenu() {
  const { visible, all } = buildNavSections(pageTreeAz, 'az')
  renderApp(<MegaMenu locale="az" visible={visible} all={all} />, { locale: 'az' })

  const trigger = screen.getByRole('button', { name: 'Bütün bölmələr' })
  const item = trigger.closest('[data-slot="nav-overflow"]') as HTMLLIElement
  const panel = item.querySelector('[data-slot="nav-overflow-panel"]') as HTMLElement
  return { trigger, item, panel }
}

describe('NavOverflow — tablet/masaüstü hamburger paneli (Figma 1088:26873)', () => {
  it('panel bütün bölmələri başlıq + alt bölmə kimi verir; çubuqdakılar masaüstündə gizlidir', () => {
    const { trigger, panel } = renderMenu()

    expect(trigger).toHaveAttribute('aria-controls', panel.id)
    const sections = within(panel).getAllByRole('listitem').filter((li) => li.parentElement?.parentElement === panel)
    expect(sections).toHaveLength(pageTreeAz.length)

    // İlk 8 bölmə lg-dən çubuqdadır — panel onları yalnız tabletdə (çubuq gizli ikən) göstərir.
    expect(sections.slice(0, VISIBLE_SECTIONS_NARROW).every((li) => li.classList.contains('lg:hidden'))).toBe(true)
    // 9-cu çubuğa yalnız desk-dən sığır (spec 056): 1024–1359-da paneldədir.
    for (const li of sections.slice(VISIBLE_SECTIONS_NARROW, VISIBLE_SECTIONS)) {
      expect(li).not.toHaveClass('lg:hidden')
      expect(li).toHaveClass('desk:hidden')
    }
    expect(sections[VISIBLE_SECTIONS]).not.toHaveClass('lg:hidden')
    expect(sections[VISIBLE_SECTIONS]).not.toHaveClass('desk:hidden')
    expect(within(panel).getByRole('link', { name: 'E-xidmətlər' })).toHaveAttribute('target', '_blank')

    const media = within(panel).getByRole('link', { name: 'Media' }).closest('li') as HTMLElement
    expect(within(media).getByRole('link', { name: 'Fotoqalereya' })).toHaveAttribute('href', '/az/media/galleries')
  })

  it('üst zolaqdakı bölmələr yalnız geniş masaüstündə (desk) paneldən çıxır — spec 042, Figma 1088:26879', () => {
    const { panel } = renderMenu()
    const sectionItem = (name: string) => within(panel).getByRole('link', { name }).closest('li') as HTMLElement

    // Üst zolaq desk-dən görünür, ona görə eyni keçid paneldə yalnız orada gizlənir.
    expect(sectionItem('Media')).toHaveClass('desk:hidden')
    expect(sectionItem('İnsan resursları')).toHaveClass('desk:hidden')

    // Alt bəndlər valideynlə birlikdə gedir, özləri ayrıca gizlənmir.
    expect(sectionItem('Fotoqalereya')).not.toHaveClass('desk:hidden')
    expect(sectionItem('Maliyyə sabitliyi')).not.toHaveClass('desk:hidden')
    expect(sectionItem('E-xidmətlər')).not.toHaveClass('desk:hidden')
  })

  it('"Menyularda yox" qeyd olunmuş kök yalnız geniş masaüstündə paneldən çıxır — spec 056, Figma 1088:26873', () => {
    const { panel } = renderMenu()
    const references = within(panel).getByRole('link', { name: 'İstinadlar' }).closest('li') as HTMLElement

    expect(references).toHaveClass('desk:hidden')
    // 1024–1359 paneli və planşet paneli onu göstərir.
    expect(references).not.toHaveClass('lg:hidden')
  })

  it('desk-də paneldə görünən bölmə qalmayanda hamburger də desk-də gizlənir', () => {
    // 9 zolaq bölməsi + yalnız gizli kök: desk-də panel boş olardı.
    const tree = [...pageTreeAz.slice(0, VISIBLE_SECTIONS), pageTreeAz[pageTreeAz.length - 1]!]
    const { visible, all } = buildNavSections(tree, 'az')
    renderApp(<MegaMenu locale="az" visible={visible} all={all} />, { locale: 'az' })

    const item = screen.getByRole('button', { name: 'Bütün bölmələr' }).closest('li')
    expect(item).toHaveClass('desk:hidden')
    expect(item).not.toHaveClass('lg:hidden')
  })

  it('desk-də ilk 3 görünən bölmə öz sütununu açır, qalanı sonuncu sütunda yığılır — Figma 1088:26873 (spec 056 R4)', () => {
    const root = (id: number, title: string, showInSideNav = true) => ({ id, title, slug: `s-${id}`, navUrl: null, showInSideNav, children: [] })
    const tree = [
      ...pageTreeAz.slice(0, VISIBLE_SECTIONS),
      root(201, 'İstehlakçı'),
      root(202, 'Rəqəmsal'),
      root(203, 'Strategiya', false),
      root(204, 'Beynəlxalq'),
      root(205, 'Savadlılıq'),
      root(206, 'FinCERT'),
    ]
    const { visible, all } = buildNavSections(tree, 'az')
    renderApp(<MegaMenu locale="az" visible={visible} all={all} />, { locale: 'az' })
    const panel = document.querySelector('[data-slot="nav-overflow-panel"]') as HTMLElement
    const opensColumn = (name: string) => within(panel).getByRole('link', { name }).closest('li')!.classList.contains('desk:break-before-column')

    expect(['İstehlakçı', 'Rəqəmsal', 'Beynəlxalq', 'Savadlılıq', 'FinCERT'].map(opensColumn)).toEqual([false, true, true, true, false])
    // Gizli kök və zolaq bölmələri sayılmır.
    expect(opensColumn('Strategiya')).toBe(false)
    expect(opensColumn('Haqqımızda')).toBe(false)
  })

  it('desk-də paneldə görünən bölmə varsa hamburger desk-də qalır', () => {
    const { item } = renderMenu()

    expect(item).not.toHaveClass('desk:hidden')
  })

  it('en saytında da Media desk-də paneldən çıxır', () => {
    const { visible, all } = buildNavSections(pageTreeEn, 'en')
    renderApp(<MegaMenu locale="en" visible={visible} all={all} />, { locale: 'en' })

    const panel = document.querySelector('[data-slot="nav-overflow-panel"]') as HTMLElement
    expect(within(panel).getByRole('link', { name: 'Media' }).closest('li')).toHaveClass('desk:hidden')
    expect(within(panel).getByRole('link', { name: 'Statistics' }).closest('li')).not.toHaveClass('desk:hidden')
  })

  it('siçan üstünə gələndə açılır, çıxanda bağlanır', async () => {
    const user = userEvent.setup()
    const { trigger, item } = renderMenu()

    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.hover(trigger)
    expect(item).toHaveAttribute('data-open')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // Vərdişlə edilən klik hover-da açılmış paneli bağlamamalıdır.
    await user.click(trigger)
    expect(item).toHaveAttribute('data-open')

    await user.unhover(item)
    // Bağlanma `LEAVE_DELAY` qədər gecikir (panelə çəp keçid üçün).
    expect(item).toHaveAttribute('data-open')
    await waitFor(() => expect(item).not.toHaveAttribute('data-open'))
  })

  it('düymədən panelə keçəndə panel açıq qalır', async () => {
    const user = userEvent.setup()
    const { trigger, item, panel } = renderMenu()

    // Bənd çubuğun bütün hündürlüyündədir — düymənin altındakı zolaq da bəndin içidir.
    expect(item).toHaveClass('self-stretch')

    await user.hover(trigger)
    // Çəp hərəkət: siçan bir anlıq bənddən çıxır, gecikmə bitməmiş panelə girir.
    fireEvent.pointerLeave(item, { pointerType: 'mouse' })
    fireEvent.pointerEnter(item, { pointerType: 'mouse' })
    await user.hover(within(panel).getByRole('link', { name: 'Media' }))

    await new Promise((resolve) => setTimeout(resolve, LEAVE_DELAY + 50))
    expect(item).toHaveAttribute('data-open')
  })

  it('klaviatura: Tab ilə düyməyə gələndə açılır, fokus paneldən çıxanda bağlanır', async () => {
    const user = userEvent.setup()
    const { trigger, item } = renderMenu()

    await user.tab()
    expect(trigger).toHaveFocus()
    expect(item).toHaveAttribute('data-open')

    await user.click(document.body)
    expect(item).not.toHaveAttribute('data-open')
  })

  it('toxunmada klik açıb-bağlayır (hover yoxdur)', () => {
    const { trigger, item } = renderMenu()

    fireEvent.pointerEnter(item, { pointerType: 'touch' })
    expect(item).not.toHaveAttribute('data-open')

    fireEvent.click(trigger)
    expect(item).toHaveAttribute('data-open')

    fireEvent.click(trigger)
    expect(item).not.toHaveAttribute('data-open')
  })

  it('paneldə keçid seçiləndə bağlanır', async () => {
    const user = userEvent.setup()
    const { trigger, item, panel } = renderMenu()

    await user.click(trigger)
    const link = within(panel).getByRole('link', { name: 'E-xidmətlər' })
    await user.click(link)

    expect(item).not.toHaveAttribute('data-open')
    expect(item).toHaveAttribute('data-closed')
    expect(link).not.toHaveFocus()
  })

  it('Escape bağlayır və fokusu düyməyə qaytarır', async () => {
    const user = userEvent.setup()
    const { trigger, item, panel } = renderMenu()

    fireEvent.click(trigger)
    within(panel).getByRole('link', { name: 'Media' }).focus()
    await user.keyboard('{Escape}')

    expect(item).not.toHaveAttribute('data-open')
    expect(trigger).toHaveFocus()
  })

  it('tabletdə hamburger çubuğun sağındadır', () => {
    renderMenu()

    expect(screen.getByRole('button', { name: 'Bütün bölmələr' }).closest('li')).toHaveClass('max-lg:ml-auto')
  })

  it('sığmayan bölmə yoxdursa hamburger masaüstündə gizlidir', () => {
    const { visible, all } = buildNavSections(pageTreeAz.slice(0, 3), 'az')
    renderApp(<MegaMenu locale="az" visible={visible} all={all} />, { locale: 'az' })

    expect(screen.getByRole('button', { name: 'Bütün bölmələr' }).closest('li')).toHaveClass('lg:hidden')
  })
})
