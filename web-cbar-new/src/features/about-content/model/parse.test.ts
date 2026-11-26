/**
 * Kontrakt qaydaları (`specs/024-about-us-redesign/contracts/cms-markup.md`) və fallback (FR-008, SC-004).
 */
import { describe, expect, it } from 'vitest'

import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { textOf } from '@/shared/lib/html-blocks'
import { aboutContractHtml, aboutPagesAz, historyCopyHtml } from '@/shared/testing/fixtures/about'

import { groupByYear, headingInner, linkFirstImage, parseAbout, parseFacts, promoteHeadingLines, safeImageSrc } from './parse'
import type { AboutBlock, HistoryYear, TimelineEvent } from './types'

/** Blokların görünən mətni CMS sırası ilə — mətn itkisini yoxlamaq üçün. */
function blocksText(blocks: AboutBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.kind) {
        case 'html':
        case 'accordion-group':
        case 'mission':
        case 'history-hero':
          return textOf(b.html)
        case 'date-cards':
          return b.cards.map((c) => `${c.date} ${textOf(c.html)}`).join(' ')
        case 'highlight':
          return `${b.title ?? ''} ${textOf(b.html)}`
        case 'values':
          return b.items.map((v) => `${v.title} ${textOf(v.html)}`).join(' ')
        case 'timeline':
          return b.years
            .flatMap((y) => y.items)
            .map((e) => (e.kind === 'loose' ? textOf(e.html) : `${e.title ?? ''} ${textOf(e.html)}`))
            .join(' ')
      }
    })
    .join(' ')
}

const squash = (s: string) => s.replace(/\s+/g, '')

describe('köməkçilər', () => {
  it('başlıq-sətir: h2–h4 və yalnız qalın paraqraf', () => {
    expect(headingInner({ tag: 'h3', attrs: '', inner: 'Dürüstlük', outer: '' })).toBe('Dürüstlük')
    expect(headingInner({ tag: 'p', attrs: '', inner: '<strong>Cavabdehlik</strong>', outer: '' })).toBe('Cavabdehlik')
    expect(headingInner({ tag: 'p', attrs: '', inner: '<strong>1983</strong>-cü ildə', outer: '' })).toBeNull()
    expect(headingInner({ tag: 'p', attrs: '', inner: 'adi mətn', outer: '' })).toBeNull()
  })

  it('şəkil ünvanı yalnız /media/ və ya https', () => {
    expect(safeImageSrc('/media/12')).toBe('/media/12')
    expect(safeImageSrc('https://www.cbar.az/a.png')).toBe('https://www.cbar.az/a.png')
    expect(safeImageSrc('javascript:alert(1)')).toBeNull()
    expect(safeImageSrc('data:image/png;base64,AAA')).toBeNull()
    expect(safeImageSrc('http://insecure/a.png')).toBeNull()
  })
})

describe('about-main', () => {
  const blocks = parseAbout(prepareCmsHtml(aboutContractHtml.main), 'about-main')

  it('kontrakt nümunəsi Figma bloklarına çevrilir, CMS sırası qorunur', () => {
    expect(blocks.map((b) => b.kind)).toEqual(['html', 'date-cards', 'highlight', 'html', 'accordion-group', 'html'])
  })

  it('tarix kartları: tarix düz mətn, mətn HTML', () => {
    const cards = blocks.find((b) => b.kind === 'date-cards')
    expect(cards?.kind === 'date-cards' && cards.cards.map((c) => c.date)).toEqual(['11.02.1992', '10.12.2004'])
    expect(cards?.kind === 'date-cards' && textOf(cards.cards[0]!.html)).toContain('Fərman')
  })

  it('vurğulanmış qutu başlığı ayrılır', () => {
    const box = blocks.find((b) => b.kind === 'highlight')
    expect(box).toEqual({ kind: 'highlight', title: 'Mərkəzi Bankın məqsədləri', html: '<p>Əsas məqsəd qiymətlərin sabitliyidir.</p>' })
  })

  it('accordion qrupunda yalnız birincisi açıqdır', () => {
    const group = blocks.find((b) => b.kind === 'accordion-group')
    const html = group?.kind === 'accordion-group' ? group.html : ''
    expect(html.match(/<details open/g)).toHaveLength(1)
    expect(html.indexOf('<details open')).toBe(0)
  })

  it('3 hücrəli sətir varsa bütün cədvəl adi məzmun qalır', () => {
    const broken = aboutContractHtml.main.replace('<td colspan="1" rowspan="1"><p>10.12.2004</p></td>', '<td><p>10.12.2004</p></td><td>artıq</td>')
    const result = parseAbout(broken, 'about-main')
    expect(result.some((b) => b.kind === 'date-cards')).toBe(false)
    expect(result[0]?.kind === 'html' && result[0].html).toContain('<table')
  })

  it('bugünkü real "Haqqımızda" HTML-i mətn itirmədən göstərilir (SC-004)', () => {
    const html = prepareCmsHtml(aboutPagesAz.haqqimizda!.content)
    expect(squash(blocksText(parseAbout(html, 'about-main')))).toBe(squash(textOf(html)))
  })
})

describe('mission', () => {
  const blocks = parseAbout(prepareCmsHtml(aboutContractHtml.mission), 'mission')

  it('banner və dəyər sətirləri; "yalnız qalın" paraqraf da başlıqdır', () => {
    expect(blocks.map((b) => b.kind)).toEqual(['mission', 'values'])
    const values = blocks[1]
    expect(values?.kind === 'values' && values.items.map((v) => v.title)).toEqual(['Dürüstlük', 'Cavabdehlik'])
  })

  it('ilk şəkil-paraqraf ikon olur və mətndən çıxır, ikonsuz dəyər də qalır', () => {
    const values = blocks[1]
    if (values?.kind !== 'values') throw new Error('values yoxdur')
    expect(values.items[0]?.icon).toEqual({ src: '/media/123', alt: '' })
    expect(values.items[0]?.html).not.toContain('<img')
    expect(values.items[1]?.icon).toBeNull()
  })

  it('banner yoxdursa yalnız dəyərlər', () => {
    const result = parseAbout('<h3>Dürüstlük</h3><p>a</p>', 'mission')
    expect(result.map((b) => b.kind)).toEqual(['values'])
  })

  it('təhlükəli şəkil ikon olmur', () => {
    const result = parseAbout('<h3>X</h3><p><img src="javascript:alert(1)"></p><p>a</p>', 'mission')
    expect(result[0]?.kind === 'values' && result[0].items[0]?.icon).toBeNull()
  })

  it('bugünkü real "Missiya" HTML-i mətn itirmədən göstərilir (SC-004)', () => {
    const html = prepareCmsHtml(aboutPagesAz['missiya-ve-deyerler']!.content)
    expect(squash(blocksText(parseAbout(html, 'mission')))).toBe(squash(textOf(html)))
  })
})

describe('history (kontrakt §3)', () => {
  const blocks = parseAbout(prepareCmsHtml(aboutContractHtml.history), 'history')
  const timeline = blocks.find((b) => b.kind === 'timeline')
  if (timeline?.kind !== 'timeline') throw new Error('timeline yoxdur')
  const [y1919, y1992] = timeline.years
  const [first, second] = y1919?.items ?? []
  const [third, loose] = y1992?.items ?? []

  it('hero (em ilə), timeline, cədvəldən sonrakı mətn — sıra ilə', () => {
    expect(blocks.map((b) => b.kind)).toEqual(['history-hero', 'timeline', 'html'])
    expect(blocks[0]).toEqual({ kind: 'history-hero', html: 'Bir əsrdən artıq <em>mərkəzi bankçılıq</em> tarixi' })
  })

  it('il, gün-ay, başlıq (h3 və ya yalnız qalın paraqraf)', () => {
    expect(first).toMatchObject({ kind: 'event', year: '1919', dayMonth: '7 mart', title: 'Dövlət Bankının təsis edilməsi haqqında qərar qəbul edilib', highlighted: false, boxed: false, photoLayout: null })
    expect(second).toMatchObject({ kind: 'event', year: '1919', dayMonth: '30 sentyabr', title: 'Azərbaycan Dövlət Bankı fəaliyyətə başlayıb' })
  })

  it('hadisələr il üzrə qruplaşır, lövbər ilə — spec 026 R3', () => {
    expect(timeline.years.map((y) => [y.year, y.anchorId, y.items.length])).toEqual([
      ['1919', 'year-1919', 2],
      ['1992', 'year-1992', 2],
    ])
  })

  it('qalın il vurğudur; şəkil (note-dan başqa) və ya vurğu qutu verir; şəkillər mətndən çıxır', () => {
    expect(second).toMatchObject({ highlighted: false, boxed: true, photoLayout: 'single', images: [{ src: '/media/120', alt: 'Bina' }] })
    expect(third).toMatchObject({ year: '1992', dayMonth: '11 fevral', highlighted: true, boxed: true, photoLayout: 'note' })
    expect(third?.kind === 'event' && third.images.map((i) => i.src)).toEqual(['/media/121', '/media/122'])
    expect(third?.kind === 'event' && third.html).not.toContain('<img')
  })

  it('ili olmayan sətir mətni ilə əvvəlki ilin kartına düşür', () => {
    expect(loose?.kind).toBe('loose')
    expect(loose?.kind === 'loose' && textOf(loose.html)).toBe('Tarixsiz qeyd İli olmayan sətir.')
  })

  it('cədvəl yoxdursa (bugünkü real "Tarix") plain, mətn itmir', () => {
    const html = prepareCmsHtml(aboutPagesAz.tarixi!.content)
    expect(parseAbout(html, 'history')).toEqual([{ kind: 'html', html }])
  })

  it('3 hücrəli sətir timeline-ı ləğv edir', () => {
    const broken = '<table><tbody><tr><td>1919</td><td>a</td><td>b</td></tr></tbody></table>'
    expect(parseAbout(broken, 'history')).toEqual([{ kind: 'html', html: broken }])
  })
})

/** Bir sətirlik cədvəl → həmin sətrin hadisəsi (spec 026 foto düzülüşü testləri üçün). */
function eventOf(body: string, date = '6 oktyabr 1998'): Extract<TimelineEvent, { kind: 'event' }> {
  const html = `<table><tbody><tr><td><p>${date}</p></td><td>${body}</td></tr></tbody></table>`
  const block = parseAbout(html, 'history').find((b) => b.kind === 'timeline')
  const event = block?.kind === 'timeline' ? block.years[0]?.items[0] : undefined
  if (event?.kind !== 'event') throw new Error('hadisə yoxdur')
  return event
}

const img = (n: number, size = '') => `<p><img src="/media/${n}" alt="foto ${n}"${size}></p>`

describe('foto düzülüşü (spec 026 FR-004, FR-004a)', () => {
  it('avtomatik: 1 → single, 2 → note, 3 → hero2, 4 → hero2', () => {
    expect(eventOf(`<h3>a</h3>${img(1)}`).photoLayout).toBe('single')
    expect(eventOf(`<h3>a</h3>${img(1)}${img(2)}`).photoLayout).toBe('note')
    expect(eventOf(`<h3>a</h3>${img(1)}${img(2)}${img(3)}`).photoLayout).toBe('hero2')
    expect(eventOf(`<h3>a</h3>${img(1)}${img(2)}${img(3)}${img(4)}`).photoLayout).toBe('hero2')
  })

  it('3 şəkil, birincinin atributları portretdirsə → tall; landşaftdırsa → hero2', () => {
    const portrait = eventOf(`${img(1, ' width="600" height="900"')}${img(2)}${img(3)}`)
    expect(portrait.photoLayout).toBe('tall')
    expect(portrait.images[0]).toEqual({ src: '/media/1', alt: 'foto 1', width: 600, height: 900 })
    expect(eventOf(`${img(1, ' width="900" height="600"')}${img(2)}${img(3)}`).photoLayout).toBe('hero2')
  })

  it('işarə avtomatik seçimi dəyişir və saytda göstərilmir', () => {
    const event = eventOf(`<h3>Bina</h3><p>Mətn.</p>${img(1)}${img(2)}${img(3)}<p>[foto: tall]</p>`)
    expect(event.photoLayout).toBe('tall')
    expect(event.html).toBe('<p>Mətn.</p>')
  })

  it('işarədə hərf ölçüsü və boşluqlar fərq etmir; birincisi işləyir, hamısı gizlənir', () => {
    const event = eventOf(`${img(1)}${img(2)}<p>[ Foto:HERO2 ]</p><p>[foto: single]</p>`)
    expect(event.photoLayout).toBe('hero2')
    expect(event.html).toBe('')
  })

  it('tanınmayan işarə mətndə qalır, düzülüş avtomatikdir', () => {
    const event = eventOf(`${img(1)}<p>[foto: böyük]</p>`)
    expect(event.photoLayout).toBe('single')
    expect(textOf(event.html)).toBe('[foto: böyük]')
  })

  it('şəkilsiz hadisədə işarə gizlənir, düzülüş yoxdur', () => {
    const event = eventOf('<h3>a</h3><p>Mətn.</p><p>[foto: tall]</p>')
    expect(event).toMatchObject({ photoLayout: null, boxed: false, html: '<p>Mətn.</p>' })
  })

  it('note qutuda deyil, vurğulu note qutudadır', () => {
    expect(eventOf(`${img(1)}${img(2)}`).boxed).toBe(false)
    expect(eventOf(`${img(1)}${img(2)}`, '15 avqust <strong>1992</strong>').boxed).toBe(true)
  })
})

describe('groupByYear (spec 026 research R3)', () => {
  const event = (year: string, title: string): TimelineEvent => ({
    kind: 'event',
    year,
    dayMonth: '',
    highlighted: false,
    title,
    html: '',
    images: [],
    photoLayout: null,
    boxed: false,
  })
  const loose = (html: string): TimelineEvent => ({ kind: 'loose', html })
  const titles = (years: HistoryYear[]) =>
    years.map((y) => [y.year, y.items.map((e) => (e.kind === 'event' ? e.title : e.html))])

  it('ardıcıl olmayan eyni il ilk rast gəlindiyi qrupa yığılır, sıra cədvəldəkidir', () => {
    expect(titles(groupByYear([event('1992', 'a'), event('1993', 'b'), event('1992', 'c')]))).toEqual([
      ['1992', ['a', 'c']],
      ['1993', ['b']],
    ])
  })

  it('ilsiz sətir əvvəlki hadisənin ilinə, cədvəlin əvvəlindəki isə birinci ilə düşür', () => {
    expect(titles(groupByYear([loose('x'), event('1919', 'a'), event('1920', 'b'), loose('y')]))).toEqual([
      ['1919', ['x', 'a']],
      ['1920', ['b', 'y']],
    ])
  })
})

describe('real "Tarix (Kopya)" məzmunu (test mühiti, 2026-10-22)', () => {
  const html = prepareCmsHtml(historyCopyHtml)
  const blocks = parseAbout(html, 'history')
  const timeline = blocks.find((b) => b.kind === 'timeline')

  it('heç bir hadisə başlığı itmir', () => {
    const titlesInSource = [...historyCopyHtml.matchAll(/<h3>(.*?)<\/h3>/g)].map((m) => textOf(m[1]!))
    const text = blocksText(blocks)
    for (const title of titlesInSource) expect(text).toContain(title)
  })

  it('illər cədvəl sırası ilə — sınaq sətri (13 fevral 2026) 2026-nı üçüncü il edir (R3)', () => {
    if (timeline?.kind !== 'timeline') throw new Error('timeline yoxdur')
    expect(timeline.years.map((y) => y.year).slice(0, 4)).toEqual(['1919', '1920', '2026', '1936'])
    expect(timeline.years.find((y) => y.year === '1992')?.items).toHaveLength(5)
    expect(timeline.years.find((y) => y.year === '1998')?.items[0]).toMatchObject({ photoLayout: 'hero2', boxed: true })
  })
})

describe('promoteHeadingLines (bio, kontrakt §5)', () => {
  it('yalnız qalın paraqraf h2 olur, qarışıq qalın mətn toxunulmur', () => {
    expect(promoteHeadingLines('<p><strong>Təhsil</strong></p><p><strong>2004</strong>-cü ildə</p><h3>X</h3>')).toBe(
      '<h2>Təhsil</h2><p><strong>2004</strong>-cü ildə</p><h3>X</h3>',
    )
  })

  it('pozuq HTML və real bio dəyişmir', () => {
    expect(promoteHeadingLines('<p>bağlanmayıb')).toBe('<p>bağlanmayıb')
  })
})

describe('linkFirstImage (struktur sxemi)', () => {
  it('ilk təhlükəsiz şəkli yeni tabda açılan linkə sarır', () => {
    expect(linkFirstImage('<p><img src="/media/5" alt="Sxem"></p><p><img src="/media/6"></p>')).toBe(
      '<p><a href="/media/5" target="_blank" rel="noopener noreferrer"><img src="/media/5" alt="Sxem"></a></p><p><img src="/media/6"></p>',
    )
  })

  it('artıq linkdədirsə, şəkil yoxdursa və ya ünvan təhlükəlidirsə dəyişmir', () => {
    const linked = '<p><a href="/x"><img src="/media/5"></a></p>'
    expect(linkFirstImage(linked)).toBe(linked)
    expect(linkFirstImage('<p>mətn</p>')).toBe('<p>mətn</p>')
    expect(linkFirstImage('<img src="javascript:alert(1)">')).toBe('<img src="javascript:alert(1)">')
  })
})

describe('fallback', () => {
  it('plain layout və pozuq HTML bir html bloku verir, boş məzmun heç nə', () => {
    expect(parseAbout('<p>a</p>', 'plain')).toEqual([{ kind: 'html', html: '<p>a</p>' }])
    expect(parseAbout('<p>bağlanmayıb', 'about-main')).toEqual([{ kind: 'html', html: '<p>bağlanmayıb' }])
    expect(parseAbout('', 'mission')).toEqual([])
  })
})

describe('parseFacts', () => {
  it('"Etiket: dəyər" paraqraflarını cütə çevirir, qalanını HTML kimi saxlayır', () => {
    const html = '<p> Direktor: <span> Rzayev Samir Eyvaz oğlu </span></p><p>Email: <a href="mailto:a@cbar.az">a@cbar.az</a></p><p>Adi mətn.</p>'
    expect(parseFacts(html)).toEqual({
      facts: [{ label: 'Direktor', value: 'Rzayev Samir Eyvaz oğlu' }],
      html: '<p>Email: <a href="mailto:a@cbar.az">a@cbar.az</a></p><p>Adi mətn.</p>',
    })
  })

  it('düz mətn və pozuq HTML dəyişmir', () => {
    expect(parseFacts('Pul siyasətinin hazırlanması')).toEqual({ facts: [], html: 'Pul siyasətinin hazırlanması' })
    expect(parseFacts('<p>Direktor: <b>Ad</p>')).toEqual({ facts: [], html: '<p>Direktor: <b>Ad</p>' })
  })
})
